import type { LatLng } from "@/lib/geo";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "th,en");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("การค้นหาสถานที่ไม่สำเร็จ กรุณาลองใหม่");
  }

  const data = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return data.map((item) => ({
    name: item.display_name,
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
  }));
}

export interface RouteResult {
  coordinates: LatLng[];
  distanceKm: number;
  durationMinutes: number;
}

export async function getRoute(
  origin: LatLng,
  destination: LatLng
): Promise<RouteResult> {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_URL}/${coordinates}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("การคำนวณเส้นทางไม่สำเร็จ กรุณาลองใหม่");
  }

  const data = (await response.json()) as {
    code: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: Array<[number, number]> };
    }>;
  };

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("ไม่พบเส้นทางระหว่างจุดที่เลือก");
  }

  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    distanceKm: route.distance / 1000,
    durationMinutes: Math.round(route.duration / 60),
  };
}
