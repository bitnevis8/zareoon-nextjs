"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  DASHBOARD_PERSONAS,
  VALID_DASHBOARD_PERSONAS,
  getDefaultDashboardPersona,
  normalizeDashboardPersona,
} from "@/app/utils/dashboardPersona";

const STORAGE_KEY = "zareoon_dashboard_persona";

const DashboardPersonaContext = createContext(null);

function readStoredPersona(user) {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VALID_DASHBOARD_PERSONAS.includes(stored)) {
      const normalized = normalizeDashboardPersona(stored);
      if (stored === DASHBOARD_PERSONAS.BUYER) {
        localStorage.setItem(STORAGE_KEY, DASHBOARD_PERSONAS.APPLICANT);
      }
      return normalized;
    }
  }
  if (user) return getDefaultDashboardPersona(user);
  return DASHBOARD_PERSONAS.APPLICANT;
}

export function DashboardPersonaProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user;
  const [persona, setPersonaState] = useState(() => readStoredPersona(null));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPersonaState(readStoredPersona(user));
    setHydrated(true);
  }, [user]);

  const setPersona = useCallback((next) => {
    const normalized = normalizeDashboardPersona(next);
    if (!VALID_DASHBOARD_PERSONAS.includes(next) && next !== DASHBOARD_PERSONAS.APPLICANT) return;
    setPersonaState(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, normalized);
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
      persona: DASHBOARD_PERSONAS.APPLICANT,
      setPersona: () => {},
      canSwitchPersona: false,
      isApplicantView: true,
      isBuyerView: true,
      isSellerView: false,
      isServicesView: false,
      hydrated: true,
    };
  }
  return ctx;
}
