'use client'

import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { hemiMainnet, hemiSepolia } from '../lib/wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

// Get the expected chain ID from environment
const getExpectedChainId = () => {
  const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  if (envChainId) {
    return parseInt(envChainId);
  }
  // Default to Hemi Sepolia (testnet)
  return 743111;
};

const getChainName = (chainId: number) => {
  switch (chainId) {
    case 43111:
      return 'Hemi Mainnet';
    case 743111:
      return 'Hemi Sepolia';
    default:
      return `Chain ${chainId}`;
  }
};

const getChainExplorer = (chainId: number) => {
  switch (chainId) {
    case 43111:
      return 'https://explorer.hemi.xyz';
    case 743111:
      return 'https://testnet.explorer.hemi.xyz';
    default:
      return null;
  }
};

export const NetworkChecker = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const expectedChainId = getExpectedChainId();
  const isCorrectNetwork = chainId === expectedChainId;
  const expectedChainName = getChainName(expectedChainId);
  const currentChainName = getChainName(chainId);

  useEffect(() => {
    if (isConnected && !isCorrectNetwork && !isDismissed) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isConnected, isCorrectNetwork, isDismissed]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: expectedChainId as 43111 | 743111 });
      setShowBanner(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
  };

  if (!isConnected || isCorrectNetwork || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4"
        >
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Wrong Network
                </h3>
                <p className="text-xs text-amber-100 mb-3">
                  You're connected to <span className="font-medium">{currentChainName}</span>, 
                  but this app requires <span className="font-medium">{expectedChainName}</span>.
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitching}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {isSwitching ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        Switching...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Switch to {expectedChainName}
                      </>
                    )}
                  </button>
                  
                  {getChainExplorer(chainId) && (
                    <a
                      href={getChainExplorer(chainId)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-amber-200 hover:text-white border border-amber-500/30 hover:border-amber-500/50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Explorer
                    </a>
                  )}
                  
                  <button
                    onClick={handleDismiss}
                    className="px-2 py-1.5 text-xs text-amber-300 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
