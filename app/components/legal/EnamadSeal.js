"use client";

/**
 * نماد اعتماد الکترونیکی (اینماد)
 *
 * پس از صدور اینماد از enamad.ir، مقادیر زیر را در env بگذارید:
 *   NEXT_PUBLIC_ENAMAD_ID=...
 *   NEXT_PUBLIC_ENAMAD_CODE=...
 *
 * اگر کد رسمی اسکریپت متفاوت بود، همان اسنیپت مرکز را جایگزین این کامپوننت کنید.
 */
export default function EnamadSeal({ className = "" }) {
  const id = process.env.NEXT_PUBLIC_ENAMAD_ID;
  const code = process.env.NEXT_PUBLIC_ENAMAD_CODE;

  if (!id || !code) {
    return (
      <div
        className={`flex h-[72px] w-[72px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-1 text-center text-[9px] leading-tight text-slate-400 ${className}`}
        title="پس از دریافت اینماد، کد را در متغیرهای محیطی تنظیم کنید"
      >
        اینماد
        <br />
        به‌زودی
      </div>
    );
  }

  const href = `https://trustseal.enamad.ir/?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;
  const img = `https://trustseal.enamad.ir/logo.aspx?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="origin"
      className={`inline-block ${className}`}
      aria-label="نماد اعتماد الکترونیکی"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="نماد اعتماد الکترونیکی" style={{ cursor: "pointer" }} width={72} height={72} />
    </a>
  );
}
