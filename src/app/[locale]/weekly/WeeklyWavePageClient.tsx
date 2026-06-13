"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getWeeklyWaveContent, type WeeklyWave } from "@/lib/supabase";
import type { WeeklyWaveStorage } from "@/lib/weeklyWaveStore";
import { getPlainPreview } from "@/lib/richTextUtils";
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

export default function WeeklyWavePageClient() {
  const t = useTranslations("weekly");
  const locale = useLocale();
  const isDev = process.env.NODE_ENV === "development";
  const [waves, setWaves] = useState<WeeklyWave[]>([]);
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

  const fetchWaves = useCallback(async () => {
    try {
      const res = await fetch("/api/weekly-wave");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("fetchError"));
        return;
      }
      setWaves(data.waves ?? []);
      setStorage(data.storage ?? "unavailable");
    } catch {
      setError(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setWavedIds(getWavedIds());
    fetchWaves();
  }, [fetchWaves]);

  const handleWave = async (id: string) => {
    if (wavedIds.has(id)) return;

    setWavedIds((prev) => new Set([...Array.from(prev), id]));
    markWaved(id);
    setWaves((prev) =>
      prev.map((item) => (item.id === id ? { ...item, waves: item.waves + 1 } : item))
    );

    try {
      const res = await fetch(`/api/weekly-wave/${id}/wave`, { method: "PATCH" });
      if (!res.ok) throw new Error("failed");
      const updated = await res.json();
      setWaves((prev) =>
        prev.map((item) => (item.id === id ? { ...item, waves: updated.waves } : item))
      );
    } catch {
      setWavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setWaves((prev) =>
        prev.map((item) => (item.id === id ? { ...item, waves: item.waves - 1 } : item))
      );
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold md:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </div>

      {!loading && isDev && storage === "unavailable" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("devUnavailable")}
        </div>
      )}

      {!loading && isDev && storage === "local" && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          {t("devLocal")}
        </div>
      )}

      {error && <p className="mb-6 text-center text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-center text-muted">{t("loading")}</p>
      ) : waves.length === 0 ? (
        <p className="text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {waves.map((item, index) => {
            const { title, content } = getWeeklyWaveContent(item, locale);
            const preview = getPlainPreview(content);

            return (
              <article
                key={item.id}
                className={`rounded-xl border bg-white p-6 shadow-sm ${
                  index === 0 ? "border-accent/30 ring-1 ring-accent/10" : "border-gray-100"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
                    {t("sender")}
                  </span>
                  <span className="text-muted">{formatDate(item.published_at)}</span>
                  {index === 0 && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                      {t("latest")}
                    </span>
                  )}
                </div>

                <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
                <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {preview}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/weekly/${item.slug}`}
                    className="text-sm font-medium text-accent hover:opacity-80"
                  >
                    {t("readMore")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleWave(item.id)}
                    disabled={wavedIds.has(item.id) || storage === "unavailable"}
                    className="text-sm text-accent transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
                  >
                    {t("wave")} {item.waves > 0 && `(${item.waves})`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
