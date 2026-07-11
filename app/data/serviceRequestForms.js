import { L1_CATEGORY_IDS, LEGACY_SERVICE_TYPE_MAP } from "./tradeServicesCatalog";

/** All valid L1 ids plus legacy slugs kept for older links and stored requests */
export const SERVICE_TYPES = [
  ...L1_CATEGORY_IDS,
  "trade",
  "logistics",
  "customs",
  "finance",
  "inspection",
  "insurance",
  "consulting",
  "documents",
];

export function normalizeServiceType(type) {
  return LEGACY_SERVICE_TYPE_MAP[type] || type;
}

export function isValidServiceType(type) {
  return SERVICE_TYPES.includes(type);
}

const genericTradeFields = [
  { name: "originCountry", type: "text", labelKey: "srFormOriginCountry" },
  { name: "destinationCountry", type: "text", labelKey: "srFormDestinationCountry" },
  { name: "serviceScope", type: "textarea", labelKey: "srFormServiceScope" },
];

/** @typedef {{ name: string, type: 'text'|'textarea'|'select'|'number', labelKey: string, options?: {value:string,labelKey:string}[], required?: boolean }} FormField */

/** @type {Record<string, { showTradeType?: boolean, extraFields: FormField[] }>} */
export const serviceRequestFormConfig = {
  "import-export": {
    showTradeType: true,
    extraFields: [
      ...genericTradeFields,
      { name: "incoterm", type: "text", labelKey: "srFormIncoterm" },
    ],
  },
  "intl-logistics": {
    showTradeType: true,
    extraFields: [
      {
        name: "transportMode",
        type: "select",
        labelKey: "srFormTransportMode",
        options: [
          { value: "sea", labelKey: "srFormTransportSea" },
          { value: "air", labelKey: "srFormTransportAir" },
          { value: "road", labelKey: "srFormTransportRoad" },
          { value: "rail", labelKey: "srFormTransportRail" },
          { value: "multimodal", labelKey: "srFormTransportMultimodal" },
        ],
      },
      { name: "originLocation", type: "text", labelKey: "srFormOriginLocation" },
      { name: "destinationLocation", type: "text", labelKey: "srFormDestinationLocation" },
      { name: "cargoWeight", type: "text", labelKey: "srFormCargoWeight" },
    ],
  },
  "customs-clearance": {
    showTradeType: true,
    extraFields: [
      { name: "portOfEntry", type: "text", labelKey: "srFormPortOfEntry" },
      { name: "hsCode", type: "text", labelKey: "srFormHsCode" },
      { name: "declarationType", type: "text", labelKey: "srFormDeclarationType" },
    ],
  },
  "intl-finance": {
    showTradeType: true,
    extraFields: [
      {
        name: "paymentMethod",
        type: "select",
        labelKey: "srFormPaymentMethod",
        options: [
          { value: "lc", labelKey: "srFormPaymentLc" },
          { value: "tt", labelKey: "srFormPaymentTt" },
          { value: "collection", labelKey: "srFormPaymentCollection" },
          { value: "other", labelKey: "srFormPaymentOther" },
        ],
      },
      { name: "bankName", type: "text", labelKey: "srFormBankName" },
    ],
  },
  "inspection-standards": {
    showTradeType: true,
    extraFields: [
      { name: "inspectionType", type: "text", labelKey: "srFormInspectionType" },
      { name: "standardRequired", type: "text", labelKey: "srFormStandardRequired" },
      { name: "inspectionLocation", type: "text", labelKey: "srFormInspectionLocation" },
    ],
  },
  "insurance-risk": {
    showTradeType: true,
    extraFields: [
      { name: "insuranceCoverage", type: "text", labelKey: "srFormInsuranceCoverage" },
      { name: "cargoValue", type: "text", labelKey: "srFormCargoValue" },
      { name: "routeDescription", type: "textarea", labelKey: "srFormRouteDescription" },
    ],
  },
  "legal-trade": {
    showTradeType: false,
    extraFields: [
      { name: "contractType", type: "text", labelKey: "srFormContractType" },
      { name: "jurisdiction", type: "text", labelKey: "srFormJurisdiction" },
      { name: "legalTopic", type: "textarea", labelKey: "srFormLegalTopic" },
    ],
  },
  "market-development": {
    showTradeType: false,
    extraFields: [
      { name: "targetMarket", type: "text", labelKey: "srFormTargetMarket" },
      { name: "marketingGoal", type: "textarea", labelKey: "srFormMarketingGoal" },
    ],
  },
  "packaging-prep": {
    showTradeType: true,
    extraFields: [
      { name: "productType", type: "text", labelKey: "srFormProductType" },
      { name: "packagingRequirements", type: "textarea", labelKey: "srFormPackagingRequirements" },
    ],
  },
  "specialized-trade": {
    showTradeType: false,
    extraFields: [
      { name: "targetMarket", type: "text", labelKey: "srFormTargetMarket" },
      { name: "consultationTopic", type: "textarea", labelKey: "srFormConsultationTopic" },
    ],
  },
  // Legacy aliases — same configs as mapped L1 categories
  trade: {
    showTradeType: true,
    extraFields: [
      { name: "originCountry", type: "text", labelKey: "srFormOriginCountry" },
      { name: "destinationCountry", type: "text", labelKey: "srFormDestinationCountry" },
      { name: "incoterm", type: "text", labelKey: "srFormIncoterm" },
    ],
  },
  logistics: { showTradeType: true, extraFields: [] },
  customs: { showTradeType: true, extraFields: [] },
  finance: { showTradeType: true, extraFields: [] },
  inspection: { showTradeType: true, extraFields: [] },
  insurance: { showTradeType: true, extraFields: [] },
  consulting: { showTradeType: false, extraFields: [] },
  documents: {
    showTradeType: true,
    extraFields: [
      { name: "requiredDocuments", type: "textarea", labelKey: "srFormRequiredDocuments" },
      { name: "shipmentDeadline", type: "text", labelKey: "srFormShipmentDeadline" },
    ],
  },
};

