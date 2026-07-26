"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/app/context/AuthContext";
import { authFetch, setActiveWorkspaceId } from "@/app/utils/authHeaders";
import { API_ENDPOINTS } from "@/app/config/api";

export const WORKSPACE_CHANGED_EVENT = "zareoon:workspace-changed";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const auth = useAuth();
  const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
  const enabled = Boolean(userId);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [switching, setSwitching] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(API_ENDPOINTS.workspace.me, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "خطا در دریافت کسب‌وکار");
      }
      const next = json.data || null;
      if (next?.workspace?.id) setActiveWorkspaceId(next.workspace.id);
      setData(next);
      return next;
    } catch (e) {
      setError(e);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh, userId]);

  const switchWorkspace = useCallback(
    async (workspaceId) => {
      const id = Number(workspaceId);
      if (!id || !enabled) return null;
      setSwitching(true);
      setError(null);
      try {
        const res = await authFetch(API_ENDPOINTS.workspace.switch, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId: id }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "خطا در تغییر کسب‌وکار");
        }
        const next = json.data || null;
        if (next?.workspace?.id) setActiveWorkspaceId(next.workspace.id);
        setData(next);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(WORKSPACE_CHANGED_EVENT, { detail: { workspaceId: id, data: next } })
          );
        }
        return next;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setSwitching(false);
      }
    },
    [enabled]
  );

  const workspace = data?.workspace || null;
  const workspaces = data?.workspaces || [];
  const activities = workspace?.activities || {
    seller: Boolean(workspace),
    services: false,
  };

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      switching,
      refresh,
      switchWorkspace,
      workspace,
      workspaces,
      badges: data?.badges || [],
      activities: {
        seller: Boolean(activities.seller),
        services: Boolean(activities.services),
      },
      /** پست‌ها برای صفحهٔ عمومی فروشگاه یا خدمات */
      canUsePosts: Boolean(activities.seller || activities.services),
      canUseShop: Boolean(activities.seller),
      canUseServices: Boolean(activities.services),
      hasMultiple: workspaces.filter((w) => w.status === "active" || !w.status).length > 1,
      ready: enabled && !loading && Boolean(workspace),
    }),
    [
      data,
      loading,
      error,
      switching,
      refresh,
      switchWorkspace,
      workspace,
      workspaces,
      activities.seller,
      activities.services,
      enabled,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    return {
      data: null,
      loading: false,
      error: null,
      switching: false,
      refresh: async () => null,
      switchWorkspace: async () => null,
      workspace: null,
      workspaces: [],
      badges: [],
      activities: { seller: true, services: true },
      canUsePosts: true,
      canUseShop: true,
      canUseServices: true,
      hasMultiple: false,
      ready: false,
    };
  }
  return ctx;
}
