import Link from "next/link";

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * پوستهٔ صفحهٔ اختصاصی ابزارهای آنلاین — موبایل‌فرست، معرفی اصولی + لینک ابزارهای مرتبط
 */
export default function TradeToolPageShell({
  eyebrow,
  title,
  titleEn,
  tagline,
  description,
  benefits = [],
  relatedTools = [],
  icon = null,
  children,
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <div className="page-shell mx-auto max-w-5xl py-6 sm:py-8 lg:py-10">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500 sm:mb-6 sm:text-[13px]" aria-label="مسیر صفحه">
          <Link href="/" className="font-medium hover:text-teal-800">
            خانه
          </Link>
          <span aria-hidden className="text-slate-300">
            /
          </span>
          <Link href="/#trade-tools" className="font-medium hover:text-teal-800">
            ابزارهای بازرگانی
          </Link>
          <span aria-hidden className="text-slate-300">
            /
          </span>
          <span className="font-semibold text-slate-700">{title}</span>
        </nav>

        <header className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:rounded-[1.6rem]">
          <div className="pointer-events-none absolute -start-16 -top-20 h-48 w-48 rounded-full bg-teal-200/35 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -end-10 h-52 w-52 rounded-full bg-sky-100/60 blur-3xl" aria-hidden />

          <div className="relative px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <div className="flex items-start gap-3.5 sm:gap-4">
              {icon ? (
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm sm:h-14 sm:w-14">
                  {icon}
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                {eyebrow || titleEn ? (
                  <p className="text-[11px] font-bold tracking-wide text-teal-700 sm:text-xs" dir="ltr">
                    {eyebrow || titleEn}
                  </p>
                ) : null}
                <h1 className="mt-1 text-xl font-black leading-snug text-slate-900 sm:text-2xl lg:text-[1.75rem]">
                  {title}
                </h1>
                {tagline ? (
                  <p className="mt-2 text-[14px] font-semibold leading-7 text-slate-800 sm:text-[15px] sm:leading-7">
                    {tagline}
                  </p>
                ) : null}
                {description ? (
                  <p className="mt-2 max-w-3xl text-[13px] leading-7 text-slate-600 sm:text-sm sm:leading-7">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {benefits.length > 0 ? (
              <ul className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                {benefits.map((b) => (
                  <li
                    key={b.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 sm:px-4 sm:py-3.5"
                  >
                    <p className="flex items-start gap-2 text-[13px] font-bold text-slate-900">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {b.title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-6 text-slate-600 sm:ps-7">{b.text}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <div className="mt-5 rounded-[1.35rem] border border-slate-200/80 bg-white p-3.5 shadow-sm sm:mt-6 sm:rounded-[1.6rem] sm:p-5 lg:p-6">
          {children}
        </div>

        {relatedTools.length > 0 ? (
          <section className="mt-6 sm:mt-8" aria-labelledby="related-trade-tools">
            <h2 id="related-trade-tools" className="text-sm font-bold text-slate-900 sm:text-base">
              سایر ابزارهای آنلاین
            </h2>
            <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px]">
              هر ابزار صفحهٔ اختصاصی خودش را دارد؛ برای کار دقیق‌تر همان‌جا باز کنید.
            </p>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-sm"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold text-slate-900 group-hover:text-teal-900">
                        {tool.labelFa || tool.titleFa}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">{tool.taglineFa}</span>
                    </span>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-teal-700 group-hover:text-white">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
