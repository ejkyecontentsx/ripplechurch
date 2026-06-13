import { promises as fs } from "fs";
import path from "path";
import {
  getSupabase,
  getSupabaseAdmin,
  type WeeklyWave,
} from "@/lib/supabase";

export type WeeklyWaveStorage = "supabase" | "local" | "unavailable";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "weekly-waves.json");

export type CreateWeeklyWaveInput = {
  slug: string;
  published_at: string;
  title_ko: string;
  content_ko: string;
  title_en: string;
  content_en: string;
  title_ja: string;
  content_ja: string;
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function canUseLocalFallback() {
  return process.env.NODE_ENV === "development";
}

export function getWeeklyWaveStorage(): WeeklyWaveStorage {
  if (isSupabaseConfigured()) return "supabase";
  if (canUseLocalFallback()) return "local";
  return "unavailable";
}

async function readLocalWeeklyWaves(): Promise<WeeklyWave[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalWeeklyWaves(waves: WeeklyWave[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(waves, null, 2), "utf8");
}

export async function listWeeklyWaves(): Promise<{
  waves: WeeklyWave[];
  storage: WeeklyWaveStorage;
}> {
  const storage = getWeeklyWaveStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data, error } = await supabase
      .from("weekly_waves")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { waves: data ?? [], storage };
  }

  if (storage === "local") {
    const waves = await readLocalWeeklyWaves();
    waves.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    return { waves, storage };
  }

  return { waves: [], storage };
}

export async function getWeeklyWaveBySlug(
  slug: string
): Promise<{ wave: WeeklyWave | null; storage: WeeklyWaveStorage }> {
  const storage = getWeeklyWaveStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data, error } = await supabase
      .from("weekly_waves")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { wave: data, storage };
  }

  if (storage === "local") {
    const waves = await readLocalWeeklyWaves();
    return { wave: waves.find((item) => item.slug === slug) ?? null, storage };
  }

  return { wave: null, storage };
}

export async function createWeeklyWave(
  input: CreateWeeklyWaveInput
): Promise<{ wave: WeeklyWave; storage: WeeklyWaveStorage }> {
  const storage = getWeeklyWaveStorage();

  if (storage === "supabase") {
    const supabase = getSupabaseAdmin() ?? getSupabase()!;
    const { data, error } = await supabase
      .from("weekly_waves")
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { wave: data, storage };
  }

  if (storage === "local") {
    const waves = await readLocalWeeklyWaves();
    if (waves.some((item) => item.slug === input.slug)) {
      throw new Error("이미 사용 중인 slug입니다.");
    }

    const wave: WeeklyWave = {
      id: crypto.randomUUID(),
      waves: 0,
      created_at: new Date().toISOString(),
      ...input,
    };
    waves.unshift(wave);
    await writeLocalWeeklyWaves(waves);
    return { wave, storage };
  }

  throw new Error(
    "주간 파동 저장소가 설정되지 않았습니다. Supabase 환경변수를 등록해 주세요."
  );
}

export async function incrementWeeklyWave(
  id: string
): Promise<{ wave: WeeklyWave; storage: WeeklyWaveStorage }> {
  const storage = getWeeklyWaveStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data: current, error: fetchError } = await supabase
      .from("weekly_waves")
      .select("waves")
      .eq("id", id)
      .single();

    if (fetchError || !current) throw new Error("주간 파동을 찾을 수 없습니다.");

    const { data, error } = await supabase
      .from("weekly_waves")
      .update({ waves: current.waves + 1 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { wave: data, storage };
  }

  if (storage === "local") {
    const waves = await readLocalWeeklyWaves();
    const index = waves.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("주간 파동을 찾을 수 없습니다.");

    const updated = { ...waves[index], waves: waves[index].waves + 1 };
    waves[index] = updated;
    await writeLocalWeeklyWaves(waves);
    return { wave: updated, storage };
  }

  throw new Error(
    "주간 파동 저장소가 설정되지 않았습니다. Supabase 환경변수를 등록해 주세요."
  );
}
