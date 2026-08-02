import type { Metadata } from "next";

import { DynamicRoutePlanner } from "@/components/layout/dynamic-pages";
import { getApprovedStations } from "@/lib/stations";

export const metadata: Metadata = {
  title: "วางแผนเส้นทาง — EV Hub Charger",
  description:
    "วางแผนเส้นทางเดินทางด้วยรถ EV ค้นหาสถานีชาร์จที่อยู่ใกล้เส้นทางของคุณ",
};

export default async function PlannerPage() {
  const stations = await getApprovedStations();
  return <DynamicRoutePlanner stations={stations} />;
}
