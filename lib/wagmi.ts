import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { hemi, hemiSepolia } from 'hemi-viem'

// Export the chains for use in other parts of the application
export { hemi as hemiMainnet, hemiSepolia }

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo_project_id'

// Create wagmi config
export const config = createConfig({
  chains: [hemi, hemiSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    // Only add walletConnect if we have a valid project ID and we're in the browser
    ...(typeof window !== 'undefined' && projectId && projectId !== 'demo_project_id' ? [walletConnect({ 
      projectId,
      metadata: {
        name: 'VeHemi Trading',
        description: 'P2P marketplace for veHemi NFTs',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://vehemi-trade.com',
        icons: ['https://vehemi-trade.com/favicon.ico']
      }
    })] : []),
    coinbaseWallet({ appName: 'VeHemi Trading' }),
  ],
  transports: {
    [hemi.id]: http(),
    [hemiSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.rpc.hemi.network/rpc'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
