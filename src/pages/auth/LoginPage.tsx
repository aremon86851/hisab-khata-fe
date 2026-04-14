import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { getApiError } from "../../utils/helpers";
import { Input, Button, PinInput } from "../../components/shared";
import type { TRole } from "../../types";

type TPageRole = "shopkeeper" | "customer" | "admin" | "staff";

const getStatusCode = (error: unknown): number => {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as { response?: { status?: number } };
    return e.response?.status ?? 0;
  }
  return 0;
};

export default function LoginPage() {
  const [pageRole, setPageRole] = useState<TPageRole | null>(null);
  const [mode, setMode] = useState<"pin" | "password">("pin");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSuccess = (data: any) => {
    const d = data.data.data;
    const perms = d.permissions ?? null;
    login(d.accessToken, d.role as TRole, d.shopId, undefined, perms);
    navigate(
      d.role === "SHOPKEEPER"
        ? "/shopkeeper"
        : d.role === "STAFF"
          ? "/staff/dashboard"
          : d.role === "CUSTOMER"
            ? "/customer"
            : "/admin",
    );
  };
  const onError = (e: unknown) => {
    const status = getStatusCode(e);
    if (pageRole === "staff") {
      if (status === 401) setError("মোবাইল নম্বর বা পিন ভুল।");
      else if (status === 403)
        setError("আপনার অ্যাকাউন্ট নিষ্ক্রিয়। দোকানদারের সাথে যোগাযোগ করুন।");
      else setError(getApiError(e));
    } else {
      setError(getApiError(e));
    }
  };

  const pinMut = useMutation({
    mutationFn: () => authApi.loginWithPin({ mobile, pin, role: pageRole! }),
    onSuccess,
    onError,
  });
  const staffMut = useMutation({
    mutationFn: () => authApi.loginWithPin({ mobile, pin, role: "staff" }),
    onSuccess,
    onError,
  });
  const passMut = useMutation({
    mutationFn: () => authApi.loginWithPassword({ mobile, password }),
    onSuccess,
    onError,
  });
  const admMut = useMutation({
    mutationFn: () => authApi.adminLogin({ email, password }),
    onSuccess,
    onError,
  });

  const loading = pinMut.isPending || passMut.isPending || admMut.isPending || staffMut.isPending;

  const handleLogin = () => {
    setError("");
    if (pageRole === "admin") {
      admMut.mutate();
      return;
    }
    if (pageRole === "staff") {
      staffMut.mutate();
      return;
    }
    if (mode === "pin") pinMut.mutate();
    else passMut.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center animate-bounce-in">
        <div className="text-7xl mb-3">📒</div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          HisabKhata
        </h1>
        <p className="text-teal-600 dark:text-teal-400 text-sm mt-1">
          হিসাবখাতা — Smart Baki Management
        </p>
      </div>

      {!pageRole ? (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mb-5">
            আপনি কে?
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              {
                r: "shopkeeper" as TPageRole,
                icon: "🏪",
                label: "দোকানদার",
                sub: "Shopkeeper",
              },
              {
                r: "customer" as TPageRole,
                icon: "👤",
                label: "Customer",
                sub: "ক্রেতা",
              },
            ].map(({ r, icon, label, sub }) => (
              <button
                key={r}
                onClick={() => setPageRole(r)}
                className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95 shadow-sm dark:shadow-none"
              >
                <div className="text-4xl mb-2">{icon}</div>
                <div className="text-slate-900 dark:text-white font-bold text-base">
                  {label}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {sub}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPageRole("staff")}
            className="w-full bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 hover:border-violet-500 rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95 shadow-sm dark:shadow-none mb-3 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">👷</span>
            <div className="text-left">
              <div className="text-slate-900 dark:text-white font-bold text-base">
                স্টাফ লগইন
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">
                Staff Login
              </div>
            </div>
          </button>
          <button
            onClick={() => setPageRole("admin")}
            className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs py-2 transition-colors"
          >
            🛡️ Admin Login
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm animate-slide-up">
          <button
            onClick={() => {
              setPageRole(null);
              setError("");
              setPin("");
            }}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mb-5 transition-colors"
          >
            ← পিছনে
          </button>
          <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-none">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">
                {pageRole === "shopkeeper"
                  ? "🏪"
                  : pageRole === "customer"
                    ? "👤"
                    : pageRole === "staff"
                      ? "👷"
                      : "🛡️"}
              </span>
              <div>
                <div className="text-slate-900 dark:text-white font-bold">
                  {pageRole === "shopkeeper"
                    ? "দোকানদার Login"
                    : pageRole === "customer"
                      ? "Customer Login"
                      : pageRole === "staff"
                        ? "স্টাফ লগইন"
                        : "Admin Login"}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">
                  আপনার তথ্য দিন
                </div>
              </div>
            </div>

            {pageRole === "admin" ? (
              <div className="space-y-3">
                <Input
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@hisabkhata.com"
                />
                <Input
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="মোবাইল নম্বর"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                />
                {pageRole === "shopkeeper" && (
                  <div className="flex gap-2 text-xs">
                    {(["pin", "password"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${mode === m ? "bg-teal-600 text-white" : "text-slate-500 dark:text-slate-400 border border-gray-300 dark:border-slate-700"}`}
                      >
                        {m === "pin" ? "PIN" : "Password"}
                      </button>
                    ))}
                  </div>
                )}
                {pageRole === "staff" || mode === "pin" ? (
                  <PinInput value={pin} onChange={setPin} label="PIN দিন" />
                ) : (
                  <Input
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                  />
                )}
              </div>
            )}

            {error && (
              <div className="mt-3 text-red-600 dark:text-red-400 text-xs bg-red-100 dark:bg-red-950/50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              onClick={handleLogin}
              loading={loading}
              className="mt-5 w-full"
              disabled={
                (mode === "pin" && pageRole !== "admin" && pin.length < 4) ||
                loading
              }
            >
              লগইন করুন →
            </Button>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2 text-center">
              {pageRole !== "admin" && pageRole !== "staff" && (
                <Link
                  to="/signup"
                  className="block text-teal-600 dark:text-teal-400 text-xs hover:underline"
                >
                  নতুন account? এখনই যোগ দিন →
                </Link>
              )}
              {pageRole !== "admin" && pageRole !== "staff" && (
                <button
                  onClick={() => navigate("/forgot-pin")}
                  className="text-slate-500 text-xs hover:text-slate-700 dark:hover:text-slate-300"
                >
                  PIN ভুলে গেছেন?
                </button>
              )}
              {pageRole === "staff" && (
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  PIN ভুলে গেলে আপনার দোকানদারের সাথে যোগাযোগ করুন।
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
