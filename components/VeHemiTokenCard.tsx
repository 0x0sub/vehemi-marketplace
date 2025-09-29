import { motion } from 'framer-motion';
import { Clock, Coins, Lock, Calendar, ExternalLink } from 'lucide-react';
interface VeHemiToken {
  id: string;
  price: number;
  hemiAmount: number;
  unlocksIn: number;
  lockDuration: number; // in days
  tokenId: string;
  imageUrl: string;
  usdValue?: number;
  hemiPrice?: number;
  paymentToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}
interface VeHemiTokenCardProps {
  token: VeHemiToken;
}
const formatDuration = (days: number): string => {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
const formatUnitPrice = (value: number): string => {
  return `$${Number.isFinite(value) ? value.toFixed(4) : '0.0000'}`;
};

// @component: VeHemiTokenCard
export const VeHemiTokenCard = ({
  token
}: VeHemiTokenCardProps) => {
  const unitPrice = token.hemiAmount > 0 ? token.price / token.hemiAmount : 0;
  // @return
  return <motion.div whileHover={{
    y: -4
  }} className="bg-[color:var(--card)] rounded-3xl border border-slate-800/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
          <div className="text-6xl font-bold text-slate-700 select-none">
            <span>veH</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-slate-800">
          <span className="text-xs font-medium text-slate-300">{token.tokenId}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              <span>{formatPrice(token.price)}</span>
            </h3>
            <p className="text-sm text-slate-400">
              <span>Current Price</span>
            </p>
          </div>
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
            <Coins className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">HEMI Amount</span>
            </div>
            <p className="text-lg font-semibold text-white">
              <span>{formatAmount(token.hemiAmount)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Lock Duration</span>
            </div>
            <p className="text-lg font-semibold text-white">
              <span>{formatDuration(token.lockDuration)}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Unlocks In</span>
          </div>
          <p className="text-base font-semibold text-slate-200">
            <span>{formatDuration(token.unlocksIn)}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">
              <span>Price per 1 HEMI</span>
            </p>
            <p className="text-base font-semibold text-white">
              <span>{formatUnitPrice(unitPrice)}</span>
            </p>
          </div>
        </div>

        <button className="w-full bg-[color:var(--hemi-orange)] text-black rounded-xl py-3 px-4 font-medium hover:brightness-110 transition-colors group-hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2">
          <span>View Details</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>;
};