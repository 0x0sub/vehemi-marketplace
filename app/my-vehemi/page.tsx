'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WalletConnectionWrapper } from '../../components/WalletConnectionWrapper';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useVeHemiListing } from '../../components/VeHemiListingProvider';
import { CONTRACTS, MARKETPLACE_ABI } from '../../lib/contracts';

// Mock data for now; replace with API results
type ListingInfo = { price: number; token: 'HEMI' | 'USDC'; expires: string } | null;
type Row = { id: number; tokenId: string; amount: number; unlockIn: string; unlockDate: string; status: 'listed' | 'unlisted'; listing: ListingInfo };

const MOCK: Row[] = [];

const HEMI_USD = 0.0615;
function computeUnitUsd(listing: { price: number; token: 'HEMI' | 'USDC' } | null, amount: number, hemiUsd: number) {
  if (!listing || !amount) return 0;
  const totalUsd = listing.token === 'USDC' ? listing.price : listing.price * hemiUsd;
  return totalUsd / amount;
}

function formatReadableDateTime(isoOrDate: string | Date | number) {
  const d = typeof isoOrDate === 'string' || typeof isoOrDate === 'number' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

type SortKey = 'id' | 'amount' | 'unlockDate' | 'status';

export default function MyVeHemiPage() {
  const { isConnected, address } = useAccount();
  const [statusFilter, setStatusFilter] = useState<'all' | 'listed' | 'unlisted'>('all');
  const [sortBy, setSortBy] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'unlockDate', dir: 'asc' });
  const [rowsRaw, setRowsRaw] = useState<Row[]>(MOCK);
  const [isLoading, setIsLoading] = useState(false);
  const { openListingDrawer } = useVeHemiListing();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cancel listing on-chain
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending } = useWriteContract();
  const { isLoading: isCancelConfirming, isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelHash });

  useEffect(() => {
    if (isCancelConfirmed) {
      setCancellingId(null);
    }
  }, [isCancelConfirmed]);

  // Fetch positions and listings from DB-backed API route
  const fetchKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) {
        setRowsRaw([]);
        setIsLoading(false);
        fetchKeyRef.current = null;
        return;
      }
      const key = address.toLowerCase();
      if (fetchKeyRef.current === key) return; // prevent React 18 StrictMode double-call
      fetchKeyRef.current = key;
      setIsLoading(true);
      try {
        // Get owned positions + listing data from DB
        const posRes = await fetch(`/api/users/${address}/positions?status=all`, { method: 'GET' });
        const posJson = await posRes.json();
        const positions: any[] = posJson.positions || [];

        const toDays = (ms: number) => Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
        const nextRows: Row[] = positions.map((p) => {
          const tokenId = String(p.tokenId || p.id);
          const lockedFormatted = Number(p.amountFormatted ?? p.lockedAmountFormatted ?? 0);
          const lockEndSec = Number(p.lockEndTimestamp ?? 0);
          const lockEndDate = lockEndSec ? new Date(lockEndSec * 1000) : null;
          const unlockDate = lockEndDate ? lockEndDate.toISOString().slice(0, 10) : '';
          const unlockIn = lockEndDate ? `${toDays(lockEndDate.getTime() - Date.now())} days` : '—';

          const l = p.listing;
          let listingInfo: ListingInfo = null;
          if (l) {
            const price = Number(l.priceFormatted ?? 0);
            const token = String(l.paymentTokenSymbol ?? 'HEMI').toUpperCase() as 'HEMI' | 'USDC';
            const expires = l.deadlineTimestamp ?? '';
            listingInfo = { price, token, expires };
          }

          return {
            id: Number(tokenId),
            tokenId,
            amount: isFinite(lockedFormatted) ? lockedFormatted : 0,
            unlockIn,
            unlockDate,
            status: p.isListed ? 'listed' : 'unlisted',
            listing: listingInfo
          };
        });
        setRowsRaw(nextRows);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load positions/listings', err);
        setRowsRaw([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isConnected, address]);

  const rows = useMemo<Row[]>(() => {
    let arr = [...rowsRaw];
    if (statusFilter !== 'all') arr = arr.filter(r => r.status === statusFilter);
    arr.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;
      switch (sortBy.key) {
        case 'id':
          return (a.id - b.id) * dir;
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'unlockDate':
          return (new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()) * dir;
        case 'status':
          return (a.status > b.status ? 1 : -1) * dir;
        default:
          return 0;
      }
    });
    return arr;
  }, [rowsRaw, statusFilter, sortBy]);

  const totals = useMemo(() => {
    const t = { all: 0, listed: 0, unlisted: 0, amountAll: 0, amountListed: 0 };
    rowsRaw.forEach((r) => {
      t.all += 1; t.amountAll += r.amount;
      if (r.status === 'listed') { t.listed += 1; t.amountListed += r.amount; } else t.unlisted += 1;
    });
    return t;
  }, [rowsRaw]);

  if (!isConnected) {
    return (
      <main className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-8 mx-4 sm:mx-12 lg:mx-16 xl:mx-32 2xl:mx-48">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mb-6 flex justify-center"><WalletConnectionWrapper /></div>
            <p className="text-slate-400">Connect your wallet to view your veHEMI positions</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-8 mx-4 sm:mx-12 lg:mx-16 xl:mx-32 2xl:mx-48">
      <div className="w-full  text-white p-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.01em]">My veHEMI Positions</h1>
              <p className="text-sm text-[#93A4B7]">Manage your locked HEMI positions and marketplace listings.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1E2937] border-t-amber-400"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Loading Positions</h3>
                <p className="text-[#93A4B7]">Fetching your veHEMI positions...</p>
              </div>
            </div>
          ) : totals.all === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#1E2937] p-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#93A4B7]">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="1.5"/>
                      <path d="M2 17l10 5 10-5" strokeWidth="1.5"/>
                      <path d="M2 12l10 5 10-5" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No veHEMI Positions Found</h3>
                <p className="text-[#93A4B7] mb-4 max-w-md">
                  You don't have any locked HEMI positions in this wallet. Lock your HEMI tokens to create veHEMI positions and start earning rewards.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="1.5"/>
                      <line x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5"/>
                      <path d="M16 10a4 4 0 0 1-8 0" strokeWidth="1.5"/>
                    </svg>
                    Buy veHEMI
                  </button>
                  <button 
                    onClick={() => window.open('https://app.hemi.xyz/en/staking-dashboard/', '_blank')}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1E2937] bg-[#0F141B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B2430]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="1.5"/>
                      <path d="M2 17l10 5 10-5" strokeWidth="1.5"/>
                      <path d="M2 12l10 5 10-5" strokeWidth="1.5"/>
                    </svg>
                    Stake HEMI
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Segmented
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { v: 'all', l: `All (${totals.all})` },
                    { v: 'listed', l: `Listed (${totals.listed})` },
                    { v: 'unlisted', l: `Unlisted (${totals.unlisted})` },
                  ]}
                />
                <div className="ml-auto flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2937] bg-[#0B1218] px-3 py-1 text-[#93A4B7]">
                    <span>Total locked HEMI</span>
                    <b className="tabular-nums text-white">{totals.amountAll.toLocaleString()}</b>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2937] bg-[#0B1218] px-3 py-1 text-[#93A4B7]">
                    <span>Listed</span>
                    <b className="tabular-nums text-white">{totals.amountListed.toLocaleString()}</b>
                  </span>
                </div>
              </div>

              <TableView 
            rows={rows} 
            sortBy={sortBy} 
            setSortBy={setSortBy}
            onList={(row) => openListingDrawer(row.tokenId)}
            onCancel={async (row) => {
              try {
                setCancellingId(row.tokenId);
                await writeCancel({
                  address: CONTRACTS.MARKETPLACE,
                  abi: MARKETPLACE_ABI,
                  functionName: 'cancelListing',
                  args: [BigInt(row.tokenId)]
                });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Cancel listing failed', e);
                setCancellingId(null);
              }
            }}
            isCancellingId={cancellingId}
            isSubmitting={isCancelPending || isCancelConfirming}
          />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

type SortState = { key: SortKey; dir: 'asc' | 'desc' };
function TableView({ rows, sortBy, setSortBy, onList, onCancel, isCancellingId, isSubmitting }: { rows: Row[]; sortBy: SortState; setSortBy: (v: SortState) => void; onList: (row: Row) => void; onCancel: (row: Row) => void; isCancellingId: string | null; isSubmitting: boolean; }) {
  const TH = ({ label, sortKey, className }: { label: string; sortKey?: SortKey; className?: string }) => (
    <th className={`px-3 py-2 text-left text-xs font-medium text-[#93A4B7] ${className || ''}`}>
      {sortKey ? (
        <button
          className="inline-flex items-center gap-1"
          onClick={() => setSortBy({ key: sortKey, dir: sortBy.key === sortKey && sortBy.dir === 'asc' ? 'desc' : 'asc' })}
        >
          {label}
          <SortIcon dir={sortBy.key === sortKey ? sortBy.dir : undefined} />
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E2937]">
      <table className="w-full border-collapse bg-[#0F141B]">
        <thead className="bg-[#0B1218]">
          <tr>
            <TH label="Position" sortKey="id" />
            <TH label="HEMI Amount" sortKey="amount" />
            <TH label="Unlocks" sortKey="unlockDate" />
            <TH label="Status" sortKey="status" className="hidden md:table-cell" />
            <TH label="Listing" />
            <TH label="" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <React.Fragment key={r.id}>
              <tr className="border-t border-[#1E2937]">
                <td className="px-3 py-2 text-sm">#{r.id}</td>
                <td className="px-3 py-2 tabular-nums text-lg font-semibold">{r.amount.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm">
                  <span className="text-white">{r.unlockIn}</span> <span className="text-[#93A4B7]">({r.unlockDate})</span>
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  <StatusBadge status={r.status as 'listed' | 'unlisted'} />
                </td>
                <td className="px-3 py-2 text-sm">
                  {r.listing ? (
                    <div className="flex flex-col leading-5">
                      <span className="tabular-nums">{r.listing.price.toLocaleString()} {r.listing.token}</span>
                      <span className="text-xs text-[#93A4B7]">Unit ≈ ${computeUnitUsd(r.listing as any, r.amount, HEMI_USD).toFixed(4)} / HEMI</span>
                      <span className="text-xs text-[#93A4B7]">Expires {formatReadableDateTime(r.listing.expires)}</span>
                    </div>
                  ) : (
                    <span className="text-[#93A4B7]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  {r.status === 'listed' ? (
                    <button 
                      disabled={isSubmitting && isCancellingId === r.tokenId} 
                      onClick={() => onCancel(r)} 
                      className={cn(
                        'text-xs font-medium text-red-500 hover:text-red-400 hover:underline',
                        isSubmitting && isCancellingId === r.tokenId ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                    >
                      {isSubmitting && isCancellingId === r.tokenId ? 'Cancelling...' : 'Cancel Listing'}
                    </button>
                  ) : (
                    <button onClick={() => onList(r)} className={cn('h-8 rounded-lg px-3 text-xs font-semibold', 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110')}>List veHEMI</button>
                  )}
                </td>
              </tr>
              {/* Mobile actions row */}
              <tr key={`${r.id}-actions`} className="md:hidden border-t border-[#1E2937]">
                <td colSpan={6} className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {r.status === 'listed' ? (
                      <button 
                        disabled={isSubmitting && isCancellingId === r.tokenId} 
                        onClick={() => onCancel(r)} 
                        className={cn(
                          'text-xs font-medium text-red-500 hover:text-red-400 hover:underline',
                          isSubmitting && isCancellingId === r.tokenId ? 'opacity-60 cursor-not-allowed' : ''
                        )}
                      >
                        {isSubmitting && isCancellingId === r.tokenId ? 'Cancelling...' : 'Cancel Listing'}
                      </button>
                    ) : (
                      <button onClick={() => onList(r)} className={cn('h-8 rounded-lg px-3 text-xs font-semibold', 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(255,153,0,0.55)] hover:brightness-110')}>List veHEMI</button>
                    )}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: any) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-[#1E2937] bg-[#0F141B] p-1">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={cn('px-3 py-1.5 text-xs rounded-lg', value === o.v ? 'bg-[#1B2430] text-white' : 'text-[#93A4B7] hover:text-white')}>{o.l}</button>
      ))}
    </div>
  );
}

function cn(...c: Array<string | false | null | undefined>) { return c.filter(Boolean).join(' '); }

function StatusBadge({ status }: { status: 'listed' | 'unlisted' }) {
  const color = status === 'listed' ? 'text-[#22C55E] bg-[#112617] border-[#1f3b26]' : 'text-[#93A4B7] bg-[#0B1218] border-[#1E2937]';
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs', color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'listed' ? 'bg-[#22C55E]' : 'bg-[#93A4B7]')} />
      {status === 'listed' ? 'Listed' : 'Unlisted'}
    </span>
  );
}

function SortIcon({ dir }: { dir?: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cn('opacity-60', dir ? 'opacity-100' : '')}>
      <path d="M8 9l4-4 4 4" strokeWidth="1.5" className={cn(dir === 'asc' ? '' : 'opacity-30')} />
      <path d="M8 15l4 4 4-4" strokeWidth="1.5" className={cn(dir === 'desc' ? '' : 'opacity-30')} />
    </svg>
  );
}

// Inline tests for unit price
if (typeof window !== 'undefined') {
  try {
    const approx = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;
    const t1 = computeUnitUsd({ price: 50, token: 'USDC' }, 1000, 0.0615);
    if (Math.abs(t1 - 0.05) > 1e-9) throw new Error(`Test1 failed: ${t1}`);
    const t2 = computeUnitUsd({ price: 12500, token: 'HEMI' }, 50000, 0.0615);
    if (!approx(t2, 0.015375)) throw new Error(`Test2 failed: ${t2}`);
    const t3 = computeUnitUsd({ price: 100, token: 'USDC' }, 0 as any, 0.0615);
    if (!approx(t3, 0)) throw new Error(`Test3 failed: ${t3}`);
    const notional = 200; const amt = 4000;
    const t4a = computeUnitUsd({ price: 200, token: 'USDC' }, amt, 0.0615);
    const t4b = computeUnitUsd({ price: 200 / 0.0615, token: 'HEMI' }, amt, 0.0615);
    if (!approx(t4a, t4b)) throw new Error(`Test4 failed: ${t4a} vs ${t4b}`);
    console.info('[MyVeHemiPage] Unit price tests passed.');
  } catch (err) {
    console.error('[MyVeHemiPage] Inline test failure:', err);
  }
}