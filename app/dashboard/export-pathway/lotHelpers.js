export function lotDisplayTitle(lot, productMap = new Map()) {
  if (!lot) return "بدون عنوان";
  const fromDisplay =
    lot.displayContent?.fa?.title ||
    lot.displayContent?.en?.title ||
    lot.displayContent?.ar?.title;
  if (fromDisplay) return String(fromDisplay).trim();
  if (lot.title) return String(lot.title).trim();
  if (lot.productName) return String(lot.productName).trim();
  const product = productMap.get(Number(lot.productId)) || productMap.get(String(lot.productId));
  if (product?.name) return String(product.name).trim();
  return `موجودی #${lot.id}`;
}

export function lotAvailableQty(lot) {
  if (!lot) return 0;
  const total = Number(lot.totalQuantity ?? lot.quantity ?? 0);
  const reserved = Number(lot.reservedQuantity ?? 0);
  if (!Number.isFinite(total)) return 0;
  return Math.max(0, total - (Number.isFinite(reserved) ? reserved : 0));
}

export function formatQtyGrouped(value) {
  if (value === "" || value == null) return "";
  const raw = String(value).replace(/,/g, "").trim();
  if (!raw) return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(value);
  const [intPart, decPart] = raw.split(".");
  const grouped = Number(intPart || 0).toLocaleString("en-US");
  if (decPart != null && decPart !== "") return `${grouped}.${decPart.slice(0, 3)}`;
  if (raw.endsWith(".")) return `${grouped}.`;
  return grouped;
}

export function parseQtyGrouped(display) {
  if (display == null || display === "") return "";
  return String(display)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[,٬\s]/g, "")
    .replace(/[^\d.]/g, "");
}

export function hasLotLocation(lot) {
  if (!lot) return false;
  return Boolean(
    (lot.locationLabel && String(lot.locationLabel).trim()) ||
      (lot.latitude != null && lot.longitude != null)
  );
}

export function mapModeFromCbm(mode) {
  if (!mode || mode === "auto") return "unspecified";
  if (["sea", "air", "road", "rail", "multimodal"].includes(mode)) return mode;
  return "unspecified";
}
