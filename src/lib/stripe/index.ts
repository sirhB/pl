import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Payment intent creation for deposits and full payments
export interface CreatePaymentIntentOptions {
  amount: number // in cents
  currency?: string
  orderId?: string
  venueBookingId?: string
  customerId?: string
  customerEmail: string
  customerName: string
  description: string
  paymentType: 'deposit' | 'balance' | 'full_payment'
  metadata?: Record<string, string>
}

export async function createPaymentIntent(options: CreatePaymentIntentOptions) {
  try {
    const {
      amount,
      currency = 'usd',
      orderId,
      venueBookingId,
      customerId,
      customerEmail,
      customerName,
      description,
      paymentType,
      metadata = {}
    } = options

    // Create or retrieve Stripe customer
    let stripeCustomer: Stripe.Customer | null = null
    
    if (customerId) {
      // Try to find existing customer
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0]
      }
    }
    
    if (!stripeCustomer) {
      // Create new customer
      stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          user_id: customerId || '',
          created_by: 'prime_lux_events'
        }
      })
    }

    // Prepare metadata
    const paymentMetadata = {
      order_id: orderId || '',
      venue_booking_id: venueBookingId || '',
      user_id: customerId || '',
      payment_type: paymentType,
      company: 'Prime Lux Events',
      ...metadata
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomer.id,
      description,
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
      // Capture method - 'automatic' for immediate capture, 'manual' for auth only
      capture_method: paymentType === 'deposit' ? 'manual' : 'automatic',
      // Receipt email
      receipt_email: customerEmail,
      // Setup future usage for returning customers
      setup_future_usage: 'off_session',
    })

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret,
      customerId: stripeCustomer.id
    }

  } catch (error) {
    console.error('Stripe payment intent creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment intent creation failed'
    }
  }
}

// Capture a previously authorized payment (for deposits)
export async function capturePaymentIntent(paymentIntentId: string, amountToCapture?: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture
    })

    return {
      success: true,
      paymentIntent
    }
  } catch (error) {
    console.error('Stripe payment capture error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment capture failed'
    }
  }
}

// Cancel a payment intent
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)

    return {
      success: true,
      paymentIntent
    }
  } catch (error) {
    console.error('Stripe payment cancellation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment cancellation failed'
    }
  }
}

// Create refund
export interface CreateRefundOptions {
  paymentIntentId: string
  amount?: number // in cents, if not provided refunds full amount
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  metadata?: Record<string, string>
}

export async function createRefund(options: CreateRefundOptions) {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer', metadata = {} } = options

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
      metadata: {
        refunded_by: 'prime_lux_events',
        ...metadata
      }
    })

    return {
      success: true,
      refund
    }
  } catch (error) {
    console.error('Stripe refund creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund creation failed'
    }
  }
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event | null {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

// Payment method utilities
export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return {
      success: true,
      paymentMethods: paymentMethods.data
    }
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment methods'
    }
  }
}

// Create setup intent for saving payment methods
export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      usage: 'off_session'
    })

    return {
      success: true,
      setupIntent,
      clientSecret: setupIntent.client_secret
    }
  } catch (error) {
    console.error('Setup intent creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Setup intent creation failed'
    }
  }
}

// Calculate application fee (if using Stripe Connect)
export function calculateApplicationFee(amount: number): number {
  // 2.9% + 30¢ Stripe fee, plus 0.5% platform fee
  const stripeFee = Math.round(amount * 0.029 + 30)
  const platformFee = Math.round(amount * 0.005)
  return stripeFee + platformFee
}

// Format amount for Stripe (convert dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

// Format amount for display (convert cents to dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}

// Get payment intent details
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    return {
      success: true,
      paymentIntent
    }
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent'
    }
  }
}

// Payment status mapping
export function mapStripeStatusToInternal(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'succeeded':
      return 'paid'
    case 'processing':
      return 'pending'
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'pending'
    case 'canceled':
      return 'failed'
    default:
      return 'pending'
  }
}

// Create invoice for balance payments
export async function createInvoice(customerId: string, orderId: string, items: Array<{
  description: string
  amount: number
  quantity?: number
}>) {
  try {
    // Create invoice items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: formatAmountForStripe(item.amount),
        currency: 'usd',
        description: item.description,
        quantity: item.quantity || 1,
        metadata: {
          order_id: orderId
        }
      })
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: false, // Don't auto-finalize
      collection_method: 'send_invoice',
      days_until_due: 7, // 7 days to pay
      metadata: {
        order_id: orderId,
        type: 'balance_payment'
      }
    })

    return {
      success: true,
      invoice
    }
  } catch (error) {
    console.error('Invoice creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invoice creation failed'
    }
  }
}

// Test connection to Stripe
export async function testStripeConnection() {
  try {
    const account = await stripe.accounts.retrieve()
    return {
      success: true,
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        email: account.email
      }
    }
  } catch (error) {
    console.error('Stripe connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stripe connection failed'
    }
  }
}