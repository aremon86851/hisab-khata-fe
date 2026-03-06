export default function MobileBottomNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="md:hidden bg-slate-900 border-t border-slate-800 safe-bottom flex-shrink-0">
      <div className="flex">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 transition-all ${activeTab === t.id ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] mt-0.5 font-semibold">{t.label}</span>
            {activeTab === t.id && (
              <span className="w-1 h-1 rounded-full bg-brand-500 mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
