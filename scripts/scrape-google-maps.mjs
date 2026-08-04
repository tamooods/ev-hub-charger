import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const RADIUS_KM = Number.parseFloat(process.env.RADIUS_KM ?? "70");
const ONLY = process.env.ONLY; // comma-separated province names to limit run (testing)

const PROVINCES = [
  ["กระบี่", "south", 8.086, 98.906],
  ["กาฬสินธุ์", "isan", 16.432, 103.506],
  ["ฉะเชิงเทรา", "east", 13.691, 101.075],
  ["เชียงราย", "north", 19.911, 99.83],
  ["ตรัง", "south", 7.562, 99.611],
  ["ตราด", "east", 12.241, 102.514],
  ["นครนายก", "central", 14.205, 101.213],
  ["นครพนม", "isan", 17.412, 104.779],
  ["นครศรีธรรมราช", "south", 8.41, 99.963],
  ["นราธิวาส", "south", 6.425, 101.822],
  ["น่าน", "north", 18.784, 100.772],
  ["บึงกาฬ", "isan", 18.361, 103.651],
  ["ปราจีนบุรี", "east", 14.051, 101.369],
  ["ปัตตานี", "south", 6.869, 101.25],
  ["พระนครศรีอยุธยา", "central", 14.353, 100.568],
  ["พะเยา", "north", 19.166, 99.902],
  ["พังงา", "south", 8.451, 98.532],
  ["พัทลุง", "south", 7.617, 100.075],
  ["เพชรบูรณ์", "north", 16.419, 101.161],
  ["แม่ฮ่องสอน", "north", 19.301, 97.969],
  ["ยโสธร", "isan", 15.793, 104.145],
  ["ยะลา", "south", 6.543, 101.281],
  ["ร้อยเอ็ด", "isan", 16.056, 103.653],
  ["ระนอง", "south", 9.953, 98.632],
  ["ราชบุรี", "central", 13.527, 99.813],
  ["ลำพูน", "north", 18.576, 99.008],
  ["เลย", "isan", 17.485, 101.724],
  ["ศรีสะเกษ", "isan", 15.119, 104.329],
  ["สงขลา", "south", 7.19, 100.595],
  ["สตูล", "south", 6.623, 100.068],
  ["สมุทรสงคราม", "central", 13.41, 100.002],
  ["สมุทรสาคร", "central", 13.547, 100.28],
  ["สระแก้ว", "east", 13.823, 102.068],
  ["สุโขทัย", "north", 17.015, 99.826],
  ["สุรินทร์", "isan", 14.884, 103.918],
  ["หนองคาย", "isan", 17.878, 102.742],
  ["หนองบัวลำภู", "isan", 17.221, 102.434],
  ["อ่างทอง", "central", 14.59, 100.453],
  ["อำนาจเจริญ", "isan", 15.848, 104.63],
  ["อุตรดิตถ์", "north", 17.621, 100.099],
  ["อุทัยธานี", "north", 15.383, 100.029],
].map(([name, region, lat, lng]) => ({ name, region, lat, lng }));

const BRAND_MATCH = [
  ["ptt", ["PTT"]],
  ["igreen", ["IGREEN"]],
  ["spark", ["SPARK"]],
  ["onecharge", ["ONECHARGE"]],
  ["elexa", ["ELEXA"]],
  ["pea-volta", ["PEA VOLTA", "PEA"]],
  ["evolt", ["EVOLT"]],
  ["nexmoev", ["NEXMOEV"]],
  ["tpi", ["TPI"]],
  ["ev-one", ["EV ONE"]],
  ["acharge", ["ACHARGE"]],
  ["kq", ["KQ CHARGE", "KQ"]],
  ["sharge", ["SHARGE", "REVER"]],
  ["ea-anywhere", ["EA ANYWHERE"]],
  ["mg", ["MG"]],
  ["chargeplus", ["CHARGE+"]],
];

function detectBrandId(name) {
  const upper = String(name ?? "").toUpperCase();
  for (const [id, keys] of BRAND_MATCH) {
    if (keys.some((k) => upper.includes(k))) return id;
  }
  return null;
}

function distKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function extractPlaces(page) {
  return page.evaluate(() => {
    const seen = new Set();
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/maps/place/"]')) {
      const href = a.getAttribute("href") || "";
      const m = href.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (!m) continue;
      const lat = Number.parseFloat(m[1]);
      const lng = Number.parseFloat(m[2]);
      const key = lat.toFixed(5) + "," + lng.toFixed(5);
      if (seen.has(key)) continue;
      seen.add(key);
      let name = (a.getAttribute("aria-label") || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!name) {
        const pm = href.match(/\/place\/([^/]+)/);
        if (pm) name = decodeURIComponent(pm[1]);
      }
      out.push({ name, lat, lng });
    }
    return out;
  });
}

async function scrollFeed(page) {
  let prev = 0;
  for (let i = 0; i < 80; i++) {
    const n = await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
        return feed.scrollHeight;
      }
      window.scrollTo(0, document.body.scrollHeight);
      return document.body.scrollHeight;
    });
    if (Math.abs(n - prev) < 2) break;
    prev = n;
    await sleep(600);
  }
}

async function scrapeProvince(page, prov, seenPoints, usedNames) {
  const terms = [`${prov.name} ที่ชาร์จรถไฟฟ้า`, `${prov.name} สถานีชาร์จ EV`];
  const found = [];
  let rawCount = 0;
  for (const term of terms) {
    const q = encodeURIComponent(term);
    try {
      await page.goto(
        `https://www.google.com/maps/search/${q}/@${prov.lat},${prov.lng},10z`,
        { waitUntil: "domcontentloaded", timeout: 45000 },
      );
    } catch (err) {
      console.log(`  query failed (${term}): ${err.message}`.slice(0, 120));
      continue;
    }
    await page
      .waitForSelector('a[href*="/maps/place/"]', { timeout: 15000 })
      .catch(() => {});
    await sleep(2400);
    try {
      await scrollFeed(page);
    } catch {
      /* keep going */
    }
    const places = await extractPlaces(page);
    rawCount += places.length;
    for (const p of places) {
      if (distKm(p, prov) > RADIUS_KM) continue;
      const dup = [...seenPoints].find((s) => distKm(p, s) < 0.15);
      if (dup) continue;
      seenPoints.push({ lat: p.lat, lng: p.lng });
      let name = p.name || `${prov.name} สถานีชาร์จ`;
      let candidate = name;
      let n = 1;
      while (usedNames.has(candidate)) {
        candidate = `${name} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`;
        n += 1;
        if (candidate === name) break;
      }
      usedNames.add(candidate);
      found.push({
        name: candidate,
        lat: p.lat,
        lng: p.lng,
        region: prov.region,
        brand: detectBrandId(name),
        source: "user",
        status: "approved",
      });
    }
  }
  console.log(`  [${prov.name}] raw=${rawCount} new=${found.length}`);
  return found;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY)
    throw new Error("Missing Supabase env");
  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const existing = [];
  let from = 0;
  for (;;) {
    const { data, error } = await client
      .from("stations")
      .select("name,lat,lng")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    existing.push(
      ...data.map((d) => ({ name: d.name, lat: d.lat, lng: d.lng })),
    );
    from += 1000;
    if (data.length < 1000) break;
  }

  const targets = ONLY
    ? PROVINCES.filter((p) => ONLY.split(",").includes(p.name))
    : PROVINCES;
  console.log(
    `Existing stations: ${existing.length}. Target provinces: ${targets.length}`,
  );

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      "--lang=th-TH",
      "--no-sandbox",
      "--no-proxy-server",
      "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "th,th-TH;q=0.9,en;q=0.8",
  });

  const usedNames = new Set(existing.map((s) => s.name));
  const seenPoints = [...existing];
  const all = [];

  try {
    for (const prov of targets) {
      const found = await scrapeProvince(page, prov, seenPoints, usedNames);
      all.push(...found);
      console.log(`[${prov.name}] scraped ${found.length} new places`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Total new places: ${all.length}`);
  if (all.length === 0) return;

  const batchSize = 100;
  let inserted = 0;
  let duped = 0;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const { error, count } = await client
      .from("stations")
      .upsert(batch, {
        onConflict: "name",
        ignoreDuplicates: true,
        count: "exact",
      });
    if (error) throw new Error(error.message);
    duped += batch.length - count;
    inserted += count;
  }
  console.log(`Inserted ${inserted}, duplicates skipped ${duped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
