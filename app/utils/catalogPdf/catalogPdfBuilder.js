import { API_ENDPOINTS } from "@/app/config/api";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { buildMapNavigationLinks } from "@/app/utils/mapNavigationLinks";
import { sortMediaItems } from "@/app/components/catalog/CatalogMediaLightbox";
import { getLotSupplier, getLotSupplierDisplay, getLotSupplierDisplayName, getLotSupplierPhone } from "@/app/utils/catalogLotSupplier";
import { getLocalizedText, getNumberLocale, localizeUnit } from "@/app/utils/localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import { isRtlLanguage } from "@/app/config/siteLanguages";

function absOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
}

export function toAbsoluteMediaUrl(url) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return null;
  if (resolved.startsWith("http")) return resolved;
  return `${absOrigin()}${resolved.startsWith("/") ? resolved : `/${resolved}`}`;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  const json = await res.json();
  return json?.data ?? json;
}

async function fetchLotUploadedImages(lotId) {
  try {
    const res = await fetch(
      `${API_ENDPOINTS.fileUpload.getFilesByModule("inventory")}?entityId=${encodeURIComponent(lotId)}`,
      { cache: "no-store", credentials: "include" }
    );
    const j = await res.json();
    const raw = j?.success && Array.isArray(j.data) ? j.data : [];
    return sortMediaItems(raw)
      .filter((f) => String(f.mimeType || "").startsWith("image/"))
      .map((f) => toAbsoluteMediaUrl(f.downloadUrl))
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Cover image first, then uploaded media — same order as catalog UI. */
async function resolveLotImageUrls(lot) {
  const urls = [];
  const seen = new Set();

  const cover = toAbsoluteMediaUrl(lot?.coverImageUrl);
  if (cover) {
    urls.push(cover);
    seen.add(cover);
  }

  const uploaded = await fetchLotUploadedImages(lot.id);
  for (const url of uploaded) {
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return urls;
}

export async function preloadImageDataUrl(url) {
  if (!url) return null;
  const fetchUrl = url.startsWith("/") ? `${absOrigin()}${url}` : url;
  const sameOrigin = fetchUrl.startsWith(absOrigin());
  try {
    const res = await fetch(fetchUrl, {
      mode: "cors",
      credentials: sameOrigin ? "include" : "omit",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function preloadImages(urls) {
  const unique = [...new Set((urls || []).filter(Boolean))];
  const pairs = await Promise.all(unique.map(async (url) => [url, await preloadImageDataUrl(url)]));
  return Object.fromEntries(pairs.filter(([, data]) => data));
}

async function captureMapImage(lots) {
  const located = lotsWithCoords(lots);
  if (!located.length || typeof window === "undefined") return null;

  const width = 738;
  const height = 320;

  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:${height}px;z-index:1;overflow:hidden;border-radius:12px`;
  document.body.appendChild(host);

  let map = null;

  try {
    const leaflet = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    const L = leaflet.default;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    map = L.map(host, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      crossOrigin: true,
    }).addTo(map);

    const markerGroup = [];
    for (const lot of located) {
      const lat = parseFloat(lot.latitude);
      const lng = parseFloat(lot.longitude);
      markerGroup.push(L.marker([lat, lng]).addTo(map));
    }

    if (markerGroup.length === 1) {
      map.setView(markerGroup[0].getLatLng(), 13);
    } else {
      map.fitBounds(L.featureGroup(markerGroup).getBounds().pad(0.18));
    }

    map.invalidateSize();
    await new Promise((r) => setTimeout(r, 2200));

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(host, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#e2e8f0",
      width,
      height,
      scale: 2,
      logging: false,
      imageTimeout: 15000,
    });

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (err) {
    console.warn("PDF map capture failed:", err);
    return null;
  } finally {
    if (map) map.remove();
    document.body.removeChild(host);
  }
}

function collectDescendantIds(products, rootId) {
  const ids = new Set([Number(rootId)]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of products) {
      if (p.parentId != null && ids.has(Number(p.parentId)) && !ids.has(p.id)) {
        ids.add(p.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function formatNum(n, language = "fa") {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(getNumberLocale(language));
}

function productDisplayName(product, language = "fa") {
  return getLocalizedText(product, language) || product?.name || "";
}

function productDisplayDescription(product, language = "fa") {
  if (!product) return "";
  if (language === "fa") return product.description || "";
  const fromTr = product.translations?.[language]?.description;
  if (fromTr) return fromTr;
  return product.description || "";
}

function lotUnitLabel(lot, product, language, t) {
  const code = lot?.unit || product?.unit || "";
  if (!code) return "";
  try {
    return localizeUnit(code, language) || code;
  } catch {
    return code;
  }
}

export const PAGE_SPEC = { widthPx: 794, heightPx: 1123 };

const PDF_SITE_URL = "https://zareoon.ir";

function pdfProductUrl(productId) {
  return `${PDF_SITE_URL}/catalog/${productId}`;
}

function pdfWatermarkPattern(logo, t) {
  if (!logo) return "";
  const tile = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:150px;height:100px">
      <img src="${logo}" style="height:28px;width:auto;max-width:72px;object-fit:contain" alt="" />
      <span style="font-size:12px;font-weight:900;color:#047857;font-family:Tahoma,Arial,sans-serif">${esc(t("pdf.brandName"))}</span>
      <span style="font-size:10px;font-weight:700;color:#059669;letter-spacing:0.06em;font-family:Tahoma,Arial,sans-serif">zareoon.ir</span>
    </div>
  `;
  const tiles = Array(18).fill(tile).join("");
  return `
    <div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2">
      <div style="position:absolute;top:50%;left:50%;width:230%;height:230%;transform:translate(-50%,-50%) rotate(-32deg);display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:10px 20px;opacity:0.16">
        ${tiles}
      </div>
    </div>
  `;
}

function wrapImageWithWatermark(imageHtml, logo, t) {
  return `
    <div style="position:relative;display:inline-block;line-height:0;max-width:100%;max-height:100%;vertical-align:middle">
      ${imageHtml}
      ${pdfWatermarkPattern(logo, t)}
    </div>
  `;
}


function countryLabel(code, t) {
  if (!code) return "—";
  try {
    return t(`pdf.countries.${code}`);
  } catch {
    return code;
  }
}

function lotAvailable(lot) {
  return Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
}

function lotSupplierLabel(lot, t) {
  return getLotSupplierDisplay(lot, t).label;
}

function lotSupplierName(lot, t) {
  const name = getLotSupplierDisplayName(lot);
  const mobile = getLotSupplierPhone(lot);
  return name || getLotSupplier(lot)?.username || mobile || getLotSupplierDisplay(lot, t).label;
}

function lotsWithCoords(lots) {
  return (lots || []).filter((lot) => {
    const lat = parseFloat(lot.latitude);
    const lng = parseFloat(lot.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });
}

function lotPriceText(lot, t, language = "fa") {
  if (lot.tieredPricing?.length) {
    return lot.tieredPricing
      .map((tier) => {
        const max = tier.maxQuantity ? formatNum(tier.maxQuantity, language) : "∞";
        return t("pdf.tierPriceRow", {
          min: formatNum(tier.minQuantity, language),
          max,
          unit: lotUnitLabel(lot, null, language, t) || lot.unit,
          price: formatNum(tier.pricePerUnit, language),
        });
      })
      .join(" / ");
  }
  if (lot.price) return `${formatNum(lot.price, language)} ${t("currencyToman")}`;
  return t("pdf.contactForPrice");
}

function infoTableRow(label, value, { highlight = false, alt = false } = {}) {
  if (value == null || value === "" || value === "—") return "";
  const bg = alt ? "#f8fafc" : "#ffffff";
  return `<tr style="background:${bg}">
    <th scope="row" style="width:34%;padding:11px 14px;font-size:12px;font-weight:600;color:#475569;text-align:right;vertical-align:top;border-bottom:1px solid #e2e8f0;border-left:1px solid #e2e8f0">${esc(label)}</th>
    <td style="padding:11px 14px;font-size:13px;font-weight:${highlight ? "800" : "600"};color:${highlight ? "#047857" : "#0f172a"};text-align:right;vertical-align:top;line-height:1.65;border-bottom:1px solid #e2e8f0">${value}</td>
  </tr>`;
}

function singleLotInfoPageHtml(product, lot, t, language = "fa") {
  const supplier = lotSupplierLabel(lot, t);
  const available = lotAvailable(lot);
  const display = getLotDisplayForLanguage(lot, language);
  const productName = productDisplayName(product, language);
  const unitLbl = lotUnitLabel(lot, product, language, t);

  let rowIndex = 0;
  const addRow = (label, value, opts = {}) => {
    const row = infoTableRow(label, value, { ...opts, alt: rowIndex % 2 === 1 });
    if (row) rowIndex += 1;
    return row;
  };

  const rows = [
    addRow(t("pdf.productName"), esc(productName), { highlight: true }),
    display.title ? addRow(t("pdf.offerTitle"), esc(display.title), { highlight: true }) : "",
    addRow(t("pdf.qualityGrade"), esc(lot.qualityGrade || t("notSet")), { highlight: true }),
    addRow(t("supplier"), esc(supplier)),
    addRow(
      t("pdf.availableStock"),
      `${formatNum(available, language)} <span style="font-weight:600;color:#64748b">${esc(unitLbl)}</span>`,
      { highlight: true }
    ),
    addRow(t("pdf.price"), `<span style="color:#047857">${lotPriceText(lot, t, language)}</span>`, { highlight: true }),
    lot.minimumOrderQuantity
      ? addRow(t("pdf.minimumOrder"), `${formatNum(lot.minimumOrderQuantity, language)} ${esc(unitLbl)}`)
      : "",
    lot.locationLabel ? addRow(t("pdf.loadingLocation"), esc(lot.locationLabel)) : "",
    addRow(t("pdf.lotId"), `<span dir="ltr">#${lot.id}</span>`),
  ].filter(Boolean);

  for (const attr of lot.attributes || []) {
    rows.push(addRow(esc(attr.definition?.name || t("pdf.attributeFallback")), esc(attr.value ?? t("notSet"))));
  }

  const lotDescriptionBlock = display.description
    ? `<div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:14px;background:#fafafa;padding:14px 16px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#0f172a">${esc(t("pdf.lotDescriptionTitle"))}</p>
        <p style="margin:0;font-size:12px;line-height:1.9;color:#334155;text-align:justify">${esc(display.description)}</p>
      </div>`
    : "";

  const productDesc = productDisplayDescription(product, language);
  const productDescriptionBlock = productDesc
    ? `<div style="margin-top:16px;border:1px solid #d1fae5;border-radius:14px;background:linear-gradient(180deg,#f0fdf4 0%,#fff 100%);padding:14px 16px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#047857">${esc(t("pdf.aboutProduct"))}</p>
        <p style="margin:0;font-size:12px;line-height:1.9;color:#334155;text-align:justify">${esc(productDesc)}</p>
      </div>`
    : "";

  return `
    <div>
      <h2 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a;border-bottom:3px solid #10b981;padding-bottom:10px">${esc(t("pdf.lotInfoTitle"))}</h2>
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#047857">${esc(t("pdf.supplierPrefix"))}: ${esc(lotSupplierName(lot, t))}</p>
      <div style="margin-bottom:14px;text-align:center">
        <span data-pdf-link="${pdfProductUrl(product.id)}" style="display:inline-block;font-size:13px;font-weight:700;color:#059669;text-decoration:underline;padding:4px 6px">${esc(t("pdf.viewProductAndOrder"))}</span>
      </div>
      <table dir="${isRtlLanguage(language) ? "rtl" : "ltr"}" style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06)">
        <thead>
          <tr>
            <th colspan="2" style="background:linear-gradient(90deg,#059669,#047857);color:#fff;font-size:14px;font-weight:800;padding:12px 16px;text-align:${isRtlLanguage(language) ? "right" : "left"}">${esc(t("pdf.lotInfoTableHeader"))}</th>
          </tr>
        </thead>
        <tbody>${rows.join("") || `<tr><td colspan="2" style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">${esc(t("pdf.noInfoRegistered"))}</td></tr>`}</tbody>
      </table>
      ${lotDescriptionBlock}
      ${productDescriptionBlock}
    </div>
  `;
}

function mapPageHtml(lot, mapImageDataUrl, logo, t) {
  const located = lotsWithCoords([lot]);
  if (!located.length) return "";

  const supplier = lotSupplierName(lot, t);
  const mapBody = mapSectionHtml([lot], mapImageDataUrl, logo, t, { showHeader: false });

  return `
    <div>
      <h2 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a;border-bottom:3px solid #10b981;padding-bottom:10px">${esc(t("pdf.loadingLocationTitle"))}</h2>
      <p style="margin:0 0 14px;font-size:13px;color:#475569">
        ${esc(t("pdf.supplierPrefix"))}: <strong style="color:#047857">${esc(supplier)}</strong>
        ${lot.qualityGrade ? ` · ${esc(t("pdf.gradePrefix"))} <strong>${esc(lot.qualityGrade)}</strong>` : ""}
      </p>
      ${mapBody}
    </div>
  `;
}


function pdfMapNavButtonsHtml(lots, t) {
  const located = lotsWithCoords(lots);
  if (!located.length) return "";

  return located
    .map((lot) => {
      const links = buildMapNavigationLinks(lot.latitude, lot.longitude);
      if (!links) return "";
      const lotLabel = lot.locationLabel || t("lotNumber", { id: lot.id });
      const title =
        located.length > 1
          ? `<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#475569">${esc(lotLabel)}</p>`
          : `<p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#64748b;text-align:center">${esc(t("pdf.navigateShare"))}</p>`;

      const btn = (url, label, color) =>
        `<span data-pdf-link="${url}" style="display:flex;align-items:center;justify-content:center;min-height:34px;padding:6px 4px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:10px;font-weight:700;color:${color};text-align:center;cursor:pointer">${label}</span>`;

      return `
        <div style="border-top:1px solid #e2e8f0;background:#f8fafc;padding:10px 12px">
          ${title}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
            ${btn(links.google, esc(t("pdf.openGoogleMaps")), "#334155")}
            ${btn(links.neshan, esc(t("pdf.openNeshan")), "#c2410c")}
            ${btn(links.balad, esc(t("pdf.openBalad")), "#1d4ed8")}
            ${btn(links.waze, "Waze", "#0369a1")}
          </div>
        </div>
      `;
    })
    .join("");
}

function mapSectionHtml(lots, mapImageDataUrl, logo, t, { showHeader = true } = {}) {
  const located = lotsWithCoords(lots);
  if (!located.length) return "";

  const labels = located
    .map((lot) => {
      const lat = parseFloat(lot.latitude).toFixed(5);
      const lng = parseFloat(lot.longitude).toFixed(5);
      const name = lot.locationLabel || t("lotNumber", { id: lot.id });
      return `${esc(name)} <span dir="ltr" style="color:#64748b;font-size:10px">(${lat}, ${lng})</span>`;
    })
    .join("<br/>");

  const primaryLinks = buildMapNavigationLinks(located[0].latitude, located[0].longitude);
  const mapClickUrl = primaryLinks?.google || PDF_SITE_URL;

  const mapImg = mapImageDataUrl
    ? `<div style="position:relative;width:100%;height:300px;overflow:hidden">
        <img src="${mapImageDataUrl}" style="display:block;width:100%;height:100%;object-fit:cover;background:#e2e8f0" alt="" />
        ${pdfWatermarkPattern(logo, t)}
        <span data-pdf-link="${mapClickUrl}" style="position:absolute;inset:0;z-index:4;display:block;cursor:pointer" title="${esc(t("pdf.navigateTitle"))}"></span>
        <span style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:5;pointer-events:none;background:rgba(255,255,255,0.92);border:1px solid #d1fae5;border-radius:999px;padding:4px 12px;font-size:10px;font-weight:700;color:#047857;white-space:nowrap">${esc(t("pdf.clickToNavigate"))}</span>
      </div>`
    : `<div style="height:300px;background:linear-gradient(135deg,#e2e8f0 0%,#f8fafc 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
        <span style="font-size:32px">📍</span>
        <span style="font-size:12px;color:#64748b">${esc(t("pdf.mapUnavailable"))}</span>
      </div>`;

  const headerBlock = showHeader
    ? `<div style="background:#f8fafc;padding:10px 14px;border-bottom:1px solid #e2e8f0">
        <p style="margin:0;font-size:13px;font-weight:800;color:#0f172a">${esc(t("pdf.loadingLocationTitle"))}</p>
        <p style="margin:6px 0 0;font-size:11px;line-height:1.8;color:#475569">${labels}</p>
      </div>`
    : `<div style="background:#f8fafc;padding:10px 14px;border-bottom:1px solid #e2e8f0">
        <p style="margin:0;font-size:11px;line-height:1.8;color:#475569">${labels}</p>
      </div>`;

  return `
    <div style="margin-top:0;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,0.06)">
      ${headerBlock}
      ${mapImg}
      ${pdfMapNavButtonsHtml(lots, t)}
    </div>
  `;
}

function productInfoPageHtml(product, lots, t, language = "fa") {
  if (lots.length === 1) return singleLotInfoPageHtml(product, lots[0], t, language);
  const totalAvailable = lots.reduce((sum, lot) => sum + lotAvailable(lot), 0);
  const grades = [...new Set(lots.map((l) => l.qualityGrade).filter(Boolean))];
  const country = countryLabel(product.supplyCountry, t);
  const origin = [country, product.supplyCity].filter(Boolean).join(" — ");
  const productName = productDisplayName(product, language);
  const unitLbl = lotUnitLabel({ unit: product.unit }, product, language, t);
  const align = isRtlLanguage(language) ? "right" : "left";
  const dir = isRtlLanguage(language) ? "rtl" : "ltr";

  let rowIndex = 0;
  const addRow = (label, value, opts = {}) => {
    const row = infoTableRow(label, value, { ...opts, alt: rowIndex % 2 === 1 });
    if (row) rowIndex += 1;
    return row;
  };

  const rows = [
    addRow(t("pdf.productName"), esc(productName), { highlight: true }),
    addRow(t("pdf.unitOfMeasure"), esc(unitLbl || t("notSet"))),
    addRow(t("pdf.supplyOrigin"), esc(origin)),
    addRow(t("pdf.activeLotsCount"), formatNum(lots.length, language)),
    addRow(
      t("pdf.availableStock"),
      `${formatNum(totalAvailable, language)} <span style="font-weight:600;color:#64748b">${esc(unitLbl)}</span>`,
      { highlight: true }
    ),
    grades.length ? addRow(t("pdf.availableGrades"), esc(grades.join(language === "fa" ? "، " : ", "))) : "",
  ].filter(Boolean);

  const productDesc = productDisplayDescription(product, language);
  const descriptionBlock = productDesc
    ? `<div style="margin-top:18px;border:1px solid #d1fae5;border-radius:14px;background:linear-gradient(180deg,#f0fdf4 0%,#fff 100%);padding:14px 16px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#047857">${esc(t("pdf.aboutProduct"))}</p>
        <p style="margin:0;font-size:12px;line-height:1.9;color:#334155;text-align:justify">${esc(productDesc)}</p>
      </div>`
    : "";

  return `
    <div>
      <h2 style="margin:0 0 14px;font-size:20px;font-weight:800;color:#0f172a;border-bottom:3px solid #10b981;padding-bottom:10px">${esc(t("pdf.productInfoTitle"))}</h2>
      <div style="margin-bottom:14px;text-align:center">
        <span data-pdf-link="${pdfProductUrl(product.id)}" style="display:inline-block;font-size:13px;font-weight:700;color:#059669;text-decoration:underline;padding:4px 6px">${esc(t("pdf.viewProductAndOrder"))}</span>
      </div>
      <table dir="${dir}" style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06)">
        <thead>
          <tr>
            <th colspan="2" style="background:linear-gradient(90deg,#059669,#047857);color:#fff;font-size:14px;font-weight:800;padding:12px 16px;text-align:${align}">${esc(t("pdf.productInfoTableHeader"))}</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
      ${descriptionBlock}
      ${!lots.length ? `<p style="margin-top:16px;font-size:12px;color:#94a3b8;text-align:center">${esc(t("pdf.noActiveStock"))}</p>` : ""}
    </div>
  `;
}

function productCoverHtml(product, logo, language = "fa") {
  const productName = productDisplayName(product, language);
  return `
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 20px;box-sizing:border-box">
      <img src="${logo}" style="max-height:216px;width:auto;max-width:85%;object-fit:contain;margin-bottom:24px" alt="" />
      <span data-pdf-link="${PDF_SITE_URL}" style="display:inline-block;margin-bottom:28px;font-size:18px;font-weight:700;color:#047857;text-decoration:underline;letter-spacing:0.03em">zareoon.ir</span>
      <h1 style="margin:0;font-size:38px;font-weight:900;color:#047857;line-height:1.35;max-width:92%">${esc(productName)}</h1>
    </div>
  `;
}

function supplierImagePageHtml(src, imageMap, logo, lot, t) {
  const data = imageMap[src] || src;
  if (!data) return null;

  const supplierName = lotSupplierName(lot, t);
  const grade = lot.qualityGrade || "";
  const img = `<img src="${data}" crossorigin="anonymous" style="display:block;max-width:100%;max-height:${PAGE_SPEC.heightPx - 130}px;width:auto;height:auto;object-fit:contain;margin:0 auto" alt="" />`;

  return `
    <div style="height:100%;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;padding:16px 16px 44px">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;min-height:0">
        ${wrapImageWithWatermark(img, logo, t)}
      </div>
      <div style="flex-shrink:0;margin-top:10px;width:100%;text-align:center;padding:10px 16px 0;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:11px;font-weight:600;color:#64748b">${esc(t("pdf.supplierImageCaption"))}</p>
        <p style="margin:5px 0 0;font-size:15px;font-weight:800;color:#047857">${esc(supplierName)}</p>
        ${grade ? `<p style="margin:4px 0 0;font-size:12px;font-weight:600;color:#475569">${esc(t("pdf.gradeLotLine", { grade, id: lot.id }))}</p>` : `<p style="margin:4px 0 0;font-size:12px;color:#64748b">${esc(t("lotNumber", { id: lot.id }))}</p>`}
      </div>
    </div>
  `;
}

export async function fetchCatalogPdfData({
  scope = "full",
  productId,
  categoryId,
  lotId,
  supplierUserId,
  language = "fa",
  t,
}) {
  const [allProducts, allLots] = await Promise.all([
    fetchJson(API_ENDPOINTS.supplier.products.getAll),
    fetchJson(API_ENDPOINTS.supplier.inventoryLots.getAll),
  ]);

  const products = Array.isArray(allProducts) ? allProducts : [];
  const lots = Array.isArray(allLots) ? allLots : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  const sections = [];
  const allImageUrls = [`${absOrigin()}/images/logo.png`];

  if (scope === "lot" && lotId) {
    const lot = lots.find((l) => Number(l.id) === Number(lotId));
    const product = lot ? productMap.get(Number(productId || lot.productId)) : null;

    if (lot && product && Number(lot.productId) === Number(product.id)) {
      const lotImages = await resolveLotImageUrls(lot);
      allImageUrls.push(...lotImages);
      const mapImageDataUrl = lotsWithCoords([lot]).length ? await captureMapImage([lot]) : null;
      sections.push({ product, lots: [{ ...lot, images: lotImages, mapImageDataUrl }] });
    }

    const lotEntry = sections[0]?.lots?.[0];
    const productForTitle = sections[0]?.product;
    const title = lotEntry
      ? `${productDisplayName(productForTitle, language)} — ${lotSupplierName(lotEntry, t)}`
      : productDisplayName(productMap.get(Number(productId)), language) || t("pdf.titleSupplier");

    const imageMap = await preloadImages(allImageUrls);
    return {
      title,
      sections,
      imageMap,
      generatedAt: new Date(),
      productCount: sections.length,
      lotCount: sections.reduce((s, x) => s + x.lots.length, 0),
    };
  }

  let targetProducts = [];
  if (scope === "product" && productId) {
    const p = productMap.get(Number(productId));
    if (p) targetProducts = [p];
  } else if (scope === "category" && categoryId) {
    const ids = collectDescendantIds(products, categoryId);
    targetProducts = products.filter((p) => ids.has(p.id) && p.isOrderable);
  } else if (scope === "supplier-own" && supplierUserId != null) {
    const farmerId = Number(supplierUserId);
    const ownProductIds = new Set(
      lots.filter((l) => Number(l.farmerId) === farmerId).map((l) => Number(l.productId))
    );
    targetProducts = products.filter((p) => ownProductIds.has(p.id));
  } else {
    targetProducts = products.filter((p) => p.isOrderable);
  }

  targetProducts = targetProducts.sort((a, b) => (a.name || "").localeCompare(b.name || "", "fa"));

  for (const product of targetProducts) {
    let productLots = lots.filter((l) => Number(l.productId) === Number(product.id));
    if (scope === "supplier-own" && supplierUserId != null) {
      productLots = productLots.filter((l) => Number(l.farmerId) === Number(supplierUserId));
    }
    const withStock = productLots.filter((l) => lotAvailable(l) > 0);
    const lotsToExport = withStock.length ? withStock : productLots.slice(0, 5);

    const enrichedLots = [];
    for (const lot of lotsToExport) {
      const lotImages = await resolveLotImageUrls(lot);
      allImageUrls.push(...lotImages);
      const mapImageDataUrl = lotsWithCoords([lot]).length ? await captureMapImage([lot]) : null;
      enrichedLots.push({ ...lot, images: lotImages, mapImageDataUrl });
    }

    sections.push({ product, lots: enrichedLots });
  }

  let title = t("pdf.titleFull");
  if (scope === "product" && productId) {
    title = productDisplayName(productMap.get(Number(productId)), language) || title;
  } else if (scope === "category" && categoryId) {
    title = productDisplayName(productMap.get(Number(categoryId)), language) || title;
  } else if (scope === "supplier-own") title = t("pdf.titleMyProducts");

  const imageMap = await preloadImages(allImageUrls);

  return {
    title,
    sections,
    imageMap,
    generatedAt: new Date(),
    productCount: sections.length,
    lotCount: sections.reduce((s, x) => s + x.lots.length, 0),
  };
}

function sortLotsForPdf(lots) {
  return [...lots].sort((a, b) => {
    const gradeA = (a.qualityGrade || "").toString();
    const gradeB = (b.qualityGrade || "").toString();
    const cmp = gradeA.localeCompare(gradeB, "fa");
    if (cmp !== 0) return cmp;
    return (a.id || 0) - (b.id || 0);
  });
}

export function buildPdfPages(data, t, language = "fa") {
  const spec = PAGE_SPEC;
  const { imageMap } = data;
  const origin = absOrigin();
  const logo = imageMap[`${origin}/images/logo.png`] || `${origin}/images/logo.png`;
  const dir = isRtlLanguage(language) ? "rtl" : "ltr";
  const fontStack = isRtlLanguage(language)
    ? "'Vazirmatn','IRANSans',Tahoma,sans-serif"
    : "Tahoma,Arial,Helvetica,sans-serif";

  const pageShell = (inner) => `
    <div class="pdf-page" dir="${dir}" style="position:relative;width:${spec.widthPx}px;height:${spec.heightPx}px;box-sizing:border-box;overflow:hidden;font-family:${fontStack};background:#fff;color:#0f172a;padding:32px 28px 40px;">
      ${inner}
      <div style="position:absolute;bottom:12px;left:0;right:0;text-align:center">
        <span data-pdf-link="${PDF_SITE_URL}" style="font-size:9px;color:#059669;text-decoration:underline">zareoon.ir</span>
      </div>
    </div>`;

  const imagePageShell = (inner) => `
    <div class="pdf-page" dir="${dir}" style="position:relative;width:${spec.widthPx}px;height:${spec.heightPx}px;box-sizing:border-box;overflow:hidden;font-family:${fontStack};background:#fff;color:#0f172a;padding:0;">
      ${inner}
      <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center">
        <span data-pdf-link="${PDF_SITE_URL}" style="font-size:8px;color:#94a3b8;text-decoration:underline">zareoon.ir</span>
      </div>
    </div>`;

  const pages = [];

  for (const section of data.sections) {
    pages.push(pageShell(productCoverHtml(section.product, logo, language)));

    const orderedLots = sortLotsForPdf(section.lots);

    if (!orderedLots.length) {
      pages.push(
        pageShell(`<div style="height:100%;overflow:hidden">${productInfoPageHtml(section.product, [], t, language)}</div>`)
      );
      continue;
    }

    for (const lot of orderedLots) {
      pages.push(
        pageShell(
          `<div style="height:100%;overflow:auto">${singleLotInfoPageHtml(section.product, lot, t, language)}</div>`
        )
      );

      if (lotsWithCoords([lot]).length) {
        const mapHtml = mapPageHtml(lot, lot.mapImageDataUrl, logo, t);
        if (mapHtml) {
          pages.push(pageShell(`<div style="height:100%;overflow:hidden">${mapHtml}</div>`));
        }
      }

      for (const src of lot.images || []) {
        const imgPage = supplierImagePageHtml(src, imageMap, logo, lot, t);
        if (imgPage) pages.push(imagePageShell(imgPage));
      }
    }
  }

  return { pages, spec };
}
