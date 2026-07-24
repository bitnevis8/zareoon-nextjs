"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPriceWithCurrency } from "@/app/utils/priceCurrencies";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import { localizeStatus } from "@/app/utils/localize";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";
import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";

export default function InventoryLotCard({
  lot,
  productName,
  farmerName,
  onView,
  onEdit,
  onMedia,
  onDelete,
}) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
  const image =
    resolveMediaUrl(lot.coverImageUrl) ||
    resolveMediaUrl(lot.product?.imageUrl) ||
    resolveMediaUrl(lot.Product?.imageUrl) ||
    null;

  return (
    <article className={`${inv.card} overflow-hidden transition hover:shadow-md`}>
      <div className="flex gap-3 p-3 sm:p-3.5">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
          {image ? (
            <Image src={image} alt="" fill unoptimized className="object-cover" sizes="96px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-slate-300">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">#{lot.id}</span>
            <span className={gradeBadgeClass()}>{lot.qualityGrade}</span>
            <span className={statusBadgeClass(lot.status)}>{localizeStatus(lot.status, t)}</span>
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">{productName}</h3>
          {farmerName ? <p className="mt-0.5 truncate text-[11px] text-slate-500">{farmerName}</p> : null}
          <p className="mt-1.5 text-xs font-semibold text-emerald-700">
            {available.toLocaleString("fa-IR")} {lot.unit}
            <span className="mx-1 font-normal text-slate-300">·</span>
            <span className="font-semibold text-slate-800">
              {lot.tieredPricing?.length > 0
                ? t("lot.tiered")
                : lot.price
                  ? formatPriceWithCurrency(lot.price, lot.priceCurrency || lot.price_currency, tShared)
                  : "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-slate-100 bg-slate-100">
        <div className="bg-white px-2 py-2 text-center">
          <p className="text-[9px] font-medium text-slate-500">{t("lot.totalInventory")}</p>
          <p className="mt-0.5 text-[11px] font-bold tabular-nums text-slate-900 sm:text-xs">
            {parseFloat(lot.totalQuantity || 0).toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="bg-white px-2 py-2 text-center">
          <p className="text-[9px] font-medium text-slate-500">{t("lot.available")}</p>
          <p className="mt-0.5 text-[11px] font-bold tabular-nums text-emerald-700 sm:text-xs">
            {available.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="bg-white px-2 py-2 text-center">
          <p className="text-[9px] font-medium text-slate-500">{t("lot.minOrder")}</p>
          <p className="mt-0.5 text-[11px] font-bold tabular-nums text-slate-900 sm:text-xs">
            {lot.minimumOrderQuantity || "—"}
          </p>
        </div>
      </div>

      {lot.tieredPricing?.length > 0 ? (
        <div className="border-t border-slate-100 px-3 py-2">
          <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
        </div>
      ) : null}

      <div className="border-t border-slate-100 bg-slate-50/80 px-2.5 py-2 sm:px-3">
        <DashboardItemActions
          onView={() => onView(lot)}
          onEdit={() => onEdit(lot)}
          onMedia={() => onMedia(lot)}
          onDelete={() => onDelete(lot.id)}
          viewLabel={t("lot.view")}
          editLabel={t("lot.edit")}
          mediaLabel={t("lot.media")}
          deleteLabel={t("lot.delete")}
          compact
        />
      </div>
    </article>
  );
}
