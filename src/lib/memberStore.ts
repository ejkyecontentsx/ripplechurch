import { promises as fs } from "fs";
import path from "path";
import { getSupabase, type Member } from "@/lib/supabase";
import { MAX_MEMBER_NUMBER } from "@/lib/memberNumber";

export type MemberStorage = "supabase" | "local" | "unavailable";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "members.json");

export type CreateMemberInput = {
  name?: string;
  declaration?: string;
  locale: string;
  joined_at: string;
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function canUseLocalFallback() {
  return process.env.NODE_ENV === "development";
}

export function getMemberStorage(): MemberStorage {
  if (isSupabaseConfigured()) return "supabase";
  if (canUseLocalFallback()) return "local";
  return "unavailable";
}

async function readLocalMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalMembers(members: Member[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), "utf8");
}

export async function getMemberCount(): Promise<{
  count: number;
  storage: MemberStorage;
}> {
  const storage = getMemberStorage();

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { count, error } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true });

    if (error) throw new Error(error.message);
    return { count: count ?? 0, storage };
  }

  if (storage === "local") {
    const members = await readLocalMembers();
    return { count: members.length, storage };
  }

  return { count: 0, storage };
}

export async function createMember(
  input: CreateMemberInput
): Promise<{ member: Member; storage: MemberStorage }> {
  const storage = getMemberStorage();
  const row = {
    name: input.name?.trim() || null,
    declaration: input.declaration?.trim() || null,
    locale: input.locale,
    joined_at: input.joined_at,
  };

  if (storage === "supabase") {
    const supabase = getSupabase()!;
    const { data, error } = await supabase.from("members").insert(row).select().single();

    if (error) throw new Error(error.message);
    return { member: data, storage };
  }

  if (storage === "local") {
    const members = await readLocalMembers();
    const nextNumber =
      members.reduce((max, item) => Math.max(max, item.member_number ?? 0), 0) + 1;
    if (nextNumber > MAX_MEMBER_NUMBER) {
      throw new Error("신도 번호 한도에 도달했습니다.");
    }

    const member: Member = {
      id: crypto.randomUUID(),
      member_number: nextNumber,
      name: row.name,
      declaration: row.declaration,
      locale: row.locale,
      joined_at: row.joined_at,
      created_at: new Date().toISOString(),
    };
    members.push(member);
    await writeLocalMembers(members);
    return { member, storage };
  }

  throw new Error(
    "신도 저장소가 설정되지 않았습니다. Supabase 환경변수를 등록해 주세요."
  );
}
