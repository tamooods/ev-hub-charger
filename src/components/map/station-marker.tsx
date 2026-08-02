import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";

import { useMapContext } from "@/components/map/map-context";
import { getBrand } from "@/lib/brands";
import { createStationIcon } from "@/lib/marker-icon";
import type { Station } from "@/lib/types";

interface StationMarkerProps {
  station: Station;
}

export function StationMarker({ station }: StationMarkerProps) {
  const { selectedStationId, selectStation } = useMapContext();
  const markerRef = useRef<L.Marker>(null);
  const brand = station.brand ? getBrand(station.brand) : null;
  const isSelected = selectedStationId === station.id;

  useEffect(() => {
    const marker = markerRef.current;
    if (marker && isSelected) {
      marker.openPopup();
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[station.lat, station.lng]}
      icon={createStationIcon(brand)}
      eventHandlers={{ click: () => selectStation(station.id) }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        {station.name}
      </Tooltip>
      <Popup>
        <StationPopupContent station={station} />
      </Popup>
    </Marker>
  );
}

interface StationPopupContentProps {
  station: Station;
}

function StationPopupContent({ station }: StationPopupContentProps) {
  const brand = station.brand ? getBrand(station.brand) : null;

  const specs = [
    station.slots !== null ? `${station.slots} หัวชาร์จ` : null,
    station.kw !== null ? `กำลังสูงสุด ${station.kw} kW` : null,
    station.amp !== null ? `${station.amp} A` : null,
  ].filter((part): part is string => part !== null);

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
  const mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&travelmode=driving`;

  return (
    <div className="min-w-56">
      <h4 className="mb-1 text-sm font-semibold">{station.name}</h4>
      {specs.length > 0 && (
        <p className="text-xs text-slate-600">{specs.join(" · ")}</p>
      )}
      {brand?.app && (
        <p className="text-xs text-slate-500">App ที่ต้องใช้: {brand.app}</p>
      )}
      <div className="mt-2 flex flex-col gap-1">
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-blue-600 px-2 py-1 text-center text-xs font-medium text-white!"
        >
          เปิดใน Google Maps
        </a>
        <a
          href={mapsDirUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-slate-800 px-2 py-1 text-center text-xs font-medium text-white!"
        >
          นำทางทันที จากตำแหน่งปัจจุบัน
        </a>
      </div>
    </div>
  );
}
