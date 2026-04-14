import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../../api";
import { PageLoader, EmptyState, Modal, Input, Button } from "../../components/shared";
import { taka, getApiError } from "../../utils/helpers";
import type { TCampaignType } from "../../types";

const TABS = [
  { key: "ALL", label: "সব" },
  { key: "active", label: "চলমান" },
  { key: "upcoming", label: "আসন্ন" },
  { key: "expired", label: "মেয়াদোত্তীর্ণ" },
] as const;

const TYPES: { key: TCampaignType; label: string; emoji: string }[] = [
  { key: "MONTHLY_PACKAGE", label: "মাসিক প্যাকেজ", emoji: "📦" },
  { key: "DISCOUNT", label: "ডিসকাউন্ট", emoji: "🏷️" },
  { key: "CUSTOM", label: "কাস্টম", emoji: "✏️" },
  { key: "CATALOG", label: "ক্যাটালগ", emoji: "📋" },
];

const TYPE_EMOJIS: Record<string, string> = {
  MONTHLY_PACKAGE: "📦", DISCOUNT: "🏷️", CUSTOM: "✏️", CATALOG: "📋",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
  upcoming: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  expired: "bg-gray-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "চলমান", upcoming: "আসন্ন", expired: "মেয়াদোত্তীর্ণ",
};

type ItemForm = { name: string; quantity: string; unit: string; price: string; productId: string };
const emptyItem = (): ItemForm => ({ name: "", quantity: "", unit: "কেজি", price: "", productId: "" });

export default function CampaignsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "MONTHLY_PACKAGE" as TCampaignType,
    startDate: "", endDate: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    discountValue: "",
    targetCustomers: "ALL" as "ALL" | "SPECIFIC",
  });
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);
  const [err, setErr] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", tab],
    queryFn: () => campaignApi.getAll(tab === "ALL" ? {} : { status: tab }),
  });

  const createMut = useMutation({
    mutationFn: () => {
      const body: any = {
        type: form.type, title: form.title,
        description: form.description || undefined,
        startDate: form.startDate, endDate: form.endDate,
        targetCustomers: form.targetCustomers,
      };
      if (form.type === "DISCOUNT") {
        body.discountType = form.discountType;
        body.discountValue = Number(form.discountValue);
      }
      if (form.type === "MONTHLY_PACKAGE" || form.type === "CATALOG") {
        body.items = items
          .filter((i) => i.name)
          .map((i) => ({
            name: i.name, quantity: Number(i.quantity) || 1,
            unit: i.unit || "পিস", price: Number(i.price) || 0,
            productId: i.productId || undefined,
          }));
      }
      return campaignApi.create(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      setShowCreate(false);
      resetForm();
    },
    onError: (e) => setErr(getApiError(e)),
  });

  const resetForm = () => {
    setForm({
      title: "", description: "", type: "MONTHLY_PACKAGE", startDate: "", endDate: "",
      discountType: "PERCENTAGE", discountValue: "", targetCustomers: "ALL",
    });
    setItems([emptyItem()]);
    setErr("");
  };

  const updateItem = (idx: number, field: keyof ItemForm, val: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const campaigns = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  const renderSummary = (c: any) => {
    if (c.discountType && c.discountValue) {
      return c.discountType === "PERCENTAGE"
        ? `${c.discountValue}% ছাড়`
        : `৳${c.discountValue} ছাড়`;
    }
    if (c.items?.length) {
      return `${c.items.length}টি আইটেম`;
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">📢 ক্যাম্পেইন</div>
      </div>

      <button onClick={() => { setShowCreate(true); resetForm(); }} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors">
        + নতুন ক্যাম্পেইন তৈরি করুন
      </button>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all
              ${tab === t.key ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <EmptyState icon="📢" title="কোনো ক্যাম্পেইন নেই" />
      ) : (
        <div className="space-y-2">
          {campaigns.map((c: any) => (
            <div key={c.id} onClick={() => navigate(`/shopkeeper/campaigns/${c.id}`)}
              className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-teal-500 dark:hover:border-teal-800 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_EMOJIS[c.type] || "📢"}</span>
                    <span className="text-slate-900 dark:text-white text-sm font-bold truncate">{c.title}</span>
                  </div>
                  {c.description && (
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-1">{c.description}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-400 text-[11px]">
                      {new Date(c.startDate).toLocaleDateString("bn-BD")} — {new Date(c.endDate).toLocaleDateString("bn-BD")}
                    </span>
                    {renderSummary(c) && (
                      <span className="text-teal-600 dark:text-teal-400 text-[11px] font-semibold">{renderSummary(c)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[c.status] || ""}`}>
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    {c.subscriberCount > 0 && <span>👥 {c.subscriberCount}</span>}
                    {c.pendingCount > 0 && <span className="text-yellow-600">⏳ {c.pendingCount}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="নতুন ক্যাম্পেইন">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <Input label="শিরোনাম *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="যেমন: মাসিক প্যাকেজ - April" />
          <Input label="বিবরণ" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="বিস্তারিত..." />

          {/* Type selector */}
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">ধরন</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.key} onClick={() => setForm((f) => ({ ...f, type: t.key }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                    ${form.type === t.key ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">টার্গেট কাস্টমার</label>
            <div className="flex gap-2">
              {(["ALL", "SPECIFIC"] as const).map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, targetCustomers: t }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                    ${form.targetCustomers === t ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {t === "ALL" ? "সবাই" : "নির্দিষ্ট"}
                </button>
              ))}
            </div>
          </div>

          {/* Discount fields */}
          {form.type === "DISCOUNT" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {(["PERCENTAGE", "FLAT"] as const).map((dt) => (
                  <button key={dt} onClick={() => setForm((f) => ({ ...f, discountType: dt }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                      ${form.discountType === dt ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                    {dt === "PERCENTAGE" ? "শতাংশ %" : "৳ Flat"}
                  </button>
                ))}
              </div>
              <Input label={form.discountType === "PERCENTAGE" ? "ডিসকাউন্ট % *" : "ডিসকাউন্ট পরিমাণ ৳ *"} type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === "PERCENTAGE" ? "10" : "50"} />
            </div>
          )}

          {/* Items for MONTHLY_PACKAGE / CATALOG */}
          {(form.type === "MONTHLY_PACKAGE" || form.type === "CATALOG") && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block">আইটেম সমূহ *</label>
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-slate-900/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">#{idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                    )}
                  </div>
                  <Input label="নাম *" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="চাল" />
                  <div className="grid grid-cols-3 gap-2">
                    <Input label="পরিমাণ" type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} placeholder="5" />
                    <Input label="একক" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} placeholder="কেজি" />
                    <Input label="দাম ৳" type="number" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} placeholder="60" />
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full border-2 border-dashed border-gray-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl py-2 text-xs font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors">
                + আরও আইটেম যোগ করুন
              </button>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <Input label="শুরু *" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input label="শেষ *" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>

          {err && <p className="text-red-600 dark:text-red-400 text-xs">{err}</p>}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">বাতিল</Button>
            <Button onClick={() => createMut.mutate()} loading={createMut.isPending}
              disabled={!form.title || !form.startDate || !form.endDate} className="flex-1">
              তৈরি করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
