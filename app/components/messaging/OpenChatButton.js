"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useMessaging } from "@/app/context/MessagingContext";
import { buildLoginHref } from "@/app/utils/safeAuthRedirect";

function ChatBubbleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75h.008v.008H8.625V9.75zm3.375 0h.008v.008H12V9.75zm3.375 0h.008v.008H15.375V9.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.5-3c-.54.035-1.085.052-1.63.052-4.418 0-8-2.239-8-5s3.582-5 8-5c.852 0 1.672.086 2.44.248"
      />
    </svg>
  );
}

/**
 * دکمه شروع/ادامه گفتگو — مدال پیام‌رسان را باز می‌کند
 */
export default function OpenChatButton({
  userId,
  label = "گفتگو در زارعون",
  children,
  className = "",
  icon = true,
  disabled = false,
  onClick,
}) {
  const auth = useAuth();
  const { openMessaging } = useMessaging();
  const loggedIn = Boolean(auth?.user);
  const uid = Number(userId);
  const content = (
    <>
      {icon ? <ChatBubbleIcon className="h-4 w-4 shrink-0" /> : null}
      {children ?? label}
    </>
  );

  if (!uid || !Number.isFinite(uid)) return null;

  if (!loggedIn) {
    return (
      <Link
        href={buildLoginHref(`/dashboard/messages?u=${uid}`)}
        className={className}
        aria-disabled={disabled}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        openMessaging({ userId: uid });
      }}
      className={className}
    >
      {content}
    </button>
  );
}
