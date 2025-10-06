/**
 * Wallet detection and utility functions
 */

// MetaMask detection utility
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.ethereum &&
    window.ethereum.isMetaMask === true
  );
};

// Check if MetaMask is available and unlocked
export const isMetaMaskAvailable = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    // Try to get accounts - this will fail if MetaMask is locked
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
};

// Check if any injected wallet is available
export const isInjectedWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.ethereum &&
    (window.ethereum.isMetaMask === true ||
     window.ethereum.isCoinbaseWallet === true ||
     window.ethereum.isRabby === true ||
     window.ethereum.isTrust === true)
  );
};

// Get wallet name from injected provider
export const getWalletName = (): string | null => {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  if (window.ethereum.isMetaMask === true) return 'MetaMask';
  if (window.ethereum.isCoinbaseWallet === true) return 'Coinbase Wallet';
  if (window.ethereum.isRabby === true) return 'Rabby';
  if (window.ethereum.isTrust === true) return 'Trust Wallet';
  
  return 'Injected Wallet';
};

// Enhanced error handling for wallet connection
export const getWalletConnectionError = (error: any): string => {
  if (error?.code === 4001) {
    return 'User rejected the connection request';
  }
  
  if (error?.code === -32002) {
    return 'MetaMask is already processing a request. Please check your MetaMask extension.';
  }
  
  if (error?.message?.includes('User denied')) {
    return 'Connection was denied. Please try again.';
  }
  
  if (error?.message?.includes('Already processing')) {
    return 'MetaMask is busy. Please wait and try again.';
  }
  
  return 'Failed to connect wallet. Please make sure MetaMask is installed and unlocked.';
};
