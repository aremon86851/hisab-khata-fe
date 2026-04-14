import { useOutletContext } from "react-router-dom";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../api";
import { StatCard } from "../../components/shared";
import { taka, repLabel } from "../../utils/helpers";
import FraudStatusSection from "../shopkeeper/FraudStatusSection";

export default function ProfilePage() {
  const { profile } = useOutletContext<{ profile: any }>();
  const qc = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageErr, setImageErr] = useState("");

  const uploadMut = useMutation({
    mutationFn: (fd: FormData) => customerApi.uploadMyImage(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      setImageErr("");
    },
    onError: (e: any) => {
      const status = e?.response?.status;
      if (status === 403) {
        setImageErr("আপনার বিরুদ্ধে সত্যায়িত প্রতারণা রিপোর্ট থাকায় স্নাতক পরিবর্তন করা যাচ্ছে না।");
      } else {
        setImageErr("স্নাতক আপুডেট হয়নি। আবার চেষ্টা করুন।");
      }
    },
  });

  const handleImageSelect = (file: File) => {
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    uploadMut.mutate(fd, { onSettled: () => setImageUploading(false) });
  };

  if (!profile) return null;

  const shops = profile.shops || [];
  const score = parseFloat(profile.repScore || "3");
  const rep = repLabel(score);
  const shopsWithBaki = shops.filter((s: any) => s.balance > 0).length;
  const ratings = shops.map((s: any) => s.shopRating);
  const avgRating = ratings.length
    ? (
        ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      ).toFixed(1)
    : "—";
  const totalBaki = shops.reduce((s: number, sh: any) => s + sh.balance, 0);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-slate-100 to-teal-50 dark:from-slate-800 dark:to-teal-950 border border-teal-200 dark:border-teal-900/40 rounded-2xl p-5 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
            {profile.image ? (
              <img src={profile.image} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.name?.charAt(0)
            )}
          </div>
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow text-white"
          >
            {imageUploading ? (
              <span className="text-[10px]">...</span>
            ) : (
              <span className="text-sm">📷</span>
            )}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
          />
        </div>
        {imageErr && (
          <p className="text-xs text-red-500 mb-2 px-4">{imageErr}</p>
        )}
        <div className="text-slate-900 dark:text-white text-xl font-extrabold">
          {profile.name}
        </div>
        <div className="text-teal-400 font-mono text-sm mt-1">
          {profile.mobile}
        </div>
        <div className="mt-4 bg-white/70 dark:bg-slate-950/50 rounded-xl px-4 py-4 inline-block">
          <div className="flex justify-center mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`text-xl ${s <= Math.round(score) ? "text-amber-400" : "text-gray-300 dark:text-slate-700"}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className={`font-mono text-3xl font-extrabold ${rep.color}`}>
            {profile.repScore}
          </div>
          <div className={`text-sm font-bold ${rep.color} mt-0.5`}>
            {rep.label}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="দোকান" value={shops.length} color="teal" />
        <StatCard label="বাকি আছে" value={shopsWithBaki} color="amber" />
        <StatCard label="Avg ★" value={avgRating} color="green" />
      </div>

      {/* Reputation breakdown */}
      <div className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
          Reputation কীভাবে হিসাব হয়?
        </div>
        {[
          {
            label: "দোকানদারের Rating (গড়)",
            value: avgRating,
            positive: parseFloat(String(avgRating)) >= 3.5,
          },
          {
            label: "বাকি আছে এমন দোকান",
            value: shopsWithBaki + "টি",
            positive: shopsWithBaki === 0,
          },
          {
            label: "মোট বকেয়া",
            value: taka(totalBaki),
            positive: totalBaki === 0,
          },
          {
            label: "Final Score",
            value: profile.repScore + "/5",
            positive: score >= 3.5,
          },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">
              {r.label}
            </span>
            <span
              className={`font-mono font-bold ${r.positive ? "text-teal-400" : "text-amber-400"}`}
            >
              {r.value}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-200 dark:border-slate-700 text-xs text-slate-500">
          💡 টিপস: বাকি দ্রুত পরিশোধ করলে score বাড়বে!
        </div>
      </div>

      <FraudStatusSection reports={profile?.fraudReports || []} />
    </div>
  );
}
