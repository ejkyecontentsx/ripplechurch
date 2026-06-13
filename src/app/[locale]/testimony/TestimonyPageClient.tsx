"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Testimony } from "@/lib/supabase";
import type { TestimonyStorage } from "@/lib/testimonyStore";
import { getDateLocale } from "@/lib/dateLocale";

function getWavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("waved-testimonies");
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markWaved(id: string) {
  const ids = getWavedIds();
  ids.add(id);
  localStorage.setItem("waved-testimonies", JSON.stringify(Array.from(ids)));
}

export default function TestimonyPageClient() {
  const t = useTranslations("testimony");
  const locale = useLocale();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [storage, setStorage] = useState<TestimonyStorage | null>(null);
  const isDev = process.env.NODE_ENV === "development";
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wavedIds, setWavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(getDateLocale(locale), {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale]
  );

  const fetchTestimonies = useCallback(async () => {
    try {
      const res = await fetch("/api/testimony");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("fetchError"));
        return;
      }
      setTestimonies(data.testimonies ?? []);
      setStorage(data.storage ?? "unavailable");
    } catch {
      setError(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setWavedIds(getWavedIds());
    fetchTestimonies();
  }, [fetchTestimonies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    setError("");

    const optimistic: Testimony = {
      id: crypto.randomUUID(),
      nickname: nickname.trim(),
      content: content.trim(),
      waves: 0,
      created_at: new Date().toISOString(),
    };

    setTestimonies((prev) => [optimistic, ...prev]);
    setNickname("");
    setContent("");

    try {
      const res = await fetch("/api/testimony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: optimistic.nickname,
          content: optimistic.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? t("submitError"));
      }

      setTestimonies((prev) =>
        prev.map((item) => (item.id === optimistic.id ? data.testimony : item))
      );
      setStorage(data.storage ?? storage);
    } catch (err) {
      setTestimonies((prev) => prev.filter((item) => item.id !== optimistic.id));
      setError(err instanceof Error ? err.message : t("submitErrorRetry"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWave = async (id: string) => {
    if (wavedIds.has(id)) return;

    setWavedIds((prev) => new Set([...Array.from(prev), id]));
    markWaved(id);
    setTestimonies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, waves: item.waves + 1 } : item))
    );

    try {
      const res = await fetch(`/api/testimony/${id}/wave`, { method: "PATCH" });
      if (!res.ok) {
        throw new Error("failed");
      }
      const updated = await res.json();
      setTestimonies((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch {
      setWavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setTestimonies((prev) =>
        prev.map((item) => (item.id === id ? { ...item, waves: item.waves - 1 } : item))
      );
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold md:text-3xl">{t("title")}</h1>

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

      <form onSubmit={handleSubmit} className="mb-12 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="mb-4">
          <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-foreground">
            {t("nickname")}
          </label>
          <input
            id="nickname"
            type="text"
            maxLength={20}
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("nicknamePlaceholder")}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-foreground">
            {t("content")}
          </label>
          <textarea
            id="content"
            maxLength={200}
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-1 text-right text-xs text-muted">{content.length}/200</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || loading || storage === "unavailable"}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>

      {loading ? (
        <p className="text-center text-muted">{t("loading")}</p>
      ) : testimonies.length === 0 ? (
        <p className="text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-foreground">{item.nickname}</span>
                <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">{item.content}</p>
              <button
                type="button"
                onClick={() => handleWave(item.id)}
                disabled={wavedIds.has(item.id) || storage === "unavailable"}
                className="self-start text-sm text-accent transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
              >
                {t("wave")} {item.waves > 0 && `(${item.waves})`}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
