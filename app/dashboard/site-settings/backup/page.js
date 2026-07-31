"use client";

import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import BackupPanel from "@/app/components/dashboard/BackupPanel";
import { Bone } from "@/app/components/ui/Skeleton";

export default function SiteBackupPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();

  if (authLoading || !allowed) {
    return (
      <div className={dash.page}>
        <Bone className="h-8 w-48" rounded="rounded-lg" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="mb-6">
        <h1 className={dash.pageTitle}>بک‌آپ و بازیابی</h1>
        <p className="mt-1 text-sm text-slate-600">
          خروجی گرفتن و بازگردانی داده‌های سامانه از این بخش انجام می‌شود.
        </p>
      </div>
      <BackupPanel />
    </div>
  );
}
