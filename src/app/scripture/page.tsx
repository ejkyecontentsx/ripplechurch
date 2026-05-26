import Link from "next/link";
import { COMMANDMENTS } from "@/lib/constants";

export const metadata = {
  title: "파동의 서 — Ripple Church",
};

export default function ScripturePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          파동의 서
        </h1>
        <p className="mt-2 text-muted">Book of Waves</p>
      </header>

      <div className="space-y-6">
        {COMMANDMENTS.map((cmd) => (
          <article
            key={cmd.number}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <p className="text-3xl font-bold text-accent">제 {cmd.number}계</p>
            <p className="mt-3 text-lg leading-relaxed text-foreground">{cmd.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/경전.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
        >
          경전 전문 다운로드 (PDF)
        </Link>
      </div>
    </section>
  );
}
