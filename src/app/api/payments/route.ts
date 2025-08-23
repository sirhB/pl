import { NextRequest, NextResponse } from 'next/server'
import { 
  createPaymentIntent, 
  capturePaymentIntent, 
  cancelPaymentIntent,
  getPaymentIntent,
  formatAmountForStripe,
  mapStripeStatusToInternal
} from '@/lib/stripe'
import { db } from '@/lib/database'

// POST /api/payments - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['amount', 'customerEmail', 'customerName', 'description', 'paymentType']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const {
      amount,
      orderId,
      venueBookingId,
      customerId,
      customerEmail,
      customerName,
      description,
      paymentType, // 'deposit', 'balance', 'full_payment'
      metadata = {}
    } = body

    // Convert amount to cents for Stripe
    const amountInCents = formatAmountForStripe(amount)

    // Create payment intent
    const result = await createPaymentIntent({
      amount: amountInCents,
      orderId,
      venueBookingId,
      customerId,
      customerEmail,
      customerName,
      description,
      paymentType,
      metadata
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Store payment intent in database
    const paymentData = {
      payment_intent_id: result.paymentIntent.id,
      order_id: orderId || null,
      venue_booking_id: venueBookingId || null,
      user_id: customerId || null,
      stripe_customer_id: result.customerId,
      amount: amount,
      currency: 'usd',
      payment_type: paymentType,
      status: 'pending',
      description,
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const payment = await db.insert('payments', paymentData)

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: result.paymentIntent.id,
        clientSecret: result.clientSecret,
        customerId: result.customerId,
        payment
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

// GET /api/payments - Get payment details
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentIntentId = searchParams.get('payment_intent_id')
    const orderId = searchParams.get('order_id')
    const userId = searchParams.get('user_id')

    if (paymentIntentId) {
      // Get specific payment intent
      const stripeResult = await getPaymentIntent(paymentIntentId)
      
      if (!stripeResult.success) {
        return NextResponse.json(
          { success: false, error: stripeResult.error },
          { status: 404 }
        )
      }

      // Get payment from database
      const dbResult = await db.query(
        'SELECT * FROM payments WHERE payment_intent_id = $1',
        [paymentIntentId]
      )

      const payment = dbResult.rows[0]
      if (payment) {
        // Update status if different
        const currentStatus = mapStripeStatusToInternal(stripeResult.paymentIntent.status)
        if (payment.status !== currentStatus) {
          await db.query(
            'UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3',
            [currentStatus, new Date().toISOString(), payment.id]
          )
          payment.status = currentStatus
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          stripePayment: stripeResult.paymentIntent,
          dbPayment: payment
        }
      })
    }

    // Get payments by order or user
    let query = 'SELECT * FROM payments WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (orderId) {
      query += ` AND order_id = $${paramIndex}`
      params.push(orderId)
      paramIndex++
    }

    if (userId) {
      query += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    query += ' ORDER BY created_at DESC'

    const result = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('Payment retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payment' },
      { status: 500 }
    )
  }
}

// PUT /api/payments - Update payment status or capture
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, action, amount } = body

    if (!paymentIntentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: paymentIntentId, action' },
        { status: 400 }
      )
    }

    let result
    let newStatus = 'pending'

    switch (action) {
      case 'capture':
        // Capture a payment (for deposits that were authorized)
        result = await capturePaymentIntent(paymentIntentId, amount ? formatAmountForStripe(amount) : undefined)
        newStatus = result.success ? 'paid' : 'failed'
        break

      case 'cancel':
        // Cancel a payment intent
        result = await cancelPaymentIntent(paymentIntentId)
        newStatus = result.success ? 'cancelled' : 'failed'
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: capture, cancel' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Update payment status in database
    await db.query(
      'UPDATE payments SET status = $1, updated_at = $2 WHERE payment_intent_id = $3',
      [newStatus, new Date().toISOString(), paymentIntentId]
    )

    // If this was an order payment, update order status
    const paymentQuery = await db.query(
      'SELECT order_id, venue_booking_id FROM payments WHERE payment_intent_id = $1',
      [paymentIntentId]
    )

    if (paymentQuery.rows.length > 0) {
      const payment = paymentQuery.rows[0]
      
      if (payment.order_id && newStatus === 'paid') {
        await db.query(
          'UPDATE orders SET payment_status = $1, updated_at = $2 WHERE id = $3',
          ['paid', new Date().toISOString(), payment.order_id]
        )
      }
      
      if (payment.venue_booking_id && newStatus === 'paid') {
        await db.query(
          'UPDATE venue_bookings SET payment_status = $1, updated_at = $2 WHERE id = $3',
          ['paid', new Date().toISOString(), payment.venue_booking_id]
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntent: result.paymentIntent,
        status: newStatus
      }
    })

  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}