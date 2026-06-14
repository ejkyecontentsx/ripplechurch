"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { MAX_JOIN_CARD_DECLARATION_LENGTH, SITE_URL } from "@/lib/constants";
import JoinCard from "@/components/JoinCard";
import JoinCardMount from "@/components/JoinCardMount";
import MemberCountClient from "@/components/MemberCountClient";
import { encodeJoinCardPayload } from "@/lib/joinCardCodec";

export default function JoinPageClient() {
  const t = useTranslations("join");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [joinError, setJoinError] = useState("");
  const [joinDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const joinedRecorded = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const origin =
    typeof window !== "undefined" ? window.location.origin : `https://${SITE_URL}`;

  const viewUrl = useMemo(() => {
    if (memberNumber == null) return undefined;
    const payload = {
      v: 1 as const,
      name: name.trim() || undefined,
      declaration: declaration.trim() || undefined,
      joinedAtISO: joinDate.toISOString(),
      memberNumber,
    };
    return `${origin}/${locale}/join/card?p=${encodeJoinCardPayload(payload)}`;
  }, [memberNumber, name, declaration, joinDate, origin, locale]);

  useEffect(() => {
    fetch("/api/member")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") setMemberCount(data.count);
      })
      .catch(() => {});
  }, []);

  const handleJoin = async () => {
    if (joining) return;
    if (joinedRecorded.current && memberNumber != null) {
      setJoined(true);
      return;
    }

    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          declaration: declaration.trim() || undefined,
          locale,
          joined_at: joinDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.member?.member_number !== "number") {
        throw new Error(data.error ?? t("joinError"));
      }

      joinedRecorded.current = true;
      setMemberNumber(data.member.member_number);
      if (typeof data.count === "number") {
        setMemberCount(data.count);
      } else if (memberCount !== null) {
        setMemberCount(memberCount + 1);
      }
      setJoined(true);
    } catch (err) {
      joinedRecorded.current = false;
      setJoinError(err instanceof Error ? err.message : t("joinError"));
    } finally {
      setJoining(false);
    }
  };

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
        text: t("shareText"),
        url: viewUrl,
      });
    } catch {
      // user cancelled or share failed
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold md:text-3xl">{t("title")}</h1>
      {memberCount !== null && (
        <MemberCountClient count={memberCount} className="mb-8 text-center" />
      )}

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

          {joinError && <p className="mt-4 text-sm text-red-500">{joinError}</p>}

          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="mt-6 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {joining ? t("joining") : t("submit")}
          </button>
        </>
      ) : (
        <>
          <JoinCardMount cardRef={cardRef}>
            <JoinCard
              name={name}
              declaration={declaration}
              joinedAt={joinDate}
              memberNumber={memberNumber ?? undefined}
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
