"use client";

import { useTranslations } from "next-intl";
import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";
import { localizeStatus } from "@/app/utils/localize";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import { formatPriceWithCurrency } from "@/app/utils/priceCurrencies";
import InventoryDisplayContentView from "./InventoryDisplayContentView";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-left text-sm font-semibold text-slate-900">{value ?? "—"}</span>
    </div>
  );
}

export default function InventoryViewModal({ lot, productName, farmerName, onClose, onEdit, onMedia }) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  if (!lot) return null;
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));

  return (
    <div className={inv.overlay} onClick={onClose}>
      <div className={inv.modal} onClick={(e) => e.stopPropagation()}>
        <div className={inv.modalHeader}>
          <div>
            <p className="text-xs text-slate-500">{t("lot.lotNumber", { id: lot.id })}</p>
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
            <Row label={t("lot.supplier")} value={farmerName} />
            <Row label={t("lot.unit")} value={lot.unit} />
            {lot.packagingType ? <Row label={t("create.packagingType")} value={lot.packagingType} /> : null}
            {lot.hsCode ? <Row label={t("create.hsCode")} value={lot.hsCode} /> : null}
            <Row label={t("lot.totalInventory")} value={`${parseFloat(lot.totalQuantity || 0).toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row label={t("lot.reserved")} value={`${parseFloat(lot.reservedQuantity || 0).toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row label={t("lot.available")} value={`${available.toLocaleString("fa-IR")} ${lot.unit}`} />
            <Row
              label={t("lot.price")}
              value={
                lot.tieredPricing?.length > 0
                  ? t("lot.tieredPrice")
                  : lot.price
                    ? formatPriceWithCurrency(lot.price, lot.priceCurrency || lot.price_currency, tShared)
                    : "—"
              }
            />
            <Row
              label={t("lot.minOrder")}
              value={lot.minimumOrderQuantity ? `${lot.minimumOrderQuantity} ${lot.unit}` : "—"}
            />
          </div>

          {lot.tieredPricing?.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">{t("viewModal.tieredPricing")}</p>
              <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
            </div>
          ) : null}

          <InventoryDisplayContentView lot={lot} />

          {lot.locationLabel || (lot.latitude && lot.longitude) ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">{t("viewModal.location")}</p>
              <p className="text-sm text-slate-700">{lot.locationLabel || "—"}</p>
              {lot.latitude && lot.longitude ? (
                <p className="mt-1 font-mono text-xs text-slate-500" dir="ltr">
                  {lot.latitude}, {lot.longitude}
                </p>
              ) : null}
            </div>
          ) : null}

          {lot.filterValues && Object.keys(lot.filterValues).length > 0 ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4">
              {Object.entries(lot.filterValues).map(([k, v]) => (
                <Row key={k} label={k} value={String(v)} />
              ))}
            </div>
          ) : null}

          {lot.attributes?.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">{t("viewModal.technicalSpecs")}</p>
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
        </div>

        <div className={inv.modalFooter}>
          <button type="button" onClick={onClose} className={inv.btnSecondary}>
            {t("viewModal.close")}
          </button>
          <button type="button" onClick={() => onMedia(lot)} className={`${inv.btnSecondary} text-sky-700`}>
            {t("lot.media")}
          </button>
          <button type="button" onClick={() => onEdit(lot)} className={inv.btnPrimary}>
            {t("lot.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}
