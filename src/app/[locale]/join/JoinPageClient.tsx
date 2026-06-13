"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { MAX_JOIN_CARD_DECLARATION_LENGTH, SITE_URL } from "@/lib/constants";
import JoinCard from "@/components/JoinCard";
import JoinCardMount from "@/components/JoinCardMount";
import { encodeJoinCardPayload } from "@/lib/joinCardCodec";

export default function JoinPageClient() {
  const t = useTranslations("join");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const origin =
    typeof window !== "undefined" ? window.location.origin : `https://${SITE_URL}`;

  const payload = {
    v: 1 as const,
    name: name.trim() || undefined,
    declaration: declaration.trim() || undefined,
    joinedAtISO: joinDate.toISOString(),
  };
  const viewUrl = `${origin}/${locale}/join/card?p=${encodeJoinCardPayload(payload)}`;

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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t("shareTitle"),
        text: t("shareText"),
        url: viewUrl,
      });
    } catch {
      // user cancelled or share failed
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold md:text-3xl">{t("title")}</h1>

      {!joined ? (
        <>
          <div className="whitespace-pre-line rounded-xl border border-gray-100 bg-gray-50 p-6 text-base leading-relaxed text-foreground">
            {t("declaration")}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                {t("nameLabel")}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-foreground placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="declaration"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                {t("declarationLabel")}
              </label>
              <textarea
                id="declaration"
                rows={4}
                maxLength={MAX_JOIN_CARD_DECLARATION_LENGTH}
                value={declaration}
                onChange={(e) => setDeclaration(e.target.value)}
                placeholder={t("declarationPlaceholder")}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-foreground placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-right text-xs text-muted">
                {declaration.length}/{MAX_JOIN_CARD_DECLARATION_LENGTH}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setJoined(true)}
            className="mt-6 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("submit")}
          </button>
        </>
      ) : (
        <>
          <JoinCardMount cardRef={cardRef}>
            <JoinCard
              name={name}
              declaration={declaration}
              joinedAt={joinDate}
              qrUrl={viewUrl}
            />
          </JoinCardMount>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={saving}
              className="rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
            >
              {saving ? t("saving") : t("saveImage")}
            </button>
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                className="rounded-full border border-foreground px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
              >
                {t("share")}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted">{t("qrHint")}</p>

          <p className="mt-8 text-center text-xs text-muted">
            {t("donationJoke")}
            <br />
            {t("donationPunchline")}
          </p>
        </>
      )}
    </section>
  );
}
