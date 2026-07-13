"use client";

import { useMemo, useState } from "react";
import HashtagInput from "@/app/components/ui/HashtagInput";
import { Field } from "./Field";
import { inv } from "../inventoryTheme";
import {
  DISPLAY_LOCALES,
  countFilledDisplayLocales,
  createEmptyDisplayContent,
  getDisplayDescriptionPlaceholder,
  getDisplayLocale,
  getDisplayTitlePlaceholder,
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

export default function InventoryDisplayDetailsEditor({ value, onChange }) {
  const [activeLocale, setActiveLocale] = useState("fa");

  const content = value && typeof value === "object" ? value : createEmptyDisplayContent();
  const localeMeta = getDisplayLocale(activeLocale);
  const current = content[activeLocale] || { title: "", description: "", hashtags: [] };

  const filledMap = useMemo(() => {
    const map = {};
    for (const loc of DISPLAY_LOCALES) {
      const row = content[loc.code];
      map[loc.code] = Boolean(row?.title?.trim() || row?.description?.trim() || row?.hashtags?.length);
    }
    return map;
  }, [content]);

  const updateCurrent = (patch) => {
    onChange?.({
      ...content,
      [activeLocale]: { ...current, ...patch },
    });
  };

  const filledCount = countFilledDisplayLocales(content);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/80 px-2.5 py-2 sm:px-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-800">متن و عنوان نمایش</p>
          {filledCount > 0 ? (
            <span className="text-[10px] font-medium text-slate-500">
              {filledCount.toLocaleString("fa-IR")} زبان تکمیل‌شده
            </span>
          ) : null}
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

      <div className="space-y-3 p-2.5 sm:p-3">
        {activeLocale === "fa" ? (
          <p className="rounded-md border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 text-[11px] leading-5 text-emerald-900">
            زبان پیش‌فرض — این متن‌ها در نمایش فارسی سایت استفاده می‌شوند.
          </p>
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] leading-5 text-slate-600">
            اختیاری — در صورت تکمیل، برای بازدیدکنندگان با زبان {localeMeta.label} نمایش داده می‌شود.
          </p>
        )}

        <Field
          label="عنوان دلخواه"
          compact
          hint={
            activeLocale === "fa"
              ? "اگر خالی بماند، نام نوع محصول از کاتالوگ نمایش داده می‌شود."
              : "عنوان اختصاصی این عرضه به این زبان."
          }
        >
          <input
            className={inv.inputCompact}
            dir={localeMeta.dir}
            placeholder={getDisplayTitlePlaceholder(activeLocale)}
            value={current.title}
            onChange={(e) => updateCurrent({ title: e.target.value })}
          />
        </Field>

        <Field label="توضیحات" compact>
          <textarea
            className={inv.textareaCompact}
            dir={localeMeta.dir}
            rows={3}
            placeholder={getDisplayDescriptionPlaceholder(activeLocale)}
            value={current.description}
            onChange={(e) => updateCurrent({ description: e.target.value })}
          />
        </Field>

        <HashtagInput
          value={current.hashtags}
          onChange={(hashtags) => updateCurrent({ hashtags })}
          label="هشتگ"
          compact
        />
      </div>
    </div>
  );
}
