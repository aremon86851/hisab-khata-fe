import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api";
import { EmptyState, PageLoader } from "../../components/shared";
import { taka, relativeTime } from "../../utils/helpers";

export default function AdminTransactionsPage() {
  const qc = useQueryClient();
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminTxns", type],
    queryFn: () =>
      adminApi.getTransactions({ type: type || undefined, limit: 30 }),
  });

  const delMut = useMutation({
    mutationFn: adminApi.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminTxns"] }),
  });

  const txns = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {/* Filter */}
      <div className="flex gap-2">
        {["", "BAKI", "PAYMENT"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
              ${type === t ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
          >
            {t === "" ? "সব" : t === "BAKI" ? "📤 বাকি" : "📥 পরিশোধ"}
          </button>
        ))}
      </div>

      {txns.length === 0 ? (
        <EmptyState icon="💳" title="কোনো Transaction নেই" />
      ) : (
        <div className="space-y-2">
          {txns.map((t: any) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                ${t.type === "BAKI" ? "bg-red-950 text-red-400" : "bg-teal-950 text-teal-400"}`}
              >
                {t.type === "BAKI" ? "📤" : "📥"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 dark:text-white text-xs font-semibold truncate">
                  {t.customer?.name} → {t.shop?.name}
                </div>
                <div className="text-slate-400 text-xs">{t.note || "—"}</div>
                <div className="text-slate-400 dark:text-slate-600 text-[11px]">
                  {relativeTime(t.createdAt)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div
                  className={`font-mono text-sm font-bold ${t.type === "BAKI" ? "text-red-400" : "text-teal-400"}`}
                >
                  {taka(t.amount)}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Delete করবেন?")) delMut.mutate(t.id);
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 border border-red-900/50 px-1.5 py-0.5 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
