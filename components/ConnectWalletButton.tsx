import { Wallet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/generated/use-mobile';
import { WalletSelectionModal } from './WalletSelectionModal';
import { useState } from 'react';

interface ConnectWalletButtonProps {
  onConnect: () => void;
  isConnecting: boolean;
}

// @component: ConnectWalletButton
export const ConnectWalletButton = ({
  onConnect,
  isConnecting
}: ConnectWalletButtonProps) => {
  const isMobile = useIsMobile();
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Enhanced click handler for mobile compatibility
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show wallet selection modal instead of direct connection
    setShowWalletModal(true);
  };

  // @return
  return (
    <>
      <motion.button 
        onClick={handleClick}
        onTouchEnd={handleClick}
        disabled={isConnecting} 
        whileHover={!isMobile ? {
          scale: 1.02
        } : {}}
        whileTap={{
          scale: 0.98
        }}
        style={{
          touchAction: 'manipulation', // Prevents double-tap zoom on mobile
          WebkitTapHighlightColor: 'transparent', // Removes tap highlight on iOS
        }}
        className="inline-flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-6 py-3 text-sm font-medium text-slate-100 hover:bg-slate-900 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200" 
        aria-label={isConnecting ? "Connecting wallet..." : "Connect Wallet"}>
          {isConnecting ? <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}>
            <Loader2 className="w-5 h-5 text-cyan-400" />
          </motion.div> : <Wallet className="w-5 h-5 text-slate-300" />}
        
        <span className="font-semibold">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>

        {!isConnecting && <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60" />}
      </motion.button>

      <WalletSelectionModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
};