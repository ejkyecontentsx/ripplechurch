"use client";

import { useTranslations } from "next-intl";

export default function MemberCountClient({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  const t = useTranslations("members");

  return (
    <p className={`text-sm text-muted ${className}`}>
      {count === 0 ? t("empty") : t("count", { count })}
    </p>
  );
}
