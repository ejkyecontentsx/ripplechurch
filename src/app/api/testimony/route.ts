import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("testimonies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const nickname = String(body.nickname ?? "").trim();
  const content = String(body.content ?? "").trim();

  if (!nickname || nickname.length > 20) {
    return NextResponse.json({ error: "Invalid nickname" }, { status: 400 });
  }
  if (!content || content.length > 200) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("testimonies")
    .insert({ nickname, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
