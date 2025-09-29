import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const db = new Pool({
  host: process.env.PSQL_SERVER,
  port: process.env.PSQL_SERVER_PORT ? parseInt(process.env.PSQL_SERVER_PORT) : 5432,
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function GET(request: NextRequest) {
  const client = await db.connect();
  const { searchParams } = new URL(request.url);
  
  try {
    
    // Parse query parameters
    const type = searchParams.get('type') || 'all';
    const tokens = searchParams.get('tokens')?.split(',') || ['HEMI', 'USDC'];
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build the query to get activity events from the database
    let query = `
      WITH activity_events AS (
        -- Listings
        SELECT 
          'list' as event_type,
          l.token_id::text as position_id,
          l.seller_address,
          NULL as buyer_address,
          l.price_formatted as total,
          pt.token_symbol as token,
          l.created_at_timestamp as timestamp,
          l.transaction_hash as tx_hash,
          n.locked_amount_formatted as amount,
          n.lock_end_timestamp as unlock_date,
          CASE 
            WHEN tp.usd_price IS NOT NULL AND n.locked_amount_formatted > 0 
            THEN (l.price_formatted * tp.usd_price) / n.locked_amount_formatted
            ELSE 0
          END as unit_usd
        FROM listings l
        JOIN nft_tokens n ON l.token_id = n.token_id
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
        WHERE l.status = 'active'
        
        UNION ALL
        
        -- Sales
        SELECT 
          'sale' as event_type,
          l.token_id::text as position_id,
          l.seller_address,
          l.buyer_address,
          l.price_formatted as total,
          pt.token_symbol as token,
          l.sold_at_timestamp as timestamp,
          l.transaction_hash as tx_hash,
          n.locked_amount_formatted as amount,
          n.lock_end_timestamp as unlock_date,
          CASE 
            WHEN tp.usd_price IS NOT NULL AND n.locked_amount_formatted > 0 
            THEN (l.price_formatted * tp.usd_price) / n.locked_amount_formatted
            ELSE 0
          END as unit_usd
        FROM listings l
        JOIN nft_tokens n ON l.token_id = n.token_id
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
        WHERE l.status = 'sold'
        
        UNION ALL
        
        -- Cancellations
        SELECT 
          'cancel' as event_type,
          l.token_id::text as position_id,
          l.seller_address,
          NULL as buyer_address,
          0 as total,
          pt.token_symbol as token,
          l.cancelled_at_timestamp as timestamp,
          l.transaction_hash as tx_hash,
          n.locked_amount_formatted as amount,
          n.lock_end_timestamp as unlock_date,
          0 as unit_usd
        FROM listings l
        JOIN nft_tokens n ON l.token_id = n.token_id
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        WHERE l.status = 'cancelled'
      )
      SELECT 
        event_type,
        position_id,
        seller_address,
        buyer_address,
        total,
        token,
        timestamp,
        tx_hash,
        amount,
        unlock_date,
        unit_usd
      FROM activity_events
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add type filter
    if (type !== 'all') {
      query += ` AND event_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }
    
    // Add token filter
    if (tokens.length > 0 && !tokens.includes('all')) {
      const tokenPlaceholders = tokens.map(() => `$${paramIndex++}`).join(',');
      query += ` AND token IN (${tokenPlaceholders})`;
      queryParams.push(...tokens);
    }
    
    // Add ordering and pagination
    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Execute the query
    const result = await client.query(query, queryParams);
    
    // Transform the results to match the expected format
    const activities = result.rows.map((row, index) => ({
      id: `activity_${row.position_id}_${row.timestamp.getTime()}_${index}`,
      type: row.event_type,
      positionId: parseInt(row.position_id),
      amount: parseFloat(row.amount || 0),
      total: parseFloat(row.total || 0),
      token: row.token,
      unitUsd: parseFloat(row.unit_usd || 0),
      seller: row.seller_address,
      buyer: row.buyer_address || undefined,
      txHash: row.tx_hash,
      timestamp: row.timestamp.toISOString(),
      unlockDate: row.unlock_date ? row.unlock_date.toISOString().split('T')[0] : ''
    }));
    
    // Get total count for pagination
    let countQuery = `
      WITH activity_events AS (
        SELECT 'list' as event_type, l.token_id, pt.token_symbol as token
        FROM listings l
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        WHERE l.status = 'active'
        UNION ALL
        SELECT 'sale' as event_type, l.token_id, pt.token_symbol as token
        FROM listings l
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        WHERE l.status = 'sold'
        UNION ALL
        SELECT 'cancel' as event_type, l.token_id, pt.token_symbol as token
        FROM listings l
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        WHERE l.status = 'cancelled'
      )
      SELECT COUNT(*) as total
      FROM activity_events
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (type !== 'all') {
      countQuery += ` AND event_type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }
    
    if (tokens.length > 0 && !tokens.includes('all')) {
      const tokenPlaceholders = tokens.map(() => `$${countParamIndex++}`).join(',');
      countQuery += ` AND token IN (${tokenPlaceholders})`;
      countParams.push(...tokens);
    }
    
    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('Error fetching activity data:', error);
    
    // If it's a database connection error, return empty data instead of 500
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0'),
          hasMore: false
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
