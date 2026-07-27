"use client";

/** آیکون اختصاصی هر پله احراز — شخص / کسب‌وکار */
export function VerificationLevelIcon({
  kind = "person",
  level = "none",
  className = "h-4 w-4",
  title,
}) {
  const lv = String(level || "none").toLowerCase();
  const isBiz = kind === "business";
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined,
  };

  if (lv === "none" || !lv) {
    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
      </svg>
    );
  }

  if (!isBiz) {
    if (lv === "basic") {
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        </svg>
      );
    }
    if (lv === "standard") {
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      );
    }
    if (lv === "enhanced") {
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 11.3l2-.3.9-1.8z" />
        </svg>
      );
    }
    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5h7M12 8v7" />
      </svg>
    );
  }

  if (lv === "basic") {
    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />
      </svg>
    );
  }
  if (lv === "standard") {
    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-6 9 6v10H3V10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />
      </svg>
    );
  }
  if (lv === "enhanced") {
    return (
      <svg {...common}>
        {title ? <title>{title}</title> : null}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V8l8-4 8 4v12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5h6v5M12 8v3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M5 20V9l7-4 7 4v11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M12 10v6" />
    </svg>
  );
}

const STEP = { basic: 1, standard: 2, enhanced: 3, full: 4 };

const LABEL = {
  none: "بدون درجه",
  basic: "پایه",
  standard: "استاندارد",
  enhanced: "پیشرفته",
  full: "کامل",
};

/**
 * نشان سطح روی آواتار — آیکون + عدد؛ نام در تولتیپ / فضای کافی
 * variant: "badge" (پیش‌فرض رنگی) | "plain" (بدون پس‌زمینه؛ عدد سپس آیکون)
 */
export function VerificationLevelBadge({
  kind = "person",
  level = "none",
  status = "none",
  size = "md",
  showLabel = false,
  variant = "badge",
  className = "",
}) {
  const lv = String(level || "none").toLowerCase();
  const verified = status === "verified" && lv && lv !== "none";
  const step = STEP[lv] || 0;
  const label = LABEL[lv] || LABEL.none;
  const tip =
    status === "pending"
      ? `${kind === "business" ? "کسب‌وکار" : "شخص"} — در انتظار بررسی`
      : verified
        ? `${kind === "business" ? "کسب‌وکار" : "هویت"} ${label} (سطح ${step})`
        : `${kind === "business" ? "کسب‌وکار" : "هویت"} — احراز نشده`;

  const plain = variant === "plain";

  if (plain) {
    const iconSize =
      size === "lg" ? "h-[1.125rem] w-[1.125rem]" : "h-4 w-4";
    const textSize = size === "lg" ? "text-[12px]" : "text-[11px]";
    const tone =
      status === "pending"
        ? "text-amber-600"
        : verified
          ? "text-slate-700"
          : "text-slate-400";

    return (
      <span
        title={tip}
        className={`inline-flex items-center justify-center gap-0.5 leading-none ${tone} ${className}`}
      >
        {verified && step ? (
          <span className={`inline-flex h-[1em] items-center font-bold tabular-nums ${textSize}`}>{step}</span>
        ) : null}
        <VerificationLevelIcon
          kind={kind}
          level={verified ? lv : "none"}
          className={`${iconSize} shrink-0`}
        />
        {showLabel && verified ? (
          <span className="hidden max-w-[4.5rem] truncate sm:inline text-[10px] font-semibold">{label}</span>
        ) : null}
      </span>
    );
  }

  const sizeCls =
    size === "sm"
      ? "h-5 min-w-5 gap-0.5 px-1 text-[9px]"
      : size === "lg"
        ? "h-7 min-w-7 gap-1 px-1.5 text-[11px]"
        : "h-6 min-w-6 gap-0.5 px-1 text-[10px]";

  const tone = verified
    ? kind === "business"
      ? "bg-emerald-600 text-white ring-emerald-300/50"
      : "bg-sky-600 text-white ring-sky-300/50"
    : status === "pending"
      ? "bg-amber-500 text-white ring-amber-300/40"
      : "bg-slate-500/90 text-white ring-white/20";

  return (
    <span
      title={tip}
      className={`inline-flex items-center justify-center rounded-full font-bold shadow-sm ring-1 ${sizeCls} ${tone} ${className}`}
    >
      <VerificationLevelIcon kind={kind} level={verified ? lv : "none"} className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {verified && step ? <span>{step}</span> : null}
      {showLabel && verified ? <span className="hidden max-w-[4.5rem] truncate sm:inline">{label}</span> : null}
    </span>
  );
}

export default VerificationLevelIcon;
