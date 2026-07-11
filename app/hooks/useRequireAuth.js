"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { showToast } from "../utils/toast";

/**
 * Auth-gated actions with site-wide toast feedback.
 * @returns {{ navigateIfAuthed: (href: string) => void, isLoggedIn: boolean, authLoading: boolean }}
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const navigateIfAuthed = useCallback(
    (href) => {
      if (auth?.loading) return;
      if (!auth?.user) {
        showToast.warning(t("toastLoginRequired"));
        const next = encodeURIComponent(href);
        router.push(`/auth/login?next=${next}`);
        return;
      }
      router.push(href);
    },
    [auth?.loading, auth?.user, router, t]
  );

  return {
    navigateIfAuthed,
    isLoggedIn: Boolean(auth?.user),
    authLoading: Boolean(auth?.loading),
  };
}
