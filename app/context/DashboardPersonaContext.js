"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  DASHBOARD_PERSONAS,
  VALID_DASHBOARD_PERSONAS,
  getDefaultDashboardPersona,
  normalizeDashboardPersona,
} from "@/app/utils/dashboardPersona";

const STORAGE_KEY = "zareoon_dashboard_persona";

const DashboardPersonaContext = createContext(null);

export function DashboardPersonaProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user;
  const userId = user?.id ?? user?.userId ?? null;
  const prevUserIdRef = useRef(undefined);
  const [persona, setPersonaState] = useState(DASHBOARD_PERSONAS.SELLER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // بعد از لاگین (یا تعویض کاربر): پیش‌فرض = فروشگاه من
    if (userId && prevUserId !== userId) {
      const next = getDefaultDashboardPersona(user);
      setPersonaState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      setHydrated(true);
      return;
    }

    // خروج از حساب → برگشت به فروشگاه من
    if (!userId) {
      setPersonaState(DASHBOARD_PERSONAS.SELLER);
      setHydrated(true);
      return;
    }

    // همان نشست: اگر قبلاً نقش انتخاب شده، همان را نگه دار
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (VALID_DASHBOARD_PERSONAS.includes(stored)) {
        let normalized = normalizeDashboardPersona(stored);
        // خریدار از سایدبار حذف شده؛ نقش ذخیره‌شدهٔ خریدار → فروشگاه من
        if (normalized === DASHBOARD_PERSONAS.APPLICANT) {
          normalized = DASHBOARD_PERSONAS.SELLER;
          localStorage.setItem(STORAGE_KEY, normalized);
        }
        setPersonaState(normalized);
      } else {
        setPersonaState(getDefaultDashboardPersona(user));
      }
    } catch {
      setPersonaState(getDefaultDashboardPersona(user));
    }
    setHydrated(true);
  }, [user, userId]);

  const setPersona = useCallback((next) => {
    const normalized = normalizeDashboardPersona(next);
    if (!VALID_DASHBOARD_PERSONAS.includes(next) && next !== DASHBOARD_PERSONAS.APPLICANT) return;
    setPersonaState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      persona,
      setPersona,
      canSwitchPersona: !!user,
      isApplicantView: persona === DASHBOARD_PERSONAS.APPLICANT,
      isBuyerView: persona === DASHBOARD_PERSONAS.APPLICANT,
      isSellerView: persona === DASHBOARD_PERSONAS.SELLER,
      isServicesView: persona === DASHBOARD_PERSONAS.SERVICES,
      isPostsView: persona === DASHBOARD_PERSONAS.POSTS,
      hydrated,
    }),
    [persona, setPersona, user, hydrated]
  );

  return <DashboardPersonaContext.Provider value={value}>{children}</DashboardPersonaContext.Provider>;
}

export function useDashboardPersona() {
  const ctx = useContext(DashboardPersonaContext);
  if (!ctx) {
    return {
      persona: DASHBOARD_PERSONAS.SELLER,
      setPersona: () => {},
      canSwitchPersona: false,
      isApplicantView: false,
      isBuyerView: false,
      isSellerView: true,
      isServicesView: false,
      isPostsView: false,
      hydrated: true,
    };
  }
  return ctx;
}
