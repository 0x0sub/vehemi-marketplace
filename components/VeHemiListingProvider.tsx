'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { VeHemiListingDrawer } from './VeHemiListingDrawer';

interface VeHemiListingContextType {
  openListingDrawer: (preselectedTokenId?: string) => void;
  closeListingDrawer: () => void;
}

const VeHemiListingContext = createContext<VeHemiListingContextType | undefined>(undefined);

export function VeHemiListingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedTokenId, setPreselectedTokenId] = useState<string | undefined>();

  const openListingDrawer = (tokenId?: string) => {
    setPreselectedTokenId(tokenId);
    setIsOpen(true);
  };

  const closeListingDrawer = () => {
    setIsOpen(false);
    setPreselectedTokenId(undefined);
  };

  return (
    <VeHemiListingContext.Provider value={{ openListingDrawer, closeListingDrawer }}>
      {children}
      <VeHemiListingDrawer
        isOpen={isOpen}
        onClose={closeListingDrawer}
        preselectedTokenId={preselectedTokenId}
      />
    </VeHemiListingContext.Provider>
  );
}

export function useVeHemiListing() {
  const context = useContext(VeHemiListingContext);
  if (context === undefined) {
    throw new Error('useVeHemiListing must be used within a VeHemiListingProvider');
  }
  return context;
}
