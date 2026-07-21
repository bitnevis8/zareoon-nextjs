import { isSeller } from "./roles";

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

/** فقط کاربر با نقش فروشنده — نه ادمینِ بدون عضویت فروشگاه */
export function canActAsSeller(user) {
  return isSeller(user);
}

export function getDefaultDashboardPersona(user) {
  // هر کاربر لاگین‌شده پیش‌فرض خریدار است؛ فروشنده/خدمات با انتخاب نقش در سایدبار
  if (!user) return DASHBOARD_PERSONAS.APPLICANT;
  return DASHBOARD_PERSONAS.APPLICANT;
}
