import ShopBakiCard from '../../components/customer/ShopBakiCard'
import ReputationBadge from '../../components/customer/ReputationBadge'
import TransactionItem from '../../components/shared/TransactionItem'
import { taka, reputationScore } from '../../utils/helpers'

export default function CustHome({ customer, myShops, onViewShop }) {
  const totalBaki = myShops.reduce((s, sh) => s + sh.baki, 0)
  const score     = reputationScore(customer)

  const recentTxns = myShops
    .flatMap(s => s.txns.map(t => ({ ...t, shopName: s.name, shopEmoji: s.emoji })))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6)

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-slate-800 to-brand-950 border border-brand-900/40 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-500/5 rounded-full" />
        <div className="text-xs text-brand-400 font-semibold uppercase tracking-wide">মোট বাকি</div>
        <div className={`font-mono text-4xl font-extrabold mt-1 ${totalBaki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
          {taka(totalBaki)}
        </div>
        <div className="text-slate-400 text-xs mt-1">{myShops.length}টি দোকানে</div>
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-3">
          <ReputationBadge score={score} />
          <div className="text-xs text-slate-500">আপনার trust score</div>
        </div>
      </div>

      {/* Per-shop */}
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">🏪 দোকানভিত্তিক বাকি</div>
        <div className="space-y-2">
          {myShops.map(s => (
            <ShopBakiCard key={s.id} shop={s} baki={s.baki} txnCount={s.txns.length} onClick={() => onViewShop(s.id)} />
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      {recentTxns.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">🕐 সাম্প্রতিক লেনদেন</div>
          <div className="space-y-2">
            {recentTxns.map(t => <TransactionItem key={t.id} txn={t} showShop />)}
          </div>
        </div>
      )}
    </div>
  )
}
