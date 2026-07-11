"use client";

import { usePathname } from "next/navigation";

export function useIsDashboardRoute() {
  const pathname = usePathname();
  return pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
}
