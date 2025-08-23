import { NextRequest, NextResponse } from 'next/server'
import { db, dbUtils } from '@/lib/database'

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'name'
    const order = searchParams.get('order') || 'asc'

    let whereConditions: string[] = ['p.is_active = true']
    const queryParams: any[] = []
    let paramIndex = 1

    // Category filter
    if (category) {
      whereConditions.push(`c.slug = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    // Search filter
    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    // Main query with category join and availability info
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COUNT(i.id) as total_inventory,
        COUNT(CASE WHEN i.status = 'available' THEN 1 END) as available_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      ${whereClause}
      GROUP BY p.id, c.name, c.slug
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const result = await db.query(query, queryParams)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
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
    console.error('Products GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'category_id', 'sku', 'price']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Check if SKU or slug already exists
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE sku = $1 OR slug = $2',
      [body.sku, slug]
    )

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Product with this SKU or slug already exists' },
        { status: 409 }
      )
    }

    // Insert product
    const productData = {
      name: body.name,
      slug,
      description: body.description || null,
      category_id: body.category_id,
      sku: body.sku,
      price: parseFloat(body.price),
      cost: body.cost ? parseFloat(body.cost) : null,
      weight: body.weight ? parseFloat(body.weight) : null,
      dimensions_length: body.dimensions_length ? parseFloat(body.dimensions_length) : null,
      dimensions_width: body.dimensions_width ? parseFloat(body.dimensions_width) : null,
      dimensions_height: body.dimensions_height ? parseFloat(body.dimensions_height) : null,
      setup_time: body.setup_time ? parseInt(body.setup_time) : null,
      requires_special_handling: body.requires_special_handling || false,
      minimum_rental_period: body.minimum_rental_period || 1,
      image_url: body.image_url || null,
      gallery_images: body.gallery_images || null,
      specifications: body.specifications || null,
      is_active: body.is_active !== undefined ? body.is_active : true
    }

    const newProduct = await db.insert('products', productData)

    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 })

  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}