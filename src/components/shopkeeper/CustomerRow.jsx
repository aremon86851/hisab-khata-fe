import StarRating from '../shared/StarRating'
import BakiChip from '../shared/BakiChip'
import { taka } from '../../utils/helpers'

export default function CustomerRow({ customer, onCalc, onRate }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white font-bold flex-shrink-0">
        {customer.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-sm truncate">{customer.name}</div>
        <div className="text-slate-400 text-xs font-mono">{customer.mobile}</div>
        <StarRating
          rating={customer.rating}
          interactive={!!onRate}
          onChange={onRate ? (r) => onRate(customer.id, r) : undefined}
        />
      </div>

      {/* Baki + Action */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className={`font-mono font-bold text-base ${customer.baki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
          {taka(customer.baki)}
        </div>
        <BakiChip amount={customer.baki} />
        {onCalc && (
          <button
            onClick={() => onCalc(customer.id)}
            className="text-[11px] bg-brand-700 hover:bg-brand-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors"
          >
            🧮 হিসাব
          </button>
        )}
      </div>
    </div>
  )
}
