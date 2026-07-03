"use client";

import { inv } from "../inventoryTheme";

export default function InventoryStats({ items, t }) {
  const totalQty = items.reduce((s, x) => s + parseFloat(x.totalQuantity || 0), 0);
  const reservedQty = items.reduce((s, x) => s + parseFloat(x.reservedQuantity || 0), 0);
  const availableQty = Math.max(0, totalQty - reservedQty);
  const activeCount = items.filter((x) => x.status === "harvested" || x.status === "on_field").length;

  const stats = [
    { label: "تعداد بارها", value: items.length.toLocaleString("fa-IR"), tone: "text-slate-900" },
    { label: "موجودی فعال", value: activeCount.toLocaleString("fa-IR"), tone: "text-emerald-700" },
    { label: "قابل عرضه", value: availableQty.toLocaleString("fa-IR"), tone: "text-sky-700" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className={inv.statCard}>
          <p className="text-[10px] font-medium text-slate-500 sm:text-xs">{s.label}</p>
          <p className={`mt-1 text-lg font-bold sm:text-2xl ${s.tone}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
