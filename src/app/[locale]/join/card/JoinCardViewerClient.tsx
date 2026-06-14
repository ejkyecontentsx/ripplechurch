"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import JoinCard from "@/components/JoinCard";
import JoinCardActions from "@/components/JoinCardActions";
import JoinCardMount from "@/components/JoinCardMount";
import { decodeJoinCardPayload, encodeJoinCardPayload } from "@/lib/joinCardCodec";

type VerifyState = "loading" | "invalid_link" | "invalid_member" | "valid";

export default function JoinCardViewerClient() {
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

  const [verifyState, setVerifyState] = useState<VerifyState>("loading");
  const cardRef = useRef<HTMLDivElement>(null);

  const viewUrl = useMemo(() => {
    if (verifyState !== "valid" || !payload?.memberNumber || typeof window === "undefined") {
      return undefined;
    }
    const cleanPayload = {
      v: 1 as const,
      name: payload.name,
      declaration: payload.declaration,
      joinedAtISO: payload.joinedAtISO,
      memberNumber: payload.memberNumber,
    };
    return `${window.location.origin}/${locale}/join/card?p=${encodeJoinCardPayload(cleanPayload)}`;
  }, [verifyState, payload, locale]);

  useEffect(() => {
    if (!payload || !joinedAt) {
      setVerifyState("invalid_link");
      return;
    }
    if (!payload.memberNumber) {
      setVerifyState("invalid_link");
      return;
    }

    const card = payload;
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/member/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberNumber: card.memberNumber,
            name: card.name,
            declaration: card.declaration,
            joinedAt: card.joinedAtISO,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.valid) {
          setVerifyState("invalid_member");
          return;
        }
        setVerifyState("valid");
      } catch {
        if (!cancelled) setVerifyState("invalid_member");
      }
    }

    setVerifyState("loading");
    verify();

    return () => {
      cancelled = true;
    };
  }, [payload, joinedAt]);

  if (verifyState === "loading") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <h1 className="mb-4 text-center text-2xl font-semibold md:text-3xl">
          {tCard("lookupTitle")}
        </h1>
        <p className="text-center text-muted">{tCard("verifying")}</p>
      </section>
    );
  }

  if (verifyState === "invalid_link") {
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

  if (verifyState === "invalid_member" || !payload || !joinedAt) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <h1 className="mb-4 text-center text-2xl font-semibold md:text-3xl">
          {tCard("lookupTitle")}
        </h1>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm leading-relaxed text-red-900">
          {tCard("invalidMember")}
          <br />
          {tCard("invalidMemberHint")}
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
          qrUrl={viewUrl}
        />
      </JoinCardMount>

      <JoinCardActions cardRef={cardRef} viewUrl={viewUrl} />
    </section>
  );
}
