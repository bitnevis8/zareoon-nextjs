import CbmFreightCalculator from "@/app/components/CbmFreightCalculator";
import TradeToolPageShell from "@/app/components/tools/TradeToolPageShell";
import { TRADE_TOOLS, relatedToolsFor } from "@/app/data/tradeToolsMeta";

const meta = TRADE_TOOLS.cbm;

export const metadata = {
  title: `${meta.titleFa} | ${meta.titleEn} | زارعون`,
  description: meta.descriptionFa,
  openGraph: {
    title: `${meta.titleFa} — زارعون`,
    description: meta.descriptionFa,
    type: "website",
  },
};

function CubeIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5"
      />
    </svg>
  );
}

export default function CbmPage() {
  return (
    <TradeToolPageShell
      eyebrow={meta.titleEn}
      title={meta.titleFa}
      titleEn={meta.titleEn}
      tagline={meta.taglineFa}
      description={meta.descriptionFa}
      benefits={meta.benefits}
      relatedTools={relatedToolsFor("cbm")}
      icon={<CubeIcon />}
    >
      <CbmFreightCalculator />
    </TradeToolPageShell>
  );
}
