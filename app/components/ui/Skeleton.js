/**
 * Shared skeleton primitives — use instead of ad-hoc animate-pulse blocks.
 */
export function Bone({ className = "", style, rounded = "rounded-lg" }) {
  return <div className={`skeleton-bone ${rounded} ${className}`} style={style} aria-hidden />;
}

export function BoneText({ lines = 2, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          className={`h-3 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
          rounded="rounded-md"
        />
      ))}
    </div>
  );
}

/** Category / product tile matching CategoryTile proportions */
export function CategoryTileSkeleton({ compact = false }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3 md:p-4 ${
        compact ? "min-h-0" : "min-h-[7.5rem]"
      }`}
      aria-hidden
    >
      <Bone
        className={`w-full ${compact ? "aspect-square max-h-20" : "aspect-square"}`}
        rounded="rounded-xl"
      />
      <Bone className={`mt-2.5 h-3 w-4/5 ${compact ? "h-2.5" : ""}`} rounded="rounded-md" />
      <Bone className="mt-1.5 h-2.5 w-1/2 opacity-70" rounded="rounded-md" />
    </div>
  );
}

export function CategoryGridSkeleton({
  count = 10,
  className = "",
  gridClass = "grid grid-cols-2 gap-2.5 min-[380px]:grid-cols-3 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6",
}) {
  return (
    <div className={`${gridClass} ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryTileSkeleton key={i} />
      ))}
    </div>
  );
}

/** Horizontal product card row (latest available) */
export function ProductScrollSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`flex gap-3 overflow-hidden pb-1 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-[7.75rem] shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white sm:w-[8.75rem] md:w-[9.25rem]"
        >
          <Bone className="aspect-[4/3] w-full" rounded="rounded-none" />
          <div className="space-y-2 p-2.5">
            <Bone className="h-3 w-full" rounded="rounded-md" />
            <Bone className="h-3 w-2/3" rounded="rounded-md" />
            <Bone className="h-2.5 w-1/2 opacity-70" rounded="rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-3 sm:p-4"
        >
          <Bone className="mx-auto h-2.5 w-12 sm:mx-0 sm:w-16" rounded="rounded-md" />
          <Bone className="mx-auto mt-2 h-5 w-10 sm:mx-0 sm:mt-3 sm:h-6 sm:w-14" rounded="rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <Bone className="h-3.5 w-10" rounded="rounded-md" />
      <Bone className="h-3 w-2 opacity-40" rounded="rounded-full" />
      <Bone className="h-3.5 w-16" rounded="rounded-md" />
      <Bone className="h-3 w-2 opacity-40" rounded="rounded-full" />
      <Bone className="h-3.5 w-24" rounded="rounded-md" />
    </div>
  );
}

export function CatalogHeroSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-hidden>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <Bone className="aspect-[5/4] w-full lg:aspect-auto lg:min-h-[260px]" rounded="rounded-none" />
        <div className="space-y-4 border-t border-slate-100 p-4 sm:p-6 lg:border-t-0 lg:border-s">
          <Bone className="h-7 w-3/4 sm:h-8" rounded="rounded-lg" />
          <Bone className="h-3.5 w-1/3" rounded="rounded-md" />
          <Bone className="h-8 w-36" rounded="rounded-lg" />
          <BoneText lines={2} className="pt-2" />
        </div>
      </div>
    </section>
  );
}

export function SectionBlockSkeleton({
  className = "",
  minHeight = "12rem",
  showHeader = true,
  children,
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-5 ${className}`}
      style={{ minHeight }}
      aria-busy="true"
      aria-label="Loading"
    >
      {showHeader ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <Bone className="h-5 w-40 sm:h-6 sm:w-52" rounded="rounded-lg" />
          <Bone className="h-6 w-24 hidden sm:block" rounded="rounded-full" />
        </div>
      ) : null}
      {children}
    </section>
  );
}
