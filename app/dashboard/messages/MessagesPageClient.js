"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMessaging } from "@/app/context/MessagingContext";

/**
 * صفحه /dashboard/messages — مدال تمام‌صفحه را باز می‌کند
 */
export default function MessagesPageClient() {
  const searchParams = useSearchParams();
  const { openMessaging } = useMessaging();

  useEffect(() => {
    const c = searchParams.get("c");
    const u = searchParams.get("u");
    openMessaging({
      conversationId: c ? Number(c) : null,
      userId: u && !c ? Number(u) : null,
    });
  }, [searchParams, openMessaging]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      <p className="text-sm font-semibold text-slate-800">پیام‌های زارعون</p>
      <p className="max-w-sm text-xs leading-6 text-slate-500">
        پنجره گفتگو باز شده است. اگر بسته شد، از آیکون پیام در هدر دوباره باز کنید.
      </p>
    </div>
  );
}
