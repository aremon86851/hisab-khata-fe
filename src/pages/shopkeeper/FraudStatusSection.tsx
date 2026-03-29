import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { taka, relativeTime, getApiError } from "../../utils/helpers";
import { fraudApi } from "@/api";

const TYPE_LABELS: Record<string, string> = {
  UNPAID_DEBT: "বাকি দেয়নি",
  ABSCONDED: "পালিয়ে গেছে",
  FAKE_INFO: "ভুল তথ্য",
  MULTIPLE_SHOPS: "একাধিক দোকানে বাকি",
  OTHER: "অন্যান্য",
};

// ── Dispute Modal ─────────────────────────────────────────────────────────────
function DisputeModal({
  report,
  onClose,
  onDone,
}: {
  report: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const disputeMut = useMutation({
    mutationFn: () => fraudApi.dispute(report.id, reason),
    onSuccess: () => {
      setDone(true);
      setTimeout(onDone, 2000);
    },
    onError: (e) => setError(getApiError(e)),
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 dark:bg-slate-950/70 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-t-2xl w-full max-w-md p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-700 mx-auto mb-4" />

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-slate-900 dark:text-white font-bold">
              Dispute দায়ের হয়েছে
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Admin পর্যালোচনা করবেন
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">
              🛡️ Dispute করুন
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
              এই report টি ভুল মনে করলে কারণ জানান
            </p>

            {/* Report summary */}
            <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-3 mb-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">ধরন:</span>
                <span className="text-slate-900 dark:text-white">
                  {TYPE_LABELS[report.type] || report.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">পরিমাণ:</span>
                <span className="text-red-400 font-mono font-bold">
                  {taka(report.amountOwed)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">দোকান:</span>
                <span className="text-slate-900 dark:text-white">
                  {report.shopName}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                Dispute এর কারণ *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="কেন এই report ভুল? বিস্তারিত লিখুন..."
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none resize-none font-baloo"
              />
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-xs mb-3 bg-red-100 dark:bg-red-950/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
              >
                বাতিল
              </button>
              <button
                onClick={() => disputeMut.mutate()}
                disabled={!reason.trim() || disputeMut.isPending}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
              >
                {disputeMut.isPending ? "দায়ের হচ্ছে..." : "Dispute করুন"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// Customer profile page এ এই component embed করো:
//
// import FraudStatusSection from './FraudStatusSection';
// <FraudStatusSection reports={profile?.fraudReports || []} />
// ═══════════════════════════════════════════════════════
export default function FraudStatusSection({ reports }: { reports: any[] }) {
  const [disputeFor, setDisputeFor] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeReports = reports.filter(
    (r) => r.status === "CONFIRMED" || r.status === "PENDING",
  );

  if (activeReports.length === 0) {
    return (
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl">✅</span>
        <div>
          <div className="text-teal-600 dark:text-teal-400 font-bold text-sm">
            কোনো Fraud Report নেই
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
            আপনার reputation পরিষ্কার আছে
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Alert header */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-600 dark:text-red-400 font-bold text-sm">
              আপনার বিরুদ্ধে {activeReports.length}টি report আছে
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              ভুল হলে Dispute করুন, Admin পর্যালোচনা করবেন
            </div>
          </div>
        </div>

        {/* Each report */}
        {activeReports.map((r: any) => (
          <div
            key={`${r.id}-${refreshKey}`}
            className="bg-white dark:bg-slate-800/60 border border-red-200 dark:border-red-800/30 rounded-xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold
                  ${
                    r.status === "CONFIRMED"
                      ? "bg-red-950 text-red-400"
                      : r.status === "DISPUTED"
                        ? "bg-blue-950 text-blue-400"
                        : "bg-amber-950 text-amber-400"
                  }`}
                >
                  {r.status === "CONFIRMED"
                    ? "Confirmed"
                    : r.status === "DISPUTED"
                      ? "Disputed"
                      : "Pending"}
                </span>
                <span className="bg-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                  {TYPE_LABELS[r.type] || r.type}
                </span>
              </div>
              <div className="text-red-400 font-mono font-bold text-sm">
                {taka(r.amountOwed)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{r.shopEmoji || "🏪"}</span>
                <span className="text-slate-400 text-xs">
                  {r.reportedBy?.name}
                </span>
                {r.isVerifiedShop && (
                  <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-slate-400 dark:text-slate-600 text-[11px]">
                {relativeTime(r.createdAt)}
              </span>
            </div>

            {r.description && (
              <p className="text-slate-500 dark:text-slate-400 text-xs border-l-2 border-gray-300 dark:border-slate-600 pl-3">
                {r.description}
              </p>
            )}

            {/* Dispute button — only if not already disputed */}
            {r.status !== "DISPUTED" && r.status !== "RESOLVED" && (
              <button
                onClick={() => setDisputeFor(r)}
                className="w-full py-2 rounded-lg border border-teal-600 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs font-semibold transition-colors"
              >
                🛡️ Dispute করুন — এটি ভুল
              </button>
            )}
            {r.status === "DISPUTED" && (
              <div className="text-center text-blue-600 dark:text-blue-400 text-xs py-1 font-semibold">
                ⏳ Dispute পর্যালোচনা হচ্ছে...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dispute Modal */}
      {disputeFor && (
        <DisputeModal
          report={disputeFor}
          onClose={() => setDisputeFor(null)}
          onDone={() => {
            setDisputeFor(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
