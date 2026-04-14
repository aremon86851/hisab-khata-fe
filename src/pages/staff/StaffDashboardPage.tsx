import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { staffApi } from "../../api";
import { PageLoader } from "../../components/shared";

const TILES = [
  {
    key: "canAddBaki",
    icon: "📝",
    label: "বাকি যোগ",
    sub: "কাস্টমারের বাকি যোগ করুন",
    path: "/staff/customers",
    color: "from-teal-600 to-teal-800",
  },
  {
    key: "canAddPayment",
    icon: "💳",
    label: "পেমেন্ট নিন",
    sub: "কাস্টমারের পেমেন্ট নিন",
    path: "/staff/customers",
    color: "from-green-600 to-green-800",
  },
  {
    key: "canAddCustomer",
    icon: "👤",
    label: "কাস্টমার যোগ",
    sub: "নতুন কাস্টমার যোগ করুন",
    path: "/staff/customers",
    color: "from-blue-600 to-blue-800",
  },
  {
    key: "canViewReport",
    icon: "📊",
    label: "রিপোর্ট",
    sub: "বিক্রয় ও লেনদেন রিপোর্ট",
    path: "/staff/reports",
    color: "from-violet-600 to-violet-800",
  },
  {
    key: "canManageProduct",
    icon: "📦",
    label: "পণ্য ব্যবস্থাপনা",
    sub: "পণ্য যোগ ও আপডেট করুন",
    path: "/staff/products",
    color: "from-amber-600 to-amber-800",
  },
  {
    key: "canSendReminder",
    icon: "💬",
    label: "রিমাইন্ডার",
    sub: "কাস্টমারকে মনে করিয়ে দিন",
    path: "/staff/reminders",
    color: "from-pink-600 to-pink-800",
  },
];

export default function StaffDashboardPage() {
  const navigate = useNavigate();

  const { data: meRes, isLoading } = useQuery({
    queryKey: ["staffMe"],
    queryFn: staffApi.getMe,
  });

  if (isLoading) return <PageLoader />;

  const profile = (meRes?.data as any)?.data;
  const shop = profile?.shop;

  // Permissions are flat on the staff profile object
  const perms: Record<string, boolean> = {
    canAddBaki: !!profile?.canAddBaki,
    canAddPayment: !!profile?.canAddPayment,
    canAddCustomer: !!profile?.canAddCustomer,
    canViewReport: !!profile?.canViewReport,
    canManageProduct: !!profile?.canManageProduct,
    canSendReminder: !!profile?.canSendReminder,
  };

  const availableTiles = TILES.filter((t) => perms[t.key]);

  const roleLabel =
    profile?.role === "MANAGER" ? "ম্যানেজার" : "স্টাফ";

  return (
    <div className="p-4 space-y-5 animate-fade-in">
      {/* Profile strip */}
      <div className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {profile?.name?.charAt(0) ?? "S"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-900 dark:text-white font-bold text-base truncate">
            {profile?.name ?? "Staff"}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-400 font-semibold">
              {roleLabel}
            </span>
            {shop && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {shop.emoji} {shop.name}
              </span>
            )}
          </div>
          {profile?.mobile && (
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {profile.mobile}
            </div>
          )}
        </div>
      </div>

      {/* Action tiles */}
      {availableTiles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔒</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            আপনার কোনো অনুমতি নেই।
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            দোকানদারের সাথে যোগাযোগ করুন।
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            আপনার কাজ
          </p>
          <div className="grid grid-cols-2 gap-3">
            {availableTiles.map((tile) => (
              <button
                key={tile.key}
                onClick={() => navigate(tile.path)}
                className={`bg-gradient-to-br ${tile.color} rounded-2xl p-5 text-left text-white transition-all active:scale-95 hover:brightness-110 shadow-md`}
              >
                <div className="text-3xl mb-2">{tile.icon}</div>
                <div className="font-bold text-sm leading-snug">{tile.label}</div>
                <div className="text-[11px] text-white/70 mt-0.5">{tile.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
