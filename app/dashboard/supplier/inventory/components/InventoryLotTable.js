"use client";

import { useTranslations } from "next-intl";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import { localizeStatus } from "@/app/utils/localize";
import { formatPriceWithCurrency } from "@/app/utils/priceCurrencies";
import { inv, statusBadgeClass, gradeBadgeClass } from "../inventoryTheme";

export default function InventoryLotTable({ items, products, farmerNameMap, onView, onEdit, onMedia, onDelete }) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const productName = (id) => products.find((p) => p.id === id)?.name || "—";

  return (
    <div className={`${inv.card} hidden lg:block`}>
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
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => onView(x)} className={`${inv.btnGhost} ${inv.btnView} px-2`}>
                      {t("lot.view")}
                    </button>
                    <button type="button" onClick={() => onEdit(x)} className={`${inv.btnGhost} ${inv.btnEdit} px-2`}>
                      {t("lot.edit")}
                    </button>
                    <button type="button" onClick={() => onMedia(x)} className={`${inv.btnGhost} ${inv.btnMedia} px-2`}>
                      {t("lot.media")}
                    </button>
                    <button type="button" onClick={() => onDelete(x.id)} className={`${inv.btnGhost} ${inv.btnDanger} px-2`}>
                      {t("lot.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
