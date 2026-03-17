import { useState } from 'react';
import { useQuery }  from '@tanstack/react-query';
import { customerApi, transactionApi } from '../../api';
import AppShell from '../../components/layout/AppShell';
import { TransactionItem, ProductCard, StarRating, EmptyState, PageLoader, StatCard } from '../../components/shared';
import { taka, relativeTime, repLabel } from '../../utils/helpers';

const CUST_TABS = [
  { id: 'home',    icon: '🏠', label: 'Home'       },
  { id: 'shops',   icon: '🏪', label: 'আমার দোকান' },
  { id: 'profile', icon: '👤', label: 'Profile'    },
];

// ═══════════════════════════════════════════════════════
// MAIN CUSTOMER APP
// ═══════════════════════════════════════════════════════
export default function CustomerApp() {
  const [tab,    setTab]    = useState('home');
  const [shopId, setShopId] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn:  customerApi.getMyProfile,
  });

  if (isLoading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <PageLoader />
    </div>
  );

  const profile = (data?.data as any)?.data;

  const openShop = (id: string) => { setShopId(id); setTab('shops'); };

  return (
    <AppShell
      tabs={CUST_TABS} activeTab={tab} onTabChange={setTab}
      title={profile?.name || 'Customer'} subtitle={profile?.mobile || ''} emoji="👤"
    >
      {tab === 'home'    && <CustHome    profile={profile} onViewShop={openShop} />}
      {tab === 'shops'   && <CustShops   profile={profile} selectedShopId={shopId} onSelectShop={setShopId} />}
      {tab === 'profile' && <CustProfile profile={profile} />}
    </AppShell>
  );
}

