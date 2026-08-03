<!-- BEGIN:nextjs-agent-rules -->
# นี่ไม่ใช่ Next.js ที่คุณรู้จัก

เวอร์ชันนี้มีการเปลี่ยนแปลงแบบ breaking — API, รูปแบบ และโครงสร้างไฟล์อาจต่างจากข้อมูลที่คุณฝึกมา อ่านคู่มือที่เกี่ยวข้องใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดทุกครั้ง และระวังประกาศ deprecation ต่าง ๆ
<!-- END:nextjs-agent-rules -->

# EV Hub Charger

โปรแกรมค้นหาสถานีชาร์จ EV ในไทย: คลอนของ clubcharge.net/hub พร้อมแผนที่, ตัววางแผนเส้นทาง (trip planner) และสถานีที่ผู้ใช้ส่งเอง สร้างด้วย Next.js 16 App Router + Supabase + Leaflet, Deploy บน Vercel

## คำสั่ง

- `npm run dev` — dev server (พอร์ต 3000)
- `npm run lint` — ESLint (ไม่มีสคริปต์ typecheck แยก; ใช้ `npx tsc --noEmit` แทนได้)
- `npm run build` — build สำหรับ production (เป็นด่านตรวจสอบความถูกต้อง)
- `node --env-file=.env scripts/seed-from-clubcharge.mjs` — rerun seed ด้วยมือครั้งเดียว
- `npx vercel --prod --yes` — deploy ขึ้น production (อย่าลืม `git commit` ก่อน)

ไม่มี unit test โดยเจตนา — ผู้ใช้ปฏิเสธอย่างชัดเจน ตรวจด้วย `npm run build` + `npm run lint`

## ข้อตกลง (บังคับโดยผู้ใช้ — ห้ามละเมิด)

- **ห้ามมี comment ในโค้ด** ไม่มี comment ในโค้ดทุกกรณี
- **หลักการ Clean Code**: ฟังก์ชันเล็กทำอย่างเดียว, แยก business logic ไว้ใน `src/lib/*`, ไม่ซ้ำซ้อน (DRY), TypeScript types ชัดเจน
- ข้อความ UI เป็น **ภาษาไทย**
- **ตอบผู้ใช้เป็นภาษาไทย** เว้นแต่ผู้ใช้ขอเป็นอย่างอื่น

## จุดพังของ Next.js 16 (สำคัญ)

- `next.config.ts` ตั้งค่า `cacheComponents: true` ทำให้ห้ามใช้ route segment config (`export const dynamic`, `revalidate`, `fetchCache`) ทุกที่ — ถ้าใส่จะ error ตอน build
- Data fetching: ใช้ directive `"use cache"` + `cacheLife("hours")` + `cacheTag("stations")` ภายในฟังก์ชัน async ที่ cache ไว้ (ดู `src/lib/stations.ts`) `getApprovedStations()` คืนค่า `[]` อย่างปลอดภัยเมื่อไม่มี env ของ Supabase
- ล้าง cache ที่ถูกเรียกจาก Server Action เท่านั้น ด้วย `updateTag("stations")` (ดู action approve ใน `src/app/actions.ts`) ส่วน `revalidateTag` ต้องมี parameter ที่สอง (cacheLife profile)
- การตรวจสอบ Server Action ใช้ `useActionState(fn, initialState)` โดย `fn` เป็น `(prevState, formData)`
- Leaflet (ใช้ได้เฉพาะ browser) ต้องโหลดผ่าน `next/dynamic(..., { ssr: false })` จาก **client** component — ทุกอย่างแมปไปที่ `src/components/layout/dynamic-pages.tsx` หน้าเว็บต้อง import wrapper dynamic เหล่านี้ ไม่ใช่ component leaflet ตรง ๆ
- Async request API (`params`, `searchParams`, `cookies()`, `headers()`) เป็น Promise — ต้อง await

## สถาปัตยกรรม

- **การไหลของข้อมูล**: หน้าเป็น server component เรียก `getApprovedStations()` (cache แล้ว) แล้วส่ง `Station[]` ให้ client dynamic component
- `src/lib/seed.ts` มี `runSeed()` แยก; CLI แบบสแตนด์อโลนที่ `scripts/seed-from-clubcharge.mjs` ทำ logic ซ้ำกัน (เก็บไว้ใช้รันเอง)
- `supabase/migrations/0001_init.sql` กำหนดตาราง `stations` (RLS: สาธารณะอ่านเฉพาะแถว approved, insert สาธารณะได้, service_role ทำได้ทั้งหมด) ต้อง apply ด้วยมือใน Supabase dashboard — ไม่มี DB/CLI ในเครื่อง
- Logo แบรนด์: ของจริงจาก Wikimedia เท่านั้นสำหรับ PTT และ PEA; ที่เหลือเป็น marker SVG สีรูปปั๊ม อย่าเอารูปจาก clubcharge มาใช้ (ลิขสิทธิ์)

## Env & ความลับ

- คีย์จริงอยู่ใน `.env` (ถูก .gitignore ผ่าน `.env*` — ห้าม commit) `.env.example` มี placeholder
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`
- `src/lib/supabase.ts` เป็น factory client ตัวเดียว; โค้ดต้อง build/run ได้แม้ไม่มี env (คืน `[]`/ว่าง)

## Cron / อัปเดตข้อมูล

- Vercel Cron (`vercel.json`) เรียก `GET /api/seed` เวลา 09:00 UTC ทุกวันที่ 1 และ 16 ของเดือน (~ทุก 15 วัน) เพื่อ re-scrape clubcharge `src/app/api/seed/route.ts` ต้องมี `Authorization: Bearer $CRON_SECRET` เมื่อตั้ง env นั้นไว้ หลังแก้ vercel.json ต้อง redeploy cron ถึงจะมีผล
