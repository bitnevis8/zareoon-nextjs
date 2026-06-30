export const SERVICE_TYPES = [
  "trade",
  "logistics",
  "customs",
  "finance",
  "inspection",
  "insurance",
  "consulting",
  "documents",
];

export function isValidServiceType(type) {
  return SERVICE_TYPES.includes(type);
}

/** @typedef {{ name: string, type: 'text'|'textarea'|'select'|'number', labelKey: string, options?: {value:string,labelKey:string}[], required?: boolean }} FormField */

/** @type {Record<string, { showTradeType?: boolean, extraFields: FormField[] }>} */
export const serviceRequestFormConfig = {
  trade: {
    showTradeType: true,
    extraFields: [
      { name: "originCountry", type: "text", labelKey: "srFormOriginCountry" },
      { name: "destinationCountry", type: "text", labelKey: "srFormDestinationCountry" },
      { name: "incoterm", type: "text", labelKey: "srFormIncoterm" },
    ],
  },
  logistics: {
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
        ],
      },
      { name: "originLocation", type: "text", labelKey: "srFormOriginLocation" },
      { name: "destinationLocation", type: "text", labelKey: "srFormDestinationLocation" },
      { name: "cargoWeight", type: "text", labelKey: "srFormCargoWeight" },
    ],
  },
  customs: {
    showTradeType: true,
    extraFields: [
      { name: "portOfEntry", type: "text", labelKey: "srFormPortOfEntry" },
      { name: "hsCode", type: "text", labelKey: "srFormHsCode" },
      { name: "declarationType", type: "text", labelKey: "srFormDeclarationType" },
    ],
  },
  finance: {
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
  inspection: {
    showTradeType: true,
    extraFields: [
      { name: "inspectionType", type: "text", labelKey: "srFormInspectionType" },
      { name: "standardRequired", type: "text", labelKey: "srFormStandardRequired" },
      { name: "inspectionLocation", type: "text", labelKey: "srFormInspectionLocation" },
    ],
  },
  insurance: {
    showTradeType: true,
    extraFields: [
      { name: "insuranceCoverage", type: "text", labelKey: "srFormInsuranceCoverage" },
      { name: "cargoValue", type: "text", labelKey: "srFormCargoValue" },
      { name: "routeDescription", type: "textarea", labelKey: "srFormRouteDescription" },
    ],
  },
  consulting: {
    showTradeType: false,
    extraFields: [
      { name: "targetMarket", type: "text", labelKey: "srFormTargetMarket" },
      { name: "consultationTopic", type: "textarea", labelKey: "srFormConsultationTopic" },
    ],
  },
  documents: {
    showTradeType: true,
    extraFields: [
      { name: "requiredDocuments", type: "textarea", labelKey: "srFormRequiredDocuments" },
      { name: "shipmentDeadline", type: "text", labelKey: "srFormShipmentDeadline" },
    ],
  },
};

export const SERVICE_TYPE_LABELS_FA = {
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
  requiredDocuments: "اسناد موردنیاز",
  shipmentDeadline: "مهلت ارسال",
};

export const TRANSPORT_MODE_LABELS_FA = {
  sea: "دریایی",
  air: "هوایی",
  road: "زمینی",
  rail: "ریلی",
};

export const PAYMENT_METHOD_LABELS_FA = {
  lc: "اعتبار اسنادی (LC)",
  tt: "حواله ارزی (TT)",
  collection: "وصول اسنادی",
  other: "سایر",
};
