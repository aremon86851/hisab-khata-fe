const ROWS = [
  ['AC', '⌫', '%', '÷'],
  ['7',  '8',  '9', '×'],
  ['4',  '5',  '6', '−'],
  ['1',  '2',  '3', '+'],
  ['0',  '.',  '='],
]

const OPS = new Set(['÷', '×', '−', '+', '%'])

function keyClass(k) {
  if (k === 'AC') return 'bg-red-950 text-red-400 border-red-900/50 font-bold text-sm'
  if (k === '⌫')  return 'bg-slate-700 text-slate-300 border-slate-600/50 text-sm'
  if (OPS.has(k)) return 'bg-brand-900/80 text-brand-300 border-brand-800/50 text-xl font-bold'
  if (k === '=')  return 'bg-brand-600 text-white border-brand-500/50 text-xl font-bold'
  return 'bg-slate-800 text-white border-slate-700/50 text-xl font-bold'
}

export default function CalcKeypad({ onNum, onOp, onEquals, onAC, onBS }) {
  const handle = (k) => {
    if (k === 'AC')    return onAC()
    if (k === '⌫')    return onBS()
    if (k === '=')     return onEquals()
    if (OPS.has(k))    return onOp(k)
    onNum(k)
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex border-b border-slate-700/40 last:border-b-0">
          {row.map(k => (
            <button
              key={k}
              onClick={() => handle(k)}
              className={`
                calc-key flex-1 ${k === '0' ? 'flex-[2]' : ''}
                py-[18px] text-center
                border-r border-slate-700/40 last:border-r-0
                transition-all select-none
                ${keyClass(k)}
              `}
            >
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
