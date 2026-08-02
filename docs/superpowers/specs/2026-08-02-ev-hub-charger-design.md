# EV Hub Charger — Design Spec

วันที่: 2026-08-02

## เป้าหมาย

เว็บหา EV charging hub ในไทย เหมือน clubcharge.net/hub/ แต่ปรับ UX/UI ให้ดีขึ้นและเพิ่มฟีเจอร์: วางแผนเส้นทาง (trip planner) และให้ผู้ใช้เพิ่ม/แก้ไขสถานีได้

## Tech Stack

- **Next.js 15 (App Router) + TypeScript + Tailwind** — deploy ฟรีบน Vercel, SEO ดี
- **Supabase (Postgres)** — เก็บสถานีและข้อมูลผู้ใช้, ใช้ client ฝั่ง server เท่านั้น
- **Leaflet (react-leaflet)** — แผนที่, client component เท่านั้น
- **OSRM demo server** — วาดเส้นทาง (ฟรี ไม่ต้องลงทะเบียน)
- **Nominatim (OSM)** — geocode หาพิกัดจากชื่อสถานที่

## Data Model (Supabase)

```sql
stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  kw numeric,
  amp numeric,
  slots integer,
  region text check (region in ('central','isan','north','east','south')),
  brand text,
  source text default 'user' check (source in ('clubcharge','user')),
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_by text,
  created_at timestamptz default now()
)
```

- `brand` ตรวจจับจากชื่อสถานีผ่าน brand directory ใน `src/lib/brands.ts`
- สถานีที่ seed จาก clubcharge: `source='clubcharge'`, `status='approved'`
- สถานีที่ผู้ใช้ส่ง: `source='user'`, `status='pending'`

## หน้าและฟีเจอร์ (v1)

### `/` — แผนที่หาสถานี
- แผนที่ Leaflet full-screen (mobile-first), sidebar/bottom sheet สำหรับ filter และรายการสถานี
- Filter: ภูมิภาค (all/north/isan/central/east/south), แบรนด์ (checkbox), min kW (ทั้งหมด/180/240/360), ค้นหาชื่อ
- แสดงจำนวนผลลัพธ์สด
- Marker: dot สีตามแบรนด์, swap เป็น logo ตอน zoom ระดับหนึ่ง (ถ้ามี)
- Popup: ชื่อ, สเปก ({slots} หัวชาร์จ กำลังสูงสุด {kw} kW {amp} A), ปุ่ม "เปิดใน Google Maps" และ "นำทางทันที"
- Map themes: contrast (ArcGIS World_Street_Map) / bright (OSM HOT) / terrain (OSM) — เลือกได้ เก็บใน localStorage
- Share link: `/?station=<id>` → auto scroll + เปิด popup
- Server component render ข้อมูลสถานี (JSON-LD Place schema) เพื่อ SEO

### `/planner` — วางแผนเส้นทาง
- ป้อนต้นทาง-ปลายทาง → geocode (Nominatim) → วาด polyline (OSRM) บนแผนที่
- แสดงสถานีที่อยู่ใกล้เส้นทาง (distance point-to-polyline threshold)
- v1: ไม่มีคำนวณ range/cost/car model

### `/add-station` — เพิ่ม/แก้ไขสถานี
- ฟอร์ม: ชื่อ, region, kW, amp, slots, pick พิกัดบนแผนที่
- ส่งเข้า Supabase `status='pending'` รอ approve
- หน้า admin คร่าวๆ สำหรับ approve/reject (server action ง่ายๆ)

## UX/UI หลักการ
- Mobile-first
- Loading skeleton + error state ทุก async path
- แสดงผลลัพธ์นับสด
- ไม่ reuse รูป/logo ของ clubcharge (ลิขสิทธิ์) — ใช้ dot สีแทน

## Clean Code หลักการ
- ชื่อสื่อความหมาย, ฟังก์ชันเล็กทำอย่างเดียว (SRP)
- แยก business logic ออกจาก UI: `src/lib/*`
- DRY, TypeScript types ชัดเจน
- ไม่มี comment ในโค้ด
- ไม่มี unit test (ตามคำขอ), ตรวจด้วย `npm run build` + `npm run lint`

## Error Handling
- Supabase/OSRM/Nominatim fail → แสดง message ชัดเจน ไม่พังทั้งหน้า
- Geocode ไม่เจอ → แจ้งผู้ใช้ให้แก้ชื่อสถานที่

## Deploy
- Vercel, env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
