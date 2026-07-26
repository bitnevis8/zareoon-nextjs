"use client";

import { useWorkspace } from "@/app/context/WorkspaceContext";

/**
 * سازگاری با صفحات قبلی — منبع اصلی: WorkspaceContext
 */
export function useMyWorkspace({ enabled = true } = {}) {
  const ctx = useWorkspace();
  if (!enabled) {
    return {
      data: null,
      loading: false,
      error: null,
      refresh: async () => null,
      workspace: null,
      workspaces: [],
      badges: [],
    };
  }
  return {
    data: ctx.data,
    loading: ctx.loading,
    error: ctx.error,
    refresh: ctx.refresh,
    workspace: ctx.workspace,
    workspaces: ctx.workspaces,
    badges: ctx.badges,
    switchWorkspace: ctx.switchWorkspace,
    activities: ctx.activities,
    canUseShop: ctx.canUseShop,
    canUseServices: ctx.canUseServices,
    canUsePosts: ctx.canUsePosts,
  };
}
