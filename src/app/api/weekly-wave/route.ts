import { NextResponse } from "next/server";
import { createWeeklyWave, listWeeklyWaves } from "@/lib/weeklyWaveStore";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TITLE = 120;
const MAX_CONTENT = 8000;

function validatePayload(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const published_at = String(body.published_at ?? "").trim();
  const title_ko = String(body.title_ko ?? "").trim();
  const content_ko = String(body.content_ko ?? "").trim();
  const title_en = String(body.title_en ?? "").trim();
  const content_en = String(body.content_en ?? "").trim();
  const title_ja = String(body.title_ja ?? "").trim();
  const content_ja = String(body.content_ja ?? "").trim();

  if (!slug || !SLUG_RE.test(slug)) {
    return { error: "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }
  if (!published_at || Number.isNaN(Date.parse(published_at))) {
    return { error: "published_at 날짜가 올바르지 않습니다." };
  }

  for (const [label, title, content] of [
    ["ko", title_ko, content_ko],
    ["en", title_en, content_en],
    ["ja", title_ja, content_ja],
  ] as const) {
    if (!title || title.length > MAX_TITLE) {
      return { error: `${label} 제목은 1~${MAX_TITLE}자여야 합니다.` };
    }
    if (!content || content.length > MAX_CONTENT) {
      return { error: `${label} 본문은 1~${MAX_CONTENT}자여야 합니다.` };
    }
  }

  return {
    data: {
      slug,
      published_at: new Date(published_at).toISOString(),
      title_ko,
      content_ko,
      title_en,
      content_en,
      title_ja,
      content_ja,
    },
  };
}

export async function GET() {
  try {
    const { waves, storage } = await listWeeklyWaves();
    return NextResponse.json({ waves, storage });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "주간 파동을 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminSecret = process.env.WEEKLY_WAVE_ADMIN_SECRET;
    const provided = request.headers.get("x-admin-secret");

    if (!adminSecret || provided !== adminSecret) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
    }

    const body = await request.json();
    const validated = validatePayload(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { wave, storage } = await createWeeklyWave(validated.data);
    return NextResponse.json({ wave, storage }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "주간 파동을 저장하지 못했습니다.";
    const status = message.includes("설정되지 않았습니다")
      ? 503
      : message.includes("slug")
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
