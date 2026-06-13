import { NextResponse } from "next/server";

function isAuthorized(request: Request) {
  const adminSecret = process.env.WEEKLY_WAVE_ADMIN_SECRET;
  const provided = request.headers.get("x-admin-secret");
  return Boolean(adminSecret && provided === adminSecret);
}

export async function POST(request: Request) {
  if (!process.env.WEEKLY_WAVE_ADMIN_SECRET) {
    return NextResponse.json(
      { error: "관리자 비밀키가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "비밀키가 올바르지 않습니다." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
