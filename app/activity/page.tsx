'use client'

import React, { useMemo, useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";

// ---- Types ----
type EventType = 'list' | 'sale' | 'cancel';
type Token = 'HEMI' | 'USDC';
interface FeedEvent {
  id: string;               // unique id
  type: EventType;
  positionId: number;
  amount: number;           // locked HEMI amount in the position
  total: number;            // total price in the payment token
  token: Token;             // payment token
  unitUsd: number;          // normalized $ per HEMI (precomputed server-side preferred)
  seller: string;
  buyer?: string;
  txHash: string;
  timestamp: string;        // ISO string
  unlockDate: string;       // ISO unlock date
}

// ---- Utils ----
function cn(...c: Array<string | false | null | undefined>) { return c.filter(Boolean).join(" "); }

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return `${d}d ago`;
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function calculateDaysUntilUnlock(unlockDate: string) {
  if (!unlockDate) return '—';
  const unlock = new Date(unlockDate);
  const now = new Date();
  const diffTime = unlock.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function groupByDay(events: FeedEvent[]) {
  const by: Record<string, FeedEvent[]> = {};
  for (const e of events) {
    const key = new Date(e.timestamp).toISOString().slice(0,10); // YYYY-MM-DD
    (by[key] ||= []).push(e);
  }
  return Object.entries(by).sort((a,b)=> a[0] < b[0] ? 1 : -1); // newest day first
}

// ---- Activity Feed Component ----
function ActivityFeed({ rightRail = false }: { rightRail?: boolean }) {
  const [tab, setTab] = useState<EventType | 'all'>('all');
  const [tokens, setTokens] = useState<Record<Token, boolean>>({ HEMI: true, USDC: true });
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Fetch activity data from API
  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      setCurrentOffset(0);
      setHasMore(true);
      try {
        const activeTokens = Object.entries(tokens)
          .filter(([_, active]) => active)
          .map(([token, _]) => token);
        
        const params = new URLSearchParams({
          type: tab === 'all' ? 'all' : tab,
          tokens: activeTokens.join(','),
          limit: '15',
          offset: '0'
        });
        
        const response = await fetch(`/api/activity?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        
        const data = await response.json();
        setEvents(data.data || []);
        setHasMore(data.pagination?.hasMore || false);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activity data');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [tab, tokens]);

  // Load more function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const activeTokens = Object.entries(tokens)
        .filter(([_, active]) => active)
        .map(([token, _]) => token);
      
      const newOffset = currentOffset + 15;
      const params = new URLSearchParams({
        type: tab === 'all' ? 'all' : tab,
        tokens: activeTokens.join(','),
        limit: '15',
        offset: newOffset.toString()
      });
      
      const response = await fetch(`/api/activity?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch more activity data');
      }
      
      const data = await response.json();
      setEvents(prev => [...prev, ...(data.data || [])]);
      setCurrentOffset(newOffset);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error('Error loading more activity:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const grouped = useMemo(()=> groupByDay(events), [events]);

  return (
    <aside className={cn(
      "rounded-2xl border border-[#1E2937] text-white",
      rightRail ? "w-[360px] min-w-[320px]" : "w-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-[#E5EDF5]">Activity</h2>          
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1E2937] px-2 py-1 text-xs text-[#93A4B7] hover:text-white hover:bg-[#1B2430] transition-colors"
            title="Refresh activity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeWidth="1.5"/>
              <path d="M21 3v5h-5" strokeWidth="1.5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" strokeWidth="1.5"/>
              <path d="M3 21v-5h5" strokeWidth="1.5"/>
            </svg>
            Refresh
          </button>
          <Segmented value={tab} onChange={setTab} options={[
            { v: 'all', l: 'All' },
            { v: 'list', l: 'Listings' },
            { v: 'sale', l: 'Sales' },
            { v: 'cancel', l: 'Cancels' },
          ]} />
        </div>
      </div>

      {/* Token filter */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <TokenChip label="HEMI" active={tokens.HEMI} onClick={()=> setTokens(t=> ({...t, HEMI: !t.HEMI}))} />
        <TokenChip label="USDC" active={tokens.USDC} onClick={()=> setTokens(t=> ({...t, USDC: !t.USDC}))} />
      </div>

      {/* List */}
      <div className="pt-1 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--hemi-orange)] mx-auto"></div>
              <p className="mt-2 text-slate-400">Loading activity...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[color:var(--hemi-orange)] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-[#1E2937] p-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#93A4B7]">
                    <path d="M9 12l2 2 4-4" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Activity Found</h3>
              <p className="text-[#93A4B7] mb-4 max-w-md">
                No marketplace activity found for the selected filters. Try adjusting your filters or check back later for new listings, sales, and cancellations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {grouped.map(([day, items]) => (
              <div key={day} className="px-2">
                <div className="sticky top-0 z-10 px-2 py-1 text-xs text-[#93A4B7]">
                  {day === new Date().toISOString().slice(0,10) ? 'Today' : shortDate(day)}
                </div>
                <ul className="space-y-1.5">
                  {items.map((e) => (
                    <FeedItem key={e.id} evt={e} />
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="px-4 py-3 border-t border-[#1E2937]">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#1E2937] bg-[#0B1218] text-sm font-medium text-[#93A4B7] hover:text-white hover:bg-[#1B2430] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--hemi-orange)]"></div>
                      Loading more...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="1.5"/>
                      </svg>
                      Load More (15 more)
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && events.length > 0 && (
              <div className="px-4 py-3 border-t border-[#1E2937]">
                <div className="text-center text-xs text-[#93A4B7]">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-px w-8 bg-[#1E2937]"></div>
                    <span>End of results</span>
                    <div className="h-px w-8 bg-[#1E2937]"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

// ---- Row ----
function FeedItem({ evt }: { evt: FeedEvent }) {
  const color = evt.type==='sale' ? '#22C55E' : evt.type==='list' ? '#F59E0B' : '#F87171';
  const title = evt.type==='sale'
    ? `Sold ${fmt(evt.amount)} HEMI veHEMI #${evt.positionId}`
    : evt.type==='list'
      ? `Listed ${fmt(evt.amount)} HEMI veHEMI #${evt.positionId}`
      : `Canceled ${fmt(evt.amount)} HEMI veHEMI #${evt.positionId}`;

  return (
    <li className="rounded-xl border border-[#1E2937] px-3 py-2.5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: color + '22', color }}>
          {evt.type==='sale' && <SaleIcon className="h-4 w-4" />}
          {evt.type==='list' && <ListIcon className="h-4 w-4" />}
          {evt.type==='cancel' && <CancelIcon className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          {/* Line 1 */}
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-medium">{title}</div>
            <span className="text-xs text-[#93A4B7]">{timeAgo(evt.timestamp)}</span>
          </div>
          {/* Line 2 meta */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#93A4B7]">
            {evt.type!== 'cancel' && (
              <Chip>
                <span className="tabular-nums">{fmt(evt.total)}</span>
                <img 
                  src={`/${evt.token.toLowerCase()}-logo.svg`} 
                  alt={evt.token} 
                  className="w-3 h-3 ml-1" 
                />
              </Chip>
            )}
            <Chip>{fmt(evt.amount)} HEMI locked</Chip>
            {evt.type!== 'cancel' && (
              <Chip>Unit ≈ ${evt.unitUsd.toFixed(4)} / HEMI</Chip>
            )}
            <Chip>Unlocks in {calculateDaysUntilUnlock(evt.unlockDate)} days</Chip>
            <Addr label="Seller" addr={evt.seller} />
            {evt.buyer && <Addr label="Buyer" addr={evt.buyer} />}
            <Tx tx={evt.txHash} />
            <a 
              className="ml-auto inline-flex items-center gap-1 text-xs hover:underline" 
              href={`${process.env.NEXT_PUBLIC_EXPLORER_LINK || 'https://testnet.explorer.hemi.xyz/'}tx/${evt.txHash}`} 
              target="_blank" 
              rel="noreferrer"
            >
              View tx <ExternalIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

// ---- Small UI atoms ----
function Segmented({ value, onChange, options }:{ value: string; onChange: (v:any)=>void; options:{v:string;l:string}[] }){
  return (
    <div className="inline-flex items-center rounded-xl border border-[#1E2937] p-1">
      {options.map(o => (
        <button key={o.v} onClick={()=>onChange(o.v)} className={cn("px-3 py-1.5 text-xs rounded-lg", value===o.v ? "bg-[#1B2430] text-white" : "text-[#93A4B7] hover:text-white")}>{o.l}</button>
      ))}
    </div>
  );
}

function TokenChip({ label, active, onClick }:{ label: Token; active: boolean; onClick: ()=>void }){
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs", active ? "border-[#2A3A4F] bg-[#14202E]" : "border-[#1E2937] bg-transparent text-[#93A4B7]")}>{label}</button>
  );
}

function Chip({ children }:{ children: React.ReactNode }){
  return <span className="inline-flex items-center rounded-md border border-[#1E2937] bg-[#0F141B] px-2 py-0.5">{children}</span>;
}

function Addr({ label, addr }:{ label:string; addr:string }){
  const { toast } = useToast();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(addr);
      toast({
        title: "Address copied",
        description: `${label} address copied to clipboard`,
      });
    } catch (err) {
      console.error('Failed to copy address:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#1E2937] bg-[#0F141B] px-2 py-0.5">
      <span className="text-[#93A4B7]">{label}</span>
      <span className="font-mono tabular-nums">{shorten(addr)}</span>
      <button 
        onClick={handleCopy}
        className="hover:opacity-100 transition-opacity"
        title={`Copy ${addr}`}
      >
        <CopyIcon className="h-3 w-3 opacity-60" />
      </button>
    </span>
  );
}

function Tx({ tx }:{ tx:string }){
  const { toast } = useToast();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tx);
      toast({
        title: "Transaction hash copied",
        description: "Transaction hash copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy transaction hash:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy transaction hash to clipboard",
        variant: "destructive",
      });
    }
  };

  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_LINK || 'https://testnet.explorer.hemi.xyz/';

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#1E2937] bg-[#0F141B] px-2 py-0.5">
      <span className="text-[#93A4B7]">Tx</span>
      <span className="font-mono tabular-nums">{shorten(tx)}</span>
      <button 
        onClick={handleCopy}
        className="hover:opacity-100 transition-opacity"
        title={`Copy ${tx}`}
      >
        <CopyIcon className="h-3 w-3 opacity-60" />
      </button>
    </span>
  );
}

function shorten(s:string){ return s.length>10 ? s.slice(0,6)+"…"+s.slice(-4) : s; }
function fmt(n:number){ return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n); }

// ---- Icons ----
function SaleIcon(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M4 12h16M12 4v16" strokeWidth="1.5"/>
    </svg>
  );
}
function ListIcon(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5"/>
    </svg>
  );
}
function CancelIcon(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.5"/>
    </svg>
  );
}
function ExternalIcon(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M14 3h7v7" strokeWidth="1.5"/>
      <path d="M21 3l-9 9" strokeWidth="1.5"/>
      <path d="M5 12v7h7" strokeWidth="1.5"/>
    </svg>
  );
}
function CopyIcon(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <rect x="9" y="9" width="10" height="10" rx="2" strokeWidth="1.5" />
      <rect x="5" y="5" width="10" height="10" rx="2" strokeWidth="1.5" />
    </svg>
  );
}

// ---- Main Page Component ----
export default function ActivityPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-8 mx-4 sm:mx-12 lg:mx-16 xl:mx-32 2xl:mx-48">
      <div className="w-full text-white">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] leading-[38px] font-semibold tracking-[-0.01em] text-white mb-2">
              Marketplace Activity
            </h1>
            <p className="text-lg text-[#93A4B7]">
              Track all veHEMI trades, listings and cancellations.
            </p>
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}
