import { Pool } from 'pg'

// Types for database queries
export interface ListingRow {
  id: number
  token_id: string
  seller_address: string
  price_wei: string
  price_formatted: string
  payment_token_address: string
  duration_seconds: number
  deadline_timestamp: string
  created_at_timestamp: string
  status: string
  transaction_hash: string
  sale_transaction_hash?: string
  block_number: number
  vehemi_balance_wei: string
  vehemi_balance_formatted: string
  locked_amount_wei: string
  locked_amount_formatted: string
  lock_start_timestamp: string
  lock_end_timestamp: string
  owner_address: string
  payment_token_symbol?: string
  payment_token_name?: string
  payment_token_decimals?: number
  token_usd_price?: number
  usd_value?: number
  hemi_usd_price?: number
}

// Database connection pool
const pool = new Pool({
  host: process.env.PSQL_SERVER,
  port: parseInt(process.env.PSQL_SERVER_PORT || '5432'),
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASS,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
})

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Execute a query with error handling
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Get active listings with pagination and filtering
export async function getActiveListings(options: {
  page?: number
  limit?: number
  sortBy?: 'price' | 'created_at' | 'deadline'
  sortOrder?: 'asc' | 'desc'
  minPrice?: string
  maxPrice?: string
  minVehemiBalance?: string
  maxVehemiBalance?: string
  minLockAmount?: string
  maxLockAmount?: string
} = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
    minPrice,
    maxPrice,
    minVehemiBalance,
    maxVehemiBalance,
    minLockAmount,
    maxLockAmount
  } = options

  const offset = (page - 1) * limit
  const params: any[] = []
  let paramIndex = 1

  // Build WHERE clause
  const whereConditions = ["l.status = 'active'", "l.deadline_timestamp > NOW()", "COALESCE(n.blacklist, false) = false"]
  
  if (minPrice) {
    whereConditions.push(`l.price_wei >= $${paramIndex}`)
    params.push(minPrice)
    paramIndex++
  }
  
  if (maxPrice) {
    whereConditions.push(`l.price_wei <= $${paramIndex}`)
    params.push(maxPrice)
    paramIndex++
  }
  
  if (minVehemiBalance) {
    whereConditions.push(`(n.vehemi_balance_wei >= $${paramIndex} OR n.vehemi_balance_wei IS NULL)`)
    params.push(minVehemiBalance)
    paramIndex++
  }
  
  if (maxVehemiBalance) {
    whereConditions.push(`(n.vehemi_balance_wei <= $${paramIndex} OR n.vehemi_balance_wei IS NULL)`)
    params.push(maxVehemiBalance)
    paramIndex++
  }
  
  if (minLockAmount) {
    whereConditions.push(`(n.locked_amount_wei >= $${paramIndex} OR n.locked_amount_wei IS NULL)`)
    params.push(minLockAmount)
    paramIndex++
  }
  
  if (maxLockAmount) {
    whereConditions.push(`(n.locked_amount_wei <= $${paramIndex} OR n.locked_amount_wei IS NULL)`)
    params.push(maxLockAmount)
    paramIndex++
  }

  // Build ORDER BY clause
  let orderBy = 'l.created_at_timestamp DESC'
  if (sortBy === 'price') {
    orderBy = `l.price_wei ${sortOrder.toUpperCase()}`
  } else if (sortBy === 'deadline') {
    orderBy = `l.deadline_timestamp ${sortOrder.toUpperCase()}`
  } else if (sortBy === 'created_at') {
    orderBy = `l.created_at_timestamp ${sortOrder.toUpperCase()}`
  }

  // Add HEMI address parameter
  params.push(process.env.NEXT_PUBLIC_HEMI_CONTRACT || '0x1Ee7476307e923319a12DDF127bcf8BdfAd345A0')
  paramIndex++
  
  // Add pagination parameters
  params.push(limit, offset)

  const sqlQuery = `
    SELECT 
      l.id,
      l.token_id,
      l.seller_address,
      l.price_wei,
      l.price_formatted,
      l.payment_token_address,
      l.duration_seconds,
      l.deadline_timestamp,
      l.created_at_timestamp,
      l.transaction_hash,
      l.block_number,
      n.vehemi_balance_wei,
      n.vehemi_balance_formatted,
      n.locked_amount_wei,
      n.locked_amount_formatted,
      n.lock_start_timestamp,
      n.lock_end_timestamp,
      n.owner_address,
      pt.token_symbol as payment_token_symbol,
      pt.token_name as payment_token_name,
      pt.decimals as payment_token_decimals,
      tp.usd_price as token_usd_price,
      (l.price_formatted * tp.usd_price) as usd_value,
      hemi_tp.usd_price as hemi_usd_price
    FROM listings l
    LEFT JOIN nft_tokens n ON l.token_id = n.token_id
    LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
    LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
    LEFT JOIN token_prices hemi_tp ON hemi_tp.token_address = $${paramIndex - 1}
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const result = await query(sqlQuery, params)
  return result.rows as ListingRow[]
}

// Get total count of active listings
export async function getActiveListingsCount(filters: {
  minPrice?: string
  maxPrice?: string
  minVehemiBalance?: string
  maxVehemiBalance?: string
  minLockAmount?: string
  maxLockAmount?: string
} = {}) {
  const params: any[] = []
  let paramIndex = 1

  // Build WHERE clause
  const whereConditions = ["l.status = 'active'", "l.deadline_timestamp > NOW()"]
  
  if (filters.minPrice) {
    whereConditions.push(`l.price_wei >= $${paramIndex}`)
    params.push(filters.minPrice)
    paramIndex++
  }
  
  if (filters.maxPrice) {
    whereConditions.push(`l.price_wei <= $${paramIndex}`)
    params.push(filters.maxPrice)
    paramIndex++
  }
  
  if (filters.minVehemiBalance) {
    whereConditions.push(`(n.vehemi_balance_wei >= $${paramIndex} OR n.vehemi_balance_wei IS NULL)`)
    params.push(filters.minVehemiBalance)
    paramIndex++
  }
  
  if (filters.maxVehemiBalance) {
    whereConditions.push(`(n.vehemi_balance_wei <= $${paramIndex} OR n.vehemi_balance_wei IS NULL)`)
    params.push(filters.maxVehemiBalance)
    paramIndex++
  }
  
  if (filters.minLockAmount) {
    whereConditions.push(`(n.locked_amount_wei >= $${paramIndex} OR n.locked_amount_wei IS NULL)`)
    params.push(filters.minLockAmount)
    paramIndex++
  }
  
  if (filters.maxLockAmount) {
    whereConditions.push(`(n.locked_amount_wei <= $${paramIndex} OR n.locked_amount_wei IS NULL)`)
    params.push(filters.maxLockAmount)
    paramIndex++
  }

  const countSqlQuery = `
    SELECT COUNT(*) as total
    FROM listings l
    LEFT JOIN nft_tokens n ON l.token_id = n.token_id
    LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
    WHERE ${whereConditions.join(' AND ')}
  `

  const result = await query(countSqlQuery, params)
  return parseInt(result.rows[0].total)
}

// Get marketplace statistics
export async function getMarketplaceStats() {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_listings,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
      COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_listings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_listings,
      COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_listings,
      COALESCE(SUM(CASE WHEN status = 'sold' THEN price_wei ELSE 0 END), 0) as total_volume_wei,
      COALESCE(AVG(CASE WHEN status = 'sold' THEN price_wei END), 0) as average_price_wei,
      COUNT(DISTINCT seller_address) as unique_sellers,
      COUNT(DISTINCT buyer_address) as unique_buyers
    FROM listings
  `

  const result = await query(statsQuery)
  return result.rows[0]
}

