import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { createMember, getMemberCount } from "@/lib/memberStore";
import { MAX_JOIN_CARD_DECLARATION_LENGTH } from "@/lib/constants";

const MAX_NAME = 40;

export async function GET() {
  try {
    const { count, storage } = await getMemberCount();
    return NextResponse.json({ count, storage });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "신도 수를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const declaration = String(body.declaration ?? "").trim();
    const locale = String(body.locale ?? "").trim();
    const joined_at = String(body.joined_at ?? "").trim();

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
      return NextResponse.json({ error: "locale이 올바르지 않습니다." }, { status: 400 });
    }
    if (!joined_at || Number.isNaN(Date.parse(joined_at))) {
      return NextResponse.json({ error: "joined_at 날짜가 올바르지 않습니다." }, { status: 400 });
    }
    if (name.length > MAX_NAME) {
      return NextResponse.json({ error: `이름은 최대 ${MAX_NAME}자입니다.` }, { status: 400 });
    }
    if (declaration.length > MAX_JOIN_CARD_DECLARATION_LENGTH) {
      return NextResponse.json(
        { error: `선언은 최대 ${MAX_JOIN_CARD_DECLARATION_LENGTH}자입니다.` },
        { status: 400 }
      );
    }

    const { member, storage } = await createMember({
      name: name || undefined,
      declaration: declaration || undefined,
      locale,
      joined_at: new Date(joined_at).toISOString(),
    });

    const { count } = await getMemberCount();
    return NextResponse.json({ member, count, storage }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "입교를 저장하지 못했습니다.";
    const status = message.includes("설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
