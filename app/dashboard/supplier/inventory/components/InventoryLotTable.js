"use client";

import { useTranslations } from "next-intl";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import { localizeStatus } from "@/app/utils/localize";
import { formatPriceWithCurrency } from "@/app/utils/priceCurrencies";
import { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";
import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";

/** ردیف لیستی موبایل‌اول */
function LotListRow({ lot, productName, farmerName, onView, onEdit, onMedia, onDelete, t, tShared }) {
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));

  return (
    <li className="border-b border-slate-100 last:border-0">
      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-400">#{lot.id}</span>
            <span className={gradeBadgeClass()}>{lot.qualityGrade}</span>
            <span className={statusBadgeClass(lot.status)}>{localizeStatus(lot.status, t)}</span>
          </div>
          <p className="mt-1 truncate text-sm font-bold text-slate-900">{productName}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {available.toLocaleString("fa-IR")} {lot.unit}
            {farmerName ? ` · ${farmerName}` : ""}
            {" · "}
            {lot.tieredPricing?.length > 0
              ? t("lot.tiered")
              : lot.price
                ? formatPriceWithCurrency(lot.price, lot.priceCurrency || lot.price_currency, tShared)
                : "—"}
          </p>
        </div>
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
          className="shrink-0 sm:justify-end"
        />
      </div>
    </li>
  );
}

export default function InventoryLotTable({ items, products, farmerNameMap, onView, onEdit, onMedia, onDelete }) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const productName = (id) => products.find((p) => p.id === id)?.name || "—";

  return (
    <>
      {/* لیست فشرده — همه عرض‌ها، مخصوص موبایل */}
      <ul className={`${inv.card} divide-y divide-slate-100 overflow-hidden lg:hidden`}>
        {items.map((x) => (
          <LotListRow
            key={x.id}
            lot={x}
            productName={productName(x.productId)}
            farmerName={farmerNameMap.get(x.farmerId)}
            onView={onView}
            onEdit={onEdit}
            onMedia={onMedia}
            onDelete={onDelete}
            t={t}
            tShared={tShared}
          />
        ))}
      </ul>

      {/* جدول دسکتاپ */}
      <div className={`${inv.card} hidden overflow-hidden lg:block`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{t("lot.product")}</th>
                <th className="px-4 py-3">{t("lot.supplier")}</th>
                <th className="px-4 py-3">{t("lot.grade")}</th>
                <th className="px-4 py-3">{t("lot.inventory")}</th>
                <th className="px-4 py-3">{t("lot.reserved")}</th>
                <th className="px-4 py-3">{t("lot.price")}</th>
                <th className="px-4 py-3">{t("lot.status")}</th>
                <th className="px-4 py-3 text-left">{t("lot.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((x) => (
                <tr key={x.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-slate-500">{x.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-900" title={productName(x.productId)}>
                    {productName(x.productId)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{farmerNameMap.get(x.farmerId) || `#${x.farmerId}`}</td>
                  <td className="px-4 py-3">
                    <span className={gradeBadgeClass()}>{x.qualityGrade}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-900">
                    {parseFloat(x.totalQuantity || 0).toLocaleString("fa-IR")} {x.unit}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {parseFloat(x.reservedQuantity || 0).toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3">
                    {x.tieredPricing?.length > 0 ? (
                      <TieredPricingDisplay tieredPricing={x.tieredPricing} unit={x.unit} />
                    ) : x.price ? (
                      <span className="font-semibold text-emerald-700">
                        {formatPriceWithCurrency(x.price, x.priceCurrency || x.price_currency, tShared)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusBadgeClass(x.status)}>{localizeStatus(x.status, t)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DashboardItemActions
                      onView={() => onView(x)}
                      onEdit={() => onEdit(x)}
                      onMedia={() => onMedia(x)}
                      onDelete={() => onDelete(x.id)}
                      viewLabel={t("lot.view")}
                      editLabel={t("lot.edit")}
                      mediaLabel={t("lot.media")}
                      deleteLabel={t("lot.delete")}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
