import { getTranslations, setRequestLocale } from "next-intl/server";
import JoinPageClient from "./JoinPageClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("joinTitle") };
}

export default function JoinPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <JoinPageClient />;
}
