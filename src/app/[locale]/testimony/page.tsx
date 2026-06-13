import { getTranslations, setRequestLocale } from "next-intl/server";
import TestimonyPageClient from "./TestimonyPageClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("testimonyTitle") };
}

export default function TestimonyPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <TestimonyPageClient />;
}
