"use client";

import FeaturedPartnerDetail from "@/app/components/FeaturedPartnerDetail";
import { ZAREOON_LOGO } from "@/app/data/tradeProviderBranding";

export default function PackagingFeaturedPage() {
  return (
    <FeaturedPartnerDetail
      tone="emerald"
      logoSrc={ZAREOON_LOGO}
      brandKey="packagingAdBrandName"
      badgeKey="packagingAdBadge"
      titleKey="packagingAdTitle"
      descriptionKey="packagingAdDescription"
      itemKeys={["packagingAdItem1", "packagingAdItem2", "packagingAdItem3", "packagingAdItem4"]}
      footerKey="packagingAdFooter"
      primaryCta={{
        href: "/zareoon?tab=services",
        labelKey: "packagingAdCta",
        authRequired: true,
      }}
      secondaryCta={{
        href: "/trade-services/packaging-prep",
        labelKey: "tradeServicesExploreCta",
      }}
    />
  );
}
