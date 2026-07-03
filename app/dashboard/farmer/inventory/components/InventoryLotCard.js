"use client";

import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import { localizeStatus } from "@/app/utils/localize";
import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";

function ActionBtn({ onClick, className, children, ariaLabel }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={`${inv.btnGhost} ${className}`}>
      {children}
    </button>
  );
}

export default function InventoryLotCard({
  lot,
  productName,
  farmerName,
  t,
  onView,
  onEdit,
  onMedia,
  onDelete,
}) {
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));

  return (
    <article className={`${inv.card} transition hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">#{lot.id}</span>
            <span className={gradeBadgeClass()}>{lot.qualityGrade}</span>
            <span className={statusBadgeClass(lot.status)}>{localizeStatus(lot.status, t)}</span>
          </div>
          <h3 className="truncate text-base font-bold text-slate-900">{productName}</h3>
          {farmerName ? <p className="mt-0.5 text-xs text-slate-500">تامین‌کننده: {farmerName}</p> : null}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <ActionBtn onClick={() => onView(lot)} className={inv.btnView} ariaLabel="مشاهده">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </ActionBtn>
          <ActionBtn onClick={() => onEdit(lot)} className={inv.btnEdit} ariaLabel="ویرایش">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </ActionBtn>
          <ActionBtn onClick={() => onMedia(lot)} className={inv.btnMedia} ariaLabel="رسانه">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(lot.id)} className={inv.btnDanger} ariaLabel="حذف">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </ActionBtn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        <div className="bg-white p-3">
          <p className="text-[10px] font-medium text-slate-500">کل موجودی</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {parseFloat(lot.totalQuantity || 0).toLocaleString("fa-IR")} <span className="text-xs font-normal text-slate-500">{lot.unit}</span>
          </p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-medium text-slate-500">قابل عرضه</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-700">
            {available.toLocaleString("fa-IR")} <span className="text-xs font-normal text-slate-500">{lot.unit}</span>
          </p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-medium text-slate-500">قیمت</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {lot.tieredPricing?.length > 0 ? (
              <span className="text-sky-700">پلکانی</span>
            ) : lot.price ? (
              <>{parseFloat(lot.price).toLocaleString("fa-IR")} <span className="text-xs font-normal">تومان</span></>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-medium text-slate-500">حداقل سفارش</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {lot.minimumOrderQuantity ? (
              <>{lot.minimumOrderQuantity} {lot.unit}</>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </p>
        </div>
      </div>

      {lot.tieredPricing?.length > 0 ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
        </div>
      ) : null}

      {lot.attributes?.length > 0 ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">مشخصات</p>
          <div className="flex flex-wrap gap-1.5">
            {lot.attributes.map((a) => (
              <span key={a.id} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {a.definition?.name}: <strong>{a.value}</strong>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
