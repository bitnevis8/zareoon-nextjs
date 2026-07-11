/** Static public assets for known trade service providers */
export const DEFAULT_PROVIDER_LOGOS = {
  "info@afg-insp.ir": "/images/advertice/afg-insp.png",
};

export const DEFAULT_INSPECTION_VIP_BANNER = "/images/advertice/afg-insp.png";

export function resolveProviderLogoUrl(provider) {
  if (!provider) return null;
  if (provider.logoUrl) return provider.logoUrl;
  if (provider.email && DEFAULT_PROVIDER_LOGOS[provider.email]) {
    return DEFAULT_PROVIDER_LOGOS[provider.email];
  }
  return null;
}
