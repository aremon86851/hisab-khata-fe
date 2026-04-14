import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../../api";
import { taka, relativeTime, getApiError } from "../../utils/helpers";
import { Check, X } from "lucide-react";

const TABS = ["PENDING", "APPROVED", "REJECTED"] as const;
type TabStatus = (typeof TABS)[number];

const TAB_LABELS: Record<TabStatus, string> = {
  PENDING: "অপেক্ষমান",
  APPROVED: "অনুমোদিত",
  REJECTED: "প্রত্যাখ্যাত",
};

export default function RequestsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabStatus>("PENDING");
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [rejectErr, setRejectErr] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["shopRequests", tab],
    queryFn: () => transactionApi.getShopRequests({ status: tab }),
  });

  const requests = (data?.data as any)?.data || [];

  console.log("RequestsPage - fetched requests:", requests);

  const approveMut = useMutation({
    mutationFn: (requestId: string) => transactionApi.approveRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopRequests"] });
      qc.invalidateQueries({ queryKey: ["shopCustomers"] });
    },
  });

  const rejectMut = useMutation({
    mutationFn: () =>
      transactionApi.rejectRequest(rejectId, rejectNote || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopRequests"] });
      setShowRejectSheet(false);
      setRejectId("");
      setRejectNote("");
      setRejectErr("");
    },
    onError: (e) => setRejectErr(getApiError(e)),
  });

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">
        📬 পেমেন্ট অনুরোধ
      </h1>

      {/* Status tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              tab === t
                ? "bg-teal-600 text-white border-teal-500"
                : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Request list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">কোনো অনুরোধ নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {req?.link?.customer?.image ? (
                      <img
                        src={req.link.customer.image}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      req?.link?.customer?.name?.charAt(0) || "?"
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {req?.link?.customer?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {req?.link?.customer?.mobile || ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-500">
                    {taka(req.amount)}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.type === "BAKI"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                    }`}
                  >
                    {req.type === "BAKI" ? "💸 বাকি" : "✅ পেমেন্ট"}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {relativeTime(req.createdAt)}
                  </p>
                </div>
              </div>

              {req.note && (
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  {req.note}
                </p>
              )}

              {req.status === "REJECTED" && req.reviewNote && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  প্রত্যাখ্যানের কারণ: {req.reviewNote}
                </p>
              )}

              {tab === "APPROVED" && req.reviewedAt && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ অনুমোদিত • {new Date(req.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}

              {tab === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMut.mutate(req.id)}
                    disabled={approveMut.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-500 text-white text-sm font-bold rounded-xl disabled:opacity-60"
                  >
                    <Check size={15} />
                    অনুমোদন করুন
                  </button>
                  <button
                    onClick={() => {
                      setRejectId(req.id);
                      setShowRejectSheet(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 text-sm font-bold rounded-xl"
                  >
                    <X size={15} />
                    প্রত্যাখ্যান
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject bottom sheet */}
      {showRejectSheet && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white dark:bg-slate-800 w-full rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-white">
                প্রত্যাখ্যান করুন
              </h3>
              <button
                onClick={() => {
                  setShowRejectSheet(false);
                  setRejectNote("");
                  setRejectErr("");
                }}
                className="text-gray-400 dark:text-slate-500 text-xl"
              >
                ✕
              </button>
            </div>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="কারণ লিখুন (ঐচ্ছিক)..."
              className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none resize-none"
            />
            {rejectErr && <p className="text-red-500 text-sm">{rejectErr}</p>}
            <button
              onClick={() => {
                setRejectErr("");
                rejectMut.mutate();
              }}
              disabled={rejectMut.isPending}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
            >
              {rejectMut.isPending ? "প্রত্যাখ্যান হচ্ছে..." : "নিশ্চিত করুন"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
