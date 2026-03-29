import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../../api";
import {
  EmptyState,
  PageLoader,
  Input,
  Button,
  Modal,
  Toggle,
} from "../../components/shared";
import { relativeTime, getApiError } from "../../utils/helpers";

const PERMS = [
  { k: "canAddBaki", l: "বাকি যোগ" },
  { k: "canAddPayment", l: "Payment নিতে" },
  { k: "canAddCustomer", l: "Customer যোগ" },
  { k: "canViewReport", l: "Report দেখা" },
  { k: "canManageProduct", l: "Product manage" },
  { k: "canSendReminder", l: "Reminder পাঠানো" },
];

export default function StaffPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    mobile: "",
    pin: "",
    role: "STAFF",
    canAddBaki: true,
    canAddPayment: true,
    canAddCustomer: false,
    canViewReport: false,
    canManageProduct: false,
    canSendReminder: false,
  });
  const [err, setErr] = useState("");
  const [pinFor, setPinFor] = useState<any>(null);
  const [newPin, setNewPin] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: staffApi.getStaff,
  });

  const addMut = useMutation({
    mutationFn: () => staffApi.addStaff(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      setShowAdd(false);
      setErr("");
    },
    onError: (e) => setErr(getApiError(e)),
  });
  const remMut = useMutation({
    mutationFn: staffApi.removeStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
  const pinMut = useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      staffApi.resetPin(id, pin),
    onSuccess: () => {
      setPinFor(null);
      setNewPin("");
    },
  });

  const staff = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <button
        onClick={() => setShowAdd(true)}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        + নতুন Staff যোগ করুন
      </button>

      {staff.length === 0 ? (
        <EmptyState icon="👷" title="কোনো Staff নেই" />
      ) : (
        <div className="space-y-3">
          {staff.map((s: any) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center text-white font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-slate-900 dark:text-white font-bold text-sm">
                    {s.name}
                  </div>
                  <div className="text-slate-400 text-xs font-mono">
                    {s.mobile}
                  </div>
                  {s.lastLoginAt && (
                    <div className="text-slate-500 text-xs">
                      সর্বশেষ: {relativeTime(s.lastLoginAt)}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold
                  ${s.role === "MANAGER" ? "bg-violet-900/60 text-violet-400" : "bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                >
                  {s.role === "MANAGER" ? "ম্যানেজার" : "স্টাফ"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PERMS.filter((p) => s[p.k]).map((p) => (
                  <span
                    key={p.k}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-400 font-semibold"
                  >
                    ✓ {p.l}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPinFor(s)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-600 hover:text-teal-400 transition-colors"
                >
                  🔑 PIN Reset
                </button>
                <button
                  onClick={() => remMut.mutate(s.id)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-gray-300 dark:border-slate-700 text-red-400 hover:border-red-600 transition-colors"
                >
                  সরান
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="নতুন Staff"
      >
        <div className="space-y-3">
          <Input
            label="নাম*"
            value={form.name}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, name: e.target.value }))
            }
            placeholder="Staff এর নাম"
          />
          <Input
            label="মোবাইল*"
            value={form.mobile}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, mobile: e.target.value }))
            }
            type="tel"
            placeholder="01XXXXXXXXX"
          />
          <Input
            label="PIN* (৪ সংখ্যা)"
            value={form.pin}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, pin: e.target.value }))
            }
            type="password"
            maxLength={4}
            placeholder="••••"
          />
          <div className="flex gap-2">
            {(["STAFF", "MANAGER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setForm((f: any) => ({ ...f, role: r }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                  ${form.role === r ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
              >
                {r === "MANAGER" ? "ম্যানেজার" : "স্টাফ"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {PERMS.map((p) => (
              <Toggle
                key={p.k}
                value={form[p.k]}
                onChange={(v) => setForm((f: any) => ({ ...f, [p.k]: v }))}
                label={p.l}
              />
            ))}
          </div>
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
              যোগ করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* PIN Reset Modal */}
      <Modal
        open={!!pinFor}
        onClose={() => setPinFor(null)}
        title={`${pinFor?.name} — PIN Reset`}
      >
        <div className="space-y-3">
          <Input
            label="নতুন PIN (৪ সংখ্যা)*"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            type="password"
            maxLength={4}
            placeholder="••••"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPinFor(null)}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                pinFor && pinMut.mutate({ id: pinFor.id, pin: newPin })
              }
              loading={pinMut.isPending}
              disabled={newPin.length < 4}
              className="flex-1"
            >
              Reset করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
