import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing, LOCALE_COOKIE } from "./routing";
import { loadMessagesForLocale } from "../messages/loadMessages";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    const cookieStore = await cookies();
    locale = cookieStore.get(LOCALE_COOKIE)?.value;
  }

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: loadMessagesForLocale(locale),
  };
});
