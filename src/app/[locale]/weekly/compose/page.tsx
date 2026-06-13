import { getTranslations, setRequestLocale } from "next-intl/server";
import WeeklyComposeClient from "./WeeklyComposeClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("weeklyComposeTitle") };
}

export default function WeeklyComposePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <WeeklyComposeClient />;
}
