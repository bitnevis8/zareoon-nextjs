import QRCode from "qrcode";
import { SHOP_QR_PRINT_SIZES } from "./shopPageQrPrint";

export const PRODUCT_QR_PRINT_SIZES = SHOP_QR_PRINT_SIZES;

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
  return (
    String(value || "product")
      .trim()
      .replace(/[^\w\u0600-\u06FF-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "product"
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadProductQrPrint({
  pageUrl,
  title,
  displayUrl,
  size,
  slugHint = "product",
  scanHint = "اسکن کنید تا صفحه محصول باز شود",
}) {
  if (!pageUrl || !size) throw new Error("missing pageUrl or size");
  const base = safeFilenamePart(slugHint || title);

  if (size.type === "png") {
    const dataUrl = await QRCode.toDataURL(pageUrl, {
      width: size.px || 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    triggerDownload(dataUrl, `${base}-qr.png`);
    return;
  }

  const widthMm = size.widthMm;
  const heightMm = size.heightMm;
  const qrRatio = size.qrRatio || 0.45;
  const dpi = 300;
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
    ctx.font = `700 ${titleSize}px "IRANSans", "Vazirmatn", "Tahoma", "Arial", sans-serif`;
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
  ctx.font = `400 ${hintSize}px "IRANSans", "Vazirmatn", "Tahoma", "Arial", sans-serif`;
  ctx.fillStyle = "#64748b";
  ctx.direction = "rtl";
  ctx.fillText(scanHint, width / 2, height * 0.92, width * 0.86);

  const dataUrl = canvas.toDataURL("image/png");

  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: widthMm > heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [widthMm, heightMm],
    });
    doc.addImage(dataUrl, "PNG", 0, 0, widthMm, heightMm);
    doc.save(`${base}-qr-${size.id}.pdf`);
  } catch {
    triggerDownload(dataUrl, `${base}-qr-${size.id}.png`);
  }
}
