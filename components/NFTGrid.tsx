'use client'

import { VeHemiListing } from '../lib/types'
import { formatHemi, formatTimeRemaining, truncateAddress } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, Coins, User } from 'lucide-react'

interface NFTGridProps {
  listings: VeHemiListing[]
  onBuyNFT: (tokenId: string, price: string) => void
  userAddress?: string
}

export function NFTGrid({ listings, onBuyNFT, userAddress }: NFTGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
          <p>Try adjusting your filters to see more listings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <NFTCard
          key={listing.tokenId}
          listing={listing}
          onBuyNFT={onBuyNFT}
          userAddress={userAddress}
        />
      ))}
    </div>
  )
}

function NFTCard({ listing, onBuyNFT, userAddress }: {
  listing: VeHemiListing
  onBuyNFT: (tokenId: string, price: string) => void
  userAddress?: string
}) {
  const isOwnListing = userAddress?.toLowerCase() === listing.seller.toLowerCase()
  const isExpired = Date.now() / 1000 > listing.deadline

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">veHemi #{listing.tokenId}</CardTitle>
          {isExpired && (
            <Badge variant="destructive">Expired</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* NFT Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Locked HEMI</span>
            <span className="font-medium">
              {formatHemi(BigInt(listing.lockedAmount))} HEMI
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time Left
            </span>
            <span className="font-medium">
              {formatTimeRemaining(listing.lockEndTime)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Seller
            </span>
            <span className="font-mono text-xs">
              {truncateAddress(listing.seller)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Price</span>
            <span className="text-xl font-bold text-primary">
              {formatHemi(BigInt(listing.price))} HEMI
            </span>
          </div>

          {/* Buy Button */}
          {!isOwnListing && !isExpired && (
            <Button 
              className="w-full" 
              onClick={() => onBuyNFT(listing.tokenId, listing.price)}
            >
              Buy Now
            </Button>
          )}
          
          {isOwnListing && (
            <Button variant="outline" className="w-full" disabled>
              Your Listing
            </Button>
          )}
          
          {isExpired && (
            <Button variant="outline" className="w-full" disabled>
              Listing Expired
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Listed: {new Date(listing.createdAt * 1000).toLocaleDateString()}</div>
          <div>Expires: {new Date(listing.deadline * 1000).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}




