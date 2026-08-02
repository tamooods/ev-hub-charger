import type { Metadata } from "next";

import { DynamicAddStationForm } from "@/components/layout/dynamic-pages";

export const metadata: Metadata = {
  title: "เพิ่มสถานีชาร์จ — EV Hub Charger",
  description: "ช่วยเพิ่มสถานีชาร์จ EV ที่ยังไม่มีในแผนที่ของเรา",
};

export default function AddStationPage() {
  return <DynamicAddStationForm />;
}