// Get listing by token ID
export async function getListingByTokenId(tokenId: string) {
  const sqlQuery = `
    SELECT 
      l.*,
      n.vehemi_balance_wei,
      n.vehemi_balance_formatted,
      n.locked_amount_wei,
      n.locked_amount_formatted,
      n.lock_start_timestamp,
      n.lock_end_timestamp,
      n.owner_address,
      pt.token_symbol as payment_token_symbol,
      pt.token_name as payment_token_name,
      pt.decimals as payment_token_decimals
    FROM listings l
    LEFT JOIN nft_tokens n ON l.token_id = n.token_id
    LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
    WHERE l.token_id = $1 AND l.status = 'active' AND l.deadline_timestamp > NOW() AND COALESCE(n.blacklist, false) = false
    ORDER BY l.created_at_timestamp DESC
    LIMIT 1
  `

  const result = await query(sqlQuery, [tokenId])
  return (result.rows[0] as ListingRow) || null
}

// Get supported payment tokens
export async function getSupportedPaymentTokens() {
  const sqlQuery = `
    SELECT 
      token_address,
      token_symbol,
      token_name,
      decimals,
      is_active,
      added_at_timestamp
    FROM payment_tokens
    WHERE is_active = true
    ORDER BY added_at_timestamp ASC
  `

  const result = await query(sqlQuery)
  return result.rows
}

// Get payment token statistics
export async function getPaymentTokenStats() {
  const sqlQuery = `
    SELECT 
      pt.token_symbol,
      pt.token_address,
      COUNT(l.id) as total_listings,
      COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_listings,
      COUNT(CASE WHEN l.status = 'sold' THEN 1 END) as sold_listings,
      COALESCE(SUM(CASE WHEN l.status = 'sold' THEN l.price_wei ELSE 0 END), 0) as total_volume_wei,
      COALESCE(AVG(CASE WHEN l.status = 'sold' THEN l.price_wei END), 0) as average_price_wei
    FROM payment_tokens pt
    LEFT JOIN listings l ON pt.token_address = l.payment_token_address
    WHERE pt.is_active = true
    GROUP BY pt.token_symbol, pt.token_address
    ORDER BY total_volume_wei DESC
  `

  const result = await query(sqlQuery)
  return result.rows
}

export default pool
