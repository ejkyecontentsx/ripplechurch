import { NextResponse } from "next/server";
import { createTestimony, listTestimonies } from "@/lib/testimonyStore";

export async function GET() {
  try {
    const { testimonies, storage } = await listTestimonies();
    return NextResponse.json({ testimonies, storage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "간증을 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nickname = String(body.nickname ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!nickname || nickname.length > 20) {
      return NextResponse.json({ error: "닉네임은 1~20자여야 합니다." }, { status: 400 });
    }
    if (!content || content.length > 200) {
      return NextResponse.json({ error: "간증은 1~200자여야 합니다." }, { status: 400 });
    }

    const { testimony, storage } = await createTestimony(nickname, content);
    return NextResponse.json({ testimony, storage }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "간증을 저장하지 못했습니다.";
    const status = message.includes("설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
