"use client";

function IconProducts({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5 12 4l8 4.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v8M4.5 9.2 12 13.5l7.5-4.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPosts({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconServices({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconFollowers({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.5 18.5c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M16.5 8.5a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18.2 14.2c1.8.4 3 1.6 3.5 3.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconFollowing({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 18.5c1-3 3.3-4.5 6.5-4.5s5.5 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M17 5.5v4M15 7.5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const VARIANTS = {
  light: {
    topRow: "flex items-start gap-3 sm:gap-4",
    profileCol: "min-w-0 flex-1",
    followBar: "flex shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch",
    followItem:
      "inline-flex min-w-[6.75rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:min-w-[7.5rem] sm:px-2.5 sm:py-2",
    followIconWrap: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600",
    followIcon: "h-3.5 w-3.5",
    followText: "min-w-0 flex flex-col items-start gap-0.5 text-start",
    followValue: "text-sm font-bold tabular-nums leading-none text-slate-900",
    followLabel: "max-w-[5.5rem] truncate text-[10px] font-medium leading-tight text-slate-500 sm:text-[11px]",
    contentWrap: "mt-3 grid gap-1.5 sm:mt-4 sm:gap-2",
    contentItem:
      "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 sm:px-2.5",
    contentIconWrap: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600",
    contentIcon: "h-3.5 w-3.5",
    contentText: "min-w-0 flex flex-col items-start gap-0 text-start",
    contentValue: "text-sm font-bold tabular-nums leading-none text-slate-900",
    contentLabel: "mt-0.5 max-w-full truncate text-[10px] font-medium leading-tight text-slate-500",
  },
  dark: {
    topRow: "flex items-start gap-3 sm:gap-4",
    profileCol: "min-w-0 flex-1",
    followBar: "flex shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch",
    followItem:
      "inline-flex min-w-[6.75rem] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-sm sm:min-w-[7.5rem] sm:px-2.5 sm:py-2",
    followIconWrap: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-emerald-50",
    followIcon: "h-3.5 w-3.5",
    followText: "min-w-0 flex flex-col items-start gap-0.5 text-start",
    followValue: "text-sm font-bold tabular-nums leading-none text-white",
    followLabel: "max-w-[5.5rem] truncate text-[10px] font-medium leading-tight text-emerald-100/85 sm:text-[11px]",
    contentWrap: "mt-3 grid gap-1.5 sm:mt-4 sm:gap-2",
    contentItem:
      "inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-sm sm:px-2.5",
    contentIconWrap: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-emerald-50",
    contentIcon: "h-3.5 w-3.5",
    contentText: "min-w-0 flex flex-col items-start gap-0 text-start",
    contentValue: "text-sm font-bold tabular-nums leading-none text-white",
    contentLabel: "mt-0.5 max-w-full truncate text-[10px] font-medium leading-tight text-emerald-100/85",
  },
};

/**
 * متریک‌های هدر پروفایل:
 * - ردیف بالا: پروفایل (children) + اختیاری دنبال‌کنندگان / دنبال‌شوندگان
 * - afterProfile: محتوای میانی (مثل باکس فروشگاه)
 * - اختیاری محصولات / پست‌ها / خدمات
 */
export default function ProfileHeaderMetrics({
  variant = "light",
  followers = 0,
  following = 0,
  products = 0,
  posts = 0,
  services = 0,
  showServices = true,
  showFollowStats = true,
  showContentStats = true,
  formatValue = (n) => String(Number(n || 0)),
  labels = {},
  children,
  afterProfile = null,
}) {
  const styles = VARIANTS[variant] || VARIANTS.light;
  const contentItems = [
    {
      key: "products",
      value: products,
      label: labels.products || "محصولات",
      Icon: IconProducts,
    },
    {
      key: "posts",
      value: posts,
      label: labels.posts || "پست‌ها",
      Icon: IconPosts,
    },
    ...(showServices
      ? [
          {
            key: "services",
            value: services,
            label: labels.services || "خدمات",
            Icon: IconServices,
          },
        ]
      : []),
  ];

  const followItems = [
    {
      key: "followers",
      value: followers,
      label: labels.followers || "دنبال‌کنندگان",
      Icon: IconFollowers,
    },
    {
      key: "following",
      value: following,
      label: labels.following || "دنبال‌شوندگان",
      Icon: IconFollowing,
    },
  ];

  return (
    <>
      <div className={styles.topRow}>
        <div className={styles.profileCol}>{children}</div>
        {showFollowStats ? (
          <div className={styles.followBar}>
            {followItems.map(({ key, value, label, Icon }) => (
              <div key={key} className={styles.followItem} title={label}>
                <span className={styles.followIconWrap}>
                  <Icon className={styles.followIcon} />
                </span>
                <span className={styles.followText}>
                  <span className={styles.followValue}>{formatValue(value)}</span>
                  <span className={styles.followLabel}>{label}</span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {afterProfile}

      {showContentStats ? (
        <div className={`${styles.contentWrap} ${showServices ? "grid-cols-3" : "grid-cols-2"}`}>
          {contentItems.map(({ key, value, label, Icon }) => (
            <div key={key} className={styles.contentItem} title={label}>
              <span className={styles.contentIconWrap}>
                <Icon className={styles.contentIcon} />
              </span>
              <span className={styles.contentText}>
                <span className={styles.contentValue}>{formatValue(value)}</span>
                <span className={styles.contentLabel}>{label}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
