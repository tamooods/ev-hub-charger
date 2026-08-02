import { useMapContext } from "@/components/map/map-context";
import { getBrand } from "@/lib/brands";
import { REGION_LABELS } from "@/lib/map";
import { buildBrandSvg } from "@/lib/marker-icon";
import type { Region, Station } from "@/lib/types";

function iconDataUri(brand: ReturnType<typeof getBrand>): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildBrandSvg(brand, 20))}`;
}

interface StationListProps {
  stations: Station[];
}

export function StationList({ stations }: StationListProps) {
  const { selectedStationId, selectStation } = useMapContext();

  if (stations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
        ไม่พบสถานีที่ตรงกับเงื่อนไข
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
      {stations.map((station) => (
        <StationRow
          key={station.id}
          station={station}
          selected={station.id === selectedStationId}
          onSelect={selectStation}
        />
      ))}
    </ul>
  );
}

interface StationRowProps {
  station: Station;
  selected: boolean;
  onSelect: (id: string) => void;
}

function StationRow({ station, selected, onSelect }: StationRowProps) {
  const brand = station.brand ? getBrand(station.brand) : null;

  return (
    <li>
      <button
        onClick={() => onSelect(station.id)}
        className={`flex w-full items-start gap-3 p-3 text-left hover:bg-slate-50 ${
          selected ? "bg-blue-50" : ""
        }`}
      >
        <span
          className="mt-1 inline-block h-5 w-5 shrink-0"
          style={{
            backgroundImage: `url("${iconDataUri(brand)}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-slate-900">
            {station.name}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {station.region ? REGION_LABELS[station.region as Region] : "ไม่ระบุภูมิภาค"}
            {station.kw !== null ? ` · ${station.kw} kW` : ""}
            {station.slots !== null ? ` · ${station.slots} หัว` : ""}
          </span>
        </span>
      </button>
    </li>
  );
}
