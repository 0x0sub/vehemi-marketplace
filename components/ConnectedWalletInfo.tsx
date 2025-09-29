import { useState, useEffect } from 'react';
import { Copy, LogOut, Check, Wallet, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ConnectedWalletInfoProps {
  address: string;
  balance: number;
  onDisconnect: () => void;
  onCopyAddress: () => void;
}

// @component: ConnectedWalletInfo
export const ConnectedWalletInfo = ({
  address,
  balance,
  onDisconnect,
  onCopyAddress
}: ConnectedWalletInfoProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  const formatBalance = (bal: number): string => {
    return bal.toFixed(4);
  };
  const handleCopyAddress = async () => {
    await onCopyAddress();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    onDisconnect();
  };

  // Prevent hydration mismatch by ensuring consistent rendering
  if (!isMounted) {
    return (
      <div className="relative">
        {/* Mobile View - Static during SSR */}
        <div className="md:hidden">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-100">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <Wallet className="w-4 h-4 text-slate-300" />
            <span className="font-semibold">{formatAddress(address)}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Desktop View - Static during SSR */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{formatAddress(address)}</span>
                  <div className="p-1 rounded-md">
                    <Copy className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  <span>{formatBalance(balance)} ETH</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm text-slate-300">
            <LogOut className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // @return
  return <div className="relative">
      {/* Mobile View */}
      <div className="md:hidden">
        <motion.button onClick={() => setIsDropdownOpen(!isDropdownOpen)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-100 hover:bg-slate-900 hover:border-slate-600 transition-all duration-200" aria-label="Wallet menu">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <Wallet className="w-4 h-4 text-slate-300" />
          <span className="font-semibold">{formatAddress(address)}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{formatAddress(address)}</span>
                <motion.button onClick={handleCopyAddress} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }} className="p-1 rounded-md hover:bg-slate-800 transition-colors group" aria-label="Copy wallet address">
                  <AnimatePresence mode="wait">
                    {isCopied ? <motion.div key="check" initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} exit={{
                    scale: 0
                  }} transition={{
                    duration: 0.15
                  }}>
                        <Check className="w-3 h-3 text-emerald-400" />
                      </motion.div> : <motion.div key="copy" initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} exit={{
                    scale: 0
                  }} transition={{
                    duration: 0.15
                  }}>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
                      </motion.div>}
                  </AnimatePresence>
                </motion.button>
              </div>
              <p className="text-xs text-slate-400">
                <span>{formatBalance(balance)} ETH</span>
              </p>
            </div>
          </div>
        </div>

        <motion.button onClick={handleDisconnect} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm text-slate-300 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 transition-all duration-200 group" aria-label="Disconnect wallet">
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && <motion.div initial={{
        opacity: 0,
        y: -8,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: -8,
        scale: 0.95
      }} transition={{
        duration: 0.15
      }} className="absolute top-full mt-2 right-0 w-64 bg-slate-950/95 backdrop-blur-sm border border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden md:hidden">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">
                    <span>Connected Wallet</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    <span>{formatBalance(balance)} ETH</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={handleCopyAddress} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-900 transition-colors text-left">
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200">
                      <span>{isCopied ? 'Address Copied!' : 'Copy Address'}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      <span>{address}</span>
                    </p>
                  </div>
                </button>

                <button onClick={handleDisconnect} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors text-left">
                  <LogOut className="w-4 h-4 text-red-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-400">
                      <span>Disconnect</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      <span>Sign out of your wallet</span>
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};