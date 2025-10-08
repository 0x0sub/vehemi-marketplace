import { useState, useEffect } from 'react';
import { Sliders, RotateCcw, Filter } from 'lucide-react';
interface FilterState {
  hemiAmountRange: [number, number];
  unlocksInRange: [number, number];
  unitPriceRange?: [number, number];
  paymentTokens: string[];
}
interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose?: () => void; // Optional callback to close filter panel
}
const formatDuration = (days: number): string => {
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
};
const formatAmount = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
};

// @component: FilterSidebar
export const FilterSidebar = ({
  filters,
  onFiltersChange,
  onClose
}: FilterSidebarProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose?.(); // Close filter panel after applying
  };
  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      hemiAmountRange: [0, 100000],
      unlocksInRange: [0, 1500],
      paymentTokens: ['HEMI', 'USDC']
      // Note: unitPriceRange is undefined in initial state, not [0, 1]
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose?.(); // Close filter panel after resetting
  };
  const updateHemiRange = (index: 0 | 1, value: number) => {
    const clamped = Math.max(0, Math.min(100_000, value));
    const currentRange = localFilters.hemiAmountRange ?? [0, 100000];
    const newRange = [...currentRange] as [number, number];
    newRange[index] = clamped;
    if (index === 0 && clamped > newRange[1]) newRange[1] = clamped;
    if (index === 1 && clamped < newRange[0]) newRange[0] = clamped;
    setLocalFilters({
      ...localFilters,
      hemiAmountRange: newRange
    });
  };
  const updateUnlocksInRange = (index: 0 | 1, value: number) => {
    const currentRange = localFilters.unlocksInRange ?? [0, 1500];
    const newRange = [...currentRange] as [number, number];
    newRange[index] = value;
    if (index === 0 && value > newRange[1]) newRange[1] = value;
    if (index === 1 && value < newRange[0]) newRange[0] = value;
    setLocalFilters({
      ...localFilters,
      unlocksInRange: newRange
    });
  };
  const updateUnitPriceRange = (index: 0 | 1, value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    const current = localFilters.unitPriceRange ?? [0, 1];
    const next: [number, number] = [...current] as [number, number];
    next[index] = clamped;
    if (index === 0 && clamped > next[1]) next[1] = clamped;
    if (index === 1 && clamped < next[0]) next[0] = clamped;
    setLocalFilters({
      ...localFilters,
      unitPriceRange: next
    });
  };
  const formatUnitPrice = (v: number) => `$${v.toFixed(2)}`;

  const handleUnitPriceInputChange = (index: 0 | 1, rawValue: string) => {
    const cleaned = rawValue.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    const safeNumber = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
    updateUnitPriceRange(index, safeNumber);
  };

  const togglePaymentToken = (token: string) => {
    const currentTokens = localFilters.paymentTokens ?? ['HEMI', 'USDC'];
    const newTokens = currentTokens.includes(token)
      ? currentTokens.filter(t => t !== token)
      : [...currentTokens, token];
    
    setLocalFilters({
      ...localFilters,
      paymentTokens: newTokens
    });
  };

  // @return
  return <div className="bg-[color:var(--card)] rounded-2xl border border-slate-800/80 shadow-sm p-6 sticky top-28">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-slate-300" />
        <h2 className="text-xl font-semibold text-white">
          <span>Filters</span>
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>HEMI Amount</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <input type="range" min={0} max={100000} step={10} value={localFilters.hemiAmountRange?.[0] ?? 0} onChange={e => updateHemiRange(0, parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="relative">
                <input type="number" inputMode="numeric" min={0} max={100000} step={10} value={localFilters.hemiAmountRange?.[0] ?? 0} onChange={e => updateHemiRange(0, Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-[color:var(--hemi-cyan)]/40 focus:outline-none placeholder:text-slate-500" aria-label="Minimum HEMI amount" />
              </div>
            </div>
            <div className="space-y-2">
              <input type="range" min={0} max={100000} step={10} value={localFilters.hemiAmountRange?.[1] ?? 100000} onChange={e => updateHemiRange(1, parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="relative">
                <input type="number" inputMode="numeric" min={0} max={1000000} step={10} value={localFilters.hemiAmountRange?.[1] ?? 100000} onChange={e => updateHemiRange(1, Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-[color:var(--hemi-cyan)]/40 focus:outline-none placeholder:text-slate-500" aria-label="Maximum HEMI amount" />
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Unlocks In</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <input type="range" min={7} max={1500} step={7} value={localFilters.unlocksInRange?.[0] ?? 0} onChange={e => updateUnlocksInRange(0, parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="text-sm font-medium text-slate-100">
                <span>{formatDuration(localFilters.unlocksInRange?.[0] ?? 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <input type="range" min={7} max={1500} step={7} value={localFilters.unlocksInRange?.[1] ?? 1500} onChange={e => updateUnlocksInRange(1, parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="text-sm font-medium text-slate-100">
                <span>{formatDuration(localFilters.unlocksInRange?.[1] ?? 1500)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Price per 1 HEMI (USD)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <input type="range" min={0} max={1} step={0.01} value={(localFilters.unitPriceRange ?? [0, 1])[0]} onChange={e => updateUnitPriceRange(0, parseFloat(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="relative">
                <input type="text" inputMode="decimal" value={formatUnitPrice((localFilters.unitPriceRange ?? [0, 1])[0])} onChange={e => handleUnitPriceInputChange(0, e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-[color:var(--hemi-cyan)]/40 focus:outline-none" aria-label="Minimum price per HEMI in USD" />
              </div>
            </div>
            <div className="space-y-2">
              <input type="range" min={0} max={1} step={0.01} value={(localFilters.unitPriceRange ?? [0, 1])[1]} onChange={e => updateUnitPriceRange(1, parseFloat(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/40 slider" />
              <div className="relative">
                <input type="text" inputMode="decimal" value={formatUnitPrice((localFilters.unitPriceRange ?? [0, 1])[1])} onChange={e => handleUnitPriceInputChange(1, e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-[color:var(--hemi-cyan)]/40 focus:outline-none" aria-label="Maximum price per HEMI in USD" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Payment Tokens</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => togglePaymentToken('HEMI')}
              className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/40 border-slate-700 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                <img src="/hemi-logo.svg" alt="HEMI" className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">HEMI</span>
              <div className={`ml-auto w-4 h-4 rounded border-2 flex items-center justify-center ${
                localFilters.paymentTokens?.includes('HEMI')
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-slate-500'
              }`}>
                {localFilters.paymentTokens?.includes('HEMI') && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
            
            <button
              onClick={() => togglePaymentToken('USDC')}
              className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/40 border-slate-700 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">USDC</span>
              <div className={`ml-auto w-4 h-4 rounded border-2 flex items-center justify-center ${
                localFilters.paymentTokens?.includes('USDC')
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-slate-500'
              }`}>
                {localFilters.paymentTokens?.includes('USDC') && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-800/60">
        <button onClick={handleApplyFilters} className="flex-1 rounded-xl py-3 px-4 font-semibold bg-gradient-to-r from-[color:var(--hemi-cyan)] to-[#0b1114] text-white hover:brightness-110 transition-colors">
          <span>Apply</span>
        </button>
        <button onClick={handleResetFilters} className="px-4 py-3 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-colors" aria-label="Reset filters">
          <span>Reset</span>
        </button>
      </div>

      <style>{`
        /* Custom slider styling with Hemi cyan track and knob */
        .slider::-webkit-slider-runnable-track { height: 0.375rem; border-radius: 9999px; background: linear-gradient(90deg, var(--hemi-cyan), color-mix(in oklab, var(--hemi-cyan) 35%, #0b1114)); }
        .slider::-moz-range-track { height: 0.375rem; border-radius: 9999px; background: linear-gradient(90deg, var(--hemi-cyan), color-mix(in oklab, var(--hemi-cyan) 35%, #0b1114)); }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 1rem; height: 1rem; border-radius: 9999px; background: var(--hemi-cyan); border: 2px solid #0b1114; margin-top: -6px; box-shadow: 0 0 0 4px color-mix(in oklab, var(--hemi-cyan) 25%, transparent); }
        .slider::-moz-range-thumb { width: 1rem; height: 1rem; border-radius: 9999px; background: var(--hemi-cyan); border: 2px solid #0b1114; box-shadow: 0 0 0 4px color-mix(in oklab, var(--hemi-cyan) 25%, transparent); }
      `}</style>
    </div>;
};