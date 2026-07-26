/**
 * فهرست کشورها برای ثبت‌نام موبایل — dial code + پرچم
 * فعال‌سازی واقعی از پنل مدیریت (allowedPhoneCountries) است.
 */
export const PHONE_COUNTRIES = [
  { code: "IR", dial: "98", flag: "🇮🇷", nameFa: "ایران", nameEn: "Iran", nationalHint: "9xxxxxxxxx", nationalMax: 10, example: "9123456789" },
  { code: "AF", dial: "93", flag: "🇦🇫", nameFa: "افغانستان", nameEn: "Afghanistan", nationalMax: 9 },
  { code: "AE", dial: "971", flag: "🇦🇪", nameFa: "امارات", nameEn: "United Arab Emirates", nationalMax: 9 },
  { code: "TR", dial: "90", flag: "🇹🇷", nameFa: "ترکیه", nameEn: "Turkey", nationalMax: 10 },
  { code: "IQ", dial: "964", flag: "🇮🇶", nameFa: "عراق", nameEn: "Iraq", nationalMax: 10 },
  { code: "SA", dial: "966", flag: "🇸🇦", nameFa: "عربستان", nameEn: "Saudi Arabia", nationalMax: 9 },
  { code: "QA", dial: "974", flag: "🇶🇦", nameFa: "قطر", nameEn: "Qatar", nationalMax: 8 },
  { code: "KW", dial: "965", flag: "🇰🇼", nameFa: "کویت", nameEn: "Kuwait", nationalMax: 8 },
  { code: "OM", dial: "968", flag: "🇴🇲", nameFa: "عمان", nameEn: "Oman", nationalMax: 8 },
  { code: "BH", dial: "973", flag: "🇧🇭", nameFa: "بحرین", nameEn: "Bahrain", nationalMax: 8 },
  { code: "PK", dial: "92", flag: "🇵🇰", nameFa: "پاکستان", nameEn: "Pakistan", nationalMax: 10 },
  { code: "IN", dial: "91", flag: "🇮🇳", nameFa: "هند", nameEn: "India", nationalMax: 10 },
  { code: "CN", dial: "86", flag: "🇨🇳", nameFa: "چین", nameEn: "China", nationalMax: 11 },
  { code: "RU", dial: "7", flag: "🇷🇺", nameFa: "روسیه", nameEn: "Russia", nationalMax: 10 },
  { code: "DE", dial: "49", flag: "🇩🇪", nameFa: "آلمان", nameEn: "Germany", nationalMax: 11 },
  { code: "FR", dial: "33", flag: "🇫🇷", nameFa: "فرانسه", nameEn: "France", nationalMax: 9 },
  { code: "GB", dial: "44", flag: "🇬🇧", nameFa: "انگلستان", nameEn: "United Kingdom", nationalMax: 10 },
  { code: "NL", dial: "31", flag: "🇳🇱", nameFa: "هلند", nameEn: "Netherlands", nationalMax: 9 },
  { code: "BE", dial: "32", flag: "🇧🇪", nameFa: "بلژیک", nameEn: "Belgium", nationalMax: 9 },
  { code: "ES", dial: "34", flag: "🇪🇸", nameFa: "اسپانیا", nameEn: "Spain", nationalMax: 9 },
  { code: "IT", dial: "39", flag: "🇮🇹", nameFa: "ایتالیا", nameEn: "Italy", nationalMax: 10 },
  { code: "SE", dial: "46", flag: "🇸🇪", nameFa: "سوئد", nameEn: "Sweden", nationalMax: 9 },
  { code: "NO", dial: "47", flag: "🇳🇴", nameFa: "نروژ", nameEn: "Norway", nationalMax: 8 },
  { code: "FI", dial: "358", flag: "🇫🇮", nameFa: "فنلاند", nameEn: "Finland", nationalMax: 10 },
  { code: "DK", dial: "45", flag: "🇩🇰", nameFa: "دانمارک", nameEn: "Denmark", nationalMax: 8 },
  { code: "CH", dial: "41", flag: "🇨🇭", nameFa: "سوئیس", nameEn: "Switzerland", nationalMax: 9 },
  { code: "AT", dial: "43", flag: "🇦🇹", nameFa: "اتریش", nameEn: "Austria", nationalMax: 10 },
  { code: "PL", dial: "48", flag: "🇵🇱", nameFa: "لهستان", nameEn: "Poland", nationalMax: 9 },
  { code: "US", dial: "1", flag: "🇺🇸", nameFa: "آمریکا", nameEn: "United States", nationalMax: 10 },
  { code: "CA", dial: "1", flag: "🇨🇦", nameFa: "کانادا", nameEn: "Canada", nationalMax: 10 },
  { code: "AU", dial: "61", flag: "🇦🇺", nameFa: "استرالیا", nameEn: "Australia", nationalMax: 9 },
  { code: "NZ", dial: "64", flag: "🇳🇿", nameFa: "نیوزیلند", nameEn: "New Zealand", nationalMax: 9 },
  { code: "JP", dial: "81", flag: "🇯🇵", nameFa: "ژاپن", nameEn: "Japan", nationalMax: 10 },
  { code: "KR", dial: "82", flag: "🇰🇷", nameFa: "کره جنوبی", nameEn: "South Korea", nationalMax: 10 },
  { code: "MY", dial: "60", flag: "🇲🇾", nameFa: "مالزی", nameEn: "Malaysia", nationalMax: 10 },
  { code: "SG", dial: "65", flag: "🇸🇬", nameFa: "سنگاپور", nameEn: "Singapore", nationalMax: 8 },
  { code: "ID", dial: "62", flag: "🇮🇩", nameFa: "اندونزی", nameEn: "Indonesia", nationalMax: 11 },
  { code: "TH", dial: "66", flag: "🇹🇭", nameFa: "تایلند", nameEn: "Thailand", nationalMax: 9 },
  { code: "VN", dial: "84", flag: "🇻🇳", nameFa: "ویتنام", nameEn: "Vietnam", nationalMax: 9 },
  { code: "EG", dial: "20", flag: "🇪🇬", nameFa: "مصر", nameEn: "Egypt", nationalMax: 10 },
  { code: "ZA", dial: "27", flag: "🇿🇦", nameFa: "آفریقای جنوبی", nameEn: "South Africa", nationalMax: 9 },
  { code: "BR", dial: "55", flag: "🇧🇷", nameFa: "برزیل", nameEn: "Brazil", nationalMax: 11 },
  { code: "MX", dial: "52", flag: "🇲🇽", nameFa: "مکزیک", nameEn: "Mexico", nationalMax: 10 },
  { code: "AR", dial: "54", flag: "🇦🇷", nameFa: "آرژانتین", nameEn: "Argentina", nationalMax: 10 },
  { code: "AM", dial: "374", flag: "🇦🇲", nameFa: "ارمنستان", nameEn: "Armenia", nationalMax: 8 },
  { code: "AZ", dial: "994", flag: "🇦🇿", nameFa: "آذربایجان", nameEn: "Azerbaijan", nationalMax: 9 },
  { code: "GE", dial: "995", flag: "🇬🇪", nameFa: "گرجستان", nameEn: "Georgia", nationalMax: 9 },
  { code: "KZ", dial: "7", flag: "🇰🇿", nameFa: "قزاقستان", nameEn: "Kazakhstan", nationalMax: 10 },
  { code: "UZ", dial: "998", flag: "🇺🇿", nameFa: "ازبکستان", nameEn: "Uzbekistan", nationalMax: 9 },
  { code: "TJ", dial: "992", flag: "🇹🇯", nameFa: "تاجیکستان", nameEn: "Tajikistan", nationalMax: 9 },
  { code: "TM", dial: "993", flag: "🇹🇲", nameFa: "ترکمنستان", nameEn: "Turkmenistan", nationalMax: 8 },
  { code: "KG", dial: "996", flag: "🇰🇬", nameFa: "قرقیزستان", nameEn: "Kyrgyzstan", nationalMax: 9 },
];

export function getPhoneCountry(code) {
  return PHONE_COUNTRIES.find((c) => c.code === code) || PHONE_COUNTRIES[0];
}

/** نرمال‌سازی شماره برای ذخیره/API — ایران: 09… بقیه: +dial… */
export function normalizePhoneNumber(countryCode, nationalDigits) {
  const digits = String(nationalDigits || "").replace(/\D/g, "");
  const country = getPhoneCountry(countryCode);
  if (!country) return null;
  if (country.code === "IR") {
    let n = digits;
    if (n.startsWith("98")) n = n.slice(2);
    if (n.startsWith("0")) n = n.slice(1);
    if (n.length === 10 && n.startsWith("9")) return `0${n}`;
    if (n.length === 11 && n.startsWith("09")) return n;
    return null;
  }
  const max = country.nationalMax || 12;
  if (digits.length < 6 || digits.length > max + 2) return null;
  const national = digits.startsWith(country.dial) ? digits.slice(country.dial.length) : digits;
  if (!national) return null;
  return `+${country.dial}${national}`;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export const DEFAULT_AUTH_SIGNUP_CONFIG = {
  emailEnabled: true,
  phoneEnabled: true,
  allowedPhoneCountries: ["IR"],
  defaultPhoneCountry: "IR",
};
