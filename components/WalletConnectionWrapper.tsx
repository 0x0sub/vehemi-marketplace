import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { ConnectWalletButton } from './ConnectWalletButton';
import { ConnectedWalletInfo } from './ConnectedWalletInfo';
import { useState, useEffect } from 'react';

// @component: WalletConnectionWrapper
export const WalletConnectionWrapper = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConnect = async () => {
    // This function is now handled by the WalletSelectionModal
    // The modal will show all available wallet options
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  // Format balance for display - use consistent formatting
  const formattedBalance = balance ? parseFloat(balance.formatted) : 0;

  // Prevent hydration mismatch by ensuring consistent rendering
  if (!isMounted) {
    // During SSR, always show connect button to avoid hydration mismatch
    return (
      <div className="relative">
        <ConnectWalletButton onConnect={handleConnect} isConnecting={false} />
      </div>
    );
  }

  // @return
  return <div className="relative">
      <AnimatePresence mode="wait">
        {!isConnected ? <motion.div key="connect-button" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} transition={{
        duration: 0.2
      }}>
            <ConnectWalletButton onConnect={handleConnect} isConnecting={isPending} />
          </motion.div> : <motion.div key="wallet-info" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} transition={{
        duration: 0.2
      }}>
            <ConnectedWalletInfo address={address!} balance={formattedBalance} onDisconnect={handleDisconnect} onCopyAddress={handleCopyAddress} />
          </motion.div>}
      </AnimatePresence>
    </div>;
};