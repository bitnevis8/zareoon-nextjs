import { Bone, ProductScrollSkeleton } from "./Skeleton";

/**
 * Generic section placeholder for dynamic()/LazyWhenVisible fallbacks.
 * Prefer typed skeletons (ProductScrollSkeleton, CategoryGridSkeleton) when layout is known.
 */
export default function SectionSkeleton({
  className = "",
  minHeight = "12rem",
  variant = "block",
}) {
  if (variant === "products") {
    return (
      <section
        className={`rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-5 ${className}`}
        style={{ minHeight }}
        aria-busy="true"
        aria-label="Loading"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <Bone className="h-5 w-44 sm:h-6 sm:w-56" rounded="rounded-lg" />
          <Bone className="hidden h-6 w-28 sm:block" rounded="rounded-full" />
        </div>
        <ProductScrollSkeleton />
      </section>
    );
  }

  if (variant === "portal") {
    return (
      <section
        className={`overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-5 shadow-sm sm:rounded-3xl sm:p-8 ${className}`}
        style={{ minHeight }}
        aria-busy="true"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <Bone className="h-6 w-40" rounded="rounded-full" />
            <Bone className="h-8 w-4/5" rounded="rounded-lg" />
            <Bone className="h-3 w-full" rounded="rounded-md" />
            <Bone className="h-3 w-11/12" rounded="rounded-md" />
            <Bone className="h-3 w-3/4" rounded="rounded-md" />
            <div className="flex gap-2 pt-3">
              <Bone className="h-11 w-40" rounded="rounded-xl" />
              <Bone className="h-11 w-40" rounded="rounded-xl" />
            </div>
          </div>
          <Bone className="mx-auto h-64 w-full max-w-md sm:h-72" rounded="rounded-2xl" />
        </div>
      </section>
    );
  }

  if (variant === "services") {
    return (
      <section
        className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6 ${className}`}
        style={{ minHeight }}
        aria-busy="true"
      >
        <Bone className="mb-4 h-6 w-48" rounded="rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-slate-100 p-4">
              <Bone className="h-5 w-1/2" rounded="rounded-lg" />
              <Bone className="h-3 w-full" rounded="rounded-md" />
              <Bone className="h-3 w-5/6" rounded="rounded-md" />
              <Bone className="h-24 w-full" rounded="rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      style={{ minHeight }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Bone className="h-5 w-40 sm:w-52" rounded="rounded-lg" />
        <Bone className="h-4 w-16 opacity-60" rounded="rounded-md" />
      </div>
      <div className="space-y-3">
        <Bone className="h-3 w-full" rounded="rounded-md" />
        <Bone className="h-3 w-11/12" rounded="rounded-md" />
        <Bone className="h-3 w-4/5" rounded="rounded-md" />
        <Bone className="mt-4 h-28 w-full sm:h-32" rounded="rounded-xl" />
      </div>
    </section>
  );
}
