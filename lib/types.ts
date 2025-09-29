export interface VeHemiListing {
  tokenId: string
  seller: string
  price: string
  lockedAmount: string
  lockEndTime: number
  timeRemaining: string
  isActive: boolean
  deadline: number
  createdAt: number
}

export interface FilterOptions {
  hemiAmountRange: [number, number]
  unlocksInRange: [number, number]
  unitPriceRange?: [number, number]
  paymentTokens: string[]
  sortBy?: 'price' | 'timeRemaining' | 'hemiAmount'
  sortOrder?: 'asc' | 'desc'
}

export interface TokenInfo {
  balance: bigint
  lockedAmount: bigint
  lockEndTime: bigint
}

export interface ListingData {
  tokenId: bigint
  seller: string
  price: bigint
  deadline: bigint
  isActive: boolean
  createdAt: bigint
}

