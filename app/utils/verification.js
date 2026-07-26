export const VERIFICATION_LEVEL_LABELS_FA = {
  none: "بدون درجه",
  basic: "پایه",
  standard: "استاندارد",
  enhanced: "پیشرفته",
  full: "کامل",
  u0: "عادی",
  u1: "تماس",
  u2: "هویت",
  u3: "کامل",
  b0: "ثبت",
  b1: "احراز",
  b2: "معامله",
};

export const VERIFICATION_STATUS_LABELS_FA = {
  none: "ارسال‌نشده",
  pending: "در انتظار بررسی",
  verified: "تأییدشده",
  rejected: "ردشده",
};

/** سطوح داخلی API (سازگاری با دیتابیس) */
export const LEVEL_ORDER = ["basic", "standard", "enhanced", "full"];

export const LEVEL_STEP_NUMBER = {
  basic: 1,
  standard: 2,
  enhanced: 3,
  full: 4,
};

/** مسیر نمایشی شخص: U0 → U1 → U2 → U3 */
export const PERSON_PATH = [
  { id: "u0", code: "U0", titleFa: "عادی", hintFa: "ثبت‌نام شده" },
  { id: "u1", code: "U1", titleFa: "تماس", hintFa: "موبایل یا ایمیل تأییدشده" },
  { id: "u2", code: "U2", titleFa: "هویت", hintFa: "مدارک هویتی" },
  { id: "u3", code: "U3", titleFa: "کامل", hintFa: "تطبیق کدملی و کدپستی" },
];

/** مسیر نمایشی کسب‌وکار: B0 → B1 → B2 */
export const BUSINESS_PATH = [
  { id: "b0", code: "B0", titleFa: "ثبت", hintFa: "کسب‌وکار ساخته شده" },
  { id: "b1", code: "B1", titleFa: "احراز", hintFa: "مدارک کسب‌وکار" },
  { id: "b2", code: "B2", titleFa: "معامله", hintFa: "مجوز و شبا" },
];

/**
 * چند پله از مسیر شخص رسیده است؟
 * contactVerified = isMobileVerified || isEmailVerified
 * level/overall از احراز مدارک
 */
export function resolvePersonPathReached({
  contactVerified = false,
  overall = "none",
  level = "none",
} = {}) {
  let n = 1; // U0 همیشه برای کاربر لاگین‌شده
  if (contactVerified) n = 2; // U1
  const lv = String(level || "none").toLowerCase();
  const ok = overall === "verified" || overall === "pending";
  if (ok && (lv === "basic" || lv === "standard" || lv === "u2")) n = Math.max(n, 3);
  if (ok && (lv === "enhanced" || lv === "full" || lv === "u3")) n = Math.max(n, 4);
  if (overall === "verified" && LEVEL_ORDER.includes(lv)) {
    const idx = LEVEL_ORDER.indexOf(lv);
    if (idx >= 0) n = Math.max(n, idx <= 1 ? 3 : 4);
  }
  return Math.min(n, 4);
}

export function resolveBusinessPathReached({
  hasWorkspace = false,
  overall = "none",
  level = "none",
} = {}) {
  if (!hasWorkspace) return 0;
  let n = 1; // B0
  const lv = String(level || "none").toLowerCase();
  const ok = overall === "verified" || overall === "pending";
  if (ok && LEVEL_ORDER.includes(lv)) {
    const idx = LEVEL_ORDER.indexOf(lv);
    if (idx <= 1) n = 2; // B1
    else n = 3; // B2
  }
  if (ok && (lv === "b1" || lv === "basic" || lv === "standard")) n = Math.max(n, 2);
  if (ok && (lv === "b2" || lv === "enhanced" || lv === "full")) n = Math.max(n, 3);
  return Math.min(n, 3);
}

export const PERSON_LEVEL_REQUIREMENTS = {
  basic: {
    step: 1,
    labelFa: "پایه",
    titleFa: "هویت پایه",
    fields: ["firstName", "lastName", "nationalId"],
    documentKinds: ["national_id_front"],
    summaryFa: "نام، نام‌خانوادگی، کد ملی و تصویر روی کارت ملی",
  },
  standard: {
    step: 2,
    labelFa: "استاندارد",
    titleFa: "هویت استاندارد",
    fields: ["firstName", "lastName", "nationalId", "birthDate", "fatherName"],
    documentKinds: ["national_id_front", "national_id_back"],
    summaryFa: "اطلاعات پایه + تاریخ تولد، نام پدر و پشت کارت ملی",
  },
  enhanced: {
    step: 3,
    labelFa: "پیشرفته",
    titleFa: "هویت پیشرفته",
    fields: [
      "firstName",
      "lastName",
      "nationalId",
      "birthDate",
      "fatherName",
      "address",
      "postalCode",
      "city",
      "province",
    ],
    documentKinds: ["national_id_front", "national_id_back", "selfie_with_id"],
    summaryFa: "اطلاعات استاندارد + آدرس کامل و سلفی با کارت",
  },
  full: {
    step: 4,
    labelFa: "کامل",
    titleFa: "هویت کامل",
    fields: [
      "firstName",
      "lastName",
      "nationalId",
      "birthDate",
      "fatherName",
      "address",
      "postalCode",
      "city",
      "province",
      "nationalCardSerial",
      "occupation",
    ],
    documentKinds: ["national_id_front", "national_id_back", "selfie_with_id", "video_intro"],
    summaryFa: "همه اطلاعات + سریال کارت و ویدیوی معرفی کوتاه",
  },
};

