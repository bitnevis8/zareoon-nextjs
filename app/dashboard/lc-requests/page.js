"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LcRequestsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/trade-services/intl-finance");
  }, [router]);
  return null;
}
