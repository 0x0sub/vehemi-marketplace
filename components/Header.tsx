'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from './ConnectWallet'
import { Button } from './ui/button'

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">VeHemi Trading</h1>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-sm font-medium hover:text-primary">
                Marketplace
              </a>
              <a href="/my-nfts" className="text-sm font-medium hover:text-primary">
                My NFTs
              </a>
              <a href="/list-nft" className="text-sm font-medium hover:text-primary">
                List NFT
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button variant="outline" size="sm" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}




