import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { customerApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../../components/shared";

const NAV = [
  { path: "/customer/home", icon: "🏠", label: "Home" },
  { path: "/customer/shops", icon: "🏪", label: "আমার দোকান" },
  { path: "/customer/profile", icon: "👤", label: "Profile" },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: customerApi.getMyProfile,
  });

  if (isLoading)
    return (
      <div className="h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );

  const profile = (data?.data as any)?.data;
  const current = NAV.find((n) => pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 max-w-screen-xl mx-auto">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            📒 HisabKhata
          </div>
          <div className="text-teal-600 dark:text-teal-400 text-xs mt-0.5">
            হিসাবখাতা
          </div>
        </div>
        <div className="mx-4 mt-4 mb-2 bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">👤</span>
          <div className="min-w-0">
            <div className="text-slate-900 dark:text-white text-sm font-bold truncate">
              {profile?.name || "Customer"}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs truncate font-mono">
              {profile?.mobile || ""}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map((n) => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  pathname.startsWith(n.path)
                    ? "bg-teal-600 text-white shadow-lg"
                    : "text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <span className="text-xl w-7 text-center">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-gray-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-700 rounded-xl py-2 text-sm font-semibold transition-all"
          >
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">📒</span>
              <div className="min-w-0">
                <div className="text-slate-900 dark:text-white font-bold text-sm truncate">
                  {profile?.name || "Customer"}
                </div>
                <div className="text-teal-600 dark:text-teal-400 text-xs font-mono truncate">
                  {profile?.mobile || ""}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-3 flex-shrink-0 text-slate-500 dark:text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700"
            >
              লগআউট
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <div className="text-slate-900 dark:text-white font-bold text-lg">
              {current?.icon} {current?.label}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {profile?.name} — Customer Dashboard
            </div>
          </div>
        </div>

        {/* Page content — profile passed via outlet context */}
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ profile }} />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex">
            {NAV.map((n) => (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-all
                  ${pathname.startsWith(n.path) ? "text-teal-500" : "text-slate-500 dark:text-slate-500"}`}
              >
                <span className="text-xl">{n.icon}</span>
                <span className="text-[10px] mt-0.5 font-semibold">
                  {n.label}
                </span>
                {pathname.startsWith(n.path) && (
                  <span className="w-1 h-1 rounded-full bg-teal-500 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
