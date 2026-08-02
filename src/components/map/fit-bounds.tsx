import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { LatLng } from "@/lib/geo";

interface FitBoundsProps {
  points: LatLng[];
  padding?: number;
  maxZoom?: number;
}

export function FitBounds({ points, padding = 50, maxZoom = 12 }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }
    const bounds = points.reduce<L.LatLngBounds | null>((acc, point) => {
      const latLng = L.latLng(point.lat, point.lng);
      return acc ? acc.extend(latLng) : L.latLngBounds(latLng, latLng);
    }, null);
    if (bounds) {
      map.fitBounds(bounds, { padding: [padding, padding], maxZoom });
    }
  }, [map, points, padding, maxZoom]);

  return null;
}
