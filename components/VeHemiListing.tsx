import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Wallet, Coins, Calendar, Timer, Hash, AlertCircle, X, Loader2 } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS, MARKETPLACE_ABI, ERC721_ABI } from "../lib/contracts";
import { useToast } from "../hooks/use-toast";
import { useVeHemiListing } from "./VeHemiListingProvider";
export interface WalletToken {
  id: string;
  hemiLocked: number; // amount of HEMI locked backing the veHEMI
  lockTotalDays: number; // total lock term in days
  unlocksInDays: number; // remaining days until unlock
}
export interface VeHemiListingProps {
  // If provided, we directly open the listing dialog for this token
  tokenId?: string;
  // Optional: tokens available from the connected wallet for selection (way 1)
  walletTokens?: WalletToken[];
  // Mocked connect state
  isConnected?: boolean;
}
const durationQuickSelects = [{
  label: "1 day",
  hours: 24
}, {
  label: "7 days",
  hours: 24 * 7
}, {
  label: "30 days",
  hours: 24 * 30
}] as any[];

// Ensure we do not inline arrays in JSX maps per constraints
const currencyOptions = [{
  code: "HEMI",
  label: "HEMI"
}, {
  code: "USDC",
  label: "USDC"
}] as any[];
export default function VeHemiListing({
  tokenId,
  walletTokens = [],
  isConnected = false
}: VeHemiListingProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(tokenId);
  const [durationHours, setDurationHours] = useState<number>(24 * 30);
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<"HEMI" | "USDC">("USDC");
  const [touchedPrice, setTouchedPrice] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [approvalChecked, setApprovalChecked] = useState(false);

  const { address, isConnected: walletConnected } = useAccount();
  const { toast } = useToast();
  const { closeListingDrawer } = useVeHemiListing();
  const chainId = useChainId();
  
  // Get contract addresses from environment
  const marketplaceAddress = CONTRACTS.MARKETPLACE;
  const veHemiAddress = CONTRACTS.VEHEMI;
  const hemiAddress = CONTRACTS.HEMI;
  const usdcAddress = CONTRACTS.USDC;

  // Derive selected token data
  const selectedToken: WalletToken | undefined = useMemo(() => {
    if (!selectedTokenId) return undefined;
    return walletTokens.find(t => t.id === selectedTokenId);
  }, [selectedTokenId, walletTokens]);

  // Auto-select token when tokenId prop changes
  useEffect(() => {
    if (tokenId) setSelectedTokenId(tokenId);
  }, [tokenId]);

  // Debounced approval checking to reduce RPC calls
  useEffect(() => {
    if (selectedTokenId && address && !approvalChecked) {
      const timer = setTimeout(() => {
        setApprovalChecked(true);
      }, 500); // 500ms delay before checking approval
      
      return () => clearTimeout(timer);
    }
  }, [selectedTokenId, address, approvalChecked]);

  // Check if marketplace is approved for the selected token (only when needed)
  const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
    address: veHemiAddress,
    abi: ERC721_ABI,
    functionName: 'isApprovedForAll',
    args: address && selectedTokenId ? [address, marketplaceAddress] : undefined,
    query: {
      enabled: !!address && !!selectedTokenId && !!marketplaceAddress && approvalChecked && !isApproving && !isListing,
      refetchInterval: false, // Disable automatic refetching
      staleTime: 60000, // Cache for 60 seconds
    },
  });

  // Check if specific token is approved (only when needed)
  const { data: approvedAddress } = useReadContract({
    address: veHemiAddress,
    abi: ERC721_ABI,
    functionName: 'getApproved',
    args: selectedTokenId ? [BigInt(selectedTokenId)] : undefined,
    query: {
      enabled: !!selectedTokenId && approvalChecked && !isApprovedForAll && !isApproving && !isListing,
      refetchInterval: false, // Disable automatic refetching
      staleTime: 60000, // Cache for 60 seconds
    },
  });

  const isTokenApproved = isApprovedForAll || approvedAddress === marketplaceAddress;
  
  // Debug logging
  useEffect(() => {
    console.log('Approval state:', {
      isApprovedForAll,
      approvedAddress,
      marketplaceAddress,
      isTokenApproved,
      approvalChecked,
      selectedTokenId
    });
  }, [isApprovedForAll, approvedAddress, marketplaceAddress, isTokenApproved, approvalChecked, selectedTokenId]);

  // Contract write functions
  const { writeContract: writeContractApproval, data: approvalHash } = useWriteContract();
  const { writeContract: writeContractListing, data: listingHash } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApprovalPending, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Wait for listing transaction
  const { isLoading: isListingPending, isSuccess: isListingSuccess } = useWaitForTransactionReceipt({
    hash: listingHash,
  });

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproving(false);
      setApprovalChecked(false); // Reset to trigger re-check
      // Refetch approval status to update the UI with a small delay to ensure blockchain state is updated
      setTimeout(() => {
        refetchApproval();
      }, 1000);
      toast({
        title: "Approval Successful",
        description: "The marketplace can now manage your veHEMI token. You can now create your listing.",
        variant: "success",
      });
    }
  }, [isApprovalSuccess, toast, refetchApproval]);

  // Handle listing success
  useEffect(() => {
    if (isListingSuccess) {
      setIsListing(false);
      toast({
        title: "Listing Created",
        description: "Your veHEMI position has been successfully listed on the marketplace.",
        variant: "success",
      });
      // Close the drawer after successful listing
      setTimeout(() => {
        closeListingDrawer();
      }, 1500); // Small delay to show the success message
    }
  }, [isListingSuccess, toast, closeListingDrawer]);

  const feeRate = 0.05;
  const fee = price > 0 ? price * feeRate : 0;
  const proceeds = price > 0 ? Math.max(price - fee, 0) : 0;
  const priceError = touchedPrice && price <= 0 ? "Enter a positive price" : undefined;
  const tokenError = !selectedTokenId ? "Select a veHEMI token" : undefined;
  const canSubmit = !!selectedTokenId && price > 0 && durationHours >= 1;

  // Handle approval transaction
  const handleApproval = async () => {
    if (!selectedTokenId || !marketplaceAddress) {
      console.error('Missing required parameters for approval:', { selectedTokenId, marketplaceAddress });
      return;
    }
    
    try {
      setIsApproving(true);
      console.log('Approving marketplace:', { veHemiAddress, marketplaceAddress });
      
      await writeContractApproval({
        address: veHemiAddress,
        abi: ERC721_ABI,
        functionName: 'setApprovalForAll',
        args: [marketplaceAddress, true],
      });
    } catch (error) {
      console.error('Approval failed:', error);
      setIsApproving(false);
      toast({
        title: "Approval Failed",
        description: `Failed to approve the marketplace: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Handle listing transaction
  const handleListing = async () => {
    if (!selectedTokenId || !marketplaceAddress || !price) {
      console.error('Missing required parameters:', { selectedTokenId, marketplaceAddress, price });
      return;
    }
    
    try {
      setIsListing(true);
      // Calculate price based on currency decimals
      const decimals = currency === "USDC" ? 6 : 18;
      const priceInWei = BigInt(Math.floor(price * Math.pow(10, decimals)));
      const durationInSeconds = BigInt(durationHours * 3600);
      
      // Get payment token address based on currency
      const paymentTokenAddress = currency === "HEMI" ? hemiAddress : usdcAddress;
      
      if (currency === "USDC" && (!usdcAddress || usdcAddress === "0x...")) {
        toast({
          title: "USDC Not Configured",
          description: "USDC payment token address is not configured. Please use HEMI for now.",
          variant: "destructive",
        });
        setIsListing(false);
        return;
      }
      
      console.log('Listing parameters:', {
        tokenId: selectedTokenId,
        price: priceInWei.toString(),
        paymentToken: paymentTokenAddress,
        duration: durationInSeconds.toString(),
        marketplace: marketplaceAddress
      });
      
      await writeContractListing({
        address: marketplaceAddress,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [
          BigInt(selectedTokenId),
          priceInWei,
          paymentTokenAddress,
          durationInSeconds,
        ],
      });
    } catch (error) {
      console.error('Listing failed:', error);
      setIsListing(false);
      toast({
        title: "Listing Failed",
        description: `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Submit clicked:', { isTokenApproved, canSubmit, selectedTokenId, price });
    
    if (!canSubmit) {
      console.log('Cannot submit:', { selectedTokenId, price, durationHours });
      return;
    }
    
    if (!isTokenApproved) {
      console.log('Token not approved, requesting approval...');
      await handleApproval();
    } else {
      console.log('Token approved, creating listing...');
      await handleListing();
    }
  };

  // Reset approval checked state after successful approval to re-check status
  useEffect(() => {
    if (isApprovalSuccess) {
      setApprovalChecked(false);
    }
  }, [isApprovalSuccess]);

  // Auto-switch to HEMI if USDC is not configured
  useEffect(() => {
    if (currency === "USDC" && (!usdcAddress || usdcAddress === "0x...")) {
      setCurrency("HEMI");
      toast({
        title: "Currency Changed",
        description: "USDC is not available. Switched to HEMI.",
        variant: "destructive",
      });
    }
  }, [currency, usdcAddress, toast]);

  return <section aria-label="Create veHEMI listing" className="max-w-2xl mx-auto p-6 sm:p-8 bg-[color:var(--card)] border border-slate-800/70 rounded-3xl shadow-lg">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white"><span>Create veHEMI Listing</span></h1>
        <p className="text-slate-400 mt-1"><span>List your veHEMI position.</span></p>
      </header>

      {/* Way 1: No tokenId -> select from wallet */}
      {!selectedTokenId && <div className="space-y-3 mb-8">
          <label htmlFor="token-select" className="text-sm font-medium text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span>Select veHEMI Token</span>
          </label>
          <div className="relative">
            <select 
              id="token-select" 
              className="w-full appearance-none bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-3.5 text-slate-200 pr-12 transition-all duration-200 hover:bg-slate-800/80 hover:border-slate-600/80 focus:outline-none focus:ring-2 focus:ring-[color:var(--hemi-orange)]/50 focus:border-[color:var(--hemi-orange)]/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900/40 disabled:border-slate-800/40" 
              value={selectedTokenId || ""} 
              onChange={e => setSelectedTokenId(e.target.value || undefined)} 
              disabled={!isConnected || walletTokens.length === 0} 
              aria-invalid={!!tokenError}
            >
              <option value="" disabled className="bg-slate-800 text-slate-300">{!isConnected ? "Connect wallet to see tokens" : walletTokens.length === 0 ? "No veHEMI tokens in wallet" : "Choose a token"}</option>
              {walletTokens.map(t => <option key={t.id} value={t.id} className="bg-slate-800 text-slate-200">{`${t.id} • ${t.hemiLocked.toLocaleString()} HEMI locked • unlocks in ${t.unlocksInDays}d`}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200" />
          </div>
          {tokenError && <p className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{tokenError}</span>
            </p>}
        </div>}

      {/* Way 2: tokenId provided -> show context about the position */}
      {selectedTokenId && selectedToken && <section aria-label="veHEMI position" className="mb-8">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-medium text-slate-300">
                <span>Selected veHEMI Position</span>
              </h2>
              <button type="button" onClick={() => setSelectedTokenId(undefined)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:bg-slate-800" aria-label="Clear selected token" title="Clear selected token">
                <span>Change</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">
                  <span>Token ID</span>
                </div>
                <div className="text-white font-bold text-lg">
                  <span>#{selectedToken.id}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">
                  <span>HEMI Locked</span>
                </div>
                <div className="text-white font-bold text-lg">
                  <span>{selectedToken.hemiLocked.toFixed(3)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">
                  <span>Unlocks</span>
                </div>
                <div className="text-white font-bold text-lg">
                  <span>{selectedToken.unlocksInDays} days</span>
                </div>
                <div className="text-slate-500 text-xs">
                  <span>({new Date(Date.now() + selectedToken.unlocksInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})</span>
                </div>
              </div>
            </div>
          </div>
        </section>}

      {/* Listing parameters */}
      <form className="space-y-8" onSubmit={e => e.preventDefault()}>
        <section className="space-y-3" aria-label="Listing duration">
          <label htmlFor="duration" className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Listing Duration</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durationQuickSelects.map(d => <button key={d.label} type="button" className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${durationHours === d.hours ? "bg-gradient-to-r from-[color:var(--hemi-slate)] to-black text-[color:var(--hemi-white)] border-slate-800" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700 border-slate-700/60"}`} onClick={() => setDurationHours(d.hours)}>
                <span>{d.label}</span>
              </button>)}
          </div>
          <div className="relative">
            <input id="duration" type="number" min={1} max={24 * 30} value={durationHours} onChange={e => setDurationHours(Math.min(Math.max(parseInt(e.target.value || "0", 10), 1), 24 * 30))} className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200" aria-describedby="duration-help" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">hours</span>
          </div>
          <p id="duration-help" className="text-xs text-slate-400"><span>Range: 1 hour to 30 days</span></p>
        </section>

        <section className="space-y-3" aria-label="Price">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-400" />
            <span>Listing Price</span>
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-stretch">
            <div className="relative">
              <input type="number" min={0} step={0.0001} value={price === 0 ? "" : String(price)} onChange={e => setPrice(parseFloat(e.target.value) || 0)} onBlur={() => setTouchedPrice(true)} className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200" placeholder="Enter price" aria-invalid={!!priceError} />
              {priceError && <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{priceError}</span>
                </p>}
            </div>
            <div className="relative">
              <select 
                className="h-full appearance-none bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-3.5 text-slate-200 pr-10 transition-all duration-200 hover:bg-slate-800/80 hover:border-slate-600/80 focus:outline-none focus:ring-2 focus:ring-[color:var(--hemi-orange)]/50 focus:border-[color:var(--hemi-orange)]/60" 
                value={currency} 
                onChange={e => setCurrency(e.target.value as "HEMI" | "USDC")} 
                aria-label="Currency"
              >
                {currencyOptions.map(c => (
                  <option 
                    key={c.code} 
                    value={c.code} 
                    className="bg-slate-800 text-slate-200"
                    disabled={c.code === "USDC" && (!usdcAddress || usdcAddress === "0x...")}
                  >
                    {c.label} {c.code === "USDC" && (!usdcAddress || usdcAddress === "0x...") ? "(Not Available)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200" />
            </div>
          </div>
        </section>

        <section className="space-y-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-4" aria-label="Summary">
          <h2 className="text-white font-semibold"><span>Summary</span></h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-slate-400"><span>Duration</span></p>
            <p className="text-white text-right font-medium"><span>{Math.round(durationHours / 24)} days</span></p>
            <p className="text-slate-400"><span>Price</span></p>
            <p className="text-white text-right font-medium"><span>{price > 0 ? price.toLocaleString() : 0} {currency}</span></p>
            <p className="text-slate-400"><span>Fee (5%)</span></p>
            <p className="text-white text-right font-medium"><span>{price > 0 ? fee.toLocaleString() : 0} {currency}</span></p>
            <p className="text-slate-400"><span>You receive</span></p>
            <p className="text-white text-right font-semibold"><span>{proceeds > 0 ? proceeds.toLocaleString() : 0} {currency}</span></p>
          </div>
        </section>

        <button 
          type="button" 
          onClick={handleSubmit}
          disabled={!canSubmit || isApproving || isListing || isApprovalPending || isListingPending} 
          className="w-full rounded-xl py-4 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 flex items-center justify-center gap-2"
        >
          {isApproving || isApprovalPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Approving Marketplace...</span>
            </>
          ) : isListing || isListingPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Listing...</span>
            </>
          ) : !isTokenApproved ? (
            <span>Approve & List</span>
          ) : (
            <span>Create veHEMI Listing</span>
          )}
        </button>
      </form>
    </section>;
}