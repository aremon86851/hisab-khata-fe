export default function DesktopSidebar({ tabs, activeTab, onTabChange, title, subtitle, emoji, onLogout }) {
  return (
    <aside className="hidden md:flex flex-col sidebar-width flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>📒</span> HisabKhata
        </div>
        <div className="text-brand-400 text-xs mt-0.5">হিসাবখাতা</div>
      </div>

      {/* Identity badge */}
      <div className="mx-4 mt-4 mb-2 bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div className="min-w-0">
          <div className="text-white text-sm font-bold truncate">{title}</div>
          <div className="text-slate-400 text-xs truncate">{subtitle}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === t.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <span className="text-xl w-7 text-center">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl py-2 text-sm font-semibold transition-all"
        >
          লগআউট
        </button>
      </div>
    </aside>
  )
}
