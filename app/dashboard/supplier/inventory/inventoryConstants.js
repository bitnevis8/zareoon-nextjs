import { createEmptyDisplayContent } from "./utils/inventoryDisplayLocales";

export const INITIAL_FORM = {
  productId: "",
  farmerId: "",
  farmerLabel: "",
  unit: "kg",
  qualityGrade: "درجه 1",
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

export const QUALITY_GRADES = ["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی"];

export const LOT_STATUSES = [
  { value: "harvested", labelKey: "statusHarvested" },
  { value: "on_field", labelKey: "statusOnField" },
  { value: "reserved", labelKey: "statusReserved" },
  { value: "sold", labelKey: "statusSold" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "qty_desc", label: "بیشترین موجودی" },
  { value: "qty_asc", label: "کمترین موجودی" },
  { value: "price_desc", label: "بیشترین قیمت" },
  { value: "price_asc", label: "کمترین قیمت" },
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
