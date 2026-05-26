import Link from "next/link";
import RippleLogo from "@/components/RippleLogo";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
      <div className="animate-fade-in w-full max-w-md">
        <RippleLogo className="mx-auto w-full max-w-sm" animated />
      </div>

      <h1 className="mt-10 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        인간은 파동을 방출하고 감지한다
      </h1>
      <p className="mt-3 text-lg text-muted">선한 파동을 만들어라</p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/scripture"
          className="rounded-full border border-accent bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          경전 읽기
        </Link>
        <Link
          href="/join"
          className="rounded-full border border-foreground px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
        >
          입교하기
        </Link>
      </div>
    </section>
  );
}
