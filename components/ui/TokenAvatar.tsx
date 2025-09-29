interface TokenAvatarProps {
  symbol: string;
  url?: string;
}

export function TokenAvatar({ symbol, url }: TokenAvatarProps) {
  return (
    <div className="relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#111821]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={`${symbol} logo`} src={url} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold">{symbol.slice(0, 1)}</span>
      )}
    </div>
  );
}
