"use client";

import Link from "next/link";
import { MESSENGER_META, messengerHref } from "@/app/utils/shopContacts";
import { MessengerGlyph, MESSENGER_COLORS } from "@/app/components/ui/ShopContactFields";
import ShopPageQrCode from "@/app/components/ui/ShopPageQrCode";

function ChatIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.5-3c-1.43.09-2.87.14-4.25.14-3.866 0-7-1.79-7-4s3.134-4 7-4c.85 0 1.67.07 2.45.2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 6.75h.008v.008H8.25V6.75zm3.75 0h.008v.008H12V6.75zm3.75 0h.008v.008H15.75V6.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c-4.418 0-8 2.015-8 4.5S7.582 12 12 12c.85 0 1.67-.07 2.45-.2L18 14.25V11.4c.88-.28 1.5-1.12 1.5-2.09C19.5 7.22 16.09 3 12 3z"
      />
    </svg>
  );
}

/**
 * نمایش عمومی تماس فروشگاه + چت داخلی زارعون + QR صفحه
 */
export default function ShopPublicContacts({
  shopContacts,
  legacy = {},
  chatUserId = null,
  showInternalChat = true,
  profileSlug = null,
  displayName = "",
}) {
  const phones = Array.isArray(shopContacts?.phones)
    ? shopContacts.phones.filter(Boolean)
    : [legacy.publicPhone, legacy.publicLandline].filter(Boolean);
  const emails = Array.isArray(shopContacts?.emails)
    ? shopContacts.emails.filter(Boolean)
    : legacy.publicEmail
      ? [legacy.publicEmail]
      : [];
  const messengers = shopContacts?.messengers || {};
  const messengerEntries = MESSENGER_META.filter(({ key }) => messengers[key]).map(({ key, label }) => ({
    key,
    label,
    value: messengers[key],
    href: messengerHref(key, messengers[key]),
  }));

  const canShowChat = showInternalChat && chatUserId;
  const chatHref = `/dashboard/messages?u=${chatUserId}`;
  const canShowQr = Boolean(profileSlug);

  if (!phones.length && !emails.length && !messengerEntries.length && !canShowChat && !canShowQr) return null;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-sm font-semibold text-slate-800">راه‌های ارتباطی</p>

      {canShowChat ? (
        <Link
          href={chatHref}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <ChatIcon className="h-5 w-5" />
          چت در زارعون
        </Link>
      ) : null}

      {phones.length ? (
        <ul className="space-y-1.5">
          {phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p}`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" dir="ltr">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                </span>
                {p}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {emails.length ? (
        <ul className="space-y-1.5">
          {emails.map((e) => (
            <li key={e}>
              <a href={`mailto:${e}`} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700" dir="ltr">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </span>
                {e}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {messengerEntries.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {messengerEntries.map(({ key, label, value, href }) => {
            const inner = (
              <>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${MESSENGER_COLORS[key]}`}>
                  <MessengerGlyph type={key} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] text-slate-500">{label}</span>
                  <span className="block truncate text-xs font-semibold text-slate-800" dir="ltr">
                    {value}
                  </span>
                </span>
              </>
            );
            const cls =
              "inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition hover:border-emerald-300";
            return href ? (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <span key={key} className={cls}>
                {inner}
              </span>
            );
          })}
        </div>
      ) : null}

      {canShowQr ? <ShopPageQrCode profileSlug={profileSlug} displayName={displayName} /> : null}
    </div>
  );
}
