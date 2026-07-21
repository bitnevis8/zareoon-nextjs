"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

/**
 * بنر هدر: اطلاع تغییر آدرس صفحه در ۷ روز آینده + امکان لغو
 */
export default function SlugChangePendingBanner() {
  const auth = useAuth();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!auth?.user) {
      setPending(null);
      return;
    }
    try {
      const res = await authFetch(API_ENDPOINTS.publicSlug.minePending, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setPending(json.data?.pending || null);
      else setPending(null);
    } catch {
      setPending(null);
    }
  }, [auth?.user]);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.publicSlug.cancel, { method: "POST" });
      const json = await res.json();
      if (json.success) setPending(null);
    } finally {
      setBusy(false);
    }
  };

  if (!pending?.message) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 sm:text-[13px]">
          {pending.message}{" "}
          <span className="font-semibold" dir="ltr">
            {pending.fromSlug} → {pending.toSlug}
          </span>
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={cancel}
          className="shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
        >
          {busy ? "…" : "لغو تغییر آدرس"}
        </button>
      </div>
    </div>
  );
}
