'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect } from 'wagmi';
import { X, Wallet, Smartphone, ExternalLink, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '../hooks/generated/use-mobile';
import { isMetaMaskInstalled, isInjectedWalletAvailable, getWalletConnectionError } from '../lib/wallet-utils';
import { createPortal } from 'react-dom';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSelectionModal({ isOpen, onClose }: WalletSelectionModalProps) {
  const { connect, connectors, isPending } = useConnect();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean>(true);
  const isMobile = useIsMobile();

  // Check wallet availability when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkAvailability = async () => {
        const hasInjectedWallet = isInjectedWalletAvailable();
        const hasMetaMask = isMetaMaskInstalled();
        
        console.log('🔍 Wallet availability check:', {
          hasInjectedWallet,
          hasMetaMask,
          connectors: connectors.length
        });
        
        setIsWalletAvailable(hasInjectedWallet || connectors.length > 0);
      };
      
      checkAvailability();
    }
  }, [isOpen, connectors.length]);

  const handleWalletSelect = async (connector: any) => {
    setSelectedConnector(connector.uid);
    setConnectionError(null);
    
    try {
      console.log('🔄 Connecting with:', connector.name);
      console.log('📱 Connector type:', connector.type);
      console.log('📱 Is mobile:', isMobile);
      
      // Pre-connection checks
      if (connector.name.toLowerCase().includes('metamask') && !isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask from the Chrome Web Store.');
      }
      
      if (connector.type === 'injected' && !isInjectedWalletAvailable()) {
        throw new Error('No injected wallet detected. Please install a compatible wallet extension.');
      }
      
      // Add mobile-specific handling
      if (isMobile && connector.type === 'injected') {
        console.log('⚠️ Injected connector on mobile - may not work');
      }
      
      await connect({ connector });
      onClose();
    } catch (error: any) {
      console.error('❌ Connection failed:', error);
      setSelectedConnector(null);
      
      const errorMessage = getWalletConnectionError(error);
      setConnectionError(errorMessage);
      
      // Show user-friendly error
      if (isMobile) {
        alert(errorMessage);
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

  const isWalletConnectorAvailable = (connector: any) => {
    // MetaMask connector should always be available - it handles detection internally
    if (connector.name.toLowerCase().includes('metamask')) {
      return true;
    }
    if (connector.type === 'injected') {
      return isInjectedWalletAvailable();
    }
    return true; // WalletConnect and other connectors are always available
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-md bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '28rem',
            minHeight: '400px',
            maxHeight: 'calc(100vh - 40px)',
            overflow: 'auto',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            margin: '0 auto',
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

          {/* Error Display */}
          {connectionError && (
            <div className="mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-300">{connectionError}</p>
              </div>
            </div>
          )}

          {/* Wallet Availability Warning */}
          {!isWalletAvailable && (
            <div className="mx-6 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <p className="text-sm text-yellow-300">
                  No wallet detected. Please install a compatible wallet extension.
                </p>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="p-6 space-y-3">
            {connectors.map((connector) => {
              const isAvailable = isWalletConnectorAvailable(connector);
              const isConnecting = isPending && selectedConnector === connector.uid;
              
              return (
                <motion.button
                  key={connector.uid}
                  onClick={() => isAvailable && handleWalletSelect(connector)}
                  disabled={!isAvailable || isConnecting}
                  whileHover={!isMobile && isAvailable ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    isAvailable
                      ? 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600'
                      : 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed'
                  } ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
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
                      <h3 className={`font-medium ${isAvailable ? 'text-white' : 'text-slate-500'}`}>
                        {connector.name}
                      </h3>
                      {isConnecting && (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {!isAvailable && (
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                          Not Available
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isAvailable 
                        ? getWalletDescription(connector.name)
                        : 'Wallet not detected. Please install the extension.'
                      }
                    </p>
                  </div>
                  {isAvailable && connector.type === 'injected' && (
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  )}
                  {isAvailable && connector.type === 'walletConnect' && (
                    <Smartphone className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </motion.button>
              );
            })}
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

  // Use portal to render modal at document body level
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
