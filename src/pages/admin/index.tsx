import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import AppShell from '../../components/layout/AppShell';
import { StatCard, EmptyState, PageLoader, Input, Button, Modal } from '../../components/shared';
import { taka, relativeTime, getApiError } from '../../utils/helpers';

const ADMIN_TABS = [
  { id: 'dashboard',     icon: '📊', label: 'Dashboard'    },
  { id: 'shops',         icon: '🏪', label: 'Shops'        },
  { id: 'verifications', icon: '🪪', label: 'Verification' },
  { id: 'customers',     icon: '👥', label: 'Customers'    },
  { id: 'transactions',  icon: '💳', label: 'Transactions' },
];

// ═══════════════════════════════════════════════════════
// MAIN ADMIN APP
// ═══════════════════════════════════════════════════════
export default function AdminApp() {
  const [tab, setTab] = useState('dashboard');

  return (
    <AppShell tabs={ADMIN_TABS} activeTab={tab} onTabChange={setTab}
      title="HisabKhata Admin" subtitle="Platform Control" emoji="🛡️">
      {tab === 'dashboard'     && <AdminDashboard />}
      {tab === 'shops'         && <AdminShops />}
      {tab === 'verifications' && <AdminVerifications />}
      {tab === 'customers'     && <AdminCustomers />}
      {tab === 'transactions'  && <AdminTransactions />}
    </AppShell>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['adminStats'], queryFn: adminApi.getStats });
  const s = (data?.data as any)?.data;
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Shops"     value={s?.totalShops || 0}           sub={`${s?.verifiedShops || 0} verified`} color="teal"   />
        <StatCard label="Total Customers" value={s?.totalCustomers || 0}       sub="registered"                          color="violet" />
        <StatCard label="Transactions"    value={s?.totalTransactions || 0}    sub="all time"                            color="amber"  />
        <StatCard label="মোট বকেয়া"      value={taka(s?.totalOutstandingBaki || 0)} sub="outstanding"                  color="red"    />
      </div>

      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">সাম্প্রতিক লেনদেন</div>
        <div className="space-y-2">
          {(s?.recentTransactions || []).map((t: any) => (
            <div key={t.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                ${t.type === 'BAKI' ? 'bg-red-950 text-red-400' : 'bg-teal-950 text-teal-400'}`}>
                {t.type === 'BAKI' ? '📤' : '📥'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">
                  {t.customer?.name} → {t.shop?.name}
                </div>
                <div className="text-slate-500 text-[11px]">{relativeTime(t.createdAt)}</div>
              </div>
              <div className={`font-mono text-sm font-bold flex-shrink-0 ${t.type === 'BAKI' ? 'text-red-400' : 'text-teal-400'}`}>
                {t.type === 'BAKI' ? '+' : '−'}{taka(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SHOPS
// ═══════════════════════════════════════════════════════
function AdminShops() {
  const qc = useQueryClient();
  const [search,  setSearch]  = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ shopName: '', ownerName: '', mobile: '', password: 'password123', pin: '0000', district: '', thana: '' });
  const [err, setErr]         = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminShops', search],
    queryFn:  () => adminApi.getShops({ search: search || undefined }),
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createShop(form),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['adminShops'] }); setShowAdd(false); setErr(''); },
    onError:    (e) => setErr(getApiError(e)),
  });
  const deactivateMut = useMutation({
    mutationFn: adminApi.deactivateShop,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['adminShops'] }),
  });

  const shops = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="দোকান খুঁজুন..."
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
        <button onClick={() => setShowAdd(true)} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">+ নতুন</button>
      </div>

      {shops.length === 0 ? <EmptyState icon="🏪" title="কোনো Shop নেই" /> : (
        <div className="space-y-2">
          {shops.map((s: any) => (
            <div key={s.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl flex-shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                      ${s.verification?.status === 'VERIFIED' ? 'bg-teal-950 text-teal-400'
                        : s.verification?.status === 'PENDING' ? 'bg-amber-950 text-amber-400'
                        : 'bg-slate-700 text-slate-400'}`}>
                      {s.verification?.status || 'UNSUBMITTED'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs font-mono">{s.verification?.mobile}</div>
                  <div className="text-slate-500 text-xs">{s.verification?.district} · {s._count?.customers} customers · {s._count?.transactions} txns</div>
                </div>
                <button onClick={() => deactivateMut.mutate(s.id)}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-800/50">সরান</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="নতুন Shop তৈরি করুন">
        <div className="space-y-3">
          <Input label="Shop Name*" value={form.shopName}   onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}   placeholder="রহিম স্টোর" />
          <Input label="Owner Name*" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}  placeholder="আব্দুর রহিম" />
          <Input label="Mobile*" value={form.mobile}        onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}     placeholder="01XXXXXXXXX" type="tel" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="District" value={form.district}   onChange={e => setForm(f => ({ ...f, district: e.target.value }))}  placeholder="Dhaka" />
            <Input label="Thana"    value={form.thana}      onChange={e => setForm(f => ({ ...f, thana: e.target.value }))}     placeholder="Mirpur" />
          </div>
          <Input label="Password" value={form.password}     onChange={e => setForm(f => ({ ...f, password: e.target.value }))}  type="password" />
          <Input label="PIN (4 digits)" value={form.pin}    onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}       type="password" maxLength={4} placeholder="••••" />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={() => createMut.mutate()} loading={createMut.isPending} className="flex-1">তৈরি করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// VERIFICATIONS
