"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { authFetch } from "@/app/utils/authHeaders";

function MessageIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8M8 14h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function HeaderMessagesIcon({ buttonClass = "" }) {
  const auth = useAuth();
  const user = auth?.user;
  const { t } = useLanguage();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authFetch("/api/messaging/unread-count", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setCount(json?.data?.total ?? 0);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  if (!user) return null;

  return (
    <Link
      href="/dashboard/messages"
      className={`relative ${buttonClass}`}
      aria-label={t("messages")}
      title={t("messages")}
      prefetch
    >
      <MessageIcon />
      {count > 0 ? (
        <span className="absolute -top-1 -left-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
