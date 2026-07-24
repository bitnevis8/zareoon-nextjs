import { isSeller } from "./roles";

export const DASHBOARD_PERSONAS = {
  APPLICANT: "applicant",
  /** @deprecated use APPLICANT — kept for localStorage migration */
  BUYER: "buyer",
  SELLER: "seller",
  SERVICES: "services",
  POSTS: "posts",
};

export const VALID_DASHBOARD_PERSONAS = [
  DASHBOARD_PERSONAS.APPLICANT,
  DASHBOARD_PERSONAS.BUYER,
  DASHBOARD_PERSONAS.SELLER,
  DASHBOARD_PERSONAS.SERVICES,
  DASHBOARD_PERSONAS.POSTS,
];

/** Normalize legacy stored persona values */
export function normalizeDashboardPersona(value) {
  if (value === DASHBOARD_PERSONAS.BUYER) return DASHBOARD_PERSONAS.APPLICANT;
  return value;
}

/** فقط کاربر با نقش فروشنده — نه ادمینِ بدون عضویت فروشگاه */
export function canActAsSeller(user) {
  return isSeller(user);
}

export function getDefaultDashboardPersona(user) {
  // پیش‌فرض: فروشگاه من
  if (!user) return DASHBOARD_PERSONAS.SELLER;
  return DASHBOARD_PERSONAS.SELLER;
}
