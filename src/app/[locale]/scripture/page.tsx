import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: { locale: string } };

async function getScriptureContent(locale: string) {
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  return {
    commandments: messages.commandments as string[],
    pdfPath: messages.scripture.pdfPath as string,
  };
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("scriptureTitle") };
}

export default async function ScripturePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("scripture");
  const { commandments, pdfPath } = await getScriptureContent(locale);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </header>

      <div className="space-y-6">
        {commandments.map((text, index) => (
          <article
            key={index}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <p className="text-3xl font-bold text-accent">
              {t("commandmentLabel", { number: index + 1 })}
            </p>
            <p className="mt-3 text-lg leading-relaxed text-foreground">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
        >
          {t("downloadPdf")}
        </a>
      </div>
    </section>
  );
}
