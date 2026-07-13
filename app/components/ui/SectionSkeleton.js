export default function SectionSkeleton({ className = "", minHeight = "12rem" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 ${className}`}
      style={{ minHeight }}
      aria-hidden
    >
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50" />
    </div>
  );
}
