import { isAdmin, isSeller, shouldShowSellerPanel } from "./roles";

export const DASHBOARD_PERSONAS = {
  APPLICANT: "applicant",
  /** @deprecated use APPLICANT — kept for localStorage migration */
  BUYER: "buyer",
  SELLER: "seller",
  SERVICES: "services",
};

export const VALID_DASHBOARD_PERSONAS = [
  DASHBOARD_PERSONAS.APPLICANT,
  DASHBOARD_PERSONAS.BUYER,
  DASHBOARD_PERSONAS.SELLER,
  DASHBOARD_PERSONAS.SERVICES,
];

/** Normalize legacy stored persona values */
export function normalizeDashboardPersona(value) {
  if (value === DASHBOARD_PERSONAS.BUYER) return DASHBOARD_PERSONAS.APPLICANT;
  return value;
}

export function canActAsSeller(user) {
  return shouldShowSellerPanel(user);
}

export function getDefaultDashboardPersona(user) {
  if (!user) return DASHBOARD_PERSONAS.APPLICANT;
  if (isSeller(user) && !isAdmin(user)) return DASHBOARD_PERSONAS.SELLER;
  return DASHBOARD_PERSONAS.APPLICANT;
}
