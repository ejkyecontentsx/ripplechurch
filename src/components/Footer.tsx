"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-gray-100 py-8 text-center text-sm text-muted">
      <p>{t("tagline")}</p>
    </footer>
  );
}