// ═══════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════
function CustHome({ profile, onViewShop }: { profile: any; onViewShop: (id: string) => void }) {
  const { data: txnRes } = useQuery({
    queryKey: ['myTxns'],
    queryFn:  () => transactionApi.getMyTransactions({ limit: 8 }),
  });

  const shops     = profile?.shops || [];
  const txns      = (txnRes?.data as any)?.data || [];
  const totalBaki = shops.reduce((s: number, sh: any) => s + sh.balance, 0);
  const score     = parseFloat(profile?.repScore || '3');
  const rep       = repLabel(score);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Hero baki card */}
      <div className="bg-gradient-to-br from-slate-800 to-teal-950 border border-teal-900/40 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-500/5 rounded-full" />
        <div className="text-xs text-teal-400 font-semibold uppercase tracking-wide">মোট বাকি</div>
        <div className={`font-mono text-4xl font-extrabold mt-1 ${totalBaki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
          {taka(totalBaki)}
        </div>
        <div className="text-slate-400 text-xs mt-1">{shops.length}টি দোকানে</div>
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-3">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-base ${s <= Math.round(score) ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
            ))}
          </div>
          <span className={`text-sm font-bold ${rep.color}`}>{profile?.repScore}/5 — {rep.label}</span>
        </div>
      </div>

      {/* Per-shop */}
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">🏪 দোকানভিত্তিক বাকি</div>
        {shops.length === 0 ? (
          <EmptyState icon="🏪" title="কোনো দোকান নেই" sub="আপনাকে কোনো দোকানে যোগ করা হয়নি" />
        ) : (
          <div className="space-y-2">
            {shops.map((s: any) => (
              <button key={s.id} onClick={() => onViewShop(s.id)}
                className="w-full bg-slate-800/60 border border-slate-700/50 hover:border-teal-700 rounded-xl p-3 text-left flex items-center gap-3 transition-colors">
                <span className="text-3xl flex-shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{s.name}</span>
                    {s.verification?.status === 'VERIFIED' && (
                      <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs">{s.verification?.district || ''}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-mono font-bold text-base ${s.balance > 0 ? 'text-red-400' : 'text-teal-400'}`}>
                    {taka(s.balance)}
                  </div>
                  <div className="text-slate-600 text-xs mt-0.5">→</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      {txns.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">🕐 সাম্প্রতিক লেনদেন</div>
          <div className="space-y-2">
            {txns.map((t: any) => (
              <TransactionItem key={t.id} type={t.type} amount={t.amount} note={t.note}
                date={relativeTime(t.createdAt)} shopName={t.shop?.name} shopEmoji={t.shop?.emoji} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SHOPS
// ═══════════════════════════════════════════════════════
function CustShops({ profile, selectedShopId, onSelectShop }: {
  profile: any; selectedShopId: string | undefined; onSelectShop: (id: string) => void;
}) {
  const shops    = profile?.shops || [];
  const selected = shops.find((s: any) => s.id === selectedShopId) ?? shops[0];

  const { data: txnRes } = useQuery({
    queryKey: ['myTxns', selected?.id],
    queryFn:  () => transactionApi.getMyTransactions({ limit: 50 }),
    enabled:  !!selected,
  });

  const allTxns = (txnRes?.data as any)?.data || [];
  const txns    = allTxns.filter((t: any) => t.shopId === selected?.id);

  return (
    <div className="animate-fade-in">
      {/* Shop pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {shops.map((s: any) => (
          <button key={s.id} onClick={() => onSelectShop(s.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${s.id === selected?.id
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-teal-700'}`}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {!selected ? (
        <div className="p-4"><EmptyState icon="🏪" title="কোনো দোকান নেই" /></div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          {/* Shop header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{selected.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{selected.name}</span>
                  {selected.verification?.status === 'VERIFIED' && (
                    <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                  )}
                </div>
                <div className="text-slate-400 text-xs">{selected.verification?.district || ''}</div>
                <StarRating rating={selected.shopRating} />
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-4 py-3">
              <div className="text-xs text-slate-400">তোমার বাকি</div>
              <div className={`font-mono text-2xl font-extrabold ${selected.balance > 0 ? 'text-red-400' : 'text-teal-400'}`}>
                {taka(selected.balance)}
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">লেনদেনের ইতিহাস</div>
            {txns.length === 0 ? (
              <EmptyState icon="📋" title="কোনো লেনদেন নেই" />
            ) : (
              <div className="space-y-2">
                {txns.map((t: any) => (
                  <TransactionItem key={t.id} type={t.type} amount={t.amount} note={t.note} date={relativeTime(t.createdAt)} />
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          {selected.products?.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">📦 দোকানের পণ্য</div>
              <div className="grid grid-cols-3 gap-2">
                {selected.products.map((p: any) => (
                  <ProductCard key={p.id} name={p.name} price={p.price} unit={p.unit} emoji={p.emoji} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════
function CustProfile({ profile }: { profile: any }) {
  if (!profile) return null;

  const shops         = profile.shops || [];
  const score         = parseFloat(profile.repScore || '3');
  const rep           = repLabel(score);
  const shopsWithBaki = shops.filter((s: any) => s.balance > 0).length;
  const ratings       = shops.map((s: any) => s.shopRating);
  const avgRating     = ratings.length
    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
    : '—';
  const totalBaki = shops.reduce((s: number, sh: any) => s + sh.balance, 0);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-slate-800 to-teal-950 border border-teal-900/40 rounded-2xl p-5 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-3">
          {profile.name?.charAt(0)}
        </div>
        <div className="text-white text-xl font-extrabold">{profile.name}</div>
        <div className="text-teal-400 font-mono text-sm mt-1">{profile.mobile}</div>
        <div className="mt-4 bg-slate-950/50 rounded-xl px-4 py-4 inline-block">
          <div className="flex justify-center mb-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-xl ${s <= Math.round(score) ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
            ))}
          </div>
          <div className={`font-mono text-3xl font-extrabold ${rep.color}`}>{profile.repScore}</div>
          <div className={`text-sm font-bold ${rep.color} mt-0.5`}>{rep.label}</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="দোকান"     value={shops.length}   color="teal"  />
        <StatCard label="বাকি আছে" value={shopsWithBaki}   color="amber" />
        <StatCard label="Avg ★"     value={avgRating}       color="green" />
      </div>

      {/* Reputation breakdown */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Reputation কীভাবে হিসাব হয়?</div>
        {[
          { label: 'দোকানদারের Rating (গড়)', value: avgRating,           positive: parseFloat(String(avgRating)) >= 3.5 },
          { label: 'বাকি আছে এমন দোকান',      value: shopsWithBaki + 'টি', positive: shopsWithBaki === 0                  },
          { label: 'মোট বকেয়া',               value: taka(totalBaki),     positive: totalBaki === 0                       },
          { label: 'Final Score',              value: profile.repScore + '/5', positive: score >= 3.5                      },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{r.label}</span>
            <span className={`font-mono font-bold ${r.positive ? 'text-teal-400' : 'text-amber-400'}`}>{r.value}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-700 text-xs text-slate-500">
          💡 টিপস: বাকি দ্রুত পরিশোধ করলে score বাড়বে!
        </div>
      </div>
    </div>
  );
}
