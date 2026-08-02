import type { MapTheme, Region } from "@/lib/types";

export const MAP_THEMES: MapTheme[] = [
  {
    id: "contrast",
    label: "Contrast",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
  {
    id: "bright",
    label: "Bright",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  {
    id: "terrain",
    label: "Terrain",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
];

export const DEFAULT_THEME_ID = "contrast";

export const REGION_LABELS: Record<Region, string> = {
  central: "ภาคกลาง",
  isan: "ภาคอีสาน",
  north: "ภาคเหนือ",
  east: "ภาคตะวันออก",
  south: "ภาคใต้",
};

export const ALL_REGIONS: Region[] = ["north", "isan", "central", "east", "south"];

export const MIN_KW_OPTIONS: number[] = [0, 120, 180, 240, 360];
