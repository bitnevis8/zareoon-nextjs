"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DISPLAY_LOCALES,
  countFilledDisplayLocales,
  getDisplayLocale,
  hydrateDisplayContent,
} from "../utils/inventoryDisplayLocales";

function LocaleTab({ active, label, filled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : filled
            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
      {filled && !active ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> : null}
    </button>
  );
}

export default function InventoryDisplayContentView({ lot }) {
  const t = useTranslations("inventory");
  const [activeLocale, setActiveLocale] = useState("fa");
  const content = useMemo(() => hydrateDisplayContent(lot), [lot]);
  const localeMeta = getDisplayLocale(activeLocale);
  const current = content[activeLocale] || { title: "", description: "", hashtags: [] };
  const filledCount = countFilledDisplayLocales(content);

  const filledMap = useMemo(() => {
    const map = {};
    for (const loc of DISPLAY_LOCALES) {
      const row = content[loc.code];
      map[loc.code] = Boolean(row?.title?.trim() || row?.description?.trim() || row?.hashtags?.length);
    }
    return map;
  }, [content]);

  if (filledCount === 0) return null;

  const hasCurrent =
    Boolean(current.title?.trim()) ||
    Boolean(current.description?.trim()) ||
    (Array.isArray(current.hashtags) && current.hashtags.length > 0);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">{t("display.viewTitle")}</p>
          <span className="text-[10px] font-medium text-slate-500">
            {t("display.languagesCount", { count: filledCount.toLocaleString("fa-IR") })}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {DISPLAY_LOCALES.map((loc) => (
            <LocaleTab
              key={loc.code}
              label={loc.nativeLabel}
              active={activeLocale === loc.code}
              filled={filledMap[loc.code]}
              onClick={() => setActiveLocale(loc.code)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 p-3">
        {!hasCurrent ? (
          <p className="text-sm text-slate-500">{t("display.noContentForLocale")}</p>
        ) : (
          <>
            {current.title?.trim() ? (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">{t("display.customTitle")}</p>
                <p className="text-sm font-semibold text-slate-900" dir={localeMeta.dir}>
                  {current.title}
                </p>
              </div>
            ) : null}

            {current.description?.trim() ? (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">{t("display.description")}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700" dir={localeMeta.dir}>
                  {current.description}
                </p>
              </div>
            ) : null}

            {Array.isArray(current.hashtags) && current.hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {current.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
