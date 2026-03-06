import ReputationBadge from '../../components/customer/ReputationBadge'
import { reputationScore, taka } from '../../utils/helpers'

export default function CustProfile({ customer, myShops }) {
  const score         = reputationScore(customer)
  const shopsWithBaki = myShops.filter(s => s.baki > 0).length
  const ratings       = Object.values(customer.ratings ?? {})
  const avgRating     = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—'
  const totalBaki     = myShops.reduce((s, sh) => s + sh.baki, 0)

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-slate-800 to-brand-950 border border-brand-900/40 rounded-2xl p-5 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-3">
          {customer.name.charAt(0)}
        </div>
        <div className="text-white text-xl font-extrabold">{customer.name}</div>
        <div className="text-brand-400 font-mono text-sm mt-1">{customer.mobile}</div>
        <div className="mt-4 bg-slate-950/50 rounded-xl px-4 py-4 inline-block">
          <ReputationBadge score={score} size="lg" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🏪', label: 'দোকান',     value: myShops.length    },
          { icon: '⚠️', label: 'বাকি আছে', value: shopsWithBaki     },
          { icon: '⭐', label: 'Avg Rating', value: avgRating         },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-white font-bold font-mono text-lg">{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reputation breakdown */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Reputation কীভাবে হিসাব হয়?</div>
        {[
          { label: 'দোকানদারের Rating (গড়)', value: avgRating,           positive: parseFloat(avgRating) >= 3.5 },
          { label: 'বাকি আছে এমন দোকান',      value: shopsWithBaki + 'টি', positive: shopsWithBaki === 0          },
          { label: 'মোট বকেয়া',              value: taka(totalBaki),     positive: totalBaki === 0              },
          { label: 'Final Score',             value: score + '/5',        positive: parseFloat(score) >= 3.5     },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{r.label}</span>
            <span className={`font-mono font-bold ${r.positive ? 'text-teal-400' : 'text-amber-400'}`}>{r.value}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-700 text-xs text-slate-500">
          💡 টিপস: বাকি দ্রুত পরিশোধ করলে score বাড়বে!
        </div>
      </div>
    </div>
  )
}
