import "server-only";

import { cacheTag, cacheLife } from "next/cache";

import { createServerClient, hasSupabaseConfig } from "@/lib/supabase";
import { detectBrand } from "@/lib/brands";
import type { Region, Station, StationInsert } from "@/lib/types";

export async function getApprovedStations(): Promise<Station[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("stations");

  if (!hasSupabaseConfig()) {
    return [];
  }

  const client = createServerClient();
  const { data, error } = await client
    .from("stations")
    .select("*")
    .eq("status", "approved")
    .order("name");

  if (error) {
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    lat: row.lat as number,
    lng: row.lng as number,
    kw: row.kw as number | null,
    amp: row.amp as number | null,
    slots: row.slots as number | null,
    region: row.region as Region | null,
    brand: row.brand as string | null,
    source: row.source as Station["source"],
    status: row.status as Station["status"],
  }));
}

export async function submitStation(
  input: Omit<StationInsert, "source" | "status" | "brand">
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!hasSupabaseConfig()) {
    return { ok: false, message: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase" };
  }

  const brand = detectBrand(input.name)?.id ?? null;

  const client = createServerClient();
  const { data, error } = await client
    .from("stations")
    .insert({
      name: input.name,
      lat: input.lat,
      lng: input.lng,
      kw: input.kw,
      amp: input.amp,
      slots: input.slots,
      region: input.region,
      brand,
      source: "user",
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
  }

  return { ok: true, id: data.id as string };
}

export async function updateStationStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseConfig()) {
    return { ok: false, message: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase" };
  }

  const client = createServerClient();
  const { error } = await client
    .from("stations")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { ok: false, message: "อัปเดตไม่สำเร็จ กรุณาลองใหม่" };
  }

  return { ok: true };
}

export async function getPendingStations(): Promise<Station[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const client = createServerClient();
  const { data, error } = await client
    .from("stations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    lat: row.lat as number,
    lng: row.lng as number,
    kw: row.kw as number | null,
    amp: row.amp as number | null,
    slots: row.slots as number | null,
    region: row.region as Region | null,
    brand: row.brand as string | null,
    source: row.source as Station["source"],
    status: row.status as Station["status"],
  }));
}
