"use client";

/**
 * پیام وضعیت صفحه عمومی (تعلیق، در حال حذف، بسته و …)
 */
export default function PageStatusBanner({ message, canOrder = true }) {
  if (!message) return null;
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm leading-7 ${
        canOrder
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
