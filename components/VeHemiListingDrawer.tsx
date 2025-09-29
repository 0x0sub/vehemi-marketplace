'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import VeHemiListing, { WalletToken } from './VeHemiListing';
import { WalletConnectionWrapper } from './WalletConnectionWrapper';
import { CONTRACTS, VEHEMI_ABI } from '../lib/contracts';

interface VeHemiListingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTokenId?: string;
}

export function VeHemiListingDrawer({ 
  isOpen, 
  onClose, 
  preselectedTokenId 
}: VeHemiListingDrawerProps) {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const veHemiAddress = CONTRACTS.VEHEMI;

  const { data: balanceData } = useReadContract({
    address: veHemiAddress,
    abi: VEHEMI_ABI,
    functionName: 'balanceOf',
    args: address && veHemiAddress ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected && veHemiAddress && isOpen),
    },
  });

  // Fetch user's veHEMI positions when drawer opens and wallet is connected
  useEffect(() => {
    if (isOpen && isConnected && address && balanceData !== undefined) {
      fetchWalletTokens();
    } else if (!isConnected) {
      setWalletTokens([]);
    }
  }, [isOpen, isConnected, address, balanceData]);

  const fetchWalletTokens = async () => {
    if (!publicClient || !veHemiAddress || !address) {
      setWalletTokens([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const balance = (balanceData as bigint | undefined) || BigInt(0);

      if (balance === BigInt(0)) {
        setWalletTokens([]);
        setIsLoading(false);
        return;
      }

      // Fetch tokenOfOwnerByIndex for each index via multicall
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

      // Batch getLockedBalance for all tokenIds
      const lockCalls = tokenIds.map((tokenId) => ({
        address: veHemiAddress,
        abi: VEHEMI_ABI,
        functionName: 'getLockedBalance' as const,
        args: [tokenId],
      }));

      const lockResults = lockCalls.length
        ? await publicClient.multicall({ contracts: lockCalls, allowFailure: true })
        : [];

      const tokens: WalletToken[] = tokenIds.map((tokenId, idx) => {
        const res = lockResults[idx];
        const tuple = res && res.status === 'success' ? (res.result as any) : undefined;
        const amount = tuple?.amount ?? BigInt(0);
        const end = tuple?.end ?? BigInt(0);
        const unlocksInDays = Number(end > BigInt(nowSec) ? (end - BigInt(nowSec)) / BigInt(86400) + BigInt(1) : BigInt(0));
        
        // Calculate total lock duration (this is an approximation since we don't have the original lock time)
        const totalLockDays = Math.max(unlocksInDays, 1); // At least 1 day

        return {
          id: tokenId.toString(),
          hemiLocked: Number(amount) / 1e18,
          lockTotalDays: totalLockDays,
          unlocksInDays: unlocksInDays,
        };
      });

      // Check which tokens are already listed
      const listedTokens = await checkListedTokens(tokenIds.map(id => id.toString()));
      console.log('Listed tokens:', listedTokens);
      console.log('All wallet tokens:', tokens.map(t => ({ id: t.id, hemiLocked: t.hemiLocked })));
      
      // Filter out listed tokens and sort by locked HEMI in descending order
      const unlistedTokens = tokens
        .filter(token => !listedTokens.includes(token.id))
        .sort((a, b) => b.hemiLocked - a.hemiLocked);

      console.log('Unlisted tokens after filtering:', unlistedTokens.map(t => ({ id: t.id, hemiLocked: t.hemiLocked })));
      setWalletTokens(unlistedTokens);
    } catch (error) {
      console.error('Failed to fetch wallet tokens:', error);
      setWalletTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check which tokens are already listed
  const checkListedTokens = async (tokenIds: string[]): Promise<string[]> => {
    try {
      const response = await fetch('/api/user-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          tokenIds: tokenIds,
        }),
      });

      if (!response.ok) {
        console.error('Failed to check listed tokens:', response.statusText);
        return [];
      }

      const data = await response.json();
      
      // Handle the response format where listings is an object with token IDs as keys
      if (data.listings && typeof data.listings === 'object') {
        return Object.keys(data.listings);
      }
      
      // Fallback for array format
      return data.listings?.map((listing: any) => listing.token_id) || [];
    } catch (error) {
      console.error('Error checking listed tokens:', error);
      return [];
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[color:var(--card)] border-l border-slate-800/70 shadow-2xl overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800/70">
              <h2 className="text-xl font-semibold text-white">
                List veHEMI Position
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {!isConnected ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Connect Your Wallet
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Connect your wallet to list your veHEMI positions
                  </p>
                  <WalletConnectionWrapper />
                </div>
              ) : isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--hemi-orange)] mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading your veHEMI positions...</p>
                </div>
              ) : (
                <VeHemiListing
                  tokenId={preselectedTokenId}
                  walletTokens={walletTokens}
                  isConnected={isConnected}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
