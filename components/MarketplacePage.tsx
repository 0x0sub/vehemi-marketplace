import { useState, useEffect, useMemo } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { TokenListings } from './TokenListings';
import { Pagination } from './Pagination';
import { MarketplaceHeader } from './MarketplaceHeader';
import { Wallet, LogOut, Filter, X } from 'lucide-react';
import { WalletConnectionWrapper } from './WalletConnectionWrapper';
import { useAccount } from 'wagmi';

// Utility function to format lockup duration in a user-friendly way
const formatLockupDuration = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

// Utility function to format unlock date with time
const formatUnlockDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility function to format lockup start date with time
const formatLockupStartDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface VeHemiToken {
  id: string;
  price: number;
  hemiAmount: number;
  unlocksIn: number; // in days
  tokenId: string;
  imageUrl: string;
  usdValue?: number;
  hemiPrice?: number;
  paymentToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  sellerAddress?: string;
  lockStartTimestamp?: string;
  lockEndTimestamp?: string;
  lockupDuration?: number; // in seconds
}
interface FilterState {
  hemiAmountRange: [number, number];
  unlocksInRange: [number, number];
  unitPriceRange?: [number, number];
  paymentTokens: string[];
}
interface SortOption {
  field: keyof Pick<VeHemiToken, 'price' | 'hemiAmount' | 'unlocksIn' | 'tokenId'> | 'unitPrice';
  direction: 'asc' | 'desc';
}
// API response interface
interface ApiListing {
  id: number;
  tokenId: string;
  sellerAddress: string;
  priceWei: string;
  priceFormatted: string;
  paymentToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  durationSeconds: number;
  deadlineTimestamp: string;
  createdAtTimestamp: string;
  status: string;
  usdValue?: number;
  hemiPrice?: number;
  nftToken: {
    vehemiBalanceWei?: string;
    vehemiBalanceFormatted?: string;
    lockedAmountWei?: string;
    lockedAmountFormatted?: string;
    lockStartTimestamp?: string;
    lockEndTimestamp?: string;
    lockupDuration?: number;
    ownerAddress?: string;
  };
}

