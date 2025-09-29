import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi, Address } from 'viem'
import { hemiSepolia } from 'hemi-viem'

const VEHEMI_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getLockedBalance(uint256 tokenId) view returns (int128 amount, uint64 end)'
])

export async function POST(request: NextRequest) {
  try {
    const { owner, contractAddress } = await request.json()

    if (!owner || !contractAddress) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const client = createPublicClient({
      chain: hemiSepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.rpc.hemi.network/rpc')
    })

    // Fetch Transfer logs to discover tokenIds interacted with this owner
    const logs = await client.getLogs({
      address: contractAddress as Address,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: true, name: 'to', type: 'address' },
          { indexed: true, name: 'tokenId', type: 'uint256' },
        ],
      },
      args: {
        from: undefined,
        to: undefined,
        tokenId: undefined,
      },
      fromBlock: 0n,
      toBlock: 'latest'
    })

    const candidateTokenIds = new Set<string>()
    for (const log of logs) {
      const tokenId = (log as any).args?.tokenId as bigint | undefined
      const to = (log as any).args?.to as string | undefined
      const from = (log as any).args?.from as string | undefined
      if (tokenId !== undefined) {
        // Only consider tokens that ever touched this owner
        if (to?.toLowerCase() === (owner as string).toLowerCase() || from?.toLowerCase() === (owner as string).toLowerCase()) {
          candidateTokenIds.add(tokenId.toString())
        }
      }
    }

    const owned: Array<{ tokenId: string; lockedAmount: string; lockEndTime: number }> = []

    // Verify current ownership and fetch data
    for (const tokenIdStr of candidateTokenIds) {
      const tokenId = BigInt(tokenIdStr)
      try {
        const currentOwner = await client.readContract({
          address: contractAddress as Address,
          abi: VEHEMI_ABI,
          functionName: 'ownerOf',
          args: [tokenId]
        }) as string

        if (currentOwner.toLowerCase() !== (owner as string).toLowerCase()) continue

        const locked = await client.readContract({
          address: contractAddress as Address,
          abi: VEHEMI_ABI,
          functionName: 'getLockedBalance',
          args: [tokenId]
        }) as readonly [bigint, bigint]

        owned.push({
          tokenId: tokenIdStr,
          lockedAmount: locked[0].toString(),
          lockEndTime: Number(locked[1])
        })
      } catch (err) {
        // ignore token if any read fails
      }
    }

    return NextResponse.json({ positions: owned })
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}


