const BORDER = {
  brand:  'border-l-brand-500',
  red:    'border-l-red-500',
  amber:  'border-l-amber-500',
  green:  'border-l-green-500',
  violet: 'border-l-violet-500',
}

const TEXT = {
  brand:  'text-brand-400',
  red:    'text-red-400',
  amber:  'text-amber-400',
  green:  'text-green-400',
  violet: 'text-violet-400',
}

export default function StatCard({ label, value, sub, color = 'brand' }) {
  return (
    <div className={`bg-slate-800/60 border-l-4 ${BORDER[color]} rounded-xl p-3`}>
      <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-1 leading-tight">
        {label}
      </div>
      <div className={`font-mono text-2xl font-bold ${TEXT[color]}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  )
}
