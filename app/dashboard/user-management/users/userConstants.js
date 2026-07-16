export const DEFAULT_FILTERS = {
  role: "",
  isActive: "",
  isEmailVerified: "",
  isMobileVerified: "",
};

export const SORT_OPTIONS = [
  { value: "id-asc", sortBy: "id", sortOrder: "asc", labelKey: "sort.idAsc" },
  { value: "id-desc", sortBy: "id", sortOrder: "desc", labelKey: "sort.idDesc" },
  { value: "firstName-asc", sortBy: "firstName", sortOrder: "asc", labelKey: "sort.firstNameAsc" },
  { value: "lastName-asc", sortBy: "lastName", sortOrder: "asc", labelKey: "sort.lastNameAsc" },
  { value: "createdAt-desc", sortBy: "createdAt", sortOrder: "desc", labelKey: "sort.newest" },
  { value: "createdAt-asc", sortBy: "createdAt", sortOrder: "asc", labelKey: "sort.oldest" },
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
