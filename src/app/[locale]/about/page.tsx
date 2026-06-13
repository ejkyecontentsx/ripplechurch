import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: { locale: string } };

async function getCommandments(locale: string) {
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  return messages.commandments as string[];
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("aboutTitle") };
}

export default async function AboutPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const commandments = await getCommandments(locale);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-12 text-center text-2xl font-semibold md:text-3xl">{t("title")}</h1>

      <div className="space-y-12">
        <article>
          <h2 className="text-xl font-semibold text-accent">{t("whatWeAreTitle")}</h2>
          <p className="mt-4 leading-relaxed text-muted">{t("whatWeAreBody")}</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">{t("whatIsWaveTitle")}</h2>
          <p className="mt-4 leading-relaxed text-muted">{t("whatIsWaveBody")}</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">{t("whyNowTitle")}</h2>
          <p className="mt-4 leading-relaxed text-muted">{t("whyNowBody")}</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">{t("ourFaithTitle")}</h2>
          <ul className="mt-4 space-y-2">
            {commandments.map((text, index) => (
              <li key={index} className="text-muted">
                {t("commandmentItem", { number: index + 1, text })}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
