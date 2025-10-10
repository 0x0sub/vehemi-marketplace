'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  ExternalLink,
  ArrowLeft,
  Loader2,
  Sparkles,
  FileText,
  ArrowRightLeft,
  ShoppingCart,
  X as XIcon
} from 'lucide-react'
import { CONTRACTS, VEHEMI_ABI } from '@/lib/contracts'
import { TokenPurchaseModal } from '@/components/TokenPurchaseModal'
import Link from 'next/link'
import * as React from 'react'

interface PositionData {
  tokenId: string
  ownerAddress: string
  providerAddress: string
  vehemiBalance: {
    wei: string
    formatted: string
  }
  lockedAmount: {
    wei: string
    formatted: string
  }
  lockStartTimestamp: string
  lockEndTimestamp: string
  initialLockDuration: number | null
  status: string
  closedAtTimestamp: string | null
  transferable: boolean
  forfeitable: boolean
  createdAtTimestamp: string
  isListed: boolean
  currentListing: {
    id: number
    sellerAddress: string
    priceWei: string
    priceFormatted: string
    paymentToken: {
      address: string
      symbol: string
      name: string
      decimals: number
    }
    durationSeconds: number
    deadlineTimestamp: string
    createdAtTimestamp: string
    transactionHash: string
    tokenUsdPrice: number | null
    usdValue: number | null
    hemiPrice: number | null
  } | null
}

interface EventData {
  eventName: string
  transactionHash: string
  blockNumber: number
  blockTimestamp: string
  contractAddress: string
  logIndex: number
  [key: string]: any
}

