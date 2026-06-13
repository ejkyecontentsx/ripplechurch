import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import RippleLogo from "@/components/RippleLogo";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tLogo = await getTranslations("logo");

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

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/scripture"
          className="rounded-full border border-accent bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("readScripture")}
        </Link>
        <Link
          href="/join"
          className="rounded-full border border-foreground px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
        >
          {t("join")}
        </Link>
      </div>
    </section>
  );
}
