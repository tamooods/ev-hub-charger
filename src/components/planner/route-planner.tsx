"use client";

import { useRef, useState } from "react";

import { StationList } from "@/components/home/station-list";
import { SiteHeader } from "@/components/layout/site-header";
import { FitBounds } from "@/components/map/fit-bounds";
import { MapProvider, MapShell } from "@/components/map/map-context";
import { RouteLayer } from "@/components/map/route-layer";
import { StationMarker } from "@/components/map/station-marker";
import { distanceToPolylineKm, type LatLng } from "@/lib/geo";
import {
  geocode,
  getRoute,
  type GeocodeResult,
  type RouteResult,
} from "@/lib/route";
import type { Station } from "@/lib/types";

interface RoutePlannerProps {
  stations: Station[];
}

interface PlaceField {
  query: string;
  results: GeocodeResult[];
  selected: GeocodeResult | null;
  loading: boolean;
  open: boolean;
}

function createEmptyPlace(): PlaceField {
  return {
    query: "",
    results: [],
    selected: null,
    loading: false,
    open: false,
  };
}

const MAX_DISTANCE_KM = 20;
const GEOCODE_DEBOUNCE_MS = 300;

export function RoutePlanner({ stations }: RoutePlannerProps) {
  const [origin, setOrigin] = useState<PlaceField>(createEmptyPlace);
  const [destination, setDestination] = useState<PlaceField>(createEmptyPlace);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const requestSeq = useRef<Record<string, number>>({});

  const hasRoute = route !== null && origin.selected && destination.selected;

  function handleGeocode(field: "origin" | "destination", query: string) {
    const setter = field === "origin" ? setOrigin : setDestination;
    const key = field;

    if (!query.trim()) {
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
        delete debounceTimers.current[key];
      }
      setter((current) => ({ ...current, query, results: [], open: false }));
      return;
    }

    setter((current) => ({ ...current, query }));

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(async () => {
      const seq = (requestSeq.current[key] =
        (requestSeq.current[key] ?? 0) + 1);
      setter((current) => ({ ...current, loading: true, open: true }));
      try {
        const results = await geocode(query);
        if (requestSeq.current[key] === seq) {
          setter((current) => ({
            ...current,
            results,
            loading: false,
            open: true,
          }));
        }
      } catch {
        if (requestSeq.current[key] === seq) {
          setter((current) => ({
            ...current,
            results: [],
            loading: false,
            open: false,
          }));
        }
      }
    }, GEOCODE_DEBOUNCE_MS);
  }

  function selectPlace(field: "origin" | "destination", result: GeocodeResult) {
    const setter = field === "origin" ? setOrigin : setDestination;
    const key = field;
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
      delete debounceTimers.current[key];
    }
    setter((current) => ({
      ...current,
      query: result.name,
      results: [],
      selected: result,
      open: false,
    }));
  }

  async function planRoute() {
    if (!origin.selected || !destination.selected) {
      setRouteError("กรุณาเลือกทั้งต้นทางและปลายทาง");
      return;
    }
    setLoadingRoute(true);
    setRouteError(null);
    setRoute(null);
    setNearbyStations([]);
    try {
      const result = await getRoute(origin.selected, destination.selected);
      const nearby = findNearbyStations(stations, result.coordinates);
      setRoute(result);
      setNearbyStations(nearby);
    } catch {
      setRouteError("ไม่สามารถวางแผนเส้นทางได้");
    } finally {
      setLoadingRoute(false);
    }
  }

  const mapPoints = hasRoute ? route.coordinates : [];

  return (
    <MapProvider>
      <div className="flex h-dvh flex-col">
        <SiteHeader />
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="z-10 order-2 h-[45%] overflow-y-auto border-t border-slate-200 bg-white lg:order-1 lg:flex lg:h-auto lg:flex-col lg:w-96 lg:overflow-visible lg:border-r lg:border-t-0">
            <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 p-3">
              <PlaceInput
                label="ต้นทาง"
                field={origin}
                onQueryChange={(query) => handleGeocode("origin", query)}
                onSelect={(result) => selectPlace("origin", result)}
              />
              <PlaceInput
                label="ปลายทาง"
                field={destination}
                onQueryChange={(query) => handleGeocode("destination", query)}
                onSelect={(result) => selectPlace("destination", result)}
              />
              <button
                onClick={planRoute}
                disabled={loadingRoute}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingRoute ? "กำลังคำนวณ..." : "วางแผนเส้นทาง"}
              </button>
              {routeError && (
                <p className="text-sm text-red-600">{routeError}</p>
              )}
              {hasRoute && (
                <RouteSummary
                  route={route}
                  nearbyCount={nearbyStations.length}
                />
              )}
            </div>
            {hasRoute ? (
              <>
                <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  สถานีชาร์จใกล้เส้นทาง ({nearbyStations.length})
                </div>
                <StationList stations={nearbyStations} />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
                ป้อนต้นทางและปลายทางเพื่อหาสถานีชาร์จระหว่างทาง
              </div>
            )}
          </aside>
          <main className="order-1 relative min-h-0 flex-1 lg:order-2">
            <MapShell>
              {hasRoute && <RouteLayer coordinates={route.coordinates} />}
              {nearbyStations.map((station) => (
                <StationMarker key={station.id} station={station} />
              ))}
              <FitBounds points={mapPoints} />
            </MapShell>
          </main>
        </div>
      </div>
    </MapProvider>
  );
}

function findNearbyStations(
  stations: Station[],
  coordinates: LatLng[],
): Station[] {
  return stations
    .map((station) => ({
      station,
      distance: distanceToPolylineKm(
        { lat: station.lat, lng: station.lng },
        coordinates,
      ),
    }))
    .filter(({ distance }) => distance <= MAX_DISTANCE_KM)
    .sort((a, b) => a.distance - b.distance)
    .map(({ station }) => station);
}

interface PlaceInputProps {
  label: string;
  field: PlaceField;
  onQueryChange: (query: string) => void;
  onSelect: (result: GeocodeResult) => void;
}

function PlaceInput({
  label,
  field,
  onQueryChange,
  onSelect,
}: PlaceInputProps) {
  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      <input
        type="text"
        value={field.query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="พิมพ์ชื่อสถานที่..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      {field.open && (field.results.length > 0 || field.loading) && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {field.loading && (
            <li className="px-3 py-2 text-sm text-slate-400">กำลังค้นหา...</li>
          )}
          {field.results.map((result, index) => (
            <li key={`${result.name}-${index}`}>
              <button
                onClick={() => onSelect(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                {result.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface RouteSummaryProps {
  route: RouteResult;
  nearbyCount: number;
}

function RouteSummary({ route, nearbyCount }: RouteSummaryProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm">
      <p className="font-medium text-slate-900">
        ระยะทาง {route.distanceKm.toFixed(0)} กม. · เวลาโดยประมาณ{" "}
        {route.durationMinutes} นาที
      </p>
      <p className="mt-1 text-slate-600">
        สถานีชาร์จใกล้เส้นทาง {nearbyCount} แห่ง
      </p>
    </div>
  );
}
