"use client";

import Link from "next/link";

function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function ChatIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function stopNav(e) {
  e.preventDefault();
  e.stopPropagation();
}

export default function ApplicantRequestContactActions({ request, compact = false }) {
  const applicantId = request?.userId || request?.applicant?.id;
  const canCall =
    request?.allowPhoneContact !== false &&
    !request?.phoneHidden &&
    Boolean(request?.phone?.trim());

  const btnBase = compact
    ? "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
    : "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition";

  const callClass = `${btnBase} border border-emerald-600/25 bg-emerald-600 text-white hover:bg-emerald-700`;
  const chatClass = `${btnBase} border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800`;

  if (!applicantId && !canCall) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "mt-3 border-t border-slate-100 pt-3" : ""}`}
      onClick={stopNav}
      onKeyDown={(e) => e.stopPropagation()}
      role="group"
      aria-label="ارتباط با متقاضی"
    >
      {canCall ? (
        <a href={`tel:${request.phone}`} className={callClass} onClick={stopNav}>
          <PhoneIcon />
          <span>تماس</span>
        </a>
      ) : null}
      {applicantId ? (
        <Link
          href={`/dashboard/messages?u=${applicantId}`}
          className={chatClass}
          onClick={stopNav}
          prefetch
        >
          <ChatIcon />
          <span>چت</span>
        </Link>
      ) : null}
    </div>
  );
}
