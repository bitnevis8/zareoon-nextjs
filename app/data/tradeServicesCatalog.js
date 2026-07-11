/** @typedef {{ id: string, title: string }} TradeServiceSubcategory */
/** @typedef {{ id: string, icon: string, title: string, description: string, children: TradeServiceSubcategory[] }} TradeServiceCategory */
/** @typedef {{ eyebrow: string, title: string, subtitle: string, providerHint: string, providerRegisterNote: string, categories: TradeServiceCategory[] }} TradeServicesLocale */

const SHARED_CATEGORY_IDS = [
  "import-export",
  "intl-logistics",
  "customs-clearance",
  "intl-finance",
  "inspection-standards",
  "insurance-risk",
  "legal-trade",
  "market-development",
  "packaging-prep",
  "specialized-trade",
];

/** Legacy service-request slugs → current L1 category id */
export const LEGACY_SERVICE_TYPE_MAP = {
  trade: "import-export",
  logistics: "intl-logistics",
  customs: "customs-clearance",
  finance: "intl-finance",
  inspection: "inspection-standards",
  insurance: "insurance-risk",
  consulting: "specialized-trade",
  documents: "import-export",
};

export const L1_CATEGORY_IDS = [...SHARED_CATEGORY_IDS];

/** @type {Record<string, TradeServicesLocale>} */
export const tradeServicesContent = {
  fa: {
    eyebrow: "شبکه خدمات تجارت خارجی",
    title: "خدمات بازرگانی و تجارت بین‌الملل",
    subtitle:
      "یافتن شرکت یا متخصص در واردات، صادرات، حمل، گمرک، بازرسی و امور مالی.",
    providerHint:
      "فهرست شرکت‌ها و متخصصان هر حوزه — با اطلاعات تماس، مجوز، سابقه و امتیاز.",
    providerRegisterNote:
      "خدمات خود را معرفی کنید، مشتریان جدید پیدا کنید و با پروفایل اختصاصی در شبکه تجارت بین‌المللی حضور داشته باشید.",
    categories: [
      {
        id: "import-export",
        icon: "import-export",
        title: "خدمات واردات و صادرات",
        description:
          "مدیریت واردات و صادرات، سورسینگ، یافتن خریدار و تأمین‌کننده خارجی، نمایندگی تجاری و مدیریت اسناد.",
        children: [
          { id: "import-mgmt", title: "مدیریت واردات کالا" },
          { id: "export-mgmt", title: "مدیریت صادرات کالا" },
          { id: "sourcing", title: "تأمین و سورسینگ کالا" },
          { id: "find-buyer", title: "پیدا کردن خریدار خارجی" },
          { id: "find-supplier", title: "پیدا کردن تأمین‌کننده خارجی" },
          { id: "commercial-agency", title: "نمایندگی تجاری و فروش" },
          { id: "trade-documents", title: "مدیریت اسناد تجاری" },
        ],
      },
      {
        id: "intl-logistics",
        icon: "intl-logistics",
        title: "حمل‌ونقل و لجستیک بین‌المللی",
        description:
          "حمل دریایی، هوایی، زمینی، ریلی و ترکیبی؛ فورواردر، کریری، کانتینر و انبارداری بین‌المللی.",
        children: [
          { id: "sea-freight", title: "حمل دریایی" },
          { id: "air-freight", title: "حمل هوایی" },
          { id: "road-freight", title: "حمل زمینی" },
          { id: "rail-freight", title: "حمل ریلی" },
          { id: "multimodal", title: "حمل ترکیبی" },
          { id: "forwarder-carrier", title: "فورواردر و کریری" },
          { id: "container-services", title: "خدمات کانتینری" },
          { id: "warehousing", title: "انبارداری و نگهداری کالا" },
        ],
      },
      {
        id: "customs-clearance",
        icon: "customs-clearance",
        title: "گمرک و ترخیص کالا",
        description:
          "ترخیص، کارگزاری گمرکی، ثبت سفارش، مجوزهای واردات و صادرات، ارزش‌گذاری و مشاوره امور گمرکی.",
        children: [
          { id: "customs-brokerage", title: "ترخیص کالا" },
          { id: "customs-agent", title: "کارگزار گمرکی" },
          { id: "order-registration", title: "ثبت سفارش" },
          { id: "import-export-permits", title: "اخذ مجوزهای واردات و صادرات" },
          { id: "customs-valuation", title: "ارزش‌گذاری کالا" },
          { id: "customs-consulting", title: "مشاوره امور گمرکی" },
        ],
      },
      {
        id: "intl-finance",
        icon: "intl-finance",
        title: "خدمات مالی و پرداخت بین‌المللی",
        description:
          "اعتبار اسنادی، حواله ارزی، پرداخت‌های بین‌المللی، تأمین مالی تجارت و خدمات ارزی.",
        children: [
          { id: "letter-of-credit", title: "اعتبار اسنادی (LC)" },
          { id: "telegraphic-transfer", title: "حواله ارزی (TT)" },
          { id: "intl-payments", title: "پرداخت‌های بین‌المللی" },
          { id: "trade-finance", title: "تأمین مالی تجارت" },
          { id: "fx-trade-services", title: "خدمات ارزی تجاری" },
        ],
      },
      {
        id: "inspection-standards",
        icon: "inspection-standards",
        title: "بازرسی و استاندارد",
        description:
          "بازرسی کالا، کنترل کیفیت، آزمون، گواهی بازرسی، استانداردها و PSI قبل از حمل.",
        children: [
          { id: "cargo-inspection", title: "بازرسی کالا" },
          { id: "quality-control", title: "کنترل کیفیت (QC)" },
          { id: "testing", title: "آزمون و آزمایش کالا" },
          { id: "inspection-certificate", title: "صدور گواهی بازرسی" },
          { id: "standards-certification", title: "استاندارد و گواهینامه‌ها" },
          { id: "pre-shipment-inspection", title: "بازرسی قبل از حمل (PSI)" },
        ],
      },
      {
        id: "insurance-risk",
        icon: "insurance-risk",
        title: "بیمه و مدیریت ریسک",
        description:
          "بیمه باربری، بیمه حمل بین‌المللی، بیمه اعتبار صادراتی و مدیریت ریسک تجارت.",
        children: [
          { id: "cargo-insurance", title: "بیمه باربری" },
          { id: "intl-transport-insurance", title: "بیمه حمل‌ونقل بین‌المللی" },
          { id: "export-credit-insurance", title: "بیمه اعتبار صادراتی" },
          { id: "trade-risk-mgmt", title: "مدیریت ریسک تجارت" },
        ],
      },
      {
        id: "legal-trade",
        icon: "legal-trade",
        title: "خدمات حقوقی و قراردادهای تجاری",
        description:
          "قراردادهای بین‌المللی، تنظیم قرارداد فروش، مشاوره حقوق تجارت، حل اختلاف و ثبت شرکت.",
        children: [
          { id: "intl-contracts", title: "قراردادهای بین‌المللی" },
          { id: "sales-contracts", title: "تنظیم قرارداد فروش" },
          { id: "trade-law-advice", title: "مشاوره حقوق تجارت" },
          { id: "dispute-resolution", title: "حل اختلافات تجاری" },
          { id: "company-registration", title: "ثبت شرکت و نمایندگی" },
        ],
      },
      {
        id: "market-development",
        icon: "market-development",
        title: "بازاریابی و توسعه بازار",
        description:
          "تحقیقات بازار خارجی، بازاریابی صادراتی، تبلیغات بین‌المللی، جذب خریدار و نمایشگاه.",
        children: [
          { id: "market-research", title: "تحقیقات بازار خارجی" },
          { id: "export-marketing", title: "بازاریابی صادراتی" },
          { id: "intl-advertising", title: "تبلیغات بین‌المللی" },
          { id: "buyer-acquisition", title: "جذب خریدار خارجی" },
          { id: "trade-fairs", title: "حضور در نمایشگاه‌های بین‌المللی" },
        ],
      },
      {
        id: "packaging-prep",
        icon: "packaging-prep",
        title: "بسته‌بندی و آماده‌سازی کالا",
        description:
          "بسته‌بندی صادراتی، لیبل و چاپ تجاری، پالت‌بندی و استانداردسازی بسته‌بندی.",
        children: [
          { id: "export-packaging", title: "بسته‌بندی صادراتی" },
          { id: "commercial-labeling", title: "لیبل و چاپ تجاری" },
          { id: "palletizing", title: "پالت‌بندی" },
          { id: "packaging-standards", title: "استانداردسازی بسته‌بندی" },
        ],
      },
      {
        id: "specialized-trade",
        icon: "specialized-trade",
        title: "خدمات تجاری تخصصی",
        description:
          "ترجمه و مترجم تجاری، آموزش تجارت بین‌الملل، مشاوره صادرات/واردات و نماینده محلی.",
        children: [
          { id: "trade-translation", title: "ترجمه تخصصی تجاری" },
          { id: "negotiation-interpreter", title: "مترجم مذاکرات تجاری" },
          { id: "trade-training", title: "آموزش تجارت بین‌الملل" },
          { id: "trade-consulting", title: "مشاوره صادرات و واردات" },
          { id: "local-representative", title: "خدمات نماینده محلی در کشورها" },
        ],
      },
    ],
  },
  en: {
    eyebrow: "International trade service providers",
    title: "Commercial & international trade services",
    subtitle:
      "Access a network of companies and specialists in import, export, freight, customs, inspection and trade finance.",
    providerHint:
      "Browse providers in each category: company name, routes, services, licenses, experience and ratings — then submit a cooperation request.",
    providerRegisterNote:
      "Are you a company or specialist? Register in your field of expertise to appear in the providers directory where users can find and contact you.",
    categories: [
      {
        id: "import-export",
        icon: "import-export",
        title: "Import & export services",
        description:
          "Import/export management, sourcing, finding foreign buyers and suppliers, commercial agency and trade documents.",
        children: [
          { id: "import-mgmt", title: "Import management" },
          { id: "export-mgmt", title: "Export management" },
          { id: "sourcing", title: "Sourcing & procurement" },
          { id: "find-buyer", title: "Find foreign buyers" },
          { id: "find-supplier", title: "Find foreign suppliers" },
          { id: "commercial-agency", title: "Commercial agency & sales" },
          { id: "trade-documents", title: "Trade document management" },
        ],
      },
      {
        id: "intl-logistics",
        icon: "intl-logistics",
        title: "International logistics & freight",
        description:
          "Sea, air, road, rail and multimodal freight; forwarding, carrier services, containers and warehousing.",
        children: [
          { id: "sea-freight", title: "Sea freight" },
          { id: "air-freight", title: "Air freight" },
          { id: "road-freight", title: "Road freight" },
          { id: "rail-freight", title: "Rail freight" },
          { id: "multimodal", title: "Multimodal transport" },
          { id: "forwarder-carrier", title: "Freight forwarder & carrier" },
          { id: "container-services", title: "Container services" },
          { id: "warehousing", title: "Warehousing & storage" },
        ],
      },
      {
        id: "customs-clearance",
        icon: "customs-clearance",
        title: "Customs & clearance",
        description:
          "Clearance, customs brokerage, order registration, import/export permits, valuation and customs consulting.",
        children: [
          { id: "customs-brokerage", title: "Customs clearance" },
          { id: "customs-agent", title: "Customs broker" },
          { id: "order-registration", title: "Order registration" },
          { id: "import-export-permits", title: "Import/export permits" },
          { id: "customs-valuation", title: "Customs valuation" },
          { id: "customs-consulting", title: "Customs consulting" },
        ],
      },
      {
        id: "intl-finance",
        icon: "intl-finance",
        title: "International finance & payments",
        description:
          "Letters of credit, wire transfers, international payments, trade finance and FX services.",
        children: [
          { id: "letter-of-credit", title: "Letter of credit (L/C)" },
          { id: "telegraphic-transfer", title: "Telegraphic transfer (T/T)" },
          { id: "intl-payments", title: "International payments" },
          { id: "trade-finance", title: "Trade finance" },
          { id: "fx-trade-services", title: "Trade FX services" },
        ],
      },
      {
        id: "inspection-standards",
        icon: "inspection-standards",
        title: "Inspection & standards",
        description:
          "Cargo inspection, QC, testing, inspection certificates, standards and pre-shipment inspection (PSI).",
        children: [
          { id: "cargo-inspection", title: "Cargo inspection" },
          { id: "quality-control", title: "Quality control (QC)" },
          { id: "testing", title: "Product testing" },
          { id: "inspection-certificate", title: "Inspection certificates" },
          { id: "standards-certification", title: "Standards & certification" },
          { id: "pre-shipment-inspection", title: "Pre-shipment inspection (PSI)" },
        ],
      },
      {
        id: "insurance-risk",
        icon: "insurance-risk",
        title: "Insurance & risk management",
        description:
          "Cargo insurance, international transport insurance, export credit insurance and trade risk management.",
        children: [
          { id: "cargo-insurance", title: "Cargo insurance" },
          { id: "intl-transport-insurance", title: "International transport insurance" },
          { id: "export-credit-insurance", title: "Export credit insurance" },
          { id: "trade-risk-mgmt", title: "Trade risk management" },
        ],
      },
      {
        id: "legal-trade",
        icon: "legal-trade",
        title: "Legal & commercial contracts",
        description:
          "International contracts, sales agreements, trade law advice, dispute resolution and company registration.",
        children: [
          { id: "intl-contracts", title: "International contracts" },
          { id: "sales-contracts", title: "Sales contract drafting" },
          { id: "trade-law-advice", title: "Trade law consulting" },
          { id: "dispute-resolution", title: "Commercial dispute resolution" },
          { id: "company-registration", title: "Company & agency registration" },
        ],
      },
      {
        id: "market-development",
        icon: "market-development",
        title: "Marketing & market development",
        description:
          "Foreign market research, export marketing, international advertising, buyer acquisition and trade fairs.",
        children: [
          { id: "market-research", title: "Foreign market research" },
          { id: "export-marketing", title: "Export marketing" },
          { id: "intl-advertising", title: "International advertising" },
          { id: "buyer-acquisition", title: "Foreign buyer acquisition" },
          { id: "trade-fairs", title: "International trade fairs" },
        ],
      },
      {
        id: "packaging-prep",
        icon: "packaging-prep",
        title: "Packaging & cargo preparation",
        description:
          "Export packaging, commercial labeling & printing, palletizing and packaging standardization.",
        children: [
          { id: "export-packaging", title: "Export packaging" },
          { id: "commercial-labeling", title: "Commercial labeling & printing" },
          { id: "palletizing", title: "Palletizing" },
          { id: "packaging-standards", title: "Packaging standardization" },
        ],
      },
      {
        id: "specialized-trade",
        icon: "specialized-trade",
        title: "Specialized trade services",
        description:
          "Trade translation & interpreting, international trade training, import/export consulting and local representatives.",
        children: [
          { id: "trade-translation", title: "Trade translation" },
          { id: "negotiation-interpreter", title: "Negotiation interpreter" },
          { id: "trade-training", title: "International trade training" },
          { id: "trade-consulting", title: "Import/export consulting" },
          { id: "local-representative", title: "Local representative services" },
        ],
      },
    ],
  },
  ru: {
    eyebrow: "Поставщики услуг международной торговли",
    title: "Коммерческие услуги и внешняя торговля",
    subtitle:
      "Доступ к сети компаний и специалистов по импорту, экспорту, логистике, таможне, инспекции и торговому финансированию.",
    providerHint:
      "Пользователи видят поставщиков в каждой категории: название, маршруты, услуги, лицензии, опыт и рейтинг — и могут отправить запрос на сотрудничество.",
    providerRegisterNote:
      "Вы компания или специалист? Зарегистрируйтесь в своей области, чтобы ваш профиль отображался в каталоге поставщиков для пользователей.",
    categories: [
      {
        id: "import-export",
        icon: "import-export",
        title: "Импорт и экспорт",
        description:
          "Управление импортом/экспортом, сорсинг, поиск покупателей и поставщиков, агентские услуги и документы.",
        children: [
          { id: "import-mgmt", title: "Управление импортом" },
          { id: "export-mgmt", title: "Управление экспортом" },
          { id: "sourcing", title: "Сорсинг и закупки" },
          { id: "find-buyer", title: "Поиск иностранных покупателей" },
          { id: "find-supplier", title: "Поиск иностранных поставщиков" },
          { id: "commercial-agency", title: "Коммерческое агентство" },
          { id: "trade-documents", title: "Торговые документы" },
        ],
      },
      {
        id: "intl-logistics",
        icon: "intl-logistics",
        title: "Международная логистика",
        description:
          "Морские, воздушные, автомобильные, железнодорожные и мультимодальные перевозки; экспедирование и склады.",
        children: [
          { id: "sea-freight", title: "Морские перевозки" },
          { id: "air-freight", title: "Авиаперевозки" },
          { id: "road-freight", title: "Автоперевозки" },
          { id: "rail-freight", title: "Ж/д перевозки" },
          { id: "multimodal", title: "Мультимодальные перевозки" },
          { id: "forwarder-carrier", title: "Экспедитор и перевозчик" },
          { id: "container-services", title: "Контейнерные услуги" },
          { id: "warehousing", title: "Складирование" },
        ],
      },
      {
        id: "customs-clearance",
        icon: "customs-clearance",
        title: "Таможня и оформление",
        description:
          "Таможенное оформление, брокер, регистрация заказов, разрешения, оценка и консультации.",
        children: [
          { id: "customs-brokerage", title: "Таможенное оформление" },
          { id: "customs-agent", title: "Таможенный брокер" },
          { id: "order-registration", title: "Регистрация заказа" },
          { id: "import-export-permits", title: "Разрешения на ввоз/вывоз" },
          { id: "customs-valuation", title: "Таможенная оценка" },
          { id: "customs-consulting", title: "Таможенные консультации" },
        ],
      },
      {
        id: "intl-finance",
        icon: "intl-finance",
        title: "Международные финансы",
        description: "Аккредитивы, T/T, международные платежи, торговое финансирование и валютные услуги.",
        children: [
          { id: "letter-of-credit", title: "Аккредитив (L/C)" },
          { id: "telegraphic-transfer", title: "Телеграфный перевод (T/T)" },
          { id: "intl-payments", title: "Международные платежи" },
          { id: "trade-finance", title: "Торговое финансирование" },
          { id: "fx-trade-services", title: "Валютные торговые услуги" },
        ],
      },
      {
        id: "inspection-standards",
        icon: "inspection-standards",
        title: "Инспекция и стандарты",
        description: "Инспекция грузов, QC, испытания, сертификаты, стандарты и PSI.",
        children: [
          { id: "cargo-inspection", title: "Инспекция груза" },
          { id: "quality-control", title: "Контроль качества (QC)" },
          { id: "testing", title: "Испытания продукции" },
          { id: "inspection-certificate", title: "Сертификаты инспекции" },
          { id: "standards-certification", title: "Стандарты и сертификация" },
          { id: "pre-shipment-inspection", title: "PSI (до отгрузки)" },
        ],
      },
      {
        id: "insurance-risk",
        icon: "insurance-risk",
        title: "Страхование и риски",
        description: "Страхование грузов, перевозок, экспортного кредита и управление рисками.",
        children: [
          { id: "cargo-insurance", title: "Страхование груза" },
          { id: "intl-transport-insurance", title: "Страхование перевозок" },
          { id: "export-credit-insurance", title: "Страхование экспортного кредита" },
          { id: "trade-risk-mgmt", title: "Управление торговыми рисками" },
        ],
      },
      {
        id: "legal-trade",
        icon: "legal-trade",
        title: "Право и контракты",
        description: "Международные контракты, договоры купли-продажи, правовые консультации и регистрация.",
        children: [
          { id: "intl-contracts", title: "Международные контракты" },
          { id: "sales-contracts", title: "Договоры продажи" },
          { id: "trade-law-advice", title: "Консультации по торговому праву" },
          { id: "dispute-resolution", title: "Разрешение споров" },
          { id: "company-registration", title: "Регистрация компании" },
        ],
      },
      {
        id: "market-development",
        icon: "market-development",
        title: "Маркетинг и развитие рынка",
        description: "Исследование рынков, экспортный маркетинг, реклама, привлечение покупателей и выставки.",
        children: [
          { id: "market-research", title: "Исследование рынков" },
          { id: "export-marketing", title: "Экспортный маркетинг" },
          { id: "intl-advertising", title: "Международная реклама" },
          { id: "buyer-acquisition", title: "Привлечение покупателей" },
          { id: "trade-fairs", title: "Международные выставки" },
        ],
      },
      {
        id: "packaging-prep",
        icon: "packaging-prep",
        title: "Упаковка и подготовка",
        description: "Экспортная упаковка, этикетки, паллетирование и стандартизация.",
        children: [
          { id: "export-packaging", title: "Экспортная упаковка" },
          { id: "commercial-labeling", title: "Этикетки и печать" },
          { id: "palletizing", title: "Паллетирование" },
          { id: "packaging-standards", title: "Стандартизация упаковки" },
        ],
      },
      {
        id: "specialized-trade",
        icon: "specialized-trade",
        title: "Специализированные услуги",
        description: "Перевод, устный перевод, обучение, консалтинг и местные представители.",
        children: [
          { id: "trade-translation", title: "Торговый перевод" },
          { id: "negotiation-interpreter", title: "Переводчик переговоров" },
          { id: "trade-training", title: "Обучение ВЭД" },
          { id: "trade-consulting", title: "Консалтинг импорт/экспорт" },
          { id: "local-representative", title: "Местные представители" },
        ],
      },
    ],
  },
};

