import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, mapStripeStatusToInternal } from '@/lib/stripe'
import { db } from '@/lib/database'
import Stripe from 'stripe'

// POST /api/payments/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature)
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    console.log('Received Stripe webhook:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ success: true, received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id
    const status = 'paid'

    // Update payment status in database
    const updateResult = await db.query(
      `UPDATE payments 
       SET status = $1, 
           stripe_payment_method_id = $2,
           updated_at = $3 
       WHERE payment_intent_id = $4 
       RETURNING *`,
      [status, paymentIntent.payment_method, new Date().toISOString(), paymentIntentId]
    )

    if (updateResult.rows.length === 0) {
      console.error('Payment not found in database:', paymentIntentId)
      return
    }

    const payment = updateResult.rows[0]
    
    // Update related order or venue booking
    if (payment.order_id) {
      await updateOrderPaymentStatus(payment.order_id, status, payment.payment_type)
    }
    
    if (payment.venue_booking_id) {
      await updateVenueBookingPaymentStatus(payment.venue_booking_id, status, payment.payment_type)
    }

    // TODO: Send confirmation email to customer
    console.log('Payment succeeded for:', paymentIntentId)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id
    const status = 'failed'
    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed'

    // Update payment status in database
    const updateResult = await db.query(
      `UPDATE payments 
       SET status = $1, 
           error_message = $2,
           updated_at = $3 
       WHERE payment_intent_id = $4 
       RETURNING *`,
      [status, errorMessage, new Date().toISOString(), paymentIntentId]
    )

    if (updateResult.rows.length === 0) {
      console.error('Payment not found in database:', paymentIntentId)
      return
    }

    const payment = updateResult.rows[0]
    
    // Update related order or venue booking
    if (payment.order_id) {
      await updateOrderPaymentStatus(payment.order_id, status, payment.payment_type)
    }
    
    if (payment.venue_booking_id) {
      await updateVenueBookingPaymentStatus(payment.venue_booking_id, status, payment.payment_type)
    }

    // TODO: Send failure notification email
    console.log('Payment failed for:', paymentIntentId, 'Error:', errorMessage)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id
    const status = 'cancelled'

    // Update payment status in database
    await db.query(
      `UPDATE payments 
       SET status = $1, 
           updated_at = $2 
       WHERE payment_intent_id = $3`,
      [status, new Date().toISOString(), paymentIntentId]
    )

    console.log('Payment canceled for:', paymentIntentId)

  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

// Handle payment requiring action
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id
    const status = 'requires_action'

    // Update payment status in database
    await db.query(
      `UPDATE payments 
       SET status = $1, 
           updated_at = $2 
       WHERE payment_intent_id = $3`,
      [status, new Date().toISOString(), paymentIntentId]
    )

    // TODO: Send email notification to customer about action required
    console.log('Payment requires action for:', paymentIntentId)

  } catch (error) {
    console.error('Error handling payment action required:', error)
  }
}

// Handle charge dispute
async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    const chargeId = dispute.charge as string
    const paymentIntentId = dispute.payment_intent as string

    // Create dispute record
    const disputeData = {
      stripe_dispute_id: dispute.id,
      payment_intent_id: paymentIntentId,
      charge_id: chargeId,
      amount: dispute.amount / 100, // Convert from cents
      reason: dispute.reason,
      status: dispute.status,
      evidence_due_by: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await db.insert('payment_disputes', disputeData)

    // TODO: Send dispute notification to admin
    console.log('Charge dispute created:', dispute.id)

  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const orderId = invoice.metadata?.order_id
    
    if (orderId) {
      await updateOrderPaymentStatus(orderId, 'paid', 'balance')
    }

    console.log('Invoice payment succeeded:', invoice.id)

  } catch (error) {
    console.error('Error handling invoice payment success:', error)
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const orderId = invoice.metadata?.order_id
    
    if (orderId) {
      await updateOrderPaymentStatus(orderId, 'failed', 'balance')
    }

    console.log('Invoice payment failed:', invoice.id)

  } catch (error) {
    console.error('Error handling invoice payment failure:', error)
  }
}

// Helper function to update order payment status
async function updateOrderPaymentStatus(orderId: string, paymentStatus: string, paymentType: string) {
  try {
    if (paymentType === 'deposit') {
      await db.query(
        `UPDATE orders 
         SET deposit_status = $1, updated_at = $2 
         WHERE id = $3`,
        [paymentStatus, new Date().toISOString(), orderId]
      )
    } else if (paymentType === 'balance' || paymentType === 'full_payment') {
      await db.query(
        `UPDATE orders 
         SET payment_status = $1, updated_at = $2 
         WHERE id = $3`,
        [paymentStatus, new Date().toISOString(), orderId]
      )
    }

    // If both deposit and balance are paid, mark order as fully paid
    if (paymentStatus === 'paid') {
      const orderResult = await db.query(
        'SELECT deposit_status, payment_status FROM orders WHERE id = $1',
        [orderId]
      )
      
      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0]
        if (order.deposit_status === 'paid' && order.payment_status === 'paid') {
          await db.query(
            'UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3',
            ['confirmed', new Date().toISOString(), orderId]
          )
        }
      }
    }

  } catch (error) {
    console.error('Error updating order payment status:', error)
  }
}

// Helper function to update venue booking payment status
async function updateVenueBookingPaymentStatus(venueBookingId: string, paymentStatus: string, paymentType: string) {
  try {
    if (paymentType === 'deposit') {
      await db.query(
        `UPDATE venue_bookings 
         SET deposit_status = $1, updated_at = $2 
         WHERE id = $3`,
        [paymentStatus, new Date().toISOString(), venueBookingId]
      )
    } else if (paymentType === 'balance' || paymentType === 'full_payment') {
      await db.query(
        `UPDATE venue_bookings 
         SET payment_status = $1, updated_at = $2 
         WHERE id = $3`,
        [paymentStatus, new Date().toISOString(), venueBookingId]
      )
    }

    // If both deposit and balance are paid, mark booking as confirmed
    if (paymentStatus === 'paid') {
      const bookingResult = await db.query(
        'SELECT deposit_status, payment_status FROM venue_bookings WHERE id = $1',
        [venueBookingId]
      )
      
      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0]
        if (booking.deposit_status === 'paid' && booking.payment_status === 'paid') {
          await db.query(
            'UPDATE venue_bookings SET status = $1, updated_at = $2 WHERE id = $3',
            ['confirmed', new Date().toISOString(), venueBookingId]
          )
        }
      }
    }

  } catch (error) {
    console.error('Error updating venue booking payment status:', error)
  }
}