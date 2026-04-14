import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../../api";
import { taka, relativeTime, banglaMonth } from "../../utils/helpers";

const TABS = [
  { key: "outstanding", label: "বকেয়া" },
  { key: "ledger",      label: "খাতা" },
  { key: "monthly",     label: "মাসিক" },
  { key: "debtors",     label: "শীর্ষ ঋণী" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("outstanding");

  // ── 7a Outstanding ──────────────────────────────────────────────────────────
  const { data: outData, isLoading: outLoading } = useQuery({
    queryKey: ["reports", "outstanding"],
    queryFn: () => reportsApi.getOutstanding({ limit: 50 }),
    enabled: activeTab === "outstanding",
  });
  const outRes = (outData?.data as any)?.data;
  const outCustomers: any[] = outRes?.customers || [];
  const outSummary = outRes?.summary;

  // ── 7b Ledger ───────────────────────────────────────────────────────────────
  const [ledgerCustomerId, setLedgerCustomerId] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["reports", "ledger", ledgerCustomerId, fromDate, toDate],
    queryFn: () =>
      reportsApi.getLedger(ledgerCustomerId, {
        from: fromDate || undefined,
        to:   toDate   || undefined,
      }),
    enabled: !!ledgerCustomerId,
  });
  const ledger = (ledgerData?.data as any)?.data;

  // ── 7c Monthly ──────────────────────────────────────────────────────────────
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: monthData, isLoading: monthLoading } = useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: () => reportsApi.getMonthly(year, month),
    enabled: activeTab === "monthly",
  });
  const monthly = (monthData?.data as any)?.data;

  // ── 7d Top Debtors ──────────────────────────────────────────────────────────
  const { data: debtorsData, isLoading: debtorsLoading } = useQuery({
    queryKey: ["reports", "topDebtors"],
    queryFn: () => reportsApi.getTopDebtors(10),
    enabled: activeTab === "debtors",
  });
  const debtors: any[] = (debtorsData?.data as any)?.data || [];

  // Helper: open ledger for a customer
  const openLedger = (cid: string, name: string) => {
    setLedgerCustomerId(cid);
    setLedgerName(name);
    setActiveTab("ledger");
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">📊 রিপোর্ট</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeTab === t.key
                ? "bg-teal-600 text-white border-teal-500"
                : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* ────────────────────────── 7a Outstanding ── */}
        {activeTab === "outstanding" && (
          <>
            {outLoading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <>
                {outSummary && (
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard
                      label="মোট বকেয়া"
                      value={taka(outSummary.totalOutstanding)}
                      color="red"
                    />
                    <SummaryCard
                      label="Customer সংখ্যা"
                      value={outSummary.customerCount}
                      color="amber"
                    />
                  </div>
                )}
                {outCustomers.length === 0 ? (
                  <EmptyMsg>কোনো বকেয়া নেই 🎉</EmptyMsg>
                ) : (
                  <div className="space-y-2">
                    {outCustomers.map((c: any) => (
                      <button
                        key={c.customerId}
                        onClick={() => openLedger(c.customerId, c.name)}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {c.image ? (
                            <img src={c.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            c.name?.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{c.mobile}</p>
                          {c.lastTransactAt && (
                            <p className="text-xs text-slate-400">{relativeTime(c.lastTransactAt)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-red-500">{taka(c.balance)}</p>
                          {c.isSettled && (
                            <span className="text-[10px] text-teal-500 font-bold">✓ Settled</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ────────────────────────── 7b Ledger ── */}
        {activeTab === "ledger" && (
          <>
            {/* Customer selector */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Customer নির্বাচন করুন
              </p>
              {ledgerCustomerId ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{ledgerName}</span>
                  <button
                    onClick={() => { setLedgerCustomerId(""); setLedgerName(""); }}
                    className="text-xs text-slate-400 underline"
                  >
                    পরিবর্তন
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  বকেয়া ট্যাব থেকে Customer বেছে নিন।
                </p>
              )}
              {/* Date range */}
              {ledgerCustomerId && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">শুরু</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">শেষ</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {!ledgerCustomerId ? null : ledgerLoading ? (
              <LoadingSkeleton rows={5} />
            ) : !ledger ? null : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard label="বর্তমান বাকি" value={taka(ledger.currentBalance)} color="red" />
                  <SummaryCard label="লেনদেন সংখ্যা" value={ledger.transactionCount} color="teal" />
                </div>

                {/* Settled badge */}
                {ledger.isSettled && (
                  <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl px-4 py-2 text-sm text-teal-600 dark:text-teal-400 font-semibold">
                    ✓ হিসাব নিষ্পত্তি হয়েছে · {ledger.settledAt ? new Date(ledger.settledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </div>
                )}

                {/* Passbook table */}
                {ledger.transactions?.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs font-bold text-slate-400 border-b border-gray-100 dark:border-slate-700">
                      <span className="col-span-2">বিবরণ</span>
                      <span className="text-right">পরিমাণ</span>
                      <span className="text-right">ব্যালেন্স</span>
                    </div>
                    {ledger.transactions.map((t: any) => (
                      <div
                        key={t.id}
                        className="grid grid-cols-4 gap-2 px-3 py-2.5 text-xs border-b last:border-0 border-gray-50 dark:border-slate-700"
                      >
                        <div className="col-span-2">
                          <p className={`font-semibold ${t.type === "BAKI" ? "text-red-500" : "text-green-500"}`}>
                            {t.type === "BAKI" ? "বাকি" : "পরিশোধ"}
                          </p>
                          {t.note && <p className="text-slate-400 truncate">{t.note}</p>}
                          <p className="text-slate-400">{relativeTime(t.createdAt)}</p>
                        </div>
                        <p className={`text-right font-mono font-bold ${t.type === "BAKI" ? "text-red-500" : "text-green-500"}`}>
                          {t.type === "BAKI" ? "+" : "-"}{taka(t.amount)}
                        </p>
                        <p className="text-right font-mono text-slate-700 dark:text-slate-300">
                          {taka(t.runningBalance)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ────────────────────────── 7c Monthly P&L ── */}
        {activeTab === "monthly" && (
          <>
            {/* Month/year picker */}
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {banglaMonth(m)}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {monthLoading ? (
              <LoadingSkeleton rows={3} />
            ) : monthly ? (
              <>
                {/* Income / Expense / Profit */}
                <div className="grid grid-cols-3 gap-3">
                  <SummaryCard label="আয়" value={taka(monthly.income?.total ?? 0)} color="green" />
                  <SummaryCard label="ব্যয়" value={taka(monthly.expense?.total ?? 0)} color="red" />
                  <SummaryCard
                    label={monthly.netProfit >= 0 ? "মুনাফা" : "ক্ষতি"}
                    value={taka(Math.abs(monthly.netProfit ?? 0))}
                    color={monthly.netProfit >= 0 ? "teal" : "amber"}
                  />
                </div>

                {/* Baki section */}
                {monthly.baki && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">বাকির হিসাব</p>
                    {[
                      { label: "বাকি দেওয়া হয়েছে",     value: taka(monthly.baki.given),          color: "text-red-500"  },
                      { label: "বাকি সংগ্রহ হয়েছে",    value: taka(monthly.baki.collected),      color: "text-green-500"},
                      { label: "এখনো বাকি (নেট)",     value: taka(monthly.baki.netOutstanding), color: "text-amber-500"},
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                        <span className={`font-mono font-bold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category breakdown */}
                {(monthly.income?.byCategory || monthly.expense?.byCategory) && (
                  <div className="grid grid-cols-2 gap-3">
                    {monthly.income?.byCategory && (
                      <CategoryCard title="আয়ের ধরন" data={monthly.income.byCategory} color="green" />
                    )}
                    {monthly.expense?.byCategory && (
                      <CategoryCard title="ব্যয়ের ধরন" data={monthly.expense.byCategory} color="red" />
                    )}
                  </div>
                )}
              </>
            ) : (
              <EmptyMsg>এই মাসে কোনো ডেটা নেই।</EmptyMsg>
            )}
          </>
        )}

        {/* ────────────────────────── 7d Top Debtors ── */}
        {activeTab === "debtors" && (
          <>
            {debtorsLoading ? (
              <LoadingSkeleton rows={5} />
            ) : debtors.length === 0 ? (
              <EmptyMsg>কোনো ডেটা নেই।</EmptyMsg>
            ) : (
              <div className="space-y-2">
                {debtors.map((d: any, i: number) => (
                  <button
                    key={d.customerId}
                    onClick={() => openLedger(d.customerId, d.name)}
                    className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 flex items-center justify-center text-xl flex-shrink-0">
                      {i < 3 ? RANK_MEDALS[i] : <span className="text-sm font-bold text-slate-400">#{d.rank}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {d.image ? (
                        <img src={d.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        d.name?.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{d.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{d.mobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-red-500 text-base">{taka(d.balance)}</p>
                      {d.lastTransactAt && (
                        <p className="text-xs text-slate-400">{relativeTime(d.lastTransactAt)}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    teal:  "text-teal-600  dark:text-teal-400",
    green: "text-green-600 dark:text-green-400",
    red:   "text-red-500   dark:text-red-400",
    amber: "text-amber-500 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
      <p className={`font-mono font-extrabold text-xl ${colors[color] ?? ""}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function CategoryCard({ title, data, color }: { title: string; data: Record<string, number>; color: string }) {
  const cls = color === "green" ? "text-green-500" : "text-red-500";
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 space-y-1.5">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</p>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 truncate">{k}</span>
          <span className={`font-mono font-bold ${cls}`}>{taka(v)}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">{children}</div>
  );
}
