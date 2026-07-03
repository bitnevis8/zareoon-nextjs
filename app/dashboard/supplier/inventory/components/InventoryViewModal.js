"use client";

import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";
import { localizeStatus } from "@/app/utils/localize";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-left text-sm font-semibold text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

export default function InventoryViewModal({ lot, productName, farmerName, t, onClose, onEdit, onMedia }) {
  if (!lot) return null;
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));

  return (
    <div className={inv.overlay} onClick={onClose}>
      <div className={inv.modal} onClick={(e) => e.stopPropagation()}>
        <div className={inv.modalHeader}>
          <div>
            <p className="text-xs text-slate-500">بار #{lot.id}</p>
            <h2 className="text-lg font-bold text-slate-900">{productName}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={inv.modalBody}>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={gradeBadgeClass()}>{lot.qualityGrade}</span>
            <span className={statusBadgeClass(lot.status)}>{localizeStatus(lot.status, t)}</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4">
            <Row label="تامین‌کننده" value={farmerName} />
            <Row label="واحد" value={lot.unit} />
            <Row label="کل موجودی" value={`${parseFloat(lot.totalQuantity || 0).toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row label="رزرو شده" value={`${parseFloat(lot.reservedQuantity || 0).toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row label="قابل عرضه" value={`${available.toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row
              label="قیمت"
              value={
                lot.tieredPricing?.length > 0
                  ? "قیمت پلکانی"
                  : lot.price
                    ? `${parseFloat(lot.price).toLocaleString("fa-IR")} تومان`
                    : "—"
              }
            />
            <Row
              label="حداقل سفارش"
              value={lot.minimumOrderQuantity ? `${lot.minimumOrderQuantity} ${lot.unit}` : "—"}
            />
          </div>

          {lot.tieredPricing?.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">قیمت‌گذاری پلکانی</p>
              <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
            </div>
          ) : null}

          {lot.description ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">توضیحات</p>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{lot.description}</p>
            </div>
          ) : null}

          {Array.isArray(lot.hashtags) && lot.hashtags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {lot.hashtags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {lot.locationLabel || (lot.latitude && lot.longitude) ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">موقعیت</p>
              <p className="text-sm text-slate-700">{lot.locationLabel || "—"}</p>
              {lot.latitude && lot.longitude ? (
                <p className="mt-1 font-mono text-xs text-slate-500" dir="ltr">
                  {lot.latitude}, {lot.longitude}
                </p>
              ) : null}
            </div>
          ) : null}

          {lot.attributes?.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">مشخصات فنی</p>
              <div className="space-y-2">
                {lot.attributes.map((a) => (
                  <div key={a.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-500">{a.definition?.name}</span>
                    <span className="font-medium text-slate-900">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(lot.englishName || lot.arabicName || lot.russianName) ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">نام‌های چندزبانه</p>
              <div className="space-y-1 text-sm text-slate-600">
                {lot.englishName ? <p>EN: {lot.englishName}</p> : null}
                {lot.arabicName ? <p>AR: {lot.arabicName}</p> : null}
                {lot.russianName ? <p>RU: {lot.russianName}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className={inv.modalFooter}>
          <button type="button" onClick={onClose} className={inv.btnSecondary}>
            بستن
          </button>
          <button type="button" onClick={() => onMedia(lot)} className={`${inv.btnSecondary} text-sky-700`}>
            رسانه
          </button>
          <button type="button" onClick={() => onEdit(lot)} className={inv.btnPrimary}>
            ویرایش
          </button>
        </div>
      </div>
    </div>
  );
}
