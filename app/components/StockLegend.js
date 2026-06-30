import { STOCK_LEGEND } from '../utils/stockUtils';

export default function StockLegend({ className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-right ${className}`}
      role="note"
      aria-label="راهنمای رنگ موجودی"
    >
      <p className="text-xs font-medium text-slate-600 mb-2">
        رنگ کارت‌ها بر اساس میزان موجودی (کیلوگرم) است:
      </p>
      <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
        {STOCK_LEGEND.map((item) => (
          <div
            key={item.className}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${item.className}`}
          >
            <span className="font-medium">{item.label}</span>
            <span className="opacity-80">({item.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
