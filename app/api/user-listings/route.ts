import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, tokenIds } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 })
    }

    // If no tokenIds provided, get all user's listings
    if (!tokenIds || tokenIds.length === 0) {
      const sqlQuery = `
        SELECT 
          l.token_id,
          l.seller_address,
          l.price_wei,
          l.price_formatted,
          l.payment_token_address,
          l.deadline_timestamp,
          l.created_at_timestamp,
          l.status,
          pt.token_symbol as payment_token_symbol,
          pt.token_name as payment_token_name,
          pt.decimals as payment_token_decimals
        FROM listings l
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        LEFT JOIN nft_tokens n ON l.token_id = n.token_id
        WHERE l.seller_address = $1 
          AND l.status = 'active'
          AND l.deadline_timestamp > NOW()
          AND COALESCE(n.blacklist, false) = false
        ORDER BY l.created_at_timestamp DESC
      `

      const result = await query(sqlQuery, [walletAddress])
      return NextResponse.json({ listings: result.rows })
    }

    // If tokenIds provided, check specific tokens
    const placeholders = tokenIds.map((_: any, index: number) => `$${index + 2}`).join(',')
    const sqlQuery = `
      SELECT 
        l.token_id,
        l.seller_address,
        l.price_wei,
        l.price_formatted,
        l.payment_token_address,
        l.deadline_timestamp,
        l.created_at_timestamp,
        l.status,
        pt.token_symbol as payment_token_symbol,
        pt.token_name as payment_token_name,
        pt.decimals as payment_token_decimals
      FROM listings l
      LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
      LEFT JOIN nft_tokens n ON l.token_id = n.token_id
      WHERE l.seller_address = $1 
        AND l.token_id IN (${placeholders})
        AND l.status = 'active'
        AND l.deadline_timestamp > NOW()
        AND COALESCE(n.blacklist, false) = false
      ORDER BY l.created_at_timestamp DESC
    `

    const params = [walletAddress, ...tokenIds]
    const result = await query(sqlQuery, params)
    
    // Convert to object keyed by token_id for easy lookup
    const listings: Record<string, any> = {}
    result.rows.forEach((row: any) => {
      listings[row.token_id] = {
        tokenId: row.token_id,
        seller: row.seller_address,
        price: row.price_wei,
        priceFormatted: row.price_formatted,
        paymentToken: row.payment_token_address,
        paymentTokenSymbol: row.payment_token_symbol,
        paymentTokenName: row.payment_token_name,
        paymentTokenDecimals: row.payment_token_decimals,
        deadline: row.deadline_timestamp,
        createdAt: row.created_at_timestamp,
        isActive: row.status === 'active'
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return NextResponse.json({ error: 'Failed to fetch user listings' }, { status: 500 })
  }
}
