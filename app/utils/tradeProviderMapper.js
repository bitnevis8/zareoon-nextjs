import {
  findCatalogService,
  getCategoryById,
  resolveLocalizedField,
  sampleTradeServiceProviders,
} from "@/app/data/tradeServicesCatalog";
import i18nData from "./i18nFaData";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

export function findSampleProviderById(providerId) {
  for (const [categoryId, list] of Object.entries(sampleTradeServiceProviders)) {
    const found = list.find((p) => p.id === providerId);
    if (found) return { categoryId, provider: found };
  }
  return null;
}

export function mapApiProviderRow(row, t, language) {
  const serviceDetails = Array.isArray(row.selectedServices)
    ? row.selectedServices
        .map((s) => findCatalogService(language, s.categoryId, s.subcategoryId))
        .filter(Boolean)
    : [];

  const services =
    serviceDetails.length > 0
      ? serviceDetails.map((s) => s.subcategoryTitle)
      : row.servicesOffered
        ? row.servicesOffered.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean)
        : [];

  return {
    id: String(row.id),
    apiId: row.id,
    profilePath: providerPublicPath(row.profileSlug),
    name: row.displayName,
    contactName: row.contactName,
    phone: row.phone,
    email: row.email || null,
    logoUrl: row.logoUrl || null,
    entityType:
      row.entityType === "individual"
        ? t("tradeProviderEntityIndividual")
        : t("tradeProviderEntityCompany"),
    entityTypeKey: row.entityType === "individual" ? "individual" : "company",
    routes: row.countriesRoutes || null,
    services,
    serviceDetails,
    licenses: row.licenses || null,
    experienceYears: row.experienceYears,
    rating: row.rating != null ? Number(row.rating) : null,
    reviewCount: row.reviewCount || 0,
    notes: row.notes || null,
    isLive: true,
    primaryCategoryId: row.categoryId,
    businessHours: row.businessHours || null,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    addressLabel: row.addressLabel || null,
  };
}

export function mapSampleProviderEntry(provider, categoryId, language, t) {
  const services = provider.services[language] || provider.services.fa || [];
  const serviceDetails = (provider.services[language] || provider.services.fa || []).map((title, idx) => {
    const cat = getCategoryById(language, categoryId);
    const sub = cat?.children?.[idx];
    return sub
      ? {
          categoryId,
          subcategoryId: sub.id,
          categoryTitle: cat.title,
          subcategoryTitle: sub.title,
        }
      : {
          categoryId,
          subcategoryId: `sample-${idx}`,
          categoryTitle: cat?.title || categoryId,
          subcategoryTitle: title,
        };
  });

  return {
    id: provider.id,
    apiId: null,
    profilePath: null,
    name: resolveLocalizedField(provider.name, language),
    contactName: resolveLocalizedField(provider.name, language),
    phone: null,
    email: null,
    entityType: resolveLocalizedField(provider.entityType, language),
    entityTypeKey: provider.entityType?.en === "Individual" ? "individual" : "company",
    routes: resolveLocalizedField(provider.routes, language),
    services,
    serviceDetails,
    licenses: (provider.licenses[language] || provider.licenses.fa || []).join(" · "),
    experienceYears: provider.experienceYears,
    rating: provider.rating,
    reviewCount: provider.reviewCount,
    notes: null,
    isLive: false,
    primaryCategoryId: categoryId,
  };
}

export function getProviderInitials(name) {
  if (!name) return i18nData.numerals.unknownInitial;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  return name.slice(0, 2);
}
