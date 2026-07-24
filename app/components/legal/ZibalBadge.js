"use client";

import Image from "next/image";

const ZIBAL_URL = "https://zibal.ir";

/**
 * نشان درگاه پرداخت زیبال — کنار اینماد در فوتر.
 */
export default function ZibalBadge({ className = "", height = 24 }) {
  return (
    <a
      href={ZIBAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${className}`}
      title="درگاه پرداخت زیبال"
      aria-label="درگاه پرداخت زیبال"
    >
      <Image
        src="/images/zibal.svg"
        alt="زیبال"
        width={Math.round(height * 2.4)}
        height={height}
        className="object-contain"
        style={{ height, width: "auto", maxHeight: height }}
      />
    </a>
  );
}
