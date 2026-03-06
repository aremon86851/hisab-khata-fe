export default function MobileHeader({ title, subtitle, onLogout }) {
  return (
    <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 safe-top flex-shrink-0">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">📒</span>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">{title}</div>
            <div className="text-brand-400 text-xs truncate">{subtitle}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="ml-3 flex-shrink-0 text-slate-500 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
        >
          লগআউট
        </button>
      </div>
    </header>
  )
}
