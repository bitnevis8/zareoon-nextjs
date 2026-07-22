"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function resolveShareUrl(url) {
  if (!url) {
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== "undefined") {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${window.location.origin}${path}`;
  }
  return url;
}

function ShareIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
      />
    </svg>
  );
}

/**
 * اشتراک‌گذاری لینک — تلگرام، واتساپ، ایتا، بله، روبیکا، اینستاگرام + کپی لینک
 * variant: icon | button
 */
export default function ShareButton({ url, title = "", variant = "icon", className = "", label }) {
  const t = useTranslations("shared");
  const panelId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url || "");

  useEffect(() => {
    setFullUrl(resolveShareUrl(url));
  }, [url]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const text = title || t("shareButton.title");
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(text);
  const encodedCombo = encodeURIComponent(`${text}\n${fullUrl}`);

  const shareOptions = [
    {
      id: "telegram",
      name: t("shareButton.telegram"),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      tone: "bg-sky-50 text-sky-800 ring-sky-100",
    },
    {
      id: "whatsapp",
      name: t("shareButton.whatsapp"),
      href: `https://wa.me/?text=${encodedCombo}`,
      tone: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    },
    {
      id: "eitaa",
      name: t("shareButton.eitaa"),
      href: `https://eitaa.com/share?url=${encodedUrl}&text=${encodedText}`,
      tone: "bg-orange-50 text-orange-800 ring-orange-100",
    },
    {
      id: "bale",
      name: t("shareButton.bale"),
      href: `https://ble.ir/share?url=${encodedUrl}&text=${encodedText}`,
      tone: "bg-green-50 text-green-800 ring-green-100",
    },
    {
      id: "rubika",
      name: t("shareButton.rubika"),
      href: `https://rubika.ir/share?url=${encodedUrl}&text=${encodedText}`,
      tone: "bg-violet-50 text-violet-800 ring-violet-100",
    },
    {
      id: "instagram",
      name: t("shareButton.instagram"),
      href: null,
      tone: "bg-pink-50 text-pink-800 ring-pink-100",
      copyThenOpen: "https://www.instagram.com/",
    },
  ];

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = fullUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Copy link failed:", err);
      return false;
    }
  };

  const openShare = (option) => {
    if (option.copyThenOpen) {
      copyToClipboard().then(() => {
        window.open(option.copyThenOpen, "_blank", "noopener,noreferrer");
        setOpen(false);
      });
      return;
    }
    if (option.href) {
      window.open(option.href, "_blank", "noopener,noreferrer,width=600,height=520");
      setOpen(false);
    }
  };

  const triggerClass =
    variant === "button"
      ? "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
      : "inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700";

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={triggerClass}
        title={t("shareButton.title")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <ShareIcon className={variant === "button" ? "h-4 w-4 shrink-0 text-emerald-700" : "h-4 w-4"} />
        {variant === "button" ? <span>{label || t("shareButton.title")}</span> : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[90] sm:hidden" role="dialog" aria-modal="true" aria-labelledby={panelId}>
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label={t("shareButton.close")}
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" aria-hidden />
              <p id={panelId} className="mb-1 text-sm font-bold text-slate-900">
                {t("shareButton.title")}
              </p>
              <p className="mb-3 text-xs leading-5 text-slate-500">{t("shareButton.hint")}</p>
              <ul className="grid grid-cols-2 gap-2">
                {shareOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => openShare(option)}
                      className={`flex min-h-12 w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold ring-1 ${option.tone}`}
                    >
                      {option.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => copyToClipboard()}
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
              >
                {copied ? t("shareButton.linkCopied") : t("shareButton.copyLink")}
              </button>
            </div>
          </div>

          <div className="absolute end-0 top-full z-[80] mt-1.5 hidden w-[min(100vw-2rem,15rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:block">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs font-bold text-slate-800">{t("shareButton.title")}</p>
            </div>
            <ul className="p-1.5">
              {shareOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => openShare(option)}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900"
                  >
                    {option.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => copyToClipboard()}
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copied ? t("shareButton.linkCopied") : t("shareButton.copyLink")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
