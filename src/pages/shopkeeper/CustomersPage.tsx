import { useState }                               from 'react';
import { useNavigate }                             from 'react-router-dom';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { customerApi }                             from '../../api';
import { BakiChip, StarRating, EmptyState, PageLoader, Input, Button, Modal } from '../../components/shared';
import { taka, getApiError }                       from '../../utils/helpers';

export default function CustomersPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<'all' | 'baki' | 'paid'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [nm,      setNm]      = useState('');
  const [mob,     setMob]     = useState('');
  const [op,      setOp]      = useState('');
  const [err,     setErr]     = useState('');

  const hb = filter === 'baki' ? true : filter === 'paid' ? false : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['shopCustomers', search, hb],
    queryFn:  () => customerApi.getCustomers({ search: search || undefined, hasBalance: hb }),
  });

  const addMut = useMutation({
    mutationFn: () => customerApi.addCustomer({ name: nm, mobile: mob, openingBalance: op ? Number(op) : undefined }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['shopCustomers'] }); setShowAdd(false); setNm(''); setMob(''); setOp(''); setErr(''); },
    onError:    (e) => setErr(getApiError(e)),
  });

  const rateMut = useMutation({
    mutationFn: ({ id, r }: { id: string; r: number }) => customerApi.rateCustomer(id, r),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['shopCustomers'] }),
  });

  const customers = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="নাম বা মোবাইল..."
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
        <button onClick={() => setShowAdd(true)}
          className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">+ যোগ</button>
      </div>

      <div className="flex gap-2">
        {(['all', 'baki', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
              ${filter === f ? 'bg-teal-600 text-white border-teal-500' : 'border-slate-700 text-slate-400'}`}>
            {f === 'all' ? 'সব' : f === 'baki' ? '🔴 বাকি' : '🟢 পরিশোধ'}
          </button>
        ))}
      </div>

      {customers.length === 0 ? <EmptyState icon="👥" title="কোনো Customer নেই" /> : (
        <div className="space-y-2">
          {customers.map((c: any) => (
            <div key={c.id}
              className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 border-l-4
                ${c.balance > 2000 ? 'border-l-red-500' : c.balance > 0 ? 'border-l-amber-500' : 'border-l-teal-500'}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm">{c.name}</div>
                  <div className="text-slate-400 text-xs font-mono">{c.mobile}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-bold text-base ${c.balance > 0 ? 'text-red-400' : 'text-teal-400'}`}>{taka(c.balance)}</div>
                  <BakiChip amount={c.balance} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-700/50">
                <StarRating rating={c.shopRating} interactive onChange={r => rateMut.mutate({ id: c.id, r })} />
                <button
                  onClick={() => navigate('/shopkeeper/calculator', { state: { custId: c.id } })}
                  className="text-xs bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                  🧮 হিসাব
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="নতুন Customer">
        <div className="space-y-3">
          <Input label="নাম*"                      value={nm}  onChange={e => setNm(e.target.value)}  placeholder="Customer এর নাম" />
          <Input label="মোবাইল*"                   value={mob} onChange={e => setMob(e.target.value)} type="tel" placeholder="01XXXXXXXXX" />
          <Input label="প্রারম্ভিক বাকি (ঐচ্ছিক)" value={op}  onChange={e => setOp(e.target.value)}  type="number" placeholder="0" />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={() => addMut.mutate()} loading={addMut.isPending} className="flex-1">যোগ করুন →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
