import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// POST /api/notifications/email - Send email notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    let mailOptions: any = {}

    switch (type) {
      case 'order_confirmation':
        mailOptions = {
          from: process.env.SMTP_FROM || 'Prime Lux Events <noreply@primeluxevents.com>',
          to: data.customerEmail,
          subject: `Order Confirmation - ${data.orderNumber} | Prime Lux Events`,
          html: generateOrderConfirmationHTML(data)
        }
        break

      case 'payment_confirmation':
        mailOptions = {
          from: process.env.SMTP_FROM || 'Prime Lux Events <noreply@primeluxevents.com>',
          to: data.customerEmail,
          subject: `Payment Confirmation - ${data.orderNumber} | Prime Lux Events`,
          html: generatePaymentConfirmationHTML(data)
        }
        break

      case 'order_status_update':
        mailOptions = {
          from: process.env.SMTP_FROM || 'Prime Lux Events <noreply@primeluxevents.com>',
          to: data.customerEmail,
          subject: `Order Update - ${data.orderNumber} | Prime Lux Events`,
          html: generateOrderUpdateHTML(data)
        }
        break

      case 'venue_booking_confirmation':
        mailOptions = {
          from: process.env.SMTP_FROM || 'Prime Lux Events <noreply@primeluxevents.com>',
          to: data.customerEmail,
          subject: `Venue Booking Confirmation - ${data.bookingNumber} | Prime Lux Events`,
          html: generateVenueBookingHTML(data)
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // Log the email sending
    console.log(`Email sent: ${type} to ${mailOptions.to}`)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// GET /api/notifications/email/test - Test email configuration
export async function GET() {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: 'Email configuration is working'
    })

  } catch (error) {
    console.error('Email configuration test failed:', error)
    return NextResponse.json(
      { success: false, error: 'Email configuration failed' },
      { status: 500 }
    )
  }
}

function generateOrderConfirmationHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #D4AF37, #F5E6A3); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; background: #f9f9f9; }
    .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .items-list { margin: 20px 0; }
    .item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prime Lux Events</h1>
      <h2>Order Confirmation</h2>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Thank you for your order with Prime Lux Events! We're excited to help make your ${data.eventType} extraordinary.</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Event Date:</strong> ${data.eventDate}</p>
        <p><strong>Event Type:</strong> ${data.eventType}</p>
        <p><strong>Total Amount:</strong> $${data.totalAmount?.toLocaleString()}</p>
        <p><strong>Deposit Required:</strong> $${data.depositAmount?.toLocaleString()}</p>
      </div>
      
      ${data.items ? `
        <div class="items-list">
          <h3>Items Ordered</h3>
          ${data.items.map((item: any) => `
            <div class="item">
              <strong>${item.name}</strong> (Qty: ${item.quantity})<br>
              <span style="color: #D4AF37;">$${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="order-details">
        <h3>Next Steps</h3>
        <ol>
          <li>Complete your deposit payment to secure your booking</li>
          <li>We'll contact you within 24 hours to confirm details</li>
          <li>Final payment will be due 7 days before your event</li>
        </ol>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us at ${process.env.COMPANY_PHONE || '(203) 555-0123'}.</p>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing Prime Lux Events!</p>
      <p><strong>Prime Lux Events</strong><br>
      ${process.env.COMPANY_ADDRESS || '123 Business St, Shelton, CT 06484'}</p>
    </div>
  </div>
</body>
</html>
  `
}

function generatePaymentConfirmationHTML(data: any): string {
  const paymentTypeLabel = data.paymentType === 'deposit' ? 'Deposit' : 
                          data.paymentType === 'balance' ? 'Balance' : 'Payment'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981, #34D399); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; background: #f9f9f9; }
    .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10B981; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Payment Confirmed</h1>
      <h2>${paymentTypeLabel} Payment Received</h2>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Your ${paymentTypeLabel.toLowerCase()} payment has been successfully processed!</p>
      
      <div class="payment-details">
        <h3>Payment Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>${paymentTypeLabel} Amount:</strong> $${data.amount?.toFixed(2)}</p>
        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>${data.paymentType === 'deposit' ? 
        'Thank you for your deposit! We will contact you soon to finalize the details of your event.' :
        'Thank you for completing your payment! Your order is now fully paid.'
      }</p>
    </div>
    
    <div class="footer">
      <p><strong>Prime Lux Events</strong><br>
      ${process.env.COMPANY_ADDRESS || '123 Business St, Shelton, CT 06484'}</p>
    </div>
  </div>
</body>
</html>
  `
}

function generateOrderUpdateHTML(data: any): string {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Your order has been confirmed and is being prepared.'
      case 'in_preparation': return 'Your items are currently being prepared for your event.'
      case 'ready_for_delivery': return 'Your order is ready and will be delivered soon.'
      case 'delivered': return 'Your order has been delivered successfully.'
      case 'completed': return 'Your event is complete. We hope it was amazing!'
      default: return `Your order status has been updated to: ${status}`
    }
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6, #60A5FA); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; background: #f9f9f9; }
    .status-update { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3B82F6; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Update</h1>
      <h2>${data.orderNumber}</h2>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Your order status has been updated.</p>
      
      <div class="status-update">
        <h3>Status Update</h3>
        <p><strong>Previous Status:</strong> ${data.oldStatus}</p>
        <p><strong>Current Status:</strong> ${data.newStatus}</p>
        <p><strong>Event Date:</strong> ${data.eventDate}</p>
        
        <p style="margin-top: 20px; padding: 15px; background: #EBF8FF; border-radius: 6px;">
          ${getStatusMessage(data.newStatus)}
        </p>
      </div>
      
      <p>If you have any questions, please contact us at ${process.env.COMPANY_PHONE || '(203) 555-0123'}.</p>
    </div>
    
    <div class="footer">
      <p><strong>Prime Lux Events</strong><br>
      ${process.env.COMPANY_ADDRESS || '123 Business St, Shelton, CT 06484'}</p>
    </div>
  </div>
</body>
</html>
  `
}

function generateVenueBookingHTML(data: any): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #D4AF37, #F5E6A3); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; background: #f9f9f9; }
    .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prime Lux Events</h1>
      <h2>Venue Booking Confirmation</h2>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Your venue booking at <strong>${data.venueName}</strong> has been confirmed!</p>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <p><strong>Booking Number:</strong> ${data.bookingNumber}</p>
        <p><strong>Venue:</strong> ${data.venueName}</p>
        <p><strong>Event Date:</strong> ${data.eventDate}</p>
        <p><strong>Event Type:</strong> ${data.eventType}</p>
        <p><strong>Time:</strong> ${formatTime(data.startTime)} - ${formatTime(data.endTime)}</p>
        <p><strong>Guest Count:</strong> ${data.guestCount}</p>
        <p><strong>Total Amount:</strong> $${data.totalAmount?.toLocaleString()}</p>
      </div>
      
      <p>We'll be in touch soon to discuss setup requirements and any special requests for your event.</p>
    </div>
    
    <div class="footer">
      <p><strong>Prime Lux Events</strong><br>
      ${process.env.COMPANY_ADDRESS || '123 Business St, Shelton, CT 06484'}</p>
    </div>
  </div>
</body>
</html>
  `
}