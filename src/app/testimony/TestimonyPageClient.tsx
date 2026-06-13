"use client";

import { useCallback, useEffect, useState } from "react";
import type { Testimony } from "@/lib/supabase";
import type { TestimonyStorage } from "@/lib/testimonyStore";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [storage, setStorage] = useState<TestimonyStorage>("unavailable");
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wavedIds, setWavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const fetchTestimonies = useCallback(async () => {
    try {
      const res = await fetch("/api/testimony");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "간증을 불러오지 못했습니다.");
        return;
      }
      setTestimonies(data.testimonies ?? []);
      setStorage(data.storage ?? "unavailable");
    } catch {
      setError("간증을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

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
        throw new Error(data.error ?? "간증을 보내지 못했습니다.");
      }

      setTestimonies((prev) =>
        prev.map((t) => (t.id === optimistic.id ? data.testimony : t))
      );
      setStorage(data.storage ?? storage);
    } catch (err) {
      setTestimonies((prev) => prev.filter((t) => t.id !== optimistic.id));
      setError(
        err instanceof Error ? err.message : "간증을 보내지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWave = async (id: string) => {
    if (wavedIds.has(id)) return;

    setWavedIds((prev) => new Set([...Array.from(prev), id]));
    markWaved(id);
    setTestimonies((prev) =>
      prev.map((t) => (t.id === id ? { ...t, waves: t.waves + 1 } : t))
    );

    try {
      const res = await fetch(`/api/testimony/${id}/wave`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "failed");
      }
      const updated = await res.json();
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch {
      setWavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, waves: t.waves - 1 } : t))
      );
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold md:text-3xl">간증</h1>

      {storage === "unavailable" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          간증 저장소(Supabase)가 연결되지 않았습니다. Vercel 환경변수에{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를
          등록하고 Supabase에서 <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>을
          실행해 주세요.
        </div>
      )}

      {storage === "local" && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          로컬 개발 모드: 간증이 <code className="rounded bg-blue-100 px-1">data/testimonies.json</code>에
          저장됩니다. 배포 환경에서는 Supabase 설정이 필요합니다.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-12 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="mb-4">
          <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-foreground">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            maxLength={20}
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (최대 20자)"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-foreground">
            간증
          </label>
          <textarea
            id="content"
            maxLength={200}
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="당신의 파동을 적어주세요"
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-1 text-right text-xs text-muted">{content.length}/200</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || storage === "unavailable"}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {submitting ? "보내는 중..." : "파동 보내기"}
        </button>
      </form>

      {loading ? (
        <p className="text-center text-muted">파동을 불러오는 중...</p>
      ) : testimonies.length === 0 ? (
        <p className="text-center text-muted">아직 간증이 없습니다. 첫 파동을 내보세요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-foreground">{t.nickname}</span>
                <span className="text-xs text-muted">{formatDate(t.created_at)}</span>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">{t.content}</p>
              <button
                type="button"
                onClick={() => handleWave(t.id)}
                disabled={wavedIds.has(t.id) || storage === "unavailable"}
                className="self-start text-sm text-accent transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
              >
                공감 파동 보내기 ⚡ {t.waves > 0 && `(${t.waves})`}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
