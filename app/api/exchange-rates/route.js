import { NextResponse } from "next/server";

const TGJU_URLS = [
  "https://call2.tgju.org/ajax.json",
  "https://call5.tgju.org/ajax.json",
];

const CURRENCY_KEYS = [
  { id: "price_dollar_rl", label: "دلار آمریکا", code: "USD" },
  { id: "price_eur", label: "یورو", code: "EUR" },
  { id: "price_aed", label: "درهم امارات", code: "AED" },
  { id: "price_rub", label: "روبل روسیه", code: "RUB" },
  { id: "price_gbp", label: "پوند انگلیس", code: "GBP" },
  { id: "price_try", label: "لیر ترکیه", code: "TRY" },
  { id: "price_cny", label: "یوان چین", code: "CNY" },
  { id: "price_sar", label: "ریال عربستان", code: "SAR" },
];

function parsePrice(raw) {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  let lastError = null;

  for (const url of TGJU_URLS) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Zareoon/1.0",
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      });

      if (!res.ok) throw new Error(`TGJU ${res.status}`);

      const json = await res.json();
      const current = json?.current || {};

      const rates = CURRENCY_KEYS.map((c) => {
        const row = current[c.id];
        const price = parsePrice(row?.p);
        const change = parsePrice(row?.d) ?? 0;
        const changePercent = Number(row?.dp) || 0;
        const direction = row?.dt === "high" ? "up" : row?.dt === "low" ? "down" : "flat";

        return {
          ...c,
          price,
          change,
          changePercent,
          direction,
          updatedAt: row?.ts || null,
        };
      }).filter((r) => r.price != null);

      return NextResponse.json({
        success: true,
        source: "tgju.org",
        data: rates,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error("exchange-rates:", lastError?.message);
    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت نرخ ارز",
        data: [],
      },
      { status: 200 }
    );
}
