/**
 * Incoterms® 2020 — دادهٔ راهنمای تعاملی زارعون (Data-driven)
 * برای ویرایش آینده از پنل ادمین: همین ساختار را در API/CMS نگه دارید.
 *
 * stageIndex (نقطه انتقال ریسک روی مسیر بصری ۰–۶):
 * 0 فروشنده / کارخانه
 * 1 ترخیص صادرات / مبدأ
 * 2 تحویل به حمل‌کننده / پایانه مبدأ
 * 3 بارگیری روی وسیله اصلی / روی کشتی
 * 4 حمل اصلی / در مسیر
 * 5 رسیدن به مقصد / پایانه مقصد
 * 6 محل توافق‌شده نزد خریدار (+ ترخیص واردات در DDP)
 */

export const INCOTERMS_META = {
  version: "2020",
  trademarkNote:
    "Incoterms® علامت تجاری اتاق بازرگانی بین‌المللی (ICC) است. این راهنما جنبه آموزشی و کاربردی دارد و جایگزین متن رسمی ICC یا مشاوره حقوقی نیست. شرط را همیشه صریح در قرارداد بنویسید (مثلاً FOB Bandar Abbas Incoterms® 2020).",
  titleFa: "راهنمای شرایط تحویل بین‌المللی",
  titleEn: "Incoterms® 2020 Guide",
  subtitleFa:
    "یازده شرط رسمی را مرور کنید، ببینید هزینه و ریسک با کیست، و چند شرط را کنار هم مقایسه کنید — قبل از بستن قرارداد واردات یا صادرات.",
};

export const TRANSPORT_MODES = [
  { id: "any", labelFa: "همه روش‌ها", labelEn: "Any mode" },
  { id: "sea", labelFa: "دریایی / آبراه داخلی", labelEn: "Sea / inland waterway" },
  { id: "multimodal", labelFa: "چندوجهی / غیر دریایی", labelEn: "Multimodal / non-sea" },
];

export const JOURNEY_STAGES = [
  { id: "seller", labelFa: "محل فروشنده", shortFa: "فروشنده" },
  { id: "export", labelFa: "ترخیص صادرات", shortFa: "صادرات" },
  { id: "handover", labelFa: "تحویل به حمل‌کننده", shortFa: "حمل‌کننده" },
  { id: "onload", labelFa: "بارگیری / روی وسیله", shortFa: "بارگیری" },
  { id: "transit", labelFa: "حمل اصلی", shortFa: "حمل" },
  { id: "arrival", labelFa: "رسیدن به مقصد", shortFa: "مقصد" },
  { id: "buyer", labelFa: "تحویل به خریدار", shortFa: "خریدار" },
];

