import { getTranslations, setRequestLocale } from "next-intl/server";
import WeeklyWavePageClient from "./WeeklyWavePageClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("weeklyTitle") };
}

export default function WeeklyWavePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <WeeklyWavePageClient />;
}
