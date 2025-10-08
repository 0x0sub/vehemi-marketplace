import { TokenAvatar } from './ui/TokenAvatar';
import { ChangeBadge } from './ui/ChangeBadge';
import { Sparkline } from './ui/Sparkline';

interface MarketplaceHeaderProps {
  title?: string;
  listingsCount: number;
  tokenSymbol?: string;
  tokenIconUrl?: string;
  priceUsd?: number | null;
  change24h?: number | null;
  lastUpdatedIso?: string;
  sparkline?: number[];
  onPriceClickHref?: string;
  stats?: {
    salesCount: number;
    totalHemiLocked: number;
    totalUsdValue: number;
  };
  statsPeriod?: string; // e.g., "30d"
}

export function MarketplaceHeader({
  title = "Available veHEMI",
  listingsCount,
  tokenSymbol = "HEMI",
  tokenIconUrl,
  priceUsd = null,
  change24h = null,
  lastUpdatedIso,
  sparkline,
  onPriceClickHref,
  stats,
  statsPeriod = "30d",
}: MarketplaceHeaderProps) {
  const positive = (change24h ?? 0) > 0;
  const negative = (change24h ?? 0) < 0;
  const hasPrice = typeof priceUsd === "number" && !Number.isNaN(priceUsd);

  // Format numbers for stats pills
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const PricePill = (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
      <TokenAvatar symbol={tokenSymbol} url={tokenIconUrl} />
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-[#93A4B7]">{tokenSymbol} Price</span>
        <span className="text-base font-semibold tabular-nums">
          {hasPrice ? `$${priceUsd!.toFixed(4)}` : "—"}
        </span>
      </div>
      <ChangeBadge value={change24h} />
    </div>
  );

  return (
    <div className="mb-3">
      {/* Tablet: Stacked layout */}
      <div className="hidden md:block lg:hidden">
        {/* Title + count */}
        <div className="mb-3">
          <h2 className="text-[22px] leading-[28px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <p className="text-sm text-[#93A4B7]">
            {listingsCount} active listing{listingsCount === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Pills row below */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Price pill */}
          {onPriceClickHref ? (
            <a 
              href={onPriceClickHref} 
              target="_blank" 
              rel="noreferrer" 
              title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
            >
              {PricePill}
            </a>
          ) : (
            <div title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}>
              {PricePill}
            </div>
          )}

          {/* Stats pills (30d) */}
          {stats && (
            <>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">{statsPeriod} Sales</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {stats.salesCount}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">HEMI Traded</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {formatNumber(stats.totalHemiLocked)}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">Volume</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {formatCurrency(stats.totalUsdValue)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden lg:flex items-end justify-between gap-3">
        {/* Left: Title + count */}
        <div>
          <h2 className="text-[22px] leading-[28px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <p className="text-sm text-[#93A4B7]">
            {listingsCount} active listing{listingsCount === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Right: Pills row */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Price pill */}
          {onPriceClickHref ? (
            <a 
              href={onPriceClickHref} 
              target="_blank" 
              rel="noreferrer" 
              title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
            >
              {PricePill}
            </a>
          ) : (
            <div title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}>
              {PricePill}
            </div>
          )}

          {/* Stats pills (30d) */}
          {stats && (
            <>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">{statsPeriod} Sales</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {stats.salesCount}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">HEMI Traded</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {formatNumber(stats.totalHemiLocked)}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">Volume</span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {formatCurrency(stats.totalUsdValue)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden space-y-3">
        {/* Title + count */}
        <div>
          <h2 className="text-[22px] leading-[28px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <p className="text-sm text-[#93A4B7]">
            {listingsCount} active listing{listingsCount === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Pills row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Price pill */}
          {onPriceClickHref ? (
            <a 
              href={onPriceClickHref} 
              target="_blank" 
              rel="noreferrer" 
              title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
            >
              {PricePill}
            </a>
          ) : (
            <div title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}>
              {PricePill}
            </div>
          )}

          {/* Stats pills (30d) - mobile too */}
          {stats && (
            <>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">{statsPeriod}</span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {stats.salesCount} sales
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">Traded</span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {formatNumber(stats.totalHemiLocked)}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
                <span className="text-xs text-[#93A4B7]">Vol</span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {formatCurrency(stats.totalUsdValue)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