/** party: seller | buyer | shared | none | optional */
export const INCOTERMS_2020 = [
  {
    id: "exw",
    code: "EXW",
    nameFa: "تحویل در محل فروشنده",
    nameEn: "Ex Works",
    group: "E",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "حداقل تعهد فروشنده: کالا را در محل خودش (کارخانه/انبار) در اختیار خریدار می‌گذارد. خریدار تقریباً همه هزینه‌ها، حمل، بیمه و تشریفات را بر عهده دارد.",
    sellerDuties: [
      "آماده‌سازی کالا مطابق قرارداد",
      "بسته‌بندی مناسب برای حمل (مگر خلاف توافق)",
      "در اختیار گذاشتن کالا در محل و زمان توافق‌شده",
      "همکاری در ارائه اطلاعات لازم برای صادرات (در حد متعارف)",
    ],
    buyerDuties: [
      "ترتیب و هزینه بارگیری از محل فروشنده (معمولاً)",
      "حمل داخلی مبدأ، حمل اصلی و حمل مقصد",
      "ترخیص صادرات و واردات",
      "بیمه (اختیاری ولی توصیه‌شده)",
      "پرداخت ثمن طبق قرارداد",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "buyer",
      exportClearance: "buyer",
      mainCarriage: "buyer",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "buyer",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 0,
      labelFa: "از لحظه در اختیار گذاشتن کالا در محل فروشنده",
    },
    pros: [
      "ساده برای فروشنده تازه‌کار صادرات",
      "کنترل کامل زنجیره لجستیک برای خریدار حرفه‌ای",
    ],
    cons: [
      "برای خریدار خارجی در عمل سخت است (بارگیری و ترخیص صادرات در کشور فروشنده)",
      "ریسک و هزینه زیاد سمت خریدار",
    ],
    warnings: [
      "در بسیاری معاملات واقعی، بارگیری توسط فروشنده انجام می‌شود؛ اگر چنین است، FCA مناسب‌تر است.",
      "ترخیص صادرات توسط خریدار خارجی اغلب غیرعملی است.",
    ],
    examples: [
      "کارخانه خشکبار در کرمان، خرما را روی اسکله کارخانه تحویل می‌دهد و خریدار اماراتی باید بارگیری، حمل تا بندر و صادرات را خودش هماهنگ کند.",
    ],
    tags: ["حداقل تعهد فروشنده", "خریدار قوی در لجستیک"],
  },
  {
    id: "fca",
    code: "FCA",
    nameFa: "تحویل به حمل‌کننده",
    nameEn: "Free Carrier",
    group: "F",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "فروشنده کالا را به حمل‌کننده معرفی‌شده خریدار (یا شخص دیگری) در محل توافق‌شده تحویل می‌دهد و معمولاً ترخیص صادرات را انجام می‌دهد. برای حمل هوایی، جاده‌ای، ریلی و حتی دریایی بسیار کاربردی است.",
    sellerDuties: [
      "آماده‌سازی و بسته‌بندی کالا",
      "ترخیص صادرات",
      "تحویل به حمل‌کننده در محل توافق‌شده (محل فروشنده یا پایانه)",
      "ارائه مدارک تحویل / همکاری برای بارنامه",
    ],
    buyerDuties: [
      "قرارداد حمل اصلی از نقطه تحویل به بعد",
      "بیمه (اختیاری)",
      "ترخیص واردات و هزینه‌های مقصد",
      "تخلیه و حمل داخلی مقصد",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "buyer",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "buyer",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 2,
      labelFa: "هنگام تحویل کالا به حمل‌کننده در محل توافق‌شده",
    },
    pros: [
      "واقع‌گرایانه‌تر از EXW برای تجارت بین‌الملل",
      "مناسب همه روش‌های حمل",
      "امکان صدور بارنامه دریایی با ترتیب خاص FCA",
    ],
    cons: [
      "تعیین دقیق «محل تحویل» حیاتی است؛ ابهام باعث اختلاف می‌شود",
    ],
    warnings: [
      "اگر تحویل در محل فروشنده باشد، بارگیری معمولاً با فروشنده است؛ اگر در پایانه باشد، ممکن است متفاوت باشد — در قرارداد محل را شفاف بنویسید.",
    ],
    examples: [
      "صادرکننده زعفران کالا را در انبار فرودگاه امام به شرکت حمل هوایی خریدار تحویل می‌دهد و ریسک از همان لحظه به خریدار منتقل می‌شود.",
    ],
    tags: ["چندوجهی", "جایگزین مدرن EXW"],
  },
  {
    id: "fas",
    code: "FAS",
    nameFa: "تحویل در کنار کشتی",
    nameEn: "Free Alongside Ship",
    group: "F",
    transportModes: ["sea"],
    summary:
      "فقط برای حمل دریایی/آبراه: فروشنده کالا را در کنار کشتی در بندر مبدأ قرار می‌دهد. بارگیری روی کشتی معمولاً با خریدار است.",
    sellerDuties: [
      "ترخیص صادرات",
      "حمل کالا تا اسکله و قرار دادن در کنار کشتی معرفی‌شده",
      "اطلاع‌رسانی به خریدار",
    ],
    buyerDuties: [
      "قرارداد حمل دریایی و معرفی کشتی/اسکله",
      "هزینه بارگیری روی کشتی",
      "کرایه حمل، بیمه، ترخیص واردات",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "buyer",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "buyer",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 2,
      labelFa: "وقتی کالا در کنار کشتی در بندر مبدأ قرار گرفت",
    },
    pros: ["مناسب کالاهای فله‌ای که کنار کشتی تحویل می‌شوند"],
    cons: ["فقط دریایی", "کنترل کمتر فروشنده نسبت به FOB پس از کنار کشتی"],
    warnings: [
      "برای کانتینر معمولاً FAS مناسب نیست؛ FCA یا FOB را بررسی کنید.",
    ],
    examples: [
      "محموله سنگ معدنی در اسکله بندرعباس کنار کشتی خریدار چیده می‌شود؛ بارگیری روی عرشه با هزینه خریدار است.",
    ],
    tags: ["فقط دریا", "فله"],
  },
  {
    id: "fob",
    code: "FOB",
    nameFa: "تحویل روی کشتی",
    nameEn: "Free On Board",
    group: "F",
    transportModes: ["sea"],
    summary:
      "کلاسیک تجارت دریایی: فروشنده کالا را روی کشتی معرفی‌شده خریدار در بندر مبدأ بارگیری می‌کند و ترخیص صادرات را انجام می‌دهد. ریسک از لحظه قرار گرفتن روی کشتی به خریدار منتقل می‌شود.",
    sellerDuties: [
      "ترخیص صادرات",
      "حمل تا بندر و بارگیری روی کشتی",
      "ارائه اسناد بارگیری / همکاری برای B/L",
    ],
    buyerDuties: [
      "اجاره کشتی یا قرارداد حمل دریایی",
      "کرایه حمل از بندر مبدأ به بعد",
      "بیمه (اختیاری ولی رایج)",
      "ترخیص واردات و هزینه‌های مقصد",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "buyer",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "buyer",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 3,
      labelFa: "وقتی کالا روی کشتی در بندر مبدأ قرار گرفت",
    },
    pros: [
      "شفاف و آشنا برای بازار ایران و خلیج فارس",
      "کنترل حمل اصلی با خریدار",
    ],
    cons: [
      "فقط دریایی/آبراه",
      "برای محموله کانتینری گاهی FCA دقیق‌تر است",
    ],
    warnings: [
      "«FOB فرودگاه» از نظر اینکوترمز صحیح نیست؛ برای هوایی از FCA استفاده کنید.",
      "نام بندر را دقیق بنویسید: FOB Bandar Abbas.",
    ],
    examples: [
      "صادرکننده خرما محموله را FOB بندرعباس می‌فروشد؛ پس از بارگیری روی کشتی، کرایه دریایی و بیمه با خریدار عمان است.",
    ],
    tags: ["دریایی", "پرکاربرد"],
  },
  {
    id: "cfr",
    code: "CFR",
    nameFa: "هزینه و کرایه حمل",
    nameEn: "Cost and Freight",
    group: "C",
    transportModes: ["sea"],
    summary:
      "فروشنده کرایه حمل تا بندر مقصد را می‌پردازد، اما ریسک از بارگیری روی کشتی در مبدأ به خریدار منتقل می‌شود. بیمه اجباری نیست.",
    sellerDuties: [
      "ترخیص صادرات",
      "قرارداد حمل تا بندر مقصد و پرداخت کرایه",
      "بارگیری روی کشتی",
      "ارائه اسناد حمل",
    ],
    buyerDuties: [
      "بیمه (اختیاری — ولی ریسک با اوست)",
      "هزینه‌های بعد از رسیدن به بندر مقصد",
      "ترخیص واردات",
      "تخلیه (بسته به قرارداد حمل)",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 3,
      labelFa: "روی کشتی در بندر مبدأ (نه در مقصد)",
    },
    pros: ["خریدار کرایه تا مقصد را در قیمت می‌بیند", "رایج در معاملات دریایی"],
    cons: ["ریسک در مسیر با خریدار است در حالی که حمل را فروشنده خریده", "بدون بیمه اجباری"],
    warnings: [
      "اشتباه رایج: فکر کردن که ریسک تا بندر مقصد با فروشنده است — در CFR چنین نیست.",
      "اگر بیمه می‌خواهید، CIF یا جداگانه بیمه بخرید.",
    ],
    examples: [
      "CFR جبل‌علی: فروشنده کرایه تا امارات را می‌دهد؛ اگر در مسیر آسیب ببیند، خسارت عمدتاً بر عهده خریدار است مگر بیمه جداگانه داشته باشد.",
    ],
    tags: ["دریایی", "کرایه با فروشنده"],
  },
  {
    id: "cif",
    code: "CIF",
    nameFa: "هزینه، بیمه و کرایه",
    nameEn: "Cost, Insurance and Freight",
    group: "C",
    transportModes: ["sea"],
    summary:
      "مشابه CFR به‌علاوه بیمه حداقلی توسط فروشنده تا بندر مقصد. ریسک همچنان از روی کشتی در مبدأ به خریدار منتقل می‌شود.",
    sellerDuties: [
      "همه تعهدات CFR",
      "خرید بیمه دریایی حداقلی به نفع خریدار تا بندر مقصد",
    ],
    buyerDuties: [
      "هزینه‌ها و ریسک پس از بارگیری (جز آنچه بیمه پوشش می‌دهد)",
      "ترخیص واردات و هزینه‌های مقصد",
      "در صورت نیاز، ارتقای پوشش بیمه",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "seller",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "seller_minimum",
    riskTransfer: {
      stageIndex: 3,
      labelFa: "روی کشتی در بندر مبدأ",
    },
    pros: ["قیمت شامل کرایه و بیمه حداقلی", "مناسب خریدارانی که می‌خواهند یک پکیج تا بندر بگیرند"],
    cons: [
      "پوشش بیمه CIF معمولاً حداقلی (Institute Cargo Clauses C) است",
      "ریسک حقوقی همچنان زود منتقل می‌شود",
    ],
    warnings: [
      "برای کالای باارزش، پوشش بیمه‌ای بالاتر (A) را جداگانه توافق کنید.",
      "CIF فقط دریایی است؛ برای هوایی از CIP استفاده کنید.",
    ],
    examples: [
      "CIF مرسین: فروشنده کرایه و بیمه حداقلی تا ترکیه را می‌دهد؛ خریدار باید بداند خسارت جزئی ممکن است تحت پوشش C نباشد.",
    ],
    tags: ["دریایی", "بیمه حداقلی"],
  },
  {
    id: "cpt",
    code: "CPT",
    nameFa: "کرایه حمل پرداخت‌شده تا",
    nameEn: "Carriage Paid To",
    group: "C",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "فروشنده کرایه تا محل توافق‌شده مقصد را می‌پردازد. ریسک وقتی به اولین حمل‌کننده تحویل شد منتقل می‌شود — نه در مقصد.",
    sellerDuties: [
      "ترخیص صادرات",
      "قرارداد حمل تا محل مقصد توافق‌شده و پرداخت کرایه",
      "تحویل به حمل‌کننده",
    ],
    buyerDuties: [
      "بیمه (اختیاری)",
      "ترخیص واردات",
      "هزینه‌های بعد از رسیدن (بسته به قرارداد)",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "buyer",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "optional_buyer",
    riskTransfer: {
      stageIndex: 2,
      labelFa: "با تحویل به اولین حمل‌کننده",
    },
    pros: ["قابل استفاده در هوایی، جاده‌ای، ریلی و ترکیبی", "کرایه تا مقصد در قیمت"],
    cons: ["ریسک زود منتقل می‌شود؛ بیمه با خریدار است"],
    warnings: [
      "محل مقصد و نقطه تحویل به حمل‌کننده را جداگانه و شفاف مشخص کنید.",
    ],
    examples: [
      "CPT انبار خریدار در مسکو با حمل جاده‌ای/ریلی ترکیبی؛ ریسک از تحویل به فورواردر در تهران منتقل می‌شود.",
    ],
    tags: ["چندوجهی", "هوایی"],
  },
  {
    id: "cip",
    code: "CIP",
    nameFa: "کرایه و بیمه پرداخت‌شده تا",
    nameEn: "Carriage and Insurance Paid To",
    group: "C",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "نسخه بیمه‌دار CPT: فروشنده کرایه تا مقصد و بیمه با پوشش بالاتر (معمولاًClauses A) را ترتیب می‌دهد. ریسک همچنان با تحویل به حمل‌کننده منتقل می‌شود.",
    sellerDuties: [
      "تعهدات CPT",
      "بیمه با پوشش وسیع‌تر به نفع خریدار تا محل مقصد",
    ],
    buyerDuties: [
      "ترخیص واردات",
      "هزینه‌های مقصد خارج از کرایه پرداخت‌شده",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "seller",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "seller_higher",
    riskTransfer: {
      stageIndex: 2,
      labelFa: "با تحویل به اولین حمل‌کننده",
    },
    pros: ["مناسب هوایی و چندوجهی با بیمه بهتر از CIF", "یک پکیج تا مقصد"],
    cons: ["ریسک حقوقی زود منتقل می‌شود", "جزئیات پوشش بیمه را چک کنید"],
    warnings: [
      "در Incoterms® 2020 پوشش بیمه CIP بالاتر از CIF در نظر گرفته شده؛ با این حال بند بیمه‌نامه را بخوانید.",
    ],
    examples: [
      "CIP فرودگاه استانبول برای محموله زعفران هوایی با بیمه وسیع توسط فروشنده.",
    ],
    tags: ["چندوجهی", "بیمه قوی‌تر"],
  },
  {
    id: "dap",
    code: "DAP",
    nameFa: "تحویل در محل مقرر",
    nameEn: "Delivered at Place",
    group: "D",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "فروشنده کالا را آماده تخلیه در محل مقصد توافق‌شده تحویل می‌دهد. ترخیص واردات و عوارض معمولاً با خریدار است. تخلیه با خریدار.",
    sellerDuties: [
      "ترخیص صادرات",
      "حمل تا محل مقصد توافق‌شده",
      "تحویل آماده برای تخلیه",
    ],
    buyerDuties: [
      "تخلیه",
      "ترخیص واردات، عوارض و مالیات",
      "حمل داخلی پس از تحویل (در صورت نیاز)",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "seller",
      importClearance: "buyer",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "recommended_seller",
    riskTransfer: {
      stageIndex: 6,
      labelFa: "وقتی کالا آماده تخلیه در محل مقصد در اختیار خریدار قرار گرفت",
    },
    pros: ["تعهد بالای فروشنده تا نزدیک خریدار", "مناسب فروشنده با شبکه لجستیک قوی"],
    cons: ["ترخیص واردات هنوز با خریدار است", "تأخیر گمرک مقصد می‌تواند دردسرساز شود"],
    warnings: [
      "آدرس دقیق محل تحویل را بنویسید (انبار، کارخانه، پایانه).",
      "اگر فروشنده باید تخلیه کند، DPU را در نظر بگیرید.",
    ],
    examples: [
      "DAP انبار خریدار در بغداد: کامیون تا درب انبار می‌آید؛ تخلیه و ترخیص واردات عراق با خریدار است.",
    ],
    tags: ["تحویل مقصد", "بدون عوارض واردات"],
  },
  {
    id: "dpu",
    code: "DPU",
    nameFa: "تحویل در محل مقرر با تخلیه",
    nameEn: "Delivered at Place Unloaded",
    group: "D",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "تنها شرطی که صراحتاً تخلیه در مقصد را بر عهده فروشنده می‌گذارد. جایگزین DAT قبلی است. ترخیص واردات همچنان با خریدار.",
    sellerDuties: [
      "حمل تا محل مقصد",
      "تخلیه کالا در محل توافق‌شده",
      "ترخیص صادرات",
    ],
    buyerDuties: [
      "ترخیص واردات و عوارض",
      "حمل بعدی در صورت نیاز",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "seller",
      importClearance: "buyer",
      unloadingAtBuyer: "seller",
    },
    carrier: "seller",
    insurance: "recommended_seller",
    riskTransfer: {
      stageIndex: 6,
      labelFa: "پس از تخلیه در محل مقصد توافق‌شده",
    },
    pros: ["تخلیه با فروشنده — مناسب پایانه‌ها و اسکله‌ها", "شفافیت نسبت به DAT قدیمی"],
    cons: ["فروشنده باید توان تخلیه در مقصد را داشته باشد", "عوارض واردات با خریدار"],
    warnings: [
      "محل باید جایی باشد که تخلیه عملاً ممکن باشد.",
    ],
    examples: [
      "DPU پایانه کانتینری بندر مقصد: فروشنده تخلیه از کشتی/تریلی را انجام می‌دهد؛ ترخیص با خریدار.",
    ],
    tags: ["تخلیه با فروشنده"],
  },
  {
    id: "ddp",
    code: "DDP",
    nameFa: "تحویل با حقوق و عوارض پرداخت‌شده",
    nameEn: "Delivered Duty Paid",
    group: "D",
    transportModes: ["any", "multimodal", "sea"],
    summary:
      "حداکثر تعهد فروشنده: کالا را ترخیص‌شده وارداتی، آماده تخلیه در محل مقصد به خریدار تحویل می‌دهد. عوارض، مالیات و تشریفات واردات معمولاً با فروشنده است.",
    sellerDuties: [
      "تمام حمل تا محل مقصد",
      "ترخیص صادرات و واردات",
      "پرداخت عوارض و مالیات واردات (مگر استثنا در قرارداد)",
      "تحویل آماده تخلیه",
    ],
    buyerDuties: [
      "تخلیه (معمولاً)",
      "کمک در حد اطلاعات لازم",
    ],
    costs: {
      packaging: "seller",
      loadingAtSeller: "seller",
      exportClearance: "seller",
      mainCarriage: "seller",
      insurance: "seller",
      importClearance: "seller",
      unloadingAtBuyer: "buyer",
    },
    carrier: "seller",
    insurance: "recommended_seller",
    riskTransfer: {
      stageIndex: 6,
      labelFa: "در محل مقصد پس از ترخیص واردات، آماده تخلیه",
    },
    pros: ["راحت‌ترین حالت برای خریدار", "قیمت تمام‌شده شفاف‌تر برای خریدار"],
    cons: [
      "پیچیده و پرریسک برای فروشنده‌ای که با گمرک مقصد آشنا نیست",
      "مالیات/VAT ممکن است ساختار قیمت را پیچیده کند",
    ],
    warnings: [
      "قبل از DDP، امکان ثبت به‌عنوان واردکننده و پرداخت عوارض در کشور مقصد را بررسی کنید.",
      "گاهی DAP + ترخیص محلی امن‌تر از DDP است.",
    ],
    examples: [
      "DDP فروشگاه زنجیره‌ای در اروپا: فروشنده ایرانی همه کار تا قفسه/انبار با عوارض پرداخت‌شده را تعهد می‌کند — فقط با شریک محلی قوی توصیه می‌شود.",
    ],
    tags: ["حداکثر تعهد فروشنده", "عوارض با فروشنده"],
  },
];

export const COST_LABELS_FA = {
  packaging: "بسته‌بندی",
  loadingAtSeller: "بارگیری نزد فروشنده",
  exportClearance: "ترخیص صادرات",
  mainCarriage: "حمل اصلی",
  insurance: "بیمه",
  importClearance: "ترخیص واردات / عوارض",
  unloadingAtBuyer: "تخلیه در مقصد",
};

export const PARTY_LABELS_FA = {
  seller: "فروشنده",
  buyer: "خریدار",
  shared: "مشترک / توافقی",
  none: "—",
  optional_buyer: "اختیاری (معمولاً خریدار)",
  seller_minimum: "فروشنده (حداقلی)",
  seller_higher: "فروشنده (پوشش بالاتر)",
  recommended_seller: "توصیه‌شده فروشنده",
};
