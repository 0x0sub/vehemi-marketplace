import { Arrow } from './Arrow';

interface ChangeBadgeProps {
  value: number | null | undefined;
}

export function ChangeBadge({ value }: ChangeBadgeProps) {
  if (value == null) return <span className="text-xs text-[#93A4B7]">24h: —</span>;
  
  const pos = value > 0;
  const neg = value < 0;
  const color = pos ? "#16A34A" : neg ? "#F87171" : "#93A4B7";
  
  return (
    <span 
      className="inline-flex items-center gap-1 rounded-full border border-[#1E2937] bg-[#0F141B] px-2 py-0.5 text-xs" 
      style={{ color }}
    >
      <Arrow className="h-3 w-3" dir={pos ? "up" : neg ? "down" : "flat"} />
      {value.toFixed(2)}%
    </span>
  );
}
