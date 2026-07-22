import QRCode from "qrcode";

/** Print presets (mm). PNG-only is pixel-based. */
export const SHOP_QR_PRINT_SIZES = [
  { id: "a4", label: "A4", hint: "۲۱۰ × ۲۹۷ میلی‌متر", widthMm: 210, heightMm: 297, qrRatio: 0.42 },
  { id: "a5", label: "A5", hint: "۱۴۸ × ۲۱۰ میلی‌متر", widthMm: 148, heightMm: 210, qrRatio: 0.48 },
  { id: "a6", label: "A6", hint: "۱۰۵ × ۱۴۸ میلی‌متر", widthMm: 105, heightMm: 148, qrRatio: 0.52 },
  { id: "square10", label: "۱۰ × ۱۰ سانتی‌متر", hint: "استیکر مربعی", widthMm: 100, heightMm: 100, qrRatio: 0.62 },
  { id: "png", label: "PNG مربعی", hint: "۱۰۲۴ پیکسل — کیفیت بالا", type: "png", px: 1024 },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function safeFilenamePart(value) {
  return String(value || "shop")
    .trim()
    .replace(/[^\w\u0600-\u06FF-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "shop";
}

/**
 * Build a print-ready PNG (canvas) for the shop page QR.
 */
export async function buildShopQrPrintPng({
  pageUrl,
  title = "",
  displayUrl = "",
  widthMm,
  heightMm,
  qrRatio = 0.45,
  dpi = 300,
}) {
  const pxPerMm = dpi / 25.4;
  const width = Math.round(widthMm * pxPerMm);
  const height = Math.round(heightMm * pxPerMm);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const qrPx = Math.round(Math.min(width, height) * qrRatio);
  const qrDataUrl = await QRCode.toDataURL(pageUrl, {
    width: qrPx,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const qrImg = await loadImage(qrDataUrl);
  const qrX = (width - qrPx) / 2;
  const qrY = height * (heightMm === widthMm ? 0.12 : 0.16);
  ctx.drawImage(qrImg, qrX, qrY, qrPx, qrPx);

  const textTop = qrY + qrPx + height * 0.04;
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "center";
  ctx.direction = "rtl";

  if (title) {
    const titleSize = Math.max(18, Math.round(width * 0.035));
    ctx.font = `700 ${titleSize}px "Vazirmatn", "Tahoma", "Arial", sans-serif`;
    ctx.fillText(title, width / 2, textTop, width * 0.86);
  }

  if (displayUrl) {
    const urlSize = Math.max(14, Math.round(width * 0.022));
    ctx.font = `500 ${urlSize}px "Tahoma", "Arial", sans-serif`;
    ctx.fillStyle = "#475569";
    ctx.direction = "ltr";
    ctx.fillText(displayUrl, width / 2, textTop + Math.round(width * 0.045), width * 0.9);
  }

  const hintSize = Math.max(12, Math.round(width * 0.018));
  ctx.font = `400 ${hintSize}px "Vazirmatn", "Tahoma", "Arial", sans-serif`;
  ctx.fillStyle = "#64748b";
  ctx.direction = "rtl";
  ctx.fillText("اسکن کنید تا صفحه فروشگاه باز شود", width / 2, height * 0.92, width * 0.86);

  return canvas.toDataURL("image/png");
}

export async function buildShopQrSquarePng({ pageUrl, px = 1024 }) {
  return QRCode.toDataURL(pageUrl, {
    width: px,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export async function downloadShopQrPrint({ pageUrl, title, displayUrl, size, slugHint = "shop" }) {
  if (!pageUrl || !size) throw new Error("missing pageUrl or size");
  const base = safeFilenamePart(slugHint || title);

  if (size.type === "png") {
    const dataUrl = await buildShopQrSquarePng({ pageUrl, px: size.px || 1024 });
    triggerDownload(dataUrl, `${base}-qr.png`);
    return;
  }

  const dataUrl = await buildShopQrPrintPng({
    pageUrl,
    title,
    displayUrl,
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    qrRatio: size.qrRatio,
  });

  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: size.widthMm > size.heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [size.widthMm, size.heightMm],
    });
    doc.addImage(dataUrl, "PNG", 0, 0, size.widthMm, size.heightMm);
    doc.save(`${base}-qr-${size.id}.pdf`);
  } catch {
    triggerDownload(dataUrl, `${base}-qr-${size.id}.png`);
  }
}
