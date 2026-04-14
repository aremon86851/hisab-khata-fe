import { useState } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../../api";
import {
  TransactionItem,
  ProductCard,
  StarRating,
  EmptyState,
} from "../../components/shared";
import { taka, relativeTime, getApiError } from "../../utils/helpers";

const STATUS_CHIP: Record<string, string> = {
  PENDING:  "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "প্রায়োজী", APPROVED: "অনুমোদিত", REJECTED: "প্রত্যাখ্যাত",
};

export default function ShopsPage() {
  const { profile } = useOutletContext<{ profile: any }>();
  const location = useLocation();

  // shopId can be passed from HomePage via navigate state
  const initShopId = (location.state as any)?.shopId;
  const shops = profile?.shops || [];

  const [selectedId, setSelectedId] = useState<string>(
    initShopId || shops[0]?.id || "",
  );

  const selected = shops.find((s: any) => s.id === selectedId) ?? shops[0];

  // Tabs: transactions | requests
  const [historyTab, setHistoryTab] = useState<"txns" | "requests">("txns");

  // Request payment modal state (6a)
  const qc = useQueryClient();
  const [showRequest, setShowRequest] = useState(false);
  const [reqType, setReqType] = useState<"BAKI" | "PAYMENT">("PAYMENT");
  const [reqAmount, setReqAmount] = useState("");
  const [reqNote, setReqNote] = useState("");
  const [reqErr, setReqErr] = useState("");
  const [reqDone, setReqDone] = useState(false);

  const resetRequest = () => {
    setReqType("PAYMENT");
    setReqAmount("");
    setReqNote("");
    setReqErr("");
    setReqDone(false);
  };

  const requestMut = useMutation({
    mutationFn: () =>
      transactionApi.submitRequest({
        shopId: selected?.id,
        type: reqType,
        amount: Number(reqAmount),
        note: reqNote || undefined,
      }),
    onSuccess: () => {
      setReqDone(true);
      qc.invalidateQueries({ queryKey: ["myRequests", selected?.id] });
      qc.invalidateQueries({ queryKey: ["myTxns", selected?.id] });
      setTimeout(() => {
        setShowRequest(false);
        resetRequest();
      }, 2000);
    },
    onError: (e: any) => {
      const status = e?.response?.status;
      if (status === 403) {
        setReqErr("এই দোকান আপনাকে লেনদেন অনুরোধের অনুমতি দেয়নি।");
      } else if (status === 400) {
        setReqErr("পেমেন্টের পরিমাণ বাকির জের বেশি।");
      } else {
        setReqErr(getApiError(e));
      }
    },
  });

  const { data: txnRes } = useQuery({
    queryKey: ["myTxns", selected?.id],
    queryFn: () => transactionApi.getMyTransactions({ limit: 50 }),
    enabled: !!selected,
  });

  // 6b: customer's own requests for this shop
  const { data: myReqRes } = useQuery({
    queryKey: ["myRequests", selected?.id],
    queryFn: () => transactionApi.getMyRequests({ shopId: selected?.id }),
    enabled: !!selected && historyTab === "requests",
  });

  const allTxns = (txnRes?.data as any)?.data || [];
  const txns = allTxns.filter((t: any) => t.shopId === selected?.id);
  const myRequests = (myReqRes?.data as any)?.data || [];

  return (
    <div className="animate-fade-in">
      {/* Shop pill selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {shops.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${
                s.id === selectedId
                  ? "bg-teal-600 text-white border-teal-500"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-700"
              }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {!selected ? (
        <div className="p-4">
          <EmptyState icon="🏪" title="কোনো দোকান নেই" />
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          {/* Shop header card */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{selected.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-white font-bold">
                    {selected.name}
                  </span>
                  {selected.verification?.status === "VERIFIED" && (
                    <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-xs">
                  {selected.verification?.district || ""}
                </div>
                <StarRating rating={selected.shopRating} />
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-950/50 rounded-xl px-4 py-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                তোমার বাকি
              </div>
              <div
                className={`font-mono text-2xl font-extrabold ${selected.balance > 0 ? "text-red-400" : "text-teal-400"}`}
              >
                {taka(selected.balance)}
              </div>
            </div>

            {/* Request Payment button (Section 6a) */}
            {selected?.canRequestTxn && (
              <button
                onClick={() => { resetRequest(); setShowRequest(true); }}
                className="w-full mt-3 py-3 bg-teal-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                📝 লেনদেন অনুরোধ পাঠান
              </button>
            )}
          </div>

          {/* Transaction history */}
          <div>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setHistoryTab("txns")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${historyTab === "txns" ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
              >
                লেনদেন
              </button>
              <button
                onClick={() => setHistoryTab("requests")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${historyTab === "requests" ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
              >
                আমার অনুরোধ
              </button>
            </div>

            {historyTab === "txns" ? (
              txns.length === 0 ? (
                <EmptyState icon="📋" title="কোনো লেনদেন নেই" />
              ) : (
                <div className="space-y-2">
                  {txns.map((t: any) => (
                    <TransactionItem
                      key={t.id}
                      type={t.type}
                      amount={t.amount}
                      note={t.note}
                      date={relativeTime(t.createdAt)}
                    />
                  ))}
                </div>
              )
            ) : (
              myRequests.length === 0 ? (
                <EmptyState icon="📬" title="কোনো অনুরোধ নেই" />
              ) : (
                <div className="space-y-2">
                  {myRequests.map((r: any) => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">{taka(r.amount)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CHIP[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      {r.note && <p className="text-xs text-slate-500">{r.note}</p>}
                      {r.status === "REJECTED" && r.reviewNote && (
                        <p className="text-xs text-red-500 italic">প্রত্যাখ্যাত: {r.reviewNote}</p>
                      )}
                      <p className="text-xs text-slate-400">{relativeTime(r.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Products */}
          {selected.products?.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
                📦 দোকানের পণ্য
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selected.products.map((p: any) => (
                  <ProductCard
                    key={p.id}
                    name={p.name}
                    price={p.price}
                    unit={p.unit}
                    emoji={p.emoji}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white dark:bg-slate-800 w-full rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-white">📝 লেনদেন অনুরোধ</h3>
              <button
                onClick={() => { setShowRequest(false); resetRequest(); }}
                className="text-gray-400 text-xl"
              >✕</button>
            </div>

            {reqDone ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="font-bold text-green-600 dark:text-green-400">আপনার অনুরোধ দোকানদারের কাছে পাঠানো হয়েছে।</p>
              </div>
            ) : (
              <>
                {/* Type selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReqType("BAKI")}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition ${
                      reqType === "BAKI"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                        : "border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    💸 বাকি নিলাম
                    <p className="text-xs font-normal opacity-70 mt-0.5">টাকা বাড়বে</p>
                  </button>
                  <button
                    onClick={() => setReqType("PAYMENT")}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition ${
                      reqType === "PAYMENT"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                        : "border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    ✅ পেমেন্ট করলাম
                    <p className="text-xs font-normal opacity-70 mt-0.5">টাকা কমবে</p>
                  </button>
                </div>

                {/* Current balance hint for PAYMENT */}
                {reqType === "PAYMENT" && selected?.balance > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    বর্তমান বাকি: <span className="font-bold text-red-500">{taka(selected.balance)}</span>
                  </p>
                )}

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">পরিমাণ *</label>
                  <input
                    type="number"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    placeholder="যেমন: 500"
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">নোট (৐চ্ছিক)</label>
                  <input
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value.slice(0, 200))}
                    placeholder="বিবরণ লিখুন..."
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">{reqNote.length}/200</p>
                </div>

                {reqErr && <p className="text-red-500 text-sm">{reqErr}</p>}

                <button
                  onClick={() => { setReqErr(""); requestMut.mutate(); }}
                  disabled={!reqAmount || Number(reqAmount) <= 0 || requestMut.isPending}
                  className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
                >
                  {requestMut.isPending ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