export const BUSINESS_INDIVIDUAL_LEVEL_REQUIREMENTS = {
  basic: {
    step: 1,
    labelFa: "پایه",
    titleFa: "کسب‌وکار حقیقی — پایه",
    fields: ["legalName", "nationalId"],
    documentKinds: ["owner_national_id_front"],
    summaryFa: "نام کسب‌وکار، کد ملی صاحب و تصویر روی کارت ملی",
  },
  standard: {
    step: 2,
    labelFa: "استاندارد",
    titleFa: "کسب‌وکار حقیقی — استاندارد",
    fields: ["legalName", "nationalId", "tradeName", "address", "city", "province", "phone"],
    documentKinds: ["owner_national_id_front", "owner_national_id_back"],
    summaryFa: "پایه + نام تجاری، آدرس، تلفن و پشت کارت ملی",
  },
  enhanced: {
    step: 3,
    labelFa: "پیشرفته",
    titleFa: "کسب‌وکار حقیقی — پیشرفته",
    fields: [
      "legalName",
      "nationalId",
      "tradeName",
      "address",
      "city",
      "province",
      "phone",
      "postalCode",
      "email",
      "licenseNumber",
    ],
    documentKinds: [
      "owner_national_id_front",
      "owner_national_id_back",
      "selfie_with_id",
      "license",
      "address_proof",
    ],
    summaryFa: "استاندارد + کدپستی، ایمیل، مجوز صنفی، سلفی و مدرک آدرس",
  },
  full: {
    step: 4,
    labelFa: "کامل",
    titleFa: "کسب‌وکار حقیقی — کامل",
    fields: [
      "legalName",
      "nationalId",
      "tradeName",
      "address",
      "city",
      "province",
      "phone",
      "postalCode",
      "email",
      "licenseNumber",
      "bankName",
      "bankAccountIban",
      "accountHolderName",
    ],
    documentKinds: [
      "owner_national_id_front",
      "owner_national_id_back",
      "selfie_with_id",
      "license",
      "address_proof",
      "iban_proof",
      "video_intro",
    ],
    summaryFa: "پیشرفته + شبا، نام بانک، دارنده حساب، تأییدیه شبا و ویدیو",
  },
};

export const BUSINESS_COMPANY_LEVEL_REQUIREMENTS = {
  basic: {
    step: 1,
    labelFa: "پایه",
    titleFa: "کسب‌وکار حقوقی — پایه",
    fields: ["legalName"],
    requireAnyOf: [["nationalId", "registrationNumber"]],
    documentKinds: ["national_id_cert"],
    summaryFa: "نام قانونی شرکت، شناسه ملی یا شماره ثبت، گواهی شناسه ملی",
  },
  standard: {
    step: 2,
    labelFa: "استاندارد",
    titleFa: "کسب‌وکار حقوقی — استاندارد",
    fields: ["legalName", "tradeName", "address", "city", "province"],
    requireAnyOf: [["nationalId", "registrationNumber"]],
    documentKinds: ["national_id_cert", "registration_gazette"],
    summaryFa: "پایه + نام تجاری، آدرس و روزنامه رسمی / آگهی تأسیس",
  },
  enhanced: {
    step: 3,
    labelFa: "پیشرفته",
    titleFa: "کسب‌وکار حقوقی — پیشرفته",
    fields: [
      "legalName",
      "tradeName",
      "address",
      "city",
      "province",
      "economicCode",
      "phone",
      "email",
      "ceoName",
      "licenseNumber",
    ],
    requireAnyOf: [["nationalId", "registrationNumber"]],
    documentKinds: ["national_id_cert", "registration_gazette", "license", "address_proof"],
    summaryFa: "استاندارد + کد اقتصادی، تماس، مدیرعامل، مجوز و مدرک آدرس",
  },
  full: {
    step: 4,
    labelFa: "کامل",
    titleFa: "کسب‌وکار حقوقی — کامل",
    fields: [
      "legalName",
      "tradeName",
      "address",
      "city",
      "province",
      "economicCode",
      "phone",
      "email",
      "ceoName",
      "ceoNationalId",
      "licenseNumber",
      "bankName",
      "bankAccountIban",
      "accountHolderName",
    ],
    requireAnyOf: [["nationalId", "registrationNumber"]],
    documentKinds: [
      "national_id_cert",
      "registration_gazette",
      "license",
      "address_proof",
      "iban_proof",
      "video_intro",
    ],
    summaryFa: "پیشرفته + کد ملی مدیرعامل، شبا، تأییدیه بانکی و ویدیوی معرفی",
  },
};

