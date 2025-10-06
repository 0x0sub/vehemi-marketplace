import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Coins, Lock, Calendar, DollarSign, X, Loader2 } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS, MARKETPLACE_ABI } from '../lib/contracts';
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
interface VeHemiPositionCardProps {
  position: VeHemiPosition;
  onListPosition: (position: VeHemiPosition) => void;
  onCancelListing: (positionId: string) => void;
  walletAddress?: string;
}
const formatDuration = (days: number): string => {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// @component: VeHemiPositionCard
export const VeHemiPositionCard = ({
  position,
  onListPosition,
  onCancelListing,
  walletAddress
}: VeHemiPositionCardProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Wagmi hooks for cancel listing transaction
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if listing still exists on-chain before attempting to cancel
  const { data: listingData, refetch: refetchListing } = useReadContract({
    address: CONTRACTS.MARKETPLACE,
    abi: MARKETPLACE_ABI,
    functionName: 'getListing',
    args: [BigInt(position.tokenId)],
    query: {
      enabled: position.isListed,
    },
  });

  const handleCancelListing = async () => {
    if (!position.isListed) return;
    
    // First, check if the listing still exists on-chain
    try {
      const currentListing = await refetchListing();
      if (!currentListing.data || !(currentListing.data as any).isActive) {
        onCancelListing(position.id);
        return;
      }
    } catch (error) {
      console.error('Error checking listing status:', error);
    }
    
    setIsCancelling(true);
    
    try {
      await writeContract({
        address: CONTRACTS.MARKETPLACE,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [BigInt(position.tokenId)],
      });
    } catch (error) {
      console.error('Error cancelling listing:', error);
      setIsCancelling(false);
    }
  };

  // Handle transaction completion
  React.useEffect(() => {
    if (isConfirmed && isCancelling) {
      setIsCancelling(false);
      // Start polling to check if database has been updated
      startDatabaseSyncPolling();
    }
  }, [isConfirmed, isCancelling]);

  // Polling mechanism to sync with database
  const startDatabaseSyncPolling = () => {
    let previousListings: string[] = [];
    
    const pollInterval = setInterval(async () => {
      try {
        // Get all current listings for the wallet
        const response = await fetch('/api/user-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress || '',
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const currentListings = Object.keys(data.listings || {});
          
          // If this is the first poll, store the current listings
          if (previousListings.length === 0) {
            previousListings = currentListings;
            return;
          }
          
          // Check if our token ID is missing from current listings
          if (previousListings.includes(position.tokenId) && !currentListings.includes(position.tokenId)) {
            // Listing was cancelled!
            clearInterval(pollInterval);
            
            // Update UI
            onCancelListing(position.id);
            
            // Show success notification
            showSuccessNotification(`Listing #${position.tokenId} was successfully cancelled!`);
          }
        }
      } catch (error) {
        console.error('Error polling database:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 60 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 60000);
  };

  // Simple notification function
  const showSuccessNotification = (message: string) => {
    // You can replace this with a proper notification system
    alert(message);
  };

  // Handle transaction errors
  React.useEffect(() => {
    if (error && isCancelling) {
      console.error('Transaction error:', error);
      setIsCancelling(false);
    }
  }, [error, isCancelling]);

  // @return
  return <motion.div layout whileHover={{
    y: -2
  }} className="bg-[color:var(--card)] rounded-3xl border border-slate-800/80 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div className="relative p-6">
      {position.isListed && <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
          <span>Listed</span>
        </div>}

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[color:var(--hemi-orange)] to-orange-600 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  <span>{position.tokenId}</span>
                </h3>
                <p className="text-sm text-slate-400">
                  <span>veHEMI Position</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">HEMI Amount</span>
            </div>
            <p className="text-lg font-semibold text-white">
              <span>{formatAmount(position.hemiAmount)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Lock Duration</span>
            </div>
            <p className="text-lg font-semibold text-white">
              <span>{formatDuration(position.lockDuration)}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Unlocks In</span>
          </div>
          <p className="text-base font-semibold text-slate-200">
            <span>{formatDuration(position.unlocksIn)}</span>
          </p>
        </div>

        {position.isListed && position.listingPrice && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Listed Price</span>
                </div>
                <p className="text-lg font-bold text-green-400">
                  <span>{formatPrice(position.listingPrice)} {position.listingCurrency}</span>
                </p>
              </div>
              {position.listingUntil && <div className="flex items-center justify-between text-sm">
                  <span className="text-green-300/70">Expires</span>
                  <span className="text-green-300 font-medium">
                    {new Date(position.listingUntil).toLocaleDateString()}
                  </span>
                </div>}
            </div>
          </div>}

        <div className="pt-4 border-t border-slate-800/60">
          {position.isListed ? <button 
            onClick={handleCancelListing} 
            disabled={isCancelling || isPending || isConfirming} 
            className="w-full bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-3 px-4 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCancelling || isPending || isConfirming ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isPending ? 'Confirming...' : isConfirming ? 'Canceling Listing' : 'Cancelling...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>Cancel Listing</span>
              </div>
            )}
          </button> : <button onClick={() => onListPosition(position)} className="w-full rounded-xl py-3 px-4 font-semibold transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40">
            <DollarSign className="w-4 h-4" />
            <span>List veHEMI</span>
          </button>}
        </div>
      </div>
    </div>
  </motion.div>;
};