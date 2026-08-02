# EV Hub Charger — เอกสารออกแบบ

วันที่: 2026-08-02

## เป้าหมาย

เว็บหา EV charging hub ในไทย เหมือน clubcharge.net/hub/ แต่ปรับ UX/UI ให้ดีขึ้นและเพิ่มฟีเจอร์: วางแผนเส้นทาง (trip planner) และให้ผู้ใช้เพิ่ม/แก้ไขสถานีได้

## เทคโนโลยีที่ใช้

- **Next.js 16 (App Router) + TypeScript + Tailwind** — deploy ฟรีบน Vercel, SEO ดี
- **Supabase (Postgres)** — เก็บสถานีและข้อมูลผู้ใช้, ใช้ client ฝั่ง server เท่านั้น
- **Leaflet (react-leaflet)** — แผนที่, client component เท่านั้น
- **OSRM demo server** — วาดเส้นทาง (ฟรี ไม่ต้องลงทะเบียน)
- **Nominatim (OSM)** — geocode หาพิกัดจากชื่อสถานที่

## โครงสร้างข้อมูล (Supabase)

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
- แผนที่ Leaflet full-screen (mobile-first), sidebar/bottom sheet สำหรับกรองและรายการสถานี
- ตัวกรอง: ภูมิภาค (ทั้งหมด/เหนือ/อีสาน/กลาง/ตะวันออก/ใต้), แบรนด์ (checkbox), min kW (ทั้งหมด/180/240/360), ค้นหาชื่อ
- แสดงจำนวนผลลัพธ์สด
- Marker: จุดสีตามแบรนด์, สลับเป็น logo ตอน zoom ระดับหนึ่ง (ถ้ามี)
- Popup: ชื่อ, สเปก ({slots} หัวชาร์จ กำลังสูงสุด {kw} kW {amp} A), ปุ่ม "เปิดใน Google Maps" และ "นำทางทันที"
- ธีมแผนที่: contrast (ArcGIS World_Street_Map) / bright (OSM HOT) / terrain (OSM) — เลือกได้ เก็บใน localStorage
- Share link: `/?station=<id>` → เลื่อนอัตโนมัติ + เปิด popup
- Server component render ข้อมูลสถานี (JSON-LD Place schema) เพื่อ SEO

### `/planner` — วางแผนเส้นทาง
- ป้อนต้นทาง-ปลายทาง → geocode (Nominatim) → วาดเส้นทาง (OSRM) บนแผนที่
- แสดงสถานีที่อยู่ใกล้เส้นทาง (ระยะห่างจุด-เส้น threshold)
- v1: ไม่มีคำนวณ range/cost/รุ่นรถ

### `/add-station` — เพิ่ม/แก้ไขสถานี
- ฟอร์ม: ชื่อ, ภูมิภาค, kW, amp, slots, เลือกพิกัดบนแผนที่
- ส่งเข้า Supabase `status='pending'` รออนุมัติ
- หน้าแอดมินแบบง่าย สำหรับอนุมัติ/ปฏิเสธ (server action)

## หลักการ UX/UI
- Mobile-first
- Loading skeleton + error state ทุก async path
- แสดงผลลัพธ์นับสด
- ไม่ใช้รูป/logo ของ clubcharge (ลิขสิทธิ์) — ใช้จุดสีแทน

## หลักการ Clean Code
- ชื่อสื่อความหมาย, ฟังก์ชันเล็กทำอย่างเดียว (SRP)
- แยก business logic ออกจาก UI: `src/lib/*`
- DRY, TypeScript types ชัดเจน
- ไม่มี comment ในโค้ด
- ไม่มี unit test (ตามคำขอ), ตรวจด้วย `npm run build` + `npm run lint`

## การจัดการ Error
- Supabase/OSRM/Nominatim ล้มเหลว → แสดงข้อความชัดเจน ไม่พังทั้งหน้า
- Geocode ไม่เจอ → แจ้งผู้ใช้ให้แก้ชื่อสถานที่

## Deploy
- Vercel, env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
