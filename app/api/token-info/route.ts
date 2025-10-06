import { NextRequest, NextResponse } from 'next/server'
import { getListingByTokenId } from '@/lib/database'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')

    if (!tokenId || isNaN(parseInt(tokenId))) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 })
    }

    const listing = await getListingByTokenId(tokenId)

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Derive fields expected by TokenPurchaseModal
    const paymentToken = {
      address: listing.payment_token_address,
      symbol: listing.payment_token_symbol || 'UNKNOWN',
      name: listing.payment_token_name || 'Unknown Token',
      decimals: listing.payment_token_decimals || 18,
    }

    const hemiAmount = Number(listing.locked_amount_formatted || listing.vehemi_balance_formatted || 0)
    const lockEndTimestamp = listing.lock_end_timestamp ? Number(new Date(listing.lock_end_timestamp).getTime()) : undefined
    const nowMs = Date.now()
    const unlocksInDays = lockEndTimestamp && lockEndTimestamp > nowMs
      ? Math.max(0, Math.ceil((lockEndTimestamp - nowMs) / (24 * 60 * 60 * 1000)))
      : 0

    // Price: prefer formatted numeric if present, else fall back to price_wei with decimals
    let priceNumber: number = 0
    if (listing.price_formatted != null) {
      priceNumber = Number(listing.price_formatted)
    } else if (listing.price_wei != null) {
      const decimals = paymentToken.decimals
      const priceWeiBig = BigInt(listing.price_wei.toString())
      const divisor = 10n ** BigInt(decimals)
      const integer = Number(priceWeiBig / divisor)
      const fraction = Number(priceWeiBig % divisor) / Number(divisor)
      priceNumber = integer + fraction
    }

    // Get current HEMI USD price directly from database
    let hemiUsdPrice: number | undefined = undefined
    try {
      const hemiAddress = process.env.HEMI_ADDRESS
      if (hemiAddress) {
        const priceSql = `
          SELECT usd_price
          FROM token_prices
          WHERE token_address = $1
          ORDER BY last_updated DESC
          LIMIT 1
        `
        const priceResult = await query(priceSql, [hemiAddress])
        const row = priceResult.rows?.[0]
        if (row && row.usd_price != null) {
          const parsed = parseFloat(String(row.usd_price))
          if (!Number.isNaN(parsed)) hemiUsdPrice = parsed
        }
      }
    } catch {
      // non-fatal
    }

    // Compute total USD price user pays
    const usdValue: number | undefined = (() => {
      if (paymentToken.symbol === 'USDC') return priceNumber
      if (typeof hemiUsdPrice === 'number') {
        // Listing priced in HEMI: convert total HEMI price to USD
        return priceNumber * hemiUsdPrice
      }
      return undefined
    })()

    const responseBody = {
      id: listing.id,
      tokenId: listing.token_id?.toString?.() ?? String(tokenId),
      price: priceNumber,
      hemiAmount,
      unlocksIn: unlocksInDays,
      tokenIdString: String(tokenId),
      token_id: listing.token_id,
      imageUrl: '',
      paymentToken,
      sellerAddress: listing.seller_address,
      usdValue,
      hemiPrice: hemiUsdPrice,
      lockStartTimestamp: listing.lock_start_timestamp,
      lockEndTimestamp: listing.lock_end_timestamp,
    }

    return NextResponse.json(responseBody)
  } catch (error) {
    console.error('Error in /api/token-info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token info' },
      { status: 500 }
    )
  }
}

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


