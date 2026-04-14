import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifApi } from "../../api";
import { EmptyState, PageLoader } from "../../components/shared";
import { relativeTime } from "../../utils/helpers";
import type { TNotificationType } from "../../types";

const ICONS: Record<TNotificationType, string> = {
  NEW_BAKI: "📤",
  PAYMENT_RECEIVED: "📥",
  REMINDER_SENT: "💬",
  SHOP_VERIFIED: "✅",
  REFERRAL_REWARD: "🎁",
  SYSTEM: "ℹ️",
  NEW_CAMPAIGN_SUBSCRIPTION: "📢",
  CAMPAIGN_CONFIRMED: "✅",
  CAMPAIGN_REJECTED: "❌",
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.getAll({ limit: 30 }),
  });

  const markMut = useMutation({
    mutationFn: notifApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAllMut = useMutation({
    mutationFn: notifApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifs = (data?.data as any)?.data || [];
  const unread = (data?.data as any)?.unreadCount || 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
          🔔 নোটিফিকেশন
          {unread > 0 && (
            <span className="ml-1 bg-red-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            className="text-teal-600 dark:text-teal-400 text-xs hover:underline"
          >
            সব পড়েছি
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="কোনো নোটিফিকেশন নেই" />
      ) : (
        <div className="space-y-2">
          {notifs.map((n: any) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markMut.mutate(n.id)}
              className={`bg-white dark:bg-slate-800/60 border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all
                ${n.isRead ? "border-gray-200 dark:border-slate-700/30 opacity-70" : "border-gray-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-800"}`}
            >
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
              )}
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                {ICONS[n.type as TNotificationType] || "ℹ️"}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-semibold ${n.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
                >
                  {n.title}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-2">
                  {n.body}
                </div>
                <div className="text-slate-400 dark:text-slate-600 text-[11px] mt-1">
                  {relativeTime(n.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
