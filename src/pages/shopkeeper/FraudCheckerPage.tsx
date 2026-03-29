import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taka, getApiError } from "../../utils/helpers";
import { fraudApi } from "@/api";

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: "NONE" | "LOW" | "MEDIUM" | "HIGH" }) {
  const map = {
    NONE: { label: "নিরাপদ", cls: "bg-teal-950 text-teal-400 border-teal-800" },
    LOW: {
      label: "LOW RISK",
      cls: "bg-yellow-950 text-yellow-400 border-yellow-800",
    },
    MEDIUM: {
      label: "MEDIUM RISK",
      cls: "bg-amber-950 text-amber-400 border-amber-800",
    },
    HIGH: { label: "HIGH RISK", cls: "bg-red-950 text-red-400 border-red-800" },
  };
  const { label, cls } = map[level];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ── Report type labels ────────────────────────────────────────────────────────
const REPORT_TYPES = [
  { value: "UNPAID_DEBT", label: "বাকি দেয়নি 💸" },
  { value: "ABSCONDED", label: "পালিয়ে গেছে 🏃" },
  { value: "FAKE_INFO", label: "ভুল তথ্য দিয়েছে 🤥" },
  { value: "MULTIPLE_SHOPS", label: "একাধিক দোকানে বাকি 🏪" },
  { value: "OTHER", label: "অন্যান্য" },
];

const TYPE_LABELS: Record<string, string> = {
  UNPAID_DEBT: "বাকি দেয়নি",
  ABSCONDED: "পালিয়ে গেছে",
  FAKE_INFO: "ভুল তথ্য",
  MULTIPLE_SHOPS: "একাধিক দোকানে বাকি",
  OTHER: "অন্যান্য",
};

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function FraudCheckerPage() {
  const qc = useQueryClient();

  // Search state
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Report modal state
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportAmount, setReportAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportDone, setReportDone] = useState(false);

  // Search mutation
  const searchMut = useMutation({
    mutationFn: () => {
      const isMobile = /^01/.test(query.trim());
      return fraudApi.checkFraud(
        isMobile
          ? { mobile: query.trim() }
          : { shortCode: query.trim().toUpperCase() },
      );
    },
    onMutate: () => {
      setSearching(true);
      setSearchError("");
      setResult(null);
    },
    onSuccess: ({ data }) => {
      setResult(data.data);
      setSearching(false);
    },
    onError: (e) => {
      setSearchError(getApiError(e));
      setSearching(false);
    },
  });

  // Vote mutation
  const voteMut = useMutation({
    mutationFn: ({ reportId, agree }: { reportId: string; agree: boolean }) =>
      fraudApi.vote(reportId, agree),
    onSuccess: () => searchMut.mutate(),
  });

  // Report mutation
  const reportMut = useMutation({
    mutationFn: () =>
      fraudApi.reportFraud({
        customerId: result?.customer?.id,
        type: reportType,
        description: reportDesc || undefined,
        amountOwed: reportAmount ? Number(reportAmount) : undefined,
        isAnonymous,
      }),
    onSuccess: () => {
      setReportDone(true);
      qc.invalidateQueries({ queryKey: ["fraudFeed"] });
      setTimeout(() => {
        setShowReport(false);
        setReportDone(false);
        setReportType("");
        setReportDesc("");
        setReportAmount("");
      }, 2000);
    },
    onError: (e) => setReportError(getApiError(e)),
  });

  const riskLevel = result?.fraud?.riskLevel || "NONE";

  return (
    <div className="p-4 space-y-5 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-xl flex items-center gap-2">
          🚨 Fraud Checker
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          নতুন customer যোগ করার আগে চেক করুন
        </p>
      </div>

      {/* Search box */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && query.trim() && searchMut.mutate()
            }
            placeholder="মোবাইল নম্বর বা Shortcode দিন..."
            className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500 font-baloo"
          />
          <button
            onClick={() => searchMut.mutate()}
            disabled={!query.trim() || searching}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-5 rounded-xl text-sm transition-colors"
          >
            {searching ? "..." : "চেক"}
          </button>
        </div>
        <p className="text-slate-400 dark:text-slate-600 text-xs px-1">
          উদাহরণ: 01XXXXXXXXX বা RHM-4X2
        </p>
        {searchError && (
          <p className="text-red-600 dark:text-red-400 text-xs bg-red-100 dark:bg-red-950/50 rounded-lg px-3 py-2">
            {searchError}
          </p>
        )}
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="animate-slide-up space-y-4">
          {/* Customer info card */}
          <div
            className={`rounded-2xl border p-4 space-y-3
            ${
              riskLevel === "HIGH"
                ? "bg-red-950/20 border-red-800/50"
                : riskLevel === "MEDIUM"
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50"
                  : riskLevel === "LOW"
                    ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800/50"
                    : "bg-teal-50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800/50"
            }`}
          >
            {/* Risk indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {riskLevel === "HIGH"
                    ? "🚨"
                    : riskLevel === "MEDIUM"
                      ? "⚠️"
                      : riskLevel === "LOW"
                        ? "⚠️"
                        : "✅"}
                </span>
                <div>
                  <div
                    className={`font-bold text-sm
                    ${
                      riskLevel === "HIGH"
                        ? "text-red-400"
                        : riskLevel === "MEDIUM"
                          ? "text-amber-400"
                          : riskLevel === "LOW"
                            ? "text-yellow-400"
                            : "text-teal-400"
                    }`}
                  >
                    {riskLevel === "HIGH"
                      ? "বিপদজনক — Fraud Confirmed"
                      : riskLevel === "MEDIUM"
                        ? "সতর্কতা — একাধিক Report আছে"
                        : riskLevel === "LOW"
                          ? "সতর্কতা — Report আছে"
                          : "নিরাপদ — কোনো Fraud Report নেই"}
                  </div>
                  {result.fraud?.totalReports > 0 && (
                    <div className="text-slate-400 text-xs">
                      {result.fraud.confirmedReports} confirmed ·{" "}
                      {result.fraud.pendingReports} pending
                    </div>
                  )}
                </div>
              </div>
              <RiskBadge level={riskLevel} />
            </div>

            {/* Customer details */}
            <div className="bg-gray-100 dark:bg-slate-900/60 rounded-xl p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {result?.customer?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 dark:text-white font-bold text-sm">
                  {result?.customer?.name}
                </div>
                <div className="text-slate-400 text-xs font-mono">
                  {result?.customer?.mobile}
                </div>
              </div>
              {result?.customer?.shortCode && (
                <span className="bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-lg font-mono font-bold">
                  {result?.customer?.shortCode}
                </span>
              )}
            </div>

            {/* Total owed */}
            {result?.fraud?.totalAmountOwed > 0 && (
              <div className="flex items-center justify-between bg-red-100 dark:bg-red-950/40 rounded-xl px-4 py-2.5">
                <span className="text-slate-400 text-sm">মোট বকেয়া</span>
                <span className="text-red-400 font-mono font-bold text-lg">
                  {taka(result?.fraud?.totalAmountOwed)}
                </span>
              </div>
            )}
          </div>

          {/* Fraud reports list */}
          {result.fraud?.reports?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Fraud Reports ({result.fraud.reports.length})
              </div>
              {result.fraud.reports.map((r: any) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.shopEmoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 dark:text-white text-xs font-semibold">
                            {r.shopName}
                          </span>
                          {r.isVerifiedShop && (
                            <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString("bn-BD")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-mono font-bold text-sm">
                        {taka(r.amountOwed)}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                        ${r.status === "CONFIRMED" ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-400"}`}
                      >
                        {r.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[r.type] || r.type}
                    </span>
                    <button
                      onClick={() =>
                        voteMut.mutate({ reportId: r.id, agree: true })
                      }
                      disabled={voteMut.isPending}
                      className="text-[11px] text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                    >
                      👍 আমিও ভুক্তভোগী ({r.agreeVotes})
                    </button>
                  </div>
                  {r.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs border-t border-gray-200 dark:border-slate-700/50 pt-2">
                      {r.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {riskLevel !== "NONE" && (
              <button
                onClick={() => {
                  setShowReport(true);
                  setReportAmount(String(result.fraud?.totalAmountOwed || ""));
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
              >
                🚨 Fraud Report করুন
              </button>
            )}
            {riskLevel === "NONE" && (
              <button
                onClick={() => {
                  setShowReport(true);
                }}
                className="py-2.5 px-4 rounded-xl border border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
              >
                Report করুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* No result state */}
      {result && !result.found && (
        <div className="text-center py-10 animate-fade-in">
          <div className="text-5xl mb-3">🔍</div>
          <div className="text-slate-900 dark:text-white font-bold">
            কোনো Customer পাওয়া যায়নি
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            এই mobile বা shortcode দিয়ে কোনো account নেই
          </div>
        </div>
      )}

      {/* ── Report Modal (bottom sheet) ── */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 bg-black/30 dark:bg-slate-950/70 flex items-end justify-center"
          onClick={() => setShowReport(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-t-2xl w-full max-w-md p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {reportDone ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-slate-900 dark:text-white font-bold text-lg">
                  Report দায়ের হয়েছে
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Community কে ধন্যবাদ জানানো হয়েছে
                </div>
              </div>
            ) : (
              <>
                {/* Handle bar */}
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-700 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4">
                  🚨 Fraud Report করুন
                </h3>

                {/* Customer info */}
                {result?.customer && (
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold">
                      {result.customer.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm">
                        {result.customer.name}
                      </div>
                      <div className="text-slate-400 text-xs font-mono">
                        {result.customer.mobile}
                      </div>
                    </div>
                  </div>
                )}

                {/* Report type */}
                <div className="mb-3">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">
                    Report এর ধরন *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setReportType(t.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${
                            reportType === t.value
                              ? "bg-red-600 text-white border-red-500"
                              : "border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                    বকেয়া পরিমাণ ৳
                  </label>
                  <input
                    type="number"
                    value={reportAmount}
                    onChange={(e) => setReportAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none font-mono"
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                    বিস্তারিত (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    rows={3}
                    placeholder="কী হয়েছিল সংক্ষেপে লিখুন..."
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none resize-none font-baloo"
                  />
                </div>

                {/* Anonymous toggle */}
                <label className="flex items-center justify-between cursor-pointer mb-4">
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      익名ভাবে report করুন
                    </div>
                    <div className="text-slate-500 text-xs">
                      আপনার দোকানের নাম দেখাবে না
                    </div>
                  </div>
                  <div
                    onClick={() => setIsAnonymous((v) => !v)}
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${isAnonymous ? "bg-teal-600" : "bg-gray-200 dark:bg-slate-700"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? "left-7" : "left-1"}`}
                    />
                  </div>
                </label>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 rounded-xl px-3 py-2.5 mb-4">
                  <p className="text-amber-700 dark:text-amber-400 text-xs">
                    ⚠️ মিথ্যা report করলে আপনার account suspend হতে পারে
                  </p>
                </div>

                {reportError && (
                  <p className="text-red-600 dark:text-red-400 text-xs mb-3 bg-red-100 dark:bg-red-950/50 rounded-lg px-3 py-2">
                    {reportError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReport(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => reportMut.mutate()}
                    disabled={!reportType || reportMut.isPending}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                  >
                    {reportMut.isPending ? "দায়ের হচ্ছে..." : "Report করুন"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
