import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SiteHeader } from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { VeHemiListingProvider } from '../components/VeHemiListingProvider'
import { Toaster } from '../components/ui/toaster'
import { NetworkChecker } from '../components/NetworkChecker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'veHEMI Marketplace - Trade locked HEMI veHEMI.com',
  description: 'Trade locked HEMI on the P2P marketplace for veHemi NFTs - veHEMI.com',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'veHEMI Marketplace - Trade locked HEMI',
    description: 'Trade locked HEMI on the P2P marketplace for veHemi NFTs',
    url: 'https://vehemi.com',
    siteName: 'veHEMI Marketplace',
    images: [
      {
        url: '/vehemi-og.jpg',
        width: 1200,
        height: 630,
        alt: 'veHEMI Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'veHEMI Marketplace - Trade locked HEMI',
    description: 'Trade locked HEMI on the P2P marketplace for veHemi NFTs',
    images: ['/vehemi-og.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <VeHemiListingProvider>
            <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-slate-900 to-black">
              <NetworkChecker />
              <SiteHeader />
              {children}
              <SiteFooter />
            </div>
            <Toaster />
          </VeHemiListingProvider>
        </Providers>
      </body>
    </html>
  )
}

