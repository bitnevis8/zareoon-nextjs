/** Labels and help text for escrow agreement detail page */

export const MILESTONE_STATUS_LABELS = {
  pending: "در انتظار",
  in_review: "در حال بررسی",
  approved: "تأیید شده",
  released: "آزاد شده",
  cancelled: "لغو شده",
};

export const RELEASE_STATUS_LABELS = {
  pending: "منتظر تأیید خریدار",
  approved: "تأیید شده",
  completed: "انجام شد",
  rejected: "رد شده",
  cancelled: "لغو شده",
};

export const REFUND_STATUS_LABELS = {
  pending: "منتظر تأیید مدیر",
  approved: "تأیید شده",
  completed: "انجام شد",
  rejected: "رد شده",
};

export const DISPUTE_STATUS_LABELS = {
  filed: "ثبت شده",
  under_review: "در حال بررسی",
  resolved_buyer: "حل‌شده — سود خریدار",
  resolved_seller: "حل‌شده — سود فروشنده",
  resolved_split: "حل‌شده — تقسیم",
  closed: "بسته شده",
  withdrawn: "انصراف",
};

export const LEDGER_TYPE_LABELS = {
  deposit_lock: "قفل وجه تضمین",
  platform_fee: "کارمزد سامانه",
  release_to_seller: "آزادسازی به فروشنده",
  refund_to_buyer: "برگشت به خریدار",
  adjustment: "تعدیل",
};

export const ROLE_LABELS = {
  buyer: "خریدار",
  seller: "فروشنده",
  admin: "مدیر",
};

export const WORKFLOW_STEPS = [
  { key: "draft", label: "پیش‌نویس", desc: "قرارداد ثبت شده" },
  { key: "awaiting_payment", label: "منتظر پرداخت", desc: "خریدار باید وجه تضمین را بپردازد" },
  { key: "funds_locked", label: "وجه قفل شد", desc: "وجه در حساب امانی است" },
  { key: "in_progress", label: "در حال انجام", desc: "تحویل و تأیید مراحل" },
  { key: "completed", label: "تکمیل", desc: "معامله به پایان رسید" },
];

export function workflowStepIndex(status) {
  if (status === "draft") return 0;
  if (status === "awaiting_payment") return 1;
  if (status === "funds_locked") return 2;
  if (["in_progress", "partially_released", "disputed"].includes(status)) return 3;
  if (["completed", "fully_released", "refunded", "cancelled", "expired"].includes(status)) return 4;
  return 0;
}

const ESCROW_GENERIC_HINT =
  "از بخش «اقدامات بعدی» مرحله مناسب را انتخاب کنید. هر دکمه توضیح دارد که چه کاری انجام می‌دهد.";

export function getStatusGuide(agreement, role) {
  const s = agreement?.status;
  const roleFa = ROLE_LABELS[role] || role;

  const guides = {
    draft: {
      title: "قرارداد هنوز فعال نشده",
      body:
        role === "admin"
          ? "قرارداد در پیش‌نویس است. با «فعال‌سازی» آن را آماده پرداخت کنید تا خریدار بتواند وجه تضمین را واریز کند."
          : role === "buyer"
            ? "پس از بررسی جزئیات با فروشنده، قرارداد را فعال کنید و سپس وجه تضمین را پرداخت نمایید."
            : role === "seller"
              ? "پس از توافق با خریدار، قرارداد را فعال کنید تا خریدار بتواند وجه تضمین را واریز کند."
              : `وضعیت فعلی: پیش‌نویس. نقش شما: ${roleFa}.`,
    },
    awaiting_payment: {
      title: "منتظر پرداخت وجه تضمین",
      body:
        role === "buyer" || role === "admin"
          ? "ابتدا «درخواست پرداخت» ایجاد شود، سپس از درگاه بانکی پرداخت کنید. تا اتصال درگاه، مدیر می‌تواند با «تأیید آزمایشی» پرداخت را شبیه‌سازی کند."
          : "خریدار باید وجه تضمین را پرداخت کند. پس از قفل شدن وجه، فرآیند تحویل و آزادسازی آغاز می‌شود.",
    },
    funds_locked: {
      title: "وجه تضمین قفل شد",
      body: "وجه نزد زارعون امن است. فروشنده تعهدات را انجام دهد؛ خریدار پس از تحویل، مراحل را تأیید کند تا وجه آزاد شود.",
    },
    in_progress: {
      title: "معامله در جریان است",
      body: "مراحل تحویل را یکی‌یکی تأیید کنید. پس از تکمیل همه مراحل، وجه به فروشنده آزاد می‌شود.",
    },
    partially_released: {
      title: "بخشی از وجه آزاد شده",
      body: "هنوز مبلغی در حساب امانی باقی است. مراحل باقی‌مانده را تکمیل کنید یا درخواست آزادسازی ثبت نمایید.",
    },
    disputed: {
      title: "اختلاف ثبت شده",
      body: "تیم زارعون یا مدیر باید اختلاف را بررسی و حل کند. تا زمان حل، وجه قفل می‌ماند.",
    },
    completed: {
      title: "قرارداد تکمیل شد",
      body: "همه مراحل انجام شده و فرآیند به پایان رسیده است.",
    },
    cancelled: {
      title: "قرارداد لغو شد",
      body: "این قرارداد دیگر فعال نیست.",
    },
  };

  return guides[s] || { title: "وضعیت قرارداد", body: ESCROW_GENERIC_HINT };
}

