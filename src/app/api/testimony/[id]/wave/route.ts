import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { data: current, error: fetchError } = await supabase
    .from("testimonies")
    .select("waves")
    .eq("id", params.id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("testimonies")
    .update({ waves: current.waves + 1 })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
