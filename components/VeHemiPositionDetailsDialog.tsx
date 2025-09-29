import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Clock, Calendar, User, ExternalLink, DollarSign } from 'lucide-react';
interface VeHemiToken {
  id: string;
  price: number;
  hemiAmount: number;
  lockDuration: number;
  unlocksIn: number;
  tokenId: string;
  imageUrl: string;
  listingCurrency?: 'USDC' | 'HEMI';
}
const mockToken: VeHemiToken = {
  id: '1',
  price: 1250,
  hemiAmount: 10000,
  lockDuration: 730,
  unlocksIn: 365,
  tokenId: '0x1a2b3c4d',
  imageUrl: '/placeholder.jpg',
  listingCurrency: 'USDC'
};
const mockSeller = {
  address: '0x742d35Cc6629C0532C6234Ca7ac0532C',
  reputation: 98
};

// @component: VeHemiPositionDetailsDialog
export const VeHemiPositionDetailsDialog = () => {
  const [isOpen, setIsOpen] = useState(true);
  // currency is determined per-offer, not user-selectable
  const currency: 'USDC' | 'HEMI' = mockToken.listingCurrency ?? 'USDC';
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
  const unitPrice = mockToken.hemiAmount > 0 ? mockToken.price / mockToken.hemiAmount : 0;
  const handleBuy = () => {
    console.log('Buy position:', mockToken.id, 'with', currency);
    setIsOpen(false);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  // @return
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 flex items-center justify-center">
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center gap-2 w-auto rounded-xl py-3 px-5 font-semibold transition-colors bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40">
        <DollarSign className="w-4 h-4" />
        <span>Open Position Details</span>
      </button>

      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} onClick={e => e.stopPropagation()} className="bg-[color:var(--card)] rounded-3xl border border-slate-800/80 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <header className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-white"><span>veHEMI Position Details</span></h1>
                  <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors" aria-label="Close dialog">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </header>

                <div className="space-y-8">
                  <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[color:var(--hemi-orange)] to-orange-600 rounded-xl flex items-center justify-center">
                        <Coins className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white"><span>{mockToken.tokenId}</span></h2>
                        <p className="text-slate-400"><span>veHEMI Position</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Coins className="w-4 h-4" />
                            <span className="text-sm">HEMI Amount</span>
                          </div>
                          <span className="text-white font-semibold">{formatAmount(mockToken.hemiAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Lock Duration</span>
                          </div>
                          <span className="text-white font-semibold">{formatDuration(mockToken.lockDuration)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Unlocks In</span>
                          </div>
                          <span className="text-white font-semibold">{formatDuration(mockToken.unlocksIn)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm">Price per HEMI</span>
                          </div>
                          <span className="text-white font-semibold">{currency === 'USDC' ? `$${unitPrice.toFixed(4)} USDC` : `${unitPrice.toFixed(4)} HEMI`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-slate-300">Total Price</span>
                        <span className="text-white font-bold">{currency === 'USDC' ? `${formatPriceUSD(mockToken.price)} USDC` : `${mockToken.price.toFixed(2)} HEMI`}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Seller</span>
                        <a href="#" className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-mono">
                          <span>{`${mockSeller.address.slice(0, 6)}...${mockSeller.address.slice(-6)}`}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </section>
                </div>

                <footer className="mt-8 pt-6 border-t border-slate-800/60">
                  <button onClick={handleBuy} className="w-full rounded-xl py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40">
                    <DollarSign className="w-5 h-5" />
                    <span>Buy veHEMI Position - {currency === 'USDC' ? `${formatPriceUSD(mockToken.price)} USDC` : `${mockToken.price.toFixed(2)} HEMI`}</span>
                  </button>
                </footer>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};