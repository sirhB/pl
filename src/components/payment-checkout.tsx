"use client"

import React, { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  DollarSign
} from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentCheckoutProps {
  amount: number
  orderId?: string
  venueBookingId?: string
  customerId?: string
  customerEmail: string
  customerName: string
  description: string
  paymentType: 'deposit' | 'balance' | 'full_payment'
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  metadata?: Record<string, string>
}

const PaymentForm: React.FC<PaymentCheckoutProps> = ({
  amount,
  orderId,
  venueBookingId,
  customerId,
  customerEmail,
  customerName,
  description,
  paymentType,
  onSuccess,
  onError,
  metadata = {}
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          venueBookingId,
          customerId,
          customerEmail,
          customerName,
          description,
          paymentType,
          metadata
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setClientSecret(data.data.clientSecret)
      } else {
        setErrorMessage(data.error || 'Failed to create payment intent')
        setPaymentStatus('failed')
        onError(data.error || 'Failed to create payment intent')
      }
    } catch (error) {
      const errorMsg = 'Network error occurred'
      setErrorMessage(errorMsg)
      setPaymentStatus('failed')
      onError(errorMsg)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setErrorMessage('Card element not found')
      setIsProcessing(false)
      setPaymentStatus('failed')
      return
    }

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: customerName,
          email: customerEmail,
        },
      },
    })

    setIsProcessing(false)

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      setPaymentStatus('failed')
      onError(error.message || 'Payment failed')
    } else if (paymentIntent?.status === 'succeeded') {
      setPaymentStatus('succeeded')
      onSuccess(paymentIntent.id)
    } else {
      setErrorMessage('Payment was not completed')
      setPaymentStatus('failed')
      onError('Payment was not completed')
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        fontFamily: '"Inter", system-ui, sans-serif',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: false,
  }

  const getPaymentTypeLabel = () => {
    switch (paymentType) {
      case 'deposit':
        return 'Deposit Payment'
      case 'balance':
        return 'Balance Payment'
      case 'full_payment':
        return 'Full Payment'
      default:
        return 'Payment'
    }
  }

  const getPaymentTypeDescription = () => {
    switch (paymentType) {
      case 'deposit':
        return 'Secure your booking with this deposit payment'
      case 'balance':
        return 'Complete your order with the remaining balance'
      case 'full_payment':
        return 'Complete payment for your order'
      default:
        return 'Process your payment securely'
    }
  }

  if (paymentStatus === 'succeeded') {
    return (
      <Card variant="glass" className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your {paymentType === 'deposit' ? 'deposit' : 'payment'} of ${amount.toFixed(2)} has been processed successfully.
        </p>
        <p className="text-sm text-gray-500">
          You will receive a confirmation email shortly.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{getPaymentTypeLabel()}</h3>
            <p className="text-sm text-gray-600">{getPaymentTypeDescription()}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Payment Type</p>
            <p className="font-medium text-gray-900 capitalize">{paymentType.replace('_', ' ')}</p>
          </div>
        </div>
      </Card>

      {/* Payment Form */}
      <Card variant="glass" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-transparent">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={customerName}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Your payment is secure</p>
              <p>All transactions are encrypted and processed securely through Stripe.</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={!stripe || isProcessing || !clientSecret}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay ${amount.toFixed(2)} Securely
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By completing this payment, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </Card>
    </div>
  )
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default PaymentCheckout