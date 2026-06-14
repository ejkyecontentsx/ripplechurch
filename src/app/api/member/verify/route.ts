import { NextResponse } from "next/server";
import { verifyMember } from "@/lib/memberStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member_number = Number(body.memberNumber ?? body.member_number);
    const name = String(body.name ?? "").trim();
    const declaration = String(body.declaration ?? "").trim();
    const joined_at = String(body.joinedAt ?? body.joined_at ?? "").trim();

    if (!Number.isInteger(member_number) || member_number <= 0) {
      return NextResponse.json({ valid: false, error: "신도 번호가 올바르지 않습니다." }, { status: 400 });
    }
    if (!joined_at || Number.isNaN(Date.parse(joined_at))) {
      return NextResponse.json({ valid: false, error: "입교일이 올바르지 않습니다." }, { status: 400 });
    }

    const { valid, storage } = await verifyMember({
      member_number,
      name: name || undefined,
      declaration: declaration || undefined,
      joined_at: new Date(joined_at).toISOString(),
    });

    return NextResponse.json({ valid, storage });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "신도 확인에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
