import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi, reminderApi } from "../../api";
import { PageLoader, Button, Modal } from "../../components/shared";
import { taka, relativeTime, getApiError } from "../../utils/helpers";

export default function RemindersPage() {
  const [showSend, setShowSend] = useState(false);
  const [custId, setCustId] = useState("");
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS" | "BOTH">(
    "WHATSAPP",
  );
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<any>(null);

  const qc = useQueryClient();

  const { data: cr } = useQuery({
    queryKey: ["shopCustomers"],
    queryFn: () => customerApi.getCustomers({ limit: 100, hasBalance: true }),
  });
  const { data: hr, isLoading } = useQuery({
    queryKey: ["reminderHistory"],
    queryFn: () => reminderApi.getHistory(),
  });
  const { data: sr } = useQuery({
    queryKey: ["reminderSettings"],
    queryFn: reminderApi.getSettings,
  });

  const sendMut = useMutation({
    mutationFn: () =>
      reminderApi.sendReminder({
        customerId: custId,
        channel,
        messageBody: msg || undefined,
      }),
    onSuccess: ({ data }: any) => {
      setSent(data.data);
      setErr("");
      qc.invalidateQueries({ queryKey: ["reminderHistory"] });
    },
    onError: (e) => setErr(getApiError(e)),
  });

  const customers = (cr?.data as any)?.data || [];
  const history = (hr?.data as any)?.data || [];
  const template = (sr?.data as any)?.data?.messageTemplate || "";

  const onCustChange = (id: string) => {
    setCustId(id);
    const c = customers.find((x: any) => x.id === id);
    if (c && template)
      setMsg(
        template
          .replace("{{name}}", c.name)
          .replace("{{amount}}", `৳${c.balance}`)
          .replace("{{shop}}", "আমাদের দোকান"),
      );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <button
        onClick={() => setShowSend(true)}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        💬 Payment Reminder পাঠান
      </button>

      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
          সাম্প্রতিক Reminder
        </div>
        {history.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            কোনো reminder পাঠানো হয়নি
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((r: any) => (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${r.status === "SENT" ? "bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400" : r.status === "FAILED" ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" : "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"}`}
                  >
                    {r.channel} · {r.status}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {relativeTime(r.createdAt)}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2">
                  {r.messageBody}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={showSend}
        onClose={() => {
          setShowSend(false);
          setSent(null);
          setErr("");
        }}
        title="Reminder পাঠান"
      >
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-slate-900 dark:text-white font-bold">
              Reminder তৈরি হয়েছে!
            </div>
            {sent.whatsappLink && (
              <a
                href={sent.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                💬 WhatsApp এ পাঠান →
              </a>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setSent(null);
                setShowSend(false);
              }}
              className="w-full"
            >
              বন্ধ করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                Customer
              </label>
              <select
                value={custId}
                onChange={(e) => onCustChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
              >
                <option value="">— বেছে নিন —</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {taka(c.balance)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {(["WHATSAPP", "SMS", "BOTH"] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${channel === ch ? "bg-teal-600 text-white border-teal-500" : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                >
                  {ch === "WHATSAPP"
                    ? "💬 WA"
                    : ch === "SMS"
                      ? "📱 SMS"
                      : "🔀 Both"}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                Message
              </label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={4}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm outline-none resize-none"
              />
            </div>
            {err && (
              <p className="text-red-600 dark:text-red-400 text-xs">{err}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowSend(false)}
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button
                onClick={() => sendMut.mutate()}
                loading={sendMut.isPending}
                disabled={!custId}
                className="flex-1"
              >
                পাঠান →
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
