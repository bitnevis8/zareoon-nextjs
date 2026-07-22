/**
 * Shared green hero for trade-services hub (homepage + /trade-services).
 * Subtitle stays on one line from lg up; wraps carefully on small screens.
 */
export default function TradeServicesSectionHeader({
  eyebrow,
  title,
  subtitle,
  titleAs = "h2",
  titleId,
  dir,
}) {
  const TitleTag = titleAs;

  return (
    <header
      className="relative overflow-hidden border-b border-emerald-900/10 px-3.5 py-5 text-start sm:px-7 sm:py-8 lg:px-9"
      dir={dir}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-emerald-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full min-w-0">
        <p className="inline-flex max-w-full items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-50 backdrop-blur-sm sm:px-3 sm:text-xs">
          <span className="truncate">{eyebrow}</span>
        </p>

        <TitleTag
          id={titleId}
          className="mt-2.5 text-balance text-base font-bold leading-snug tracking-tight text-white sm:mt-3 sm:text-lg"
        >
          {title}
        </TitleTag>

        <p className="mt-2 w-full min-w-0 text-pretty text-xs leading-6 text-emerald-50/95 sm:text-sm sm:leading-7 lg:mt-2.5 lg:whitespace-nowrap lg:leading-normal">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
