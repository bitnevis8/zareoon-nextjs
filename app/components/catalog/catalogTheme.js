/** پالت یکپارچه صفحه کاتالوگ — هم‌راستا با برند زارعون (سبز + خاکستری) */

export const catalogText = {
  heading: "text-slate-900",
  body: "text-slate-700",
  muted: "text-slate-500",
  subtle: "text-slate-400",
  accent: "text-green-700",
  accentStrong: "text-green-800",
  onAccent: "text-white",
};

export const catalogSurface = {
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  muted: "bg-slate-50",
  accent: "bg-green-50 border-green-200",
  price: "rounded-xl border border-green-100 bg-white",
  infoSection: "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80",
  orderSection: "overflow-hidden rounded-2xl border-2 border-green-300 bg-green-50 shadow-sm",
};

export const catalogSectionTitle = "px-4 py-3 text-sm font-bold text-slate-900 border-b border-slate-200 bg-white";
export const catalogOrderSectionTitle = "px-4 py-3 text-sm font-bold text-green-900 border-b border-green-200 bg-green-100/80";

export const catalogBadge = {
  neutral: "border border-slate-200 bg-slate-50 text-slate-700",
  success: "border border-green-200 bg-green-50 text-green-800",
  warning: "border border-amber-200 bg-amber-50 text-amber-800",
  danger: "border border-red-200 bg-red-50 text-red-700",
  info: "border border-slate-200 bg-white text-slate-600",
};

export const catalogBtn = {
  primary:
    "rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto",
  primaryBlock:
    "w-full rounded-xl bg-green-600 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
};

export const catalogInput =
  "rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100";

export function catalogStatusClass(status) {
  if (status === "harvested") return `${catalogBadge.success} ring-1 ring-green-100`;
  if (status === "reserved") return `${catalogBadge.warning} ring-1 ring-amber-100`;
  if (status === "sold") return `${catalogBadge.info} ring-1 ring-slate-100`;
  return `${catalogBadge.neutral} ring-1 ring-slate-100`;
}

export const catalogStockBadge = {
  "stock-empty": { badge: catalogBadge.danger, key: "stockEmpty" },
  "stock-low": { badge: catalogBadge.warning, key: "stockLow" },
  "stock-medium": { badge: catalogBadge.success, key: "stockMedium" },
  "stock-high": { badge: catalogBadge.success, key: "stockHigh" },
};

export const catalogAlert = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-amber-200 bg-amber-50 text-amber-900",
};