export default function PositionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { address: userAddress, isConnected } = useAccount()
  const tokenId = params?.id as string

  const [position, setPosition] = useState<PositionData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  // Fetch current voting power from contract
  const { data: votingPowerData, isLoading: votingPowerLoading } = useReadContract({
    address: CONTRACTS.VEHEMI,
    abi: VEHEMI_ABI,
    functionName: 'balanceOfNFT',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: Boolean(tokenId),
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  })

  const votingPower = votingPowerData ? formatUnits(votingPowerData as bigint, 18) : null

  // Fetch position data
  useEffect(() => {
    if (!tokenId) return

    const fetchPosition = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/position/${tokenId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Position not found')
          } else {
            throw new Error('Failed to fetch position')
          }
          return
        }

        const data = await response.json()
        setPosition(data)
      } catch (err) {
        console.error('Error fetching position:', err)
        setError('Failed to load position data')
      } finally {
        setLoading(false)
      }
    }

    fetchPosition()
  }, [tokenId])

  // Fetch events
  useEffect(() => {
    if (!tokenId) return

    const fetchEvents = async () => {
      try {
        setEventsLoading(true)
        // Always fetch all events - filtering is done on frontend
        const url = `/api/position/${tokenId}/events`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        setEvents(data.events)
        setEventTypes(['all', ...data.eventTypes])
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [tokenId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2599EE]" />
          <p className="text-muted-foreground">Loading position details...</p>
        </div>
      </div>
    )
  }

  if (error || !position) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Position Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The requested position does not exist.'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const years = Math.floor(days / 365)
    const remainingDays = days % 365
    
    if (years > 0) {
      return remainingDays > 0 
        ? `${years}y ${remainingDays}d`
        : `${years} year${years > 1 ? 's' : ''}`
    }
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOwner = userAddress && position.ownerAddress.toLowerCase() === userAddress.toLowerCase()

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>

        {/* Header with Logo */}
        <div className="mb-8 relative">
          {/* Background gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2599EE]/10 via-blue-500/10 to-emerald-500/10 rounded-3xl blur-3xl -z-10"></div>
          
          <div className="flex items-start gap-6 bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur-xl border border-[#2599EE]/20 rounded-2xl p-6 shadow-2xl shadow-[#2599EE]/20">
            {/* veHEMI Logo */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2599EE]/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-[#2599EE]/30 shadow-lg">
                  <img 
                    src="/vehemi-logo.svg" 
                    alt="veHEMI" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Title and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  veHEMI #{tokenId}
                </h1>
                <Badge 
                  variant={position.isListed ? "default" : "secondary"}
                  className={position.isListed 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-3 py-1" 
                    : "bg-slate-700/50 text-slate-400 border-slate-600/50 px-3 py-1"
                  }
                >
                  {position.isListed ? "🟢 Listed" : "⚪ Not Listed"}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Owner: </span>
                  <a 
                    href={`https://explorer.hemi.xyz/address/${position.ownerAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-[#2599EE] transition-colors"
                  >
                    {position.ownerAddress.slice(0, 6)}...{position.ownerAddress.slice(-4)}
                  </a>
                </div>
                {isOwner && (
                  <div className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full text-slate-300 font-medium">
                    👤 You own this position
                  </div>
                )}

                {/* Buy Button in Header - Only show if listed and not owner */}
                {position.isListed && position.currentListing && isConnected && !isOwner && (
                  <div className="ml-auto flex items-center">
                    <button 
                      onClick={() => setShowPurchaseModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 transition-all"
                    >
                      Buy Now
                    </button>
                  </div>
                )}

                {/* Connect Wallet - Only show if listed and not connected */}
                {position.isListed && position.currentListing && !isConnected && (
                  <div className="ml-auto flex items-center">
                    <Button 
                      className="px-4 py-2.5 text-sm font-semibold"
                      variant="outline"
                    >
                      Connect Wallet to Buy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
            {/* Main Position Info */}
            <Card className="border-[#2599EE]/30 bg-gradient-to-br from-slate-900/95 via-[#2599EE]/5 to-slate-950/95 backdrop-blur-xl shadow-2xl shadow-[#2599EE]/20 overflow-hidden relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2599EE]/10 to-transparent rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl -z-10"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-[#2599EE]/20 to-blue-500/20 rounded-lg">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  veHEMI #{tokenId} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Position Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Locked HEMI Amount */}
                  <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <div className="text-sm text-slate-400 mb-2 font-medium">Locked HEMI</div>
                    <div className="text-3xl font-bold text-white">
                      {parseFloat(position.lockedAmount.formatted).toLocaleString(undefined, {
                        maximumFractionDigits: 2
                      })} HEMI
                    </div>
                  </div>

                  {/* Voting Power */}
                  <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Current Voting Power
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {votingPowerLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      ) : votingPower ? (
                        `${parseFloat(votingPower).toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        })} veHEMI`
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>

                  {/* Initial Lockup Period */}
                  {position.initialLockDuration && (
                    <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" />
                        Initial Lockup Period
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatDuration(position.initialLockDuration)}
                      </div>
                    </div>
                  )}

                  {/* Unlock Date */}
                  <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4" />
                      Unlock Date
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatDate(position.lockEndTimestamp)}
                    </div>
                  </div>
                </div>

                {/* Separator - Only show if listed */}
                {position.isListed && position.currentListing && (
                  <div className="w-full border-t border-slate-700/50"></div>
                )}

                {/* Listing Info Section - Only show if listed */}
                {position.isListed && position.currentListing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Listing Price */}
                    <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 font-medium">
                        <Coins className="h-4 w-4" />
                        Listing Price
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-white">
                          {parseFloat(position.currentListing.priceFormatted).toLocaleString(undefined, {
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <img 
                          src={position.currentListing.paymentToken.symbol === 'USDC' ? '/usdc-logo.svg' : '/hemi-logo.svg'}
                          alt={position.currentListing.paymentToken.symbol}
                          className="w-6 h-6"
                        />
                        <div className="text-2xl font-bold text-slate-400">
                          {position.currentListing.paymentToken.symbol}
                        </div>
                      </div>
                      {position.currentListing.usdValue && (
                        <div className="text-sm text-slate-400 mt-1">
                          ≈ ${Math.round(position.currentListing.usdValue).toLocaleString()} USD
                        </div>
                      )}
                    </div>

                    {/* Price per HEMI */}
                    <div className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <div className="text-sm text-slate-400 mb-2 flex items-center gap-2 font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Price per HEMI
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-2xl font-bold text-white">
                          {(() => {
                            const lockedHemi = parseFloat(position.lockedAmount.formatted)
                            const priceUsd = position.currentListing.usdValue || 0
                            const pricePerHemi = lockedHemi > 0 ? priceUsd / lockedHemi : 0
                            return `$${pricePerHemi.toFixed(4)}`
                          })()}
                        </div>
                        {position.currentListing.hemiPrice && (
                          <>
                            {(() => {
                              const hemiSpotPrice = position.currentListing.hemiPrice
                              const lockedHemi = parseFloat(position.lockedAmount.formatted)
                              const priceUsd = position.currentListing.usdValue || 0
                              const pricePerHemi = lockedHemi > 0 ? priceUsd / lockedHemi : 0
                              // Calculate percentage: positive = premium, negative = discount
                              const percentVsSpot = hemiSpotPrice > 0 ? ((pricePerHemi - hemiSpotPrice) / hemiSpotPrice * 100) : 0
                              
                              if (percentVsSpot < 0) {
                                // Discount (cheaper than spot) - show in green
                                return (
                                  <div className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                    {percentVsSpot.toFixed(1)}% vs spot
                                  </div>
                                )
                              } else if (percentVsSpot > 0) {
                                // Premium (more expensive than spot) - show in red
                                return (
                                  <div className="inline-flex items-center rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                    +{percentVsSpot.toFixed(1)}% vs spot
                                  </div>
                                )
                              }
                              return (
                                <div className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-3 py-1 text-xs font-medium text-slate-400">
                                  At spot price
                                </div>
                              )
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event History */}
            <Card className="border-[#2599EE]/30 bg-gradient-to-br from-slate-900/95 via-[#2599EE]/5 to-slate-950/95 backdrop-blur-xl shadow-2xl shadow-[#2599EE]/20 overflow-hidden relative">
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#2599EE]/10 to-transparent rounded-full blur-3xl -z-10"></div>
              
              <CardHeader>
                <CardTitle className="text-2xl">Activity History</CardTitle>
                <CardDescription className="text-slate-400">All events related to this position</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Event Type Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={selectedEventType === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedEventType === 'Mint' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('Mint')}
                    className="gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Mint
                  </Button>
                  <Button
                    variant={selectedEventType === 'NFTListed' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('NFTListed')}
                    className="gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Listing
                  </Button>
                  <Button
                    variant={selectedEventType === 'Transfer' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('Transfer')}
                    className="gap-1.5"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transfer
                  </Button>
                  <Button
                    variant={selectedEventType === 'NFTSold' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('NFTSold')}
                    className="gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Sale
                  </Button>
                  <Button
                    variant={selectedEventType === 'ListingCancelled' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEventType('ListingCancelled')}
                    className="gap-1.5"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>

                {/* Events Table */}
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#2599EE]" />
                    <p className="text-sm text-muted-foreground">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found for this position.
                  </div>
                ) : (
                  <EventsTable 
                    events={events} 
                    selectedFilter={selectedEventType}
                  />
                )}
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Purchase Modal */}
      {position.isListed && position.currentListing && (
        <TokenPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          tokenId={tokenId}
          connectedUser={userAddress}
        />
      )}
    </>
  )
}

// Events Table Component
function EventsTable({ events, selectedFilter }: { 
  events: EventData[], 
  selectedFilter: string
}) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date().getTime()
    const eventTime = new Date(timestamp).getTime()
    const diffInSeconds = Math.floor((now - eventTime) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else if (diffInSeconds < 172800) { // Less than 2 days
      return '1 day ago'
    } else if (diffInSeconds < 604800) { // Less than 7 days
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} days ago`
    } else {
      // For older events, show the actual date
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const shortenAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return '-'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Group events - combine Lock, Deposit, and Transfer(from 0x000) into "Mint"
  const processedEvents = React.useMemo(() => {
    const result: any[] = []
    const eventsByTx: Record<string, EventData[]> = {}
    
    // Group events by transaction hash
    events.forEach(event => {
      if (!eventsByTx[event.transactionHash]) {
        eventsByTx[event.transactionHash] = []
      }
      eventsByTx[event.transactionHash].push(event)
    })
    
    // Process each transaction's events
    Object.entries(eventsByTx).forEach(([txHash, txEvents]) => {
      const lockEvent = txEvents.find(e => e.eventName === 'Lock')
      const depositEvent = txEvents.find(e => e.eventName === 'Deposit')
      const mintTransferEvent = txEvents.find(e => 
        e.eventName === 'Transfer' && 
        e.from && 
        e.from.toLowerCase() === '0x0000000000000000000000000000000000000000'
      )
      const saleEvent = txEvents.find(e => e.eventName === 'NFTSold')
      
      // If we have Lock + Transfer from 0x000, it's a mint
      if (lockEvent && mintTransferEvent) {
        result.push({
          type: 'Mint',
          price: null,
          from: null,
          to: mintTransferEvent.to,
          timestamp: lockEvent.blockTimestamp,
          transactionHash: lockEvent.transactionHash,
          blockNumber: lockEvent.blockNumber,
          tokenId: lockEvent.tokenId
        })
      } else {
        // Process other events normally
        txEvents.forEach(event => {
          if (event.eventName === 'Lock' || event.eventName === 'Deposit') {
            // Skip if already processed as mint
            return
          }
          
          if (event.eventName === 'Transfer' && 
              event.from?.toLowerCase() === '0x0000000000000000000000000000000000000000') {
            // Skip if already processed as mint
            return
          }
          
          // Skip Transfer events if there's a Sale in the same transaction
          if (event.eventName === 'Transfer' && saleEvent) {
            return
          }
          
          if (event.eventName === 'NFTListed') {
            result.push({
              type: 'Listing',
              price: event.priceFormatted,
              paymentTokenSymbol: event.paymentTokenSymbol,
              from: event.seller,
              to: null,
              timestamp: event.blockTimestamp,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              tokenId: event.tokenId
            })
          } else if (event.eventName === 'NFTSold') {
            result.push({
              type: 'Sale',
              price: event.priceFormatted,
              paymentTokenSymbol: event.paymentTokenSymbol,
              from: event.seller,
              to: event.buyer,
              timestamp: event.blockTimestamp,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              tokenId: event.tokenId
            })
          } else if (event.eventName === 'ListingCancelled') {
            result.push({
              type: 'Cancel',
              price: null,
              from: event.seller,
              to: null,
              timestamp: event.blockTimestamp,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              tokenId: event.tokenId
            })
          } else if (event.eventName === 'Transfer') {
            result.push({
              type: 'Transfer',
              price: null,
              from: event.from,
              to: event.to,
              timestamp: event.blockTimestamp,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              tokenId: event.tokenId
            })
          }
        })
      }
    })
    
    // Sort by timestamp (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Filter by selected type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'Mint') {
        return result.filter(e => e.type === 'Mint')
      } else if (selectedFilter === 'NFTListed') {
        return result.filter(e => e.type === 'Listing')
      } else if (selectedFilter === 'NFTSold') {
        return result.filter(e => e.type === 'Sale')
      } else if (selectedFilter === 'ListingCancelled') {
        return result.filter(e => e.type === 'Cancel')
      } else if (selectedFilter === 'Transfer') {
        return result.filter(e => e.type === 'Transfer')
      }
    }
    
    return result
  }, [events, selectedFilter])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Mint':
        return <Sparkles className="h-3.5 w-3.5" />
      case 'Listing':
        return <FileText className="h-3.5 w-3.5" />
      case 'Sale':
        return <ShoppingCart className="h-3.5 w-3.5" />
      case 'Cancel':
        return <XIcon className="h-3.5 w-3.5" />
      case 'Transfer':
        return <ArrowRightLeft className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Event</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Price</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">From</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">To</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">TX</th>
            </tr>
          </thead>
          <tbody>
            {processedEvents.map((event, index) => (
              <tr 
                key={`${event.transactionHash}-${index}`}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700/50 gap-1.5">
                    {getEventIcon(event.type)}
                    {event.type}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm">
                  {event.price ? (
                    <span className="font-mono">
                      {parseFloat(event.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      {event.paymentTokenSymbol && <span className="text-muted-foreground ml-1">{event.paymentTokenSymbol}</span>}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">
                  {event.from ? (
                    <a 
                      href={`https://explorer.hemi.xyz/address/${event.from}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono hover:text-[#2599EE] transition-colors"
                    >
                      {shortenAddress(event.from)}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">
                  {event.to ? (
                    <a 
                      href={`https://explorer.hemi.xyz/address/${event.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono hover:text-[#2599EE] transition-colors"
                    >
                      {shortenAddress(event.to)}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  <div className="relative group">
                    {getRelativeTime(event.timestamp)}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-300 whitespace-nowrap z-10 pointer-events-none shadow-lg border border-slate-700">
                      {formatDate(event.timestamp)}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <a 
                    href={`https://explorer.hemi.xyz/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {processedEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No {selectedFilter !== 'all' ? selectedFilter.toLowerCase() : ''} events found.
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {processedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {selectedFilter !== 'all' ? selectedFilter.toLowerCase() : ''} events found.
          </div>
        ) : (
          processedEvents.map((event, index) => (
            <div 
              key={`${event.transactionHash}-${index}`}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700/50 gap-1.5">
                  {getEventIcon(event.type)}
                  {event.type}
                </Badge>
                <a 
                  href={`https://explorer.hemi.xyz/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="space-y-2 text-sm">
                {event.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-mono font-medium">
                      {parseFloat(event.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      {event.paymentTokenSymbol && <span className="text-muted-foreground ml-1">{event.paymentTokenSymbol}</span>}
                    </span>
                  </div>
                )}
                
                {event.from && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">From:</span>
                    <a 
                      href={`https://explorer.hemi.xyz/address/${event.from}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono hover:text-[#2599EE] transition-colors"
                    >
                      {shortenAddress(event.from)}
                    </a>
                  </div>
                )}
                
                {event.to && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">To:</span>
                    <a 
                      href={`https://explorer.hemi.xyz/address/${event.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono hover:text-[#2599EE] transition-colors"
                    >
                      {shortenAddress(event.to)}
                    </a>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700/50">
                  <span className="text-muted-foreground">{getRelativeTime(event.timestamp)}</span>
                  <span className="text-muted-foreground">{formatDate(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

