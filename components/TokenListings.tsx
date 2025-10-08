import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TokenPurchaseModal } from './TokenPurchaseModal';
import { Tooltip } from './Tooltip';
import { MarketplaceHeader } from './MarketplaceHeader';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, MARKETPLACE_ABI } from '../lib/contracts';

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

interface ListingToken {
  id: string;
  price: number;
  hemiAmount: number;
  unlocksIn: number;
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
interface SortOption {
  field: keyof Pick<ListingToken, 'price' | 'hemiAmount' | 'unlocksIn' | 'tokenId'> | 'unitPrice';
  direction: 'asc' | 'desc';
}
interface TokenListingsProps {
  tokens: ListingToken[];
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  totalCount: number;
  hemiPrice?: number;
  connectedUser?: string;
  hemiPriceData?: {
    priceUsd: number | null;
    change24h: number | null;
    lastUpdated: string | null;
    sparkline: number[];
  };
  stats?: {
    salesCount: number;
    totalHemiLocked: number;
    totalUsdValue: number;
  };
  statsPeriod?: string;
}
const formatDuration = (days: number): string => {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};
const formatAmount = (amount: number): string => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(amount);
const formatPrice = (price: number): string => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(price);
const formatUnitPrice = (value: number): string => `$${Number.isFinite(value) ? value.toFixed(4) : '0.0000'}`;
const formatUSDValue = (value: number | string | undefined): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(2);
  }
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(2);
  }
  return '0.00';
};
const formatHEMIDifference = (unitPrice: number, hemiPrice: number | undefined): { text: string; color: string } => {
  if (!hemiPrice || hemiPrice === 0) return { text: '', color: '' };
  const difference = unitPrice - hemiPrice;
  const percentage = ((difference / hemiPrice) * 100);
  const sign = difference >= 0 ? '+' : '';
  const color = difference < 0 ? 'text-green-400' : 'text-red-400';
  return { text: `${sign}${percentage.toFixed(1)}%`, color };
};

const getTokenLogo = (symbol: string): string => {
  const symbolLower = symbol.toLowerCase();
  if (symbolLower === 'hemi') return '/hemi-logo.svg';
  if (symbolLower === 'usdc') return '/usdc-logo.svg';
  return '/hemi-logo.svg'; // fallback to hemi logo
};