// ═══════════════════════════════════════════════════════
function AdminVerifications() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [note,     setNote]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn:  adminApi.getPendingVerifications,
  });

  const reviewMut = useMutation({
    mutationFn: ({ shopId, decision, note }: { shopId: string; decision: string; note?: string }) =>
      adminApi.reviewVerification(shopId, decision, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pendingVerifications'] }); setSelected(null); setNote(''); },
  });

  const verifications = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
          🪪 Pending Verifications ({verifications.length})
        </div>
      </div>

      {verifications.length === 0 ? (
        <EmptyState icon="✅" title="সব Verification শেষ!" sub="কোনো pending নেই" />
      ) : (
        <div className="space-y-3">
          {verifications.map((v: any) => (
            <div key={v.id} className="bg-slate-800/60 border border-amber-800/40 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold">{v.shop?.name}</div>
                  <div className="text-slate-400 text-xs">{v.ownerName} · {v.mobile}</div>
                  <div className="text-slate-500 text-xs">{v.district}, {v.thana}</div>
                  {v.nidNumber && <div className="text-slate-500 text-xs">NID: {v.nidNumber}</div>}
                  {v.submittedAt && <div className="text-slate-600 text-xs mt-0.5">{relativeTime(v.submittedAt)}</div>}
                </div>
                <span className="bg-amber-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">Pending</span>
              </div>
              <button onClick={() => { setSelected(v); setNote(''); }}
                className="w-full py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-colors">
                ✓ Verify / ✗ Reject
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Review: ${selected?.shop?.name}`}>
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl p-3 text-sm space-y-1.5">
            {[
              ['Owner',    selected?.ownerName],
              ['Mobile',   selected?.mobile],
              ['NID',      selected?.nidNumber || '—'],
              ['Location', `${selected?.district}, ${selected?.thana}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-400">{k}:</span>
                <span className="text-white font-mono text-xs">{v}</span>
              </div>
            ))}
          </div>
          <Input label="Review Note (প্রত্যাখ্যানের কারণ)" value={note} onChange={e => setNote(e.target.value)} placeholder="ঐচ্ছিক..." />
          <div className="flex gap-2">
            <Button variant="danger"
              onClick={() => reviewMut.mutate({ shopId: selected.shopId, decision: 'REJECTED', note })}
              loading={reviewMut.isPending} className="flex-1">
              ✗ Reject
            </Button>
            <Button variant="green"
              onClick={() => reviewMut.mutate({ shopId: selected.shopId, decision: 'VERIFIED' })}
              loading={reviewMut.isPending} className="flex-1">
              ✓ Verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════
function AdminCustomers() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [resetFor, setResetFor] = useState<any>(null);
  const [newPin,   setNewPin]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminCustomers', search],
    queryFn:  () => adminApi.getCustomers({ search: search || undefined }),
  });

  const pinMut = useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) => adminApi.resetCustomerPin(id, pin),
    onSuccess:  () => { setResetFor(null); setNewPin(''); },
  });

  const customers = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Customer খুঁজুন..."
        className="w-full bg-slate-800 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />

      {customers.length === 0 ? <EmptyState icon="👥" title="কোনো Customer নেই" /> : (
        <div className="space-y-2">
          {customers.map((c: any) => (
            <div key={c.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                {c.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{c.name}</div>
                <div className="text-slate-400 text-xs font-mono">{c.mobile}</div>
                <div className="text-slate-500 text-xs">বাকি: {taka(c.totalBaki || 0)} · ★{c.avgRating || '—'}</div>
              </div>
              <button onClick={() => setResetFor(c)}
                className="flex-shrink-0 text-xs text-amber-400 border border-amber-800/50 px-2 py-1 rounded-lg hover:border-amber-600">
                🔑 PIN
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!resetFor} onClose={() => setResetFor(null)} title={`${resetFor?.name} — PIN Reset`}>
        <div className="space-y-3">
          <Input label="নতুন PIN*" value={newPin} onChange={e => setNewPin(e.target.value)} type="password" maxLength={4} placeholder="••••" />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setResetFor(null)} className="flex-1">বাতিল</Button>
            <Button onClick={() => resetFor && pinMut.mutate({ id: resetFor.id, pin: newPin })}
              loading={pinMut.isPending} disabled={newPin.length < 4} className="flex-1">
              Reset করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════
function AdminTransactions() {
  const qc = useQueryClient();
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminTxns', type],
    queryFn:  () => adminApi.getTransactions({ type: type || undefined, limit: 30 }),
  });

  const delMut = useMutation({
    mutationFn: adminApi.deleteTransaction,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['adminTxns'] }),
  });

  const txns = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex gap-2">
        {['', 'BAKI', 'PAYMENT'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
              ${type === t ? 'bg-teal-600 text-white border-teal-500' : 'border-slate-700 text-slate-400'}`}>
            {t === '' ? 'সব' : t === 'BAKI' ? '📤 বাকি' : '📥 পরিশোধ'}
          </button>
        ))}
      </div>

      {txns.length === 0 ? <EmptyState icon="💳" title="কোনো Transaction নেই" /> : (
        <div className="space-y-2">
          {txns.map((t: any) => (
            <div key={t.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                ${t.type === 'BAKI' ? 'bg-red-950 text-red-400' : 'bg-teal-950 text-teal-400'}`}>
                {t.type === 'BAKI' ? '📤' : '📥'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{t.customer?.name} → {t.shop?.name}</div>
                <div className="text-slate-400 text-xs">{t.note || '—'}</div>
                <div className="text-slate-600 text-[11px]">{relativeTime(t.createdAt)}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className={`font-mono text-sm font-bold ${t.type === 'BAKI' ? 'text-red-400' : 'text-teal-400'}`}>
                  {taka(t.amount)}
                </div>
                <button
                  onClick={() => { if (window.confirm('Delete করবেন?')) delMut.mutate(t.id); }}
                  className="text-[10px] text-red-400 hover:text-red-300 border border-red-900/50 px-1.5 py-0.5 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
