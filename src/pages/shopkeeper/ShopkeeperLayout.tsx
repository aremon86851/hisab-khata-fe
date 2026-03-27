import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { shopApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../../components/shared";
import { Menu, X } from "lucide-react";

// ── Bottom nav (always visible on mobile) ─────────────────────────────────────
const BOTTOM_NAV = [
  { path: "/shopkeeper/dashboard", icon: "🏚️", label: "হোম" },
  { path: "/shopkeeper/calculator", icon: "🧮", label: "হিসাব" },
  { path: "/shopkeeper/customers", icon: "👥", label: "কাষ্টমার" },
  { path: "/shopkeeper/settings", icon: "⚙️", label: "সেটিংস" },
];

// ── Drawer nav (extra items shown in hamburger drawer) ────────────────────────
const DRAWER_NAV = [
  { path: "/shopkeeper/products", icon: "📦", label: "Products" },
  { path: "/shopkeeper/reminders", icon: "💬", label: "Reminder" },
  { path: "/shopkeeper/income", icon: "💰", label: "আয়-ব্যয়" },
  { path: "/shopkeeper/staff", icon: "👷", label: "Staff" },
  { path: "/shopkeeper/notifications", icon: "🔔", label: "Notification" },
];

// ── Sidebar nav (desktop — all items) ────────────────────────────────────────
const SIDEBAR_NAV = [...BOTTOM_NAV, ...DRAWER_NAV];

export default function ShopkeeperLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: shopRes, isLoading } = useQuery({
    queryKey: ["myShop"],
    queryFn: shopApi.getMyShop,
  });

  if (isLoading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );

  const shop = (shopRes?.data as any)?.data;
  localStorage.setItem("ssc", shop.shortCode);
  const title = shop?.name || "My Shop";
  const subtitle = shop?.verification?.district || "HisabKhata";
  const emoji = shop?.emoji || "🏪";
  const current = SIDEBAR_NAV.find((n) => pathname.startsWith(n.path));

  const goTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 max-w-screen-xl mx-auto">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-xl font-extrabold text-white flex items-center gap-2">
            📒 HisabKhata
          </div>
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
          {SIDEBAR_NAV.map((n) => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  pathname.startsWith(n.path)
                    ? "bg-teal-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <span className="text-xl w-7 text-center">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full text-slate-400 hover:text-white border border-slate-700 hover:border-red-700 rounded-xl py-2 text-sm font-semibold transition-all"
          >
            লগআউট
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">📒</span>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm truncate">
                  {title}
                </div>
                <div className="text-teal-400 text-xs truncate">{subtitle}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={logout}
                className="ml-3 flex-shrink-0 text-slate-500 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
              >
                লগআউট
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="text-white font-bold text-lg">
              {current?.icon} {current?.label}
            </div>
            <div className="text-slate-400 text-xs">
              {title} — {subtitle}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ shop }} />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex-shrink-0">
          <div className="flex">
            {BOTTOM_NAV.map((n) => (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-all
                  ${pathname.startsWith(n.path) ? "text-teal-400" : "text-slate-500"}`}
              >
                <span className="text-xl">{n.icon}</span>
                <span className="text-[10px] mt-0.5 font-semibold">
                  {n.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Right Drawer (mobile only) ── */}

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-slate-900 border-l border-slate-800
          shadow-2xl transition-transform duration-300 ease-in-out md:hidden
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <div className="text-white text-sm font-bold truncate max-w-[160px]">
                {title}
              </div>
              <div className="text-slate-400 text-xs">{subtitle}</div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav items */}
        <div className="px-3 py-4 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold px-3 mb-2">
            আরও সুবিধা
          </p>
          {DRAWER_NAV.map((n) => (
            <button
              key={n.path}
              onClick={() => goTo(n.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${
                  pathname.startsWith(n.path)
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <span className="text-xl w-7 text-center">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Divider + logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              setDrawerOpen(false);
            }}
            className="w-full py-2.5 rounded-xl border border-red-800 text-red-400 font-semibold text-sm hover:bg-red-950/30 transition-colors"
          >
            লগআউট
          </button>
        </div>
      </div>
    </div>
  );
}
