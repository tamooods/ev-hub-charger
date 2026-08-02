import { createClient } from "@supabase/supabase-js";

const CLUBCHARGE_API = "https://clubcharge.net/wp-json/ev-system/all-data";
const VALID_REGIONS = new Set(["central", "isan", "north", "east", "south"]);

export interface SeedResult {
  fetched: number;
  inserted: number;
}

function toNumberOrNull(value: unknown): number | null {
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function normalize(row: Record<string, unknown>) {
  const lat = toNumberOrNull(row.lat);
  const lng = toNumberOrNull(row.lng);
  const region = VALID_REGIONS.has(String(row.hubregion))
    ? String(row.hubregion)
    : null;

  if (lat === null || lng === null || lat === 0 || lng === 0) {
    return null;
  }

  return {
    name: String(row.name ?? "").trim(),
    lat,
    lng,
    kw: toNumberOrNull(row.kW),
    amp: toNumberOrNull(row.Amp),
    slots: toNumberOrNull(row.availableslot),
    region,
    brand: null,
    source: "clubcharge",
    status: "approved",
  };
}

function isHub(row: Record<string, unknown>): boolean {
  const name = String(row.name ?? "").toLowerCase();
  return name.includes("hub") || row.hub === "hub";
}

export async function runSeed(): Promise<SeedResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const client = createClient(url, serviceRole);

  const response = await fetch(CLUBCHARGE_API);
  if (!response.ok) {
    throw new Error(`Failed to fetch clubcharge data: ${response.status}`);
  }

  const payload = (await response.json()) as { stations?: Record<string, unknown>[] };
  const rows = payload.stations ?? [];

  const records = rows
    .filter(isHub)
    .map(normalize)
    .filter((row): row is NonNullable<ReturnType<typeof normalize>> => row !== null);

  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await client
      .from("stations")
      .upsert(batch, { onConflict: "name", ignoreDuplicates: true });

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }
    inserted += batch.length;
  }

  return { fetched: rows.length, inserted };
}
