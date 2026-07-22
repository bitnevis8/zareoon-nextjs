"use client";

import FeaturedPartnerDetail from "@/app/components/FeaturedPartnerDetail";
import { AFG_INSPECTION_LOGO } from "@/app/data/tradeProviderBranding";
import { ARYA_FOULAD_EXTERNAL_URL } from "@/app/components/AryaFouladAd";

export default function AryaFouladFeaturedPage() {
  return (
    <FeaturedPartnerDetail
      tone="amber"
      logoSrc={AFG_INSPECTION_LOGO}
      brandKey="adBrandName"
      badgeKey="adBadge"
      titleKey="adTitle"
      descriptionKey="adDescription"
      itemKeys={["adItem1", "adItem2", "adItem3", "adItem4"]}
      footerKey="adFooter"
      primaryCta={{
        href: ARYA_FOULAD_EXTERNAL_URL,
        labelKey: "enterSite",
        external: true,
      }}
      secondaryCta={{
        href: "/trade-services/inspection-standards",
        labelKey: "tradeServicesExploreCta",
      }}
    />
  );
}