// @component: MarketplacePage
export const MarketplacePage = () => {
  const { address } = useAccount();
  const [filters, setFilters] = useState<FilterState>({
    hemiAmountRange: [0, 100000],
    unlocksInRange: [0, 1500],
    paymentTokens: ['HEMI', 'USDC']
  });
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'unitPrice',
    direction: 'asc'
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [allTokens, setAllTokens] = useState<VeHemiToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hemiPriceData, setHemiPriceData] = useState<{
    priceUsd: number | null;
    change24h: number | null;
    lastUpdated: string | null;
    sparkline: number[];
  }>({
    priceUsd: null,
    change24h: null,
    lastUpdated: null,
    sparkline: []
  });
  const [statsData, setStatsData] = useState<{
    salesCount: number;
    totalHemiLocked: number;
    totalUsdValue: number;
  } | null>(null);

  // Fetch HEMI price data
  const fetchHemiPriceData = async () => {
    try {
      const response = await fetch('/api/hemi-price');
      if (response.ok) {
        const data = await response.json();
        setHemiPriceData({
          priceUsd: data.priceUsd,
          change24h: data.change24h,
          lastUpdated: data.lastUpdated,
          sparkline: data.sparkline || []
        });
      }
    } catch (err) {
      console.error('Error fetching HEMI price data:', err);
    }
  };

  // Fetch ALL listings from API (no pagination, get everything)
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ includeStats: 'true', limit: '1000' }); // Get a large number to get all results
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      
      // Transform API response to match VeHemiToken interface
      const transformedTokens: VeHemiToken[] = data.listings.map((listing: ApiListing) => {
        // Calculate remaining time until unlock from current time to unlock timestamp
        let unlocksIn = 0;
        if (listing.nftToken.lockEndTimestamp) {
          const lockEndTime = new Date(listing.nftToken.lockEndTimestamp).getTime() / 1000;
          const now = Date.now() / 1000;
          unlocksIn = lockEndTime > now ? Math.ceil((lockEndTime - now) / (24 * 60 * 60)) : 0;
        }
        
        const transformed: VeHemiToken = {
          id: listing.tokenId,
          price: parseFloat(listing.priceFormatted),
          hemiAmount: listing.nftToken.lockedAmountFormatted 
            ? parseFloat(listing.nftToken.lockedAmountFormatted) 
            : 0,
          unlocksIn: unlocksIn,
          tokenId: listing.tokenId,
          imageUrl: '/api/placeholder/280/200', // Placeholder for now
          usdValue: typeof listing.usdValue === 'number' ? listing.usdValue : parseFloat(listing.usdValue || '0'),
          hemiPrice: typeof listing.hemiPrice === 'number' ? listing.hemiPrice : parseFloat(listing.hemiPrice || '0'),
          paymentToken: {
            address: listing.paymentToken.address,
            symbol: listing.paymentToken.symbol,
            name: listing.paymentToken.name,
            decimals: listing.paymentToken.decimals
          },
          sellerAddress: listing.sellerAddress,
          lockStartTimestamp: listing.nftToken.lockStartTimestamp,
          lockEndTimestamp: listing.nftToken.lockEndTimestamp,
          lockupDuration: listing.nftToken.lockupDuration
        };
        
        return transformed;
      });
      
      setAllTokens(transformedTokens);
      setTotalCount(transformedTokens.length);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      setAllTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 30d stats data
  const fetchStatsData = async () => {
    try {
      const response = await fetch('/api/stats/30d');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStatsData(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching stats data:', err);
    }
  };

  // Fetch listings and price data on component mount
  useEffect(() => {
    fetchListings();
    fetchHemiPriceData();
    fetchStatsData();
  }, []);

  // Apply/Reset from sidebar → client-side filtering
  const handleApplyFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filteredAndSortedTokens = useMemo(() => {
    // Apply client-side filtering
    let filtered = allTokens.filter(token => {
      // Add defensive checks to prevent undefined access
      if (!filters.hemiAmountRange || !filters.unlocksInRange || !filters.paymentTokens) {
        return false;
      }
      
      const hemiAmountOk = token.hemiAmount >= filters.hemiAmountRange[0] && token.hemiAmount <= filters.hemiAmountRange[1];
      const unlocksInOk = token.unlocksIn >= filters.unlocksInRange[0] && token.unlocksIn <= filters.unlocksInRange[1];
      const paymentTokenOk = filters.paymentTokens.includes(token.paymentToken.symbol);
      
      const base = hemiAmountOk && unlocksInOk && paymentTokenOk;
      if (!base) return false;
      
      // Calculate unit price in USD: usdValue / hemiAmount
      const unitPriceUSD = token.hemiAmount > 0 && token.usdValue ? token.usdValue / token.hemiAmount : 0;
      if (filters.unitPriceRange) {
        return unitPriceUSD >= filters.unitPriceRange[0] && unitPriceUSD <= filters.unitPriceRange[1];
      }
      return true;
    });
    
    // Apply sorting
    const sorted = filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      if (sortOption.field === 'unitPrice') {
        // Calculate USD value per 1 HEMI for proper comparison across payment tokens
        aVal = a.hemiAmount > 0 && a.usdValue ? a.usdValue / a.hemiAmount : 0;
        bVal = b.hemiAmount > 0 && b.usdValue ? b.usdValue / b.hemiAmount : 0;
      } else if (sortOption.field === 'price') {
        // Sort by USD value instead of raw price for proper comparison across payment tokens
        aVal = a.usdValue || 0;
        bVal = b.usdValue || 0;
      } else if (sortOption.field === 'tokenId') {
        aVal = parseInt(a.tokenId);
        bVal = parseInt(b.tokenId);
      } else {
        aVal = a[sortOption.field];
        bVal = b[sortOption.field];
      }
      
      return sortOption.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Apply client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTokens = sorted.slice(startIndex, endIndex);
    
    return paginatedTokens;
  }, [allTokens, filters, sortOption, page, limit]);

  // @return
  return <div>
      <main className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 mx-auto max-w-screen-2xl">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Filter Toggle Button - Visible on mobile/tablet/laptop, hidden on xl+ (1440px+) */}
          <div className="xl:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[color:var(--card)] border border-slate-800/80 rounded-xl text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {mobileFiltersOpen ? <X className="w-4 h-4" /> : null}
            </button>
          </div>

          {/* Backdrop overlay for mobile/tablet/laptop when filters are open */}
          {mobileFiltersOpen && (
            <div 
              className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Filter Sidebar */}
          {/* On mobile/tablet/laptop (< xl): Fixed overlay panel */}
          {/* On desktop (xl+): Inline sidebar */}
          <aside className={`
            ${mobileFiltersOpen ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'}
            xl:relative xl:block xl:w-80 xl:flex-shrink-0
            bg-[color:var(--background)] xl:bg-transparent
            overflow-y-auto
            transition-transform duration-300 ease-in-out
          `}>
            <div className="xl:hidden flex items-center justify-between p-4 border-b border-slate-800/80">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 xl:p-0">
              <FilterSidebar 
                filters={filters} 
                onFiltersChange={handleApplyFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </div>
          </aside>
          
          <section className="flex-1 min-w-0">
            {loading ? (
              <>
                {/* Heading + stats skeleton */}
                <div className="mb-6">
                  <div className="h-7 w-64 bg-slate-800/60 rounded-md animate-pulse" />
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-5 w-40 bg-slate-800/50 rounded-full animate-pulse" />
                    <div className="h-5 w-28 bg-slate-800/50 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Price pill skeleton */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/60 px-4 py-2">
                    <div className="h-4 w-24 bg-slate-800/60 rounded-md animate-pulse" />
                    <div className="h-4 w-16 bg-slate-800/60 rounded-md animate-pulse" />
                  </div>
                </div>

                {/* Listings grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-800/70 bg-[color:var(--card)] overflow-hidden">
                      <div className="h-40 bg-slate-800/50 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 w-28 bg-slate-800/60 rounded-md animate-pulse" />
                        <div className="h-4 w-36 bg-slate-800/50 rounded-md animate-pulse" />
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-20 bg-slate-800/50 rounded-md animate-pulse" />
                          <div className="h-6 w-16 bg-slate-800/50 rounded-md animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination skeleton */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <div className="h-8 w-24 bg-slate-800/60 rounded-md animate-pulse" />
                  <div className="h-8 w-8 bg-slate-800/60 rounded-md animate-pulse" />
                  <div className="h-8 w-8 bg-slate-800/60 rounded-md animate-pulse" />
                  <div className="h-8 w-24 bg-slate-800/60 rounded-md animate-pulse" />
                </div>
              </>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-400 mb-4">Error: {error}</p>
                  <button 
                    onClick={() => fetchListings()}
                    className="px-4 py-2 bg-[color:var(--hemi-orange)] text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <TokenListings 
                  tokens={filteredAndSortedTokens} 
                  sortOption={sortOption} 
                  onSortChange={setSortOption} 
                  totalCount={allTokens.filter(token => {
                    // Add defensive checks to prevent undefined access
                    if (!filters.hemiAmountRange || !filters.unlocksInRange || !filters.paymentTokens) {
                      return false;
                    }
                    
                    const hemiAmountOk = token.hemiAmount >= filters.hemiAmountRange[0] && token.hemiAmount <= filters.hemiAmountRange[1];
                    const unlocksInOk = token.unlocksIn >= filters.unlocksInRange[0] && token.unlocksIn <= filters.unlocksInRange[1];
                    const paymentTokenOk = filters.paymentTokens.includes(token.paymentToken.symbol);
                    const base = hemiAmountOk && unlocksInOk && paymentTokenOk;
                    if (!base) return false;
                    const unitPriceUSD = token.hemiAmount > 0 && token.usdValue ? token.usdValue / token.hemiAmount : 0;
                    if (filters.unitPriceRange) {
                      return unitPriceUSD >= filters.unitPriceRange[0] && unitPriceUSD <= filters.unitPriceRange[1];
                    }
                    return true;
                  }).length}
                  hemiPrice={filteredAndSortedTokens.length > 0 ? filteredAndSortedTokens[0].hemiPrice : undefined}
                  connectedUser={address}
                  hemiPriceData={hemiPriceData}
                  stats={statsData || undefined}
                  statsPeriod="30d"
                />
                {(() => {
                  const totalFiltered = allTokens.filter(token => {
                    // Add defensive checks to prevent undefined access
                    if (!filters.hemiAmountRange || !filters.unlocksInRange || !filters.paymentTokens) {
                      return false;
                    }
                    
                    const hemiAmountOk = token.hemiAmount >= filters.hemiAmountRange[0] && token.hemiAmount <= filters.hemiAmountRange[1];
                    const unlocksInOk = token.unlocksIn >= filters.unlocksInRange[0] && token.unlocksIn <= filters.unlocksInRange[1];
                    const paymentTokenOk = filters.paymentTokens.includes(token.paymentToken.symbol);
                    const base = hemiAmountOk && unlocksInOk && paymentTokenOk;
                    if (!base) return false;
                    const unitPriceUSD = token.hemiAmount > 0 && token.usdValue ? token.usdValue / token.hemiAmount : 0;
                    if (filters.unitPriceRange) {
                      return unitPriceUSD >= filters.unitPriceRange[0] && unitPriceUSD <= filters.unitPriceRange[1];
                    }
                    return true;
                  }).length;
                  
                  return totalFiltered > limit && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(totalFiltered / limit)}
                        onPageChange={handlePageChange}
                        totalItems={totalFiltered}
                        itemsPerPage={limit}
                      />
                    </div>
                  );
                })()}
              </>
            )}
          </section>
        </div>
      </main>
    </div>;
};

// WalletConnectCTA sub-component kept local to maintain single top-level component rule
function WalletConnectCTA() {
  return <WalletConnectionWrapper />;
}