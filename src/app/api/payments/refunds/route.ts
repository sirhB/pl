import { NextRequest, NextResponse } from 'next/server'
import { createRefund } from '@/lib/stripe'
import { db } from '@/lib/database'

// POST /api/payments/refunds - Create a refund
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['paymentIntentId', 'reason']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const {
      paymentIntentId,
      amount, // optional - if not provided, refunds full amount
      reason,
      adminNote,
      refundedBy
    } = body

    // Get payment details from database
    const paymentResult = await db.query(
      'SELECT * FROM payments WHERE payment_intent_id = $1',
      [paymentIntentId]
    )

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // Check if payment is eligible for refund
    if (payment.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment is not in a refundable state' },
        { status: 400 }
      )
    }

    // Create refund through Stripe
    const refundResult = await createRefund({
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
      reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
      metadata: {
        admin_note: adminNote || '',
        refunded_by: refundedBy || '',
        order_id: payment.order_id || '',
        venue_booking_id: payment.venue_booking_id || ''
      }
    })

    if (!refundResult.success) {
      return NextResponse.json(
        { success: false, error: refundResult.error },
        { status: 400 }
      )
    }

    const refund = refundResult.refund

    // Store refund details in database
    const refundData = {
      stripe_refund_id: refund.id,
      payment_intent_id: paymentIntentId,
      payment_id: payment.id,
      amount: refund.amount / 100, // Convert from cents
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      admin_note: adminNote || null,
      refunded_by: refundedBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const dbRefund = await db.insert('refunds', refundData)

    // Update payment status if fully refunded
    if (!amount || amount >= payment.amount) {
      await db.query(
        'UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3',
        ['refunded', new Date().toISOString(), payment.id]
      )

      // Update related order or venue booking status
      if (payment.order_id) {
        await db.query(
          'UPDATE orders SET payment_status = $1, updated_at = $2 WHERE id = $3',
          ['refunded', new Date().toISOString(), payment.order_id]
        )
      }

      if (payment.venue_booking_id) {
        await db.query(
          'UPDATE venue_bookings SET payment_status = $1, updated_at = $2 WHERE id = $3',
          ['refunded', new Date().toISOString(), payment.venue_booking_id]
        )
      }
    } else {
      // Partial refund - update payment status to partially_refunded
      await db.query(
        'UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3',
        ['partially_refunded', new Date().toISOString(), payment.id]
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        stripeRefund: refund,
        dbRefund
      }
    })

  } catch (error) {
    console.error('Refund creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create refund' },
      { status: 500 }
    )
  }
}

// GET /api/payments/refunds - Get refunds
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentIntentId = searchParams.get('payment_intent_id')
    const orderId = searchParams.get('order_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = `
      SELECT 
        r.*,
        p.order_id,
        p.venue_booking_id,
        p.user_id,
        p.amount as original_amount,
        p.description as payment_description
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (paymentIntentId) {
      query += ` AND r.payment_intent_id = $${paramIndex}`
      params.push(paymentIntentId)
      paramIndex++
    }

    if (orderId) {
      query += ` AND p.order_id = $${paramIndex}`
      params.push(orderId)
      paramIndex++
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, (page - 1) * limit)

    const result = await db.query(query, params)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE 1=1
    `
    if (paymentIntentId) {
      countQuery += ` AND r.payment_intent_id = $1`
    }
    if (orderId) {
      countQuery += ` AND p.order_id = $${paymentIntentId ? 2 : 1}`
    }

    const countResult = await db.query(countQuery, params.slice(0, -2))
    const total = parseInt(countResult.rows[0].total)

    const pagination = {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination
    })

  } catch (error) {
    console.error('Refunds retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve refunds' },
      { status: 500 }
    )
  }
}