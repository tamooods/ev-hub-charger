import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabaseConfig(): boolean {
  return Boolean(url && anonKey);
}

export function hasServiceRole(): boolean {
  return Boolean(url && serviceKey);
}

export function createBrowserClient(): SupabaseClient {
  return createClient(url, anonKey);
}

export function createServerClient(): SupabaseClient {
  return createClient(url, serviceKey);
}

export type { SupabaseClient };
