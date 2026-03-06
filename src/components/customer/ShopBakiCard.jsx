import { taka } from '../../utils/helpers'

export default function ShopBakiCard({ shop, baki, txnCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-slate-800/60 border border-slate-700/50 hover:border-brand-700 rounded-xl p-3 text-left flex items-center gap-3 transition-colors"
    >
      <span className="text-3xl flex-shrink-0">{shop.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-sm truncate">{shop.name}</div>
        <div className="text-slate-400 text-xs truncate">{shop.location}</div>
        <div className="text-slate-500 text-[11px] mt-0.5">{txnCount}টি লেনদেন</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-mono font-bold text-base ${baki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
          {taka(baki)}
        </div>
        <div className="text-slate-600 text-xs mt-0.5">→</div>
      </div>
    </button>
  )
}
