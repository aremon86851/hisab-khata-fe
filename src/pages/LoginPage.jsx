import { useState } from "react";
import { useApp } from "../context/AppContext";

function RoleCard({ icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-800/80 border border-slate-700 hover:border-brand-600 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95"
    >
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-white font-bold text-base">{label}</div>
      <div className="text-slate-400 text-xs mt-1">{sub}</div>
    </button>
  );
}

function CredentialForm({ role, state, onBack, onLogin }) {
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const fillDemo = () => {
    if (role === "shopkeeper") {
      setMobile("01711111111");
      setPin("0000");
    } else {
      setMobile("01912345678");
      setPin("1234");
    }
  };

  const submit = () => {
    setError("");
    if (role === "shopkeeper") {
      const sk = state.shopkeepers.find(
        (s) => s.mobile === mobile && s.pin === pin,
      );
      if (!sk) {
        setError("মোবাইল নম্বর বা PIN ভুল");
        return;
      }
      const shop = state.shops.find((s) => s.id === sk.shopId);
      onLogin({ type: "shopkeeper", shopkeeper: sk, shop });
    } else {
      const cust = state.customers.find(
        (c) => c.mobile === mobile && c.pin === pin,
      );
      if (!cust) {
        setError("মোবাইল নম্বর বা PIN ভুল");
        return;
      }
      onLogin({ type: "customer", customer: cust });
    }
  };

  return (
    <div className="animate-slide-up w-full max-w-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
      >
        ← পিছনে
      </button>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">
            {role === "shopkeeper" ? "🏪" : "👤"}
          </span>
          <div>
            <div className="text-white font-bold">
              {role === "shopkeeper" ? "দোকানদার Login" : "Customer Login"}
            </div>
            <div className="text-slate-400 text-xs">আপনার তথ্য দিন</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="01XXXXXXXXX"
            type="tel"
            className="w-full bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-4 py-3 text-white text-sm outline-none font-mono transition-colors"
          />
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••"
            type="password"
            maxLength={4}
            className="w-full bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-4 py-3 text-white text-sm outline-none font-mono tracking-widest transition-colors"
          />
        </div>

        {error && (
          <div className="mb-3 text-red-400 text-xs bg-red-950/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          লগইন করুন →
        </button>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center mb-2">
            Demo credentials
          </p>
          <button
            onClick={fillDemo}
            className="w-full text-xs text-brand-400 border border-brand-900 hover:border-brand-700 rounded-lg py-2 transition-colors"
          >
            {role === "shopkeeper"
              ? "🏪 রহিম স্টোর fill করুন"
              : "👤 সাবিনা আক্তার fill করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState("role");
  const [role, setRole] = useState(null);

  const pickRole = (r) => {
    setRole(r);
    setStep("credentials");
  };
  const login = (session) => dispatch({ type: "LOGIN", payload: session });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-slate-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center animate-bounce-in">
        <div className="text-7xl mb-3">📒</div>
        <h1 className="text-3xl font-extrabold text-white">HisabKhata</h1>
        <p className="text-brand-400 text-sm mt-1">
          হিসাবখাতা — Smart Baki Management
        </p>
      </div>

      {step === "role" ? (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-center text-slate-400 text-sm mb-5">আপনি কে?</p>
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              icon="🏪"
              label="দোকানদার"
              sub="Shopkeeper"
              onClick={() => pickRole("shopkeeper")}
            />
            <RoleCard
              icon="👤"
              label="Customer"
              sub="ক্রেতা"
              onClick={() => pickRole("customer")}
            />
          </div>
          <p className="text-center text-slate-700 text-xs mt-6">
            HisabKhata v1.0 Prototype
          </p>
        </div>
      ) : (
        <CredentialForm
          role={role}
          state={state}
          onBack={() => setStep("role")}
          onLogin={login}
        />
      )}
    </div>
  );
}
