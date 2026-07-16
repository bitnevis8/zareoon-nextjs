"use client";

import { useTranslations } from "next-intl";
import { localizeGrade } from "../../utils/localize";

function StatCell({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-lg border px-2 py-2 text-center ${
        highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`text-[10px] font-medium ${highlight ? "text-emerald-700" : "text-slate-500"}`}>{label}</div>
      <div className={`mt-0.5 text-sm font-bold ${highlight ? "text-emerald-900" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

export default function CatalogGradeSummary({ byGrade, language, title, description }) {
  const t = useTranslations("catalog");
  if (!byGrade?.length) return null;

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="p-2 text-right">{t("grade")}</th>
              <th className="p-2 text-right">{t("stockTotalLabel")}</th>
              <th className="p-2 text-right">{t("stockReservedLabel")}</th>
              <th className="p-2 text-right">{t("stockAvailableLabel")}</th>
              <th className="p-2 text-right">{t("lotsCount")}</th>
            </tr>
          </thead>
          <tbody>
            {byGrade.map((g) => (
              <tr key={g.grade} className="border-t border-slate-100">
                <td className="p-2">{localizeGrade(g.grade, t)}</td>
                <td className="p-2">{g.total.toFixed(3)}</td>
                <td className="p-2">{g.reserved.toFixed(3)}</td>
                <td className="p-2 font-medium text-emerald-700">{g.available.toFixed(3)}</td>
                <td className="p-2">{g.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {(title || description) && (
          <div className="space-y-1">
            {title ? <h3 className="text-sm font-bold text-slate-900">{title}</h3> : null}
            {description ? <p className="text-xs text-slate-500">{description}</p> : null}
          </div>
        )}
        {byGrade.map((g) => (
          <article key={g.grade} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2.5">
              <div>
                <div className="text-[10px] font-medium text-slate-500">{t("lotGradeLabel")}</div>
                <h4 className="text-sm font-bold text-slate-900">{localizeGrade(g.grade, t)}</h4>
              </div>
              <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
                {g.count} {t("lotsCount")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              <StatCell label={t("stockTotalLabel")} value={g.total.toFixed(3)} />
              <StatCell label={t("stockReservedLabel")} value={g.reserved.toFixed(3)} />
              <StatCell label={t("stockAvailableLabel")} value={g.available.toFixed(3)} highlight />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
