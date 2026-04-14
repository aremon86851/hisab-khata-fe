import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../api";
import {
  BakiChip,
  StarRating,
  EmptyState,
  PageLoader,
  Input,
  Button,
  Modal,
} from "../../components/shared";
import { taka, getApiError } from "../../utils/helpers";
import { useBasePath } from "../../hooks/useBasePath";
import { useStaffPermissions } from "../../hooks/useStaffPermissions";

const RISK_BADGE: Record<string, { label: string; cls: string; icon: string }> = {
  LOW:    { label: "১টি অপেক্ষমান রিপোর্ট",           cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400", icon: "⚠️" },
  MEDIUM: { label: "নিশ্চিত রিপোর্ট বা ৩+ অপেক্ষমান",  cls: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400", icon: "🔶" },
  HIGH:   { label: "৩+ নিশ্চিত রিপোর্ট — উচ্চ ঝুঁকি",   cls: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",       icon: "🚨" },
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const basePath = useBasePath();
  const perms = useStaffPermissions();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "baki" | "paid">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [nm, setNm] = useState("");
  const [mob, setMob] = useState("");
  const [op, setOp] = useState("");
  const [err, setErr] = useState("");

  // Fraud pre-check state (Section 2)
  const [checkResult, setCheckResult] = useState<any>(null);
  const [showFraudReports, setShowFraudReports] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fraud check when mobile reaches 11 digits
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCheckResult(null);
    setShowFraudReports(false);
    if (mob.length === 11) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await customerApi.checkMobile(mob);
          const d = (res?.data as any)?.data;
          if (d) {
            setCheckResult(d);
            if (d.autofill?.name) setNm(d.autofill.name);
          }
        } catch { /* ignore */ }
      }, 500);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [mob]);

  const hb = filter === "baki" ? true : filter === "paid" ? false : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["shopCustomers", search, hb],
    queryFn: () =>
      customerApi.getCustomers({ search: search || undefined, hasBalance: hb }),
  });

  const addMut = useMutation({
    mutationFn: () =>
      customerApi.addCustomer({
        name: nm,
        mobile: mob,
        openingBalance: op ? Number(op) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopCustomers"] });
      setShowAdd(false);
      setNm("");
      setMob("");
      setOp("");
      setErr("");
    },
    onError: (e) => setErr(getApiError(e)),
  });

  const rateMut = useMutation({
    mutationFn: ({ id, r }: { id: string; r: number }) =>
      customerApi.rateCustomer(id, r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopCustomers"] }),
  });

  const customers = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম বা মোবাইল..."
          className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
        />
        {perms.canAddCustomer && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
          >
            + যোগ
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["all", "baki", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
              ${filter === f ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
          >
            {f === "all" ? "সব" : f === "baki" ? "🔴 বাকি" : "🟢 পরিশোধ"}
          </button>
        ))}
      </div>

      {customers.length === 0 ? (
        <EmptyState icon="👥" title="কোনো Customer নেই" />
      ) : (
        <div className="space-y-2">
          {customers.map((c: any) => (
            <div
              key={c.id}
              className={`bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 border-l-4
                ${c.balance > 2000 ? "border-l-red-500" : c.balance > 0 ? "border-l-amber-500" : "border-l-teal-500"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`${basePath}/customer/${c.id}`}>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">
                      {c.name}
                    </div>
                  </Link>
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                    {c.mobile}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-bold text-base ${c.balance > 0 ? "text-red-400" : "text-teal-400"}`}
                  >
                    {taka(c.balance)}
                  </div>
                  <BakiChip amount={c.balance} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-200 dark:border-slate-700/50">
                <StarRating
                  rating={c.shopRating}
                  interactive
                  onChange={(r) => rateMut.mutate({ id: c.id, r })}
                />
                {(perms.canAddBaki || perms.canAddPayment) && (
                  <button
                    onClick={() =>
                      navigate(`${basePath}/calculator`, {
                        state: { custId: c.id },
                      })
                    }
                    className="text-xs bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold"
                  >
                    🧮 হিসাব
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="নতুন Customer"
      >
        <div className="space-y-3">
          <Input
            label="নাম*"
            value={nm}
            onChange={(e) => setNm(e.target.value)}
            placeholder="Customer এর নাম"
          />
          <Input
            label="মোবাইল*"
            value={mob}
            onChange={(e) => setMob(e.target.value)}
            type="tel"
            placeholder="01XXXXXXXXX"
          />

          {/* Risk badge */}
          {checkResult?.fraud?.riskLevel && checkResult.fraud.riskLevel !== "NONE" && (() => {
            const badge = RISK_BADGE[checkResult.fraud.riskLevel];
            return badge ? (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${badge.cls}`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                  <button
                    type="button"
                    className="ml-auto underline opacity-70"
                    onClick={() => setShowFraudReports(!showFraudReports)}
                  >
                    {showFraudReports ? "লুকান" : "বিস্তারিত"}
                  </button>
                </div>
                {showFraudReports && checkResult.fraud.reports?.length > 0 && (
                  <div className="space-y-1.5">
                    {checkResult.fraud.reports.map((r: any) => (
                      <div key={r.id} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-red-700 dark:text-red-400">{r.type}</span>
                          <span className="text-slate-400">{r.status}</span>
                        </div>
                        {r.description && <p className="text-slate-600 dark:text-slate-300 mt-0.5">{r.description}</p>}
                        {r.amountOwed > 0 && <p className="text-red-500 font-semibold">{taka(r.amountOwed)}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null;
          })()}
          <Input
            label="প্রারম্ভিক বাকি (ঐচ্ছিক)"
            value={op}
            onChange={(e) => setOp(e.target.value)}
            type="number"
            placeholder="0"
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
              className="flex-1"
            >
              যোগ করুন →
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
