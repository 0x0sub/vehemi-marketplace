import Link from 'next/link'

export const metadata = {
  title: 'FAQ - veHEMI Marketplace',
  description: 'Frequently asked questions about the veHEMI marketplace.',
}

const faqCategories = [
  {
    category: 'Getting Started',
    icon: '🚀',
    questions: [
      {
        q: 'What is veHEMI?',
        a: 'veHEMI is an ERC-721 NFT that represents a time-locked HEMI position with associated voting power. Each token holds an amount of HEMI locked until a specific unlock time; the voting power (veHEMI balance) decays as the lock approaches its end. These NFTs can be bought and sold P2P on this marketplace.',
      },
      {
        q: 'What is veHEMI.com Marketplace?',
        a: 'veHEMI.com Marketplace is the first peer-to-peer trading platform that lets you buy and sell locked HEMI token positions. If you have locked HEMI tokens and need liquidity before your unlock date, or want to acquire HEMI at discounted prices, this marketplace is for you.',
      },
      {
        q: 'Who can use this marketplace?',
        a: 'Anyone with a Web3 wallet can use the marketplace. Sellers need veHEMI NFTs to list, and buyers need HEMI or USDC tokens to purchase listings.',
      },
    ]
  },
  {
    category: 'Buying & Selling',
    icon: '💰',
    questions: [
      {
        q: 'How do I buy a veHEMI position?',
        a: '1) Connect your wallet. 2) Browse listings and review details like locked HEMI, unlock date, and price. 3) Ensure you hold the required payment token (HEMI or USDC) and have approved the marketplace to spend it. 4) Click Buy Now and confirm in your wallet. After payment and fee deduction, the NFT transfers to your address.',
      },
      {
        q: 'How do I sell my veHEMI position?',
        a: 'Connect your wallet, go to "My veHEMI Positions," select a position you want to sell, click "List veHEMI," set your price in HEMI or USDC, choose listing duration, and confirm. You\'ll receive payment immediately when someone buys (minus the 5% platform fee).',
      },
      {
        q: 'Can I cancel my listing?',
        a: 'Yes! You can cancel your listing anytime before someone purchases it. There are no cancellation fees - you only pay standard gas fees for the transaction.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'The marketplace accepts HEMI tokens and USDC stablecoins. Sellers can choose which payment token they prefer when creating a listing.',
      },
    ]
  },
  {
    category: 'Fees & Pricing',
    icon: '💳',
    questions: [
      {
        q: 'Are there any fees?',
        a: 'Yes. The marketplace charges a 5% platform fee on successful sales. Buyers pay the listed price; the fee is taken from the sale proceeds before the seller receives funds. Standard network gas fees also apply.',
      },
      {
        q: 'Why would I sell at a discount?',
        a: 'Liquidity is valuable. If your tokens are locked for years and you need cash now, getting 70-80% of the value today might be better than waiting years for 100%. It depends on your financial situation and opportunity cost.',
      },
      {
        q: 'How do I know I\'m getting a good deal as a buyer?',
        a: 'Use our filters and sorting to compare unit prices across listings. The platform shows you the price per HEMI token in USD, making it easy to compare. Check the unlock date too - shorter locks generally command higher prices.',
      },
    ]
  },
  {
    category: 'Technical & Security',
    icon: '🔒',
    questions: [
      {
        q: 'What networks are supported?',
        a: 'Hemi Mainnet (Chain ID 43111) is supported. Use a Hemi-compatible wallet and switch networks in your wallet provider when needed.',
      },
      {
        q: 'Is this marketplace safe?',
        a: 'Yes. The marketplace uses atomic swaps - NFT and payment transfer happen simultaneously in one transaction. We never custody your funds or tokens. All smart contracts are verified on-chain and open source on GitHub.',
      },
      {
        q: 'Can I withdraw my HEMI before the unlock date?',
        a: 'No. The lock period is enforced by the veHEMI smart contract. This is why these positions sell at a discount - buyers must wait until the unlock date. Once unlocked, you can withdraw your HEMI tokens.',
      },
      {
        q: 'What happens if the seller changes their mind?',
        a: 'Once you complete the purchase transaction, the NFT transfers to you immediately through an atomic swap. Sellers can only cancel before someone buys.',
      },
    ]
  },
  {
    category: 'Support',
    icon: '💬',
    questions: [
      {
        q: 'Is this marketplace affiliated with Hemi Labs?',
        a: 'No. This is an independent P2P marketplace and is not affiliated with Hemi Labs. Use at your own risk.',
      },
      {
        q: 'How can I get support?',
        a: 'For questions, join our Telegram at https://t.me/vehemi. You can also open an issue on GitHub at https://github.com/0x0sub/vehemi-marketplace if you encounter a bug or have technical questions.',
      },
      {
        q: 'I found a bug, where do I report it?',
        a: 'Please report bugs on our GitHub repository at https://github.com/0x0sub/vehemi-marketplace by opening an issue. Include details about what happened, steps to reproduce, and any error messages.',
      },
    ]
  },
]

export default function FAQPage() {
  return (
    <main className="w-full text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked
              <span className="block bg-gradient-to-r from-[#2599EE] to-[#ff6a00] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            
            <p className="text-xl text-[#C8D4E1] leading-relaxed">
              Everything you need to know about trading locked HEMI positions on our marketplace.
              Can't find what you're looking for? Reach out to our community!
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="mx-auto w-full max-w-[1100px] px-6 pt-12 pb-20">
        <div className="space-y-12">
          {faqCategories.map((category, catIdx) => (
            <div key={catIdx}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#2599EE] to-[#ff6a00] rounded-full mt-1"></div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {category.questions.map((item, idx) => (
                  <details 
                    key={idx} 
                    className="group rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-all duration-200"
                    open={catIdx === 0 && idx === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 hover:bg-slate-900/50 rounded-xl transition-colors">
                      <span className="text-base font-semibold text-[#E5EDF5] flex-1">{item.q}</span>
                      <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-[#93A4B7] group-open:rotate-180 transition-transform duration-200">
                        <ChevronIcon className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-[#C8D4E1] leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm p-10 text-center">
          <h3 className="text-2xl font-bold mb-3 text-white">Still have questions?</h3>
          <p className="text-[#C8D4E1] mb-6 max-w-2xl mx-auto">
            Our community is here to help! Join our Telegram group for quick answers or check out recent marketplace activity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://t.me/vehemi" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.9 4.5a1 1 0 0 0-1.1-.1L3.2 12.4a.9.9 0 0 0 .1 1.7l4.8 1.5 1.6 4.7a.9.9 0 0 0 1.5.3l2.6-2.4 4.7 3.4a1 1 0 0 0 1.6-.6l3-15a1 1 0 0 0-.7-1.1ZM9.2 14.8l-3.2-1 11-5.4-7.8 6.4Z"/>
              </svg>
              Join Telegram
            </a>
            <Link 
              href="/activity"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white font-semibold hover:bg-slate-700/60 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              View Activity
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 15.5a1 1 0 0 1-.7-.3l-6-6 1.4-1.4L12 12.8l5.3-5.2 1.4 1.4-6 6a1 1 0 0 1-.7.3Z"/>
    </svg>
  )
}