/** Illustrative sample providers until a backend catalog exists. */
export const sampleTradeServiceProviders = {
  "import-export": [
    {
      id: "p-ie-1",
      name: { fa: "شرکت بازرگانی پارس صادرات", en: "Pars Export Trading Co.", ru: "Pars Export Trading" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "ایران — عراق — امارات", en: "Iran — Iraq — UAE", ru: "Иран — Ирак — ОАЭ" },
      services: {
        fa: ["مدیریت صادرات", "سورسینگ", "یافتن خریدار"],
        en: ["Export management", "Sourcing", "Buyer matching"],
        ru: ["Экспорт", "Сорсинг", "Поиск покупателей"],
      },
      licenses: { fa: ["کارت بازرگانی", "مجوز صادرات"], en: ["Trade card", "Export license"], ru: ["Торговая карта"] },
      experienceYears: 14,
      rating: 4.8,
      reviewCount: 62,
    },
    {
      id: "p-ie-2",
      name: { fa: "مشاور واردات — آقای رضایی", en: "Import Advisor — Mr. Rezaei", ru: "Консультант по импорту" },
      entityType: { fa: "شخص", en: "Individual", ru: "Частное лицо" },
      routes: { fa: "چین — ترکیه — ایران", en: "China — Turkey — Iran", ru: "Китай — Турция — Иран" },
      services: {
        fa: ["مدیریت واردات", "تأمین‌کننده خارجی"],
        en: ["Import management", "Foreign supplier sourcing"],
        ru: ["Импорт", "Поиск поставщиков"],
      },
      licenses: { fa: ["گواهی مشاوره بازرگانی"], en: ["Trade consulting certificate"], ru: ["Сертификат консультанта"] },
      experienceYears: 9,
      rating: 4.5,
      reviewCount: 31,
    },
  ],
  "intl-logistics": [
    {
      id: "p-log-1",
      name: { fa: "شرکت حمل‌ونقل دریایی خلیج", en: "Gulf Sea Freight Co.", ru: "Gulf Sea Freight" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "بندرعباس — جبل‌علی — استانبول", en: "Bandar Abbas — Jebel Ali — Istanbul", ru: "Бandar Abbas — Jebel Ali — Istanbul" },
      services: {
        fa: ["حمل دریایی", "فورواردر", "کانتینر"],
        en: ["Sea freight", "Forwarding", "Containers"],
        ru: ["Морские перевозки", "Экспедирование"],
      },
      licenses: { fa: ["مجوز فورواردری", "IATA/FMC partner"], en: ["Forwarding license"], ru: ["Лицензия экспедитора"] },
      experienceYears: 18,
      rating: 4.7,
      reviewCount: 89,
    },
  ],
  "customs-clearance": [
    {
      id: "p-cus-1",
      name: { fa: "ترخیص‌کار — خانم احمدی", en: "Customs Broker — Ms. Ahmadi", ru: "Таможенный брокер" },
      entityType: { fa: "شخص", en: "Individual", ru: "Частное лицо" },
      routes: { fa: "گمرک امام — بندر شهید رجایی", en: "Imam Khomeini — Shahid Rajaee ports", ru: "Порты Ирана" },
      services: {
        fa: ["ترخیص", "ثبت سفارش", "مجوز واردات"],
        en: ["Clearance", "Order registration", "Import permits"],
        ru: ["Оформление", "Регистрация заказа"],
      },
      licenses: { fa: ["کارت بازرگانی", "گواهی کارگزار گمرک"], en: ["Customs broker license"], ru: ["Лицензия брокера"] },
      experienceYears: 11,
      rating: 4.9,
      reviewCount: 54,
    },
  ],
  "intl-finance": [
    {
      id: "p-fin-1",
      name: { fa: "خدمات مالی تجارت نوین", en: "Novin Trade Finance", ru: "Novin Trade Finance" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "ایران — اروپا — آسیای میانه", en: "Iran — Europe — Central Asia", ru: "Иран — Европа — Центральная Азия" },
      services: {
        fa: ["اعتبار اسنادی", "حواله ارزی", "تأمین مالی"],
        en: ["L/C", "T/T", "Trade finance"],
        ru: ["Аккредитив", "T/T", "Финансирование"],
      },
      licenses: { fa: ["مجوز خدمات ارزی"], en: ["FX services license"], ru: ["Валютная лицензия"] },
      experienceYears: 16,
      rating: 4.6,
      reviewCount: 41,
    },
  ],
  "inspection-standards": [
    {
      id: "p-ins-1",
      name: { fa: "شرکت بازرسی کیفیت SGS-Partner", en: "SGS-Partner Quality Inspection", ru: "SGS-Partner Inspection" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "کارخانه مبدأ — بندر بارگیری", en: "Origin factory — loading port", ru: "Завод — порт" },
      services: {
        fa: ["QC", "PSI", "گواهی بازرسی"],
        en: ["QC", "PSI", "Inspection certificates"],
        ru: ["QC", "PSI", "Сертификаты"],
      },
      licenses: { fa: ["ISO 17020", "مجوز بازرسی"], en: ["ISO 17020"], ru: ["ISO 17020"] },
      experienceYears: 20,
      rating: 4.8,
      reviewCount: 73,
    },
  ],
  "insurance-risk": [
    {
      id: "p-insur-1",
      name: { fa: "بیمه باربری بین‌الملل آسیا", en: "Asia International Cargo Insurance", ru: "Asia Cargo Insurance" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "تمام مسیرهای دریایی و هوایی", en: "All sea & air routes", ru: "Все морские и авиа маршруты" },
      services: {
        fa: ["بیمه باربری", "بیمه اعتبار صادراتی"],
        en: ["Cargo insurance", "Export credit insurance"],
        ru: ["Страхование груза", "Экспортное кредитное страхование"],
      },
      licenses: { fa: ["مجوز بیمه مرکزی"], en: ["Central insurance license"], ru: ["Страховая лицензия"] },
      experienceYears: 13,
      rating: 4.4,
      reviewCount: 28,
    },
  ],
  "legal-trade": [
    {
      id: "p-leg-1",
      name: { fa: "مؤسسه حقوقی قراردادهای بین‌الملل", en: "Intl Contracts Law Firm", ru: "Международное право" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "ایران — آلمان — ترکیه", en: "Iran — Germany — Turkey", ru: "Иран — Германия — Турция" },
      services: {
        fa: ["قرارداد فروش", "حل اختلاف", "ثبت نمایندگی"],
        en: ["Sales contracts", "Dispute resolution", "Agency registration"],
        ru: ["Договоры", "Споры", "Регистрация"],
      },
      licenses: { fa: ["پروانه وکالت", "عضو کانون وکلاء"], en: ["Bar membership"], ru: ["Членство в коллегии"] },
      experienceYears: 15,
      rating: 4.7,
      reviewCount: 36,
    },
  ],
  "market-development": [
    {
      id: "p-mkt-1",
      name: { fa: "آژانس بازاریابی صادراتی اروپا", en: "Europe Export Marketing Agency", ru: "Europe Export Marketing" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "اروپای شرقی — خاورمیانه", en: "Eastern Europe — Middle East", ru: "Восточная Европа — Ближний Восток" },
      services: {
        fa: ["تحقیقات بازار", "جذب خریدار", "نمایشگاه"],
        en: ["Market research", "Buyer acquisition", "Trade fairs"],
        ru: ["Исследование рынка", "Покупатели", "Выставки"],
      },
      licenses: { fa: ["مجوز بازاریابی بین‌الملل"], en: ["Intl marketing license"], ru: ["Лицензия маркетинга"] },
      experienceYears: 10,
      rating: 4.5,
      reviewCount: 22,
    },
  ],
  "packaging-prep": [
    {
      id: "p-pkg-1",
      name: { fa: "بسته‌بندی صادراتی پک‌پلاس", en: "PackPlus Export Packaging", ru: "PackPlus Packaging" },
      entityType: { fa: "شرکت", en: "Company", ru: "Компания" },
      routes: { fa: "کارخانه — انبار — بندر", en: "Factory — warehouse — port", ru: "Завод — склад — порт" },
      services: {
        fa: ["بسته‌بندی صادراتی", "پالت‌بندی", "لیبل"],
        en: ["Export packaging", "Palletizing", "Labeling"],
        ru: ["Упаковка", "Паллетирование", "Этикетки"],
      },
      licenses: { fa: ["ISO 22000", "استاندارد بسته‌بندی"], en: ["ISO 22000"], ru: ["ISO 22000"] },
      experienceYears: 8,
      rating: 4.3,
      reviewCount: 19,
    },
  ],
  "specialized-trade": [
    {
      id: "p-spec-1",
      name: { fa: "مشاور صادرات — دکتر کریمی", en: "Export Consultant — Dr. Karimi", ru: "Консультант по экспорту" },
      entityType: { fa: "شخص", en: "Individual", ru: "Частное лицо" },
      routes: { fa: " CIS — خاورمیانه — آفریقا", en: "CIS — Middle East — Africa", ru: "СНГ — Ближний Восток — Африка" },
      services: {
        fa: ["مشاوره صادرات", "آموزش", "نماینده محلی"],
        en: ["Export consulting", "Training", "Local representative"],
        ru: ["Консалтинг", "Обучение", "Представитель"],
      },
      licenses: { fa: ["مدرک MBA تجارت بین‌الملل"], en: ["Intl trade MBA"], ru: ["MBA ВЭД"] },
      experienceYears: 17,
      rating: 4.9,
      reviewCount: 47,
    },
  ],
};

