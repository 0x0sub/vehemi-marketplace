export const metadata = {
  title: 'About - veHEMI Marketplace',
  description: 'Learn about the veHEMI marketplace - the first P2P trading platform for locked HEMI token positions.',
}

export default function AboutPage() {
  return (
    <main className="w-full text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              First P2P Marketplace for Locked HEMI
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Turn Locked Tokens Into
              <span className="block bg-gradient-to-r from-[#2599EE] to-[#ff6a00] bg-clip-text text-transparent">
                Liquid Opportunity
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-[#C8D4E1] leading-relaxed mb-10 max-w-3xl mx-auto">
              The first peer-to-peer trading platform for locked HEMI positions. 
              Get liquidity today or acquire HEMI at discounted prices.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                Explore Marketplace
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a 
                href="#how-it-works" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-slate-800/60 border border-slate-700 rounded-xl hover:bg-slate-700/60 transition-all duration-200"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">5%</div>
                <div className="text-sm text-[#93A4B7] mt-1">Platform Fee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">0%</div>
                <div className="text-sm text-[#93A4B7] mt-1">Buyer Fees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-[#93A4B7] mt-1">Trustless</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">The Problem We Solve</h2>
          <p className="text-lg text-[#93A4B7] max-w-2xl mx-auto">
            Locked tokens shouldn't mean locked opportunities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Sellers */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50" />
            <div className="relative h-full rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-red-500/50 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Token Holders</h3>
              <p className="text-[#C8D4E1] leading-relaxed">
                Your tokens are <span className="text-red-400 font-semibold">locked for months or years</span>, creating a financial constraint. Whether it's an emergency, a better investment opportunity, or simply needing cash, you're stuck waiting.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="text-sm text-[#93A4B7] font-semibold mb-2">Common scenarios:</div>
                <ul className="space-y-2 text-sm text-[#C8D4E1]">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Received HEMI Genesis Drop but need immediate liquidity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Market conditions changed and you want to exit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Better investment opportunities arose</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* For Buyers */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50" />
            <div className="relative h-full rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-green-500/50 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">For Savvy Investors</h3>
              <p className="text-[#C8D4E1] leading-relaxed">
                You want HEMI exposure but don't want to pay <span className="text-green-400 font-semibold">full market price</span>. Buy locked positions at a discount and unlock value over time.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="text-sm text-[#93A4B7] font-semibold mb-2">Benefits:</div>
                <ul className="space-y-2 text-sm text-[#C8D4E1]">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Acquire HEMI at a discount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Better entry prices for long-term believers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Diversify with HEMI or USDC payments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Statement */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-lg font-semibold text-white">veHEMI.com creates a liquid secondary market where everyone wins</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative mx-auto w-full max-w-[1200px] px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-[#93A4B7] max-w-2xl mx-auto">
            Simple, secure, and trustless trading in just a few steps
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Sellers */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">For Sellers</h3>
              </div>
              <p className="text-[#93A4B7] mb-6">Turn locked tokens into cash</p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Connect Your Wallet</div>
                    <div className="text-sm text-[#C8D4E1]">Connect the wallet holding your veHemi NFTs</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</div>
                  <div>
                    <div className="font-semibold text-white mb-1">View Your Positions</div>
                    <div className="text-sm text-[#C8D4E1]">See all your locked HEMI positions with details</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</div>
                  <div>
                    <div className="font-semibold text-white mb-1">List for Sale</div>
                    <div className="text-sm text-[#C8D4E1]">Set your price in HEMI or USDC</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">4</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Get Paid</div>
                    <div className="text-sm text-[#C8D4E1]">Receive payment immediately (minus 5% fee)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* For Buyers */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-3xl" />
            <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">For Buyers</h3>
              </div>
              <p className="text-[#93A4B7] mb-6">Get HEMI at a discount</p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold">1</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Browse Listings</div>
                    <div className="text-sm text-[#C8D4E1]">Explore all available locked HEMI positions</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold">2</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Filter & Sort</div>
                    <div className="text-sm text-[#C8D4E1]">Find the best deals by amount, date, and price</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold">3</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Buy Instantly</div>
                    <div className="text-sm text-[#C8D4E1]">Click "Buy Now" and the veHemi NFT is yours</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold">4</div>
                  <div>
                    <div className="font-semibold text-white mb-1">Hold Until Unlock</div>
                    <div className="text-sm text-[#C8D4E1]">Wait for unlock date, then withdraw your HEMI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-20 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Key Features</h2>
          <p className="text-lg text-[#93A4B7] max-w-2xl mx-auto">
            Built with security, simplicity, and user experience in mind
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Secure & Trustless</h3>
              <p className="text-sm text-[#C8D4E1] leading-relaxed">
                Atomic swaps ensure NFT and payment transfer happen simultaneously in one transaction.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Flexible Payments</h3>
              <p className="text-sm text-[#C8D4E1] leading-relaxed">
                Pay with HEMI tokens or USDC. Choose what works best for you.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-pink-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Advanced Filtering</h3>
              <p className="text-sm text-[#C8D4E1] leading-relaxed">
                Filter by amount, unlock date, unit price, and payment method.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-green-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Instant Settlement</h3>
              <p className="text-sm text-[#C8D4E1] leading-relaxed">
                One-click listing and instant on-chain settlement. No waiting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-[#93A4B7] max-w-2xl mx-auto">
            No hidden fees. Just straightforward, fair pricing for everyone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sellers */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">For Sellers</h3>
              <p className="text-[#93A4B7] mb-6">List your positions and get paid instantly</p>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]"><span className="font-semibold text-white">5% platform fee</span> on successful sales</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">No listing fees</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">No cancellation fees</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">Standard gas fees apply</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buyers */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl" />
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">For Buyers</h3>
              <p className="text-[#93A4B7] mb-6">Pay only the listed price - no extra fees</p>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]"><span className="font-semibold text-white">0% buyer fees</span> - what you see is what you pay</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">Pay with HEMI or USDC</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">Instant ownership transfer</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#C8D4E1]">Standard gas fees apply</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Section - Compact */}
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm p-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Built on Hemi Network
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Open Source & Verified</h3>
              <p className="text-[#C8D4E1] leading-relaxed mb-4">
                Built with Next.js 15, TypeScript, and Solidity smart contracts. All contracts are verified on-chain and open source on GitHub.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-[#93A4B7]">Next.js 15</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-[#93A4B7]">TypeScript</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-[#93A4B7]">Solidity</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-[#93A4B7]">Wagmi</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a 
                href="https://github.com/0x0sub/vehemi-marketplace" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white hover:bg-slate-700/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.2 11.2.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.6-1.5-2-1.5-2-1.2-.8.1-.8.1-.8 1.3.1 2 .9 2 .9 1.2 2 3.1 1.5 3.9 1.1.1-.9.5-1.5.8-1.9-2.7-.3-5.5-1.4-5.5-6.2 0-1.4.5-2.5 1.2-3.4-.1-.3-.5-1.7.1-3.5 0 0 1-.3 3.5 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.5-1.6 3.5-1.3 3.5-1.3.6 1.8.2 3.2.1 3.5.8.9 1.2 2 1.2 3.4 0 4.8-2.9 5.9-5.6 6.2.5.4.9 1.2.9 2.4v3.5c0 .4.2.8.8.6 4.8-1.6 8.2-6 8.2-11.2A11.5 11.5 0 0 0 12 .5Z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative overflow-hidden py-24">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto w-full max-w-[800px] px-6 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to <span className="bg-gradient-to-r from-[#2599EE] to-[#ff6a00] bg-clip-text text-transparent">Unlock Value</span>?
          </h2>
          <p className="text-xl text-[#C8D4E1] mb-10 max-w-2xl mx-auto">
            Whether you need liquidity or want discounted HEMI, the marketplace is live and waiting for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a 
              href="/" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
            >
              Start Trading Now
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a 
              href="/faq" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-slate-800/60 border border-slate-700 rounded-xl hover:bg-slate-700/60 transition-all duration-200"
            >
              Read FAQ
            </a>
          </div>

          <div className="text-sm text-[#93A4B7]">
            Questions? Join our{' '}
            <a href="https://t.me/vehemi" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              Telegram community
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

