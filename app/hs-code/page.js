import HsCodeTariffPanel from "@/app/components/HsCodeTariffPanel";
import TradeToolPageShell from "@/app/components/tools/TradeToolPageShell";
import { TRADE_TOOLS, relatedToolsFor } from "@/app/data/tradeToolsMeta";

const meta = TRADE_TOOLS.hs;

export const metadata = {
  title: `${meta.titleFa} | ${meta.titleEn} | زارعون`,
  description: meta.descriptionFa,
  openGraph: {
    title: `${meta.titleFa} — زارعون`,
    description: meta.descriptionFa,
    type: "website",
  },
};

function DocIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function HsCodePage() {
  return (
    <TradeToolPageShell
      eyebrow={meta.titleEn}
      title={meta.titleFa}
      titleEn={meta.titleEn}
      tagline={meta.taglineFa}
      description={meta.descriptionFa}
      benefits={meta.benefits}
      relatedTools={relatedToolsFor("hs")}
      icon={<DocIcon />}
    >
      <HsCodeTariffPanel />
    </TradeToolPageShell>
  );
}
