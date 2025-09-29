import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { VeHemiPositionCard } from './VeHemiPositionCard';
// import { ListVeHemiForm } from './ListVeHemiForm';
import { useVeHemiListing } from './VeHemiListingProvider';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACTS, VEHEMI_ABI } from '../lib/contracts';
interface VeHemiPosition {
  id: string;
  tokenId: string;
  hemiAmount: number;
  lockDuration: number;
  unlocksIn: number;
  isListed: boolean;
  listingPrice?: number;
  listingCurrency?: 'HEMI' | 'USDC';
  listingUntil?: string;
}
const mockPositions: VeHemiPosition[] = [{
  id: '1',
  tokenId: '0x1a2b3c',
  hemiAmount: 15000,
  lockDuration: 730,
  unlocksIn: 365,
  isListed: true,
  listingPrice: 1800,
  listingCurrency: 'USDC',
  listingUntil: '2024-12-31'
}, {
  id: '2',
  tokenId: '0x4d5e6f',
  hemiAmount: 8500,
  lockDuration: 365,
  unlocksIn: 180,
  isListed: false
}, {
  id: '3',
  tokenId: '0x7g8h9i',
  hemiAmount: 25000,
  lockDuration: 1460,
  unlocksIn: 1095,
  isListed: false
}];

