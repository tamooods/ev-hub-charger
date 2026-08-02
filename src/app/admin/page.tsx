import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPanel } from "@/components/admin/admin-panel";
import { getPendingStations } from "@/lib/stations";

export const metadata: Metadata = {
  title: "ตรวจสอบสถานี — EV Hub Charger",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const stations = await getPendingStations();
  return <AdminPanel stations={stations} />;
}

function PageLoading() {
  return (
    <div className="flex h-dvh items-center justify-center text-slate-500">
      กำลังโหลด...
    </div>
  );
}
