"use client";

import { inv } from "../inventoryTheme";

export default function TieredPricingEditor({ tiers, unit, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">برای خرید عمده تخفیف تعریف کنید</p>
        <button type="button" onClick={onAdd} className={`${inv.btnSecondary} text-emerald-700`}>
          + سطح جدید
        </button>
      </div>
      {tiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
          سطح قیمتی تعریف نشده
        </div>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">سطح {index + 1}</span>
                <button type="button" onClick={() => onRemove(index)} className="text-xs font-medium text-rose-600 hover:text-rose-800">
                  حذف
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">حداقل</label>
                  <input type="number" className={inv.input} value={tier.minQuantity} onChange={(e) => onUpdate(index, "minQuantity", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">حداکثر</label>
                  <input type="number" className={inv.input} placeholder="∞" value={tier.maxQuantity} onChange={(e) => onUpdate(index, "maxQuantity", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">قیمت / {unit || "واحد"}</label>
                  <input type="number" className={inv.input} value={tier.pricePerUnit} onChange={(e) => onUpdate(index, "pricePerUnit", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-slate-500">توضیح</label>
                  <input type="text" className={inv.input} value={tier.description} onChange={(e) => onUpdate(index, "description", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