export const ESCROW_ACTIONS = {
  activate: {
    id: "activate",
    title: "فعال‌سازی قرارداد",
    shortLabel: "فعال‌سازی",
    description:
      "قرارداد از حالت پیش‌نویس خارج می‌شود و برای پرداخت وجه تضمین آماده می‌گردد. پس از این مرحله، خریدار باید مبلغ تضمین را واریز کند.",
    who: "خریدار، فروشنده یا مدیر",
    variant: "primary",
  },
  createPaymentIntent: {
    id: "createPaymentIntent",
    title: "ایجاد درخواست پرداخت",
    shortLabel: "درخواست پرداخت",
    description:
      "یک درخواست رسمی برای پرداخت وجه تضمین ثبت می‌شود. خریدار از طریق درگاه بانکی (پس از اتصال) این مبلغ را پرداخت می‌کند.",
    who: "خریدار یا مدیر",
    variant: "primary",
  },
  confirmPaymentDemo: {
    id: "confirmPaymentDemo",
    title: "تأیید پرداخت (حالت آزمایشی)",
    shortLabel: "تأیید آزمایشی",
    description:
      "فقط برای تست سیستم — شبیه‌سازی تأیید بانک. در محیط واقعی، درگاه پرداخت خودکار این کار را انجام می‌دهد و نیازی به این دکمه نیست.",
    who: "مدیر (آزمایش)",
    variant: "demo",
    badge: "آزمایشی",
  },
  requestRelease: {
    id: "requestRelease",
    title: "درخواست آزادسازی به فروشنده",
    shortLabel: "درخواست آزادسازی",
    description:
      "فروشنده درخواست می‌کند بخشی از وجه قفل‌شده آزاد شود. خریدار یا مدیر باید درخواست را تأیید کند.",
    who: "فروشنده یا مدیر",
    variant: "primary",
  },
  cancel: {
    id: "cancel",
    title: "لغو قرارداد",
    shortLabel: "لغو",
    description:
      "قرارداد باطل می‌شود. اگر هنوز وجهی قفل نشده باشد، بدون پیچیدگی لغو می‌شود. در غیر این صورت ممکن است نیاز به برگشت وجه باشد.",
    who: "هر یک از طرفین یا مدیر",
    variant: "danger",
  },
  openDispute: {
    id: "openDispute",
    title: "ثبت اختلاف",
    shortLabel: "ثبت اختلاف",
    description:
      "اگر کالا/خدمت مطابق قرارداد نبود یا طرف مقابل تعهدش را انجام نداد، اختلاف ثبت کنید. وجه تا حل اختلاف قفل می‌ماند.",
    who: "خریدار یا فروشنده",
    variant: "warning",
  },
  requestRefund: {
    id: "requestRefund",
    title: "درخواست برگشت وجه",
    shortLabel: "برگشت وجه",
    description: "درخواست بازگرداندن وجه قفل‌شده به خریدار. مدیر باید درخواست را بررسی و تأیید کند.",
    who: "خریدار، فروشنده یا مدیر",
    variant: "secondary",
  },
};
