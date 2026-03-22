import { useState }                               from 'react';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { adminApi }                                from '../../api';
import { EmptyState, PageLoader, Input, Button, Modal } from '../../components/shared';
import { getApiError }                             from '../../utils/helpers';

export default function AdminShopsPage() {
  const qc = useQueryClient();
  const [search,  setSearch]  = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ shopName: '', ownerName: '', mobile: '', password: 'password123', pin: '0000', district: '', thana: '' });
  const [err,     setErr]     = useState('');

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
        <button onClick={() => setShowAdd(true)}
          className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">+ নতুন</button>
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
                      ${s.verification?.status === 'VERIFIED'  ? 'bg-teal-950 text-teal-400'
                        : s.verification?.status === 'PENDING' ? 'bg-amber-950 text-amber-400'
                        : 'bg-slate-700 text-slate-400'}`}>
                      {s.verification?.status || 'UNSUBMITTED'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs font-mono">{s.verification?.mobile}</div>
                  <div className="text-slate-500 text-xs">{s.verification?.district} · {s._count?.customers} customers</div>
                </div>
                <button onClick={() => deactivateMut.mutate(s.id)}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-800/50">
                  সরান
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="নতুন Shop তৈরি করুন">
        <div className="space-y-3">
          <Input label="Shop Name*"    value={form.shopName}   onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}   placeholder="রহিম স্টোর" />
          <Input label="Owner Name*"   value={form.ownerName}  onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}  placeholder="আব্দুর রহিম" />
          <Input label="Mobile*"       value={form.mobile}     onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}     type="tel" placeholder="01XXXXXXXXX" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="District"    value={form.district}   onChange={e => setForm(f => ({ ...f, district: e.target.value }))}  placeholder="Dhaka" />
            <Input label="Thana"       value={form.thana}      onChange={e => setForm(f => ({ ...f, thana: e.target.value }))}     placeholder="Mirpur" />
          </div>
          <Input label="Password"      value={form.password}   onChange={e => setForm(f => ({ ...f, password: e.target.value }))}  type="password" />
          <Input label="PIN (4 digits)" value={form.pin}       onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}       type="password" maxLength={4} />
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
