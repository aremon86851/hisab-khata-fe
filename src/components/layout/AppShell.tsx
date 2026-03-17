import { useAuth } from '../../hooks/useAuth';

type TTab = { id: string; icon: string; label: string };

export default function AppShell({ tabs, activeTab, onTabChange, title, subtitle, emoji, children }: {
  tabs: TTab[]; activeTab: string; onTabChange: (id:string)=>void;
  title: string; subtitle: string; emoji: string; children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const current = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex h-screen bg-slate-950 max-w-screen-xl mx-auto">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-xl font-extrabold text-white flex items-center gap-2">📒 HisabKhata</div>
          <div className="text-teal-400 text-xs mt-0.5">হিসাবখাতা</div>
        </div>
        <div className="mx-4 mt-4 mb-2 bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div className="min-w-0">
            <div className="text-white text-sm font-bold truncate">{title}</div>
            <div className="text-slate-400 text-xs truncate">{subtitle}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${activeTab===t.id?'bg-teal-600 text-white shadow-lg':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <span className="text-xl w-7 text-center">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full text-slate-400 hover:text-white border border-slate-700 hover:border-red-700 rounded-xl py-2 text-sm font-semibold transition-all">
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">📒</span>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm truncate">{title}</div>
                <div className="text-teal-400 text-xs truncate">{subtitle}</div>
              </div>
            </div>
            <button onClick={logout} className="ml-3 flex-shrink-0 text-slate-500 text-xs px-3 py-1.5 rounded-lg border border-slate-700">লগআউট</button>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="text-white font-bold text-lg">{current?.icon} {current?.label}</div>
            <div className="text-slate-400 text-xs">{title} — {subtitle}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex-shrink-0">
          <div className="flex overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => onTabChange(t.id)}
                className={`flex-1 min-w-[56px] flex flex-col items-center py-2.5 transition-all
                  ${activeTab===t.id?'text-teal-400':'text-slate-500 hover:text-slate-300'}`}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-[10px] mt-0.5 font-semibold truncate max-w-[52px]">{t.label}</span>
                {activeTab===t.id && <span className="w-1 h-1 rounded-full bg-teal-500 mt-0.5"/>}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
