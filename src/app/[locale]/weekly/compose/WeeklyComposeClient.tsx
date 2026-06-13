"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

type LocaleFields = {
  title: string;
  content: string;
};

const emptyLocale = (): LocaleFields => ({ title: "", content: "" });

export default function WeeklyComposeClient() {
  const t = useTranslations("weeklyCompose");
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [ko, setKo] = useState(emptyLocale);
  const [en, setEn] = useState(emptyLocale);
  const [ja, setJa] = useState(emptyLocale);
  const [adminSecret, setAdminSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/weekly" className="text-sm text-accent hover:opacity-80">
          ← {t("backToList")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
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

        <div>
          <label htmlFor="adminSecret" className="mb-1 block text-sm font-medium">
            {t("adminSecretLabel")}
          </label>
          <input
            id="adminSecret"
            type="password"
            required
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

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
