import { NextRequest, NextResponse } from 'next/server'
import { getListingByTokenId } from '@/lib/database'
import { query } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params

    // Validate token ID
    if (!tokenId || isNaN(parseInt(tokenId))) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 })
    }

    // Fetch the listing
    const listing = await getListingByTokenId(tokenId)

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Format response
    const response = {
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
      status: listing.status,
      transactionHash: listing.transaction_hash,
      blockNumber: listing.block_number,
      nftToken: {
        vehemiBalanceWei: listing.vehemi_balance_wei || null,
        vehemiBalanceFormatted: listing.vehemi_balance_formatted || null,
        lockedAmountWei: listing.locked_amount_wei || null,
        lockedAmountFormatted: listing.locked_amount_formatted || null,
        lockEndTimestamp: listing.lock_end_timestamp || null,
        ownerAddress: listing.owner_address || null
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
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