// @component: TokenListings
export const TokenListings = ({
  tokens,
  sortOption,
  onSortChange,
  totalCount,
  hemiPrice,
  connectedUser,
  hemiPriceData,
  stats,
  statsPeriod
}: TokenListingsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cancel listing on-chain
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending } = useWriteContract();
  const { isLoading: isCancelConfirming, isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelHash });

  useEffect(() => {
    if (isCancelConfirmed) {
      setCancellingId(null);
      // Optionally refresh the page or refetch data
      window.location.reload();
    }
  }, [isCancelConfirmed]);

  const handleHeaderSort = (field: SortOption['field']) => {
    const nextDirection: SortOption['direction'] = sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({
      field,
      direction: nextDirection
    });
  };

  const handleBuyClick = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTokenId(null);
  };

  const handleCancelListing = async (tokenId: string) => {
    try {
      setCancellingId(tokenId);
      await writeCancel({
        address: CONTRACTS.MARKETPLACE,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [BigInt(tokenId)]
      });
    } catch (e) {
      console.error('Cancel listing failed', e);
      setCancellingId(null);
    }
  };

  const isUserSeller = (token: ListingToken): boolean => {
    const result = connectedUser && token.sellerAddress ? 
      connectedUser.toLowerCase() === token.sellerAddress.toLowerCase() : false;
    
    return result;
  };
  // @return
  return <section className="space-y-6" aria-label="Token listings">
      <MarketplaceHeader
        title="Available veHEMI"
        listingsCount={totalCount}
        tokenSymbol="HEMI"
        tokenIconUrl="/hemi-logo.svg"
        priceUsd={hemiPriceData?.priceUsd}
        change24h={hemiPriceData?.change24h}
        lastUpdatedIso={hemiPriceData?.lastUpdated || undefined}
        sparkline={hemiPriceData?.sparkline}
        stats={stats}
        statsPeriod={statsPeriod}
      />

      {tokens.length === 0 ? <div className="text-center py-16">
          <div className="bg-slate-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-800">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            <span>No tokens found</span>
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            <span>Try adjusting your filters to find more veHemi tokens that match your criteria.</span>
          </p>
        </div> : <>
        {/* Mobile Card Layout (< 768px) */}
        <div className="md:hidden space-y-4">
          {tokens.map(t => {
            const unit = t.hemiAmount > 0 && t.usdValue ? t.usdValue / t.hemiAmount : 0;
            const hemiDiff = formatHEMIDifference(unit, t.hemiPrice);
            return (
              <motion.div 
                key={t.id}
                layout
                className="bg-[color:var(--card)] rounded-2xl border border-slate-800/80 shadow-sm p-4 space-y-4"
              >
                {/* Header: Token ID and Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-1">
                      <Image
                        src="/vehemi-locked-logo.png"
                        alt="veHEMI logo"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">#{t.tokenId}</p>
                      <p className="text-xs text-slate-400">ID: {t.id}</p>
                    </div>
                  </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Amount</p>
                    <p className="text-lg font-semibold text-white">{formatAmount(t.hemiAmount)} HEMI</p>
                  </div>

                  {/* Unlocks In */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Unlocks In</p>
                    <p className="text-sm font-medium text-slate-300">{formatDuration(t.unlocksIn)}</p>
                  </div>

                  {/* Price per HEMI */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Price / HEMI</p>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-white">{formatUnitPrice(unit)}</span>
                      {hemiDiff.text && (
                        <span className={`text-xs ${hemiDiff.color}`}>({hemiDiff.text})</span>
                      )}
                    </div>
                  </div>

                  {/* Total Price */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Price</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-semibold text-white">{formatAmount(t.price)}</span>
                      <Image
                        src={getTokenLogo(t.paymentToken.symbol)}
                        alt={`${t.paymentToken.symbol} logo`}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">${formatUSDValue(t.usdValue)}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-800/50">
                  {isUserSeller(t) ? (
                    <button 
                      disabled={isCancelPending || isCancelConfirming}
                      onClick={() => handleCancelListing(t.tokenId)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCancelPending || isCancelConfirming ? 'Cancelling...' : 'Cancel Listing'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuyClick(t.id)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                    >
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tablet/Laptop/Desktop Table Layout (≥ 768px) */}
        <motion.div layout className="hidden md:block bg-[color:var(--card)] rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <caption className="sr-only">veHemi token listings</caption>
              <thead className="bg-slate-900/50">
                <tr>
                  {/* Listing ID - Hidden on tablet/laptop, show on desktop (xl+) */}
                  <th scope="col" className="hidden xl:table-cell px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase cursor-pointer" onClick={() => handleHeaderSort('tokenId')} aria-sort={sortOption.field === 'tokenId' ? sortOption.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <span>Listing ID</span>
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase cursor-pointer" onClick={() => handleHeaderSort('unitPrice')} aria-sort={sortOption.field === 'unitPrice' ? sortOption.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <Tooltip content={
                      <div className="normal-case">
                        <div className="font-bold text-[#F9FAFB] mb-1">Price per HEMI Token</div>
                        <div className="text-[#F9FAFB] text-xs">
                          The <span className="font-semibold text-[#F9FAFB]">USD value</span> for each individual HEMI token in this listing.
                        </div>
                        <div className="text-[#CBD5E1] text-xs mt-1">
                          Makes it easy to <span className="text-[#60A5FA]">compare prices</span> across different listings.
                        </div>
                      </div>
                    }>
                      <span>Price / 1 HEMI</span>
                    </Tooltip>
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase cursor-pointer" onClick={() => handleHeaderSort('hemiAmount')} aria-sort={sortOption.field === 'hemiAmount' ? sortOption.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <Tooltip content={
                      <div className="normal-case">
                        <div className="font-bold text-[#F9FAFB] mb-1">Total HEMI Amount</div>
                        <div className="text-[#F9FAFB] text-xs">
                          The <span className="font-semibold text-[#F9FAFB]">total amount</span> of HEMI tokens locked in this veHEMI position.
                        </div>
                        <div className="text-[#CBD5E1] text-xs mt-1">
                          Represents your <span className="text-[#60A5FA]">voting power</span> and potential <span className="text-[#FF7A00]">rewards</span> if purchased.
                        </div>
                      </div>
                    }>
                      <span>Amount</span>
                    </Tooltip>
                  </th>
                  {/* Unlocks In - Hidden on tablet, show on laptop+ (lg+) */}
                  <th scope="col" className="hidden lg:table-cell px-4 md:px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase cursor-pointer" onClick={() => handleHeaderSort('unlocksIn')} aria-sort={sortOption.field === 'unlocksIn' ? sortOption.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <Tooltip content={
                      <div className="normal-case">
                        <div className="font-bold text-[#F9FAFB] mb-1">Unlock Time Remaining</div>
                        <div className="text-[#F9FAFB] text-xs">
                          Time until the <span className="font-semibold text-[#F9FAFB]">HEMI tokens</span> can be unlocked from this position.
                        </div>
                        <div className="text-[#CBD5E1] text-xs mt-1">
                          <span className="text-[#60A5FA]">Longer locks</span> = higher <span className="text-[#60A5FA]">voting power</span> & <span className="text-[#FF7A00]">rewards</span>.
                        </div>
                      </div>
                    }>
                      <span>Unlocks In</span>
                    </Tooltip>
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase cursor-pointer" onClick={() => handleHeaderSort('price')} aria-sort={sortOption.field === 'price' ? sortOption.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                    <Tooltip content={
                      <div className="normal-case">
                        <div className="font-bold text-[#F9FAFB] mb-1">Total Purchase Price</div>
                        <div className="text-[#F9FAFB] text-xs">
                          The <span className="font-semibold text-[#F9FAFB]">full amount</span> you need to pay to purchase this veHEMI token.
                        </div>
                        <div className="text-[#CBD5E1] text-xs mt-1">
                          Includes payment in <span className="text-[#60A5FA]">HEMI/USDC</span> + <span className="text-[#60A5FA]">USD equivalent</span> value.
                        </div>
                      </div>
                    }>
                      <span>Total Price</span>
                    </Tooltip>
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-4 text-xs font-semibold tracking-wide text-slate-400 uppercase select-none">
                    <span>Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tokens.map(t => {
              const unit = t.hemiAmount > 0 && t.usdValue ? t.usdValue / t.hemiAmount : 0;
              const hemiDiff = formatHEMIDifference(unit, t.hemiPrice);
              return <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Listing ID - Hidden on tablet/laptop, show on desktop (xl+) */}
                      <th scope="row" className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-1">
                            <Image
                              src="/vehemi-locked-logo.png"
                              alt="veHEMI logo"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white leading-5">
                              <span>{t.tokenId}</span>
                            </p>
                            <p className="text-xs text-slate-400 leading-4">
                              <span>ID: {t.id}</span>
                            </p>
                          </div>
                        </div>
                      </th>
                      {/* Price / 1 HEMI - Multi-row on laptop (lg), single row on desktop (xl+) */}
                      <td className="px-4 md:px-6 py-4">
                        <div className="lg:space-y-1 xl:space-y-0 xl:flex xl:items-center xl:gap-2">
                          <span className="text-base lg:text-lg font-semibold text-white block xl:inline">
                            {formatUnitPrice(unit)}
                          </span>
                          {hemiDiff.text && (
                            <span className={`text-xs ${hemiDiff.color} block xl:inline`}>
                              ({hemiDiff.text})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <p className="text-base lg:text-lg font-semibold text-white">
                          <span>{formatAmount(t.hemiAmount)}</span>
                        </p>
                      </td>
                      {/* Unlocks In - Hidden on tablet, show on laptop+ (lg+) */}
                      <td className="hidden lg:table-cell px-4 md:px-6 py-4">
                        <Tooltip 
                          content={
                            <div className="text-xs">
                              <div className="font-medium text-white mb-1">Lock Details</div>
                              <div className="text-slate-300 space-y-1">
                                {t.lockStartTimestamp && (
                                  <div>Started: {formatLockupStartDate(t.lockStartTimestamp)}</div>
                                )}
                                {t.lockEndTimestamp && (
                                  <div>Unlocks: {formatUnlockDate(t.lockEndTimestamp)}</div>
                                )}
                                {t.lockupDuration && (
                                  <div>Lockup period: {formatLockupDuration(t.lockupDuration)}</div>
                                )}
                              </div>
                            </div>
                          }
                        >
                          <p className="text-sm font-medium text-slate-300 cursor-help">
                            <span>{formatDuration(t.unlocksIn)}</span>
                          </p>
                        </Tooltip>
                      </td>
                      {/* Total Price - Multi-row on laptop (lg), single row on desktop (xl+) */}
                      <td className="px-4 md:px-6 py-4">
                        <div className="lg:space-y-1 xl:space-y-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base lg:text-lg font-semibold text-white">
                              {formatAmount(t.price)}
                            </span>
                            <Image
                              src={getTokenLogo(t.paymentToken.symbol)}
                              alt={`${t.paymentToken.symbol} logo`}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="text-sm text-slate-400 xl:inline hidden">
                              (${formatUSDValue(t.usdValue)})
                            </span>
                          </div>
                          <span className="text-xs lg:text-sm text-slate-400 xl:hidden block">
                            ${formatUSDValue(t.usdValue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {isUserSeller(t) ? (
                          <Tooltip content={`Cancel your listing veHEMI #${t.tokenId}`}>
                            <button 
                              disabled={isCancelPending || isCancelConfirming}
                              onClick={() => handleCancelListing(t.tokenId)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-red-500 hover:text-red-400 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isCancelPending || isCancelConfirming ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </Tooltip>
                        ) : (
                          <button 
                            onClick={() => handleBuyClick(t.id)}
                            className="inline-flex items-center gap-2 rounded-lg px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                          >
                            <span>Buy</span>
                          </button>
                        )}
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </>}
      
      {/* Purchase Modal */}
      <TokenPurchaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tokenId={selectedTokenId}
        connectedUser={connectedUser}
      />
    </section>;
};