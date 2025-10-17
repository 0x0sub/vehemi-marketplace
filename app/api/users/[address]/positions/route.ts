import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create a singleton Pool. In serverless, module scope persists across invocations.
let pool: Pool | null = null
function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PSQL_SERVER,
      port: process.env.PSQL_SERVER_PORT ? Number(process.env.PSQL_SERVER_PORT) : undefined,
      database: process.env.PSQL_DATABASE,
      user: process.env.PSQL_USER,
      password: process.env.PSQL_PASS,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    })
  }
  return pool
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params
    if (!address || address.length < 10) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') || 'all').toLowerCase() as 'all' | 'listed' | 'unlisted'

    const db = getDb()
    const client = await db.connect()
    try {
      // Base query pulls user's tokens and joins any active listing (if present)
      // Filters:
      //  - status=listed -> n.is_listed = true
      //  - status=unlisted -> n.is_listed = false
      const conditions: string[] = [
        'LOWER(n.owner_address) = LOWER($1)',
        'COALESCE(n.blacklist, false) = false'
      ]
      const values: any[] = [address]

      if (status === 'listed') {
        conditions.push('n.is_listed = TRUE')
      } else if (status === 'unlisted') {
        conditions.push('n.is_listed = FALSE')
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

      const query = `
        SELECT 
          n.token_id,
          n.locked_amount_formatted,
          n.lock_end_timestamp,
          n.is_listed,
          l.price_formatted,
          l.payment_token_address,
          pt.token_symbol as payment_token_symbol,
          l.deadline_timestamp
        FROM nft_tokens n
        LEFT JOIN LATERAL (
          SELECT ls.price_formatted, ls.payment_token_address, ls.deadline_timestamp
          FROM listings ls
          WHERE ls.token_id = n.token_id
            AND ls.status = 'active'
            AND ls.deadline_timestamp > NOW()
          ORDER BY ls.created_at_timestamp DESC
          LIMIT 1
        ) l ON TRUE
        LEFT JOIN payment_tokens pt ON l.payment_token_address = pt.token_address
        ${whereClause}
        ORDER BY n.lock_end_timestamp ASC NULLS LAST, n.token_id ASC
      `

      const res = await client.query(query, values)

      // Shape response for UI
      const positions = res.rows.map((row) => ({
        tokenId: String(row.token_id),
        amountFormatted: Number(row.locked_amount_formatted ?? 0),
        lockEndTimestamp: row.lock_end_timestamp ? new Date(row.lock_end_timestamp).getTime() / 1000 : 0,
        isListed: !!row.is_listed,
        listing: row.price_formatted && row.deadline_timestamp ? {
          priceFormatted: Number(row.price_formatted),
          paymentTokenSymbol: row.payment_token_symbol || null,
          deadlineTimestamp: row.deadline_timestamp ? new Date(row.deadline_timestamp).toISOString() : null
        } : null
      }))

      return NextResponse.json({ positions })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Error fetching user positions:', err)
    return NextResponse.json({ error: 'Failed to fetch user positions' }, { status: 500 })
  }
}


