import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taka, relativeTime } from "../../utils/helpers";
import { PageLoader, EmptyState } from "../../components/shared";
import { fraudApi } from "@/api";

const TYPE_LABELS: Record<string, string> = {
  UNPAID_DEBT: "বাকি দেয়নি",
  ABSCONDED: "পালিয়ে গেছে",
  FAKE_INFO: "ভুল তথ্য",
  MULTIPLE_SHOPS: "একাধিক দোকানে বাকি",
  OTHER: "অন্যান্য",
};

const RISK_CONFIG: Record<string, { label: string; cls: string; dot: string }> =
  {
    HIGH: {
      label: "HIGH",
      cls: "bg-red-950 text-red-400 border-red-800",
      dot: "bg-red-500",
    },
    MEDIUM: {
      label: "MEDIUM",
      cls: "bg-amber-950 text-amber-400 border-amber-800",
      dot: "bg-amber-500",
    },
    LOW: {
      label: "LOW",
      cls: "bg-yellow-950 text-yellow-400 border-yellow-800",
      dot: "bg-yellow-500",
    },
    NONE: {
      label: "NONE",
      cls: "bg-teal-950 text-teal-400 border-teal-800",
      dot: "bg-teal-500",
    },
  };

export default function FraudFeedPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">(
    "ALL",
  );

  const { data, isLoading } = useQuery({
    queryKey: ["fraudFeed"],
    queryFn: () => fraudApi.getFeed({ limit: 30 }),
    refetchInterval: 60000, // refresh every minute
  });

  const voteMut = useMutation({
    mutationFn: ({ reportId, agree }: { reportId: string; agree: boolean }) =>
      fraudApi.vote(reportId, agree),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fraudFeed"] }),
  });

  const allReports: any[] = (data?.data as any)?.data || [];

  const filtered =
    filter === "ALL"
      ? allReports
      : allReports.filter((r: any) => {
          const agreeVotes = r.agreeVotes || 0;
          const level =
            r.status === "CONFIRMED" || agreeVotes >= 3
              ? "HIGH"
              : agreeVotes >= 1
                ? "MEDIUM"
                : "LOW";
          return level === filter;
        });

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-xl flex items-center gap-2">
          ⚠️ Fraud Alert Board
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Community থেকে সংগৃহীত fraud reports · {allReports.length} টি সক্রিয়
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
          Verified দোকানের রিপোর্টগুলো বেশি বিশ্বাসযোগ্য
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${
                filter === f
                  ? f === "HIGH"
                    ? "bg-red-600 text-white border-red-500"
                    : f === "MEDIUM"
                      ? "bg-amber-600 text-white border-amber-500"
                      : f === "LOW"
                        ? "bg-yellow-600 text-white border-yellow-500"
                        : "bg-teal-600 text-white border-teal-500"
                  : "border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
          >
            {f === "ALL"
              ? "সব"
              : f === "HIGH"
                ? "🔴 HIGH"
                : f === "MEDIUM"
                  ? "🟡 MEDIUM"
                  : "🟢 LOW"}
          </button>
        ))}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="কোনো fraud report নেই"
          sub="সবাই বিশ্বস্ত! Community পরিষ্কার আছে।"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => {
            const agreeVotes = r.agreeVotes || 0;
            const riskLevel =
              r.status === "CONFIRMED" || agreeVotes >= 3
                ? "HIGH"
                : agreeVotes >= 1
                  ? "MEDIUM"
                  : "LOW";
            const risk = RISK_CONFIG[riskLevel];

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 space-y-3"
              >
                {/* Top row — risk + customer */}
                <div className="flex items-start gap-3">
                  {/* Risk dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-3 h-3 rounded-full ${risk.dot}`} />
                  </div>

                  {/* Customer avatar + info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.customer?.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-900 dark:text-white font-bold text-sm">
                            {r.customer?.name}
                          </span>
                          {r.customer?.shortCode && (
                            <span className="bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                              {r.customer.shortCode}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${risk.cls}`}
                          >
                            {risk.label}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs font-mono">
                          {r.customer?.mobile}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-red-400 font-mono font-bold">
                      {taka(r.amountOwed)}
                    </div>
                    <div className="text-slate-500 text-[11px]">বকেয়া</div>
                  </div>
                </div>

                {/* Report type + status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-full font-semibold">
                    {TYPE_LABELS[r.type] || r.type}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold
                    ${r.status === "CONFIRMED" ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-400"}`}
                  >
                    {r.status === "CONFIRMED" ? "✓ Confirmed" : "Pending"}
                  </span>
                </div>

                {/* Reporter */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.shopEmoji}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">{r.shopName}</span>
                    {r.isVerifiedShop && (
                      <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {r.description && (
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed border-l-2 border-gray-300 dark:border-slate-600 pl-3">
                    {r.description}
                  </p>
                )}

                {/* Bottom row — vote + time */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-slate-700/50">
                  <button
                    onClick={() =>
                      voteMut.mutate({ reportId: r.id, agree: true })
                    }
                    disabled={voteMut.isPending}
                    className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                  >
                    👍 আমিও ভুক্তভোগী
                    <span className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                      {agreeVotes}
                    </span>
                  </button>
                  <span className="text-slate-500 text-[11px]">
                    {relativeTime(r.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
