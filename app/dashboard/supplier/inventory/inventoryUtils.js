import { API_ENDPOINTS } from "@/app/config/api";

export async function loadAttributeDefsForProduct(productId, products) {
  const selected = products.find((p) => p.id === Number(productId));
  const categoryId = selected?.parentId ?? selected?.categoryId;
  if (!selected) return [];
  try {
    const [rCat, rProd] = await Promise.all([
      categoryId ? fetch(API_ENDPOINTS.supplier.attributeDefinitions.getByCategoryId(categoryId), { cache: "no-store" }) : null,
      fetch(API_ENDPOINTS.supplier.attributeDefinitions.getByProductId(selected.id), { cache: "no-store" }),
    ]);
    const dCat = rCat ? await rCat.json() : { data: [] };
    const dProd = rProd ? await rProd.json() : { data: [] };
    const rawDefs = [...(dCat.data || []), ...(dProd.data || [])];
    const filtered = rawDefs.filter((def) => {
      if (def.productId && Number(def.productId) === Number(selected.id)) return true;
      if (def.categoryId && Number(def.categoryId) === Number(categoryId)) return true;
      return false;
    });
    return Array.from(new Map(filtered.map((d) => [d.id, d])).values());
  } catch {
    return [];
  }
}

export async function saveLotAttributeValues(lotId, defs, values, existingAttrs = []) {
  for (const def of defs) {
    const val = values[def.id];
    const existing = (existingAttrs || []).find((a) => Number(a.attributeDefinitionId) === Number(def.id));
    const trimmed = val !== undefined && val !== null ? String(val).trim() : "";
    if (trimmed) {
      if (existing?.id) {
        await fetch(API_ENDPOINTS.supplier.attributeValues.update(existing.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: trimmed }),
        });
      } else {
        await fetch(API_ENDPOINTS.supplier.attributeValues.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inventoryLotId: lotId,
            attributeDefinitionId: Number(def.id),
            value: trimmed,
          }),
        });
      }
    } else if (existing?.id) {
      await fetch(API_ENDPOINTS.supplier.attributeValues.delete(existing.id), { method: "DELETE" });
    }
  }
}

export function filterAndSortLots(items, filters, { productName, farmerNameMap }) {
  let result = [...items];
  const q = filters.search.trim().toLowerCase();

  if (q) {
    result = result.filter((x) => {
      const name = productName(x.productId).toLowerCase();
      const farmer = (farmerNameMap.get(x.farmerId) || "").toLowerCase();
      const grade = (x.qualityGrade || "").toLowerCase();
      const desc = (x.description || "").toLowerCase();
      return (
        name.includes(q) ||
        farmer.includes(q) ||
        grade.includes(q) ||
        desc.includes(q) ||
        String(x.id).includes(q)
      );
    });
  }

  if (filters.productId) {
    result = result.filter((x) => Number(x.productId) === Number(filters.productId));
  }
  if (filters.qualityGrade) {
    result = result.filter((x) => x.qualityGrade === filters.qualityGrade);
  }
  if (filters.status) {
    result = result.filter((x) => x.status === filters.status);
  }
  if (filters.farmerId) {
    result = result.filter((x) => Number(x.farmerId) === Number(filters.farmerId));
  }
  if (filters.hasPrice === "yes") {
    result = result.filter((x) => x.price || (x.tieredPricing && x.tieredPricing.length > 0));
  }
  if (filters.hasPrice === "no") {
    result = result.filter((x) => !x.price && !(x.tieredPricing && x.tieredPricing.length > 0));
  }

  const available = (x) => Math.max(0, parseFloat(x.totalQuantity || 0) - parseFloat(x.reservedQuantity || 0));
  const priceVal = (x) => (x.price ? parseFloat(x.price) : 0);

  switch (filters.sort) {
    case "oldest":
      result.sort((a, b) => a.id - b.id);
      break;
    case "qty_desc":
      result.sort((a, b) => available(b) - available(a));
      break;
    case "qty_asc":
      result.sort((a, b) => available(a) - available(b));
      break;
    case "price_desc":
      result.sort((a, b) => priceVal(b) - priceVal(a));
      break;
    case "price_asc":
      result.sort((a, b) => priceVal(a) - priceVal(b));
      break;
    case "newest":
    default:
      result.sort((a, b) => b.id - a.id);
      break;
  }

  return result;
}

export function countActiveFilters(filters) {
  return Object.entries(filters).filter(([key, val]) => {
    if (key === "sort") return val && val !== "newest";
    return val !== "" && val != null;
  }).length;
}
