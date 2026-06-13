import { NextResponse } from "next/server";
import { incrementTestimonyWave } from "@/lib/testimonyStore";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { testimony } = await incrementTestimonyWave(params.id);
    return NextResponse.json(testimony);
  } catch (error) {
    const message = error instanceof Error ? error.message : "공감 파동을 보내지 못했습니다.";
    const status = message.includes("찾을 수 없습니다")
      ? 404
      : message.includes("설정되지 않았습니다")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
