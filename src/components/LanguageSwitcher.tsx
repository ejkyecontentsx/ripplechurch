"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className={`flex items-center rounded-full border border-gray-200 bg-white text-xs font-medium ${
        compact ? "p-0.5" : "p-1"
      }`}
      role="group"
      aria-label="Language"
    >
      {(["ko", "en", "ja"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLocale(lang)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === lang
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
