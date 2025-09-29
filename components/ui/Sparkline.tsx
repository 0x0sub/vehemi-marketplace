interface SparklineProps {
  data: number[];
  positive?: boolean;
}

export function Sparkline({ data, positive }: SparklineProps) {
  // Normalize to [0,1]
  const min = Math.min(...data);
  const max = Math.max(...data);
  const w = 88;
  const h = 24;
  const pad = 2;
  const r = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  
  const pts = data.map((v, i) => [
    pad + (i * (w - 2 * pad)) / (data.length - 1),
    h - pad - r(v) * (h - 2 * pad)
  ]);
  
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path 
        d={d} 
        fill="none" 
        stroke={positive ? "#22C55E" : "#94A3B8"} 
        strokeWidth="1.25" 
      />
    </svg>
  );
}
