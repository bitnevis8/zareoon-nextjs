export const DEFAULT_FILTERS = {
  role: "",
  isActive: "",
  isEmailVerified: "",
  isMobileVerified: "",
};

export const SORT_OPTIONS = [
  { value: "id-asc", sortBy: "id", sortOrder: "asc", label: "شناسه (صعودی)" },
  { value: "id-desc", sortBy: "id", sortOrder: "desc", label: "شناسه (نزولی)" },
  { value: "firstName-asc", sortBy: "firstName", sortOrder: "asc", label: "نام (الفبا)" },
  { value: "lastName-asc", sortBy: "lastName", sortOrder: "asc", label: "نام خانوادگی (الفبا)" },
  { value: "createdAt-desc", sortBy: "createdAt", sortOrder: "desc", label: "جدیدترین" },
  { value: "createdAt-asc", sortBy: "createdAt", sortOrder: "asc", label: "قدیمی‌ترین" },
];

export function countActiveFilters(filters) {
  return Object.values(filters).filter((v) => v !== "").length;
}

export function sortValueFromState(sortBy, sortOrder) {
  return `${sortBy}-${sortOrder}`;
}

export function sortStateFromValue(value) {
  const opt = SORT_OPTIONS.find((o) => o.value === value);
  if (opt) return { sortBy: opt.sortBy, sortOrder: opt.sortOrder };
  return { sortBy: "id", sortOrder: "asc" };
}
