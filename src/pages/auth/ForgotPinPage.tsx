import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { getApiError } from "../../utils/helpers";
import { Input, Button, PinInput } from "../../components/shared";
import type { TRole } from "../../types";

type TStep = "mobile" | "otp" | "pin";
type TPageRole = "shopkeeper" | "customer";

const STEPS: TStep[] = ["mobile", "otp", "pin"];

export default function ForgotPinPage() {
  const [step, setStep] = useState<TStep>("mobile");
  const [role, setRole] = useState<TPageRole>("shopkeeper");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const stepIdx = STEPS.indexOf(step);

  const goStep = (s: TStep) => {
    setError("");
    setStep(s);
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const forgotMut = useMutation({
    mutationFn: () => authApi.forgotPin(mobile),
    onSuccess: () => goStep("otp"),
    onError: (e) => setError(getApiError(e)),
  });

  const otpMut = useMutation({
    mutationFn: () => authApi.verifyOtp({ mobile, otp, purpose: "RESET_PIN" }),
    onSuccess: ({ data }: any) => {
      setTempToken(data.data.tempToken);
      goStep("pin");
    },
    onError: (e) => setError(getApiError(e)),
  });

  const pinMut = useMutation({
    mutationFn: () => authApi.setPin({ mobile, pin, token: tempToken }),
    onSuccess: ({ data }: any) => {
      const d = data.data;
      login(d.accessToken, d.role as TRole, d.shopId);
      navigate(
        d.role === "SHOPKEEPER" || d.role === "STAFF"
          ? "/shopkeeper"
          : "/customer",
      );
    },
    onError: (e) => setError(getApiError(e)),
  });

  // ── Shared error block ──────────────────────────────────────────────────────
  const ErrorBox = () =>
    error ? (
      <div className="text-red-600 dark:text-red-400 text-xs bg-red-100 dark:bg-red-950/50 rounded-lg px-3 py-2">
        {error}
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 flex flex-col items-center justify-center p-6">
      {/* ── Logo ── */}
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">📒</div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          HisabKhata
        </h1>
        <p className="text-teal-600 dark:text-teal-400 text-xs mt-0.5">
          হিসাবখাতা
        </p>
      </div>

      <div className="w-full max-w-sm">
        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${
                    step === s
                      ? "bg-teal-600 text-white scale-110"
                      : stepIdx > i
                        ? "bg-teal-800 text-teal-300"
                        : "bg-gray-200 dark:bg-slate-800 text-slate-500"
                  }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 h-px transition-colors ${stepIdx > i ? "bg-teal-600" : "bg-gray-300 dark:bg-slate-700"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Card ── */}
        <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 animate-slide-up shadow-xl dark:shadow-none">
          {/* ════ STEP 1 — mobile ════ */}
          {step === "mobile" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-1">
                  🔑 PIN ভুলে গেছেন?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  আপনার মোবাইল নম্বর দিন, OTP পাঠানো হবে
                </p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    {
                      r: "shopkeeper" as TPageRole,
                      icon: "🏪",
                      label: "দোকানদার",
                    },
                    {
                      r: "customer" as TPageRole,
                      icon: "👤",
                      label: "Customer",
                    },
                  ] as const
                ).map(({ r, icon, label }) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl text-center transition-all
                      ${
                        role === r
                          ? "bg-teal-600 text-white"
                          : "border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                      }`}
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-sm font-bold">{label}</div>
                  </button>
                ))}
              </div>

              <Input
                label="মোবাইল নম্বর"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                type="tel"
                placeholder="01XXXXXXXXX"
              />

              <ErrorBox />

              <Button
                onClick={() => {
                  setError("");
                  forgotMut.mutate();
                }}
                loading={forgotMut.isPending}
                disabled={!mobile.trim() || forgotMut.isPending}
                className="w-full"
              >
                OTP পান →
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-slate-500 text-xs hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  মনে পড়ে গেছে? লগইন করুন
                </Link>
              </div>
            </div>
          )}

          {/* ════ STEP 2 — otp ════ */}
          {step === "otp" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-1">
                  OTP যাচাই করুন
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {mobile} এ OTP পাঠানো হয়েছে OTP -{" "}
                  {forgotMut?.data?.data?.message}
                </p>
              </div>

              {/* 6-digit OTP inputs */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    id={`forgot-otp-${i}`}
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/, "");
                      const a = otp.split("");
                      a[i] = v;
                      setOtp(a.join(""));
                      if (v && i < 5)
                        (
                          document.getElementById(
                            `forgot-otp-${i + 1}`,
                          ) as HTMLInputElement
                        )?.focus();
                    }}
                    className="w-12 h-14 bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-teal-500 rounded-xl text-center text-slate-900 dark:text-white text-xl font-mono font-bold outline-none transition-colors"
                  />
                ))}
              </div>

              <ErrorBox />

              <Button
                onClick={() => {
                  setError("");
                  otpMut.mutate();
                }}
                loading={otpMut.isPending}
                disabled={otp.length < 6 || otpMut.isPending}
                className="w-full"
              >
                যাচাই করুন ✓
              </Button>

              <p className="text-center text-slate-500 text-xs">
                OTP আসেনি?{" "}
                <button
                  onClick={() => {
                    setError("");
                    forgotMut.mutate();
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  পুনরায় পাঠান
                </button>
              </p>
            </div>
          )}

          {/* ════ STEP 3 — pin ════ */}
          {step === "pin" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-1">
                  নতুন PIN সেট করুন
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  ৪ সংখ্যার নতুন PIN বেছে নিন
                </p>
              </div>

              {pinConfirm === "" ? (
                <PinInput
                  value={pin}
                  onChange={(v) => {
                    setPin(v);
                    if (v.length === 4) setPinConfirm(" ");
                  }}
                  label="নতুন PIN দিন"
                />
              ) : (
                <PinInput
                  value={pinConfirm.trim()}
                  onChange={setPinConfirm}
                  label="PIN আবার দিন"
                />
              )}

              {pinConfirm.trim().length > 0 && pinConfirm.trim() !== pin && (
                <p className="text-red-600 dark:text-red-400 text-xs text-center">
                  PIN মিলছে না, আবার চেষ্টা করুন
                </p>
              )}

              <ErrorBox />

              <Button
                onClick={() => {
                  setError("");
                  pinMut.mutate();
                }}
                loading={pinMut.isPending}
                disabled={
                  pin.length < 4 ||
                  pinConfirm.trim() !== pin ||
                  pinMut.isPending
                }
                className="w-full"
              >
                PIN পরিবর্তন করুন ✓
              </Button>

              <p className="text-center text-amber-400 text-xs">
                ⚠️ PIN কাউকে বলবেন না
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
