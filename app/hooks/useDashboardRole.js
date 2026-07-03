"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  canAccessSupplierInventory,
  canAccessSupplierOrders,
  isAdmin,
  resolveOwnScope,
} from "@/app/utils/roles";

export function useRequireAdmin() {
  const auth = useAuth();
  const router = useRouter();
  const allowed = useMemo(() => isAdmin(auth?.user), [auth?.user]);

  useEffect(() => {
    if (auth && !auth.loading && !allowed) {
      router.replace("/dashboard");
    }
  }, [auth, allowed, router]);

  return { user: auth?.user, allowed, loading: auth?.loading };
}

export function useRequireSupplierOrders(scopeParam) {
  const auth = useAuth();
  const router = useRouter();
  const allowed = useMemo(
    () => canAccessSupplierOrders(auth?.user, scopeParam),
    [auth?.user, scopeParam]
  );

  useEffect(() => {
    if (auth && !auth.loading && !allowed) {
      router.replace("/dashboard");
    }
  }, [auth, allowed, router]);

  return { user: auth?.user, allowed, loading: auth?.loading };
}

export function useRequireSupplierArea(scopeParam) {
  const auth = useAuth();
  const router = useRouter();
  const allowed = useMemo(() => canAccessSupplierInventory(auth?.user), [auth?.user]);
  const isOwnScope = useMemo(
    () => resolveOwnScope(auth?.user, scopeParam),
    [auth?.user, scopeParam]
  );

  useEffect(() => {
    if (auth && !auth.loading && !allowed) {
      router.replace("/dashboard");
    }
  }, [auth, allowed, router]);

  return { user: auth?.user, allowed, isOwnScope, loading: auth?.loading };
}
