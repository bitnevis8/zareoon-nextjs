"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/app/utils/authHeaders";
import { formatUserDisplayName } from "@/app/components/dashboard/escrowCopy";

const MIN_QUERY_LENGTH = 2;

export default function EscrowUserSearch({
  label,
  hint,
  value,
  onChange,
  excludeUserId,
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setQuery(value ? formatUserDisplayName(value) : "");
  }, [value]);

  useEffect(() => {
    if (disabled || !open) return undefined;
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
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
    setQuery(formatUserDisplayName(user));
    setOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQuery("");
    setOpen(true);
  };

  const trimmed = query.trim();
  const queryTooShort = open && trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH;

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
          placeholder="نام، نام خانوادگی یا موبایل…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-500"
          autoComplete="off"
        />
        {value && !disabled ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="پاک کردن انتخاب"
          >
            ×
          </button>
        ) : null}
      </div>
      {open && !disabled ? (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {queryTooShort ? (
            <li className="px-3 py-2.5 text-xs text-amber-700">
              حداقل {MIN_QUERY_LENGTH} حرف برای جستجو وارد کنید
            </li>
          ) : loading ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">در حال جستجو…</li>
          ) : trimmed.length < MIN_QUERY_LENGTH ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">
              برای یافتن طرف مقابل، نام یا موبایل را وارد کنید
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-slate-500">کاربری یافت نشد</li>
          ) : (
            results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => pickUser(user)}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-right hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {formatUserDisplayName(user)}
                  </span>
                  <span className="text-[11px] text-slate-500" dir="ltr">
                    {[user.mobile, user.username].filter(Boolean).join(" · ")}
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
