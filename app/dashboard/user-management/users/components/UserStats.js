"use client";

import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { computeUserStats } from "../userUtils";
import { useTranslations } from "next-intl";

export default function UserStats({ users }) {
  const t = useTranslations("users");
  const { total, active, emailVerified, mobileVerified, suppliers } = computeUserStats(users);

  const stats = [
    { label: t("stats.totalUsers"), value: total, tone: "text-slate-900" },
    { label: t("stats.active"), value: active, tone: "text-emerald-700" },
    { label: t("stats.emailVerified"), value: emailVerified, tone: "text-sky-700" },
    { label: t("stats.mobileVerified"), value: mobileVerified, tone: "text-indigo-700" },
    { label: t("stats.supplier"), value: suppliers, tone: "text-amber-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className={inv.statCard}>
          <p className="text-[10px] font-medium text-slate-500 sm:text-xs">{s.label}</p>
          <p className={`mt-1 text-lg font-bold sm:text-2xl ${s.tone}`}>
            {s.value.toLocaleString("fa-IR")}
          </p>
        </div>
      ))}
    </div>
  );
}
