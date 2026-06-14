"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import JoinCard from "@/components/JoinCard";
import JoinCardMount from "@/components/JoinCardMount";
import { decodeJoinCardPayload } from "@/lib/joinCardCodec";

export default function JoinCardViewerClient() {
  const t = useTranslations("join");
  const tCard = useTranslations("joinCard");
  const locale = useLocale();
  const params = useSearchParams();
  const encoded = params.get("p") ?? "";

  const payload = useMemo(() => decodeJoinCardPayload(encoded), [encoded]);
  const joinedAt = useMemo(() => {
    if (!payload) return null;
    const d = new Date(payload.joinedAtISO);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [payload]);

  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "ripple-church-certificate.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSaving(false);
    }
  };

  if (!payload || !joinedAt) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <h1 className="mb-4 text-center text-2xl font-semibold md:text-3xl">
          {tCard("lookupTitle")}
        </h1>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm leading-relaxed text-foreground">
          {tCard("invalidLink")}
          <br />
          {tCard("invalidLinkHint", { joinPath: `/${locale}/join` })}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold md:text-3xl">
        {tCard("viewTitle")}
      </h1>

      <JoinCardMount cardRef={cardRef}>
        <JoinCard
          name={payload.name}
          declaration={payload.declaration}
          joinedAt={joinedAt}
          memberNumber={payload.memberNumber}
        />
      </JoinCardMount>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          className="rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
        >
          {saving ? t("saving") : t("saveImage")}
        </button>
      </div>
    </section>
  );
}
