/** Static public assets for known trade service providers */
export const AFG_INSPECTION_LOGO = "/images/advertice/afg-insp.png";
export const ZAREOON_LOGO = "/images/logo.png";

export const DEFAULT_PROVIDER_LOGOS = {
  "info@afg-insp.ir": AFG_INSPECTION_LOGO,
};

export const DEFAULT_INSPECTION_VIP_BANNER = AFG_INSPECTION_LOGO;

export function resolveProviderLogoUrl(provider) {
  if (!provider) return null;
  if (provider.logoUrl) return provider.logoUrl;
  if (provider.email && DEFAULT_PROVIDER_LOGOS[provider.email]) {
    return DEFAULT_PROVIDER_LOGOS[provider.email];
  }
  return null;
}

/** لوگو روی کارت دسته — دیگر برند اجباری نیست؛ مثل سایر دسته‌ها آیکن می‌ماند */
export function resolveCategoryBrandLogo() {
  return null;
}
