import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/venues/calendar - Get venue bookings for calendar
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get('venue_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')

    let query = `
      SELECT 
        vb.*,
        v.name as venue_name,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM venue_bookings vb
      LEFT JOIN venues v ON vb.venue_id = v.id
      LEFT JOIN users u ON vb.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (venueId) {
      query += ` AND vb.venue_id = $${paramIndex}`
      params.push(venueId)
      paramIndex++
    }

    if (startDate) {
      query += ` AND vb.event_date >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      query += ` AND vb.event_date <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    if (status && status !== 'all') {
      query += ` AND vb.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY vb.event_date ASC, vb.start_time ASC`

    const result = await db.query(query, params)

    // Transform data for calendar component
    const bookings = result.rows.map(row => ({
      id: row.id,
      venueId: row.venue_id,
      venueName: row.venue_name,
      customerName: `${row.customer_first_name || ''} ${row.customer_last_name || ''}`.trim() || 'Unknown Customer',
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      eventType: row.event_type,
      eventDate: row.event_date,
      startTime: row.start_time,
      endTime: row.end_time,
      guestCount: row.guest_count,
      setupTime: row.setup_time,
      cleanupTime: row.cleanup_time,
      status: row.status,
      totalAmount: parseFloat(row.total_amount || 0),
      depositAmount: parseFloat(row.deposit_amount || 0),
      depositStatus: row.deposit_status,
      paymentStatus: row.payment_status,
      specialRequests: row.special_requests,
      decorationPackage: row.decoration_package,
      cateringRequirements: row.catering_requirements,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: bookings
    })

  } catch (error) {
    console.error('Calendar bookings retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve calendar bookings' },
      { status: 500 }
    )
  }
}

// POST /api/venues/calendar - Check availability for new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venueId, eventDate, startTime, endTime, setupTime, cleanupTime, excludeBookingId } = body

    if (!venueId || !eventDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: venueId, eventDate, startTime, endTime' },
        { status: 400 }
      )
    }

    // Get existing bookings for the date
    let conflictQuery = `
      SELECT id, start_time, end_time, setup_time, cleanup_time, event_type
      FROM venue_bookings 
      WHERE venue_id = $1 
        AND event_date = $2 
        AND status NOT IN ('cancelled')
    `
    const params = [venueId, eventDate]

    // Exclude current booking if editing
    if (excludeBookingId) {
      conflictQuery += ` AND id != $3`
      params.push(excludeBookingId)
    }

    const conflictResult = await db.query(conflictQuery, params)
    const existingBookings = conflictResult.rows

    // Check for time conflicts
    const conflicts = []
    const requestedStart = setupTime || startTime
    const requestedEnd = cleanupTime || endTime

    for (const booking of existingBookings) {
      const existingStart = booking.setup_time || booking.start_time
      const existingEnd = booking.cleanup_time || booking.end_time

      // Check if times overlap
      if (
        (requestedStart >= existingStart && requestedStart < existingEnd) ||
        (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
        (requestedStart <= existingStart && requestedEnd >= existingEnd)
      ) {
        conflicts.push({
          bookingId: booking.id,
          eventType: booking.event_type,
          conflictStart: existingStart,
          conflictEnd: existingEnd,
          conflictReason: 'Time overlap detected'
        })
      }
    }

    // Calculate availability status
    const isAvailable = conflicts.length === 0
    const availabilityStatus = isAvailable ? 'available' : 'conflict'
    
    // Get venue capacity and other constraints
    const venueQuery = await db.query(
      'SELECT capacity, operating_hours_start, operating_hours_end FROM venues WHERE id = $1',
      [venueId]
    )
    
    const venue = venueQuery.rows[0]
    const warnings = []

    if (venue) {
      // Check if within operating hours
      if (startTime < venue.operating_hours_start || endTime > venue.operating_hours_end) {
        warnings.push('Event time is outside venue operating hours')
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isAvailable,
        status: availabilityStatus,
        conflicts,
        warnings,
        existingBookings: existingBookings.length,
        venue: venue ? {
          capacity: venue.capacity,
          operatingHoursStart: venue.operating_hours_start,
          operatingHoursEnd: venue.operating_hours_end
        } : null
      }
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}