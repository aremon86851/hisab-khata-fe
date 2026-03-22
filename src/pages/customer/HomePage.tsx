import { useOutletContext }              from 'react-router-dom';
import { useQuery }                      from '@tanstack/react-query';
import { transactionApi }                from '../../api';
import { TransactionItem, EmptyState }   from '../../components/shared';
import { taka, relativeTime, repLabel }  from '../../utils/helpers';
import { useNavigate }                   from 'react-router-dom';

export default function HomePage() {
  const { profile } = useOutletContext<{ profile: any }>();
  const navigate    = useNavigate();

  const { data: txnRes } = useQuery({
    queryKey: ['myTxns'],
    queryFn:  () => transactionApi.getMyTransactions({ limit: 8 }),
  });

  const shops     = profile?.shops || [];
  const txns      = (txnRes?.data as any)?.data || [];
  const totalBaki = shops.reduce((s: number, sh: any) => s + sh.balance, 0);
  const score     = parseFloat(profile?.repScore || '3');
  const rep       = repLabel(score);

  const openShop = (id: string) => {
    navigate('/customer/shops', { state: { shopId: id } });
  };

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

      {/* Per-shop baki */}
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">🏪 দোকানভিত্তিক বাকি</div>
        {shops.length === 0 ? (
          <EmptyState icon="🏪" title="কোনো দোকান নেই" sub="আপনাকে কোনো দোকানে যোগ করা হয়নি" />
        ) : (
          <div className="space-y-2">
            {shops.map((s: any) => (
              <button key={s.id} onClick={() => openShop(s.id)}
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
