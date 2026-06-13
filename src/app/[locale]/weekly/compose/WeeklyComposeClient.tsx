"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

type LocaleFields = {
  title: string;
  content: string;
};

const AUTH_KEY = "weekly-compose-auth";

const emptyLocale = (): LocaleFields => ({ title: "", content: "" });

export default function WeeklyComposeClient() {
  const t = useTranslations("weeklyCompose");
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [gateSecret, setGateSecret] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState("");
  const [slug, setSlug] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [ko, setKo] = useState(emptyLocale);
  const [en, setEn] = useState(emptyLocale);
  const [ja, setJa] = useState(emptyLocale);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored) {
        setAdminSecret(stored);
        setAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateLoading(true);
    setGateError("");

    try {
      const res = await fetch("/api/weekly-wave/auth", {
        method: "POST",
        headers: { "x-admin-secret": gateSecret },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? t("gateError"));
      }

      sessionStorage.setItem(AUTH_KEY, gateSecret);
      setAdminSecret(gateSecret);
      setAuthenticated(true);
      setGateSecret("");
    } catch (err) {
      setGateError(err instanceof Error ? err.message : t("gateError"));
    } finally {
      setGateLoading(false);
    }
  };

  const lock = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setAdminSecret("");
    setGateSecret("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/weekly-wave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          slug: slug || publishedAt,
          published_at: publishedAt,
          title_ko: ko.title,
          content_ko: ko.content,
          title_en: en.title,
          content_en: en.content,
          title_ja: ja.title,
          content_ja: ja.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          lock();
        }
        throw new Error(data.error ?? t("submitError"));
      }

      setSuccess(t("submitSuccess"));
      router.push(`/weekly/${data.wave.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderLocaleFields = (
    label: string,
    fields: LocaleFields,
    setFields: (next: LocaleFields) => void
  ) => (
    <fieldset className="rounded-xl border border-gray-100 bg-gray-50 p-5">
      <legend className="px-1 text-sm font-semibold text-foreground">{label}</legend>
      <div className="mb-4 mt-2">
        <label className="mb-1 block text-sm font-medium">{t("titleLabel")}</label>
        <input
          type="text"
          required
          maxLength={120}
          value={fields.title}
          onChange={(e) => setFields({ ...fields, title: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("contentLabel")}</label>
        <textarea
          required
          rows={8}
          maxLength={8000}
          value={fields.content}
          onChange={(e) => setFields({ ...fields, content: e.target.value })}
          className="w-full resize-y rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-right text-xs text-muted">{fields.content.length}/8000</p>
      </div>
    </fieldset>
  );

  if (!authenticated) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="mb-1 text-center text-xs font-medium uppercase tracking-wider text-accent">
            {t("gateBadge")}
          </p>
          <h1 className="text-center text-xl font-semibold">{t("gateTitle")}</h1>
          <p className="mt-2 text-center text-sm text-muted">{t("gateDescription")}</p>

          <form onSubmit={unlock} className="mt-8 flex flex-col gap-4">
            <div>
              <label htmlFor="gateSecret" className="mb-1 block text-sm font-medium">
                {t("gateSecretLabel")}
              </label>
              <input
                id="gateSecret"
                type="password"
                required
                autoFocus
                value={gateSecret}
                onChange={(e) => setGateSecret(e.target.value)}
                placeholder={t("gateSecretPlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {gateError && <p className="text-sm text-red-500">{gateError}</p>}

            <button
              type="submit"
              disabled={gateLoading}
              className="rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {gateLoading ? t("gateLoading") : t("gateSubmit")}
            </button>
          </form>

          <Link
            href="/weekly"
            className="mt-6 block text-center text-sm text-muted hover:text-accent"
          >
            ← {t("backToList")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/weekly" className="text-sm text-accent hover:opacity-80">
            ← {t("backToList")}
          </Link>
          <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={lock}
          className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          {t("lock")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="publishedAt" className="mb-1 block text-sm font-medium">
              {t("publishedAtLabel")}
            </label>
            <input
              id="publishedAt"
              type="date"
              required
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              {t("slugLabel")}
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {renderLocaleFields("한국어", ko, setKo)}
        {renderLocaleFields("English", en, setEn)}
        {renderLocaleFields("日本語", ja, setJa)}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}
