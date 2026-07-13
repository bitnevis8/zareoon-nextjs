"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServiceRequestsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/trade-service-provider-requests");
  }, [router]);
  return null;
}
