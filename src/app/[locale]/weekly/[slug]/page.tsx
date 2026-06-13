import { getTranslations, setRequestLocale } from "next-intl/server";
import WeeklyWaveDetailClient from "./WeeklyWaveDetailClient";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: `${slug} — ${t("weeklyTitle")}` };
}

export default function WeeklyWaveDetailPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <WeeklyWaveDetailClient slug={slug} />
    </section>
  );
}
