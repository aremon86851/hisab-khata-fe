const COLORS = {
  success: 'bg-teal-600',
  error:   'bg-red-600',
  info:    'bg-slate-700',
}

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
}

export default function Toast({ msg, type = 'info', visible }) {
  return (
    <div
      className={`
        fixed bottom-24 left-1/2 z-50 -translate-x-1/2
        transition-all duration-300 pointer-events-none
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className={`${COLORS[type] ?? COLORS.info} text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap`}>
        <span>{ICONS[type] ?? ICONS.info}</span>
        {msg}
      </div>
    </div>
  )
}
