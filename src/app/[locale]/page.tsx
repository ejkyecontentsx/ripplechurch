import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import RippleLogo from "@/components/RippleLogo";
import { getWeeklyWaveContent } from "@/lib/supabase";
import { listWeeklyWaves } from "@/lib/weeklyWaveStore";
import { getMemberCount } from "@/lib/memberStore";
import MemberCount from "@/components/MemberCount";
import { getPlainPreview } from "@/lib/richTextUtils";
import { getDateLocale } from "@/lib/dateLocale";

type Props = {
  params: { locale: string };
};

export const revalidate = 60;

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tWeekly = await getTranslations("weekly");
  const tLogo = await getTranslations("logo");

  let latest;
  try {
    const result = await listWeeklyWaves();
    latest = result.waves[0];
  } catch {
    latest = undefined;
  }

  const latestContent = latest ? getWeeklyWaveContent(latest, locale) : null;

  let memberCount = 0;
  try {
    const result = await getMemberCount();
    memberCount = result.count;
  } catch {
    memberCount = 0;
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
      <div className="animate-fade-in w-full max-w-md">
        <RippleLogo
          className="mx-auto w-full max-w-sm"
          animated
          subtitle={tLogo("subtitle")}
        />
      </div>

      <h1 className="mt-10 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {t("headline")}
      </h1>
      <p className="mt-3 text-lg text-muted">{t("subheadline")}</p>
      <MemberCount count={memberCount} className="mt-4" />

      {latest && latestContent && (
        <div className="mt-10 w-full rounded-xl border border-accent/20 bg-white p-6 text-left shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
              {tWeekly("sender")}
            </span>
            <span className="text-muted">
              {new Date(latest.published_at).toLocaleDateString(getDateLocale(locale), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">{latestContent.title}</h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
            {getPlainPreview(latestContent.content)}
          </p>
          <Link
            href={`/weekly/${latest.slug}`}
            className="mt-4 inline-block text-sm font-medium text-accent hover:opacity-80"
          >
            {tWeekly("readMore")} →
          </Link>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/scripture"
          className="rounded-full border border-accent bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("readScripture")}
        </Link>
        <Link
          href="/weekly"
          className="rounded-full border border-foreground px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
        >
          {t("readWeekly")}
        </Link>
        <Link
          href="/join"
          className="rounded-full border border-gray-200 px-8 py-3 text-sm font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          {t("join")}
        </Link>
      </div>
    </section>
  );
}
