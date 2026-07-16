"use client";

import { useMemo } from "react";
import { useMessages } from "next-intl";
import { resolveTradeServicesContent } from "@/app/utils/tradeServicesContent";

export function useTradeServicesContent() {
  const messages = useMessages();
  return useMemo(
    () => resolveTradeServicesContent(messages.tradeServices),
    [messages]
  );
}
