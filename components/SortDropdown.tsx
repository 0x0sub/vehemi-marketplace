import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface VeHemiToken {
  id: string;
  price: number;
  hemiAmount: number;
  lockDuration: number;
  unlocksIn: number;
  tokenId: string;
  imageUrl: string;
}
interface SortOption {
  field: keyof Pick<VeHemiToken, 'price' | 'hemiAmount' | 'lockDuration' | 'unlocksIn'>;
  direction: 'asc' | 'desc';
}
interface SortDropdownProps {
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
}
const sortOptions = [{
  field: 'price' as const,
  label: 'Price'
}, {
  field: 'hemiAmount' as const,
  label: 'HEMI Amount'
}, {
  field: 'lockDuration' as const,
  label: 'Lock Duration'
}, {
  field: 'unlocksIn' as const,
  label: 'Unlocks In'
}] as any[];

// @component: SortDropdown
export const SortDropdown = ({
  sortOption,
  onSortChange
}: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const currentLabel = sortOptions.find(opt => opt.field === sortOption.field)?.label || 'Price';
  const handleOptionClick = (field: SortOption['field'], direction: 'asc' | 'desc') => {
    onSortChange({
      field,
      direction
    });
    setIsOpen(false);
  };

  // @return
  return <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-900 transition-colors min-w-[180px] justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span>Sort by {currentLabel}</span>
          {sortOption.direction === 'asc' ? <TrendingUp className="w-4 h-4 text-slate-400" /> : <TrendingDown className="w-4 h-4 text-slate-400" />}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: -8,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: -8,
        scale: 0.95
      }} transition={{
        duration: 0.15
      }} className="absolute top-full mt-2 left-0 right-0 bg-slate-950 border border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="py-2">
              {sortOptions.map(option => <div key={option.field}>
                  <button onClick={() => handleOptionClick(option.field, 'asc')} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-900 transition-colors flex items-center gap-3 ${sortOption.field === option.field && sortOption.direction === 'asc' ? 'bg-slate-900 text-white font-medium' : 'text-slate-200'}`}>
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span>{option.label} (Low to High)</span>
                  </button>
                  <button onClick={() => handleOptionClick(option.field, 'desc')} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-900 transition-colors flex items-center gap-3 ${sortOption.field === option.field && sortOption.direction === 'desc' ? 'bg-slate-900 text-white font-medium' : 'text-slate-200'}`}>
                    <TrendingDown className="w-4 h-4 text-slate-400" />
                    <span>{option.label} (High to Low)</span>
                  </button>
                </div>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};