"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getWeeklyWaveContent, type WeeklyWave } from "@/lib/supabase";
import type { WeeklyWaveStorage } from "@/lib/weeklyWaveStore";
import { getDateLocale } from "@/lib/dateLocale";

function getWavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("waved-weekly-waves");
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markWaved(id: string) {
  const ids = getWavedIds();
  ids.add(id);
  localStorage.setItem("waved-weekly-waves", JSON.stringify(Array.from(ids)));
}

export default function WeeklyWaveDetailClient({ slug }: { slug: string }) {
  const t = useTranslations("weekly");
  const locale = useLocale();
  const [wave, setWave] = useState<WeeklyWave | null>(null);
  const [storage, setStorage] = useState<WeeklyWaveStorage | null>(null);
  const [loading, setLoading] = useState(true);
  const [wavedIds, setWavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(getDateLocale(locale), {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [locale]
  );

  useEffect(() => {
    setWavedIds(getWavedIds());

    async function load() {
      try {
        const res = await fetch("/api/weekly-wave");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? t("fetchError"));
          return;
        }
        const found = (data.waves as WeeklyWave[] | undefined)?.find(
          (item) => item.slug === slug
        );
        setWave(found ?? null);
        setStorage(data.storage ?? "unavailable");
      } catch {
        setError(t("fetchError"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, t]);

  const handleWave = async () => {
    if (!wave || wavedIds.has(wave.id)) return;

    setWavedIds((prev) => new Set([...Array.from(prev), wave.id]));
    markWaved(wave.id);
    setWave({ ...wave, waves: wave.waves + 1 });

    try {
      const res = await fetch(`/api/weekly-wave/${wave.id}/wave`, { method: "PATCH" });
      if (!res.ok) throw new Error("failed");
      const updated = await res.json();
      setWave((prev) => (prev ? { ...prev, waves: updated.waves } : prev));
    } catch {
      setWavedIds((prev) => {
        const next = new Set(prev);
        next.delete(wave.id);
        return next;
      });
      setWave((prev) => (prev ? { ...prev, waves: prev.waves - 1 } : prev));
    }
  };

  if (loading) {
    return <p className="text-center text-muted">{t("loading")}</p>;
  }

  if (!wave) {
    return (
      <div className="text-center">
        <p className="text-muted">{t("notFound")}</p>
        <Link href="/weekly" className="mt-4 inline-block text-sm text-accent">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  const { title, content } = getWeeklyWaveContent(wave, locale);

  return (
    <article>
      <Link href="/weekly" className="mb-8 inline-block text-sm text-accent hover:opacity-80">
        ← {t("backToList")}
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
          {t("sender")}
        </span>
        <span className="text-muted">{formatDate(wave.published_at)}</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">{title}</h1>
      <div className="whitespace-pre-wrap text-base leading-relaxed text-muted">{content}</div>

      {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleWave}
        disabled={wavedIds.has(wave.id) || storage === "unavailable"}
        className="mt-8 text-sm text-accent transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
      >
        {t("wave")} {wave.waves > 0 && `(${wave.waves})`}
      </button>
    </article>
  );
}
