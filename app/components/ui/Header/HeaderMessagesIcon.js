"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useMessaging } from "@/app/context/MessagingContext";
import { authFetch } from "@/app/utils/authHeaders";

/** آیکون پیام مستقیم — شبیه اینستاگرام (کاغذ هواپیما) */
function InstagramDmIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22l-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeaderMessagesIcon({ buttonClass = "" }) {
  const auth = useAuth();
  const user = auth?.user;
  const { t } = useLanguage();
  const { openMessaging } = useMessaging();
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
    <button
      type="button"
      onClick={() => {
        openMessaging();
        fetchCount();
      }}
      className={`relative ${buttonClass}`}
      aria-label={t("messages")}
      title={t("messages")}
    >
      <InstagramDmIcon />
      {count > 0 ? (
        <span className="absolute -top-1 -left-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
