import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopApi, reminderApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { getApiError } from "../../utils/helpers";
import {
  ChevronRight,
  Camera,
  ShieldCheck,
  Bell,
  CreditCard,
  BarChart2,
  MessageSquare,
  Smartphone,
  Trash2,
  Lock,
  Settings,
} from "lucide-react";

export default function SettingsPage() {
  const { shop } = useOutletContext<{ shop: any }>();
  const qc = useQueryClient();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [shopName, setShopName] = useState(shop?.name || "");
  const [ownerName, setOwnerName] = useState(shop?.ownerName || "");
  const [address, setAddress] = useState(shop?.address || "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  // Edit modal state
  const [editField, setEditField] = useState<
    null | "shopName" | "ownerName" | "address"
  >(null);
  const [editValue, setEditValue] = useState("");

  const { data: sr } = useQuery({
    queryKey: ["reminderSettings"],
    queryFn: reminderApi.getSettings,
  });
  const settings = (sr?.data as any)?.data;

  const [autoRemind, setAutoRemind] = useState(
    settings?.autoRemindEnabled ?? false,
  );
  const [daysAfter, setDaysAfter] = useState(settings?.daysAfterBaki ?? 15);
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS" | "BOTH">(
    settings?.channel ?? "BOTH",
  );
  const [template, setTemplate] = useState(settings?.messageTemplate ?? "");
  const [newBakiAlert, setNewBakiAlert] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const shopMut = useMutation({
    mutationFn: () =>
      shopApi.updateShop({ name: shopName, ownerName, address }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myShop"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e) => setErr(getApiError(e)),
  });

  const settMut = useMutation({
    mutationFn: () =>
      reminderApi.updateSettings({
        autoRemindEnabled: autoRemind,
        daysAfterBaki: Number(daysAfter),
        channel,
        messageTemplate: template,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminderSettings"] }),
  });

  const verificationStatus = shop?.verification?.status || "UNSUBMITTED";

  // ── Edit Modal ──
  const EditModal = () => {
    if (!editField) return null;

    const labels = {
      shopName: "দোকানের নাম (Shop Name)",
      ownerName: "মালিকের নাম (Owner Name)",
      address: "ঠিকানা (Address)",
    };

    const handleSave = () => {
      if (editField === "shopName") setShopName(editValue);
      if (editField === "ownerName") setOwnerName(editValue);
      if (editField === "address") setAddress(editValue);
      shopMut.mutate();
      setEditField(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-slate-950/80 z-50 flex items-end">
        <div className="bg-white dark:bg-slate-800 w-full rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-white">
              {labels[editField]}
            </h3>
            <button
              onClick={() => setEditField(null)}
              className="text-gray-400 dark:text-slate-500 text-xl"
            >
              ✕
            </button>
          </div>
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
            placeholder={labels[editField]}
          />
          <button
            onClick={handleSave}
            disabled={shopMut.isPending}
            className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
          >
            {shopMut.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-4 py-4 flex items-center gap-3 border-b border-gray-100 dark:border-slate-700">
        <button
          onClick={() => window.history.back()}
          className="text-gray-600 dark:text-gray-300"
        >
          <ChevronRight className="rotate-180 w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-white text-lg">
              সেটিংস
            </span>
          </div>
        </div>
      </div>

      {err && (
        <div className="mx-4 mt-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          {err}
        </div>
      )}
      {saved && (
        <div className="mx-4 mt-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-sm px-4 py-3 rounded-xl">
          ✅ সংরক্ষিত!
        </div>
      )}

      <div className="px-4 pt-5 space-y-6">
        {/* ── Appearance / Theme ── */}
        <section>
          <h2 className="text-teal-600 font-bold text-base mb-3">
            থিম{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              (Appearance)
            </span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {isDark ? "ডার্ক মোড" : "লাইট মোড"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Dark / Light Mode
                  </p>
                </div>
              </div>
              <ToggleSwitch value={isDark} onChange={() => toggleTheme()} />
            </div>
          </div>
        </section>

        {/* ── Shop Info ── */}
        <section>
          <h2 className="text-teal-600 font-bold text-base mb-3">
            দোকানের তথ্য{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              (Shop Info)
            </span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Shop image */}
            <div className="flex flex-col items-center py-6 border-b border-gray-100 dark:border-slate-700">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center overflow-hidden">
                  {shop?.image ? (
                    <img
                      src={shop.image}
                      alt="shop"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🏪</span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                দোকানের ছবি পরিবর্তন করুন
              </p>
            </div>

            {/* Shop name */}
            <button
              className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700"
              onClick={() => {
                setEditField("shopName");
                setEditValue(shopName);
              }}
            >
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  দোকানের নাম (Shop Name)
                </p>
                <p className="text-gray-800 dark:text-white font-medium mt-0.5">
                  {shopName || "—"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Owner name */}
            <button
              className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700"
              onClick={() => {
                setEditField("ownerName");
                setEditValue(ownerName);
              }}
            >
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  মালিকের নাম (Owner Name)
                </p>
                <p className="text-gray-800 dark:text-white font-medium mt-0.5">
                  {ownerName || "—"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Address */}
            <button
              className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700"
              onClick={() => {
                setEditField("address");
                setEditValue(address);
              }}
            >
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  ঠিকানা (Address)
                </p>
                <p className="text-gray-800 dark:text-white font-medium mt-0.5">
                  {address || "—"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Verification */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    ভেরিফিকেশন স্ট্যাটাস
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {verificationStatus === "VERIFIED"
                      ? "যাচাইকৃত"
                      : verificationStatus === "PENDING"
                        ? "পর্যালোচনাধীন"
                        : verificationStatus === "REJECTED"
                          ? "প্রত্যাখ্যাত"
                          : "অসম্পূর্ণ - এখনই সম্পন্ন করুন"}
                  </p>
                </div>
              </div>
              <Link to="/shopkeeper/verification">
                <button className="bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  যাচাই করুন
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section>
          <h2 className="text-teal-600 font-bold text-base mb-3">
            নোটিফিকেশন{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              (Notifications)
            </span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  নতুন বাকি এলার্ট
                </span>
              </div>
              <ToggleSwitch value={newBakiAlert} onChange={setNewBakiAlert} />
            </div>

            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  পেমেন্ট এলার্ট
                </span>
              </div>
              <ToggleSwitch value={paymentAlert} onChange={setPaymentAlert} />
            </div>

            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  দৈনিক সারসংক্ষেপ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  রাত ০৯:০০
                </span>
                <ToggleSwitch value={dailySummary} onChange={setDailySummary} />
              </div>
            </div>

            {/* Days slider */}
            <div className="px-4 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  আটো রিমাইন্ডার পাঠান (দিন)
                </span>
                <span className="text-sm font-bold text-teal-600">
                  {daysAfter} দিন পর
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                value={daysAfter}
                onChange={(e) => setDaysAfter(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
                <span>৩ দিন</span>
                <span>১৫ দিন</span>
                <span>৩০ দিন</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reminder Template ── */}
        <section>
          <h2 className="text-teal-600 font-bold text-base mb-3">
            রিমাইন্ডার টেমপ্লেট{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              (Reminder)
            </span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-4">
            <div className="relative border border-gray-200 dark:border-slate-600 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">
                টেমপ্লেট এডিট করুন
              </p>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
                className="w-full text-sm text-gray-700 dark:text-slate-200 outline-none resize-none bg-transparent"
                placeholder="আপনার মেসেজ টেমপ্লেট লিখুন..."
              />
              <div className="absolute top-3 right-3 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>

            <button
              onClick={() => setTemplate(settings?.messageTemplate ?? "")}
              className="text-teal-500 text-sm font-medium text-right w-full"
            >
              রিসেট করুন (Reset Default)
            </button>

            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                কোথায় পাঠাতে চান?
              </p>
              <div className="flex gap-3">
                {(
                  [
                    {
                      key: "BOTH",
                      label: "উভয় (Both)",
                      icon: <MessageSquare className="w-5 h-5" />,
                    },
                    {
                      key: "SMS",
                      label: "SMS",
                      icon: <Smartphone className="w-5 h-5" />,
                    },
                    {
                      key: "WHATSAPP",
                      label: "WhatsApp",
                      icon: <MessageSquare className="w-5 h-5" />,
                    },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => setChannel(ch.key)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all
                      ${
                        channel === ch.key
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400"
                          : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
                      }`}
                  >
                    {ch.icon}
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => settMut.mutate()}
              disabled={settMut.isPending}
              className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
            >
              {settMut.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>
          </div>
        </section>

        {/* ── Security ── */}
        <section>
          <h2 className="text-teal-600 font-bold text-base mb-3">
            নিরাপত্তা{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              (Security)
            </span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
            <button className="w-full px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  পিন পরিবর্তন করুন (Change PIN)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </button>

            <div className="px-4 py-4 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-slate-200">
                    টু-স্টেপ লগইন (Two-step Login)
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    শীঘ্রই আসছে (Coming Soon)
                  </p>
                </div>
              </div>
              <ToggleSwitch value={false} onChange={() => {}} />
            </div>
          </div>
        </section>

        {/* ── Delete Account ── */}
        <button className="w-full py-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span className="text-red-500 dark:text-red-400 font-bold text-sm">
            আকাউন্ট মুছে ফেলুন (Delete Account)
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border border-red-300 dark:border-red-800 text-red-400 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          লগআউট
        </button>

        <p className="text-center text-xs text-gray-300 dark:text-slate-600 pb-2">
          HisabKhata v2.4.0 · ৳ Digital Ledger
        </p>
      </div>

      {/* Edit Modal */}
      <EditModal />
    </div>
  );
}

// ── Toggle component ──
function ToggleSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? "bg-teal-500" : "bg-gray-200 dark:bg-slate-600"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? "left-7" : "left-1"}`}
      />
    </button>
  );
}
