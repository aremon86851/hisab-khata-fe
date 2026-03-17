import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi, customerApi, transactionApi, productApi, reminderApi, ieApi, staffApi, notifApi } from '../../api';
import AppShell from '../../components/layout/AppShell';
import { StatCard, BakiChip, StarRating, TransactionItem, ProductCard, EmptyState, PageLoader, Input, Button, Modal, Toggle } from '../../components/shared';
import { taka, relativeTime, banglaMonth, getApiError, repLabel } from '../../utils/helpers';
import type { TNotificationType } from '../../types';
import { useAuth } from '@/hooks/useAuth';

const SK_TABS = [
  { id:'dashboard',  icon:'📊', label:'Dashboard'  },
  { id:'calculator', icon:'🧮', label:'হিসাব'      },
  { id:'customers',  icon:'👥', label:'Customers'  },
  { id:'products',   icon:'📦', label:'Products'   },
  { id:'reminders',  icon:'💬', label:'Reminder'   },
  { id:'income',     icon:'💰', label:'আয়-ব্যয়'  },
  { id:'staff',      icon:'👷', label:'Staff'      },
  { id:'notif',      icon:'🔔', label:'Notif'      },
  { id:'settings',   icon:'⚙️', label:'Settings'   },
];

// ═══════════════════════════════════════════════════════
// MAIN SHOPKEEPER APP
// ═══════════════════════════════════════════════════════
export default function ShopkeeperApp() {
  const [tab,        setTab]        = useState('dashboard');
  const [calcCustId, setCalcCustId] = useState<string|undefined>();

  const { data: shopRes, isLoading } = useQuery({ queryKey:['myShop'], queryFn: shopApi.getMyShop });

  if (isLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><PageLoader /></div>;

  const shop     = (shopRes?.data as any)?.data;
  const title    = shop?.name    || 'My Shop';
  const subtitle = shop?.verification?.district || 'HisabKhata';
  const emoji    = shop?.emoji   || '🏪';

  const openCalc = (id: string) => { setCalcCustId(id); setTab('calculator'); };

  return (
    <AppShell tabs={SK_TABS} activeTab={tab} onTabChange={setTab} title={title} subtitle={subtitle} emoji={emoji}>
      {tab==='dashboard'  && <SKDashboard  onOpenCalc={openCalc} />}
      {tab==='calculator' && <SKCalculator initCustId={calcCustId} />}
      {tab==='customers'  && <SKCustomers  onOpenCalc={openCalc} />}
      {tab==='products'   && <SKProducts />}
      {tab==='reminders'  && <SKReminders />}
      {tab==='income'     && <SKIncomeExpense />}
      {tab==='staff'      && <SKStaff />}
      {tab==='notif'      && <SKNotifications />}
      {tab==='settings'   && <SKSettings shop={shop} />}
    </AppShell>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function SKDashboard({ onOpenCalc }: { onOpenCalc:(id:string)=>void }) {
  const { data:cr, isLoading } = useQuery({ queryKey:['shopCustomers'], queryFn:()=>customerApi.getCustomers({limit:100}) });
  const { data:sr } = useQuery({ queryKey:['monthlySummary'], queryFn:transactionApi.getMonthlySummary });

  const customers = (cr?.data as any)?.data || [];
  const s         = (sr?.data as any)?.data;
  const totalBaki  = customers.reduce((acc:number,c:any)=>acc+c.balance,0);
  const pending    = customers.filter((c:any)=>c.balance>0).length;

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="মোট বাকি"    value={taka(totalBaki)}       sub={`${pending} জনের কাছে`}         color="red"    />
        <StatCard label="Customers"    value={customers.length}      sub="মোট"                             color="teal"   />
        <StatCard label="বাকি আছে"    value={pending}               sub="জন"                              color="amber"  />
        <StatCard label="এই মাস আদায়" value={taka(s?.totalPayment||0)} sub="payment"                    color="green"  />
      </div>

      {s && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex gap-4 text-sm">
          {[{label:'বাকি দিয়েছি',value:s.totalBaki,c:'text-red-400'},{label:'আদায়',value:s.totalPayment,c:'text-teal-400'},{label:'বকেয়া',value:s.outstanding,c:'text-amber-400'}].map(x=>(
            <div key={x.label} className="flex-1 text-center">
              <div className={`${x.c} font-mono font-bold`}>{taka(x.value)}</div>
              <div className="text-slate-500 text-xs">{x.label}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">👥 Customer তালিকা ({customers.length})</div>
        {customers.length===0 ? <EmptyState icon="📋" title="কোনো Customer নেই" /> : (
          <div className="space-y-2">
            {customers.map((c:any) => (
              <div key={c.id} className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 border-l-4
                ${c.balance>2000?'border-l-red-500':c.balance>0?'border-l-amber-500':'border-l-teal-500'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-slate-400 text-xs font-mono">{c.mobile}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`font-mono font-bold text-base ${c.balance>0?'text-red-400':'text-teal-400'}`}>{taka(c.balance)}</div>
                  <BakiChip amount={c.balance} />
                  <button onClick={()=>onOpenCalc(c.id)} className="text-[11px] bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors">🧮 হিসাব</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CALCULATOR
// ═══════════════════════════════════════════════════════
const CALC_ROWS = [['AC','⌫','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],[  '0','.','=']];
const CALC_OPS  = new Set(['÷','×','−','+','%']);

function SKCalculator({ initCustId }: { initCustId?:string }) {
  const qc = useQueryClient();
  const [selId,   setSelId]   = useState(initCustId||'');
  const [disp,    setDisp]    = useState('0');
  const [prev,    setPrev]    = useState<number|null>(null);
  const [op,      setOp]      = useState<string|null>(null);
  const [opLbl,   setOpLbl]   = useState('');
  const [newNum,  setNewNum]  = useState(true);
  const [note,    setNote]    = useState('');
  const [confirm, setConfirm] = useState<{type:'BAKI'|'PAYMENT';amount:number}|null>(null);
  const [toast,   setToast]   = useState('');

  const { data:cr }  = useQuery({ queryKey:['shopCustomers'], queryFn:()=>customerApi.getCustomers({limit:100}) });
  const { data:txnR } = useQuery({ queryKey:['custTxns',selId], queryFn:()=>transactionApi.getShopTransactions({customerId:selId,limit:6}), enabled:!!selId });

  const customers = (cr?.data as any)?.data || [];
  const customer  = customers.find((c:any)=>c.id===selId);
  const txns      = (txnR?.data as any)?.data || [];

  const txnMut = useMutation({
    mutationFn:(d:any)=>transactionApi.addTransaction(d),
    onSuccess:()=>{
      qc.invalidateQueries({queryKey:['shopCustomers']}); qc.invalidateQueries({queryKey:['custTxns',selId]});
      setConfirm(null); pressAC(); setNote('');
      setToast('✅ হিসাব সম্পন্ন!'); setTimeout(()=>setToast(''),3000);
    },
    onError:(e)=>{ setToast('❌ '+getApiError(e)); setTimeout(()=>setToast(''),3000); setConfirm(null); },
  });

  const pressNum = (n:string) => { setDisp(p=>newNum?(n==='.'?'0.':n==='0'?'0':n):(n==='.'&&p.includes('.')?p:p==='0'&&n!=='.'?n:p+n)); setNewNum(false); };
  const pressOp  = (o:string) => { setPrev(parseFloat(disp)); setOp(o); setOpLbl(parseFloat(disp).toLocaleString('en')+' '+o); setNewNum(true); };
  const pressEq  = () => {
    if(!op||prev===null) return;
    const b=parseFloat(disp);
    let r=op==='+'?prev+b:op==='−'?prev-b:op==='×'?prev*b:op==='÷'?(b?prev/b:0):prev*b/100;
    r=Math.round(r*100)/100;
    setDisp(String(r)); setOp(null); setPrev(null); setNewNum(true); setOpLbl('');
  };
  const pressAC  = useCallback(()=>{ setDisp('0'); setOp(null); setPrev(null); setNewNum(true); setOpLbl(''); },[]);
  const pressBS  = ()=>setDisp(d=>d.length<=1?'0':d.slice(0,-1));

  const handleKey = (k:string) => {
    if(k==='AC')pressAC(); else if(k==='⌫')pressBS(); else if(k==='=')pressEq();
    else if(CALC_OPS.has(k))pressOp(k); else pressNum(k);
  };

  const handleSave = (type:'BAKI'|'PAYMENT') => {
    if(!customer){ setToast('❌ Customer সিলেক্ট করুন'); setTimeout(()=>setToast(''),3000); return; }
    const amt=parseFloat(disp);
    if(!amt||amt<=0){ setToast('❌ সঠিক পরিমাণ দিন'); setTimeout(()=>setToast(''),3000); return; }
    setConfirm({type,amount:amt});
  };

  const keyStyle = (k:string) => {
    if(k==='AC') return 'bg-red-950 text-red-400 text-sm font-bold';
    if(k==='⌫')  return 'bg-slate-700 text-slate-300 text-sm';
    if(CALC_OPS.has(k)) return 'bg-teal-900/80 text-teal-300 text-xl font-bold';
    if(k==='=')  return 'bg-teal-600 text-white text-xl font-bold';
    return 'bg-slate-800 text-white text-xl font-bold';
  };

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl
          ${toast.startsWith('✅')?'bg-teal-600':'bg-red-600'}`}>{toast}</div>
      )}

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-3 space-y-2">
          <select value={selId} onChange={e=>setSelId(e.target.value)}
            className="w-full bg-slate-700/60 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none">
            <option value="">— Customer সিলেক্ট করুন —</option>
            {customers.map((c:any)=><option key={c.id} value={c.id}>{c.name} — {taka(c.balance)}</option>)}
          </select>
          {customer && (
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">বর্তমান বাকি</span>
              <span className={`font-mono text-xl font-bold ${customer.balance>0?'text-red-400':'text-teal-400'}`}>{taka(customer.balance)}</span>
            </div>
          )}
        </div>
        <div className="bg-slate-950 mx-3 mb-3 rounded-xl px-4 py-3 min-h-[68px] flex flex-col items-end justify-center">
          <div className="text-slate-500 text-xs font-mono h-4">{opLbl}</div>
          <div className="text-white text-3xl font-mono font-bold">{disp}</div>
        </div>
        <div className="px-3 pb-3">
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="📝 নোট (চাল ২ কেজি...)"
            className="w-full bg-slate-700/60 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2 text-white text-sm outline-none placeholder-slate-500" />
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        {CALC_ROWS.map((row,ri)=>(
          <div key={ri} className="flex border-b border-slate-700/40 last:border-b-0">
            {row.map(k=>(
              <button key={k} onClick={()=>handleKey(k)}
                className={`calc-key flex-1 ${k==='0'?'flex-[2]':''} py-[18px] text-center border-r border-slate-700/40 last:border-r-0 select-none ${keyStyle(k)}`}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>handleSave('BAKI')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
          <span className="text-lg">📤</span>
          <div className="text-left"><div>বাকি দিল</div><div className="text-xs opacity-70 font-normal">Credit নিয়েছে</div></div>
        </button>
        <button onClick={()=>handleSave('PAYMENT')} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
          <span className="text-lg">📥</span>
          <div className="text-left"><div>টাকা দিল</div><div className="text-xs opacity-70 font-normal">Payment করেছে</div></div>
        </button>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-end justify-center" onClick={()=>setConfirm(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-md p-5" onClick={e=>e.stopPropagation()}>
            <h3 className="text-white font-bold text-base mb-4">নিশ্চিত করুন?</h3>
            <div className="bg-slate-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Customer:</span><span className="text-white font-semibold">{customer?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">পরিমাণ:</span><span className={`font-mono font-bold ${confirm.type==='BAKI'?'text-red-400':'text-teal-400'}`}>{taka(confirm.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ধরন:</span><span className="text-white">{confirm.type==='BAKI'?'বাকি':'পরিশোধ'}</span></div>
              {note && <div className="flex justify-between"><span className="text-slate-400">নোট:</span><span className="text-white">{note}</span></div>}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setConfirm(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm">বাতিল</button>
              <button onClick={()=>txnMut.mutate({customerId:selId,type:confirm.type,amount:confirm.amount,note:note||undefined})}
                disabled={txnMut.isPending} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm disabled:opacity-50">
                {txnMut.isPending?'সম্পন্ন হচ্ছে...':'হ্যাঁ, সম্পন্ন করুন ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {txns.length>0 && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">{customer?.name} — সাম্প্রতিক</div>
          <div className="space-y-2">
            {txns.map((t:any)=><TransactionItem key={t.id} type={t.type} amount={t.amount} note={t.note} date={relativeTime(t.createdAt)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════
function SKCustomers({ onOpenCalc }:{ onOpenCalc:(id:string)=>void }) {
  const qc=useQueryClient();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<'all'|'baki'|'paid'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [nm,  setNm]  = useState('');
  const [mob, setMob] = useState('');
  const [op,  setOp]  = useState('');
  const [err, setErr] = useState('');

  const hb = filter==='baki'?true:filter==='paid'?false:undefined;
  const { data, isLoading } = useQuery({ queryKey:['shopCustomers',search,hb], queryFn:()=>customerApi.getCustomers({search:search||undefined,hasBalance:hb}) });
  const addMut = useMutation({
    mutationFn:()=>customerApi.addCustomer({name:nm,mobile:mob,openingBalance:op?Number(op):undefined}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['shopCustomers']}); setShowAdd(false); setNm(''); setMob(''); setOp(''); setErr(''); },
    onError:(e)=>setErr(getApiError(e)),
  });
  const rateMut = useMutation({
    mutationFn:({id,r}:{id:string;r:number})=>customerApi.rateCustomer(id,r),
    onSuccess:()=>qc.invalidateQueries({queryKey:['shopCustomers']}),
  });

  const customers = (data?.data as any)?.data || [];
  if(isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="নাম বা মোবাইল..."
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
        <button onClick={()=>setShowAdd(true)} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm">+ যোগ</button>
      </div>
      <div className="flex gap-2">
        {(['all','baki','paid'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
              ${filter===f?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>
            {f==='all'?'সব':f==='baki'?'🔴 বাকি':'🟢 পরিশোধ'}
          </button>
        ))}
      </div>
      {customers.length===0 ? <EmptyState icon="👥" title="কোনো Customer নেই" /> : (
        <div className="space-y-2">
          {customers.map((c:any)=>(
            <div key={c.id} className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 border-l-4
              ${c.balance>2000?'border-l-red-500':c.balance>0?'border-l-amber-500':'border-l-teal-500'}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm">{c.name}</div>
                  <div className="text-slate-400 text-xs font-mono">{c.mobile}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-bold text-base ${c.balance>0?'text-red-400':'text-teal-400'}`}>{taka(c.balance)}</div>
                  <BakiChip amount={c.balance} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-700/50">
                <StarRating rating={c.shopRating} interactive onChange={r=>rateMut.mutate({id:c.id,r})} />
                <button onClick={()=>onOpenCalc(c.id)} className="text-xs bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold">🧮 হিসাব</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="নতুন Customer">
        <div className="space-y-3">
          <Input label="নাম*" value={nm} onChange={e=>setNm(e.target.value)} placeholder="Customer এর নাম" />
          <Input label="মোবাইল*" value={mob} onChange={e=>setMob(e.target.value)} type="tel" placeholder="01XXXXXXXXX" />
          <Input label="প্রারম্ভিক বাকি (ঐচ্ছিক)" value={op} onChange={e=>setOp(e.target.value)} type="number" placeholder="0" />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={()=>addMut.mutate()} loading={addMut.isPending} className="flex-1">যোগ করুন →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════
function SKProducts() {
  const qc=useQueryClient();
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',price:'',unit:'কেজি',emoji:'📦',category:''});
  const [err,setErr]=useState('');
  const EMOJIS=['🌾','🫘','🫙','🍬','🧂','🥩','🥦','💊','🍊','📱','👔','🍞','📦'];
  const { data, isLoading } = useQuery({ queryKey:['products'], queryFn:productApi.getProducts });
  const addMut = useMutation({
    mutationFn:()=>productApi.addProduct({...form,price:Number(form.price)}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['products']}); setShowAdd(false); setForm({name:'',price:'',unit:'কেজি',emoji:'📦',category:''}); },
    onError:(e)=>setErr(getApiError(e)),
  });
  const delMut = useMutation({ mutationFn:productApi.deleteProduct, onSuccess:()=>qc.invalidateQueries({queryKey:['products']}) });
  const products = (data?.data as any)?.data || [];
  if(isLoading) return <PageLoader />;
  return (
    <div className="p-4 animate-fade-in">
      <button onClick={()=>setShowAdd(true)} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm mb-4 transition-colors">+ নতুন পণ্য যোগ করুন</button>
      {products.length===0 ? <EmptyState icon="📦" title="কোনো পণ্য নেই" /> : (
        <div className="grid grid-cols-3 gap-3">
          {products.map((p:any)=>(
            <div key={p.id} className="relative group">
              <ProductCard name={p.name} price={p.price} unit={p.unit} emoji={p.emoji} />
              <button onClick={()=>delMut.mutate(p.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
            </div>
          ))}
        </div>
      )}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="নতুন পণ্য">
        <div className="space-y-3">
          <Input label="পণ্যের নাম*" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="চাল, ডাল..." />
          <div className="grid grid-cols-2 gap-2">
            <Input label="দাম ৳*" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} type="number" placeholder="0" />
            <Input label="একক" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="কেজি, পিস..." />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e=><button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} className={`text-2xl p-1 rounded-lg border ${form.emoji===e?'border-teal-500 bg-teal-900/30':'border-transparent'}`}>{e}</button>)}
            </div>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={()=>addMut.mutate()} loading={addMut.isPending} className="flex-1">যোগ করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════════════
function SKReminders() {
  const [showSend,setShowSend]=useState(false);
  const [custId,setCustId]=useState('');
  const [channel,setChannel]=useState<'WHATSAPP'|'SMS'|'BOTH'>('WHATSAPP');
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const [sent,setSent]=useState<any>(null);

  const { data:cr } = useQuery({ queryKey:['shopCustomers'], queryFn:()=>customerApi.getCustomers({limit:100,hasBalance:true}) });
  const { data:hr, isLoading } = useQuery({ queryKey:['reminderHistory'], queryFn:()=>reminderApi.getHistory() });
  const { data:sr } = useQuery({ queryKey:['reminderSettings'], queryFn:reminderApi.getSettings });

  const sendMut = useMutation({
    mutationFn:()=>reminderApi.sendReminder({customerId:custId,channel,messageBody:msg||undefined}),
    onSuccess:({data}:any)=>{ setSent(data.data); setErr(''); },
    onError:(e)=>setErr(getApiError(e)),
  });

  const customers = (cr?.data as any)?.data || [];
  const history   = (hr?.data as any)?.data || [];
  const template  = (sr?.data as any)?.data?.messageTemplate || '';

  const onCustChange = (id:string) => {
    setCustId(id);
    const c=customers.find((x:any)=>x.id===id);
    if(c&&template) setMsg(template.replace('{{name}}',c.name).replace('{{amount}}',`৳${c.balance}`).replace('{{shop}}','আমাদের দোকান'));
  };

  if(isLoading) return <PageLoader />;
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <button onClick={()=>setShowSend(true)} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">💬 Payment Reminder পাঠান</button>
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">সাম্প্রতিক Reminder</div>
        {history.length===0 ? <div className="text-center text-slate-500 py-8">কোনো reminder পাঠানো হয়নি</div> : (
          <div className="space-y-2">
            {history.map((r:any)=>(
              <div key={r.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status==='SENT'?'bg-teal-950 text-teal-400':r.status==='FAILED'?'bg-red-950 text-red-400':'bg-amber-950 text-amber-400'}`}>{r.channel} · {r.status}</span>
                  <span className="text-slate-500 text-xs">{relativeTime(r.createdAt)}</span>
                </div>
                <p className="text-slate-300 text-xs line-clamp-2">{r.messageBody}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={showSend} onClose={()=>{setShowSend(false);setSent(null);setErr('');}} title="Reminder পাঠান">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-white font-bold">Reminder তৈরি হয়েছে!</div>
            {sent.whatsappLink && <a href={sent.whatsappLink} target="_blank" rel="noreferrer" className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">💬 WhatsApp এ পাঠান →</a>}
            <Button variant="ghost" onClick={()=>{setSent(null);setShowSend(false);}} className="w-full">বন্ধ করুন</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">Customer</label>
              <select value={custId} onChange={e=>onCustChange(e.target.value)} className="w-full bg-slate-800 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                <option value="">— বেছে নিন —</option>
                {customers.map((c:any)=><option key={c.id} value={c.id}>{c.name} — {taka(c.balance)}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {(['WHATSAPP','SMS','BOTH'] as const).map(ch=>(
                <button key={ch} onClick={()=>setChannel(ch)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${channel===ch?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>
                  {ch==='WHATSAPP'?'💬 WA':ch==='SMS'?'📱 SMS':'🔀 Both'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">Message</label>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4} className="w-full bg-slate-800 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none" />
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={()=>setShowSend(false)} className="flex-1">বাতিল</Button>
              <Button onClick={()=>sendMut.mutate()} loading={sendMut.isPending} disabled={!custId} className="flex-1">পাঠান →</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INCOME / EXPENSE
// ═══════════════════════════════════════════════════════
function SKIncomeExpense() {
  const qc=useQueryClient();
  const now=new Date();
  const [year,setYear]=useState(now.getFullYear());
  const [month,setMonth]=useState(now.getMonth()+1);
  const [tab,setTab]=useState<'INCOME'|'EXPENSE'>('INCOME');
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({type:'INCOME' as 'INCOME'|'EXPENSE',amount:'',category:'',note:''});
  const [err,setErr]=useState('');
  const INCOME_CATS=['বিক্রয়','বাকি আদায়','অন্যান্য'];
  const EXPENSE_CATS=['মাল কেনা','ভাড়া','বিদ্যুৎ','কর্মচারী','অন্যান্য'];

  const { data:sumR }     = useQuery({ queryKey:['ieSummary',year,month], queryFn:()=>ieApi.getMonthlySummary(year,month) });
  const { data:entriesR, isLoading } = useQuery({ queryKey:['ieEntries',tab], queryFn:()=>ieApi.getEntries({type:tab,limit:30}) });
  const addMut = useMutation({
    mutationFn:()=>ieApi.addEntry({type:form.type,amount:Number(form.amount),category:form.category,note:form.note||undefined}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['ieSummary']}); qc.invalidateQueries({queryKey:['ieEntries']}); setShowAdd(false); setForm({type:'INCOME',amount:'',category:'',note:''}); setErr(''); },
    onError:(e)=>setErr(getApiError(e)),
  });
  const delMut = useMutation({
    mutationFn:ieApi.deleteEntry,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['ieSummary']}); qc.invalidateQueries({queryKey:['ieEntries']}); },
  });

  const s=( sumR?.data as any)?.data;
  const entries=(entriesR?.data as any)?.data||[];
  if(isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2">
        <button onClick={()=>{if(month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1);}} className="text-slate-400 hover:text-white text-xl">←</button>
        <span className="text-white font-bold">{banglaMonth(month)} {year}</span>
        <button onClick={()=>{if(month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1);}} className="text-slate-400 hover:text-white text-xl">→</button>
      </div>
      {s && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="আয়" value={taka(s.totalIncome)} color="green" />
          <StatCard label="ব্যয়" value={taka(s.totalExpense)} color="red" />
          <StatCard label="লাভ" value={taka(s.netProfit)} color={s.netProfit>=0?'teal':'amber'} />
        </div>
      )}
      <button onClick={()=>{setShowAdd(true);setForm(f=>({...f,type:tab,category:''}));}} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors">+ নতুন Entry যোগ করুন</button>
      <div className="flex gap-2">
        {(['INCOME','EXPENSE'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${tab===t?(t==='INCOME'?'bg-teal-600 text-white border-teal-500':'bg-red-600 text-white border-red-500'):'border-slate-700 text-slate-400'}`}>
            {t==='INCOME'?'📈 আয়':'📉 ব্যয়'}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {entries.map((e:any)=>(
          <div key={e.id} className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 border-l-4 ${e.type==='INCOME'?'border-l-teal-500':'border-l-red-500'}`}>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{e.category}</div>
              {e.note && <div className="text-slate-400 text-xs">{e.note}</div>}
              <div className="text-slate-500 text-xs">{new Date(e.entryDate).toLocaleDateString('bn-BD')}</div>
            </div>
            <div className={`font-mono font-bold ${e.type==='INCOME'?'text-teal-400':'text-red-400'}`}>{taka(e.amount)}</div>
            <button onClick={()=>delMut.mutate(e.id)} className="text-slate-600 hover:text-red-400 text-xs ml-1">✕</button>
          </div>
        ))}
      </div>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="নতুন Entry">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['INCOME','EXPENSE'] as const).map(t=>(
              <button key={t} onClick={()=>setForm(f=>({...f,type:t,category:''}))} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${form.type===t?(t==='INCOME'?'bg-teal-600 text-white border-teal-500':'bg-red-600 text-white border-red-500'):'border-slate-700 text-slate-400'}`}>
                {t==='INCOME'?'আয়':'ব্যয়'}
              </button>
            ))}
          </div>
          <Input label="পরিমাণ ৳*" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} type="number" placeholder="0" />
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {(form.type==='INCOME'?INCOME_CATS:EXPENSE_CATS).map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,category:c}))} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${form.category===c?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>{c}</button>
              ))}
            </div>
          </div>
          <Input label="নোট" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="বিস্তারিত..." />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={()=>addMut.mutate()} loading={addMut.isPending} disabled={!form.amount||!form.category} className="flex-1">যোগ করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════
const PERMS=[{k:'canAddBaki',l:'বাকি যোগ'},{k:'canAddPayment',l:'Payment নিতে'},{k:'canAddCustomer',l:'Customer যোগ'},{k:'canViewReport',l:'Report দেখা'},{k:'canManageProduct',l:'Product manage'},{k:'canSendReminder',l:'Reminder পাঠানো'}];

function SKStaff() {
  const qc=useQueryClient();
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState<any>({name:'',mobile:'',pin:'',role:'STAFF',canAddBaki:true,canAddPayment:true,canAddCustomer:false,canViewReport:false,canManageProduct:false,canSendReminder:false});
  const [err,setErr]=useState('');
  const [pinFor,setPinFor]=useState<any>(null);
  const [newPin,setNewPin]=useState('');

  const { data, isLoading } = useQuery({ queryKey:['staff'], queryFn:staffApi.getStaff });
  const addMut  = useMutation({ mutationFn:()=>staffApi.addStaff(form), onSuccess:()=>{ qc.invalidateQueries({queryKey:['staff']}); setShowAdd(false); setErr(''); }, onError:(e)=>setErr(getApiError(e)) });
  const remMut  = useMutation({ mutationFn:staffApi.removeStaff, onSuccess:()=>qc.invalidateQueries({queryKey:['staff']}) });
  const pinMut  = useMutation({ mutationFn:({id,pin}:{id:string;pin:string})=>staffApi.resetPin(id,pin), onSuccess:()=>{ setPinFor(null); setNewPin(''); } });

  const staff=(data?.data as any)?.data||[];
  if(isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <button onClick={()=>setShowAdd(true)} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">+ নতুন Staff যোগ করুন</button>
      {staff.length===0 ? <EmptyState icon="👷" title="কোনো Staff নেই" /> : (
        <div className="space-y-3">
          {staff.map((s:any)=>(
            <div key={s.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>
                <div className="flex-1"><div className="text-white font-bold text-sm">{s.name}</div><div className="text-slate-400 text-xs font-mono">{s.mobile}</div></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.role==='MANAGER'?'bg-violet-900/60 text-violet-400':'bg-slate-700 text-slate-300'}`}>{s.role==='MANAGER'?'ম্যানেজার':'স্টাফ'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PERMS.filter(p=>s[p.k]).map(p=><span key={p.k} className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-400 font-semibold">✓ {p.l}</span>)}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setPinFor(s)} className="flex-1 text-xs py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-teal-600 hover:text-teal-400 transition-colors">🔑 PIN Reset</button>
                <button onClick={()=>remMut.mutate(s.id)} className="text-xs py-1.5 px-3 rounded-lg border border-slate-700 text-red-400 hover:border-red-600 transition-colors">সরান</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="নতুন Staff">
        <div className="space-y-3">
          <Input label="নাম*" value={form.name} onChange={e=>setForm((f:any)=>({...f,name:e.target.value}))} placeholder="Staff এর নাম" />
          <Input label="মোবাইল*" value={form.mobile} onChange={e=>setForm((f:any)=>({...f,mobile:e.target.value}))} type="tel" placeholder="01XXXXXXXXX" />
          <Input label="PIN* (৪ সংখ্যা)" value={form.pin} onChange={e=>setForm((f:any)=>({...f,pin:e.target.value}))} type="password" maxLength={4} placeholder="••••" />
          <div className="flex gap-2">
            {(['STAFF','MANAGER'] as const).map(r=>(
              <button key={r} onClick={()=>setForm((f:any)=>({...f,role:r}))} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.role===r?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>{r==='MANAGER'?'ম্যানেজার':'স্টাফ'}</button>
            ))}
          </div>
          <div className="space-y-2">
            {PERMS.map(p=>(
              <Toggle key={p.k} value={form[p.k]} onChange={v=>setForm((f:any)=>({...f,[p.k]:v}))} label={p.l} />
            ))}
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>setShowAdd(false)} className="flex-1">বাতিল</Button>
            <Button onClick={()=>addMut.mutate()} loading={addMut.isPending} className="flex-1">যোগ করুন</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!pinFor} onClose={()=>setPinFor(null)} title={`${pinFor?.name} — PIN Reset`}>
        <div className="space-y-3">
          <Input label="নতুন PIN (৪ সংখ্যা)*" value={newPin} onChange={e=>setNewPin(e.target.value)} type="password" maxLength={4} placeholder="••••" />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>setPinFor(null)} className="flex-1">বাতিল</Button>
            <Button onClick={()=>pinFor&&pinMut.mutate({id:pinFor.id,pin:newPin})} loading={pinMut.isPending} disabled={newPin.length<4} className="flex-1">Reset করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════
const NOTIF_ICONS:Record<TNotificationType,string>={NEW_BAKI:'📤',PAYMENT_RECEIVED:'📥',REMINDER_SENT:'💬',SHOP_VERIFIED:'✅',REFERRAL_REWARD:'🎁',SYSTEM:'ℹ️'};

function SKNotifications() {
  const qc=useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:['notifications'], queryFn:()=>notifApi.getAll({limit:30}) });
  const markMut    = useMutation({ mutationFn:notifApi.markRead,    onSuccess:()=>qc.invalidateQueries({queryKey:['notifications']}) });
  const markAllMut = useMutation({ mutationFn:notifApi.markAllRead, onSuccess:()=>qc.invalidateQueries({queryKey:['notifications']}) });
  const notifs     = (data?.data as any)?.data||[];
  const unread     = (data?.data as any)?.unreadCount||0;
  if(isLoading) return <PageLoader />;
  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
          🔔 নোটিফিকেশন {unread>0&&<span className="ml-1 bg-red-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">{unread}</span>}
        </div>
        {unread>0 && <button onClick={()=>markAllMut.mutate()} className="text-teal-400 text-xs hover:underline">সব পড়েছি</button>}
      </div>
      {notifs.length===0 ? <EmptyState icon="🔔" title="কোনো নোটিফিকেশন নেই" /> : (
        <div className="space-y-2">
          {notifs.map((n:any)=>(
            <div key={n.id} onClick={()=>!n.isRead&&markMut.mutate(n.id)}
              className={`bg-slate-800/60 border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${n.isRead?'border-slate-700/30 opacity-70':'border-slate-700 hover:border-teal-800'}`}>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5"/>}
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">{NOTIF_ICONS[n.type as TNotificationType]||'ℹ️'}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${n.isRead?'text-slate-400':'text-white'}`}>{n.title}</div>
                <div className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.body}</div>
                <div className="text-slate-600 text-[11px] mt-1">{relativeTime(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════
function SKSettings({ shop }: { shop: any }) {
  const qc=useQueryClient();
  const { logout }=useAuth();
  const [shopName, setShopName]=useState(shop?.name||'');
  const [shopEmoji,setShopEmoji]=useState(shop?.emoji||'🏪');
  const [saved,    setSaved]=useState(false);
  const [err,      setErr]=useState('');
  const { data:sr } = useQuery({ queryKey:['reminderSettings'], queryFn:reminderApi.getSettings });
  const settings=(sr?.data as any)?.data;
  const [autoRemind,setAutoRemind]=useState(settings?.autoRemindEnabled??false);
  const [daysAfter, setDaysAfter] =useState(String(settings?.daysAfterBaki??7));
  const [channel,   setChannel]   =useState<'WHATSAPP'|'SMS'|'BOTH'>(settings?.channel??'WHATSAPP');
  const [template,  setTemplate]  =useState(settings?.messageTemplate??'');
  const EMOJIS=['🏪','💊','👔','🥩','🥦','📱','🍞','✂️','🏬'];
  const shopMut = useMutation({ mutationFn:()=>shopApi.updateShop({name:shopName,emoji:shopEmoji}), onSuccess:()=>{ qc.invalidateQueries({queryKey:['myShop']}); setSaved(true); setTimeout(()=>setSaved(false),2000); }, onError:(e)=>setErr(getApiError(e)) });
  const settMut = useMutation({ mutationFn:()=>reminderApi.updateSettings({autoRemindEnabled:autoRemind,daysAfterBaki:Number(daysAfter),channel,messageTemplate:template}), onSuccess:()=>qc.invalidateQueries({queryKey:['reminderSettings']}) });

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {err && <div className="bg-red-950/50 text-red-400 text-sm px-4 py-3 rounded-xl">{err}</div>}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">🏪 দোকানের তথ্য</div>
        <Input label="দোকানের নাম" value={shopName} onChange={e=>setShopName(e.target.value)} />
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e=><button key={e} onClick={()=>setShopEmoji(e)} className={`text-2xl p-2 rounded-xl border transition-all ${shopEmoji===e?'border-teal-500 bg-teal-900/30':'border-transparent hover:border-slate-600'}`}>{e}</button>)}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-300 text-sm">Verification Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${shop?.verification?.status==='VERIFIED'?'bg-teal-950 text-teal-400':shop?.verification?.status==='PENDING'?'bg-amber-950 text-amber-400':shop?.verification?.status==='REJECTED'?'bg-red-950 text-red-400':'bg-slate-700 text-slate-400'}`}>
            {shop?.verification?.status||'UNSUBMITTED'}
          </span>
        </div>
        <Button onClick={()=>shopMut.mutate()} loading={shopMut.isPending} className="w-full">{saved?'✅ সংরক্ষিত!':'সংরক্ষণ করুন'}</Button>
      </div>
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-4">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">💬 Reminder Settings</div>
        <Toggle value={autoRemind} onChange={setAutoRemind} label="Auto Reminder চালু" />
        {autoRemind && <Input label={`বাকির পরে কত দিনে (${daysAfter} দিন)`} value={daysAfter} onChange={e=>setDaysAfter(e.target.value)} type="number" min={1} max={30} />}
        <div className="flex gap-2">
          {(['WHATSAPP','SMS','BOTH'] as const).map(ch=>(
            <button key={ch} onClick={()=>setChannel(ch)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${channel===ch?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>
              {ch==='WHATSAPP'?'WhatsApp':ch==='SMS'?'SMS':'দুটোই'}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Message Template</label>
          <textarea value={template} onChange={e=>setTemplate(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none" />
        </div>
        <Button onClick={()=>settMut.mutate()} loading={settMut.isPending} className="w-full">Settings সংরক্ষণ করুন</Button>
      </div>
      <button onClick={logout} className="w-full py-3 rounded-xl border border-red-800 text-red-400 font-bold text-sm hover:bg-red-950/30 transition-colors">লগআউট</button>
    </div>
  );
}
