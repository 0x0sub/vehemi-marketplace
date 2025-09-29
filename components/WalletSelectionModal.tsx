'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect } from 'wagmi';
import { X, Wallet, Smartphone, ExternalLink } from 'lucide-react';
import { useIsMobile } from '../hooks/generated/use-mobile';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSelectionModal({ isOpen, onClose }: WalletSelectionModalProps) {
  const { connect, connectors, isPending } = useConnect();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleWalletSelect = async (connector: any) => {
    setSelectedConnector(connector.uid);
    try {
      console.log('🔄 Connecting with:', connector.name);
      console.log('📱 Connector type:', connector.type);
      console.log('📱 Is mobile:', isMobile);
      
      // Add mobile-specific handling
      if (isMobile && connector.type === 'injected') {
        // For mobile browsers, injected connectors might not be available
        console.log('⚠️ Injected connector on mobile - may not work');
      }
      
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setSelectedConnector(null);
      
      // Show user-friendly error for mobile
      if (isMobile) {
        alert(`Failed to connect with ${connector.name}. Please make sure the wallet app is installed and try again.`);
      }
    }
  };

  const getWalletIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('walletconnect')) return '📱';
    if (name.includes('rabby')) return '🐰';
    if (name.includes('trust')) return '🛡️';
    return '💳';
  };

  const getWalletDescription = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return 'Connect using MetaMask browser extension';
    if (name.includes('coinbase')) return 'Connect using Coinbase Wallet';
    if (name.includes('walletconnect')) return 'Connect using any WalletConnect compatible wallet';
    if (name.includes('rabby')) return 'Connect using Rabby wallet';
    if (name.includes('trust')) return 'Connect using Trust Wallet';
    return 'Connect using your preferred wallet';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-md bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-2xl ${
            isMobile ? 'mx-4 max-h-[90vh] overflow-y-auto' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
                <p className="text-sm text-slate-400">Choose your preferred wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Wallet Options */}
          <div className="p-6 space-y-3">
            {connectors.map((connector) => (
              <motion.button
                key={connector.uid}
                onClick={() => handleWalletSelect(connector)}
                disabled={isPending && selectedConnector === connector.uid}
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMobile ? 'min-h-[60px]' : ''
                }`}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {getWalletIcon(connector.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{connector.name}</h3>
                      {isPending && selectedConnector === connector.uid && (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {getWalletDescription(connector.name)}
                    </p>
                  </div>
                  {connector.type === 'injected' && (
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  )}
                  {connector.type === 'walletConnect' && (
                    <Smartphone className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/60">
            <p className="text-xs text-slate-500 text-center">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
              <br />
              Make sure you're on the correct network.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
