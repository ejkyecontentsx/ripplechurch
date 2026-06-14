"use client";

import RippleLogo from "@/components/RippleLogo";
import { SITE_URL } from "@/lib/constants";
import { QRCodeSVG } from "qrcode.react";
import { useLocale, useTranslations } from "next-intl";
import { getDateLocale } from "@/lib/dateLocale";

import { formatMemberNumber } from "@/lib/memberNumber";

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(getDateLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function JoinCard({
  name,
  declaration,
  joinedAt,
  memberNumber,
  qrUrl,
}: {
  name?: string;
  declaration?: string;
  joinedAt: Date;
  memberNumber?: number;
  qrUrl?: string;
}) {
  const t = useTranslations("joinCard");
  const locale = useLocale();
  const displayDeclaration = declaration?.trim() || t("defaultDeclaration");

  return (
    <div className="holo-card h-full w-full">
      <div className="holo-card-inner h-full w-full">
        <div
          className="relative flex h-full w-full flex-col items-center justify-between px-8 py-6"
          style={{
            backgroundColor: "#1a1a2e",
            fontFamily: "Pretendard, system-ui, sans-serif",
          }}
        >
          <div className="holo-pattern" aria-hidden />
          <div className="holo-noise" aria-hidden />
          <div className="holo-sparkle" aria-hidden />

          {qrUrl && (
            <div className="absolute left-5 top-5 z-20 rounded-lg bg-white/95 p-2 shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={76}
                bgColor="transparent"
                fgColor="#0b0b16"
                includeMargin={false}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center pt-2">
            <RippleLogo
              className="h-48 w-auto"
              variant="dark"
              showText={false}
              animated={false}
            />
            <p className="mt-1 text-xs font-bold tracking-widest text-white">RIPPLE CHURCH</p>
          </div>

          <div className="relative z-10 max-w-md px-4 text-center">
            {memberNumber != null && (
              <p className="mb-3 font-mono text-sm tracking-[0.2em] text-accent">
                {t("memberNumber", { number: formatMemberNumber(memberNumber) })}
              </p>
            )}
            <p className="text-base leading-snug text-white">{displayDeclaration}</p>
            {!!name?.trim() && (
              <p className="mt-2 text-lg font-medium text-accent">{name.trim()}</p>
            )}
          </div>

          <div className="relative z-10 pb-1 text-center">
            <p className="text-xs text-gray-300">{t("certification")}</p>
            <p className="mt-1 text-xs text-gray-400">{formatDate(joinedAt, locale)}</p>
            <p className="text-xs text-gray-500">{SITE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
