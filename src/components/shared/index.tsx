import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import type { TTransactionType } from "../../types";
import { taka } from "../../utils/helpers";

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div
      className={`${s} border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Spinner size="lg" />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({
  msg,
  type,
  visible,
}: {
  msg: string;
  type: "success" | "error" | "info";
  visible: boolean;
}) {
  const bg = {
    success: "bg-teal-600",
    error: "bg-red-600",
    info: "bg-slate-700",
  }[type];
  const ic = { success: "✅", error: "❌", info: "ℹ️" }[type];
  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 pointer-events-none
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div
        className={`${bg} text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap`}
      >
        {ic} {msg}
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
const BCLS: Record<string, string> = {
  red: "border-l-red-500",
  teal: "border-l-teal-500",
  amber: "border-l-amber-500",
  green: "border-l-green-500",
  violet: "border-l-violet-500",
};
const TCLS: Record<string, string> = {
  red: "text-red-600 dark:text-red-400",
  teal: "text-teal-600 dark:text-teal-400",
  amber: "text-amber-600 dark:text-amber-400",
  green: "text-green-600 dark:text-green-400",
  violet: "text-violet-600 dark:text-violet-400",
};

export function StatCard({
  label,
  value,
  sub,
  color = "teal",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800/60 border-l-4 ${BCLS[color] || BCLS.teal} rounded-xl p-3 shadow-sm dark:shadow-none`}
    >
      <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">
        {label}
      </div>
      <div
        className={`font-mono text-2xl font-bold ${TCLS[color] || TCLS.teal}`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

// ── BakiChip ──────────────────────────────────────────────────────────────────
export function BakiChip({
  amount,
  showAmount = false,
}: {
  amount: number;
  showAmount?: boolean;
}) {
  const p = amount > 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
      ${p ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"}`}
    >
      {showAmount ? taka(amount) : p ? "বাকি" : "পরিশোধ ✓"}
    </span>
  );
}

// ── StarRating ────────────────────────────────────────────────────────────────
export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
}: {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`text-lg leading-none transition-transform
            ${interactive ? "cursor-pointer hover:scale-125" : "cursor-default"}
            ${i < Math.round(rating) ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── TransactionItem ───────────────────────────────────────────────────────────
export function TransactionItem({
  type,
  amount,
  note,
  date,
  shopName,
  shopEmoji,
}: {
  type: TTransactionType;
  amount: number;
  note: string | null;
  date: string;
  shopName?: string;
  shopEmoji?: string;
}) {
  const isBaki = type === "BAKI";
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${isBaki ? "bg-red-100 dark:bg-red-950/60" : "bg-teal-100 dark:bg-teal-950/60"}`}
      >
        {isBaki ? "📤" : "📥"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-900 dark:text-white text-sm font-semibold truncate">
          {note || (isBaki ? "বাকি" : "পরিশোধ")}
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-[11px]">
          {shopName && (
            <span>
              {shopEmoji} {shopName} ·{" "}
            </span>
          )}
          {date}
        </div>
      </div>
      <div
        className={`font-mono text-sm font-bold flex-shrink-0 ${isBaki ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-400"}`}
      >
        {isBaki ? "+" : "−"}
        {taka(amount)}
      </div>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
export function ProductCard({
  name,
  price,
  unit,
  emoji,
}: {
  name: string;
  price: number;
  unit: string;
  emoji: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 text-center hover:border-teal-500 dark:hover:border-teal-700 transition-colors">
      <div className="text-3xl mb-1.5">{emoji}</div>
      <div className="text-slate-900 dark:text-white text-xs font-bold leading-tight">
        {name}
      </div>
      <div className="text-teal-600 dark:text-teal-400 font-mono text-[11px] mt-1">
        ৳{price}/{unit}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-slate-900 dark:text-white font-bold text-base mb-1">
        {title}
      </div>
      {sub && (
        <div className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          {sub}
        </div>
      )}
      {action}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide block">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-colors placeholder:text-slate-400
        ${error ? "border-red-400 focus:border-red-400" : "border-gray-300 dark:border-slate-600 focus:border-teal-500"} ${className || ""}`}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
type BV = "primary" | "danger" | "ghost" | "green";
const BCS: Record<BV, string> = {
  primary: "bg-teal-600 hover:bg-teal-500 text-white",
  danger: "bg-red-600 hover:bg-red-500 text-white",
  ghost:
    "border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300 bg-transparent",
  green: "bg-green-600 hover:bg-green-500 text-white",
};
export function Button({
  variant = "primary",
  loading,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BV;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed ${BCS[variant]} ${className || ""}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 dark:bg-slate-950/70 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-t-2xl md:rounded-2xl w-full max-w-md p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-base">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── PinInput ──────────────────────────────────────────────────────────────────
export function PinInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const pad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "✓"];
  const press = (k: string) => {
    if (k === "←") onChange(value.slice(0, -1));
    else if (k === "✓") return;
    else if (value.length < 4) onChange(value + k);
  };
  return (
    <div className="space-y-4">
      {label && (
        <p className="text-center text-slate-300 font-semibold">{label}</p>
      )}
      <div className="flex justify-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all
            ${i < value.length ? "bg-teal-500 border-teal-400" : "border-gray-300 dark:border-slate-600"}`}
          >
            {i < value.length && (
              <div className="w-3 h-3 rounded-full bg-white" />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {pad.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`h-16 rounded-xl font-bold text-xl transition-all active:scale-90
              ${k === "←" ? "bg-gray-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : k === "✓" ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-900 hover:bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"}`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-slate-700 dark:text-slate-300 text-sm">
        {label}
      </span>
      <div
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative ${value ? "bg-teal-600" : "bg-gray-200 dark:bg-slate-700"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-7" : "left-1"}`}
        />
      </div>
    </label>
  );
}
