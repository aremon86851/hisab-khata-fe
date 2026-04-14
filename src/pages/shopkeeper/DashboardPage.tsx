import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerApi, transactionApi } from "../../api";
import { PageLoader } from "../../components/shared";
import { taka } from "../../utils/helpers";
import {
  Bell,
  Settings,
  MapPin,
  ShieldAlert,
  Calculator,
  UserPlus,
  BarChart2,
  MessageSquare,
  Plus,
  Home,
  Users,
  BookOpen,
  User,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { shop } = useOutletContext<{ shop: any }>();

  const { data: cr, isLoading } = useQuery({
    queryKey: ["shopCustomers"],
    queryFn: () => customerApi.getCustomers({ limit: 100 }),
  });
  const { data: sr }: any = useQuery({
    queryKey: ["monthlySummary"],
    queryFn: transactionApi.getMonthlySummary as any,
  });

  const customers = (cr?.data as any)?.data || [];
  const s = (sr?.data as any)?.data;
  const totalBaki = customers.reduce(
    (acc: number, c: any) => acc + c.balance,
    0,
  );
  const totalJoma = s?.totalPayment || 0;
  const pending = customers.filter((c: any) => c.balance > 0).length;
  const isVerified = shop?.verification?.status === "VERIFIED";

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 pb-24 font-sans">
      <div className="px-4 pt-4 space-y-4">
        {/* ── Verification Banner ── */}
        {!isVerified && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-200 text-sm leading-tight">
                  ভেরিফিকেশন পেন্ডিং
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                  সব ফিচার আনলক করতে কেওয়াইসি সম্পন্ন করুন
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/shopkeeper/verification")}
              className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap flex-shrink-0"
            >
              এখনই করুন
            </button>
          </div>
        )}

        {/* ── Total Dues Card ── */}
        <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
          {/* bg icon */}
          <div className="absolute right-4 top-4 opacity-20">
            <div className="w-16 h-16 rounded-xl border-4 border-orange-400 flex items-center justify-center">
              <div className="w-8 h-8 rounded border-4 border-orange-400" />
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-1">মোট বাকি (Total Dues)</p>
          <h2 className="text-orange-400 text-4xl font-bold mb-4">
            {taka(totalBaki)}
          </h2>

          <div className="border-t border-gray-700 pt-4 flex items-center gap-6">
            <div>
              <p className="text-gray-500 text-xs mb-1">পাবেন</p>
              <p className="text-green-400 font-bold text-lg">
                {taka(totalBaki)}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div>
              <p className="text-gray-500 text-xs mb-1">দেবেন</p>
              <p className="text-orange-400 font-bold text-lg">
                {taka(s?.outstanding || 0)}
              </p>
            </div>
            <button
              onClick={() => navigate("/shopkeeper/transactions")}
              className="ml-auto bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: <Calculator className="w-6 h-6" />,
              label: "হিসাব",
              path: "/shopkeeper/calculator",
            },
            {
              icon: <UserPlus className="w-6 h-6" />,
              label: "কাস্টমার",
              path: "/shopkeeper/customers",
            },
            {
              icon: <BarChart2 className="w-6 h-6" />,
              label: "রিপোর্ট",
              path: "/shopkeeper/reports",
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              label: "রিমাইন্ডার",
              path: "/shopkeeper/reminders",
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-500 dark:text-orange-400">
                {a.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                {a.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Recent Transactions ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 dark:text-white font-bold text-lg">
              সাম্প্রতিক লেনদেন
            </h2>
            <button
              onClick={() => navigate("/shopkeeper/customers")}
              className="text-orange-500 text-sm font-semibold"
            >
              সব দেখুন
            </button>
          </div>

          {customers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400 dark:text-slate-500 text-sm">
                কোনো লেনদেন নেই
              </p>
              <button
                onClick={() => navigate("/shopkeeper/customers")}
                className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                + Customer যোগ করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 10).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/shopkeeper/customer/${c.id}`)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg flex-shrink-0 overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      c.name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-base truncate">
                      {c.name}
                    </p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">
                      {c.lastTransactAt
                        ? new Date(c.lastTransactAt).toLocaleDateString(
                            "bn-BD",
                            { day: "numeric", month: "short" },
                          )
                        : "কোনো লেনদেন নেই"}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-bold text-base ${c.balance > 0 ? "text-orange-500" : "text-green-500"}`}
                    >
                      {taka(Math.abs(c.balance))}{" "}
                      {c.balance > 0 ? "বাকি" : "জমা"}
                    </p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">
                      লেনদেন: {c.txnCount || 0}টি
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => navigate("/shopkeeper/calculator")}
        className="fixed bottom-20 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-200 flex flex-col items-center justify-center gap-0.5 z-40"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[9px] font-bold">হিসাব</span>
      </button>
    </div>
  );
}
