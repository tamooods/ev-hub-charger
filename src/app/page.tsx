import type { Metadata } from "next";

import { DynamicMapExplorer } from "@/components/layout/dynamic-pages";
import { getApprovedStations } from "@/lib/stations";

export const metadata: Metadata = {
  title: "EV Hub Charger — แผนที่สถานีชาร์จ EV ทั่วไทย",
  description:
    "ค้นหาสถานีชาร์จรถยนต์ไฟฟ้า EV ทั่วประเทศไทย กรองตามภูมิภาค แบรนด์ และกำลังชาร์จ วางแผนเส้นทางทริปได้ฟรี",
};

export default async function HomePage() {
  const stations = await getApprovedStations();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EV Hub Charger",
    description:
      "ค้นหาสถานีชาร์จรถยนต์ไฟฟ้า EV ทั่วประเทศไทย กรองตามภูมิภาค แบรนด์ และกำลังชาร์จ",
    numberOfItems: stations.length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <DynamicMapExplorer stations={stations} />
    </>
  );
}
