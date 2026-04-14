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
  { k: "canAddBaki",       l: "বাকি যোগ করতে পারবে"         },
  { k: "canAddPayment",    l: "পেমেন্ট যোগ করতে পারবে"       },
  { k: "canAddCustomer",   l: "কাস্টমার যোগ করতে পারবে"     },
  { k: "canViewReport",    l: "রিপোর্ট দেখতে পারবে"          },
  { k: "canManageProduct", l: "পণ্য ব্যবস্থাপনা করতে পারবে" },
  { k: "canSendReminder",  l: "রিমাইন্ডার পাঠাতে পারবে"      },
];

const DEFAULT_FORM = {
  name: "",
  mobile: "",
  pin: "",
  role: "STAFF" as "STAFF" | "MANAGER",
  canAddBaki: true,
  canAddPayment: true,
  canAddCustomer: false,
  canViewReport: false,
  canManageProduct: false,
  canSendReminder: false,
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function StaffPage() {
  const qc = useQueryClient();

  // Add staff
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({ ...DEFAULT_FORM });
  const [err, setErr] = useState("");
  const [confirmedStaff, setConfirmedStaff] = useState<{
    name: string; mobile: string; pin: string;
  } | null>(null);

  // Edit staff
  const [editStaff, setEditStaff] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editErr, setEditErr] = useState("");
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // PIN reset
  const [pinFor, setPinFor] = useState<any>(null);
  const [newPin, setNewPin] = useState("");
  const [resetSuccess, setResetSuccess] = useState<{
    name: string; pin: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: staffApi.getStaff,
  });

  const addMut = useMutation({
    mutationFn: () => staffApi.addStaff(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      setConfirmedStaff({ name: form.name, mobile: form.mobile, pin: form.pin });
      setShowAdd(false);
      setForm({ ...DEFAULT_FORM });
      setErr("");
    },
    onError: (e: unknown) => {
      const status =
        e && typeof e === "object" && "response" in e
          ? (e as any).response?.status
          : 0;
      if (status === 409)
        setErr("এই মোবাইল নম্বরে ইতিমধ্যে একজন স্টাফ আছে।");
      else setErr(getApiError(e));
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      staffApi.updateStaff(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      setEditStaff(null);
      setEditForm(null);
      setEditErr("");
      setDeactivateConfirm(false);
    },
    onError: (e) => setEditErr(getApiError(e)),
  });

  const remMut = useMutation({
    mutationFn: staffApi.removeStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      setDeleteConfirm(null);
    },
  });

  const pinMut = useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      staffApi.resetPin(id, pin),
    onSuccess: () => {
      setResetSuccess({ name: pinFor?.name, pin: newPin });
      setPinFor(null);
      setNewPin("");
    },
  });

  const staff = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  const openEdit = (s: any) => {
    setEditStaff(s);
    setEditForm({ ...s });
    setEditErr("");
    setDeactivateConfirm(false);
  };

  const handleSaveEdit = () => {
    if (!editStaff) return;
    updateMut.mutate({ id: editStaff.id, data: editForm });
  };

  const handleDeactivateToggle = (val: boolean) => {
    if (!val && editForm.isActive) {
      setDeactivateConfirm(true);
    } else {
      setEditForm((f: any) => ({ ...f, isActive: val }));
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <button
        onClick={() => { setShowAdd(true); setErr(""); setForm({ ...DEFAULT_FORM }); }}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        + নতুন Staff যোগ করুন
      </button>

      {staff.length === 0 ? (
        <EmptyState icon="👷" title="কোনো Staff নেই" />
      ) : (
        <div className="space-y-3">
          {staff.map((s: any) => (
            <button
              key={s.id}
              onClick={() => openEdit(s)}
              className="w-full text-left bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 dark:text-white font-bold text-sm">
                    {s.name}
                  </div>
                  <div className="text-slate-400 text-xs font-mono">
                    {s.mobile}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {s.lastLoginAt
                      ? `সর্বশেষ সক্রিয়: ${relativeTime(s.lastLoginAt)}`
                      : "কখনো লগইন করেননি"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold
                    ${s.role === "MANAGER" ? "bg-violet-900/60 text-violet-400" : "bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                  >
                    {s.role === "MANAGER" ? "ম্যানেজার" : "স্টাফ"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.isActive
                        ? "bg-green-900/40 text-green-400"
                        : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {s.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>
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
                  onClick={(e) => { e.stopPropagation(); setPinFor(s); setNewPin(""); }}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-600 hover:text-teal-400 transition-colors"
                >
                  🔑 PIN রিসেট
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                  className="text-xs py-1.5 px-3 rounded-lg border border-gray-300 dark:border-slate-700 text-red-400 hover:border-red-600 transition-colors"
                >
                  সরান
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Add Staff Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="নতুন Staff যোগ">
        <div className="space-y-3">
          <Input
            label="নাম*"
            value={form.name}
            onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
            placeholder="Staff এর নাম"
          />
          <Input
            label="মোবাইল* (১১ সংখ্যা)"
            value={form.mobile}
            onChange={(e) => setForm((f: any) => ({ ...f, mobile: e.target.value }))}
            type="tel"
            placeholder="01XXXXXXXXX"
          />
          <Input
            label="PIN* (৪ সংখ্যা)"
            value={form.pin}
            onChange={(e) => setForm((f: any) => ({ ...f, pin: e.target.value }))}
            type="password"
            maxLength={4}
            placeholder="••••"
          />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">ভূমিকা</p>
            <div className="flex gap-2">
              {(["STAFF"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm((f: any) => ({ ...f, role: r }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${form.role === r ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                >
                  {"স্টাফ"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">অনুমতি সমূহ</p>
            {PERMS.map((p) => (
              <Toggle
                key={p.k}
                value={form[p.k]}
                onChange={(v) => setForm((f: any) => ({ ...f, [p.k]: v }))}
                label={p.l}
              />
            ))}
          </div>
          {err && <p className="text-red-600 dark:text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">
              বাতিল
            </Button>
            <Button
              onClick={() => addMut.mutate()}
              loading={addMut.isPending}
              disabled={!form.name || form.mobile.length < 11 || form.pin.length < 4}
              className="flex-1"
            >
              যোগ করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Credential Confirmation Modal ── */}
      <Modal
        open={!!confirmedStaff}
        onClose={() => setConfirmedStaff(null)}
        title="✅ স্টাফ তৈরি হয়েছে"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            স্টাফ অ্যাকাউন্ট তৈরি হয়েছে। নিচের তথ্য স্টাফকে জানিয়ে দিন:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">নাম:</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">{confirmedStaff?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">মোবাইল:</span>
              <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">{confirmedStaff?.mobile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">পিন:</span>
              <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">{confirmedStaff?.pin}</span>
            </div>
          </div>
          <button
            onClick={() =>
              copyToClipboard(
                `মোবাইল: ${confirmedStaff?.mobile}\nপিন: ${confirmedStaff?.pin}`,
              )
            }
            className="w-full py-2.5 rounded-xl border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-sm font-semibold transition-colors"
          >
            📋 কপি করুন
          </button>
          <Button onClick={() => setConfirmedStaff(null)} className="w-full">
            ঠিক আছে
          </Button>
        </div>
      </Modal>

      {/* ── Edit Staff Modal ── */}
      <Modal
        open={!!editStaff}
        onClose={() => { setEditStaff(null); setEditForm(null); }}
        title="Staff সম্পাদনা"
      >
        {editForm && (
          <div className="space-y-3">
            <Input
              label="নাম"
              value={editForm.name}
              onChange={(e) => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
              placeholder="Staff এর নাম"
            />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">ভূমিকা</p>
              <div className="flex gap-2">
                {(["STAFF", "MANAGER"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditForm((f: any) => ({ ...f, role: r }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                      ${editForm.role === r ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                  >
                    {r === "MANAGER" ? "ম্যানেজার" : "স্টাফ"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5 border-t border-b border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">অ্যাকাউন্ট সক্রিয়</p>
                <p className="text-xs text-slate-500">বন্ধ করলে লগইন করতে পারবে না</p>
              </div>
              <Toggle
                value={editForm.isActive}
                onChange={handleDeactivateToggle}
                label=""
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">অনুমতি সমূহ</p>
              {PERMS.map((p) => (
                <Toggle
                  key={p.k}
                  value={editForm[p.k]}
                  onChange={(v) => setEditForm((f: any) => ({ ...f, [p.k]: v }))}
                  label={p.l}
                />
              ))}
            </div>
            {editErr && <p className="text-red-600 dark:text-red-400 text-xs">{editErr}</p>}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => { setEditStaff(null); setEditForm(null); }}
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button onClick={handleSaveEdit} loading={updateMut.isPending} className="flex-1">
                সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Deactivate Confirmation ── */}
      <Modal
        open={deactivateConfirm}
        onClose={() => setDeactivateConfirm(false)}
        title="নিষ্ক্রিয় করবেন?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            এই স্টাফ আর লগইন করতে পারবে না। নিশ্চিত?
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDeactivateConfirm(false)} className="flex-1">
              বাতিল
            </Button>
            <Button
              onClick={() => {
                setEditForm((f: any) => ({ ...f, isActive: false }));
                setDeactivateConfirm(false);
              }}
              className="flex-1 !bg-red-600 hover:!bg-red-500"
            >
              নিষ্ক্রিয় করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Staff সরিয়ে দিবেন?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            এই স্টাফকে সরিয়ে দিতে চান? তিনি আর লগইন করতে পারবেন না।
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1">
              বাতিল
            </Button>
            <Button
              onClick={() => deleteConfirm && remMut.mutate(deleteConfirm)}
              loading={remMut.isPending}
              className="flex-1 !bg-red-600 hover:!bg-red-500"
            >
              সরিয়ে দিন
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── PIN Reset Modal ── */}
      <Modal
        open={!!pinFor}
        onClose={() => { setPinFor(null); setNewPin(""); }}
        title={`${pinFor?.name} — PIN রিসেট`}
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
            <Button variant="ghost" onClick={() => { setPinFor(null); setNewPin(""); }} className="flex-1">
              বাতিল
            </Button>
            <Button
              onClick={() => pinFor && pinMut.mutate({ id: pinFor.id, pin: newPin })}
              loading={pinMut.isPending}
              disabled={newPin.length < 4}
              className="flex-1"
            >
              রিসেট করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── PIN Reset Success Modal ── */}
      <Modal
        open={!!resetSuccess}
        onClose={() => setResetSuccess(null)}
        title="✅ PIN রিসেট হয়েছে"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            পিন রিসেট হয়েছে। নতুন পিন স্টাফকে জানিয়ে দিন:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{resetSuccess?.name} এর নতুন পিন:</p>
            <p className="text-4xl font-bold font-mono text-teal-500 tracking-widest">{resetSuccess?.pin}</p>
          </div>
          <button
            onClick={() => copyToClipboard(resetSuccess?.pin ?? "")}
            className="w-full py-2.5 rounded-xl border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-sm font-semibold transition-colors"
          >
            📋 কপি করুন
          </button>
          <Button onClick={() => setResetSuccess(null)} className="w-full">
            ঠিক আছে
          </Button>
        </div>
      </Modal>
    </div>
  );
}
