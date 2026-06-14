import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface Testimony {
  id: string;
  nickname: string;
  content: string;
  waves: number;
  created_at: string;
}

export interface Member {
  id: string;
  member_number: number;
  name: string | null;
  declaration: string | null;
  locale: string;
  joined_at: string;
  created_at: string;
}

export interface WeeklyWave {
  id: string;
  slug: string;
  published_at: string;
  title_ko: string;
  content_ko: string;
  title_en: string;
  content_en: string;
  title_ja: string;
  content_ja: string;
  waves: number;
  created_at: string;
}

export type WeeklyWaveLocale = "ko" | "en" | "ja";

export function getWeeklyWaveContent(wave: WeeklyWave, locale: string) {
  const key: WeeklyWaveLocale =
    locale === "ko" ? "ko" : locale === "ja" ? "ja" : "en";
  return {
    title: wave[`title_${key}`],
    content: wave[`content_${key}`],
  };
}

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey);
}
