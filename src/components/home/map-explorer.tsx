"use client";

import { useMemo, useState } from "react";

import { MapProvider, MapShell } from "@/components/map/map-context";
import { StationMarker } from "@/components/map/station-marker";
import { FitBounds } from "@/components/map/fit-bounds";
import { FilterPanel } from "@/components/home/filter-panel";
import { StationList } from "@/components/home/station-list";
import { ThemeSwitcher } from "@/components/home/theme-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { filterStations } from "@/lib/filter";
import type { Station, StationFilters } from "@/lib/types";

interface MapExplorerProps {
  stations: Station[];
}

const DEFAULT_FILTERS: StationFilters = {
  region: "all",
  brands: [],
  minKw: null,
  query: "",
};

export function MapExplorer({ stations }: MapExplorerProps) {
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_FILTERS);

  const filteredStations = useMemo(
    () => filterStations(stations, filters),
    [stations, filters]
  );

  const updateFilters = (patch: Partial<StationFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <MapProvider>
      <div className="flex h-dvh flex-col">
        <SiteHeader />
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="z-10 order-2 flex max-h-[45%] flex-col border-t border-slate-200 bg-white lg:order-1 lg:max-h-none lg:w-96 lg:border-r lg:border-t-0">
            <FilterPanel
              stations={stations}
              filters={filters}
              onChange={updateFilters}
            />
            <StationList stations={filteredStations} />
          </aside>
          <main className="order-1 relative min-h-0 flex-1 lg:order-2">
            <MapShell>
              {filteredStations.map((station) => (
                <StationMarker key={station.id} station={station} />
              ))}
              <FitBounds points={filteredStations} />
            </MapShell>
            <ThemeSwitcher />
          </main>
        </div>
      </div>
    </MapProvider>
  );
}
