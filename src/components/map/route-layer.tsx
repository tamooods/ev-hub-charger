import { Polyline, CircleMarker } from "react-leaflet";

import type { LatLng } from "@/lib/geo";

interface RouteLayerProps {
  coordinates: LatLng[];
}

export function RouteLayer({ coordinates }: RouteLayerProps) {
  return (
    <>
      <Polyline
        positions={coordinates.map((point) => [point.lat, point.lng])}
        pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.8 }}
      />
      <CircleMarker
        center={[coordinates[0].lat, coordinates[0].lng]}
        radius={7}
        pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}
      />
      <CircleMarker
        center={[
          coordinates[coordinates.length - 1].lat,
          coordinates[coordinates.length - 1].lng,
        ]}
        radius={7}
        pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1 }}
      />
    </>
  );
}
