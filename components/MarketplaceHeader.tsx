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
}: MarketplaceHeaderProps) {
  const positive = (change24h ?? 0) > 0;
  const negative = (change24h ?? 0) < 0;
  const hasPrice = typeof priceUsd === "number" && !Number.isNaN(priceUsd);

  const Pill = (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2937] px-3 py-2">
      <TokenAvatar symbol={tokenSymbol} url={tokenIconUrl} />
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-[#93A4B7]">{tokenSymbol} Price</span>
        <span className="text-base font-semibold tabular-nums">
          {hasPrice ? `$${priceUsd!.toFixed(4)}` : "—"}
        </span>
      </div>
      <ChangeBadge value={change24h} />
      {sparkline && sparkline.length > 1 && (
        <div className="ml-2 hidden md:block">
          <Sparkline data={sparkline} positive={positive} />
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-3">
      {/* Desktop: Side by side layout */}
      <div className="hidden md:flex items-end justify-between gap-3">
        {/* Left: Title + count */}
        <div>
          <h2 className="text-[22px] leading-[28px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <p className="text-sm text-[#93A4B7]">
            {listingsCount} active listing{listingsCount === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Right: Price pill (clickable optional) */}
        {onPriceClickHref ? (
          <a 
            href={onPriceClickHref} 
            target="_blank" 
            rel="noreferrer" 
            title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
          >
            {Pill}
          </a>
        ) : (
          <div title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}>
            {Pill}
          </div>
        )}
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

        {/* Price pill below */}
        {onPriceClickHref ? (
          <a 
            href={onPriceClickHref} 
            target="_blank" 
            rel="noreferrer" 
            title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
            className="inline-block"
          >
            {Pill}
          </a>
        ) : (
          <div 
            title={lastUpdatedIso ? `Updated ${new Date(lastUpdatedIso).toLocaleString()}` : undefined}
            className="inline-block"
          >
            {Pill}
          </div>
        )}
      </div>
    </div>
  );
}
