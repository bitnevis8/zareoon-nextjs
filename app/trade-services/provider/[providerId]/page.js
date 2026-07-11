import TradeProviderProfileView from "@/app/components/TradeProviderProfileView";

export default async function TradeProviderProfilePage({ params }) {
  const { providerId } = await params;
  return <TradeProviderProfileView providerId={providerId} />;
}
