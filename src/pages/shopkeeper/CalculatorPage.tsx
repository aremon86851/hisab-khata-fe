import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi, transactionApi } from "../../api";
import { TransactionItem, PageLoader } from "../../components/shared";
import { taka, relativeTime, getApiError } from "../../utils/helpers";
import Modal from "@/components/shared/Modal";
import { useStaffPermissions } from "../../hooks/useStaffPermissions";

const ROWS = [
  ["AC", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];
const OPS = new Set(["÷", "×", "−", "+", "%"]);

const keyStyle = (k: string) => {
  if (k === "AC") return "bg-red-950 text-red-400 text-sm font-bold";
  if (k === "⌫")
    return "bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm";
  if (OPS.has(k))
    return "bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 text-xl font-bold";
  if (k === "=") return "bg-teal-600 text-white text-xl font-bold";
  return "bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-bold";
};

export default function CalculatorPage() {
  // custId can be passed from Dashboard or Customers page via navigate state
  const location = useLocation();
  const initCustId = (location.state as any)?.custId || "";
  const staffPerms = useStaffPermissions();
  const qc = useQueryClient();

  const [selId, setSelId] = useState(initCustId);
  const [disp, setDisp] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [opLbl, setOpLbl] = useState("");
  const [newNum, setNewNum] = useState(true);
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState<{
    type: "BAKI" | "PAYMENT";
    amount: number;
  } | null>(null);
  const [toast, setToast] = useState("");
  const [ieAutoLink, setIeAutoLink] = useState(true);

  const { data: cr } = useQuery({
    queryKey: ["shopCustomers"],
    queryFn: () => customerApi.getCustomers({ limit: 100 }),
  });
  const { data: txnR } = useQuery({
    queryKey: ["custTxns", selId],
    queryFn: () =>
      transactionApi.getShopTransactions({ customerId: selId, limit: 6 }),
    enabled: !!selId,
  });

  const customers = (cr?.data as any)?.data || [];
  const customer = customers?.find((c: any) => c.id === selId);
  const txns = (txnR?.data as any)?.data || [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const txnMut = useMutation({
    mutationFn: (d: any) => transactionApi.addTransaction(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["shopCustomers"] });
      qc.invalidateQueries({ queryKey: ["custTxns", selId] });
      qc.invalidateQueries({ queryKey: ["monthlySummary"] });
      const incomeEntryId = (res?.data as any)?.data?.incomeEntryId;
      if (incomeEntryId) {
        qc.invalidateQueries({ queryKey: ["ieEntries"] });
        qc.invalidateQueries({ queryKey: ["ieSummary"] });
        showToast("✅ হিসাব সম্পন্ন! আয় খাতায় স্বয়ংক্রিয়ভাবে যোগ হয়েছে");
      } else {
        showToast("✅ হিসাব সম্পন্ন!");
      }
      setConfirm(null);
      pressAC();
      setNote("");
    },
    onError: (e) => {
      showToast("❌ " + getApiError(e));
      setConfirm(null);
    },
  });

  const pressNum = (n: string) => {
    setDisp((p) =>
      newNum
        ? n === "."
          ? "0."
          : n === "0"
            ? "0"
            : n
        : n === "." && p.includes(".")
          ? p
          : p === "0" && n !== "."
            ? n
            : p + n,
    );
    setNewNum(false);
  };
  const pressOp = (o: string) => {
    setPrev(parseFloat(disp));
    setOp(o);
    setOpLbl(parseFloat(disp).toLocaleString("en") + " " + o);
    setNewNum(true);
  };
  const pressEq = () => {
    if (!op || prev === null) return;
    const b = parseFloat(disp);
    let r =
      op === "+"
        ? prev + b
        : op === "−"
          ? prev - b
          : op === "×"
            ? prev * b
            : op === "÷"
              ? b
                ? prev / b
                : 0
              : (prev * b) / 100;
    r = Math.round(r * 100) / 100;
    setDisp(String(r));
    setOp(null);
    setPrev(null);
    setNewNum(true);
    setOpLbl("");
  };
  const pressAC = useCallback(() => {
    setDisp("0");
    setOp(null);
    setPrev(null);
    setNewNum(true);
    setOpLbl("");
  }, []);
  const pressBS = () => setDisp((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
  const handleKey = (k: string) => {
    if (k === "AC") pressAC();
    else if (k === "⌫") pressBS();
    else if (k === "=") pressEq();
    else if (OPS.has(k)) pressOp(k);
    else pressNum(k);
  };

  const handleSave = (type: "BAKI" | "PAYMENT") => {
    if (!customer) {
      showToast("❌ Customer সিলেক্ট করুন");
      return;
    }
    const amt = parseFloat(disp);
    if (!amt || amt <= 0) {
      showToast("❌ সঠিক পরিমাণ দিন");
      return;
    }
    setConfirm({ type, amount: amt });
  };

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl
          ${toast.startsWith("✅") ? "bg-teal-600" : "bg-red-600"}`}
        >
          {toast}
        </div>
      )}

      {/* Customer selector + balance */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-3 space-y-2">
          <select
            value={selId}
            onChange={(e) => setSelId(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-700/60 border border-gray-300 dark:border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
          >
            <option value="">— Customer সিলেক্ট করুন —</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} — {taka(c.balance)}
              </option>
            ))}
          </select>
          {customer && (
            <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-950/50 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                বর্তমান বাকি
              </span>
              <span
                className={`font-mono text-xl font-bold ${customer.balance > 0 ? "text-red-400" : "text-teal-400"}`}
              >
                {taka(customer.balance)}
              </span>
            </div>
          )}
        </div>
        {/* Display */}
        <div className="bg-gray-200 dark:bg-slate-950 mx-3 mb-3 rounded-xl px-4 py-3 min-h-[68px] flex flex-col items-end justify-center">
          <div className="text-slate-500 text-xs font-mono h-4">{opLbl}</div>
          <div className="text-slate-900 dark:text-white text-3xl font-mono font-bold">
            {disp}
          </div>
        </div>
        {/* Note */}
        <div className="px-3 pb-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="📝 নোট (চাল ২ কেজি...)"
            className="w-full bg-gray-100 dark:bg-slate-700/60 border border-gray-300 dark:border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Keypad */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        {ROWS.map((row, ri) => (
          <div
            key={ri}
            className="flex border-b border-gray-200 dark:border-slate-700/40 last:border-b-0"
          >
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={`calc-key flex-1 ${k === "0" ? "flex-[2]" : ""} py-[18px] text-center border-r border-gray-200 dark:border-slate-700/40 last:border-r-0 select-none ${keyStyle(k)}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Baki / Payment buttons */}
      <div className="grid grid-cols-2 gap-3">
        {staffPerms.canAddBaki && (
          <button
            onClick={() => handleSave("BAKI")}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📤</span>
            <div className="text-left">
              <div>বাকি দিল</div>
              <div className="text-xs opacity-70 font-normal">Credit নিয়েছে</div>
            </div>
          </button>
        )}
        {staffPerms.canAddPayment && (
          <button
            onClick={() => handleSave("PAYMENT")}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📥</span>
            <div className="text-left">
              <div>টাকা দিল</div>
              <div className="text-xs opacity-70 font-normal">Payment করেছে</div>
            </div>
          </button>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <Modal title="নিশ্চিত করুন?" setConfirm={setConfirm}>
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Customer:
                </span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {customer?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  পরিমাণ:
                </span>
                <span
                  className={`font-mono font-bold ${confirm.type === "BAKI" ? "text-red-400" : "text-teal-400"}`}
                >
                  {taka(confirm.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">ধরন:</span>
                <span className="text-slate-900 dark:text-white">
                  {confirm.type === "BAKI" ? "বাকি" : "পরিশোধ"}
                </span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    নোট:
                  </span>
                  <span className="text-slate-900 dark:text-white">{note}</span>
                </div>
              )}
              {confirm.type === "PAYMENT" && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    আয় খাতায় যোগ:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIeAutoLink((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ieAutoLink ? "bg-teal-600" : "bg-gray-300 dark:bg-slate-600"}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${ieAutoLink ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm"
              >
                বাতিল
              </button>
              <button
                onClick={() =>
                  txnMut.mutate({
                    customerId: selId,
                    type: confirm.type,
                    amount: confirm.amount,
                    note: note || undefined,
                    ieAutoLink: confirm.type === "PAYMENT" ? ieAutoLink : undefined,
                  })
                }
                disabled={txnMut.isPending}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm disabled:opacity-50"
              >
                {txnMut.isPending
                  ? "সম্পন্ন হচ্ছে..."
                  : "হ্যাঁ, সম্পন্ন করুন ✓"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Recent transactions */}
      {txns.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
            {customer?.name} — সাম্প্রতিক
          </div>
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
        </div>
      )}
    </div>
  );
}
