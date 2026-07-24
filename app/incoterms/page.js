import IncotermsGuide from "@/app/components/incoterms/IncotermsGuide";
import TradeToolPageShell from "@/app/components/tools/TradeToolPageShell";
import { TRADE_TOOLS, relatedToolsFor } from "@/app/data/tradeToolsMeta";
import { INCOTERMS_META } from "@/app/data/incoterms2020";

const meta = TRADE_TOOLS.incoterms;

export const metadata = {
  title: `${meta.titleFa} | ${meta.titleEn} | زارعون`,
  description: meta.descriptionFa,
  openGraph: {
    title: `${meta.titleFa} — زارعون`,
    description: meta.descriptionFa,
    type: "website",
  },
};

function RouteIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

export default function IncotermsPage() {
  return (
    <TradeToolPageShell
      eyebrow={INCOTERMS_META.titleEn}
      title={meta.titleFa}
      titleEn={meta.titleEn}
      tagline={meta.taglineFa}
      description={meta.descriptionFa}
      benefits={meta.benefits}
      relatedTools={relatedToolsFor("incoterms")}
      icon={<RouteIcon />}
    >
      <IncotermsGuide hidePageHeader />
    </TradeToolPageShell>
  );
}
