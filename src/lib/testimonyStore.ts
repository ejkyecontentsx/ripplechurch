import { promises as fs } from "fs";
import path from "path";
import { getSupabase, type Testimony } from "@/lib/supabase";

export type TestimonyStorage = "supabase" | "local" | "unavailable";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "testimonies.json");

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function canUseLocalFallback() {
  return process.env.NODE_ENV === "development";
}

export function getTestimonyStorage(): TestimonyStorage {
  if (isSupabaseConfigured()) return "supabase";
  if (canUseLocalFallback()) return "local";
  return "unavailable";
}

async function readLocalTestimonies(): Promise<Testimony[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalTestimonies(testimonies: Testimony[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(testimonies, null, 2), "utf8");
}

export async function listTestimonies(): Promise<{
  testimonies: Testimony[];
  storage: TestimonyStorage;
}> {
  const storage = getTestimonyStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data, error } = await supabase
      .from("testimonies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { testimonies: data ?? [], storage };
  }

  if (storage === "local") {
    return { testimonies: await readLocalTestimonies(), storage };
  }

  return { testimonies: [], storage };
}

export async function createTestimony(
  nickname: string,
  content: string
): Promise<{ testimony: Testimony; storage: TestimonyStorage }> {
  const storage = getTestimonyStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data, error } = await supabase
      .from("testimonies")
      .insert({ nickname, content })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { testimony: data, storage };
  }

  if (storage === "local") {
    const testimonies = await readLocalTestimonies();
    const testimony: Testimony = {
      id: crypto.randomUUID(),
      nickname,
      content,
      waves: 0,
      created_at: new Date().toISOString(),
    };
    testimonies.unshift(testimony);
    await writeLocalTestimonies(testimonies);
    return { testimony, storage };
  }

  throw new Error(
    "간증 저장소가 설정되지 않았습니다. Supabase 환경변수를 등록해 주세요."
  );
}

export async function incrementTestimonyWave(
  id: string
): Promise<{ testimony: Testimony; storage: TestimonyStorage }> {
  const storage = getTestimonyStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data: current, error: fetchError } = await supabase
      .from("testimonies")
      .select("waves")
      .eq("id", id)
      .single();

    if (fetchError || !current) throw new Error("간증을 찾을 수 없습니다.");

    const { data, error } = await supabase
      .from("testimonies")
      .update({ waves: current.waves + 1 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { testimony: data, storage };
  }

  if (storage === "local") {
    const testimonies = await readLocalTestimonies();
    const index = testimonies.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("간증을 찾을 수 없습니다.");

    const updated = { ...testimonies[index], waves: testimonies[index].waves + 1 };
    testimonies[index] = updated;
    await writeLocalTestimonies(testimonies);
    return { testimony: updated, storage };
  }

  throw new Error(
    "간증 저장소가 설정되지 않았습니다. Supabase 환경변수를 등록해 주세요."
  );
}
