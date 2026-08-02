import type { Metadata } from "next";

import { AdminPanel } from "@/components/admin/admin-panel";
import { getPendingStations } from "@/lib/stations";

export const metadata: Metadata = {
  title: "ตรวจสอบสถานี — EV Hub Charger",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const stations = await getPendingStations();
  return <AdminPanel stations={stations} />;
}
