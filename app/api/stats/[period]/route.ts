import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * Statistics API - Performance Notes
 * 
 * This endpoint uses LATERAL joins to fetch historical token prices at the time
 * of each sale for accurate USD valuations. This is important for volatile tokens
 * like HEMI where the price may change significantly over time.
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Current implementation queries price_history table for each sale
 * - Should be fast for typical volumes (hundreds/thousands of sales)
 * - Requires proper indexes on price_history table (see below)
 * 
 * RECOMMENDED INDEXES:
 *   CREATE INDEX idx_price_history_token_time 
 *   ON price_history(token_address, recorded_at DESC);
 * 
 * WHEN TO OPTIMIZE:
 * If you notice slow queries (>1s) or have high traffic, consider:
 * 1. Add a 'sale_usd_value' column to listings table
 * 2. Calculate and store USD value when sale occurs (in indexer)
 * 3. Update this endpoint to use the stored value instead of calculating
 * 
 * This would eliminate the LATERAL join and make queries much faster.
 */

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

interface StatsResult {
  salesCount: number;
  totalHemiLocked: number;
  totalUsdValue: number;
  byToken: {
    [token: string]: {
      salesCount: number;
      totalHemiLocked: number;
      totalUsdValue: number;
    };
  };
}

/**
 * Parse period string to days
 * Examples: "30d" -> 30, "7d" -> 7, "total" -> null
 */
function parsePeriod(period: string): number | null {
  if (period === 'total' || period === 'all') {
    return null;
  }
  
  const match = period.match(/^(\d+)d$/);
  if (match) {
    return parseInt(match[1]);
  }
  
  throw new Error(`Invalid period format: ${period}`);
}

/**
 * GET /api/stats/[period]
 * 
 * Get statistics for a given time period
 * 
 * Periods:
 * - 30d, 7d, 1d, etc. - stats for last N days
 * - total - all-time stats
 * 
 * Returns:
 * - salesCount: number of sales
 * - totalHemiLocked: total amount of HEMI locked in sold positions
 * - totalUsdValue: combined USD value of all sales
 * - byToken: breakdown by payment token (HEMI, USDC, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period: string }> }
) {
  const client = await db.connect();
  
  try {
    const { period } = await params;
    
    // Parse the period parameter
    let days: number | null;
    try {
      days = parsePeriod(period);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Invalid period format' 
        },
        { status: 400 }
      );
    }
    
    // Build the WHERE clause for time filtering
    let timeCondition = '';
    const queryParams: any[] = [];
    
    if (days !== null) {
      // Filter by time period - use parameterized interval multiplication
      timeCondition = `AND l.sold_at_timestamp >= NOW() - INTERVAL '1 day' * $1`;
      queryParams.push(days);
    }
    
    // Query for overall stats
    // Uses LATERAL join to get historical price at time of sale for accurate USD valuation
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT l.id) as sales_count,
        COALESCE(SUM(n.locked_amount_formatted), 0) as total_hemi_locked,
        COALESCE(SUM(
          l.price_formatted * COALESCE(ph.usd_price, tp.usd_price, 0)
        ), 0) as total_usd_value
      FROM listings l
      LEFT JOIN nft_tokens n ON l.token_id = n.token_id
      LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
      LEFT JOIN LATERAL (
        SELECT usd_price 
        FROM price_history
        WHERE token_address = l.payment_token_address
          AND recorded_at <= l.sold_at_timestamp
        ORDER BY recorded_at DESC
        LIMIT 1
      ) ph ON true
      WHERE l.status = 'sold'
        ${timeCondition}
    `;
    
    const statsResult = await client.query(statsQuery, queryParams);
    const overallStats = statsResult.rows[0];
    
    // Query for breakdown by payment token
    // Uses LATERAL join to get historical price at time of sale for accurate USD valuation
    const byTokenQuery = `
      SELECT 
        pt.token_symbol,
        COUNT(DISTINCT l.id) as sales_count,
        COALESCE(SUM(n.locked_amount_formatted), 0) as total_hemi_locked,
        COALESCE(SUM(
          l.price_formatted * COALESCE(ph.usd_price, tp.usd_price, 0)
        ), 0) as total_usd_value
      FROM listings l
      LEFT JOIN nft_tokens n ON l.token_id = n.token_id
      LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
      LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
      LEFT JOIN LATERAL (
        SELECT usd_price 
        FROM price_history
        WHERE token_address = l.payment_token_address
          AND recorded_at <= l.sold_at_timestamp
        ORDER BY recorded_at DESC
        LIMIT 1
      ) ph ON true
      WHERE l.status = 'sold'
        ${timeCondition}
      GROUP BY pt.token_symbol
      ORDER BY total_usd_value DESC
    `;
    
    const byTokenResult = await client.query(byTokenQuery, queryParams);
    
    // Build the by-token breakdown
    const byToken: StatsResult['byToken'] = {};
    byTokenResult.rows.forEach(row => {
      byToken[row.token_symbol || 'Unknown'] = {
        salesCount: parseInt(row.sales_count),
        totalHemiLocked: parseFloat(row.total_hemi_locked),
        totalUsdValue: parseFloat(row.total_usd_value),
      };
    });
    
    // Build the response
    const result: StatsResult = {
      salesCount: parseInt(overallStats.sales_count),
      totalHemiLocked: parseFloat(overallStats.total_hemi_locked),
      totalUsdValue: parseFloat(overallStats.total_usd_value),
      byToken,
    };
    
    return NextResponse.json({
      success: true,
      period,
      days: days || 'all',
      data: result,
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // If it's a database connection error, return a more graceful response
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
      }, { status: 503 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

