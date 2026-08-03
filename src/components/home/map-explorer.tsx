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
  const [filterOpen, setFilterOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const filteredStations = useMemo(
    () => filterStations(stations, filters),
    [stations, filters],
  );

  const updateFilters = (patch: Partial<StationFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <MapProvider>
      <div className="flex h-dvh flex-col">
        <SiteHeader />
        <div className="relative min-h-0 flex-1">
          <main className="absolute inset-0">
            <MapShell>
              {filteredStations.map((station) => (
                <StationMarker key={station.id} station={station} />
              ))}
              <FitBounds points={filteredStations} />
            </MapShell>
            <ThemeSwitcher />

            <div className="absolute left-3 top-3 z-1000 flex gap-2 lg:hidden">
              <button
                onClick={() => setFilterOpen(true)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-md"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FilterIcon />
                  ค้นหา/กรอง
                </span>
              </button>
            </div>

            <button
              onClick={() => setListOpen((open) => !open)}
              className="absolute inset-x-0 bottom-0 z-1000 mx-auto mb-4 w-max rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <ListIcon />
                รายการสถานี ({filteredStations.length})
                <span
                  className={
                    listOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                >
                  <ChevronUpIcon />
                </span>
              </span>
            </button>
          </main>

          <aside className="absolute inset-y-0 left-0 z-10 lg:z-400 hidden w-104 flex-col border-r border-slate-200 bg-white lg:flex">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  ค้นหาสถานีชาร์จ
                </h2>
                <p className="text-xs text-slate-500">
                  พบ {filteredStations.length} สถานี
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {filteredStations.length} สถานี
              </span>
            </div>
            <div className="shrink-0 border-b border-slate-200 p-4">
              <FilterPanel
                stations={stations}
                filters={filters}
                onChange={updateFilters}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  รายการสถานี
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredStations.length} ผลลัพธ์
                </span>
              </div>
              <StationList stations={filteredStations} />
            </div>
          </aside>

          {filterOpen && (
            <div className="absolute inset-0 z-1100 flex flex-col justify-end bg-black/40 lg:hidden">
              <div className="max-h-[85%] overflow-y-auto rounded-t-2xl bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">
                    ค้นหาและกรอง
                  </h2>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <FilterPanel
                  stations={stations}
                  filters={filters}
                  onChange={updateFilters}
                />
                <button
                  onClick={() => setFilterOpen(false)}
                  className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white"
                >
                  ดูผลลัพธ์ ({filteredStations.length} สถานี)
                </button>
              </div>
            </div>
          )}

          {listOpen && (
            <div className="absolute inset-0 z-1100 flex flex-col justify-end bg-black/40 lg:hidden">
              <div className="flex max-h-[75%] flex-col rounded-t-2xl bg-white p-4">
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      รายการสถานี
                    </h2>
                    <p className="text-xs text-slate-500">
                      พบ {filteredStations.length} สถานี
                    </p>
                  </div>
                  <button
                    onClick={() => setListOpen(false)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col">
                  <StationList stations={filteredStations} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MapProvider>
  );
}

function FilterIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
