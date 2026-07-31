import {
  Bone,
  BoneText,
  ContentCardSkeleton,
  ProductScrollSkeleton,
} from "./Skeleton";

/**
 * اسکلتون بخش‌ها برای dynamic()/LazyWhenVisible — daisyUI skeleton
 */
export default function SectionSkeleton({
  className = "",
  minHeight = "12rem",
  variant = "block",
}) {
  if (variant === "products") {
    return (
      <section
        className={`rounded-2xl border border-base-200 bg-base-100 p-3 shadow-sm sm:p-5 ${className}`}
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
        className={`overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm sm:rounded-3xl sm:p-8 ${className}`}
        style={{ minHeight }}
        aria-busy="true"
        aria-label="Loading"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Bone className="h-6 w-40" rounded="rounded-full" />
            <Bone className="h-8 w-4/5" rounded="rounded-lg" />
            <BoneText lines={3} />
            <div className="flex gap-2 pt-3">
              <Bone className="h-11 w-36" rounded="rounded-xl" />
              <Bone className="h-11 w-36" rounded="rounded-xl" />
            </div>
          </div>
          <ContentCardSkeleton imageHeight="h-64 sm:h-72" />
        </div>
      </section>
    );
  }

  if (variant === "services") {
    return (
      <section
        className={`overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm sm:p-6 ${className}`}
        style={{ minHeight }}
        aria-busy="true"
        aria-label="Loading"
      >
        <Bone className="mb-4 h-6 w-48" rounded="rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-base-200 p-4">
              <ContentCardSkeleton imageHeight="h-24" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm sm:p-5 ${className}`}
      style={{ minHeight }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Bone className="h-5 w-40 sm:w-52" rounded="rounded-lg" />
        <Bone className="h-4 w-16" rounded="rounded-md" />
      </div>
      <ContentCardSkeleton />
    </section>
  );
}
