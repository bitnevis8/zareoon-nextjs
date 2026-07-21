/**
 * Rebuild tradeServices from fa structure + L1 translations,
 * and fill missing escrow/LC homepage strings.
 * Usage: node scripts/fix-homepage-i18n-gaps.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "messages");
const require = createRequire(import.meta.url);

// Reuse maps from fill script by evaluating cats via dynamic import of the fill file is heavy;
// duplicate only what we need by reading the fill script's exported logic — instead inline import:
const fillPath = path.join(__dirname, "fill-homepage-i18n.mjs");
// Parse cats/tradeHub by running a small extract — simpler: duplicate rebuild using fill's JSON after import.
// We'll read fill file and eval maps by importing a shared snippet.
// Practical approach: copy the rebuild loop with require of generated data.

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("wrote", path.relative(root, filePath));
}

function patchLegacy(lang, patch) {
  const filePath = path.join(root, lang, "legacy.json");
  const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined && v !== null && v !== "") current[k] = v;
  }
  writeJson(filePath, current);
}

const faTs = JSON.parse(fs.readFileSync(path.join(root, "fa", "tradeServices.json"), "utf8"));

// Load cats + tradeHub by executing the fill script's const blocks via a temp extract
const fillSrc = fs.readFileSync(path.join(__dirname, "fill-homepage-i18n.mjs"), "utf8");
const startHub = fillSrc.indexOf("const tradeHub = {");
const startCats = fillSrc.indexOf("// L1 category id");
const endCats = fillSrc.indexOf("const legalNav");
// Actually cats ends before sharedPatches. Find sharedPatches.
const startShared = fillSrc.indexOf("const sharedPatches");
const hubAndCatsSrc = fillSrc.slice(startHub, startShared);
const fn = new Function(`${hubAndCatsSrc}\nreturn { tradeHub, cats };`);
const { tradeHub, cats } = fn();

const langs = ["en", "es", "nl", "tr", "fi", "ar", "ur", "ru"];

for (const lang of langs) {
  const hub = tradeHub[lang] || tradeHub.en;
  const catMap = cats[lang] || cats.en;
  const rebuilt = {
    ...faTs,
    ...hub,
    providerHint: hub.providerHint || faTs.providerHint,
    providerRegisterNote: hub.providerRegisterNote || "",
    categories: faTs.categories.map((c) => {
      const tr = catMap[c.id] || cats.en[c.id];
      return {
        ...c,
        title: tr?.title || c.title,
        description: tr?.description || c.description,
        // Keep children titles in English for non-fa when we only have L1 maps;
        // leave structure/ids; for homepage only L1 is shown.
        children: (c.children || []).map((ch) => ({ ...ch })),
      };
    }),
  };
  // For non-English, children stay Persian from fa — replace with English children titles for readability
  if (lang !== "fa") {
    const enMap = cats.en;
    // children without translation: use fa child title only if lang is ar/ur (RTL) keep fa; else use English L1 context
    // Better: leave Persian children until user translates; homepage doesn't show them.
  }
  writeJson(path.join(root, lang, "tradeServices.json"), rebuilt);
}

const escrowEn = {
  openLcDetails: "View details",
  closeGuide: "Close",
  lcItem1: "LC opening",
  lcItem2: "Process tracking",
  lcItem3: "Bank and counterparty coordination",
  lcItem4: "Import and export advisory",
  lcFooter: "Final agreement and execution always remain with the parties.",
  lcRequestCta: "Request LC",
  escrowTagline: "Optional tools for safer coordination",
  escrowItem1: "Deposit calculation and management per deal terms",
  escrowItem2: "Secure holding of funds until agreed milestones are confirmed",
  escrowItem3: "Milestone release after obligations are completed",
  escrowItem4: "Parties can record a dispute; final resolution remains with the users",
  escrowExampleTitle: "Practical example",
  escrowExampleText:
    "Example: the buyer places the agreed amount in escrow; funds are held until deal milestones are confirmed and released per the parties’ agreement.",
  escrowFooter: "Using these tools does not make Zareoon a party to the deal.",
  escrowCta: "Start trade guarantee",
  escrowLcCta: "Request LC",
};

const escrowByLang = {
  en: escrowEn,
  es: {
    openLcDetails: "Ver detalles",
    closeGuide: "Cerrar",
    lcItem1: "Apertura de LC",
    lcItem2: "Seguimiento del proceso",
    lcItem3: "Coordinación bancaria y entre partes",
    lcItem4: "Asesoría de importación y exportación",
    lcFooter: "El acuerdo y la ejecución finales siempre corresponden a las partes.",
    lcRequestCta: "Solicitar LC",
    escrowTagline: "Herramientas opcionales para una coordinación más segura",
    escrowItem1: "Cálculo y gestión del depósito según los términos del acuerdo",
    escrowItem2: "Retención segura de fondos hasta confirmar hitos acordados",
    escrowItem3: "Liberación por etapas tras cumplir las obligaciones",
    escrowItem4: "Las partes pueden registrar un desacuerdo; la resolución final queda en sus manos",
    escrowExampleTitle: "Ejemplo práctico",
    escrowExampleText:
      "Ejemplo: el comprador deposita el importe acordado en escrow; los fondos se retienen hasta confirmar hitos y se liberan según el acuerdo.",
    escrowFooter: "Usar estas herramientas no convierte a Zareoon en parte del acuerdo.",
    escrowCta: "Iniciar garantía comercial",
    escrowLcCta: "Solicitar LC",
  },
  nl: {
    openLcDetails: "Details bekijken",
    closeGuide: "Sluiten",
    lcItem1: "LC openen",
    lcItem2: "Procesopvolging",
    lcItem3: "Bank- en tegenpartijcoördinatie",
    lcItem4: "Import- en exportadvies",
    lcFooter: "Eindafspraak en uitvoering blijven altijd bij de partijen.",
    lcRequestCta: "LC aanvragen",
    escrowTagline: "Optionele tools voor veiligere coördinatie",
    escrowItem1: "Borgberekening en -beheer volgens de dealvoorwaarden",
    escrowItem2: "Veilige bewaring van middelen tot afgesproken mijlpalen zijn bevestigd",
    escrowItem3: "Gefaseerde vrijgave na nakoming van verplichtingen",
    escrowItem4: "Partijen kunnen een geschil melden; eindbesluit blijft bij de gebruikers",
    escrowExampleTitle: "Praktijkvoorbeeld",
    escrowExampleText:
      "Voorbeeld: de koper zet het afgesproken bedrag in escrow; middelen blijven geblokkeerd tot mijlpalen zijn bevestigd en vrijgegeven volgens afspraak.",
    escrowFooter: "Deze tools maken Zareoon geen partij bij de deal.",
    escrowCta: "Handelsgarantie starten",
    escrowLcCta: "LC aanvragen",
  },
  tr: {
    openLcDetails: "Detayları gör",
    closeGuide: "Kapat",
    lcItem1: "LC açılışı",
    lcItem2: "Süreç takibi",
    lcItem3: "Banka ve karşı taraf koordinasyonu",
    lcItem4: "İthalat ve ihracat danışmanlığı",
    lcFooter: "Nihai anlaşma ve uygulama her zaman taraflara aittir.",
    lcRequestCta: "LC talebi",
    escrowTagline: "Daha güvenli koordinasyon için isteğe bağlı araçlar",
    escrowItem1: "Anlaşma şartlarına göre teminat hesabı ve yönetimi",
    escrowItem2: "Kararlaştırılan aşamalar onaylanana kadar fonların güvenli tutulması",
    escrowItem3: "Yükümlülükler tamamlandıktan sonra aşamalı serbest bırakma",
    escrowItem4: "Taraflar uyuşmazlık kaydı açabilir; nihai çözüm kullanıcılara aittir",
    escrowExampleTitle: "Pratik örnek",
    escrowExampleText:
      "Örnek: alıcı kararlaştırılan tutarı escrow’a yatırır; fonlar aşamalar onaylanana kadar tutulur ve anlaşmaya göre serbest bırakılır.",
    escrowFooter: "Bu araçları kullanmak Zareoon’u işlemin tarafı yapmaz.",
    escrowCta: "Ticaret güvencesini başlat",
    escrowLcCta: "LC talebi",
  },
  fi: {
    openLcDetails: "Näytä tiedot",
    closeGuide: "Sulje",
    lcItem1: "LC:n avaaminen",
    lcItem2: "Prosessin seuranta",
    lcItem3: "Pankki- ja vastapuolikoordinointi",
    lcItem4: "Tuonti- ja vientineuvonta",
    lcFooter: "Lopullinen sopimus ja toteutus kuuluvat aina osapuolille.",
    lcRequestCta: "Pyydä LC",
    escrowTagline: "Valinnaiset työkalut turvallisempaan koordinointiin",
    escrowItem1: "Vakuuden laskenta ja hallinta kaupan ehtojen mukaan",
    escrowItem2: "Varojen turvallinen säilytys sovittuihin virstanpylväisiin asti",
    escrowItem3: "Vaiheitainen vapautus velvoitteiden jälkeen",
    escrowItem4: "Osapuolet voivat kirjata erimielisyyden; lopullinen ratkaisu on käyttäjillä",
    escrowExampleTitle: "Käytännön esimerkki",
    escrowExampleText:
      "Esimerkki: ostaja tallettaa sovitun summan escrow’iin; varat pidetään kunnes virstanpylväät on vahvistettu ja vapautetaan sopimuksen mukaan.",
    escrowFooter: "Näiden työkalujen käyttö ei tee Zareoonista kaupan osapuolta.",
    escrowCta: "Aloita kauppavakuus",
    escrowLcCta: "Pyydä LC",
  },
  ar: {
    openLcDetails: "عرض التفاصيل",
    closeGuide: "إغلاق",
    lcItem1: "فتح الاعتماد المستندي",
    lcItem2: "متابعة مراحل التنفيذ",
    lcItem3: "تنسيق البنك وأطراف الصفقة",
    lcItem4: "استشارات الاستيراد والتصدير",
    lcFooter: "المسؤولية النهائية عن الاتفاق والتنفيذ دائماً على الأطراف.",
    lcRequestCta: "طلب اعتماد مستندي",
    escrowTagline: "أدوات اختيارية لتنسيق أكثر أماناً",
    escrowItem1: "حساب وإدارة مبلغ الضمان وفق شروط الصفقة",
    escrowItem2: "حفظ الأموال بأمان حتى تأكيد المراحل المتفق عليها",
    escrowItem3: "تحرير مرحلي بعد استيفاء الالتزامات",
    escrowItem4: "يمكن للأطراف تسجيل خلاف؛ الحل النهائي يبقى بأيدي المستخدمين",
    escrowExampleTitle: "مثال عملي",
    escrowExampleText:
      "مثال: يودع المشتري المبلغ المتفق عليه في الحساب الأمين؛ تُحتجز الأموال حتى تأكيد المراحل وتُحرَّر وفق الاتفاق.",
    escrowFooter: "استخدام هذه الأدوات لا يجعل زارعون طرفاً في الصفقة.",
    escrowCta: "بدء ضمان الصفقة",
    escrowLcCta: "طلب اعتماد مستندي",
  },
  ur: {
    openLcDetails: "تفصیلات دیکھیں",
    closeGuide: "بند کریں",
    lcItem1: "LC کھولنا",
    lcItem2: "عمل کی پیروی",
    lcItem3: "بینک اور فریقین کی ہم آہنگی",
    lcItem4: "درآمد و برآمد مشاورت",
    lcFooter: "حتمی معاہدہ اور عملدرآمد ہمیشہ فریقین پر ہے۔",
    lcRequestCta: "LC کی درخواست",
    escrowTagline: "محفوظ ہم آہنگی کے لیے اختیاری ٹولز",
    escrowItem1: "سودے کی شرائط کے مطابق ضمانت کی رقم کا حساب اور انتظام",
    escrowItem2: "متفقہ مراحل کی تصدیق تک فنڈز محفوظ رکھنا",
    escrowItem3: "ذمہ داریاں پوری ہونے کے بعد مرحلہ وار رہائی",
    escrowItem4: "فریقین تنازعہ درج کر سکتے ہیں؛ حتمی حل صارفین پر ہے",
    escrowExampleTitle: "عملی مثال",
    escrowExampleText:
      "مثال: خریدار متفقہ رقم escrow میں رکھتا ہے؛ فنڈز مراحل کی تصدیق تک رکھی جاتی ہیں اور معاہدے کے مطابق جاری ہوتی ہیں۔",
    escrowFooter: "ان ٹولز کے استعمال سے زارعون سودے کا فریق نہیں بنتا۔",
    escrowCta: "تجارتی ضمانت شروع کریں",
    escrowLcCta: "LC کی درخواست",
  },
  ru: {
    ...escrowEn,
    openLcDetails: "Подробнее",
    closeGuide: "Закрыть",
    lcItem1: "Открытие LC",
    lcItem2: "Сопровождение процесса",
    lcItem3: "Координация банка и сторон",
    lcItem4: "Консультации по импорту и экспорту",
    lcFooter: "Окончательное соглашение и исполнение всегда остаются за сторонами.",
    lcRequestCta: "Запросить LC",
    escrowTagline: "Опциональные инструменты для более безопасной координации",
    escrowItem1: "Расчёт и управление депозитом по условиям сделки",
    escrowItem2: "Безопасное хранение средств до подтверждения согласованных этапов",
    escrowItem3: "Поэтапное освобождение после выполнения обязательств",
    escrowItem4: "Стороны могут зафиксировать спор; окончательное решение остаётся за пользователями",
    escrowExampleTitle: "Практический пример",
    escrowExampleText:
      "Пример: покупатель размещает согласованную сумму на эскроу; средства удерживаются до подтверждения этапов и освобождаются по договорённости.",
    escrowFooter: "Использование этих инструментов не делает Zareoon стороной сделки.",
    escrowCta: "Начать гарантию сделки",
    escrowLcCta: "Запросить LC",
  },
};

for (const lang of langs) {
  patchLegacy(lang, escrowByLang[lang]);
}

console.log("Homepage i18n gaps fixed.");
