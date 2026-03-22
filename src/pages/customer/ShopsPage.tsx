import { useState }                          from 'react';
import { useOutletContext, useLocation }     from 'react-router-dom';
import { useQuery }                          from '@tanstack/react-query';
import { transactionApi }                    from '../../api';
import { TransactionItem, ProductCard, StarRating, EmptyState } from '../../components/shared';
import { taka, relativeTime }               from '../../utils/helpers';

export default function ShopsPage() {
  const { profile }  = useOutletContext<{ profile: any }>();
  const location     = useLocation();

  // shopId can be passed from HomePage via navigate state
  const initShopId   = (location.state as any)?.shopId;
  const shops        = profile?.shops || [];

  const [selectedId, setSelectedId] = useState<string>(
    initShopId || shops[0]?.id || '',
  );

  const selected = shops.find((s: any) => s.id === selectedId) ?? shops[0];

  const { data: txnRes } = useQuery({
    queryKey: ['myTxns', selected?.id],
    queryFn:  () => transactionApi.getMyTransactions({ limit: 50 }),
    enabled:  !!selected,
  });

  const allTxns = (txnRes?.data as any)?.data || [];
  const txns    = allTxns.filter((t: any) => t.shopId === selected?.id);

  return (
    <div className="animate-fade-in">
      {/* Shop pill selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {shops.map((s: any) => (
          <button key={s.id} onClick={() => setSelectedId(s.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${s.id === selectedId
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
          {/* Shop header card */}
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
