import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate token ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 })
    }

    const tokenId = parseInt(id)

    // Fetch position data from nft_tokens table
    const sqlQuery = `
      SELECT 
        n.token_id,
        n.owner_address,
        n.provider_address,
        n.vehemi_balance_wei,
        n.vehemi_balance_formatted,
        n.locked_amount_wei,
        n.locked_amount_formatted,
        n.lock_start_timestamp,
        n.lock_end_timestamp,
        n.status,
        n.closed_at_timestamp,
        n.transferable,
        n.forfeitable,
        n.slope_wei_per_sec,
        n.closure_type,
        n.created_at_timestamp,
        n.is_listed,
        n.current_listing_id,
        l.id as listing_id,
        l.seller_address,
        l.price_wei,
        l.price_formatted,
        l.payment_token_address,
        l.duration_seconds,
        l.deadline_timestamp,
        l.created_at_timestamp as listing_created_at,
        l.transaction_hash as listing_transaction_hash,
        pt.token_symbol as payment_token_symbol,
        pt.token_name as payment_token_name,
        pt.decimals as payment_token_decimals,
        tp.usd_price as token_usd_price,
        (l.price_formatted * tp.usd_price) as usd_value,
        hemi_tp.usd_price as hemi_usd_price
      FROM nft_tokens n
      LEFT JOIN LATERAL (
        SELECT * FROM listings
        WHERE token_id = n.token_id
          AND status = 'active'
          AND deadline_timestamp > NOW()
        ORDER BY created_at_timestamp DESC
        LIMIT 1
      ) l ON true
      LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
      LEFT JOIN token_prices tp ON l.payment_token_address = tp.token_address
      LEFT JOIN token_prices hemi_tp ON hemi_tp.token_address = $2
      WHERE n.token_id = $1
    `

    const hemiContractAddress = process.env.NEXT_PUBLIC_HEMI_CONTRACT || '0x1Ee7476307e923319a12DDF127bcf8BdfAd345A0'
    const result = await query(sqlQuery, [tokenId, hemiContractAddress])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    const row = result.rows[0]

    // Return 404 if position is closed
    if (row.status === 'closed') {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Calculate initial lock duration (in seconds)
    let initialLockDuration = null
    if (row.lock_start_timestamp && row.lock_end_timestamp) {
      const start = new Date(row.lock_start_timestamp).getTime()
      const end = new Date(row.lock_end_timestamp).getTime()
      initialLockDuration = Math.floor((end - start) / 1000)
    }

    // Format response
    const response = {
      tokenId: row.token_id.toString(),
      ownerAddress: row.owner_address,
      providerAddress: row.provider_address,
      vehemiBalance: {
        wei: row.vehemi_balance_wei,
        formatted: row.vehemi_balance_formatted
      },
      lockedAmount: {
        wei: row.locked_amount_wei,
        formatted: row.locked_amount_formatted
      },
      lockStartTimestamp: row.lock_start_timestamp,
      lockEndTimestamp: row.lock_end_timestamp,
      initialLockDuration, // in seconds
      status: row.status,
      closedAtTimestamp: row.closed_at_timestamp,
      transferable: row.transferable,
      forfeitable: row.forfeitable,
      slopeWeiPerSec: row.slope_wei_per_sec,
      closureType: row.closure_type,
      createdAtTimestamp: row.created_at_timestamp,
      isListed: row.is_listed,
      currentListing: row.listing_id ? {
        id: row.listing_id,
        sellerAddress: row.seller_address,
        priceWei: row.price_wei,
        priceFormatted: row.price_formatted,
        paymentToken: {
          address: row.payment_token_address,
          symbol: row.payment_token_symbol,
          name: row.payment_token_name,
          decimals: row.payment_token_decimals
        },
        durationSeconds: row.duration_seconds,
        deadlineTimestamp: row.deadline_timestamp,
        createdAtTimestamp: row.listing_created_at,
        transactionHash: row.listing_transaction_hash,
        tokenUsdPrice: row.token_usd_price,
        usdValue: row.usd_value,
        hemiPrice: row.hemi_usd_price
      } : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { error: 'Failed to fetch position' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}


