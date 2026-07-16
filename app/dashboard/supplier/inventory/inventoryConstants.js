import { createEmptyDisplayContent } from "./utils/inventoryDisplayLocales";
import i18nData from "@/app/utils/i18nFaData";

export const INITIAL_FORM = {
  productId: "",
  farmerId: "",
  farmerLabel: "",
  unit: "kg",
  qualityGrade: i18nData.defaultQualityGrade,
  totalQuantity: "",
  price: "",
  priceCurrency: "TOMAN",
  minimumOrderQuantity: "",
  tieredPricing: [],
  status: "harvested",
  displayContent: createEmptyDisplayContent(),
  locationLabel: "",
  latitude: "",
  longitude: "",
};

export const EMPTY_TIER = { minQuantity: "", maxQuantity: "", pricePerUnit: "", description: "" };

export const QUALITY_GRADES = i18nData.qualityGrades;

export const LOT_STATUSES = [
  { value: "harvested", labelKey: "statusHarvested" },
  { value: "on_field", labelKey: "statusOnField" },
  { value: "reserved", labelKey: "statusReserved" },
  { value: "sold", labelKey: "statusSold" },
];

export const SORT_OPTIONS = [
  { value: "newest", labelKey: "sort.newest" },
  { value: "oldest", labelKey: "sort.oldest" },
  { value: "qty_desc", labelKey: "sort.qtyDesc" },
  { value: "qty_asc", labelKey: "sort.qtyAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
  { value: "price_asc", labelKey: "sort.priceAsc" },
];

export const DEFAULT_FILTERS = {
  search: "",
  productId: "",
  qualityGrade: "",
  status: "",
  farmerId: "",
  hasPrice: "",
  sort: "newest",
};
