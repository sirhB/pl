import { NextRequest, NextResponse } from 'next/server'
import { db, dbUtils } from '@/lib/database'

// GET /api/orders - Get orders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const userId = searchParams.get('user_id')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    let whereConditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    // Status filter
    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    // User filter (for customer orders)
    if (userId) {
      whereConditions.push(`o.user_id = $${paramIndex}`)
      queryParams.push(userId)
      paramIndex++
    }

    // Search filter (order number, customer name, email)
    if (search) {
      whereConditions.push(`(
        o.order_number ILIKE $${paramIndex} OR 
        u.first_name ILIKE $${paramIndex} OR 
        u.last_name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    // Main query with user and order items info
    const query = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        COUNT(oi.id) as item_count,
        SUM(oi.quantity) as total_items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.first_name, u.last_name, u.email, u.phone
      ORDER BY o.${sort} ${order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const result = await db.query(query, queryParams)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `
    const countResult = await db.query(countQuery, queryParams.slice(0, -2))
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
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'user_id', 'event_date', 'event_type', 'items',
      'delivery_address_line_1', 'delivery_city', 'delivery_state', 'delivery_zip_code'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    return await db.transaction(async (client) => {
      // Generate order number
      const orderNumber = await generateOrderNumber(client)

      // Calculate totals
      let subtotal = 0
      const validatedItems = []

      for (const item of body.items) {
        // Validate product and get current price
        const productResult = await client.query(
          'SELECT id, name, price FROM products WHERE id = $1 AND is_active = true',
          [item.product_id]
        )

        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.product_id} not found or inactive`)
        }

        const product = productResult.rows[0]
        const quantity = parseInt(item.quantity)
        const unitPrice = parseFloat(product.price)
        const totalPrice = unitPrice * quantity

        validatedItems.push({
          product_id: item.product_id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          special_instructions: item.special_instructions || null
        })

        subtotal += totalPrice
      }

      // Calculate fees and totals
      const deliveryFee = calculateDeliveryFee(body)
      const setupFee = calculateSetupFee(body)
      const taxAmount = subtotal * 0.0625 // CT sales tax 6.25%
      const discountAmount = body.discount_amount || 0
      const totalAmount = subtotal + deliveryFee + setupFee + taxAmount - discountAmount
      const depositAmount = body.deposit_amount || Math.min(totalAmount * 0.5, 1000) // 50% or $1000 max
      const balanceDue = totalAmount - depositAmount

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: body.user_id,
        status: 'pending',
        event_date: body.event_date,
        event_type: body.event_type,
        event_description: body.event_description || null,
        guest_count: body.guest_count || null,
        
        // Delivery information
        delivery_address_line_1: body.delivery_address_line_1,
        delivery_address_line_2: body.delivery_address_line_2 || null,
        delivery_city: body.delivery_city,
        delivery_state: body.delivery_state,
        delivery_zip_code: body.delivery_zip_code,
        delivery_notes: body.delivery_notes || null,
        
        // Pricing
        subtotal,
        delivery_fee: deliveryFee,
        setup_fee: setupFee,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        payment_status: 'pending',
        
        // Logistics
        delivery_date: body.delivery_date || null,
        pickup_date: body.pickup_date || null,
        delivery_time_slot: body.delivery_time_slot || null,
        setup_crew_size: body.setup_crew_size || 2,
        has_stairs: body.has_stairs || false,
        floor_level: body.floor_level || 0,
        access_difficulty: body.access_difficulty || 'easy'
      }

      const newOrder = await client.query(`
        INSERT INTO orders (${Object.keys(orderData).join(', ')})
        VALUES (${Object.keys(orderData).map((_, i) => `$${i + 1}`).join(', ')})
        RETURNING *
      `, Object.values(orderData))

      const order = newOrder.rows[0]

      // Create order items
      for (const item of validatedItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, special_instructions)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [order.id, item.product_id, item.quantity, item.unit_price, item.total_price, item.special_instructions])
      }

      // Apply promo code if provided
      if (body.promo_code_id) {
        await client.query(`
          INSERT INTO order_promo_codes (order_id, promo_code_id, discount_amount)
          VALUES ($1, $2, $3)
        `, [order.id, body.promo_code_id, discountAmount])
        
        // Update promo code usage count
        await client.query(`
          UPDATE promo_codes 
          SET used_count = used_count + 1 
          WHERE id = $1
        `, [body.promo_code_id])
      }

      // Get complete order with items
      const completeOrder = await getOrderById(client, order.id)
      
      return NextResponse.json({
        success: true,
        data: completeOrder
      }, { status: 201 })
    })

  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Helper functions
async function generateOrderNumber(client: any): Promise<string> {
  const year = new Date().getFullYear()
  const result = await client.query(
    'SELECT COUNT(*) as count FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1',
    [year]
  )
  const count = parseInt(result.rows[0].count) + 1
  return `PL-${year}-${count.toString().padStart(3, '0')}`
}

function calculateDeliveryFee(orderData: any): number {
  // Base delivery fee
  let deliveryFee = 75
  
  // Distance calculation would go here
  // For now, using a simple state-based calculation
  if (orderData.delivery_state !== 'CT') {
    deliveryFee += 50 // Out of state surcharge
  }
  
  // Stairs fee
  if (orderData.has_stairs) {
    deliveryFee += Math.min(orderData.total_items * 8, 200)
  }
  
  // Access difficulty
  if (orderData.access_difficulty === 'moderate') {
    deliveryFee += 30
  } else if (orderData.access_difficulty === 'difficult') {
    deliveryFee += 45
  }
  
  return deliveryFee
}

function calculateSetupFee(orderData: any): number {
  // Setup complexity fee
  const setupComplexity = orderData.setup_complexity || 'standard'
  const setupFees = { basic: 0, standard: 50, complex: 125, premium: 200 }
  return setupFees[setupComplexity as keyof typeof setupFees] || 50
}

async function getOrderById(client: any, orderId: string) {
  const orderResult = await client.query(`
    SELECT 
      o.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = $1
  `, [orderId])

  const order = orderResult.rows[0]
  
  // Get order items
  const itemsResult = await client.query(`
    SELECT 
      oi.*,
      p.name as product_name,
      p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
    ORDER BY oi.created_at
  `, [orderId])
  
  order.items = itemsResult.rows
  
  return order
}