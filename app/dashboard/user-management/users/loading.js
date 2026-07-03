import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";

function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export default function UserManagementLoading() {
  return (
    <div className={inv.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-4 w-64" />
        </div>
        <SkeletonBar className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={inv.statCard}>
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="mt-2 h-8 w-12" />
          </div>
        ))}
      </div>

      <div className={inv.card}>
        <div className={inv.cardHeader}>
          <SkeletonBar className="h-5 w-32" />
        </div>
        <div className={`${inv.cardBody} space-y-3`}>
          <SkeletonBar className="h-11 w-full" />
          <SkeletonBar className="h-10 w-48" />
        </div>
      </div>

      <div className={inv.card}>
        <div className={inv.cardHeader}>
          <SkeletonBar className="h-5 w-24" />
        </div>
        <div className={`${inv.cardBody} space-y-3`}>
          {[...Array(6)].map((_, i) => (
            <SkeletonBar key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
