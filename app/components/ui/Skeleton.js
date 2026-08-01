/**
 * اسکلتون‌های مشترک — بر پایهٔ daisyUI (`skeleton`)
 * https://daisyui.com/components/skeleton/
 */

/** بلوک پایه daisyUI */
export function Bone({ className = "", style, rounded = "rounded-lg", as: Comp = "div" }) {
  return <Comp className={`skeleton ${rounded} ${className}`} style={style} aria-hidden />;
}

/** چند خط متنی */
export function BoneText({ lines = 2, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
          rounded="rounded-md"
        />
      ))}
    </div>
  );
}

/** الگوی daisyUI: دایره + متن */
export function AvatarRowSkeleton({ className = "" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden>
      <Bone className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" rounded="rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Bone className="h-4 w-24" rounded="rounded-md" />
        <Bone className="h-4 w-36" rounded="rounded-md" />
      </div>
    </div>
  );
}

/** الگوی daisyUI: کارت مستطیل + خطوط */
export function ContentCardSkeleton({ className = "", imageHeight = "h-32" }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden>
      <Bone className={`${imageHeight} w-full`} rounded="rounded-xl" />
      <Bone className="h-4 w-28" rounded="rounded-md" />
      <Bone className="h-4 w-full" rounded="rounded-md" />
      <Bone className="h-4 w-full" rounded="rounded-md" />
    </div>
  );
}

/** تایل دسته / محصول */
export function CategoryTileSkeleton({ compact = false }) {
  return (
    <div
      className={`flex flex-col items-center gap-2.5 rounded-xl border border-base-200 bg-base-100 p-2.5 sm:rounded-2xl sm:p-3 md:p-4 ${
        compact ? "" : "min-h-[7.5rem]"
      }`}
      aria-hidden
    >
      <Bone
        className={`w-full ${compact ? "aspect-square max-h-20" : "aspect-square"}`}
        rounded="rounded-xl"
      />
      <Bone className={`h-3 w-4/5 ${compact ? "h-2.5" : ""}`} rounded="rounded-md" />
      <Bone className="h-2.5 w-1/2" rounded="rounded-md" />
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

/** ردیف افقی کارت محصول */
export function ProductScrollSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`flex gap-3 overflow-hidden pb-1 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex w-[7.75rem] shrink-0 flex-col gap-2 overflow-hidden rounded-xl border border-base-200 bg-base-100 p-0 sm:w-[8.75rem] md:w-[9.25rem]"
        >
          <Bone className="aspect-square w-full" rounded="rounded-none" />
          <div className="flex flex-col gap-2 p-2.5 pt-0">
            <Bone className="h-3 w-full" rounded="rounded-md" />
            <Bone className="h-3 w-2/3" rounded="rounded-md" />
            <Bone className="h-2.5 w-1/2" rounded="rounded-md" />
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
          className="flex flex-col gap-2 rounded-xl border border-base-200 bg-base-100 px-2 py-3 sm:p-4"
        >
          <Bone className="mx-auto h-2.5 w-12 sm:mx-0 sm:w-16" rounded="rounded-md" />
          <Bone className="mx-auto h-5 w-10 sm:mx-0 sm:h-6 sm:w-14" rounded="rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <div className="breadcrumbs text-sm" aria-hidden>
      <ul>
        <li>
          <Bone className="h-3.5 w-10" rounded="rounded-md" />
        </li>
        <li>
          <Bone className="h-3.5 w-16" rounded="rounded-md" />
        </li>
        <li>
          <Bone className="h-3.5 w-24" rounded="rounded-md" />
        </li>
      </ul>
    </div>
  );
}

export function CatalogHeroSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm" aria-hidden>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <Bone className="aspect-[4/3] w-full lg:aspect-auto lg:min-h-[260px]" rounded="rounded-none" />
        <div className="flex flex-col gap-4 border-t border-base-200 p-4 sm:p-6 lg:border-t-0 lg:border-s">
          <Bone className="h-7 w-3/4 sm:h-8" rounded="rounded-lg" />
          <Bone className="h-3.5 w-1/3" rounded="rounded-md" />
          <Bone className="h-8 w-36" rounded="rounded-lg" />
          <BoneText lines={2} className="pt-1" />
        </div>
      </div>
    </section>
  );
}

export function ListRowSkeleton({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${className}`} aria-hidden>
      <Bone className="h-10 w-10 shrink-0" rounded="rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Bone className="h-3.5 w-3/4" rounded="rounded-md" />
        <Bone className="h-3 w-1/2" rounded="rounded-md" />
      </div>
    </div>
  );
}

export function PageSkeleton({ className = "", rows = 4 }) {
  return (
    <div className={`flex w-full flex-col gap-4 ${className}`} aria-busy="true" aria-label="Loading">
      <Bone className="h-8 w-48" rounded="rounded-lg" />
      <Bone className="h-4 w-72 max-w-full" rounded="rounded-md" />
      {Array.from({ length: rows }).map((_, i) => (
        <Bone key={i} className="h-16 w-full" rounded="rounded-xl" />
      ))}
    </div>
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
      className={`rounded-2xl border border-base-200 bg-base-100 p-3 shadow-sm sm:p-5 ${className}`}
      style={{ minHeight }}
      aria-busy="true"
      aria-label="Loading"
    >
      {showHeader ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <Bone className="h-5 w-40 sm:h-6 sm:w-52" rounded="rounded-lg" />
          <Bone className="hidden h-6 w-24 sm:block" rounded="rounded-full" />
        </div>
      ) : null}
      {children}
    </section>
  );
}
