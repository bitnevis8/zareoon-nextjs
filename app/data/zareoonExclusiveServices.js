import { getTradeServicesContent, getSampleMemberCount } from "./tradeServicesCatalog";

/** Homepage L1 cards — derived from trade services catalog */
export function getExclusiveServicesContent(language) {
  const content = getTradeServicesContent(language);
  return {
    eyebrow: content.eyebrow,
    title: content.title,
    subtitle: content.subtitle,
    providerHint: content.providerHint,
    providerRegisterNote: content.providerRegisterNote,
    items: content.categories.map((category) => ({
      id: category.id,
      title: category.title,
      description: category.description,
      icon: category.icon,
      memberCount: getSampleMemberCount(category.id),
    })),
  };
}

/** @deprecated Use getTradeServicesContent — kept for admin imports */
export const exclusiveServicesContent = {
  fa: getExclusiveServicesContent("fa"),
  en: getExclusiveServicesContent("en"),
  ru: getExclusiveServicesContent("ru"),
};
