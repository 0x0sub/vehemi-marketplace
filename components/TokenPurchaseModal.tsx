import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Coins, Clock, Calendar, User, ExternalLink, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, MARKETPLACE_ABI, ERC20_ABI } from '../lib/contracts';
import { WalletSelectionModal } from './WalletSelectionModal';
import { Tooltip } from './Tooltip';

interface VeHemiToken {
  id: string;
  price: number;
  hemiAmount: number;
  unlocksIn: number;
  lockDuration?: number; // in days - optional for now
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
}

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string | null;
  connectedUser?: string;
}

// @component: TokenPurchaseModal
export const TokenPurchaseModal = ({
  isOpen,
  onClose,
  tokenId,
  connectedUser
}: TokenPurchaseModalProps) => {
  const [token, setToken] = useState<VeHemiToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [hemiSpotUsd, setHemiSpotUsd] = useState<number | undefined>(undefined);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const { address, isConnected } = useAccount();

  const isUserSeller = (): boolean => {
    const result = connectedUser && token?.sellerAddress ? 
      connectedUser.toLowerCase() === token.sellerAddress.toLowerCase() : false;
    
    return result;
  };

  // Check current allowance for payment token
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: token?.paymentToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && token?.paymentToken.address ? [address, CONTRACTS.MARKETPLACE] : undefined,
    query: {
      enabled: Boolean(address && token?.paymentToken.address),
    },
  });
  
  // Check user's balance of payment token
  const { data: userBalance } = useReadContract({
    address: token?.paymentToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && token?.paymentToken.address),
    },
  });
  
  // Convert user balance to 18 decimals for comparison with contract price
  const userBalance18Decimals = userBalance ? BigInt(userBalance.toString()) * BigInt(Math.pow(10, 18 - (token?.paymentToken.decimals || 6))) : BigInt(0);
  
  // Check if the listing is still active
  const { data: listingData } = useReadContract({
    address: CONTRACTS.MARKETPLACE,
    abi: MARKETPLACE_ABI,
    functionName: 'getListing',
    args: token ? [BigInt(token.tokenId)] : undefined,
    query: {
      enabled: Boolean(token),
    },
  });
  
  // Calculate price in wei - use the price from the contract listing, not our calculation
  const priceInWei = (listingData as any)?.price ? BigInt((listingData as any).price.toString()) : (token ? BigInt(Math.floor(token.price * Math.pow(10, token.paymentToken.decimals))) : BigInt(0));
  
  // Wagmi hooks for buy transaction
  const { writeContract: writeBuyContract, data: buyHash, isPending: isBuyPending, error: buyError } = useWriteContract();
  const { isLoading: isBuyConfirming, isSuccess: isBuyConfirmed } = useWaitForTransactionReceipt({
    hash: buyHash,
  });
  
  // Wagmi hooks for approval transaction
  const { writeContract: writeApproveContract, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Log buy errors and reset state
  useEffect(() => {
    if (buyError) {
      console.error('Buy transaction error:', buyError);
      setIsBuying(false);
    }
  }, [buyError]);

  // Log approval errors and reset state
  useEffect(() => {
    if (approveError) {
      console.error('Approval transaction error:', approveError);
      setIsApproving(false);
    }
  }, [approveError]);

  // Fetch token details when modal opens
  useEffect(() => {
    if (isOpen && tokenId) {
      fetchTokenDetails();
    }
  }, [isOpen, tokenId]);

  const fetchTokenDetails = async () => {
    if (!tokenId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch token details from API
      const response = await fetch(`/api/token-info?tokenId=${tokenId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token details');
      }
      
      const data = await response.json();
      setToken(data);
      // Prime spot price from API payload to avoid extra fetches
      const hemiSpot = (data as any)?.hemiPrice ?? (data as any)?.hemi_usd_price ?? undefined;
      if (typeof hemiSpot === 'number') setHemiSpotUsd(hemiSpot);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token details');
    } finally {
      setLoading(false);
    }
  };

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

  const formatPriceUSD = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatUSDCompact = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatTokenAmountNoGrouping = (amount: number, fractionDigits: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: false
    }).format(amount);
  };

  const formatUSDCNoGrouping = (amount: number, fractionDigits: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: false
    }).format(amount);
  };

  const formatTokenAmount = (amount: number, fractionDigits: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatUnlockDateTime = (timestamp?: string): string => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shortenAddress = (addr?: string): string => {
    if (!addr || addr.length < 10) return addr || '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Derived pricing values (robust to API shapes)
  const apiUsdValueRaw: any = token ? (token as any).usdValue ?? (token as any).usd_value : undefined;
  const hemiReferenceUsdPriceRaw: any = token ? (token as any).hemiPrice ?? (token as any).hemi_usd_price ?? (token as any).token_usd_price : undefined;

  const totalUsdValue: number | undefined = token
    ? (typeof apiUsdValueRaw === 'number'
        ? apiUsdValueRaw
        : apiUsdValueRaw !== undefined
          ? parseFloat(String(apiUsdValueRaw))
          : (token.paymentToken?.symbol === 'USDC'
              ? (typeof token.price === 'number' ? token.price : undefined)
              : (typeof hemiSpotUsd === 'number' && typeof token.price === 'number'
                  ? token.price * hemiSpotUsd
                  : (typeof hemiReferenceUsdPriceRaw === 'number' && typeof token.price === 'number'
                      ? token.price * hemiReferenceUsdPriceRaw
                      : (hemiReferenceUsdPriceRaw !== undefined && typeof token.price === 'number'
                          ? token.price * parseFloat(String(hemiReferenceUsdPriceRaw))
                          : undefined)))))
    : undefined;

  const pricePerHemiInPaymentToken: number | undefined = token && token.hemiAmount > 0
    ? token.price / token.hemiAmount
    : undefined;

  const pricePerHemiUSD: number | undefined = token && token.hemiAmount > 0
    ? (token.paymentToken.symbol === 'USDC'
        ? token.price / token.hemiAmount
        : (typeof totalUsdValue === 'number' ? totalUsdValue / token.hemiAmount : undefined))
    : undefined;

  // Percent delta vs current HEMI price (negative means cheaper than current)
  const hemiReferenceUsdPrice: number | undefined = (() => {
    if (typeof hemiReferenceUsdPriceRaw === 'number') return hemiReferenceUsdPriceRaw;
    if (hemiReferenceUsdPriceRaw !== undefined) {
      const parsed = parseFloat(String(hemiReferenceUsdPriceRaw));
      if (!isNaN(parsed)) return parsed;
    }
    if (typeof hemiSpotUsd === 'number') return hemiSpotUsd;
    return undefined;
  })();

  // Removed client-side spot fetch; rely on API response to include hemiPrice

  const percentVsCurrentHemi: number | undefined = typeof hemiReferenceUsdPrice === 'number' && typeof pricePerHemiUSD === 'number' && hemiReferenceUsdPrice > 0
    ? ((pricePerHemiUSD - hemiReferenceUsdPrice) / hemiReferenceUsdPrice) * 100
    : undefined;

  const unlockDate: Date | undefined = typeof token?.unlocksIn === 'number'
    ? new Date(Date.now() + token!.unlocksIn * 24 * 60 * 60 * 1000)
    : undefined;

  // Check if approval is needed
  useEffect(() => {
    if (currentAllowance !== undefined && token) {
      const hasEnoughAllowance = currentAllowance >= priceInWei;
      setNeedsApproval(!hasEnoughAllowance);
    }
  }, [currentAllowance, priceInWei, token]);
  
  // Check if user has enough balance
  const hasEnoughBalance = userBalance18Decimals >= priceInWei;

  // Human-readable balance in token units for display
  const formattedUserBalance: string | null = (() => {
    try {
      if (!userBalance || !token?.paymentToken.decimals) return null;
      const raw = BigInt(userBalance.toString());
      const decimals = token.paymentToken.decimals;
      const divisor = BigInt(10) ** BigInt(decimals);
      const integer = raw / divisor;
      const fraction = raw % divisor;
      const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '');
      const intStr = new Intl.NumberFormat('en-US').format(Number(integer));
      return fractionStr.length > 0 ? `${intStr}.${fractionStr}` : intStr;
    } catch {
      return null;
    }
  })();
  
  // Handle approval transaction completion
  useEffect(() => {
    if (isApproveConfirmed && isApproving) {
      setIsApproving(false);
      setNeedsApproval(false);
      refetchAllowance();
    }
  }, [isApproveConfirmed, isApproving, refetchAllowance]);
  
  // Handle buy transaction completion
  useEffect(() => {
    if (isBuyConfirmed && isBuying) {
      setIsBuying(false);
      onClose();
    }
  }, [isBuyConfirmed, isBuying, onClose]);
  
  const handleApprove = async () => {
    if (!token?.paymentToken.address) return;
    
    setIsApproving(true);
    
    try {
      await writeApproveContract({
        address: token.paymentToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.MARKETPLACE, priceInWei],
      });
    } catch (error) {
      console.error('Error approving token:', error);
      setIsApproving(false);
    }
  };
  
  const handlePurchase = async () => {
    if (!token) return;
    
    // If wallet is not connected, show wallet selection modal
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }
    
    if (needsApproval) {
      await handleApprove();
      return;
    }
    
    setIsBuying(true);
    
    try {
      await writeBuyContract({
        address: CONTRACTS.MARKETPLACE,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [BigInt(token.tokenId)],
      });
    } catch (error) {
      console.error('Error buying NFT:', error);
      setIsBuying(false);
    }
  };

  // @return
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[color:var(--card)] rounded-3xl border border-slate-800/80 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <header className="flex items-start justify-between mb-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Image src="/vehemi-locked-logo.png" alt="veHEMI" width={28} height={28} className="rounded" />
                      <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-white">
                        Buy veHEMI #{tokenId}
                      </h1>
                    </div>
                    {typeof hemiReferenceUsdPrice === 'number' && (
                      <p className="hidden md:block text-sm text-slate-400">Based on HEMI spot ${hemiReferenceUsdPrice.toFixed(4)}</p>
                    )}
                  </div>
                  {typeof percentVsCurrentHemi === 'number' && (
                    <span className={`hidden md:inline-flex shrink-0 self-start rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium ${percentVsCurrentHemi < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {`${percentVsCurrentHemi.toFixed(1)}% vs spot`}
                    </span>
                  )}
                  <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors ml-3" 
                    aria-label="Close dialog"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </header>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--hemi-orange)] mx-auto"></div>
                      <p className="mt-2 text-slate-400">Loading token details...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                      onClick={fetchTokenDetails}
                      className="px-4 py-2 bg-[color:var(--hemi-orange)] text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                      Retry
                    </button>
                  </div>
                ) : token ? (
                  <div className="space-y-6">
                    <section className="rounded-2xl p-0 border border-[#1E2937] bg-[#0F141B]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        <div className="rounded-xl bg-[#0B1218] p-4 border border-[#1E2937]">
                          <div className="text-xs uppercase tracking-wide text-[#93A4B7] mb-1">You get</div>
                          <div className="flex items-end gap-2">
                            <Tooltip 
                              content={
                                <div className="text-xs text-slate-300">
                                  {token.hemiAmount.toFixed(6)} HEMI
                                </div>
                              }
                              position="bottom"
                              className="!mt-1"
                            >
                              <div className="text-2xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatAmount(token.hemiAmount)} locked HEMI</div>
                            </Tooltip>
                          </div>
                          <div className="mt-2 text-sm text-[#93A4B7] flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Unlocks: <span className="text-white">{unlockDate ? formatDate(unlockDate) : '—'}</span>
                            </span>
                            <span className="opacity-70">({formatDuration(token.unlocksIn)})</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#0B1218] p-4 border border-[#1E2937]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs uppercase tracking-wide text-[#93A4B7]">You pay</div>
                            {formattedUserBalance && (
                              <div className={`text-xs ${hasEnoughBalance ? 'text-[#93A4B7]' : 'text-red-400'}`}>Balance: {formattedUserBalance} {token.paymentToken.symbol}</div>
                            )}
                          </div>
                          <div className="flex items-end gap-2">
                            <Tooltip 
                              content={
                                <div className="text-xs text-slate-300">
                                  {token.price.toFixed(8)} {token.paymentToken.symbol}
                                </div>
                              }
                              position="bottom"
                              className="!mt-1"
                            >
                              <div className="text-2xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {token.price < 1 
                                  ? formatTokenAmount(token.price, 4) 
                                  : formatTokenAmount(token.price, 0)
                                } {token.paymentToken.symbol}
                              </div>
                            </Tooltip>
                            {typeof totalUsdValue === 'number' && (
                              <div className="text-sm text-[#93A4B7]">(${formatUSDCNoGrouping(totalUsdValue, 2)})</div>
                            )}
                          </div>
                          {!hasEnoughBalance && (
                            <div className="mt-2 text-xs text-red-400">Insufficient balance to cover payment.</div>
                          )}
                        </div>
                      </div>
                      <div className="px-6">
                        <div className="rounded-xl border border-[#1E2937] bg-[#0B1218] p-4 flex items-center justify-between">
                          <div className="text-[13px] text-[#93A4B7]">Unit price (per locked HEMI)</div>
                          <div className="flex items-baseline gap-2">
                            <div className="text-base font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {typeof pricePerHemiInPaymentToken === 'number' 
                                ? `${pricePerHemiInPaymentToken < 1 
                                    ? pricePerHemiInPaymentToken.toFixed(4) 
                                    : pricePerHemiInPaymentToken.toFixed(0)
                                  } ${token.paymentToken.symbol}` 
                                : '—'}
                            </div>
                            <div className="text-xs text-[#93A4B7]">{typeof pricePerHemiUSD === 'number' ? `$${pricePerHemiUSD.toFixed(4)}` : '—'}</div>
                          </div>
                        </div>
                      </div>
                      <p className="px-6 pt-3 text-[13px] text-[#93A4B7]">Locked HEMI remains non-transferable until the unlock date. No early withdrawal.</p>
                      <div className="p-6">
                        <details className="group">
                          <summary className="list-none flex items-center gap-2 text-sm text-[#93A4B7] cursor-pointer select-none">
                            <span className="transition-transform group-open:rotate-90">›</span>
                            View full position details
                          </summary>
                          <div className="mt-3 rounded-xl border border-[#1E2937] bg-[#0B1218] p-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Contract</span>
                                <span className="font-mono">{shortenAddress((process.env.NEXT_PUBLIC_VEHEMI_ADDRESS as string) || (CONTRACTS as any).VEHEMI || (CONTRACTS as any).VEHEMI_ADDRESS)}</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Seller</span>
                                <span className="font-mono">{shortenAddress((token as any)?.seller?.address || (token as any)?.sellerAddress)}</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Position ID</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>#{token.tokenId}</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Network</span>
                                <span>Hemi</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Locked HEMI:</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{token.hemiAmount.toFixed(6)} HEMI</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-[#0F141B] p-3 border border-[#1E2937]">
                                <span className="text-[#93A4B7]">Unlock Date</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatUnlockDateTime(token.lockEndTimestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    </section>
                  </div>
                ) : null}

                {token && (
                  <footer className="mt-8 pt-6 border-t border-slate-800/60">
                    {isUserSeller() ? (
                      <div className="w-full rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 border border-[color:var(--hemi-cyan)] text-[color:var(--hemi-cyan)] bg-transparent">
                        <span>You own this veHEMI position</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handlePurchase} 
                        disabled={isBuying || isBuyPending || isBuyConfirming || isApproving || isApprovePending || isApproveConfirming || (isConnected && !hasEnoughBalance)}
                        className="w-full rounded-xl py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!isConnected ? (
                          <>
                            <User className="w-5 h-5" />
                            <span>Connect Wallet</span>
                          </>
                        ) : isBuying || isBuyPending || isBuyConfirming ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>
                              {isBuyPending ? 'Confirming...' : isBuyConfirming ? 'Processing...' : 'Buying...'}
                            </span>
                          </>
                        ) : isApproving || isApprovePending || isApproveConfirming ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>
                              {isApprovePending ? 'Confirming...' : isApproveConfirming ? 'Processing...' : 'Approving...'}
                            </span>
                          </>
                        ) : !hasEnoughBalance ? (
                          <>
                            <X className="w-5 h-5" />
                            <span>Insufficient balance</span>
                          </>
                        ) : needsApproval ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>
                              Approve {token.paymentToken.symbol} - {token.paymentToken.symbol === 'USDC' 
                                ? `${formatPriceUSD(token.price)} USDC` 
                                : `${token.price < 1 ? token.price.toFixed(4) : token.price.toFixed(0)} ${token.paymentToken.symbol}`
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            <span>
                              Buy veHEMI #{tokenId} - {token.paymentToken.symbol === 'USDC' 
                                ? `${formatPriceUSD(token.price)} USDC` 
                                : `${token.price < 1 ? token.price.toFixed(4) : token.price.toFixed(0)} ${token.paymentToken.symbol}`
                              }
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </footer>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <WalletSelectionModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
};
