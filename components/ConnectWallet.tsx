'use client'

import { useConnect } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { Button } from './ui/button'

export function ConnectWallet() {
  const { connect, connectors, isPending } = useConnect()

  return (
    <div className="flex flex-col space-y-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          variant="outline"
          className="w-full"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </Button>
      ))}
    </div>
  )
}