// Fix circular reference for legacy aliases — assign after object is fully defined
serviceRequestFormConfig.logistics.extraFields =
  serviceRequestFormConfig["intl-logistics"].extraFields;
serviceRequestFormConfig.customs.extraFields =
  serviceRequestFormConfig["customs-clearance"].extraFields;
serviceRequestFormConfig.finance.extraFields = serviceRequestFormConfig["intl-finance"].extraFields;
serviceRequestFormConfig.inspection.extraFields =
  serviceRequestFormConfig["inspection-standards"].extraFields;
serviceRequestFormConfig.insurance.extraFields =
  serviceRequestFormConfig["insurance-risk"].extraFields;
serviceRequestFormConfig.consulting.extraFields =
  serviceRequestFormConfig["specialized-trade"].extraFields;

export function getServiceRequestConfig(serviceType) {
  const normalized = normalizeServiceType(serviceType);
  return (
    serviceRequestFormConfig[serviceType] ||
    serviceRequestFormConfig[normalized] ||
    serviceRequestFormConfig["import-export"]
  );
}

export const SERVICE_TYPE_LABELS_FA = {
  "import-export": "خدمات واردات و صادرات",
  "intl-logistics": "حمل‌ونقل و لجستیک بین‌المللی",
  "customs-clearance": "گمرک و ترخیص کالا",
  "intl-finance": "خدمات مالی و پرداخت بین‌المللی",
  "inspection-standards": "بازرسی و استاندارد",
  "insurance-risk": "بیمه و مدیریت ریسک",
  "legal-trade": "خدمات حقوقی و قراردادهای تجاری",
  "market-development": "بازاریابی و توسعه بازار",
  "packaging-prep": "بسته‌بندی و آماده‌سازی کالا",
  "specialized-trade": "خدمات تجاری تخصصی",
  trade: "واردات و صادرات",
  logistics: "حمل‌ونقل بین‌المللی",
  customs: "ترخیص و امور گمرکی",
  finance: "خدمات مالی و بانکی",
  inspection: "بازرسی و گواهی",
  insurance: "بیمه باربری",
  consulting: "مشاوره بازرگانی",
  documents: "خدمات اسنادی",
};

export const DETAIL_FIELD_LABELS_FA = {
  originCountry: "کشور مبدأ",
  destinationCountry: "کشور مقصد",
  incoterm: "اینکوترمز",
  serviceScope: "دامنه خدمات درخواستی",
  transportMode: "روش حمل",
  originLocation: "مبدأ حمل",
  destinationLocation: "مقصد حمل",
  cargoWeight: "وزن / حجم محموله",
  portOfEntry: "گمرک / بندر ورود",
  hsCode: "کد تعرفه (HS)",
  declarationType: "نوع اظهارنامه",
  paymentMethod: "روش پرداخت",
  bankName: "نام بانک",
  inspectionType: "نوع بازرسی",
  standardRequired: "استاندارد موردنیاز",
  inspectionLocation: "محل بازرسی",
  insuranceCoverage: "نوع پوشش بیمه",
  cargoValue: "ارزش محموله",
  routeDescription: "مسیر حمل",
  targetMarket: "بازار هدف",
  consultationTopic: "موضوع مشاوره",
  contractType: "نوع قرارداد",
  jurisdiction: "قانون حاکم / حوزه قضایی",
  legalTopic: "موضوع حقوقی",
  marketingGoal: "هدف بازاریابی",
  productType: "نوع کالا",
  packagingRequirements: "الزامات بسته‌بندی",
  requiredDocuments: "اسناد موردنیاز",
  shipmentDeadline: "مهلت ارسال",
};

export const TRANSPORT_MODE_LABELS_FA = {
  sea: "دریایی",
  air: "هوایی",
  road: "زمینی",
  rail: "ریلی",
  multimodal: "ترکیبی",
};

export const PAYMENT_METHOD_LABELS_FA = {
  lc: "اعتبار اسنادی (LC)",
  tt: "حواله ارزی (TT)",
  collection: "وصول اسنادی",
  other: "سایر",
};
