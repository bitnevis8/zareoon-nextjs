/**
 * Fill homepage-visible strings for all locales (legacy + key namespaces).
 * Usage: node scripts/fill-homepage-i18n.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "messages");

function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else if (Array.isArray(v) && Array.isArray(out[k])) {
      out[k] = out[k].map((item, i) => (v[i] ? deepMerge(item || {}, v[i]) : item));
      if (v.length > out[k].length) out[k] = out[k].concat(v.slice(out[k].length));
    } else if (v !== undefined && v !== null && v !== "") {
      out[k] = v;
    }
  }
  return out;
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("wrote", path.relative(root, filePath));
}

function patchFile(rel, patch) {
  const filePath = path.join(root, rel);
  const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
  writeJson(filePath, deepMerge(current, patch));
}

const legacyByLang = {
  en: {
    siteName: "Zareoon",
    siteTagline: "Zareoon — a secure bridge from production to consumption",
    cart: "Cart",
    home: "Home",
    login: "Log in",
    account: "Account",
    loginRegister: "Log in / Sign up",
    pleaseLoginFirst: "Please log in first",
    selectLanguage: "Select language",
    language: "Language",
    messages: "Messages",
    close: "Close",
    profile: "Profile",
    searchPlaceholder: "Search products, categories, and services...",
    searchAdvanced: "Advanced search",
    productCategories: "Product categories",
    categoriesShort: "Categories",
    closeMenu: "Close menu",
    viewCategoryProducts: "View products",
    noCategoryRegistered: "No categories yet.",
    viewAllCategories: "View all categories",
    latestAvailableOnZareoon: "Latest available products on Zareoon",
    latestAvailableInParent: "Latest available products in {name}",
    groupByCategory: "Group by category",
    noProductsWithStock: "No products with stock right now.",
    allRightsReserved: "All rights reserved.",
    supportContact: "Support",
    supportTelegram: "Telegram",
    supportWhatsapp: "WhatsApp",
    supportCall: "Call",
    tradeServicesExploreCta: "Providers",
    tradeServicesJoinCta: "Join",
    tradeServicesSectionLabel: "Trade & international services",
    buyerSellerPortalBadge: "For sellers and service providers",
    buyerSellerPortalSectionTitle: "Your brand page on Zareoon",
    buyerSellerPortalSectionDesc:
      "Be a seller or service provider; create a public page with a dedicated link so customers can see your products or services, contact you, and follow you.",
    buyerSellerPortalApplicantBadge: "For buyers and applicants",
    buyerSellerPortalBuyerTitle: "Submit a product or trade-service requirement",
    buyerSellerPortalBuyerDesc:
      "Post what you need so sellers and trade-service providers on Zareoon can respond.",
    buyerSellerPortalBuyerCta: "Submit a purchase or service request",
    buyerSellerPortalSellerCta: "Create a shop or services page on Zareoon",
    buyerSellerPortalHint: "You can be a seller, service provider, and applicant at the same time.",
    buyerSellerPortalPricingLink: "View seller plans",
    buyerSellerPortalShopBadge: "Shop",
    buyerSellerPortalServiceBadge: "Services",
    buyerSellerPortalRecentShops: "Latest shops",
    buyerSellerPortalRecentServices: "Latest service providers",
    buyerSellerPortalTabShops: "Shops",
    buyerSellerPortalTabServices: "Services",
    buyerSellerPortalEmptyShops: "No dedicated shop pages yet.",
    buyerSellerPortalEmptyServices: "No dedicated service pages yet.",
    footerSecureTagline: "A secure platform for direct connection between sellers and buyers",
    pagerPrevSlide: "Previous slide",
    pagerNextSlide: "Next slide",
    pagerSlidesLabel: "Service slides",
    pagerSlideN: "Slide {n}",
    escrowBlockTitle: "Deal guarantee & escrow",
    escrowBlockHint: "Optional tool — final responsibility with the parties",
    lcBlockHint: "Optional facilitation — responsibility with the parties",
    lcSectionIntro:
      "For international deals, LC-related features only help users coordinate; final responsibility remains with the parties, including:",
    mobileMyZareoon: "My Zareoon",
    mobileSearchTab: "Search",
    mobileRequestShort: "Request",
    mobileProductsTab: "Products",
    mobileServicesTab: "Services",
    escrowBadge: "Optional user tools",
    escrowTitle: "Deal guarantee, escrow & letter of credit (LC)",
    escrowDescription:
      "Optional tools to help users coordinate; using them does not make Zareoon a party to the deal.",
    lcBadge: "Letter of credit",
    lcTitle: "Specialized letter of credit (LC) services",
    lcDescription:
      "If you need an LC for import or export, entrust opening, follow-up, and execution to us with confidence.",
  },
  es: {
    siteName: "Zareoon",
    siteTagline: "Zareoon — un puente seguro entre producción y consumo",
    cart: "Carrito",
    home: "Inicio",
    login: "Entrar",
    account: "Cuenta",
    loginRegister: "Entrar / Registrarse",
    pleaseLoginFirst: "Inicie sesión primero",
    selectLanguage: "Seleccionar idioma",
    language: "Idioma",
    messages: "Mensajes",
    close: "Cerrar",
    profile: "Perfil",
    searchPlaceholder: "Buscar productos, categorías y servicios...",
    searchAdvanced: "Búsqueda avanzada",
    productCategories: "Categorías de productos",
    categoriesShort: "Categorías",
    closeMenu: "Cerrar menú",
    viewCategoryProducts: "Ver productos",
    noCategoryRegistered: "Aún no hay categorías.",
    viewAllCategories: "Ver todas las categorías",
    latestAvailableOnZareoon: "Productos disponibles más recientes en Zareoon",
    latestAvailableInParent: "Productos disponibles más recientes en {name}",
    groupByCategory: "Agrupar por categoría",
    noProductsWithStock: "No hay productos con stock por ahora.",
    allRightsReserved: "Todos los derechos reservados.",
    supportContact: "Soporte",
    supportTelegram: "Telegram",
    supportWhatsapp: "WhatsApp",
    supportCall: "Llamar",
    tradeServicesExploreCta: "Proveedores",
    tradeServicesJoinCta: "Unirse",
    tradeServicesSectionLabel: "Servicios comerciales e internacionales",
    buyerSellerPortalBadge: "Para vendedores y prestadores de servicios",
    buyerSellerPortalSectionTitle: "La página de su marca en Zareoon",
    buyerSellerPortalSectionDesc:
      "Sea vendedor o prestador de servicios; cree una página pública con enlace propio para que los clientes vean sus productos o servicios, contacten y sigan.",
    buyerSellerPortalApplicantBadge: "Para compradores y solicitantes",
    buyerSellerPortalBuyerTitle: "Registrar necesidad de producto o servicios comerciales",
    buyerSellerPortalBuyerDesc:
      "Publique su necesidad para que vendedores y prestadores de servicios en Zareoon respondan.",
    buyerSellerPortalBuyerCta: "Enviar solicitud de compra o servicio",
    buyerSellerPortalSellerCta: "Crear página de tienda | servicios en Zareoon",
    buyerSellerPortalHint: "Puede ser vendedor, prestador de servicios y solicitante a la vez.",
    buyerSellerPortalPricingLink: "Ver planes de vendedor",
    buyerSellerPortalShopBadge: "Tienda",
    buyerSellerPortalServiceBadge: "Servicios",
    buyerSellerPortalRecentShops: "Últimas tiendas",
    buyerSellerPortalRecentServices: "Últimos prestadores",
    buyerSellerPortalTabShops: "Tiendas",
    buyerSellerPortalTabServices: "Servicios",
    buyerSellerPortalEmptyShops: "Aún no hay tiendas con página propia.",
    buyerSellerPortalEmptyServices: "Aún no hay páginas de servicios.",
    footerSecureTagline: "Una plataforma segura para la conexión directa entre vendedores y compradores",
    pagerPrevSlide: "Diapositiva anterior",
    pagerNextSlide: "Diapositiva siguiente",
    pagerSlidesLabel: "Diapositivas de servicios",
    pagerSlideN: "Diapositiva {n}",
    escrowBlockTitle: "Garantía de operaciones y depósito en garantía",
    escrowBlockHint: "Herramienta opcional — responsabilidad final de las partes",
    lcBlockHint: "Facilitación opcional — responsabilidad de las partes",
    lcSectionIntro:
      "Para operaciones internacionales, las funciones de LC solo ayudan a coordinar; la responsabilidad final es de las partes, incluyendo:",
    mobileMyZareoon: "Mi Zareoon",
    mobileSearchTab: "Buscar",
    mobileRequestShort: "Solicitud",
    mobileProductsTab: "Productos",
    mobileServicesTab: "Servicios",
    escrowBadge: "Herramientas opcionales",
    escrowTitle: "Garantía de operaciones, escrow y carta de crédito (LC)",
    escrowDescription:
      "Herramientas opcionales para facilitar la coordinación; usarlas no convierte a Zareoon en parte del trato.",
    lcBadge: "Carta de crédito",
    lcTitle: "Servicios especializados de carta de crédito (LC)",
    lcDescription:
      "Si necesita LC para importación o exportación, confíenos la apertura, el seguimiento y la ejecución.",
  },
};

// Reuse English as base for nl/fi/tr; customize below
legacyByLang.nl = {
  ...legacyByLang.en,
  siteTagline: "Zareoon — een veilige brug van productie naar consumptie",
  cart: "Winkelwagen",
  home: "Home",
  login: "Inloggen",
  account: "Account",
  loginRegister: "Inloggen / Registreren",
  pleaseLoginFirst: "Log eerst in",
  selectLanguage: "Taal kiezen",
  language: "Taal",
  messages: "Berichten",
  close: "Sluiten",
  profile: "Profiel",
  searchPlaceholder: "Zoek producten, categorieën en diensten...",
  searchAdvanced: "Geavanceerd zoeken",
  productCategories: "Productcategorieën",
  categoriesShort: "Categorieën",
  closeMenu: "Menu sluiten",
  viewCategoryProducts: "Producten bekijken",
  noCategoryRegistered: "Nog geen categorieën.",
  viewAllCategories: "Alle categorieën",
  latestAvailableOnZareoon: "Nieuwste beschikbare producten op Zareoon",
  latestAvailableInParent: "Nieuwste beschikbare producten in {name}",
  groupByCategory: "Groeperen op categorie",
  noProductsWithStock: "Momenteel geen producten op voorraad.",
  allRightsReserved: "Alle rechten voorbehouden.",
  supportContact: "Support",
  tradeServicesExploreCta: "Aanbieders",
  tradeServicesJoinCta: "Lid worden",
  tradeServicesSectionLabel: "Handels- en internationale diensten",
  buyerSellerPortalBadge: "Voor verkopers en dienstverleners",
  buyerSellerPortalSectionTitle: "Uw merkpagina op Zareoon",
  buyerSellerPortalSectionDesc:
      "Word verkoper of dienstverlener; maak een openbare pagina met een eigen link zodat klanten uw producten of diensten zien, contact opnemen en volgen.",
  buyerSellerPortalApplicantBadge: "Voor kopers en aanvragers",
  buyerSellerPortalBuyerTitle: "Behoefte aan product of handelsdiensten registreren",
  buyerSellerPortalBuyerDesc:
    "Plaats uw behoefte zodat verkopers en dienstverleners op Zareoon kunnen reageren.",
  buyerSellerPortalBuyerCta: "Aankoop- of dienstverzoek indienen",
  buyerSellerPortalSellerCta: "Winkel- of dienstenpagina maken op Zareoon",
  buyerSellerPortalHint: "U kunt tegelijk verkoper, dienstverlener en aanvrager zijn.",
  buyerSellerPortalPricingLink: "Verkopersabonnementen bekijken",
  buyerSellerPortalShopBadge: "Winkel",
  buyerSellerPortalServiceBadge: "Diensten",
  buyerSellerPortalRecentShops: "Nieuwste winkels",
  buyerSellerPortalRecentServices: "Nieuwste dienstverleners",
  buyerSellerPortalTabShops: "Winkels",
  buyerSellerPortalTabServices: "Diensten",
  buyerSellerPortalEmptyShops: "Nog geen winkels met eigen pagina.",
  buyerSellerPortalEmptyServices: "Nog geen dienstenpagina's.",
  footerSecureTagline: "Een veilig platform voor directe verbinding tussen verkopers en kopers",
  pagerPrevSlide: "Vorige slide",
  pagerNextSlide: "Volgende slide",
  pagerSlidesLabel: "Dienstenslides",
  pagerSlideN: "Slide {n}",
  escrowBlockTitle: "Transactiegarantie & escrow",
  escrowBlockHint: "Optioneel hulpmiddel — eindverantwoordelijkheid bij partijen",
  lcBlockHint: "Optionele facilitatie — verantwoordelijkheid bij partijen",
  lcSectionIntro:
    "Voor internationale deals helpen LC-functies alleen bij coördinatie; eindverantwoordelijkheid blijft bij de partijen, inclusief:",
  mobileMyZareoon: "Mijn Zareoon",
  mobileSearchTab: "Zoeken",
  mobileRequestShort: "Aanvraag",
  mobileProductsTab: "Producten",
  mobileServicesTab: "Diensten",
  escrowBadge: "Optionele tools",
  escrowTitle: "Transactiegarantie, escrow & letter of credit (LC)",
  escrowDescription:
    "Optionele tools om afstemming te vergemakkelijken; gebruik maakt Zareoon geen partij bij de deal.",
  lcBadge: "Letter of credit",
  lcTitle: "Gespecialiseerde LC-diensten",
  lcDescription:
    "Heeft u LC nodig voor import of export? Vertrouw opening, opvolging en uitvoering toe aan ons.",
};

legacyByLang.tr = {
  ...legacyByLang.en,
  siteTagline: "Zareoon — üretimden tüketime güvenli köprü",
  cart: "Sepet",
  home: "Ana sayfa",
  login: "Giriş",
  account: "Hesap",
  loginRegister: "Giriş / Kayıt",
  pleaseLoginFirst: "Önce giriş yapın",
  selectLanguage: "Dil seçin",
  language: "Dil",
  messages: "Mesajlar",
  close: "Kapat",
  profile: "Profil",
  searchPlaceholder: "Ürün, kategori ve hizmet ara...",
  searchAdvanced: "Gelişmiş arama",
  productCategories: "Ürün kategorileri",
  categoriesShort: "Kategoriler",
  closeMenu: "Menüyü kapat",
  viewCategoryProducts: "Ürünleri gör",
  noCategoryRegistered: "Henüz kategori yok.",
  viewAllCategories: "Tüm kategoriler",
  latestAvailableOnZareoon: "Zareoon'daki en yeni mevcut ürünler",
  latestAvailableInParent: "{name} içindeki en yeni mevcut ürünler",
  groupByCategory: "Kategoriye göre grupla",
  noProductsWithStock: "Şu an stoklu ürün yok.",
  allRightsReserved: "Tüm hakları saklıdır.",
  supportContact: "Destek",
  tradeServicesExploreCta: "Hizmet verenler",
  tradeServicesJoinCta: "Katıl",
  tradeServicesSectionLabel: "Ticari ve uluslararası hizmetler",
  buyerSellerPortalBadge: "Satıcılar ve hizmet sağlayıcılar için",
  buyerSellerPortalSectionTitle: "Zareoon'da marka sayfanız",
  buyerSellerPortalSectionDesc:
    "Satıcı veya hizmet sağlayıcı olun; müşterilerin ürün/hizmetlerinizi görüp iletişime geçebileceği özel linkli bir sayfa oluşturun.",
  buyerSellerPortalApplicantBadge: "Alıcılar ve talep sahipleri için",
  buyerSellerPortalBuyerTitle: "Ürün veya ticari hizmet ihtiyacı kaydı",
  buyerSellerPortalBuyerDesc:
    "İhtiyacınızı kaydedin; Zareoon'daki satıcılar ve hizmet sağlayıcılar yanıtlasın.",
  buyerSellerPortalBuyerCta: "Satın alma veya hizmet talebi gönder",
  buyerSellerPortalSellerCta: "Zareoon'da mağaza | hizmet sayfası oluştur",
  buyerSellerPortalHint: "Aynı anda satıcı, hizmet sağlayıcı ve talep sahibi olabilirsiniz.",
  buyerSellerPortalPricingLink: "Satıcı aboneliklerini gör",
  buyerSellerPortalShopBadge: "Mağaza",
  buyerSellerPortalServiceBadge: "Hizmetler",
  buyerSellerPortalRecentShops: "Son mağazalar",
  buyerSellerPortalRecentServices: "Son hizmet sağlayıcılar",
  buyerSellerPortalTabShops: "Mağazalar",
  buyerSellerPortalTabServices: "Hizmetler",
  buyerSellerPortalEmptyShops: "Henüz özel mağaza sayfası yok.",
  buyerSellerPortalEmptyServices: "Henüz hizmet sayfası yok.",
  footerSecureTagline: "Satıcılar ve alıcılar arasında doğrudan bağlantı için güvenli platform",
  pagerPrevSlide: "Önceki slayt",
  pagerNextSlide: "Sonraki slayt",
  pagerSlidesLabel: "Hizmet slaytları",
  pagerSlideN: "Slayt {n}",
  escrowBlockTitle: "İşlem güvencesi ve emanet hesabı",
  escrowBlockHint: "İsteğe bağlı araç — nihai sorumluluk taraflarda",
  lcBlockHint: "İsteğe bağlı kolaylaştırma — sorumluluk taraflarda",
  lcSectionIntro:
    "Uluslararası işlemlerde LC özellikleri yalnızca koordinasyona yardımcı olur; nihai sorumluluk taraflardadır, bunlar dahil:",
  mobileMyZareoon: "Zareoon'um",
  mobileSearchTab: "Ara",
  mobileRequestShort: "Talep",
  mobileProductsTab: "Ürünler",
  mobileServicesTab: "Hizmetler",
  escrowBadge: "İsteğe bağlı araçlar",
  escrowTitle: "İşlem güvencesi, emanet ve akreditif (LC)",
  escrowDescription:
    "Koordinasyonu kolaylaştıran isteğe bağlı araçlar; kullanmak Zareoon'u taraf yapmaz.",
  lcBadge: "Akreditif",
  lcTitle: "Uzman akreditif (LC) hizmetleri",
  lcDescription:
    "İthalat veya ihracat için LC gerekiyorsa açılış, takip ve yürütmeyi güvenle bize bırakın.",
};

legacyByLang.fi = {
  ...legacyByLang.en,
  siteTagline: "Zareoon — turvallinen silta tuotannosta kulutukseen",
  cart: "Ostoskori",
  home: "Etusivu",
  login: "Kirjaudu",
  account: "Tili",
  loginRegister: "Kirjaudu / Rekisteröidy",
  pleaseLoginFirst: "Kirjaudu ensin sisään",
  selectLanguage: "Valitse kieli",
  language: "Kieli",
  messages: "Viestit",
  close: "Sulje",
  profile: "Profiili",
  searchPlaceholder: "Hae tuotteita, kategorioita ja palveluita...",
  searchAdvanced: "Tarkennettu haku",
  productCategories: "Tuotekategoriat",
  categoriesShort: "Kategoriat",
  closeMenu: "Sulje valikko",
  viewCategoryProducts: "Näytä tuotteet",
  noCategoryRegistered: "Ei kategorioita vielä.",
  viewAllCategories: "Kaikki kategoriat",
  latestAvailableOnZareoon: "Uusimmat saatavilla olevat tuotteet Zareoonissa",
  latestAvailableInParent: "Uusimmat saatavilla olevat tuotteet: {name}",
  groupByCategory: "Ryhmittele kategorian mukaan",
  noProductsWithStock: "Ei tuotteita varastossa juuri nyt.",
  allRightsReserved: "Kaikki oikeudet pidätetään.",
  supportContact: "Tuki",
  tradeServicesExploreCta: "Palveluntarjoajat",
  tradeServicesJoinCta: "Liity",
  tradeServicesSectionLabel: "Kaupalliset ja kansainväliset palvelut",
  buyerSellerPortalBadge: "Myyjille ja palveluntarjoajille",
  buyerSellerPortalSectionTitle: "Brändisivusi Zareoonissa",
  buyerSellerPortalSectionDesc:
    "Ole myyjä tai palveluntarjoaja; luo julkinen sivu omalla linkillä, jotta asiakkaat näkevät tuotteesi tai palvelusi, ottavat yhteyttä ja seuraavat.",
  buyerSellerPortalApplicantBadge: "Ostajille ja hakijoille",
  buyerSellerPortalBuyerTitle: "Ilmoita tuote- tai kauppapalvelutarve",
  buyerSellerPortalBuyerDesc:
    "Julkaise tarpeesi, jotta myyjät ja palveluntarjoajat Zareoonissa voivat vastata.",
  buyerSellerPortalBuyerCta: "Lähetä osto- tai palvelupyyntö",
  buyerSellerPortalSellerCta: "Luo kauppa- | palvelusivu Zareoonissa",
  buyerSellerPortalHint: "Voit olla samalla myyjä, palveluntarjoaja ja hakija.",
  buyerSellerPortalPricingLink: "Katso myyjätilaukset",
  buyerSellerPortalShopBadge: "Kauppa",
  buyerSellerPortalServiceBadge: "Palvelut",
  buyerSellerPortalRecentShops: "Uusimmat kaupat",
  buyerSellerPortalRecentServices: "Uusimmat palveluntarjoajat",
  buyerSellerPortalTabShops: "Kaupat",
  buyerSellerPortalTabServices: "Palvelut",
  buyerSellerPortalEmptyShops: "Ei vielä omia kauppansivuja.",
  buyerSellerPortalEmptyServices: "Ei vielä palvelusivuja.",
  footerSecureTagline: "Turvallinen alusta myyjien ja ostajien suoraan yhteyteen",
  pagerPrevSlide: "Edellinen dia",
  pagerNextSlide: "Seuraava dia",
  pagerSlidesLabel: "Palveludiat",
  pagerSlideN: "Dia {n}",
  escrowBlockTitle: "Kaupan takuu ja escrow",
  escrowBlockHint: "Valinnainen työkalu — lopullinen vastuu osapuolilla",
  lcBlockHint: "Valinnainen helpotus — vastuu osapuolilla",
  lcSectionIntro:
    "Kansainvälisissä kaupoissa LC-ominaisuudet vain auttavat koordinointia; lopullinen vastuu on osapuolilla, mukaan lukien:",
  mobileMyZareoon: "Oma Zareoon",
  mobileSearchTab: "Haku",
  mobileRequestShort: "Pyyntö",
  mobileProductsTab: "Tuotteet",
  mobileServicesTab: "Palvelut",
  escrowBadge: "Valinnaiset työkalut",
  escrowTitle: "Kaupan takuu, escrow ja remburssi (LC)",
  escrowDescription:
    "Valinnaiset työkalut koordinointiin; käyttö ei tee Zareoonista kaupan osapuolta.",
  lcBadge: "Remburssi",
  lcTitle: "Erikoistuneet remburssipalvelut (LC)",
  lcDescription:
    "Jos tarvitset LC:tä tuontiin tai vientiin, anna avaus, seuranta ja toteutus meille.",
};

legacyByLang.ar = {
  siteName: "زارعون",
  siteTagline: "زارعون جسر آمن بين الإنتاج والاستهلاك",
  cart: "السلة",
  home: "الرئيسية",
  login: "تسجيل الدخول",
  account: "الحساب",
  loginRegister: "دخول / تسجيل",
  pleaseLoginFirst: "يرجى تسجيل الدخول أولاً",
  selectLanguage: "اختر اللغة",
  language: "اللغة",
  messages: "الرسائل",
  close: "إغلاق",
  profile: "الملف",
  searchPlaceholder: "ابحث في المنتجات والفئات والخدمات...",
  searchAdvanced: "بحث متقدم",
  productCategories: "فئات المنتجات",
  categoriesShort: "الفئات",
  closeMenu: "إغلاق القائمة",
  viewCategoryProducts: "عرض المنتجات",
  noCategoryRegistered: "لا توجد فئات بعد.",
  viewAllCategories: "كل الفئات",
  latestAvailableOnZareoon: "أحدث المنتجات المتوفرة في زارعون",
  latestAvailableInParent: "أحدث المنتجات المتوفرة في {name}",
  groupByCategory: "تجميع حسب الفئة",
  noProductsWithStock: "لا توجد منتجات متوفرة حالياً.",
  allRightsReserved: "جميع الحقوق محفوظة.",
  supportContact: "الدعم",
  supportTelegram: "تيليجرام",
  supportWhatsapp: "واتساب",
  supportCall: "اتصال",
  tradeServicesExploreCta: "مقدّمو الخدمات",
  tradeServicesJoinCta: "انضمام",
  tradeServicesSectionLabel: "الخدمات التجارية والتجارة الدولية",
  buyerSellerPortalBadge: "للبائعين ومقدّمي الخدمات",
  buyerSellerPortalSectionTitle: "صفحة علامتك في زارعون",
  buyerSellerPortalSectionDesc:
    "كن بائعاً أو مقدّم خدمات؛ أنشئ صفحة عامة برابط خاص ليرى العملاء منتجاتك أو خدماتك ويتواصلوا ويتابعوا.",
  buyerSellerPortalApplicantBadge: "للمشترين ومقدّمي الطلبات",
  buyerSellerPortalBuyerTitle: "تسجيل حاجة لمنتج أو خدمات تجارية",
  buyerSellerPortalBuyerDesc:
    "سجّل احتياجك ليردّ البائعون ومقدّمو الخدمات في زارعون.",
  buyerSellerPortalBuyerCta: "إرسال طلب شراء أو خدمة",
  buyerSellerPortalSellerCta: "إنشاء صفحة متجر | خدمات في زارعون",
  buyerSellerPortalHint: "يمكنك أن تكون بائعاً ومقدّم خدمات وطالباً في آن واحد.",
  buyerSellerPortalPricingLink: "عرض اشتراكات البائعين",
  buyerSellerPortalShopBadge: "متجر",
  buyerSellerPortalServiceBadge: "خدمات",
  buyerSellerPortalRecentShops: "أحدث المتاجر",
  buyerSellerPortalRecentServices: "أحدث مقدّمي الخدمات",
  buyerSellerPortalTabShops: "المتاجر",
  buyerSellerPortalTabServices: "الخدمات",
  buyerSellerPortalEmptyShops: "لا توجد متاجر بصفحة خاصة بعد.",
  buyerSellerPortalEmptyServices: "لا توجد صفحات خدمات بعد.",
  footerSecureTagline: "منصة آمنة للتواصل المباشر بين البائعين والمشترين",
  pagerPrevSlide: "الشريحة السابقة",
  pagerNextSlide: "الشريحة التالية",
  pagerSlidesLabel: "شرائح الخدمات",
  pagerSlideN: "الشريحة {n}",
  escrowBlockTitle: "ضمان المعاملات والحساب الأمين",
  escrowBlockHint: "أداة اختيارية — المسؤولية النهائية على الأطراف",
  lcBlockHint: "تيسير اختياري — المسؤولية على الأطراف",
  lcSectionIntro:
    "للمعاملات الدولية، ميزات الاعتماد المستندي تسهّل التنسيق فقط؛ المسؤولية النهائية على الأطراف، وتشمل:",
  mobileMyZareoon: "زارعون أنا",
  mobileSearchTab: "بحث",
  mobileRequestShort: "طلب",
  mobileProductsTab: "منتجات",
  mobileServicesTab: "خدمات",
  escrowBadge: "أدوات اختيارية",
  escrowTitle: "ضمان المعاملات والحساب الأمين والاعتماد المستندي (LC)",
  escrowDescription:
    "أدوات اختيارية لتسهيل التنسيق؛ استخدامها لا يجعل زارعون طرفاً في الصفقة.",
  lcBadge: "اعتماد مستندي",
  lcTitle: "خدمات متخصصة للاعتماد المستندي (LC)",
  lcDescription:
    "إن احتجت LC للاستيراد أو التصدير، أوكل إلينا الافتتاح والمتابعة والتنفيذ بثقة.",
};

legacyByLang.ur = {
  siteName: "زارعون",
  siteTagline: "زارعون — پیداوار سے کھپت تک محفوظ پل",
  cart: "کارٹ",
  home: "ہوم",
  login: "لاگ اِن",
  account: "اکاؤنٹ",
  loginRegister: "لاگ اِن / رجسٹر",
  pleaseLoginFirst: "پہلے لاگ اِن کریں",
  selectLanguage: "زبان منتخب کریں",
  language: "زبان",
  messages: "پیغامات",
  close: "بند کریں",
  profile: "پروفائل",
  searchPlaceholder: "مصنوعات، زمرے اور خدمات تلاش کریں...",
  searchAdvanced: "جدید تلاش",
  productCategories: "مصنوعات کے زمرے",
  categoriesShort: "زمرے",
  closeMenu: "مینو بند کریں",
  viewCategoryProducts: "مصنوعات دیکھیں",
  noCategoryRegistered: "ابھی کوئی زمرہ نہیں۔",
  viewAllCategories: "تمام زمرے",
  latestAvailableOnZareoon: "زارعون پر تازہ ترین دستیاب مصنوعات",
  latestAvailableInParent: "{name} میں تازہ ترین دستیاب مصنوعات",
  groupByCategory: "زمرے کے لحاظ سے گروپ",
  noProductsWithStock: "اس وقت کوئی دستیاب مصنوعات نہیں۔",
  allRightsReserved: "جملہ حقوق محفوظ ہیں۔",
  supportContact: "سپورٹ",
  supportTelegram: "ٹیلیگرام",
  supportWhatsapp: "واٹس ایپ",
  supportCall: "کال",
  tradeServicesExploreCta: "سروس فراہم کنندگان",
  tradeServicesJoinCta: "شمولیت",
  tradeServicesSectionLabel: "تجارتی اور بین الاقوامی خدمات",
  buyerSellerPortalBadge: "فروخت کنندگان اور سروس فراہم کنندگان کے لیے",
  buyerSellerPortalSectionTitle: "زارعون پر آپ کا برانڈ صفحہ",
  buyerSellerPortalSectionDesc:
    "فروخت کنندہ یا سروس فراہم کنندہ بنیں؛ مخصوص لنک والا عوامی صفحہ بنائیں تاکہ گاہک مصنوعات/خدمات دیکھیں، رابطہ کریں اور فالو کریں۔",
  buyerSellerPortalApplicantBadge: "خریداروں اور درخواست گزاروں کے لیے",
  buyerSellerPortalBuyerTitle: "مصنوعات یا تجارتی خدمات کی ضرورت درج کریں",
  buyerSellerPortalBuyerDesc:
    "اپنی ضرورت درج کریں تاکہ زارعون پر فروخت کنندگان اور سروس فراہم کنندگان جواب دیں۔",
  buyerSellerPortalBuyerCta: "خرید یا خدمت کی درخواست بھیجیں",
  buyerSellerPortalSellerCta: "زارعون پر دکان | خدمات کا صفحہ بنائیں",
  buyerSellerPortalHint: "آپ بیک وقت فروخت کنندہ، سروس فراہم کنندہ اور درخواست گزار ہو سکتے ہیں۔",
  buyerSellerPortalPricingLink: "فروخت کنندگان کے پلان دیکھیں",
  buyerSellerPortalShopBadge: "دکان",
  buyerSellerPortalServiceBadge: "خدمات",
  buyerSellerPortalRecentShops: "تازہ ترین دکانیں",
  buyerSellerPortalRecentServices: "تازہ ترین سروس فراہم کنندگان",
  buyerSellerPortalTabShops: "دکانیں",
  buyerSellerPortalTabServices: "خدمات",
  buyerSellerPortalEmptyShops: "ابھی کوئی مخصوص دکان صفحہ نہیں۔",
  buyerSellerPortalEmptyServices: "ابھی کوئی خدمات کا صفحہ نہیں۔",
  footerSecureTagline: "فروخت کنندگان اور خریداروں کے براہِ راست رابطے کے لیے محفوظ پلیٹ فارم",
  pagerPrevSlide: "پچھلی سلائیڈ",
  pagerNextSlide: "اگلی سلائیڈ",
  pagerSlidesLabel: "خدمات کی سلائیڈز",
  pagerSlideN: "سلائیڈ {n}",
  escrowBlockTitle: "سودے کی ضمانت اور امانی اکاؤنٹ",
  escrowBlockHint: "اختیاری ٹول — حتمی ذمہ داری فریقین پر",
  lcBlockHint: "اختیاری سہولت — ذمہ داری فریقین پر",
  lcSectionIntro:
    "بین الاقوامی سودوں میں LC خصوصیات صرف ہم آہنگی میں مدد کرتی ہیں؛ حتمی ذمہ داری فریقین پر ہے، بشمول:",
  mobileMyZareoon: "میرا زارعون",
  mobileSearchTab: "تلاش",
  mobileRequestShort: "درخواست",
  mobileProductsTab: "مصنوعات",
  mobileServicesTab: "خدمات",
  escrowBadge: "اختیاری ٹولز",
  escrowTitle: "سودے کی ضمانت، امانی اور LC",
  escrowDescription:
    "ہم آہنگی کے لیے اختیاری ٹولز؛ استعمال سے زارعون سودے کا فریق نہیں بنتا۔",
  lcBadge: "LC",
  lcTitle: "خصوصی LC خدمات",
  lcDescription:
    "درآمد/برآمد کے لیے LC درکار ہو تو افتتاح، فالو اپ اور عملدرآمد ہمیں سونپیں۔",
};

legacyByLang.ru = {
  ...legacyByLang.en,
  siteName: "Zareoon",
  siteTagline: "Zareoon — надёжный мост от производства к потреблению",
  cart: "Корзина",
  home: "Главная",
  login: "Войти",
  account: "Аккаунт",
  loginRegister: "Вход / Регистрация",
  pleaseLoginFirst: "Сначала войдите",
  selectLanguage: "Выберите язык",
  language: "Язык",
  messages: "Сообщения",
  close: "Закрыть",
  profile: "Профиль",
  searchPlaceholder: "Поиск товаров, категорий и услуг...",
  searchAdvanced: "Расширенный поиск",
  productCategories: "Категории товаров",
  categoriesShort: "Категории",
  closeMenu: "Закрыть меню",
  viewCategoryProducts: "Смотреть товары",
  noCategoryRegistered: "Категорий пока нет.",
  viewAllCategories: "Все категории",
  latestAvailableOnZareoon: "Новейшие доступные товары на Zareoon",
  latestAvailableInParent: "Новейшие доступные товары в {name}",
  groupByCategory: "Группировать по категории",
  noProductsWithStock: "Сейчас нет товаров в наличии.",
  allRightsReserved: "Все права защищены.",
  supportContact: "Поддержка",
  supportTelegram: "Telegram",
  supportWhatsapp: "WhatsApp",
  supportCall: "Звонок",
  tradeServicesExploreCta: "Поставщики услуг",
  tradeServicesJoinCta: "Вступить",
  tradeServicesSectionLabel: "Торговые и международные услуги",
  buyerSellerPortalBadge: "Для продавцов и поставщиков услуг",
  buyerSellerPortalSectionTitle: "Страница вашего бренда на Zareoon",
  buyerSellerPortalSectionDesc:
    "Станьте продавцом или поставщиком услуг; создайте публичную страницу со своей ссылкой, чтобы клиенты видели товары или услуги, связывались и подписывались.",
  buyerSellerPortalApplicantBadge: "Для покупателей и заявителей",
  buyerSellerPortalBuyerTitle: "Заявить потребность в товаре или торговых услугах",
  buyerSellerPortalBuyerDesc:
    "Опубликуйте запрос — продавцы и поставщики услуг на Zareoon смогут ответить.",
  buyerSellerPortalBuyerCta: "Отправить запрос на покупку или услугу",
  buyerSellerPortalSellerCta: "Создать страницу магазина | услуг на Zareoon",
  buyerSellerPortalHint: "Вы можете быть продавцом, поставщиком услуг и заявителем одновременно.",
  buyerSellerPortalPricingLink: "Тарифы для продавцов",
  buyerSellerPortalShopBadge: "Магазин",
  buyerSellerPortalServiceBadge: "Услуги",
  buyerSellerPortalRecentShops: "Последние магазины",
  buyerSellerPortalRecentServices: "Последние поставщики услуг",
  buyerSellerPortalTabShops: "Магазины",
  buyerSellerPortalTabServices: "Услуги",
  buyerSellerPortalEmptyShops: "Пока нет магазинов с отдельной страницей.",
  buyerSellerPortalEmptyServices: "Пока нет страниц услуг.",
  footerSecureTagline: "Безопасная платформа для прямой связи продавцов и покупателей",
  pagerPrevSlide: "Предыдущий слайд",
  pagerNextSlide: "Следующий слайд",
  pagerSlidesLabel: "Слайды услуг",
  pagerSlideN: "Слайд {n}",
  escrowBlockTitle: "Гарантия сделок и эскроу",
  escrowBlockHint: "Опциональный инструмент — финальная ответственность у сторон",
  lcBlockHint: "Опциональное содействие — ответственность у сторон",
  lcSectionIntro:
    "Для международных сделок функции LC лишь помогают координации; финальная ответственность у сторон, включая:",
  mobileMyZareoon: "Мой Zareoon",
  mobileSearchTab: "Поиск",
  mobileRequestShort: "Заявка",
  mobileProductsTab: "Товары",
  mobileServicesTab: "Услуги",
  escrowBadge: "Опциональные инструменты",
  escrowTitle: "Гарантия сделок, эскроу и аккредитив (LC)",
  escrowDescription:
    "Опциональные инструменты координации; их использование не делает Zareoon стороной сделки.",
  lcBadge: "Аккредитив",
  lcTitle: "Специализированные услуги LC",
  lcDescription:
    "Если нужен LC для импорта или экспорта, доверьте открытие, сопровождение и исполнение нам.",
};

const legalNav = {
  en: {
    aria: "Legal documents and help",
    about: "About us",
    terms: "Terms & conditions",
    privacy: "Privacy",
    sellers: "Seller terms",
    buyers: "Buyer terms",
    refund: "Refunds",
    cancellation: "Cancellation",
    disputes: "Dispute resolution",
    help: "Help",
    pricing: "Subscriptions",
  },
  es: {
    aria: "Documentos legales y ayuda",
    about: "Sobre nosotros",
    terms: "Términos y condiciones",
    privacy: "Privacidad",
    sellers: "Términos para vendedores",
    buyers: "Términos para compradores",
    refund: "Reembolsos",
    cancellation: "Cancelación",
    disputes: "Resolución de disputas",
    help: "Ayuda",
    pricing: "Suscripciones",
  },
  nl: {
    aria: "Juridische documenten en hulp",
    about: "Over ons",
    terms: "Voorwaarden",
    privacy: "Privacy",
    sellers: "Voorwaarden verkopers",
    buyers: "Voorwaarden kopers",
    refund: "Terugbetaling",
    cancellation: "Annulering",
    disputes: "Geschillen",
    help: "Help",
    pricing: "Abonnementen",
  },
  tr: {
    aria: "Yasal belgeler ve yardım",
    about: "Hakkımızda",
    terms: "Şartlar ve koşullar",
    privacy: "Gizlilik",
    sellers: "Satıcı şartları",
    buyers: "Alıcı şartları",
    refund: "İade",
    cancellation: "İptal",
    disputes: "Uyuşmazlık",
    help: "Yardım",
    pricing: "Abonelikler",
  },
  fi: {
    aria: "Oikeudelliset asiakirjat ja ohjeet",
    about: "Tietoa meistä",
    terms: "Käyttöehdot",
    privacy: "Tietosuoja",
    sellers: "Myyjän ehdot",
    buyers: "Ostajan ehdot",
    refund: "Palautukset",
    cancellation: "Peruutus",
    disputes: "Riidanratkaisu",
    help: "Ohjeet",
    pricing: "Tilaukset",
  },
  ar: {
    aria: "المستندات القانونية والمساعدة",
    about: "من نحن",
    terms: "الشروط والأحكام",
    privacy: "الخصوصية",
    sellers: "شروط البائعين",
    buyers: "شروط المشترين",
    refund: "الاسترداد",
    cancellation: "الإلغاء",
    disputes: "حل النزاعات",
    help: "المساعدة",
    pricing: "الاشتراكات",
  },
  ur: {
    aria: "قانونی دستاویزات اور مدد",
    about: "ہمارے بارے میں",
    terms: "شرائط و ضوابط",
    privacy: "رازداری",
    sellers: "فروخت کنندگان کی شرائط",
    buyers: "خریداروں کی شرائط",
    refund: "رقم کی واپسی",
    cancellation: "منسوخی",
    disputes: "تنازعات کا حل",
    help: "مدد",
    pricing: "سبسکرپشنز",
  },
  ru: {
    aria: "Юридические документы и справка",
    about: "О нас",
    terms: "Условия использования",
    privacy: "Конфиденциальность",
    sellers: "Условия для продавцов",
    buyers: "Условия для покупателей",
    refund: "Возврат средств",
    cancellation: "Отмена сделки",
    disputes: "Разрешение споров",
    help: "Справка",
    pricing: "Подписки",
  },
};

const disclaimer = {
  en: {
    title: "Direct connection between sellers and buyers",
    body: "Zareoon is only a platform for direct contact among buyers, sellers, and service providers. Deal terms, quality, price, payment, and delivery are set by the parties; Zareoon bears no responsibility for transactions.",
  },
  es: {
    title: "Conexión directa entre vendedores y compradores",
    body: "Zareoon es solo una plataforma de contacto directo entre compradores, vendedores y prestadores de servicios. Condiciones, calidad, precio, pago y entrega los definen las partes; Zareoon no asume responsabilidad por las operaciones.",
  },
  nl: {
    title: "Directe verbinding tussen verkopers en kopers",
    body: "Zareoon is alleen een platform voor direct contact tussen kopers, verkopers en dienstverleners. Voorwaarden, kwaliteit, prijs, betaling en levering bepalen de partijen; Zareoon is niet verantwoordelijk voor transacties.",
  },
  tr: {
    title: "Satıcılar ve alıcılar arasında doğrudan bağlantı",
    body: "Zareoon yalnızca alıcılar, satıcılar ve hizmet sağlayıcılar arasında doğrudan iletişim platformudur. Koşullar, kalite, fiyat, ödeme ve teslimat taraflarca belirlenir; Zareoon işlemlerden sorumlu değildir.",
  },
  fi: {
    title: "Suora yhteys myyjien ja ostajien välillä",
    body: "Zareoon on vain alusta ostajien, myyjien ja palveluntarjoajien suoraan yhteydenpitoon. Ehdot, laatu, hinta, maksu ja toimitus ovat osapuolten vastuulla; Zareoon ei vastaa kaupoista.",
  },
  ar: {
    title: "تواصل مباشر بين البائعين والمشترين",
    body: "زارعون مجرد منصة للتواصل المباشر بين المشترين والبائعين ومقدّمي الخدمات. شروط الصفقة والجودة والسعر والدفع والتسليم يحددها الأطراف؛ وزراعون لا يتحمل أي مسؤولية عن المعاملات.",
  },
  ur: {
    title: "فروخت کنندگان اور خریداروں کے درمیان براہِ راست رابطہ",
    body: "زارعون صرف خریداروں، فروخت کنندگان اور سروس فراہم کنندگان کے براہِ راست رابطے کا پلیٹ فارم ہے۔ سودے کی شرائط، معیار، قیمت، ادائیگی اور ترسیل فریقین طے کرتے ہیں؛ زارعون لین دین کا ذمہ دار نہیں۔",
  },
  ru: {
    title: "Прямая связь продавцов и покупателей",
    body: "Zareoon — лишь платформа прямого контакта покупателей, продавцов и поставщиков услуг. Условия сделки, качество, цена, оплата и доставка определяются сторонами; Zareoon не несёт ответственности за сделки.",
  },
};

const tradeHub = {
  en: {
    eyebrow: "Trade service provider network",
    title: "Trade & international business services",
    subtitle:
      "Find companies and specialists in inspection, logistics, customs, finance, and more — or join yourself.",
  },
  es: {
    eyebrow: "Red de prestadores de servicios comerciales",
    title: "Servicios comerciales y de comercio internacional",
    subtitle:
      "Encuentre empresas y especialistas en inspección, logística, aduanas, finanzas y más — o únase usted.",
  },
  nl: {
    eyebrow: "Netwerk van handelsdienstverleners",
    title: "Handels- en internationale diensten",
    subtitle:
      "Vind bedrijven en specialisten in inspectie, logistiek, douane, finance en meer — of word zelf lid.",
  },
  tr: {
    eyebrow: "Ticari hizmet sağlayıcı ağı",
    title: "Ticari ve uluslararası ticaret hizmetleri",
    subtitle:
      "Denetim, lojistik, gümrük, finans ve diğer alanlarda şirket ve uzman bulun — veya siz katılın.",
  },
  fi: {
    eyebrow: "Kauppapalvelujen tarjoajien verkosto",
    title: "Kaupalliset ja kansainväliset palvelut",
    subtitle:
      "Löydä yrityksiä ja asiantuntijoita tarkastukseen, logistiikkaan, tulliin, rahoitukseen ja muuhun — tai liity itse.",
  },
  ar: {
    eyebrow: "شبكة مقدّمي الخدمات التجارية",
    title: "الخدمات التجارية والتجارة الدولية",
    subtitle:
      "اعثر على شركات ومتخصصين في التفتيش والنقل والجمارك والتمويل وغيرها — أو انضم بنفسك.",
  },
  ur: {
    eyebrow: "تجارتی سروس فراہم کنندگان کا نیٹ ورک",
    title: "تجارتی اور بین الاقوامی تجارت کی خدمات",
    subtitle:
      "معائنہ، لاجسٹکس، کسٹمز، مالیات وغیرہ میں کمپنیاں اور ماہرین تلاش کریں — یا خود شامل ہوں۔",
  },
  ru: {
    eyebrow: "Сеть поставщиков торговых услуг",
    title: "Торговые и международные услуги",
    subtitle:
      "Найдите компании и специалистов по инспекции, логистике, таможне, финансам и др. — или вступите сами.",
  },
};

// L1 category id → {title, description} per lang (homepage cards)
const cats = {
  en: {
    "inspection-standards": {
      title: "Inspection, testing & certification",
      description: "Cargo inspection, QC, lab testing, certificates, standards, and pre-shipment inspection (PSI).",
    },
    "packaging-prep": {
      title: "Packaging & cargo preparation",
      description: "Export packaging, commercial labeling, palletizing, and packaging standards for international shipping.",
    },
    "import-export": {
      title: "Import & export services",
      description: "Import/export management, sourcing, finding foreign buyers and suppliers, and commercial agency.",
    },
    "intl-logistics": {
      title: "International transport & logistics",
      description: "Sea, air, road, rail and multimodal freight; forwarders, carriers, containers, and warehousing.",
    },
    "customs-clearance": {
      title: "Customs & clearance",
      description: "Clearance, customs brokerage, order registration, import/export permits, and customs consulting.",
    },
    "intl-finance": {
      title: "International trade finance",
      description: "Trade finance, LC, guarantees, FX, and payment solutions for cross-border deals.",
    },
    "insurance-risk": {
      title: "Insurance & risk",
      description: "Cargo insurance, credit insurance, and risk management for trade.",
    },
    "legal-trade": {
      title: "Legal & trade contracts",
      description: "Trade contracts, compliance, dispute support, and legal advisory for international business.",
    },
    "market-development": {
      title: "Market development",
      description: "Market research, entry strategy, partner finding, and export promotion.",
    },
    "specialized-trade": {
      title: "Specialized trade",
      description: "Sector-specific trade services and specialized commercial consulting.",
    },
    "intl-certificates": {
      title: "International certificates",
      description: "Certificates of origin, conformity, and other trade documents.",
    },
    "export-compliance": {
      title: "Export compliance",
      description: "Sanctions screening, export controls, and regulatory compliance.",
    },
    "trade-documents": {
      title: "Trade documents",
      description: "Commercial invoices, packing lists, bills of lading, and document preparation.",
    },
    "supply-chain": {
      title: "Supply chain",
      description: "End-to-end supply chain coordination and optimization for trade.",
    },
    "ecommerce-marketplace": {
      title: "E-commerce & marketplaces",
      description: "Online channel setup, marketplace selling, and digital trade support.",
    },
    "trade-digital": {
      title: "Digital trade tools",
      description: "Digital platforms, automation, and tech tools for international trade.",
    },
    "investment-consulting": {
      title: "Investment consulting",
      description: "Investment advice, joint ventures, and cross-border investment support.",
    },
    "trade-events": {
      title: "Trade events & exhibitions",
      description: "Fairs, B2B meetings, and trade mission organization.",
    },
    "business-immigration": {
      title: "Business immigration",
      description: "Visas, residency, and business immigration consulting for traders.",
    },
    "esg-sustainability": {
      title: "ESG & sustainability",
      description: "Sustainability reporting, green trade, and ESG compliance for business.",
    },
  },
};

// Clone English cats for other LTR langs with light edits where needed; AR/UR/RU get own below
for (const lang of ["es", "nl", "tr", "fi"]) {
  cats[lang] = { ...cats.en };
}
cats.es = Object.fromEntries(
  Object.entries(cats.en).map(([id, v]) => [
    id,
    {
      title: v.title,
      description: v.description,
    },
  ])
);
// Spanish titles (override key ones shown first)
Object.assign(cats.es, {
  "inspection-standards": {
    title: "Inspección, ensayos y certificación",
    description: "Inspección de mercancía, control de calidad, ensayos de laboratorio, certificados, normas e inspección previa al envío (PSI).",
  },
  "packaging-prep": {
    title: "Embalaje y preparación de carga",
    description: "Embalaje de exportación, etiquetado comercial, paletizado y estándares de embalaje para envíos internacionales.",
  },
  "import-export": {
    title: "Servicios de importación y exportación",
    description: "Gestión de import/export, sourcing, búsqueda de compradores y proveedores extranjeros y agencia comercial.",
  },
  "intl-logistics": {
    title: "Transporte y logística internacional",
    description: "Flete marítimo, aéreo, terrestre, ferroviario y multimodal; forwarders, carriers, contenedores y almacén.",
  },
  "customs-clearance": {
    title: "Aduanas y despacho",
    description: "Despacho, corretaje aduanero, registro de pedidos, permisos de import/export y asesoría aduanera.",
  },
});

cats.nl = {
  ...cats.en,
  "inspection-standards": {
    title: "Inspectie, testen & certificering",
    description: "Ladinginspectie, QC, labtests, certificaten, normen en pre-shipment inspection (PSI).",
  },
  "packaging-prep": {
    title: "Verpakking & ladingvoorbereiding",
    description: "Exportverpakking, commerciële labeling, palletiseren en verpakkingsnormen voor internationaal transport.",
  },
  "import-export": {
    title: "Import- & exportdiensten",
    description: "Import/exportbeheer, sourcing, buitenlandse kopers/leveranciers vinden en handelsvertegenwoordiging.",
  },
  "intl-logistics": {
    title: "Internationaal transport & logistiek",
    description: "Zee-, lucht-, weg-, spoor- en multimodaal vervoer; forwarders, carriers, containers en opslag.",
  },
  "customs-clearance": {
    title: "Douane & inklaring",
    description: "Inklaring, douaneagentuur, orderregistratie, import/exportvergunningen en douaneadvies.",
  },
};

cats.tr = {
  ...cats.en,
  "inspection-standards": {
    title: "Muayene, test ve belgelendirme",
    description: "Yük muayenesi, kalite kontrol, laboratuvar testi, belgeler, standartlar ve sevkiyat öncesi muayene (PSI).",
  },
  "packaging-prep": {
    title: "Paketleme ve yük hazırlığı",
    description: "İhracat paketleme, ticari etiketleme, paletleme ve uluslararası taşıma paket standartları.",
  },
  "import-export": {
    title: "İthalat ve ihracat hizmetleri",
    description: "İthalat/ihracat yönetimi, sourcing, yabancı alıcı/tedarikçi bulma ve ticari acentelik.",
  },
  "intl-logistics": {
    title: "Uluslararası taşımacılık ve lojistik",
    description: "Deniz, hava, kara, demiryolu ve kombine taşıma; forwarder, carrier, konteyner ve depolama.",
  },
  "customs-clearance": {
    title: "Gümrük ve ithalat işlemleri",
    description: "Gümrükleme, gümrük müşavirliği, sipariş kaydı, ithalat/ihracat izinleri ve gümrük danışmanlığı.",
  },
};

cats.fi = {
  ...cats.en,
  "inspection-standards": {
    title: "Tarkastus, testaus ja sertifiointi",
    description: "Lastin tarkastus, laadunvalvonta, laboratoriokokeet, todistukset, standardit ja PSI.",
  },
  "packaging-prep": {
    title: "Pakkaus ja lastin valmistelu",
    description: "Vientipakkaus, kaupallinen merkintä, lavaus ja kansainvälisen kuljetuksen pakkausstandardit.",
  },
  "import-export": {
    title: "Tuonti- ja vientipalvelut",
    description: "Tuonnin/viennin hallinta, hankinta, ulkomaisten ostajien/toimittajien etsintä ja kaupallinen edustus.",
  },
  "intl-logistics": {
    title: "Kansainvälinen kuljetus ja logistiikka",
    description: "Meri-, lento-, tie-, raide- ja yhdistetty kuljetus; forwarderit, kuljettajat, kontit ja varastointi.",
  },
  "customs-clearance": {
    title: "Tulli ja selvitys",
    description: "Tulliselvitys, tulliasiamiestoiminta, tilausrekisteröinti, tuonti-/vientiluvat ja tullineuvonta.",
  },
};

cats.ar = {
  "inspection-standards": {
    title: "التفتيش والاختبار وإصدار الشهادات",
    description: "تفتيش البضائع، مراقبة الجودة، الاختبارات المخبرية، شهادات التفتيش، المعايير وتفتيش ما قبل الشحن (PSI).",
  },
  "packaging-prep": {
    title: "التعبئة وتجهيز البضائع",
    description: "تعبئة التصدير، الملصقات والطباعة التجارية، التحزيم بالمصات ومعايير التعبئة للشحن الدولي.",
  },
  "import-export": {
    title: "خدمات الاستيراد والتصدير",
    description: "إدارة الاستيراد والتصدير، التوريد، إيجاد مشترين ومورّدين أجانب والوكالة التجارية.",
  },
  "intl-logistics": {
    title: "النقل واللوجستيات الدولية",
    description: "نقل بحري وجوي وبري وسككي ومتعدد الوسائط؛ وسطاء شحن وناقلون وحاويات وتخزين.",
  },
  "customs-clearance": {
    title: "الجمارك والتخليص",
    description: "التخليص، الوساطة الجمركية، تسجيل الطلبات، تصاريح الاستيراد/التصدير والاستشارات الجمركية.",
  },
  "intl-finance": {
    title: "تمويل التجارة الدولية",
    description: "تمويل التجارة والاعتماد المستندي والضمانات والصرف وحلول الدفع عبر الحدود.",
  },
  "insurance-risk": {
    title: "التأمين والمخاطر",
    description: "تأمين البضائع والتأمين الائتماني وإدارة مخاطر التجارة.",
  },
  "legal-trade": {
    title: "القانون وعقود التجارة",
    description: "عقود التجارة والامتثال ودعم النزاعات والاستشارات القانونية للأعمال الدولية.",
  },
  "market-development": {
    title: "تطوير الأسواق",
    description: "بحوث السوق واستراتيجية الدخول وإيجاد الشركاء وترويج التصدير.",
  },
  "specialized-trade": {
    title: "تجارة متخصصة",
    description: "خدمات تجارية قطاعية واستشارات تجارية متخصصة.",
  },
  "intl-certificates": {
    title: "الشهادات الدولية",
    description: "شهادات المنشأ والمطابقة ووثائق تجارية أخرى.",
  },
  "export-compliance": {
    title: "امتثال التصدير",
    description: "فحص العقوبات وضوابط التصدير والامتثال التنظيمي.",
  },
  "trade-documents": {
    title: "وثائق التجارة",
    description: "الفواتير التجارية وقوائم التعبئة وبوالص الشحن وإعداد المستندات.",
  },
  "supply-chain": {
    title: "سلسلة التوريد",
    description: "تنسيق وتحسين سلسلة التوريد للتجارة من طرف إلى طرف.",
  },
  "ecommerce-marketplace": {
    title: "التجارة الإلكترونية والأسواق",
    description: "إعداد القنوات عبر الإنترنت والبيع في الأسواق ودعم التجارة الرقمية.",
  },
  "trade-digital": {
    title: "أدوات التجارة الرقمية",
    description: "منصات رقمية وأتمتة وأدوات تقنية للتجارة الدولية.",
  },
  "investment-consulting": {
    title: "استشارات الاستثمار",
    description: "نصح استثماري ومشاريع مشتركة ودعم الاستثمار عبر الحدود.",
  },
  "trade-events": {
    title: "فعاليات ومعارض تجارية",
    description: "معارض ولقاءات B2B وتنظيم بعثات تجارية.",
  },
  "business-immigration": {
    title: "الهجرة للأعمال",
    description: "تأشيرات وإقامة واستشارات هجرة الأعمال للتجّار.",
  },
  "esg-sustainability": {
    title: "الاستدامة وESG",
    description: "تقارير الاستدامة والتجارة الخضراء وامتثال ESG للأعمال.",
  },
};

cats.ur = Object.fromEntries(
  Object.entries(cats.ar).map(([id, v]) => [
    id,
    {
      title: cats.en[id]?.title || v.title,
      description: cats.en[id]?.description || v.description,
    },
  ])
);
// Better Urdu for top categories
Object.assign(cats.ur, {
  "inspection-standards": {
    title: "معائنہ، ٹیسٹنگ اور سرٹیفیکیشن",
    description: "مال کی معائنہ، کوالٹی کنٹرول، لیب ٹیسٹ، سرٹیفکیٹ، معیارات اور پری شپمنٹ معائنہ (PSI).",
  },
  "packaging-prep": {
    title: "پیکجنگ اور مال کی تیاری",
    description: "برآمدی پیکجنگ، تجارتی لیبلنگ، پیلیٹنگ اور بین الاقوامی شپنگ کے پیکجنگ معیارات.",
  },
  "import-export": {
    title: "درآمد و برآمد کی خدمات",
    description: "درآمد/برآمد کا انتظام، سورسنگ، غیر ملکی خریدار/سپلائر تلاش اور تجارتی ایجنسی.",
  },
  "intl-logistics": {
    title: "بین الاقوامی نقل و حمل اور لاجسٹکس",
    description: "سمندری، ہوائی، سڑک، ریل اور ملٹی موڈل فریٹ؛ فارورڈر، کیریئر، کنٹینر اور گودام.",
  },
  "customs-clearance": {
    title: "کسٹمز اور کلیئرنس",
    description: "کلیئرنس، کسٹم بروکریج، آرڈر رجسٹریشن، درآمد/برآمد اجازت نامے اور کسٹم مشاورت.",
  },
});

cats.ru = {
  ...cats.en,
  "inspection-standards": {
    title: "Инспекция, испытания и сертификация",
    description: "Инспекция груза, контроль качества, лабораторные испытания, сертификаты, стандарты и PSI.",
  },
  "packaging-prep": {
    title: "Упаковка и подготовка груза",
    description: "Экспортная упаковка, коммерческая маркировка, паллетирование и стандарты упаковки.",
  },
  "import-export": {
    title: "Услуги импорта и экспорта",
    description: "Управление импортом/экспортом, сорсинг, поиск зарубежных покупателей и поставщиков, агентство.",
  },
  "intl-logistics": {
    title: "Международные перевозки и логистика",
    description: "Морские, авиа, авто, ж/д и мультимодальные перевозки; экспедиторы, перевозчики, контейнеры и склады.",
  },
  "customs-clearance": {
    title: "Таможня и оформление",
    description: "Таможенное оформление, брокерские услуги, регистрация заказов, разрешения и консультации.",
  },
};

const sharedPatches = {
  en: {
    vip: { inspectionStandardsCompany: "Arya Foulad Gharn Engineering Inspection" },
    currencyTicker: {
      title: "Exchange rates",
      updatedAt: "Updated",
      buy: "Buy",
      sell: "Sell",
      mid: "Mid",
      loading: "Loading rates…",
      error: "Could not load rates",
      retry: "Retry",
      usd: "USD",
      eur: "EUR",
      aed: "AED",
      try: "TRY",
      cny: "CNY",
      gbp: "GBP",
    },
  },
  es: {
    vip: { inspectionStandardsCompany: "Inspección de ingeniería Arya Foulad Gharn" },
    currencyTicker: {
      title: "Tipos de cambio",
      updatedAt: "Actualizado",
      buy: "Compra",
      sell: "Venta",
      mid: "Medio",
      loading: "Cargando tipos…",
      error: "No se pudieron cargar los tipos",
      retry: "Reintentar",
    },
  },
  nl: {
    vip: { inspectionStandardsCompany: "Arya Foulad Gharn engineeringinspectie" },
    currencyTicker: {
      title: "Wisselkoersen",
      updatedAt: "Bijgewerkt",
      buy: "Koop",
      sell: "Verkoop",
      mid: "Midden",
      loading: "Koersen laden…",
      error: "Koersen laden mislukt",
      retry: "Opnieuw",
    },
  },
  tr: {
    vip: { inspectionStandardsCompany: "Arya Foulad Gharn mühendislik muayenesi" },
    currencyTicker: {
      title: "Döviz kurları",
      updatedAt: "Güncellendi",
      buy: "Alış",
      sell: "Satış",
      mid: "Orta",
      loading: "Kurlar yükleniyor…",
      error: "Kurlar yüklenemedi",
      retry: "Yeniden dene",
    },
  },
  fi: {
    vip: { inspectionStandardsCompany: "Arya Foulad Gharn -tekninen tarkastus" },
    currencyTicker: {
      title: "Valuuttakurssit",
      updatedAt: "Päivitetty",
      buy: "Osto",
      sell: "Myynti",
      mid: "Keski",
      loading: "Ladataan kursseja…",
      error: "Kursseja ei voitu ladata",
      retry: "Yritä uudelleen",
    },
  },
  ar: {
    vip: { inspectionStandardsCompany: "التفتيش الهندسي آريا فولاد قرن" },
    currencyTicker: {
      title: "أسعار الصرف",
      updatedAt: "محدّث",
      buy: "شراء",
      sell: "بيع",
      mid: "وسط",
      loading: "جاري تحميل الأسعار…",
      error: "تعذّر تحميل الأسعار",
      retry: "إعادة المحاولة",
    },
  },
  ur: {
    vip: { inspectionStandardsCompany: "آریا فولاد قرن انجینئرنگ معائنہ" },
    currencyTicker: {
      title: "زر مبادلہ کی شرحیں",
      updatedAt: "اپڈیٹ",
      buy: "خرید",
      sell: "فروخت",
      mid: "وسط",
      loading: "شرحیں لوڈ ہو رہی ہیں…",
      error: "شرحیں لوڈ نہ ہو سکیں",
      retry: "دوبارہ کوشش",
    },
  },
  ru: {
    vip: { inspectionStandardsCompany: "Инженерная инспекция Арья Фулад Гарн" },
    currencyTicker: {
      title: "Курсы валют",
      updatedAt: "Обновлено",
      buy: "Покупка",
      sell: "Продажа",
      mid: "Средний",
      loading: "Загрузка курсов…",
      error: "Не удалось загрузить курсы",
      retry: "Повторить",
    },
  },
};

const supplierPatch = {
  en: { tradeProvider: { memberCount: "{count} members", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  es: { tradeProvider: { memberCount: "{count} miembros", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  nl: { tradeProvider: { memberCount: "{count} leden", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  tr: { tradeProvider: { memberCount: "{count} üye", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  fi: { tradeProvider: { memberCount: "{count} jäsentä", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  ar: { tradeProvider: { memberCount: "{count} عضو", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  ur: { tradeProvider: { memberCount: "{count} اراکین", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
  ru: { tradeProvider: { memberCount: "{count} участников", memberCountEn: "{count} members", memberCountRu: "{count} участников" } },
};

const langs = ["en", "es", "nl", "tr", "fi", "ar", "ur", "ru"];

for (const lang of langs) {
  patchFile(path.join(lang, "legacy.json"), legacyByLang[lang]);

  patchFile(path.join(lang, "legal.json"), {
    nav: legalNav[lang],
    homepageDisclaimer: disclaimer[lang],
  });

  // tradeServices: hub + L1 title/description by id
  const tsPath = path.join(root, lang, "tradeServices.json");
  const ts = JSON.parse(fs.readFileSync(tsPath, "utf8"));
  const hub = tradeHub[lang];
  const catMap = cats[lang] || cats.en;
  const merged = {
    ...ts,
    ...hub,
    categories: (ts.categories || []).map((c) => {
      const tr = catMap[c.id];
      if (!tr) return c;
      return { ...c, title: tr.title || c.title, description: tr.description || c.description };
    }),
  };
  writeJson(tsPath, merged);

  patchFile(path.join(lang, "shared.json"), sharedPatches[lang]);
  patchFile(path.join(lang, "supplier.json"), supplierPatch[lang]);
}

console.log("Homepage i18n fill done.");
