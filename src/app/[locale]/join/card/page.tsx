import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import JoinCardViewerClient from "./JoinCardViewerClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("joinCardTitle") };
}

export default function JoinCardPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <Suspense>
      <JoinCardViewerClient />
    </Suspense>
  );
}