/** پیش‌فرض حقوقی برای سازگاری */
export const BUSINESS_LEVEL_REQUIREMENTS = BUSINESS_COMPANY_LEVEL_REQUIREMENTS;

export function isIndividualEntity(entityType) {
  return String(entityType || "").toLowerCase() === "individual";
}

export function getBusinessRequirementsMap(entityType) {
  return isIndividualEntity(entityType)
    ? BUSINESS_INDIVIDUAL_LEVEL_REQUIREMENTS
    : BUSINESS_COMPANY_LEVEL_REQUIREMENTS;
}

export function getBusinessDocKinds(entityType) {
  if (isIndividualEntity(entityType)) {
    return [
      { value: "owner_national_id_front", label: "روی کارت ملی صاحب کسب‌وکار" },
      { value: "owner_national_id_back", label: "پشت کارت ملی صاحب کسب‌وکار" },
      { value: "selfie_with_id", label: "سلفی با کارت ملی" },
      { value: "license", label: "مجوز صنفی / پروانه کسب" },
      { value: "address_proof", label: "مدرک آدرس" },
      { value: "iban_proof", label: "تأییدیه شبا / حساب بانکی" },
      { value: "video_intro", label: "ویدیوی معرفی کسب‌وکار" },
      { value: "other", label: "سایر مدارک" },
    ];
  }
  return [
    { value: "national_id_cert", label: "گواهی شناسه ملی شرکت" },
    { value: "registration_gazette", label: "روزنامه رسمی / آگهی تأسیس" },
    { value: "license", label: "مجوز فعالیت" },
    { value: "address_proof", label: "مدرک آدرس" },
    { value: "iban_proof", label: "تأییدیه شبا / حساب بانکی" },
    { value: "video_intro", label: "ویدیوی معرفی کسب‌وکار" },
    { value: "other", label: "سایر مدارک" },
  ];
}

export function statusToneClass(status) {
  if (status === "verified") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "rejected") return "bg-rose-50 text-rose-900 ring-rose-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

export function normalizeVerifiedLevel(level) {
  const v = String(level || "none").toLowerCase();
  if (LEVEL_ORDER.includes(v)) return v;
  return "none";
}

export function getNextRequestableLevel(verifiedLevel) {
  const cur = normalizeVerifiedLevel(verifiedLevel);
  if (cur === "none") return "basic";
  const idx = LEVEL_ORDER.indexOf(cur);
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

export function isLevelCompleted(targetLevel, verifiedLevel) {
  const t = LEVEL_ORDER.indexOf(targetLevel);
  const v = LEVEL_ORDER.indexOf(normalizeVerifiedLevel(verifiedLevel));
  return t >= 0 && v >= t;
}

export function isLevelActive(targetLevel, verifiedLevel, overallStatus) {
  if (overallStatus === "pending") {
    return false;
  }
  return getNextRequestableLevel(verifiedLevel) === targetLevel;
}

export function fieldLabelFa(key) {
  const map = {
    firstName: "نام",
    lastName: "نام خانوادگی",
    fatherName: "نام پدر",
    nationalId: "کد ملی / شناسه ملی",
    birthDate: "تاریخ تولد",
    birthPlace: "محل تولد",
    nationalCardSerial: "سریال کارت ملی",
    address: "آدرس",
    postalCode: "کدپستی",
    city: "شهر",
    province: "استان",
    occupation: "شغل",
    legalName: "نام قانونی",
    tradeName: "نام تجاری",
    entityType: "نوع شخصیت",
    registrationNumber: "شماره ثبت",
    economicCode: "کد اقتصادی",
    phone: "تلفن",
    email: "ایمیل",
    licenseNumber: "شماره مجوز",
    bankName: "نام بانک",
    bankAccountIban: "شبا",
    accountHolderName: "نام دارنده حساب",
    ceoName: "نام مدیرعامل",
    ceoNationalId: "کد ملی مدیرعامل",
    "nationalId|registrationNumber": "شناسه ملی یا شماره ثبت",
  };
  return map[key] || key;
}
