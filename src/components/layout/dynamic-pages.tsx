"use client";

import dynamic from "next/dynamic";

import type { Station } from "@/lib/types";

export const DynamicMapExplorer = dynamic(
  () => import("@/components/home/map-explorer").then((m) => m.MapExplorer),
  { ssr: false, loading: PageLoading }
);

export const DynamicRoutePlanner = dynamic(
  () => import("@/components/planner/route-planner").then((m) => m.RoutePlanner),
  { ssr: false, loading: PageLoading }
);

export const DynamicAddStationForm = dynamic(
  () =>
    import("@/components/add-station/add-station-form").then((m) => m.AddStationForm),
  { ssr: false, loading: PageLoading }
);

function PageLoading() {
  return (
    <div className="flex h-dvh items-center justify-center text-slate-500">
      กำลังโหลด...
    </div>
  );
}

export type DynamicMapExplorerProps = { stations: Station[] };
