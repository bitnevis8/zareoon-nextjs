import Image from "next/image";
import { getProviderInitials } from "@/app/utils/tradeProviderMapper";
import { resolveProviderLogoUrl } from "@/app/data/tradeProviderBranding";

const SIZE_CLASSES = {
  sm: "h-12 w-12 text-sm sm:h-14 sm:w-14 sm:text-base",
  md: "h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl",
  lg: "h-24 w-24 text-3xl",
};

export default function ProviderAvatar({ provider, name, size = "md", className = "" }) {
  const displayName = name || provider?.name || "";
  const logoUrl = resolveProviderLogoUrl(provider);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (logoUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md ${sizeClass} ${className}`}
      >
        <Image
          src={logoUrl}
          alt={displayName}
          fill
          className="object-contain p-1.5"
          sizes="(max-width: 768px) 96px, 120px"
        />
      </div>
    );
  }

  const initials = getProviderInitials(displayName);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-100 to-emerald-50 font-black text-emerald-800 shadow-md ${sizeClass} ${className}`}
    >
      {initials}
    </div>
  );
}
