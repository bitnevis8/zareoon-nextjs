import { getTradeServicesContent } from "@/app/data/tradeServicesCatalog";
import { getLocalizedText } from "./localize";

function normalizeTerm(term) {
  return String(term || "")
    .trim()
    .toLowerCase();
}

function matches(value, term) {
  return String(value || "").toLowerCase().includes(term);
}

export function searchServiceCatalog(query, language) {
  const term = normalizeTerm(query);
  if (!term) return [];

  const content = getTradeServicesContent(language);
  const results = [];
  const seen = new Set();

  for (const category of content.categories || []) {
    const categoryMatch =
      matches(category.title, term) || matches(category.description, term) || matches(category.id, term);

    if (categoryMatch) {
      const key = `cat-${category.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          key,
          href: `/trade-services/${category.id}`,
          label: category.title,
          kind: "service_category",
        });
      }
    }

    for (const child of category.children || []) {
      if (matches(child.title, term) || matches(child.id, term)) {
        const key = `sub-${category.id}-${child.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            key,
            href: `/trade-services/${category.id}`,
            label: child.title,
            kind: "service_subcategory",
            parentLabel: category.title,
          });
        }
      }
    }
  }

  return results;
}

export function searchServiceProviders(providers, query, language) {
  const term = normalizeTerm(query);
  if (!term) return [];

  const content = getTradeServicesContent(language);
  const categoryTitleById = new Map(
    (content.categories || []).map((c) => [c.id, c.title])
  );

  return (providers || [])
    .filter((p) => {
      if (matches(p.displayName, term)) return true;
      if (matches(p.servicesOffered, term)) return true;
      if (matches(p.contactName, term)) return true;
      if (matches(p.countriesRoutes, term)) return true;
      const catTitle = categoryTitleById.get(p.categoryId);
      if (matches(catTitle, term)) return true;
      if (Array.isArray(p.selectedServices)) {
        return p.selectedServices.some((s) => matches(s, term));
      }
      return false;
    })
    .slice(0, 8)
    .map((p) => ({
      key: `provider-${p.id}`,
      href: `/trade-services/provider/${p.id}`,
      label: p.displayName,
      kind: "service_provider",
      categoryLabel: categoryTitleById.get(p.categoryId) || "",
    }));
}

export function mapProductResults(products, language) {
  return (products || []).map((item) => ({
    key: `product-${item.id}`,
    href: `/catalog/${item.id}`,
    label: getLocalizedText(item, language),
    kind: item.isOrderable ? "product" : "category",
  }));
}

export function mergeQuickSearchResults({ products, services, providers, limits = {} }) {
  const maxProducts = limits.products ?? 12;
  const maxServices = limits.services ?? 6;
  const serviceItems = [...services, ...providers].slice(0, maxServices);
  return [...products.slice(0, maxProducts), ...serviceItems];
}
