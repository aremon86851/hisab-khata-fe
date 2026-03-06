import { taka } from '../../utils/helpers'

export default function TransactionItem({ txn, showShop = false }) {
  const isCredit = txn.type === 'baki'
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${isCredit ? 'bg-red-950/60' : 'bg-teal-950/60'}`}>
        {isCredit ? '📤' : '📥'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-semibold truncate">{txn.note}</div>
        <div className="text-slate-500 text-[11px]">
          {showShop && txn.shopName ? `${txn.shopEmoji ?? ''} ${txn.shopName} · ` : ''}
          {txn.date}
        </div>
      </div>
      <div className={`font-mono text-sm font-bold flex-shrink-0 ${isCredit ? 'text-red-400' : 'text-teal-400'}`}>
        {isCredit ? '+' : '−'}{taka(txn.amount)}
      </div>
    </div>
  )
}
