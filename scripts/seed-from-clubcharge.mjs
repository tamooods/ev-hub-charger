const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CLUBCHARGE_API = "https://clubcharge.net/wp-json/ev-system/all-data";

const VALID_REGIONS = new Set(["central", "isan", "north", "east", "south"]);

function toNumberOrNull(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function normalize(row) {
  const lat = toNumberOrNull(row.lat);
  const lng = toNumberOrNull(row.lng);
  const region = VALID_REGIONS.has(row.hubregion) ? row.hubregion : null;

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

function isHub(station) {
  const name = String(station.name ?? "").toLowerCase();
  return name.includes("hub") || station.hub === "hub";
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const response = await fetch(CLUBCHARGE_API);
  if (!response.ok) {
    throw new Error(`Failed to fetch clubcharge data: ${response.status}`);
  }

  const payload = await response.json();
  const rows = payload.stations ?? [];

  const records = rows
    .filter(isHub)
    .map(normalize)
    .filter((row) => row !== null);

  console.log(`Fetched ${rows.length} rows, ${records.length} valid hubs`);

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

  console.log(`Done. ${inserted} records upserted`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
