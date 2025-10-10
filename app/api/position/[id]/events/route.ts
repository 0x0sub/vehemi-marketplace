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

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const eventTypeFilter = searchParams.get('type') || 'all'

    // Fetch events from events table
    // Events related to this token ID will have the tokenId in decoded_data
    let whereConditions = [
      "(decoded_data->>'tokenId' = $1 OR decoded_data->>'token_id' = $1)"
    ]

    const values: any[] = [tokenId.toString()]

    // Add event type filter if specified
    if (eventTypeFilter !== 'all') {
      whereConditions.push('event_name = $2')
      values.push(eventTypeFilter)
    }

    const sqlQuery = `
      SELECT 
        e.id,
        e.transaction_hash,
        e.log_index,
        e.block_number,
        e.block_timestamp,
        e.contract_address,
        e.event_name,
        e.event_signature,
        e.decoded_data,
        e.created_at,
        pt.decimals as payment_token_decimals,
        pt.token_symbol as payment_token_symbol
      FROM events e
      LEFT JOIN payment_tokens pt ON LOWER(pt.token_address) = LOWER(
        CASE 
          WHEN LENGTH(COALESCE(e.decoded_data->>'paymentToken', e.decoded_data->>'payment_token', '')) > 42 
          THEN '0x' || RIGHT(COALESCE(e.decoded_data->>'paymentToken', e.decoded_data->>'payment_token'), 40)
          ELSE COALESCE(e.decoded_data->>'paymentToken', e.decoded_data->>'payment_token')
        END
      )
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY e.block_timestamp DESC, e.log_index DESC
      LIMIT 100
    `

    const result = await query(sqlQuery, values)

    // Format events for response
    const events = result.rows.map((row: any) => {
      const decodedData = row.decoded_data || {}
      
      // Helper function to clean up payment token address (remove padding zeros)
      const cleanAddress = (address: string) => {
        if (!address) return address
        // If address is longer than 42 chars (0x + 40 hex), extract last 40 chars
        if (address.length > 42) {
          return '0x' + address.slice(-40)
        }
        return address
      }
      
      // Helper function to format price with correct decimals
      const formatPrice = (priceStr: string, decimals: number) => {
        if (!priceStr) return null
        try {
          // Handle both string and number inputs
          const priceNum = typeof priceStr === 'string' ? priceStr : String(priceStr)
          const priceBigInt = BigInt(priceNum)
          const divisor = BigInt(10 ** decimals)
          const formatted = Number(priceBigInt) / Number(divisor)
          return formatted.toString()
        } catch (e) {
          console.error('Error formatting price:', priceStr, decimals, e)
          return null
        }
      }
      
      // Extract relevant fields based on event type
      let eventData: any = {
        eventName: row.event_name,
        transactionHash: row.transaction_hash,
        blockNumber: row.block_number,
        blockTimestamp: row.block_timestamp,
        contractAddress: row.contract_address,
        logIndex: row.log_index
      }

      // Get payment token decimals (default to 18 if not found)
      const decimals = row.payment_token_decimals || 18

      // Add event-specific data
      switch (row.event_name) {
        case 'NFTListed':
          eventData = {
            ...eventData,
            tokenId: decodedData.tokenId || decodedData.token_id,
            seller: decodedData.seller,
            price: decodedData.price,
            priceFormatted: formatPrice(decodedData.price, decimals),
            paymentToken: cleanAddress(decodedData.paymentToken || decodedData.payment_token),
            paymentTokenSymbol: row.payment_token_symbol,
            duration: decodedData.duration,
            deadline: decodedData.deadline
          }
          break

        case 'NFTSold':
          const salePrice = decodedData.price
          const salePaymentToken = cleanAddress(decodedData.paymentToken || decodedData.payment_token)
          
          eventData = {
            ...eventData,
            tokenId: decodedData.tokenId || decodedData.token_id,
            seller: decodedData.seller,
            buyer: decodedData.buyer,
            price: salePrice,
            priceFormatted: formatPrice(salePrice, decimals),
            paymentToken: salePaymentToken,
            paymentTokenSymbol: row.payment_token_symbol,
            paymentTokenDecimals: row.payment_token_decimals,
            platformFee: decodedData.platformFee || decodedData.platform_fee,
            sellerAmount: decodedData.sellerAmount || decodedData.seller_amount
          }
          break

        case 'ListingCancelled':
          eventData = {
            ...eventData,
            tokenId: decodedData.tokenId || decodedData.token_id,
            seller: decodedData.seller
          }
          break

        case 'Transfer':
          eventData = {
            ...eventData,
            tokenId: decodedData.tokenId || decodedData.token_id,
            from: decodedData.from,
            to: decodedData.to
          }
          break

        case 'Lock':
          eventData = {
            ...eventData,
            tokenId: decodedData.tokenId || decodedData.token_id,
            provider: decodedData.provider,
            value: decodedData.value,
            locktime: decodedData.locktime,
            depositType: decodedData.depositType || decodedData.deposit_type,
            ts: decodedData.ts
          }
          break

        default:
          eventData = {
            ...eventData,
            ...decodedData
          }
      }

      return eventData
    })

    // Get unique event types for filter options
    const eventTypes = [...new Set(result.rows.map((row: any) => row.event_name))]

    return NextResponse.json({
      events,
      eventTypes,
      total: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching position events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch position events' },
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

