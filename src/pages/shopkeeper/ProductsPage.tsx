import { useState }                               from 'react';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { productApi }                              from '../../api';
import { ProductCard, EmptyState, PageLoader, Input, Button, Modal } from '../../components/shared';
import { getApiError }                             from '../../utils/helpers';

const EMOJIS = ['🌾','🫘','🫙','🍬','🧂','🥩','🥦','💊','🍊','📱','👔','🍞','📦'];

export default function ProductsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name: '', price: '', unit: 'কেজি', emoji: '📦', category: '' });
  const [err,     setErr]     = useState('');

  const { data, isLoading }: any = useQuery({ queryKey: ['products'], queryFn: productApi.getProducts as any });

  const addMut = useMutation({
    mutationFn: () => productApi.addProduct({ ...form, price: Number(form.price) }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowAdd(false); setForm({ name: '', price: '', unit: 'কেজি', emoji: '📦', category: '' }); },
    onError:    (e) => setErr(getApiError(e)),
  });
  const delMut = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const products = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={() => setShowAdd(true)}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm mb-4 transition-colors">
        + নতুন পণ্য যোগ করুন
      </button>

      {products.length === 0 ? <EmptyState icon="📦" title="কোনো পণ্য নেই" /> : (
        <div className="grid grid-cols-3 gap-3">
          {products.map((p: any) => (
            <div key={p.id} className="relative group">
              <ProductCard name={p.name} price={p.price} unit={p.unit} emoji={p.emoji} />
              <button onClick={() => delMut.mutate(p.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="নতুন পণ্য">
        <div className="space-y-3">
          <Input label="পণ্যের নাম*" value={form.name}  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}  placeholder="চাল, ডাল..." />
          <div className="grid grid-cols-2 gap-2">
            <Input label="দাম ৳*" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="0" />
            <Input label="একক"    value={form.unit}  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}  placeholder="কেজি, পিস..." />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`text-2xl p-1 rounded-lg border ${form.emoji === e ? 'border-teal-500 bg-teal-900/30' : 'border-transparent'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={() => addMut.mutate()} loading={addMut.isPending} className="flex-1">যোগ করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
