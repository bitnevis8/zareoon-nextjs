# ترجمه‌های زارعون (next-intl + JSON)

## زبان‌های پشتیبانی‌شده

| کد | زبان |
|----|------|
| `fa` | فارسی (پیش‌فرض — منبع اصلی) |
| `en` | English |
| `ar` | العربية |
| `ru` | Русский |
| `ur` | اردو |
| `fi` | Suomi |

افزودن زبان جدید: کد را به `app/config/siteLanguages.js` اضافه کنید، سپس `npm run i18n:scaffold`.

## ساختار پوشه

```
messages/
  fa/                    ← فقط اینجا بنویسید (منبع)
    legacy.json          ← کلیدهای flat قدیمی (siteName, cart, …)
    common.json          ← save, cancel, loading
    site.json            ← intro صفحه اصلی
    nav.json             ← منوی sidebar
    dashboard.json       ← breadcrumb داشبورد
    escrow.json          ← t('escrow.pageTitle') — namespace escrow
    tradeServices.json   ← کatalog خدمات بازرگانی
  en/ ar/ ru/ ur/ fi/    ← ترجمه — همان نام فایل‌ها
  loadMessages.js        ← merge: fa پایه + locale روی آن
```

## قوانین توسعه

1. **هیچ متن UI در JSX/JS ننویسید** — فقط کلید JSON.
2. **ماژول جدید** → `messages/fa/myModule.json` + نام در `MESSAGE_NAMESPACES` (`loadMessages.js`).
3. **کامپوننت جدید** → `const t = useTranslations('myModule')`.
4. **کد قدیمی** → `useLanguage().t('flatKey')` از `legacy.json` هنوز کار می‌کند.
5. **پیش‌فرض فارسی** — کلید خالی در `en/`/`ru/`/… → fallback خودکار به `fa`.
6. **URL عوض نمی‌شود** — locale با کوکی `NEXT_LOCALE`.

## workflow ترجمه (پایان پروژه)

1. پوشه **`messages/fa/`** را zip کنید.
2. به AI بدهید: «ساختار JSON را حفظ کن؛ فقط **values** را ترجمه کن.»
3. خروجی را در **`messages/en/`**, **`messages/ar/`**, … بگذارید.
4. Refresh — **بدون تغییر کد**.

### Prompt نمونه

```
Translate all string VALUES in messages/fa/*.json from Persian to English.
Keep keys and nesting identical. Keep placeholders like {name} unchanged.
Return the same file names under messages/en/.
```

## اسکریپت‌ها

| دستور | کار |
|--------|-----|
| `npm run i18n:scaffold` | ساخت/به‌روزرسانی قالب خالی برای همه localeها از روی `fa/` |
| `npm run i18n:extract-trade` | استخراج `tradeServices.json` از catalog (یک‌بار) |
| `npm run i18n:sync` | ساخت `legacy.json` از `translations.data.js` (legacy) |
| `npm run i18n:audit` | فهرست فایل‌هایی که هنوز فارسی hardcode دارند |

## چه چیز JSON نیست؟

| محتوا | محل |
|--------|-----|
| UI | `messages/{locale}/*.json` |
| داده seed محصولات API | `api/.../seederData*.json` |
| نمونه provider دمو | `tradeServicesCatalog.js` (sampleTradeServiceProviders) |

## migration باقی‌مانده

`npm run i18n:audit` — فایل‌هایی که هنوز باید به JSON منتقل شوند (legacy.json پوشش بخش زیادی را دارد).
