import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../../api";
import { PageLoader, EmptyState, Button } from "../../components/shared";
import { taka, getApiError } from "../../utils/helpers";
import type { TCampaignType } from "../../types";

const TYPE_LABELS: Record<TCampaignType, string> = {
  MONTHLY_PACKAGE: "📦 মাসিক প্যাকেজ",
  DISCOUNT: "🏷️ ডিসকাউন্ট",
  CUSTOM: "✏️ কাস্টম",
  CATALOG: "📋 ক্যাটালগ",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
  upcoming: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  expired: "bg-gray-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "চলমান", upcoming: "আসন্ন", expired: "মেয়াদোত্তীর্ণ",
};

const SUB_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  CONFIRMED: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
  REJECTED: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

const SUB_LABELS: Record<string, string> = {
  PENDING: "অপেক্ষমান", CONFIRMED: "অনুমোদিত", REJECTED: "প্রত্যাখ্যাত",
};

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState("PENDING");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const { data: campR, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignApi.getById(id!),
    enabled: !!id,
  });

  const { data: subsR, isLoading: subsLoading } = useQuery({
    queryKey: ["campaignSubs", id, subTab],
    queryFn: () => campaignApi.getSubscriptions(id!, { status: subTab }),
    enabled: !!id,
  });

  const reviewMut = useMutation({
    mutationFn: ({ subId, status, reviewNote }: { subId: string; status: string; reviewNote?: string }) =>
      campaignApi.reviewSubscription(id!, subId, { status, reviewNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaignSubs", id] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      showToast("✅ আপডেট হয়েছে");
    },
    onError: (e) => showToast("❌ " + getApiError(e)),
  });

  const notifyMut = useMutation({
    mutationFn: () => campaignApi.notifySubscribers(id!),
    onSuccess: (res) => {
      const count = (res?.data as any)?.data?.notified || 0;
      showToast(`✅ ${count} জনকে নোটিফিকেশন পাঠানো হয়েছে`);
    },
    onError: (e) => showToast("❌ " + getApiError(e)),
  });

  const deleteMut = useMutation({
    mutationFn: () => campaignApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      navigate("/shopkeeper/campaigns");
    },
    onError: (e) => showToast("❌ " + getApiError(e)),
  });

  if (isLoading) return <PageLoader />;

  const camp = (campR?.data as any)?.data;
  if (!camp) return <EmptyState icon="📢" title="ক্যাম্পেইন পাওয়া যায়নি" />;

  const subs = (subsR?.data as any)?.data || [];

  const renderDiscount = () => {
    if (!camp.discountType || !camp.discountValue) return null;
    return camp.discountType === "PERCENTAGE"
      ? `${camp.discountValue}% ছাড়`
      : `৳${camp.discountValue} Flat ছাড়`;
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${toast.startsWith("✅") ? "bg-teal-600" : "bg-red-600"}`}>
          {toast}
        </div>
      )}

      <button onClick={() => navigate("/shopkeeper/campaigns")} className="text-teal-600 dark:text-teal-400 text-sm hover:underline">
        ← ক্যাম্পেইন তালিকা
      </button>

      {/* Campaign info card */}
      <div className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-slate-900 dark:text-white text-lg font-bold">{camp.title}</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              {TYPE_LABELS[camp.type as TCampaignType] || camp.type}
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[camp.status] || ""}`}>
            {STATUS_LABELS[camp.status] || camp.status}
          </span>
        </div>
        {camp.description && (
          <p className="text-slate-600 dark:text-slate-400 text-sm">{camp.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>📅 {new Date(camp.startDate).toLocaleDateString("bn-BD")} — {new Date(camp.endDate).toLocaleDateString("bn-BD")}</span>
          <span>👥 {camp.subscriberCount || 0} জন</span>
          {camp.pendingCount > 0 && <span className="text-yellow-600">⏳ {camp.pendingCount} অপেক্ষমান</span>}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          টার্গেট: {camp.targetCustomers === "ALL" ? "সবাই" : "নির্দিষ্ট"}
        </div>

        {/* Discount info */}
        {renderDiscount() && (
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm text-teal-700 dark:text-teal-300 font-semibold">
            {renderDiscount()}
          </div>
        )}

        {/* Items list */}
        {camp.items?.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">আইটেম</div>
            {camp.items.map((item: any, idx: number) => (
              <div key={item.id || idx} className="bg-gray-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-900 dark:text-white font-semibold">{item.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2 text-xs">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{taka(item.price)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => notifyMut.mutate()} loading={notifyMut.isPending} className="flex-1 text-xs">
            🔔 নোটিফাই করুন
          </Button>
          <Button variant="ghost" onClick={() => deleteMut.mutate()} loading={deleteMut.isPending}
            className="text-red-500 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs">
            🗑️ মুছুন
          </Button>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">👥 সাবস্ক্রিপশন</div>
        <div className="flex gap-2">
          {(["PENDING", "CONFIRMED", "REJECTED"] as const).map((s) => (
            <button key={s} onClick={() => setSubTab(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                ${subTab === s ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
              {SUB_LABELS[s]}
            </button>
          ))}
        </div>

        {subsLoading ? (
          <PageLoader />
        ) : subs.length === 0 ? (
          <EmptyState icon="👥" title="কোনো সাবস্ক্রিপশন নেই" />
        ) : (
          <div className="space-y-2">
            {subs.map((sub: any) => (
              <div key={sub.id} className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                  {sub.customer?.image ? (
                    <img src={sub.customer.image} className="w-9 h-9 rounded-full object-cover" alt="" />
                  ) : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 dark:text-white text-sm font-semibold truncate">
                    {sub.customer?.name || "Customer"}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">{sub.customer?.mobile || ""}</div>
                  {sub.note && <div className="text-slate-400 text-[11px] italic">"{sub.note}"</div>}
                  <div className="text-slate-400 text-[11px]">
                    {new Date(sub.joinedAt).toLocaleDateString("bn-BD")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SUB_STATUS_COLORS[sub.status] || ""}`}>
                    {SUB_LABELS[sub.status] || sub.status}
                  </span>
                  {sub.status === "PENDING" && (
                    <div className="flex gap-1.5 mt-1">
                      <button onClick={() => reviewMut.mutate({ subId: sub.id, status: "CONFIRMED" })}
                        disabled={reviewMut.isPending}
                        className="text-[10px] px-2 py-1 rounded-lg bg-teal-600 text-white font-semibold disabled:opacity-50">
                        ✓ অনুমোদন
                      </button>
                      <button onClick={() => reviewMut.mutate({ subId: sub.id, status: "REJECTED" })}
                        disabled={reviewMut.isPending}
                        className="text-[10px] px-2 py-1 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50">
                        ✕ প্রত্যাখ্যান
                      </button>
                    </div>
                  )}
                  {sub.reviewNote && (
                    <div className="text-[10px] text-slate-400 italic max-w-[120px] truncate">📝 {sub.reviewNote}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