export function getTradeServicesContent(language) {
  return tradeServicesContent[language] || tradeServicesContent.en || tradeServicesContent.fa;
}

export function getL1Categories(language) {
  return getTradeServicesContent(language).categories;
}

export function getCategoryById(language, categoryId) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[categoryId] || categoryId;
  return getL1Categories(language).find((c) => c.id === normalized) || null;
}

export function isValidL1CategoryId(id) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[id] || id;
  return L1_CATEGORY_IDS.includes(normalized);
}

export function getSampleProviders(categoryId) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[categoryId] || categoryId;
  return sampleTradeServiceProviders[normalized] || [];
}

export function getSampleMemberCount(categoryId) {
  return getSampleProviders(categoryId).length;
}

/** Count approved/live providers per L1 category (one provider once per category). */
export function countProvidersByCategory(providers) {
  const counts = {};
  if (!Array.isArray(providers)) return counts;

  providers.forEach((provider) => {
    const categoryIds = new Set();
    if (Array.isArray(provider.selectedServices) && provider.selectedServices.length) {
      provider.selectedServices.forEach((s) => {
        if (s?.categoryId) categoryIds.add(s.categoryId);
      });
    } else if (provider.categoryId) {
      categoryIds.add(provider.categoryId);
    }
    categoryIds.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });

  return counts;
}

export function resolveLocalizedField(field, language) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[language] || field.fa || field.en || "";
}

/** Flat list of all L2 services with L1 context for multi-select UI */
export function buildFlatServiceCatalog(language) {
  return getL1Categories(language).flatMap((category) =>
    category.children.map((sub) => ({
      key: `${category.id}:${sub.id}`,
      categoryId: category.id,
      subcategoryId: sub.id,
      categoryTitle: category.title,
      subcategoryTitle: sub.title,
    }))
  );
}

export function findCatalogService(language, categoryId, subcategoryId) {
  return buildFlatServiceCatalog(language).find(
    (item) => item.categoryId === categoryId && item.subcategoryId === subcategoryId
  );
}
