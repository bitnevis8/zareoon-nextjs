"use client";

/**
 * اسنیپت رسمی اینماد (enamad.ir) — جدا از تصویر محلی فوتر.
 * توجه: rel="noopener noreferrer" نباید روی لینک باشد.
 */
const ENAMAD_ID = "759645";
const ENAMAD_CODE = "G1B0OO9TDaDPE34IYHhyZRRGczGkIbg7";

export default function EnamadSeal({ className = "" }) {
  const href = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
  const img = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      href={href}
      className={`inline-block ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        referrerPolicy="origin"
        src={img}
        alt=""
        style={{ cursor: "pointer" }}
        code={ENAMAD_CODE}
      />
    </a>
  );
}
