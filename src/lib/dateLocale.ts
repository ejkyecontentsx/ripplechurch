import type { Locale } from "@/i18n/routing";

const DATE_LOCALE: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

export function getDateLocale(locale: string): string {
  return DATE_LOCALE[locale as Locale] ?? "en-US";
}
