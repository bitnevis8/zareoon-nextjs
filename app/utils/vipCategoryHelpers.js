import { DEFAULT_INSPECTION_VIP_BANNER } from "@/app/data/tradeProviderBranding";
import faSupplier from "../../messages/fa/supplier.json";

export const DEFAULT_VIP_MESSAGE = faSupplier.tradeProvider.defaultVipMessage;

export function resolveVipCategoryMessage(vipCategories, categoryId, language, t) {
  const cfg = vipCategories?.[categoryId];
  if (!cfg?.enabled) return null;

  if (cfg.messageMode === "default") {
    return t("vipMessage");
  }

  if (cfg.message) {
    if (typeof cfg.message === "string") return cfg.message;
    return cfg.message[language] || cfg.message.fa || t("vipMessage");
  }

  return t("vipMessage");
}

export function resolveVipBannerImage(vipCategories, categoryId) {
  const cfg = vipCategories?.[categoryId];
  if (!cfg?.enabled || cfg.messageMode === "default") return null;
  if (cfg.bannerImage) return cfg.bannerImage;
  if (categoryId === "inspection-standards") return DEFAULT_INSPECTION_VIP_BANNER;
  return null;
}

export function isVipCategoryEnabled(vipCategories, categoryId) {
  return !!vipCategories?.[categoryId]?.enabled;
}

export function getVipCompanyName(providers, categoryId, t) {
  if (!Array.isArray(providers) || !categoryId) return null;

  const match = providers.find((provider) => {
    if (provider.categoryId === categoryId) return true;
    return (
      Array.isArray(provider.selectedServices) &&
      provider.selectedServices.some((service) => service?.categoryId === categoryId)
    );
  });

  if (match?.displayName) return match.displayName;
  if (categoryId === "inspection-standards" && t) return t("vip.inspectionStandardsCompany");
  return null;
}

export function shouldUseFeaturedProviderCard({ isVipCategory, provider, providerCount }) {
  if (!isVipCategory || !provider) return false;
  if (providerCount === 1) return true;
  return provider.entityTypeKey === "company" && providerCount <= 2;
}
