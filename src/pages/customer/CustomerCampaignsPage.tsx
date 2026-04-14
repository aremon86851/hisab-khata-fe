import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../../api";
import { PageLoader, EmptyState } from "../../components/shared";
import { taka, getApiError } from "../../utils/helpers";
import type { TCampaignType } from "../../types";

const TABS = [
  { key: "browse", label: "📢 অফার সমূহ" },
  { key: "my", label: "📋 আমার সাবস্ক্রিপশন" },
] as const;

const TYPE_EMOJIS: Record<TCampaignType, string> = {
  MONTHLY_PACKAGE: "📦",
  DISCOUNT: "🏷️",
  CUSTOM: "✏️",
  CATALOG: "📋",
};

const SUB_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  CONFIRMED: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
  REJECTED: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

const SUB_LABELS: Record<string, string> = {
  PENDING: "অপেক্ষমান",
  CONFIRMED: "নিশ্চিত",
  REJECTED: "প্রত্যাখ্যাত",
};

export default function CustomerCampaignsPage() {
  const { profile } = useOutletContext<{ profile: any }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"browse" | "my">("browse");
  const [toast, setToast] = useState("");

  const shops = profile?.shops || [];
  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.shopId || "");
    console.log(shops)
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const { data: browseR, isLoading: browseLoading } = useQuery({
    queryKey: ["campaignsBrowse", selectedShopId],
    queryFn: () => campaignApi.browseShop(selectedShopId),
    enabled: tab === "browse" && !!selectedShopId,
  });

  const { data: myR, isLoading: myLoading } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => campaignApi.mySubscriptions(),
    enabled: tab === "my",
  });

  const subscribeMut = useMutation({
    mutationFn: (campaignId: string) => campaignApi.subscribe(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaignsBrowse"] });
      qc.invalidateQueries({ queryKey: ["mySubscriptions"] });
      showToast("✅ সাবস্ক্রিপশন সফল!");
    },
    onError: (e) => showToast("❌ " + getApiError(e)),
  });

  const cancelMut = useMutation({
    mutationFn: (campaignId: string) => campaignApi.cancelSubscription(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mySubscriptions"] });
      showToast("✅ সাবস্ক্রিপশন বাতিল হয়েছে");
    },
    onError: (e) => showToast("❌ " + getApiError(e)),
  });

  const browseCampaigns = (browseR?.data as any)?.data || [];
  const mySubs = (myR?.data as any)?.data || [];

  const renderSummary = (camp: any) => {
    if (camp.discountType && camp.discountValue) {
      return camp.discountType === "PERCENTAGE"
        ? `${camp.discountValue}% ছাড়`
        : `৳${camp.discountValue} Flat ছাড়`;
    }
    if (camp.items?.length) return `${camp.items.length}টি আইটেম`;
    return null;
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${toast.startsWith("✅") ? "bg-teal-600" : "bg-red-600"}`}>
          {toast}
        </div>
      )}

      <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">📢 ক্যাম্পেইন</div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all
              ${tab === t.key ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Browse tab */}
      {tab === "browse" && (
        <div className="space-y-3">
          {/* Shop selector */}
          {shops.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {shops.map((s: any) => (
                <button key={s.id} onClick={() => setSelectedShopId(s.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                    ${selectedShopId === s.id ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {s.emoji || "🏪"} {s.name || "দোকান"}
                </button>
              ))}
            </div>
          )}

          {!selectedShopId ? (
            <EmptyState icon="🏪" title="কোনো দোকান নেই" />
          ) : browseLoading ? <PageLoader /> :
          browseCampaigns.length === 0 ? (
            <EmptyState icon="📢" title="কোনো চলমান ক্যাম্পেইন নেই" />
          ) : (
            <div className="space-y-3">
              {browseCampaigns.map((c: any) => (
                <div key={c.id} className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{TYPE_EMOJIS[c.type as TCampaignType] || "📢"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 dark:text-white text-sm font-bold">{c.title}</div>
                      {c.description && (
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{c.description}</div>
                      )}
                    </div>
                  </div>

                  {/* Discount or items summary */}
                  {renderSummary(c) && (
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 text-sm text-teal-700 dark:text-teal-300 font-semibold">
                      {renderSummary(c)}
                    </div>
                  )}

                  {/* Item list */}
                  {c.items?.length > 0 && (
                    <div className="space-y-1">
                      {c.items.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                          <span>{item.name} ({item.quantity} {item.unit})</span>
                          <span className="font-mono">{taka(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-slate-400 text-[11px]">
                    📅 {new Date(c.startDate).toLocaleDateString("bn-BD")} — {new Date(c.endDate).toLocaleDateString("bn-BD")}
                  </div>
                  <button onClick={() => subscribeMut.mutate(c.id)} disabled={subscribeMut.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                    {subscribeMut.isPending ? "সাবস্ক্রাইব হচ্ছে..." : "📩 সাবস্ক্রাইব করুন"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Subscriptions tab */}
      {tab === "my" && (
        myLoading ? <PageLoader /> :
        mySubs.length === 0 ? (
          <EmptyState icon="📋" title="কোনো সাবস্ক্রিপশন নেই" />
        ) : (
          <div className="space-y-2">
            {mySubs.map((sub: any) => (
              <div key={sub.id} className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{TYPE_EMOJIS[sub.campaign?.type as TCampaignType] || "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 dark:text-white text-sm font-semibold truncate">
                      {sub.campaign?.title || "Campaign"}
                    </div>
                    {sub.campaign?.shop && (
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {sub.campaign.shop.emoji} {sub.campaign.shop.name}
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">
                      {new Date(sub.joinedAt).toLocaleDateString("bn-BD")}
                    </div>
                    {sub.reviewNote && (
                      <div className="text-[11px] text-slate-400 italic">📝 {sub.reviewNote}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SUB_STATUS_COLORS[sub.status] || ""}`}>
                      {SUB_LABELS[sub.status] || sub.status}
                    </span>
                    {sub.status === "PENDING" && (
                      <button onClick={() => cancelMut.mutate(sub.campaignId)}
                        disabled={cancelMut.isPending}
                        className="text-[10px] px-2 py-1 rounded-lg border border-red-300 dark:border-red-800 text-red-500 font-semibold mt-1 disabled:opacity-50">
                        বাতিল
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
