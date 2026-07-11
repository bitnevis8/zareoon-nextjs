import { DEFAULT_INSPECTION_VIP_BANNER } from "@/app/data/tradeProviderBranding";

export const DEFAULT_VIP_MESSAGE = {
  fa: "این بخش VIP است و عضویت در آن امکان‌پذیر نیست.",
  en: "This is a VIP section. Membership is not available.",
  ru: "Это VIP-раздел. Регистрация недоступна.",
};

export function resolveVipCategoryMessage(vipCategories, categoryId, language, t) {
  const cfg = vipCategories?.[categoryId];
  if (!cfg?.enabled) return null;

  if (cfg.messageMode === "default") {
    return t("tradeProviderVipMessage");
  }

  if (cfg.message) {
    if (typeof cfg.message === "string") return cfg.message;
    return cfg.message[language] || cfg.message.fa || t("tradeProviderVipMessage");
  }

  return t("tradeProviderVipMessage");
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

export function getVipCompanyName(providers, categoryId) {
  if (!Array.isArray(providers) || !categoryId) return null;

  const match = providers.find((provider) => {
    if (provider.categoryId === categoryId) return true;
    return (
      Array.isArray(provider.selectedServices) &&
      provider.selectedServices.some((service) => service?.categoryId === categoryId)
    );
  });

  if (match?.displayName) return match.displayName;
  if (categoryId === "inspection-standards") return "آریا فولاد قرن";
  return null;
}

export function shouldUseFeaturedProviderCard({ isVipCategory, provider, providerCount }) {
  if (!isVipCategory || !provider) return false;
  if (providerCount === 1) return true;
  return provider.entityTypeKey === "company" && providerCount <= 2;
}
