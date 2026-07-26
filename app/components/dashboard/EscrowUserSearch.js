"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { authFetch } from "@/app/utils/authHeaders";
import { formatUserDisplayName } from "@/app/components/dashboard/escrowCopy";

const TEXT_MIN_QUERY_LENGTH = 2;
const DIGIT_MIN_QUERY_LENGTH = 8;

function toEnglishDigits(str) {
  return String(str || "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function getMinQueryLength(query) {
  const normalized = toEnglishDigits(query).trim().replace(/[\s-]/g, "");
  if (/^\d+$/.test(normalized)) return DIGIT_MIN_QUERY_LENGTH;
  return TEXT_MIN_QUERY_LENGTH;
}

function SelectedUserPreview({ user, t }) {
  if (!user) return null;
  const rows = [
    { label: t("search.previewFirstName"), value: user.firstName },
    { label: t("search.previewLastName"), value: user.lastName },
    { label: t("search.previewUsername"), value: user.username },
    { label: t("search.previewMobile"), value: user.mobile, ltr: true },
    { label: t("search.previewNationalId"), value: user.nationalId, ltr: true },
  ].filter((row) => row.value);

  if (!rows.length) return null;

  return (
    <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
      <p className="text-[11px] font-bold text-emerald-900">{t("search.previewTitle")}</p>
      <dl className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-2 sm:block">
            <dt className="text-emerald-800/70">{row.label}</dt>
            <dd
              className="font-semibold text-slate-900 sm:mt-0.5"
              dir={row.ltr ? "ltr" : undefined}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function EscrowUserSearch({
  label,
  hint,
  value,
  onChange,
  excludeUserId,
  disabled = false,
}) {
  const t = useTranslations("escrow");
  const userFallback = t("userFallback");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const minLen = useMemo(() => getMinQueryLength(query), [query]);

  useEffect(() => {
    setQuery(value ? formatUserDisplayName(value, userFallback) : "");
  }, [value, userFallback]);

  useEffect(() => {
    if (disabled || !open) return undefined;
    const trimmed = query.trim();
    const required = getMinQueryLength(trimmed);
    if (trimmed.length < required) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await authFetch(
          `/api/messaging/users/search?q=${encodeURIComponent(trimmed)}&limit=12`
        );
        const json = await res.json();
        if (json.success) {
          let list = Array.isArray(json.data) ? json.data : [];
          if (excludeUserId) {
            list = list.filter((u) => Number(u.id) !== Number(excludeUserId));
          }
          setResults(list);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open, disabled, excludeUserId]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pickUser = (user) => {
    onChange(user);
    setQuery(formatUserDisplayName(user, userFallback));
    setOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQuery("");
    setOpen(true);
  };

  const trimmed = query.trim();
  const queryTooShort = open && trimmed.length > 0 && trimmed.length < minLen;

  return (
    <div ref={wrapRef} className="relative block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {hint ? <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{hint}</p> : null}
      <div className="relative mt-1">
        <input
          type="search"
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("search.placeholder")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-500"
          autoComplete="off"
        />
        {value && !disabled ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t("search.clearAria")}
          >
            ×
          </button>
        ) : null}
      </div>
      {value && !open ? <SelectedUserPreview user={value} t={t} /> : null}
      {open && !disabled ? (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {queryTooShort ? (
            <li className="px-3 py-2.5 text-xs text-amber-700">
              {t("search.minChars", { count: minLen })}
            </li>
          ) : loading ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">{t("search.searching")}</li>
          ) : trimmed.length < minLen ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">{t("search.hint")}</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">{t("search.noResults")}</li>
          ) : (
            results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => pickUser(user)}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-right hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {formatUserDisplayName(user, userFallback)}
                  </span>
                  <span className="text-[11px] text-slate-500" dir="ltr">
                    {[user.mobile, user.username, user.nationalId].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
