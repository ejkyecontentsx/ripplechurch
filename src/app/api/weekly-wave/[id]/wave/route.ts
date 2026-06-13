import { NextResponse } from "next/server";
import { incrementWeeklyWave } from "@/lib/weeklyWaveStore";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { wave, storage } = await incrementWeeklyWave(params.id);
    return NextResponse.json({ ...wave, storage });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "공감 파동을 보내지 못했습니다.";
    const status = message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
