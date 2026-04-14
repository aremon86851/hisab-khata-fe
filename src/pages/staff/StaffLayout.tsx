import { useState, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../../components/shared";
import { Menu, X } from "lucide-react";

type NavItem = { path: string; icon: string; label: string; perm?: string | string[] };

const ALL_NAV: NavItem[] = [
  { path: "/staff/dashboard",  icon: "🏠", label: "ড্যাশবোর্ড" },
  { path: "/staff/customers",  icon: "👥", label: "কাষ্টমার",  perm: ["canAddBaki", "canAddPayment", "canAddCustomer"] },
  { path: "/staff/calculator", icon: "🧮", label: "ক্যালকুলেটর", perm: ["canAddBaki", "canAddPayment"] },
  { path: "/staff/products",   icon: "📦", label: "পণ্য",      perm: "canManageProduct" },
  { path: "/staff/reminders",  icon: "💬", label: "রিমাইন্ডার", perm: "canSendReminder" },
  { path: "/staff/reports",    icon: "📊", label: "রিপোর্ট",    perm: "canViewReport" },
];

export default function StaffLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: meRes, isLoading } = useQuery({
    queryKey: ["staffMe"],
    queryFn: staffApi.getMe,
  });

  if (isLoading)
    return (
      <div className="h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );

  const profile = (meRes?.data as any)?.data;
  const shop = profile?.shop;
  const shopName = shop?.name || "Shop";
  const shopEmoji = shop?.emoji || "🏪";
  const roleLabel = profile?.role === "MANAGER" ? "ম্যানেজার" : "স্টাফ";

  const perms: Record<string, boolean> = {
    canAddBaki: !!profile?.canAddBaki,
    canAddPayment: !!profile?.canAddPayment,
    canAddCustomer: !!profile?.canAddCustomer,
    canViewReport: !!profile?.canViewReport,
    canManageProduct: !!profile?.canManageProduct,
    canSendReminder: !!profile?.canSendReminder,
  };

  // Show nav items the staff has permission for (dashboard always visible)
  const hasPerm = (p: string | string[] | undefined) => {
    if (!p) return true;
    if (Array.isArray(p)) return p.some((k) => perms[k]);
    return !!perms[p];
  };

  const navItems = ALL_NAV.filter((n) => hasPerm(n.perm));

  // Bottom nav = first 4, rest go to drawer
  const bottomNav = navItems.slice(0, 4);
  const drawerNav = navItems.slice(4);

  const current = navItems.find((n) => pathname.startsWith(n.path) && n.path !== "/staff/dashboard") || navItems[0];

  const goTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 max-w-screen-xl mx-auto">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            📒 HisabKhata
          </div>
          <div className="text-violet-500 dark:text-violet-400 text-xs mt-0.5">
            Staff Panel
          </div>
        </div>
        <div className="mx-4 mt-4 mb-2 bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">{shopEmoji}</span>
          <div className="min-w-0">
            <div className="text-slate-900 dark:text-white text-sm font-bold truncate">
              {shopName}
            </div>
            <div className="text-violet-500 dark:text-violet-400 text-xs truncate">
              {profile?.name} · {roleLabel}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((n) => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  pathname.startsWith(n.path)
                    ? "bg-violet-600 text-white shadow-lg"
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

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">📒</span>
              <div className="min-w-0">
                <div className="text-slate-900 dark:text-white font-bold text-sm truncate">
                  {shopName}
                </div>
                <div className="text-violet-500 dark:text-violet-400 text-xs truncate">
                  {profile?.name} · {roleLabel}
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={logout}
                className="flex-shrink-0 text-slate-500 dark:text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700"
              >
                লগআউট
              </button>
              {drawerNav.length > 0 && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Menu size={22} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <div className="text-slate-900 dark:text-white font-bold text-lg">
              {current?.icon} {current?.label}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {shopName} — Staff Panel
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ shop, permissions: perms }} />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex">
            {bottomNav.map((n) => (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-all
                  ${pathname.startsWith(n.path) ? "text-violet-500" : "text-slate-500 dark:text-slate-500"}`}
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
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 dark:bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800
          shadow-2xl transition-transform duration-300 ease-in-out md:hidden
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{shopEmoji}</span>
            <div>
              <div className="text-slate-900 dark:text-white text-sm font-bold truncate max-w-[160px]">
                {shopName}
              </div>
              <div className="text-violet-500 dark:text-violet-400 text-xs">
                Staff Panel
              </div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-3 py-4 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold px-3 mb-2">
            আরও সুবিধা
          </p>
          {drawerNav.map((n) => (
            <button
              key={n.path}
              onClick={() => goTo(n.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${
                  pathname.startsWith(n.path)
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:bg-gray-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
            >
              <span className="text-xl w-7 text-center">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
