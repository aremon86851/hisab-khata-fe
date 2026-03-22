import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }                           from '../../hooks/useAuth';

const NAV = [
  { path: '/admin/dashboard',     icon: '📊', label: 'Dashboard'    },
  { path: '/admin/shops',         icon: '🏪', label: 'Shops'        },
  { path: '/admin/verifications', icon: '🪪', label: 'Verification' },
  { path: '/admin/customers',     icon: '👥', label: 'Customers'    },
  { path: '/admin/transactions',  icon: '💳', label: 'Transactions' },
];

export default function AdminLayout() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const { logout }   = useAuth();
  const current      = NAV.find(n => pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-slate-950 max-w-screen-xl mx-auto">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-xl font-extrabold text-white flex items-center gap-2">📒 HisabKhata</div>
          <div className="text-red-400 text-xs mt-0.5">🛡️ Admin Panel</div>
        </div>
        <div className="mx-4 mt-4 mb-2 bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <div className="text-white text-sm font-bold">HisabKhata Admin</div>
            <div className="text-slate-400 text-xs">Platform Control</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${pathname.startsWith(n.path)
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <span className="text-xl w-7 text-center">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout}
            className="w-full text-slate-400 hover:text-white border border-slate-700 hover:border-red-700 rounded-xl py-2 text-sm font-semibold transition-all">
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-white font-bold text-sm">Admin Panel</span>
            </div>
            <button onClick={logout} className="text-slate-500 text-xs px-3 py-1.5 rounded-lg border border-slate-700">লগআউট</button>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="text-white font-bold text-lg">{current?.icon} {current?.label}</div>
            <div className="text-slate-400 text-xs">HisabKhata Admin — Platform Control</div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex-shrink-0">
          <div className="flex">
            {NAV.map(n => (
              <button key={n.path} onClick={() => navigate(n.path)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-all
                  ${pathname.startsWith(n.path) ? 'text-teal-400' : 'text-slate-500'}`}>
                <span className="text-lg">{n.icon}</span>
                <span className="text-[9px] mt-0.5 font-semibold truncate max-w-[48px]">{n.label}</span>
                {pathname.startsWith(n.path) && <span className="w-1 h-1 rounded-full bg-teal-500 mt-0.5" />}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
