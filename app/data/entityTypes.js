export const ENTITY_TYPE_VALUES = [
  "individual",
  "company",
  "trader",
  "manufacturer",
  "distributor",
];

export function getEntityTypeOptions(t) {
  return ENTITY_TYPE_VALUES.map((value) => ({
    value,
    label: t(`entityTypes.${value}`),
  }));
}

/** @deprecated use getEntityTypeOptions(t) */
export const ENTITY_TYPE_OPTIONS = ENTITY_TYPE_VALUES.map((value) => ({ value, label: value }));
