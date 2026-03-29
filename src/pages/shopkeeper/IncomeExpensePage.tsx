import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ieApi } from "../../api";
import {
  StatCard,
  PageLoader,
  Input,
  Button,
  Modal,
} from "../../components/shared";
import { taka, banglaMonth, getApiError } from "../../utils/helpers";

const INCOME_CATS = ["বিক্রয়", "বাকি আদায়", "অন্যান্য"];
const EXPENSE_CATS = ["মাল কেনা", "ভাড়া", "বিদ্যুৎ", "কর্মচারী", "অন্যান্য"];

export default function IncomeExpensePage() {
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: "INCOME" as "INCOME" | "EXPENSE",
    amount: "",
    category: "",
    note: "",
  });
  const [err, setErr] = useState("");

  const { data: sumR } = useQuery({
    queryKey: ["ieSummary", year, month],
    queryFn: () => ieApi.getMonthlySummary(year, month),
  });
  const { data: entriesR, isLoading } = useQuery({
    queryKey: ["ieEntries", tab],
    queryFn: () => ieApi.getEntries({ type: tab, limit: 30 }),
  });

  const addMut = useMutation({
    mutationFn: () =>
      ieApi.addEntry({
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ieSummary"] });
      qc.invalidateQueries({ queryKey: ["ieEntries"] });
      setShowAdd(false);
      setForm({ type: "INCOME", amount: "", category: "", note: "" });
      setErr("");
    },
    onError: (e) => setErr(getApiError(e)),
  });

  const delMut = useMutation({
    mutationFn: ieApi.deleteEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ieSummary"] });
      qc.invalidateQueries({ queryKey: ["ieEntries"] });
    },
  });

  const s = (sumR?.data as any)?.data;
  const entries = (entriesR?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Month picker */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2">
        <button
          onClick={prevMonth}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl"
        >
          ←
        </button>
        <span className="text-slate-900 dark:text-white font-bold">
          {banglaMonth(month)} {year}
        </span>
        <button
          onClick={nextMonth}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl"
        >
          →
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="আয়" value={taka(s.totalIncome)} color="green" />
          <StatCard label="ব্যয়" value={taka(s.totalExpense)} color="red" />
          <StatCard
            label="লাভ"
            value={taka(s.netProfit)}
            color={s.netProfit >= 0 ? "teal" : "amber"}
          />
        </div>
      )}

      <button
        onClick={() => {
          setShowAdd(true);
          setForm((f) => ({ ...f, type: tab, category: "" }));
        }}
        className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors"
      >
        + নতুন Entry যোগ করুন
      </button>

      <div className="flex gap-2">
        {(["INCOME", "EXPENSE"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all
              ${tab === t ? (t === "INCOME" ? "bg-teal-600 text-white border-teal-500" : "bg-red-600 text-white border-red-500") : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
          >
            {t === "INCOME" ? "📈 আয়" : "📉 ব্যয়"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {entries.map((e: any) => (
          <div
            key={e.id}
            className={`bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 flex items-center gap-3 border-l-4
              ${e.type === "INCOME" ? "border-l-teal-500" : "border-l-red-500"}`}
          >
            <div className="flex-1">
              <div className="text-slate-900 dark:text-white text-sm font-semibold">
                {e.category}
              </div>
              {e.note && <div className="text-slate-400 text-xs">{e.note}</div>}
              <div className="text-slate-500 text-xs">
                {new Date(e.entryDate).toLocaleDateString("bn-BD")}
              </div>
            </div>
            <div
              className={`font-mono font-bold ${e.type === "INCOME" ? "text-teal-400" : "text-red-400"}`}
            >
              {taka(e.amount)}
            </div>
            <button
              onClick={() => delMut.mutate(e.id)}
              className="text-slate-600 hover:text-red-400 text-xs ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="নতুন Entry"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["INCOME", "EXPENSE"] as const).map((t) => (
              <button
                key={t}
                onClick={() =>
                  setForm((f) => ({ ...f, type: t, category: "" }))
                }
                className={`flex-1 py-2 rounded-xl text-sm font-bold border
                  ${form.type === t ? (t === "INCOME" ? "bg-teal-600 text-white border-teal-500" : "bg-red-600 text-white border-red-500") : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
              >
                {t === "INCOME" ? "আয়" : "ব্যয়"}
              </button>
            ))}
          </div>
          <Input
            label="পরিমাণ ৳*"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            type="number"
            placeholder="0"
          />
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(form.type === "INCOME" ? INCOME_CATS : EXPENSE_CATS).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                    ${form.category === c ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
          </div>
          <Input
            label="নোট"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="বিস্তারিত..."
          />
          {err && (
            <p className="text-red-600 dark:text-red-400 text-xs">{err}</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              onClick={() => addMut.mutate()}
              loading={addMut.isPending}
              disabled={!form.amount || !form.category}
              className="flex-1"
            >
              যোগ করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
