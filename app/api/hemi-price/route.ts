import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: process.env.PSQL_SERVER,
  port: parseInt(process.env.PSQL_SERVER_PORT || '5432'),
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASS,
});

export async function GET() {
  try {
    // Get HEMI token address from environment variable
    const HEMI_TOKEN_ADDRESS = process.env.HEMI_ADDRESS;
    
    if (!HEMI_TOKEN_ADDRESS) {
      console.error('HEMI_ADDRESS environment variable not set');
      return NextResponse.json(
        { error: 'HEMI_ADDRESS environment variable not set' },
        { status: 500 }
      );
    }

    // Check if database connection is working
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }
    
    // Get current price from token_prices table
    const currentPriceQuery = `
      SELECT usd_price, last_updated
      FROM token_prices 
      WHERE token_address = $1 
      ORDER BY last_updated DESC 
      LIMIT 1
    `;
    
    const currentPriceResult = await pool.query(currentPriceQuery, [HEMI_TOKEN_ADDRESS]);
    
    // Get price history for sparkline (last 24 hours with 4-hour intervals)
    const priceHistoryQuery = `
      SELECT 
        AVG(usd_price) as avg_price,
        DATE_TRUNC('hour', recorded_at) - INTERVAL '0 hours' + 
        (EXTRACT(hour FROM recorded_at)::int / 4) * INTERVAL '4 hours' as four_hour_bucket
      FROM price_history 
      WHERE token_address = $1 
        AND recorded_at >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', recorded_at) - INTERVAL '0 hours' + 
        (EXTRACT(hour FROM recorded_at)::int / 4) * INTERVAL '4 hours'
      ORDER BY four_hour_bucket ASC
      LIMIT 6
    `;
    
    const priceHistoryResult = await pool.query(priceHistoryQuery, [HEMI_TOKEN_ADDRESS]);
    
    // Get price from 24 hours ago for change calculation
    const price24hAgoQuery = `
      SELECT usd_price
      FROM price_history 
      WHERE token_address = $1 
        AND recorded_at <= NOW() - INTERVAL '24 hours'
      ORDER BY recorded_at DESC 
      LIMIT 1
    `;
    
    const price24hAgoResult = await pool.query(price24hAgoQuery, [HEMI_TOKEN_ADDRESS]);
    
    // Process the data
    const currentPrice = currentPriceResult.rows[0];
    const priceHistory = priceHistoryResult.rows;
    const price24hAgo = price24hAgoResult.rows[0];
    
    if (!currentPrice) {
      return NextResponse.json({
        priceUsd: null,
        change24h: null,
        lastUpdated: null,
        sparkline: []
      });
    }
    
    // Calculate 24h change
    let change24h = null;
    if (price24hAgo && currentPrice.usd_price) {
      const current = parseFloat(currentPrice.usd_price);
      const previous = parseFloat(price24hAgo.usd_price);
      change24h = ((current - previous) / previous) * 100;
    }
    
    // Create sparkline data (normalize to array of numbers from hourly averages)
    const sparkline = priceHistory.map(row => parseFloat(row.avg_price));
    
    const responseData = {
      priceUsd: parseFloat(currentPrice.usd_price),
      change24h: change24h,
      lastUpdated: currentPrice.last_updated.toISOString(),
      sparkline: sparkline
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching HEMI price data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch HEMI price data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
