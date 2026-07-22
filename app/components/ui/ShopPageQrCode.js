"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Modal from "@/app/components/ui/Modal/Modal";
import { providerPublicAbsoluteUrl, providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";
import { SHOP_QR_PRINT_SIZES, downloadShopQrPrint } from "@/app/utils/shopPageQrPrint";

export default function ShopPageQrCode({ profileSlug, displayName = "" }) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const pageUrl = useMemo(() => providerPublicAbsoluteUrl(profileSlug), [profileSlug]);
  const displayUrl = useMemo(
    () => (profileSlug ? providerPublicDisplayUrl(String(profileSlug).trim()) : ""),
    [profileSlug]
  );

  if (!pageUrl) return null;

  const handleDownload = async (size) => {
    setError("");
    setBusyId(size.id);
    try {
      await downloadShopQrPrint({
        pageUrl,
        title: displayName,
        displayUrl,
        size,
        slugHint: profileSlug,
      });
    } catch {
      setError("دانلود ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <p className="mb-2 text-[11px] font-semibold text-slate-600">QR کد صفحه فروشگاه</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex w-full flex-col items-center gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-200 transition hover:ring-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="باز کردن دانلود QR کد قابل چاپ"
        >
          <span className="rounded-md bg-white p-1.5 shadow-sm ring-1 ring-slate-100 transition group-hover:shadow">
            <QRCodeSVG
              value={pageUrl}
              size={112}
              level="M"
              marginSize={1}
              bgColor="#ffffff"
              fgColor="#0f172a"
              title={displayUrl || pageUrl}
            />
          </span>
          <span className="text-center text-[11px] leading-snug text-slate-500">
            برای دانلود نسخه چاپ کلیک کنید
            <span className="mt-0.5 block font-medium text-emerald-700">A4 · A5 · A6 و …</span>
          </span>
        </button>
        <p className="mt-2 truncate text-center text-[10px] text-slate-400" dir="ltr" title={pageUrl}>
          {displayUrl}
        </p>
      </div>

      <Modal isOpen={open} onClose={() => !busyId && setOpen(false)} title="دانلود QR کد قابل چاپ">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-4">
            <QRCodeSVG value={pageUrl} size={160} level="M" marginSize={2} bgColor="#ffffff" fgColor="#0f172a" />
            {displayName ? <p className="text-sm font-bold text-slate-800">{displayName}</p> : null}
            <p className="text-xs text-slate-500" dir="ltr">
              {displayUrl}
            </p>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            اندازه مناسب چاپ را انتخاب کنید. فایل PDF (یا PNG) دانلود می‌شود و می‌توانید مستقیم چاپ کنید. با تغییر
            آدرس صفحه، این QR هم به‌روز می‌شود.
          </p>

          <ul className="space-y-2">
            {SHOP_QR_PRINT_SIZES.map((size) => {
              const loading = busyId === size.id;
              return (
                <li key={size.id}>
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => handleDownload(size)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">{size.label}</span>
                      <span className="block text-[11px] text-slate-500">{size.hint}</span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                      {loading ? "…" : size.type === "png" ? "PNG" : "PDF"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
      </Modal>
    </>
  );
}
