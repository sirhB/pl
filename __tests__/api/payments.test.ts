import { NextRequest } from 'next/server'
import { POST, GET, PUT } from '@/app/api/payments/route'

// Mock dependencies
jest.mock('@/lib/stripe', () => ({
  createPaymentIntent: jest.fn(),
  capturePaymentIntent: jest.fn(),
  cancelPaymentIntent: jest.fn(),
  getPaymentIntent: jest.fn(),
  formatAmountForStripe: jest.fn(amount => Math.round(amount * 100)),
  mapStripeStatusToInternal: jest.fn(status => {
    switch (status) {
      case 'succeeded': return 'paid'
      case 'processing': return 'pending'
      case 'canceled': return 'failed'
      default: return 'pending'
    }
  })
}))

jest.mock('@/lib/database', () => ({
  db: {
    insert: jest.fn(),
    query: jest.fn(),
  }
}))

import { createPaymentIntent, capturePaymentIntent, cancelPaymentIntent, getPaymentIntent } from '@/lib/stripe'
import { db } from '@/lib/database'

const mockCreatePaymentIntent = createPaymentIntent as jest.MockedFunction<typeof createPaymentIntent>
const mockCapturePaymentIntent = capturePaymentIntent as jest.MockedFunction<typeof capturePaymentIntent>
const mockCancelPaymentIntent = cancelPaymentIntent as jest.MockedFunction<typeof cancelPaymentIntent>
const mockGetPaymentIntent = getPaymentIntent as jest.MockedFunction<typeof getPaymentIntent>
const mockDbInsert = db.insert as jest.MockedFunction<typeof db.insert>
const mockDbQuery = db.query as jest.MockedFunction<typeof db.query>

describe('/api/payments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/payments', () => {
    const validPaymentData = {
      amount: 100.00,
      customerEmail: 'test@example.com',
      customerName: 'John Doe',
      description: 'Test payment',
      paymentType: 'deposit'
    }

    test('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        status: 'requires_payment_method'
      }

      mockCreatePaymentIntent.mockResolvedValue({
        success: true,
        paymentIntent: mockPaymentIntent,
        clientSecret: 'pi_test_123_secret_abc',
        customerId: 'cus_test_123'
      })

      mockDbInsert.mockResolvedValue({
        id: 'payment_1',
        payment_intent_id: 'pi_test_123'
      })

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(validPaymentData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.paymentIntentId).toBe('pi_test_123')
      expect(data.data.clientSecret).toBe('pi_test_123_secret_abc')

      expect(mockCreatePaymentIntent).toHaveBeenCalledWith({
        amount: 10000, // 100.00 * 100
        orderId: undefined,
        venueBookingId: undefined,
        customerId: undefined,
        customerEmail: 'test@example.com',
        customerName: 'John Doe',
        description: 'Test payment',
        paymentType: 'deposit',
        metadata: {}
      })

      expect(mockDbInsert).toHaveBeenCalledWith('payments', expect.objectContaining({
        payment_intent_id: 'pi_test_123',
        amount: 100.00,
        payment_type: 'deposit',
        status: 'pending'
      }))
    })

    test('should return 400 for missing required fields', async () => {
      const invalidData = {
        customerEmail: 'test@example.com',
        // Missing amount, customerName, description, paymentType
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Missing required field')
    })

    test('should handle Stripe error', async () => {
      mockCreatePaymentIntent.mockResolvedValue({
        success: false,
        error: 'Payment intent creation failed'
      })

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(validPaymentData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Payment intent creation failed')
    })
  })

  describe('GET /api/payments', () => {
    test('should get payment by payment_intent_id', async () => {
      const mockStripePayment = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 10000
      }

      const mockDbPayment = {
        id: 'payment_1',
        payment_intent_id: 'pi_test_123',
        status: 'pending'
      }

      mockGetPaymentIntent.mockResolvedValue({
        success: true,
        paymentIntent: mockStripePayment
      })

      mockDbQuery.mockResolvedValue({
        rows: [mockDbPayment]
      })

      const request = new NextRequest('http://localhost:3000/api/payments?payment_intent_id=pi_test_123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.stripePayment).toEqual(mockStripePayment)
      expect(data.data.dbPayment).toEqual(expect.objectContaining({
        id: 'payment_1',
        status: 'paid' // Should be updated from 'pending' to 'paid'
      }))
    })

    test('should handle payment not found', async () => {
      mockGetPaymentIntent.mockResolvedValue({
        success: false,
        error: 'Payment intent not found'
      })

      const request = new NextRequest('http://localhost:3000/api/payments?payment_intent_id=pi_invalid')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Payment intent not found')
    })

    test('should get payments by order_id', async () => {
      const mockPayments = [
        { id: 'payment_1', order_id: 'order_123' },
        { id: 'payment_2', order_id: 'order_123' }
      ]

      mockDbQuery.mockResolvedValue({
        rows: mockPayments
      })

      const request = new NextRequest('http://localhost:3000/api/payments?order_id=order_123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockPayments)
    })
  })

  describe('PUT /api/payments', () => {
    test('should capture payment successfully', async () => {
      const mockCapturedPayment = {
        id: 'pi_test_123',
        status: 'succeeded'
      }

      mockCapturePaymentIntent.mockResolvedValue({
        success: true,
        paymentIntent: mockCapturedPayment
      })

      mockDbQuery.mockResolvedValue({
        rows: [{ order_id: 'order_123', venue_booking_id: null }]
      })

      const requestData = {
        paymentIntentId: 'pi_test_123',
        action: 'capture'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'PUT',
        body: JSON.stringify(requestData)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.paymentIntent).toEqual(mockCapturedPayment)
      expect(data.data.status).toBe('paid')

      expect(mockCapturePaymentIntent).toHaveBeenCalledWith('pi_test_123', undefined)
    })

    test('should cancel payment successfully', async () => {
      const mockCancelledPayment = {
        id: 'pi_test_123',
        status: 'canceled'
      }

      mockCancelPaymentIntent.mockResolvedValue({
        success: true,
        paymentIntent: mockCancelledPayment
      })

      mockDbQuery.mockResolvedValue({
        rows: [{ order_id: 'order_123', venue_booking_id: null }]
      })

      const requestData = {
        paymentIntentId: 'pi_test_123',
        action: 'cancel'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'PUT',
        body: JSON.stringify(requestData)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.paymentIntent).toEqual(mockCancelledPayment)
      expect(data.data.status).toBe('cancelled')

      expect(mockCancelPaymentIntent).toHaveBeenCalledWith('pi_test_123')
    })

    test('should return 400 for missing required fields', async () => {
      const invalidData = {
        paymentIntentId: 'pi_test_123'
        // Missing action
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Missing required fields')
    })

    test('should return 400 for invalid action', async () => {
      const invalidData = {
        paymentIntentId: 'pi_test_123',
        action: 'invalid_action'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid action')
    })

    test('should handle Stripe operation failure', async () => {
      mockCapturePaymentIntent.mockResolvedValue({
        success: false,
        error: 'Payment capture failed'
      })

      const requestData = {
        paymentIntentId: 'pi_test_123',
        action: 'capture'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'PUT',
        body: JSON.stringify(requestData)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Payment capture failed')
    })
  })

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockCreatePaymentIntent.mockResolvedValue({
        success: true,
        paymentIntent: { id: 'pi_test_123' },
        clientSecret: 'secret',
        customerId: 'cus_123'
      })

      mockDbInsert.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          customerEmail: 'test@example.com',
          customerName: 'John Doe',
          description: 'Test',
          paymentType: 'deposit'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create payment intent')
    })

    test('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })
})