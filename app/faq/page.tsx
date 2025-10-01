import Link from 'next/link'

export const metadata = {
  title: 'FAQ - veHEMI Marketplace',
  description: 'Frequently asked questions about the veHEMI marketplace.',
}

const faqs = [
  {
    q: 'What is veHEMI?',
    a: 'veHEMI is an ERC-721 NFT that represents a time-locked HEMI position with associated voting power. Each token holds an amount of HEMI locked until a specific unlock time; the voting power (veHEMI balance) decays as the lock approaches its end. These NFTs can be bought and sold P2P on this marketplace.',
  },
  {
    q: 'How do I buy a veHEMI position?',
    a: '1) Connect your wallet. 2) Browse listings and review details like locked HEMI, unlock date, and price. 3) Ensure you hold the required payment token (HEMI or USDC) and have approved the marketplace to spend it. 4) Click Buy Now and confirm in your wallet. After payment and fee deduction, the NFT transfers to your address.',
  },
  {
    q: 'Is this marketplace affiliated with Hemi Labs?',
    a: 'No. This is an independent P2P marketplace and is not affiliated with Hemi Labs. Use at your own risk.',
  },
  {
    q: 'What networks are supported?',
    a: 'Hemi Mainnet (Chain ID 43111) is supported. Use a Hemi-compatible wallet and switch networks in your wallet provider when needed.',
  },
  {
    q: 'Are there any fees?',
    a: 'Yes. The marketplace charges a 5% platform fee on successful sales. Buyers pay the listed price; the fee is taken from the sale proceeds before the seller receives funds. Standard network gas fees also apply.',
  },
  {
    q: 'How can I get support?',
    a: 'For questions, join our Telegram at https://t.me/vehemi. You can also open an issue on GitHub if you encounter a bug.',
  },
]

export default function FAQPage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-[#93A4B7]">
          This page contains placeholder questions and answers. We will replace these with the real FAQ next.
        </p>
      </div>

      <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/30">
        {faqs.map((item, idx) => (
          <details key={idx} className="group"
            open={idx === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 hover:bg-slate-900/50">
              <span className="text-base font-semibold text-[#E5EDF5]">{item.q}</span>
              <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/60 p-1 text-[#93A4B7] group-open:rotate-180 transition-transform">
                <ChevronIcon className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 pb-6 text-sm text-[#C8D4E1]">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 text-sm text-[#93A4B7]">
        Still have questions? <Link className="text-blue-400 hover:text-blue-300" href="/activity">Check recent activity</Link> or join our community.
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


