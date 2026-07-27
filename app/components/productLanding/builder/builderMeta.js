/** راهنما و کانال‌های تماس بیلدر لندینگ */

export const CONTACT_CHANNELS = [
  { key: "whatsapp", label: "واتساپ", kind: "phone", placeholder: "09xxxxxxxxx یا همان شماره تلفن" },
  { key: "telegram", label: "تلگرام", kind: "handle", placeholder: "@username یا لینک" },
  { key: "eitaa", label: "ایتا", kind: "handle", placeholder: "آیدی یا لینک" },
  { key: "rubika", label: "روبیکا", kind: "handle", placeholder: "آیدی یا لینک" },
  { key: "bale", label: "بله", kind: "handle", placeholder: "آیدی یا لینک" },
  { key: "instagram", label: "اینستاگرام", kind: "social", placeholder: "@username یا لینک پروفایل" },
  { key: "linkedin", label: "لینکدین", kind: "social", placeholder: "لینک پروفایل LinkedIn" },
  { key: "email", label: "ایمیل", kind: "email", placeholder: "name@example.com" },
];

export const GROUP_ICONS = {
  hero: "▣",
  content: "▤",
  media: "⧉",
  commerce: "﷼",
  trust: "✓",
  action: "➤",
  layout: "▁",
  banner: "▬",
  productShowcase: "▦",
  gallery: "⧉",
  features: "✦",
  specifications: "☰",
  pricing: "﷼",
  buy: "⊕",
  productStock: "▤",
  sellerActions: "◎",
  cta: "➤",
  contact: "☎",
  faq: "?",
  reviews: "★",
  statistics: "#",
  team: "☺",
  company: "⌂",
  certificates: "✓",
  downloads: "↓",
  video: "▶",
  timeline: "→",
  logistics: "🚚",
  payment: "$",
  map: "⌖",
  qrCode: "▣",
  footer: "▁",
  columnLayout: "▥",
};

export const BLOCK_HELP = {
  columnLayout: "یک ردیف را به ۲ یا ۳ ستون تقسیم می‌کند؛ در هر ستون بلوک جداگانه بگذارید (مثلاً متن کنار گالری).",
  hero: "بالای صفحه — عنوان محصول، زیرعنوان سئو، تصویر و دکمه اقدام. از محتوای کاتالوگ پر می‌شود.",
  banner: "اعلان کوتاه بالای هیرو (مثلاً پیام B2B یا گواهی).",
  productShowcase: "نمایش محصولات مرتبط یا ویژه.",
  gallery: "گالری تصاویر محصول — معادل بخش رسانه کاتالوگ؛ از «آپلود گالری» پر کنید.",
  features: "نکات کلیدی / مزایا — کارت‌های کوتاه برای سئو و اسکن سریع کاربر. آیتم‌ها: عنوان + توضیح.",
  specifications: "جدول مشخصات فنی/تجاری (MOQ، واحد، HS Code، اینکوترمز) — معادل مشخصات کاتالوگ.",
  pricing: "قیمت متنی یا فراخوان RFQ. برای قیمت زنده از بلوک خرید استفاده کنید.",
  buy: "افزودن به سبد از موجودی متصل به لندینگ — معادل بخش سفارش کاتالوگ.",
  productStock: "نمایش موجودی کل / رزرو / قابل‌سفارش — مثل خلاصه موجودی کاتالوگ.",
  sellerActions: "گفتگو با فروشنده و لینک فروشگاه — معادل اکشن‌های فروشنده در کاتالوگ.",
  cta: "فراخوان اقدام با یک یا دو دکمه؛ نزدیک انتهای صفحه برای تبدیل.",
  contact: "راه‌های ارتباط یا فرم تماس؛ شماره و کانال‌ها را در تنظیمات پر کنید.",
  faq: "سوالات پرتکرار خریداران (آکاردئون) — برای سئو و کاهش تردید. از محتوا‌ی کاتالوگ تزریق می‌شود.",
  reviews: "نظرات مشتریان — در صورت نداشتن نظر واقعی، مخفی کنید یا نمونه بگذارید.",
  statistics: "آمار کلیدی برند/ظرفیت (daisyUI Stats).",
  team: "اعضای تیم فروش/پشتیبانی صادرات.",
  company: "باکس متن سئو (درباره محصول / جمع‌بندی). بدنه را با پاراگراف‌های کامل پر کنید.",
  certificates: "گواهی‌ها و مجوزها — اعتمادسازی برای خریدار B2B.",
  downloads: "لینک کاتالوگ و دیتاشیت.",
  video: "ویدیو معرفی (آپلود یا لینک).",
  timeline: "مراحل فرآیند سفارش — راهنمای کاربرپسند از مشاهده تا تحویل.",
  logistics: "حمل، اینکوترمز و زمان تحویل.",
  payment: "روش‌های پرداخت (TT / LC / توافقی).",
  map: "آدرس و نقشهٔ تعاملی — روی نقشه کلیک کنید تا مارکر ثبت شود و در صفحه نمایش داده شود.",
  qrCode: "QR کد لینک همین لندینگ — قابل دانلود و چاپ مثل QR فروشگاه/کاتالوگ.",
  footer: "پاورقی صفحه با نام برند و لینک‌های کمکی.",
};

