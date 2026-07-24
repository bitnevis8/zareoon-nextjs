import TradeUnitConverter from "@/app/components/units/TradeUnitConverter";
import TradeToolPageShell from "@/app/components/tools/TradeToolPageShell";
import { TRADE_TOOLS, relatedToolsFor } from "@/app/data/tradeToolsMeta";

const meta = TRADE_TOOLS.units;

export const metadata = {
  title: `${meta.titleFa} | ${meta.titleEn} | زارعون`,
  description: meta.descriptionFa,
  openGraph: {
    title: `${meta.titleFa} — زارعون`,
    description: meta.descriptionFa,
    type: "website",
  },
};

function ConvertIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

export default function UnitConverterPage() {
  return (
    <TradeToolPageShell
      eyebrow={meta.titleEn}
      title={meta.titleFa}
      titleEn={meta.titleEn}
      tagline={meta.taglineFa}
      description={meta.descriptionFa}
      benefits={meta.benefits}
      relatedTools={relatedToolsFor("units")}
      icon={<ConvertIcon />}
    >
      <TradeUnitConverter hidePageHeader />
    </TradeToolPageShell>
  );
}
