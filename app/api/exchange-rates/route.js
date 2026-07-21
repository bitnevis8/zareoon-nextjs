import { NextResponse } from "next/server";
import exchangeMeta from "../../../messages/fa/exchange.json";
import { apiError } from "@/app/utils/apiErrors";

const TGJU_URLS = ["https://call2.tgju.org/ajax.json", "https://call5.tgju.org/ajax.json"];

/** Labels are resolved client-side from shared.currencies per locale. */
const CURRENCY_KEYS = (exchangeMeta.apiKeys || []).map((c) => ({
  id: c.id,
  code: c.code,
  kind: c.kind,
  labelKey: c.labelKey || c.code,
}));

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
        headers: { "User-Agent": "Zareoon/1.0", Accept: "application/json" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
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

        return { ...c, price, change, changePercent, direction, updatedAt: row?.ts || null };
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
    { success: false, message: apiError("fetchExchangeRates"), data: [] },
    { status: 200 }
  );
}
