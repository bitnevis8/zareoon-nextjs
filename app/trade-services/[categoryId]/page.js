import { notFound } from "next/navigation";
import TradeServicesCategoryView from "@/app/components/TradeServicesCategoryView";
import { isValidL1CategoryId } from "@/app/data/tradeServicesCatalog";

export default async function TradeServicesCategoryPage({ params }) {
  const { categoryId } = await params;
  if (!isValidL1CategoryId(categoryId)) notFound();
  return <TradeServicesCategoryView categoryId={categoryId} />;
}
