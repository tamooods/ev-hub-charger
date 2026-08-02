import { ALL_REGIONS, MIN_KW_OPTIONS, REGION_LABELS } from "@/lib/map";
import { getBrands } from "@/lib/brands";
import Image from "next/image";
import type { Station, StationFilters } from "@/lib/types";

interface FilterPanelProps {
  stations: Station[];
  filters: StationFilters;
  onChange: (patch: Partial<StationFilters>) => void;
}

export function FilterPanel({ stations, filters, onChange }: FilterPanelProps) {
  const brands = getBrands().map((brand) => ({
    ...brand,
    count: stations.filter((station) => station.brand === brand.id).length,
  }));

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        placeholder="ค้นหาสถานี..."
        value={filters.query}
        onChange={(event) => onChange({ query: event.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onChange({ region: "all" })}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filters.region === "all"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          ทั้งหมด
        </button>
        {ALL_REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => onChange({ region })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filters.region === region
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {REGION_LABELS[region]}
          </button>
        ))}
      </div>
      <select
        value={filters.minKw ?? 0}
        onChange={(event) => {
          const value = Number(event.target.value);
          onChange({ minKw: value === 0 ? null : value });
        }}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        {MIN_KW_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value === 0 ? "กำลังชาร์จทั้งหมด" : `ตั้งแต่ ${value} kW ขึ้นไป`}
          </option>
        ))}
      </select>
      <div className="flex flex-col gap-1">
        {brands
          .filter((brand) => brand.count > 0)
          .map((brand) => (
            <label key={brand.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand.id)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...filters.brands, brand.id]
                    : filters.brands.filter((id) => id !== brand.id);
                  onChange({ brands: next });
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.label}
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: brand.color }}
                />
              )}
              <span className="text-slate-700">{brand.label}</span>
              <span className="ml-auto text-xs text-slate-400">{brand.count}</span>
            </label>
          ))}
      </div>
    </div>
  );
}
