# EV Hub Charger

เว็บค้นหาสถานีชาร์จรถยนต์ไฟฟ้า (EV) ในประเทศไทย เป็นเวอร์ชันปรับปรุงของ [clubcharge.net/hub](https://clubcharge.net/hub/) — มีแผนที่, วางแผนเส้นทาง (trip planner) และให้ผู้ใช้เพิ่ม/แก้ไขสถานีได้เอง

## เทคโนโลยี

- **Next.js 16 (App Router)** + TypeScript + Tailwind CSS
- **Supabase (Postgres)** — เก็บข้อมูลสถานี
- **Leaflet (react-leaflet)** — แผนที่
- **OSRM** — วางแผนเส้นทาง
- **Nominatim (OSM)** — geocode
- Deploy บน **Vercel**

## ฟีเจอร์

- **แผนที่หาสถานี** (`/`) — กรองตามภูมิภาค/แบรนด์/กำลังชาร์จ, ค้นหา, เปลี่ยนธีมแผนที่, ปุ่มเปิดใน Google Maps
- **วางแผนเส้นทาง** (`/planner`) — ป้อนต้นทาง-ปลายทาง, วาดเส้นทางและแสดงสถานีที่อยู่ใกล้เส้นทาง
- **เพิ่มสถานี** (`/add-station`) — ผู้ใช้ส่งสถานีใหม่, รอการอนุมัติ (`status='pending'`)
- **หน้าอนุมัติ** (`/admin`) — อนุมัติ/ปฏิเสธสถานีที่ผู้ใช้ส่ง

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูผล

## ตั้งค่า Environment

คัดลอก `.env.example` เป็น `.env` แล้วเติมค่า:

| ตัวแปร | คำอธิบาย |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (ใช้ฝั่ง client) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (ใช้ฝั่ง server เท่านั้น) |
| `CRON_SECRET` | ใช้ยืนยันตัวตนตอน cron เรียก `/api/seed` |
| `NEXT_PUBLIC_SITE_URL` | URL ของเว็บ (ใช้ใน sitemap/robots) |

**หมายเหตุ:** ไฟล์ `.env` ถูกละเว้นในการ commit (ดู `.gitignore`)

## ฐานข้อมูล (Supabase)

- Schema อยู่ที่ `supabase/migrations/0001_init.sql` — ต้อง apply ด้วยมือใน Supabase Dashboard (ไม่มี DB/CLI ในเครื่อง)
- ตาราง `stations`: `name`, `lat/lng`, `kw/amp/slots`, `region`, `brand`, `source` (`clubcharge`/`user`), `status` (`pending`/`approved`/`rejected`)
- RLS: ใครก็อ่านได้เฉพาะแถว `approved`, insert สาธารณะได้, `service_role` จัดการได้ทั้งหมด

## การดึงข้อมูลจาก เว็บต้นทาง

ข้อมูลสถานีเริ่มต้น scrape จาก API ของ clubcharge แล้วเก็บใน Supabase:

- **รันเองครั้งเดียว:** `node --env-file=.env scripts/seed-from-clubcharge.mjs`
- **อัตโนมัติทุก ~15 วัน:** Vercel Cron ใน `vercel.json` เรียก `GET /api/seed` เวลา 09:00 UTC ทุกวันที่ 1 และ 16 ของเดือน (ต้องมี `CRON_SECRET` ตั้งใน Vercel)

## คำสั่ง

| คำสั่ง | ความหมาย |
|---|---|
| `npm run dev` | เปิด dev server (port 3000) |
| `npm run build` | build สำหรับ production |
| `npm run lint` | ตรวจ ESLint |
| `npx tsc --noEmit` | ตรวจ TypeScript |
| `npx vercel --prod --yes` | deploy ขึ้น production |

## การอนุมัติ (Moderation)

1. ผู้ใช้ส่งสถานีผ่าน `/add-station` → `status='pending'`
2. แอดมินเปิด `/admin` แล้วกด อนุมัติ/ปฏิเสธ
3. เมื่ออนุมัติ ข้อมูลจะเข้าแผนที่ทันทีผ่านการ invalidate cache (`updateTag("stations")`)
