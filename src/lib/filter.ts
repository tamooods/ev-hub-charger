import type { Station, StationFilters } from "@/lib/types";

export function matchesQuery(station: Station, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return station.name.toLowerCase().includes(q);
}

export function matchesMinKw(station: Station, minKw: number | null): boolean {
  if (!minKw) {
    return true;
  }
  return station.kw !== null && station.kw >= minKw;
}

export function matchesBrand(station: Station, brands: string[]): boolean {
  if (brands.length === 0) {
    return true;
  }
  return station.brand !== null && brands.includes(station.brand);
}

export function matchesRegion(station: Station, region: StationFilters["region"]): boolean {
  if (region === "all") {
    return true;
  }
  return station.region === region;
}

export function filterStations(
  stations: Station[],
  filters: StationFilters
): Station[] {
  return stations.filter(
    (station) =>
      matchesQuery(station, filters.query) &&
      matchesMinKw(station, filters.minKw) &&
      matchesBrand(station, filters.brands) &&
      matchesRegion(station, filters.region)
  );
}