// @component: VeHemiPositionsList
export const VeHemiPositionsList = () => {
  const [positions, setPositions] = useState<VeHemiPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const { openListingDrawer } = useVeHemiListing();
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();

  const veHemiAddress = CONTRACTS.VEHEMI;
  const marketplaceAddress = CONTRACTS.MARKETPLACE;

  // Function to fetch listing data for multiple token IDs from database
  const fetchListings = async (tokenIds: string[]) => {
    if (!address || tokenIds.length === 0) return {};
    
    try {
      const response = await fetch('/api/user-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          tokenIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      return data.listings || {};
    } catch (error) {
      console.error('Error fetching listings:', error);
      return {};
    }
  };

  const { data: balanceData } = useReadContract({
    address: veHemiAddress,
    abi: VEHEMI_ABI,
    functionName: 'balanceOf',
    args: address && veHemiAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected && veHemiAddress),
    },
  });

  useEffect(() => {
    const loadPositions = async () => {
      try {
        setIsLoading(true);
        if (!publicClient || !veHemiAddress || !address) {
          setPositions([]);
          setIsLoading(false);
          return;
        }

        const balance = (balanceData as bigint | undefined) || BigInt(0);

        if (balance === BigInt(0)) {
          setPositions([]);
          setIsLoading(false);
          return;
        }

        const indexCalls = Array.from({ length: Number(balance) }, (_, i) => ({
          address: veHemiAddress,
          abi: VEHEMI_ABI,
          functionName: 'tokenOfOwnerByIndex' as const,
          args: [address, BigInt(i)],
        }));

        const indexResults = await publicClient.multicall({ contracts: indexCalls, allowFailure: true });
        const tokenIds = indexResults
          .map(r => (r.status === 'success' ? (r.result as bigint) : undefined))
          .filter((t): t is bigint => typeof t === 'bigint');
        const nowSec = Math.floor(Date.now() / 1000);

        const lockCalls = tokenIds.map((tokenId) => ({
          address: veHemiAddress,
          abi: VEHEMI_ABI,
          functionName: 'getLockedBalance' as const,
          args: [tokenId],
        }));

        const lockResults = lockCalls.length ? await publicClient.multicall({ contracts: lockCalls, allowFailure: true }) : [];

        const detailed: VeHemiPosition[] = tokenIds.map((tokenId, idx) => {
          const res = lockResults[idx];
          const tuple = res && res.status === 'success' ? (res.result as any) : undefined;
          const amount = tuple?.amount ?? BigInt(0);
          const end = tuple?.end ?? BigInt(0);
          const unlocksInDays = Number(end > BigInt(nowSec) ? (end - BigInt(nowSec)) / BigInt(86400) + BigInt(1) : BigInt(0));
          return {
            id: tokenId.toString(),
            tokenId: tokenId.toString(),
            hemiAmount: Number(amount) / 1e18,
            lockDuration: unlocksInDays,
            unlocksIn: unlocksInDays,
            isListed: false,
          };
        });

        // Fetch listing data for all positions
        setIsLoadingListings(true);
        const listings = await fetchListings(tokenIds.map(id => id.toString()));
        
        // Update positions with listing data
        const positionsWithListings = detailed.map(position => {
          const listing = listings[position.tokenId];
          if (listing && listing.isActive) {
            // Use the payment token symbol from database
            const currency = listing.paymentTokenSymbol || 'HEMI';
            
            return {
              ...position,
              isListed: true,
              listingPrice: Number(listing.priceFormatted), // Already formatted from database
              listingCurrency: currency as 'USDC' | 'HEMI',
              listingUntil: new Date(listing.deadline).toISOString(),
            };
          }
          return position;
        });

        setPositions(positionsWithListings);
        setIsLoadingListings(false);
      } catch (e) {
        console.error('Failed loading veHEMI positions', e);
        setPositions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && address && veHemiAddress) {
      loadPositions();
    } else if (!isConnected) {
      setPositions([]);
      setIsLoading(false);
    }
  }, [isConnected, address, veHemiAddress, publicClient, balanceData]);
  const handleListPosition = (position: VeHemiPosition) => {
    openListingDrawer(position.tokenId);
  };
  const handleCancelListing = async (positionId: string) => {
    // Optimistically update the UI
    setPositions(prev => prev.map(p => p.id === positionId ? {
      ...p,
      isListed: false,
      listingPrice: undefined,
      listingCurrency: undefined,
      listingUntil: undefined
    } : p));
    
    // Refresh listing data to ensure accuracy
    const position = positions.find(p => p.id === positionId);
    if (position) {
      setIsLoadingListings(true);
      const listings = await fetchListings([position.tokenId]);
      const listing = listings[position.tokenId];
      
      setPositions(prev => prev.map(p => {
        if (p.id === positionId) {
          if (listing && listing.isActive) {
            // Use the payment token symbol from database
            const currency = listing.paymentTokenSymbol || 'HEMI';
            
            return {
              ...p,
              isListed: true,
              listingPrice: Number(listing.priceFormatted), // Already formatted from database
              listingCurrency: currency as 'USDC' | 'HEMI',
              listingUntil: new Date(listing.deadline).toISOString(),
            };
          } else {
            return {
              ...p,
              isListed: false,
              listingPrice: undefined,
              listingCurrency: undefined,
              listingUntil: undefined
            };
          }
        }
        return p;
      }));
      setIsLoadingListings(false);
    }
  };
  if (!isConnected) {
    // @return
    return <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">
          <span>Connect Your Wallet</span>
        </h1>
        <p className="text-slate-400 mb-8">
          <span>Connect your wallet to view your veHEMI positions</span>
        </p>
        <button className="bg-[color:var(--hemi-orange)] text-black px-8 py-3 rounded-xl font-semibold hover:brightness-110 transition-colors">
          <span>Connect Wallet</span>
        </button>
      </div>
    </div>;
  }

  // @return
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span>My veHEMI Positions</span>
          </h1>
          <p className="text-slate-400 text-lg">
            <span>Manage your locked HEMI positions and marketplace listings</span>
          </p>
        </div>

        {isLoading || isLoadingListings ? <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[color:var(--hemi-orange)] animate-spin" />
            <span className="ml-3 text-slate-300">
              {isLoading ? 'Loading your positions...' : 'Checking marketplace listings...'}
            </span>
          </div> : positions.length === 0 ? <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              <span>No veHEMI Positions</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              <span>You don't have any veHEMI positions yet. Lock some HEMI to start earning rewards.</span>
            </p>
          </div> : <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {positions.map(position => <VeHemiPositionCard key={position.id} position={position} onListPosition={handleListPosition} onCancelListing={handleCancelListing} walletAddress={address} />)}
          </motion.div>}
      </div>

    </>
  );
};