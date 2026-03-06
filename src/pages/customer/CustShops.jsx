import TransactionItem from '../../components/shared/TransactionItem'
import ProductCard from '../../components/shared/ProductCard'
import StarRating from '../../components/shared/StarRating'
import { taka } from '../../utils/helpers'

export default function CustShops({ myShops, selectedId, onSelect }) {
  const selected = myShops.find(s => s.id === selectedId) ?? myShops[0]

  return (
    <div className="animate-fade-in">
      {/* Pill selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0">
        {myShops.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              s.id === selected?.id
                ? 'bg-brand-600 text-white border-brand-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-brand-700'
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="px-4 pb-4 space-y-4">
          {/* Shop header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{selected.emoji}</span>
              <div>
                <div className="text-white font-bold">{selected.name}</div>
                <div className="text-slate-400 text-xs">{selected.location}</div>
                <StarRating rating={selected.rating} />
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-4 py-3">
              <div className="text-xs text-slate-400">তোমার বাকি</div>
              <div className={`font-mono text-2xl font-extrabold ${selected.baki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
                {taka(selected.baki)}
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">লেনদেনের ইতিহাস</div>
            {selected.txns.length === 0
              ? <div className="text-center text-slate-500 py-8 text-sm">কোনো লেনদেন নেই</div>
              : <div className="space-y-2">
                  {selected.txns.map(t => <TransactionItem key={t.id} txn={t} />)}
                </div>
            }
          </div>

          {/* Products */}
          {selected.products?.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">📦 দোকানের পণ্য</div>
              <div className="grid grid-cols-3 gap-2">
                {selected.products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
