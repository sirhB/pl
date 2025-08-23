import { Pool, PoolConfig } from 'pg'

// Database configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'primelux_events',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

// Create connection pool
let pool: Pool | null = null

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig)
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }
  
  return pool
}

// Database helper functions
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw new DatabaseError('Database query failed', error as Error)
  } finally {
    client.release()
  }
}

export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction error:', error)
    throw new DatabaseError('Transaction failed', error as Error)
  } finally {
    client.release()
  }
}

// Common database operations
export const db = {
  // Generic query method
  async query(text: string, params?: any[]) {
    return await query(text, params)
  },

  // Find single record
  async findOne(table: string, conditions: Record<string, any>) {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')
    
    const values = Object.values(conditions)
    const result = await query(`SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`, values)
    
    return result.rows[0] || null
  },

  // Find multiple records
  async findMany(
    table: string, 
    conditions: Record<string, any> = {}, 
    options: { limit?: number; offset?: number; orderBy?: string } = {}
  ) {
    let queryText = `SELECT * FROM ${table}`
    const values: any[] = []
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ')
      queryText += ` WHERE ${whereClause}`
      values.push(...Object.values(conditions))
    }
    
    if (options.orderBy) {
      queryText += ` ORDER BY ${options.orderBy}`
    }
    
    if (options.limit) {
      queryText += ` LIMIT $${values.length + 1}`
      values.push(options.limit)
    }
    
    if (options.offset) {
      queryText += ` OFFSET $${values.length + 1}`
      values.push(options.offset)
    }
    
    const result = await query(queryText, values)
    return result.rows
  },

  // Insert record
  async insert(table: string, data: Record<string, any>) {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')
    
    const queryText = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `
    
    const result = await query(queryText, values)
    return result.rows[0]
  },

  // Update record
  async update(table: string, data: Record<string, any>, conditions: Record<string, any>) {
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')
    
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`)
      .join(' AND ')
    
    const values = [...Object.values(data), ...Object.values(conditions)]
    
    const queryText = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `
    
    const result = await query(queryText, values)
    return result.rows[0]
  },

  // Delete record
  async delete(table: string, conditions: Record<string, any>) {
    const whereClause = Object.keys(conditions)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')
    
    const values = Object.values(conditions)
    
    const queryText = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`
    const result = await query(queryText, values)
    return result.rows[0]
  },

  // Execute transaction
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return await transaction(callback)
  }
}

// Utility functions for common operations
export const dbUtils = {
  // Generate UUID
  generateUUID(): string {
    return 'uuid_generate_v4()'
  },

  // Get current timestamp
  now(): string {
    return 'CURRENT_TIMESTAMP'
  },

  // Escape SQL identifiers
  escapeIdentifier(identifier: string): string {
    return '"' + identifier.replace(/"/g, '""') + '"'
  },

  // Build pagination info
  async getPaginationInfo(
    table: string,
    conditions: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ) {
    let countQuery = `SELECT COUNT(*) as total FROM ${table}`
    const values: any[] = []
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ')
      countQuery += ` WHERE ${whereClause}`
      values.push(...Object.values(conditions))
    }
    
    const countResult = await query(countQuery, values)
    const total = parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    
    return {
      total,
      totalPages,
      currentPage: page,
      limit,
      offset,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// Type definitions for database models
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
  role: 'customer' | 'admin' | 'manager' | 'staff' | 'super_admin'
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
  two_factor_secret?: string
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  category_id: string
  sku: string
  price: number
  cost?: number
  weight?: number
  dimensions_length?: number
  dimensions_width?: number
  dimensions_height?: number
  setup_time?: number
  requires_special_handling: boolean
  minimum_rental_period: number
  image_url?: string
  gallery_images?: string[]
  specifications?: Record<string, any>
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: 'pending' | 'confirmed' | 'in_preparation' | 'delivered' | 'completed' | 'cancelled'
  event_date: Date
  event_type: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'graduation' | 'holiday' | 'other'
  event_description?: string
  guest_count?: number
  delivery_address_line_1: string
  delivery_address_line_2?: string
  delivery_city: string
  delivery_state: string
  delivery_zip_code: string
  delivery_notes?: string
  subtotal: number
  delivery_fee: number
  setup_fee: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  deposit_amount: number
  balance_due: number
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed'
  delivery_date?: Date
  pickup_date?: Date
  delivery_time_slot?: string
  setup_crew_size: number
  has_stairs: boolean
  floor_level: number
  access_difficulty: string
  created_at: Date
  updated_at: Date
}

export interface VenueBooking {
  id: string
  venue_id: string
  user_id: string
  event_date: Date
  start_time: string
  end_time: string
  guest_count: number
  event_type: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'graduation' | 'holiday' | 'other'
  status: 'available' | 'booked' | 'maintenance' | 'unavailable'
  special_requirements?: string
  total_cost: number
  deposit_amount?: number
  created_at: Date
  updated_at: Date
}

// Database initialization and health check
export async function initializeDatabase() {
  try {
    const pool = getPool()
    const client = await pool.connect()
    
    // Test connection
    const result = await client.query('SELECT NOW()')
    console.log('Database connected successfully at:', result.rows[0].now)
    
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    throw new DatabaseError('Failed to initialize database connection', error as Error)
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('Database connection pool closed')
  }
}