"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useMessaging } from "@/app/context/MessagingContext";

const MessagesApp = dynamic(() => import("@/app/dashboard/messages/MessagesApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white text-sm text-slate-500">در حال بارگذاری پیام‌ها…</div>
  ),
});

/**
 * مدال تمام‌صفحه پیام‌رسان — شبیه اینستاگرام
 */
export default function MessagingModalHost() {
  const { open, userId, conversationId, closeMessaging } = useMessaging();

  if (!open) return null;

  const peerKey = Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : 0;
  const convKey =
    Number.isFinite(Number(conversationId)) && Number(conversationId) > 0
      ? Number(conversationId)
      : 0;

  return (
    <div className="fixed inset-0 z-[10060] flex flex-col bg-slate-950/40" role="dialog" aria-modal="true" aria-label="پیام‌ها">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">…</div>}>
          <MessagesApp
            key={`msg-${peerKey}-${convKey}`}
            mode="modal"
            initialUserId={peerKey || null}
            initialConversationId={convKey || null}
            onClose={closeMessaging}
          />
        </Suspense>
      </div>
    </div>
  );
}
