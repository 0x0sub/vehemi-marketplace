'use client'

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { WalletConnectionWrapper } from './WalletConnectionWrapper';
import { useVeHemiListing } from './VeHemiListingProvider';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openListingDrawer } = useVeHemiListing();
  const pathname = usePathname();

  return (
    <header className="w-full bg-black/40 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-4 sm:py-6 sm:mx-12 lg:mx-16 xl:mx-32 2xl:mx-48">
        <div className="flex items-center gap-4">
          <button type="button" className="inline-flex md:hidden items-center justify-center rounded-md border border-slate-700/60 bg-black/30 px-3 py-2 text-slate-200 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hemi-orange)]" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(v => !v)}>
            <span className="sr-only">Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>

          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="pt-1 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 230" className="h-9 w-9 sm:h-12 sm:w-12" aria-label="Hemi logo" role="img">
                <path fill="currentColor" className="[color:var(--hemi-orange)]" d="M134.3,1.9l-14,82.3h-10.7L95.7,1.9c-.2-1.1-1.2-1.8-2.3-1.6C39.3,10.5.2,57.9.2,115s39.1,104.5,93.2,114.7c1.1.2,2.1-.5,2.3-1.6l14-82.3h10.7l14,82.3c.2,1.1,1.2,1.8,2.3,1.6,54.1-10.1,93.2-57.6,93.2-114.7S190.7,10.5,136.6.3c-1.1-.2-2.1.5-2.3,1.6Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"><span className="text-[color:var(--hemi-orange)] font-semibold">veHEMI</span> Marketplace</span>
              </h1>
              <p className="mt-1 sm:mt-2 text-slate-400 text-sm sm:text-base hidden sm:block">
                <span>Liquid Trading Hub for Locked veHEMI</span>
              </p>
            </div>
          </div>

          <nav aria-label="primary" className="hidden md:flex items-center gap-6 pt-1">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Marketplace</span>
            </Link>
            <Link 
              href="/my-vehemi" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/my-vehemi' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>My veHEMI</span>
            </Link>
            <Link 
              href="/activity" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/activity' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Activity</span>
            </Link>
            <button 
              onClick={() => openListingDrawer()}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span>List veHEMI</span>
            </button>
          </nav>

          <nav aria-label="wallet actions" className="ml-auto hidden md:flex items-center gap-2">
            <WalletConnectionWrapper />
          </nav>
        </div>

        <div id="mobile-menu" className={mobileMenuOpen ? "md:hidden mt-4" : "hidden"}>
          <nav aria-label="mobile" className="rounded-xl border border-slate-800 bg-black/40 p-3">
            <ul className="flex flex-col divide-y divide-slate-800/70">
              <li className="py-2">
                <Link 
                  href="/" 
                  className={`flex items-center justify-between transition-colors ${
                    pathname === '/' 
                      ? 'text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Marketplace</span>
                  <span aria-hidden="true" className="text-slate-500">›</span>
                </Link>
              </li>
              <li className="py-2">
                <Link 
                  href="/my-vehemi" 
                  className={`flex items-center justify-between transition-colors ${
                    pathname === '/my-vehemi' 
                      ? 'text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>My veHEMI</span>
                  <span aria-hidden="true" className="text-slate-500">›</span>
                </Link>
              </li>
              <li className="py-2">
                <Link 
                  href="/activity" 
                  className={`flex items-center justify-between transition-colors ${
                    pathname === '/activity' 
                      ? 'text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Activity</span>
                  <span aria-hidden="true" className="text-slate-500">›</span>
                </Link>
              </li>
              <li className="py-2">
                <button 
                  onClick={() => openListingDrawer()}
                  className="flex items-center justify-between text-slate-300 hover:text-white w-full text-left"
                >
                  <span>List veHEMI</span>
                  <span aria-hidden="true" className="text-slate-500">›</span>
                </button>
              </li>
              <li className="py-2">
                <div className="pt-2">
                  <WalletConnectionWrapper />
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

    </header>
  );
}


