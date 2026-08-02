export type Region = "central" | "isan" | "north" | "east" | "south";

export type StationSource = "clubcharge" | "user";

export type StationStatus = "pending" | "approved" | "rejected";

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kw: number | null;
  amp: number | null;
  slots: number | null;
  region: Region | null;
  brand: string | null;
  source: StationSource;
  status: StationStatus;
}

export type StationInsert = Omit<Station, "id" | "status" | "source"> & {
  source: StationSource;
  status: StationStatus;
};

export interface StationFilters {
  region: Region | "all";
  brands: string[];
  minKw: number | null;
  query: string;
}

export interface BrandInfo {
  id: string;
  label: string;
  keywords: string[];
  app: string | null;
  color: string;
}

export interface MapTheme {
  id: string;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
}