export const BLOCK_GUIDE = {
  hero: {
    what: "اولین چیزی که خریدار می‌بیند؛ هویت محصول و CTA.",
    how: "عنوان کوتاه، یک زیرعنوان واضح، تصویر باکیفیت، یک دکمه. متن طولانی را به بلوک «درباره محصول» ببرید.",
  },
  features: {
    what: "اسکن سریع مزایا برای سئو و تصمیم خرید.",
    how: "۳ تا ۵ آیتم؛ هر آیتم یک عنوان + یک جمله. از تکرار جدول مشخصات پرهیز کنید.",
  },
  specifications: {
    what: "اطلاعات تجاری لازم برای RFQ و صادرات.",
    how: "کلید/مقدار تمیز؛ واحد، MOQ، HS Code، Incoterms را حتماً پر کنید.",
  },
  company: {
    what: "متن سئو و توضیح عمیق محصول.",
    how: "۲–۴ پاراگراف طبیعی با نام محصول و دسته؛ از کلیدواژه‌های اجباری و تکرار بی‌معنی پرهیز کنید.",
  },
  faq: {
    what: "پاسخ تردیدهای رایج خریدار عمده.",
    how: "۴–۶ سوال واقعی (MOQ، صادرات، تماس، قیمت). پاسخ‌ها کوتاه و شفاف.",
  },
  map: {
    what: "نمایش موقعیت دفتر یا انبار روی نقشه تعاملی.",
    how: "در تنظیمات بلوک روی نقشه کلیک کنید تا مارکر بگذارید؛ نام مکان و آدرس را هم پر کنید و لندینگ را ذخیره کنید.",
  },
  buy: {
    what: "سفارش واقعی از موجودی.",
    how: "لندینگ را از موجودی بسازید تا قیمت و سبد فعال شود.",
  },
  qrCode: {
    what: "اشتراک‌گذاری سریع صفحه با QR.",
    how: "پس از انتشار لندینگ، QR به آدرس عمومی همان صفحه اشاره می‌کند؛ برای چاپ دانلود کنید.",
  },
  gallery: {
    what: "اثبات بصری کیفیت و بسته‌بندی.",
    how: "حداقل ۳ تصویر واقعی؛ از واترمارک سنگین و لوگو روی همه فریم‌ها پرهیز کنید.",
  },
  columnLayout: {
    what: "چیدمان چندستونه در یک ردیف صفحه.",
    how: "واریانت دو/سه ستون یا اصلی+کناری را انتخاب کنید؛ بعد در تنظیمات، به هر ستون بلوک اضافه کنید. در موبایل به‌صورت پیش‌فرض زیر هم چیده می‌شود.",
  },
};

export function emptyContactEntry() {
  return {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    label: "",
    phone: "",
    channels: {},
  };
}

export function normalizeContacts(props = {}) {
  if (Array.isArray(props.contacts) && props.contacts.length) return props.contacts;
  const phone = props.contactPhone;
  if (!phone && !props.contactWhatsapp && !props.contactEmail) return [];
  const channels = {};
  if (props.contactWhatsapp) channels.whatsapp = String(props.contactWhatsapp);
  else if (phone) channels.whatsapp = String(phone);
  if (props.contactTelegram) channels.telegram = String(props.contactTelegram);
  if (props.contactEmail) channels.email = String(props.contactEmail);
  return [
    {
      id: "legacy",
      label: "تماس",
      phone: phone || "",
      channels,
    },
  ];
}
