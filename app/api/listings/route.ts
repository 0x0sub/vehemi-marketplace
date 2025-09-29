import { NextRequest, NextResponse } from 'next/server'
import { getActiveListings, getActiveListingsCount, getMarketplaceStats, ListingRow } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items per page
    const sortBy = searchParams.get('sortBy') as 'price' | 'created_at' | 'deadline' || 'created_at'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    
    // Filter parameters
    const minPrice = searchParams.get('minPrice') || undefined
    const maxPrice = searchParams.get('maxPrice') || undefined
    const minVehemiBalance = searchParams.get('minVehemiBalance') || undefined
    const maxVehemiBalance = searchParams.get('maxVehemiBalance') || undefined
    const minLockAmount = searchParams.get('minLockAmount') || undefined
    const maxLockAmount = searchParams.get('maxLockAmount') || undefined
    
    // Check if we need to include stats
    const includeStats = searchParams.get('includeStats') === 'true'

    // Validate parameters
    if (page < 1) {
      return NextResponse.json({ error: 'Page must be greater than 0' }, { status: 400 })
    }
    
    if (!['price', 'created_at', 'deadline'].includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sortBy parameter' }, { status: 400 })
    }
    
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json({ error: 'Invalid sortOrder parameter' }, { status: 400 })
    }

    // Build filter options
    const filterOptions = {
      page,
      limit,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      minVehemiBalance,
      maxVehemiBalance,
      minLockAmount,
      maxLockAmount
    }

    // Remove undefined values
    const cleanOptions = Object.fromEntries(
      Object.entries(filterOptions).filter(([_, value]) => value !== null && value !== undefined)
    )

    // Fetch listings and count in parallel
    const [listings, totalCount] = await Promise.all([
      getActiveListings(cleanOptions),
      getActiveListingsCount({
        minPrice,
        maxPrice,
        minVehemiBalance,
        maxVehemiBalance,
        minLockAmount,
        maxLockAmount
      })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Format response
    const response: any = {
      listings: listings.map((listing: ListingRow) => ({
        id: listing.id,
        tokenId: listing.token_id.toString(),
        sellerAddress: listing.seller_address,
        priceWei: listing.price_wei,
        priceFormatted: listing.price_formatted,
        paymentToken: {
          address: listing.payment_token_address,
          symbol: listing.payment_token_symbol || 'UNKNOWN',
          name: listing.payment_token_name || 'Unknown Token',
          decimals: listing.payment_token_decimals || 18
        },
        durationSeconds: listing.duration_seconds,
        deadlineTimestamp: listing.deadline_timestamp,
        createdAtTimestamp: listing.created_at_timestamp,
        transactionHash: listing.transaction_hash,
        blockNumber: listing.block_number,
        usdValue: listing.usd_value || null,
        hemiPrice: listing.hemi_usd_price || null,
        nftToken: {
          vehemiBalanceWei: listing.vehemi_balance_wei || null,
          vehemiBalanceFormatted: listing.vehemi_balance_formatted || null,
          lockedAmountWei: listing.locked_amount_wei || null,
          lockedAmountFormatted: listing.locked_amount_formatted || null,
          lockEndTimestamp: listing.lock_end_timestamp || null,
          ownerAddress: listing.owner_address || null
        }
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        minVehemiBalance,
        maxVehemiBalance,
        minLockAmount,
        maxLockAmount
      }
    }

    // Include marketplace stats if requested
    if (includeStats) {
      const stats = await getMarketplaceStats()
      response.stats = {
        totalListings: parseInt(stats.total_listings),
        activeListings: parseInt(stats.active_listings),
        soldListings: parseInt(stats.sold_listings),
        cancelledListings: parseInt(stats.cancelled_listings),
        expiredListings: parseInt(stats.expired_listings),
        totalVolumeWei: stats.total_volume_wei,
        averagePriceWei: stats.average_price_wei,
        uniqueSellers: parseInt(stats.unique_sellers),
        uniqueBuyers: parseInt(stats.unique_buyers)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching active listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active listings' },
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
