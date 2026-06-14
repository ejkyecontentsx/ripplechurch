"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function JoinCardActions({
  cardRef,
  viewUrl,
}: {
  cardRef: React.RefObject<HTMLDivElement>;
  viewUrl?: string;
}) {
  const t = useTranslations("join");
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

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
    if (!viewUrl) return;
    try {
      await navigator.share({
        title: t("shareTitle"),
        url: viewUrl,
      });
    } catch {
      // user cancelled or share failed
    }
  };

  const handleCopyLink = async () => {
    if (!viewUrl) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(viewUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    } finally {
      setCopying(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          className="rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
        >
          {saving ? t("saving") : t("saveImage")}
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={copying || !viewUrl}
          className="rounded-full border border-foreground px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white disabled:opacity-50"
        >
          {copied ? t("copied") : t("copyLink")}
        </button>
        {canShare && viewUrl && (
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-foreground px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
          >
            {t("share")}
          </button>
        )}
      </div>
      {viewUrl && <p className="mt-4 text-center text-xs text-muted">{t("qrHint")}</p>}
    </>
  );
}
