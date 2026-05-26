import { COMMANDMENTS } from "@/lib/constants";

export const metadata = {
  title: "소개 — Ripple Church",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-12 text-center text-2xl font-semibold md:text-3xl">소개</h1>

      <div className="space-y-12">
        <article>
          <h2 className="text-xl font-semibold text-accent">우리는 무엇인가</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Ripple Church는 밈 종교처럼 보이지만, 그 이면에는 현대인의 외로움과 SNS
            피로감에 대한 진짜 위로가 있습니다. 우리는 웃기기 위해 존재하지 않습니다.
            파동이라는 은유로, 서로에게 닿는 방법을 이야기합니다.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">파동이란</h2>
          <p className="mt-4 leading-relaxed text-muted">
            인간의 뇌에서 발생하는 아직 이름 붙여지지 않은 웨이브. 생각, 감정, 직감—이
            모든 것은 파동입니다. 육감은 아직 측정되지 않은 감각이고, 관계는 파동이
            맞닿는 순간입니다. 우리는 이 파동이 실재한다고 믿습니다.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">왜 지금인가</h2>
          <p className="mt-4 leading-relaxed text-muted">
            SNS 시대, 우리는 끊임없이 파동을 방출하지만 정작 맞닿는 파동은 점점
            줄어듭니다. 화면 너머의 관계, 읽씹, 좋아요—파동 없는 연결에 감정을
            낭비하고 있지는 않습니까?
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold text-accent">우리의 믿음</h2>
          <ul className="mt-4 space-y-2">
            {COMMANDMENTS.map((cmd) => (
              <li key={cmd.number} className="text-muted">
                <span className="font-medium text-accent">제 {cmd.number}계</span>
                {" — "}
                {cmd.text}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
