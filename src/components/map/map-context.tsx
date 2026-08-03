import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_THEME_ID, MAP_THEMES } from "@/lib/map";
import type { LatLng } from "@/lib/geo";
import type { Region } from "@/lib/types";

export interface MapContextValue {
  themeId: string;
  setThemeId: (themeId: string) => void;
  selectedStationId: string | null;
  selectStation: (id: string | null) => void;
  focusPoint: LatLng | null;
  setFocusPoint: (point: LatLng | null) => void;
  map: L.Map | null;
  setMap: (map: L.Map | null) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const value = useContext(MapContext);
  if (!value) {
    throw new Error("useMapContext must be used within MapProvider");
  }
  return value;
}

interface MapProviderProps {
  children: React.ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [focusPoint, setFocusPoint] = useState<LatLng | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  const selectStation = useCallback((id: string | null) => {
    setSelectedStationId(id);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      selectedStationId,
      selectStation,
      focusPoint,
      setFocusPoint,
      map,
      setMap,
    }),
    [themeId, selectedStationId, selectStation, focusPoint, map],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export interface MapShellProps {
  children: React.ReactNode;
  initialRegion?: Region;
}

export function MapShell({ children }: MapShellProps) {
  const { themeId, setMap } = useMapContext();
  const theme = MAP_THEMES.find((t) => t.id === themeId) ?? MAP_THEMES[0];
  const [mountKey, setMountKey] = useState(0);

  useLayoutEffect(() => {
    return () => {
      setMountKey((k) => k + 1);
    };
  }, []);

  return (
    <MapContainer
      key={mountKey}
      ref={setMap}
      center={[13.7367, 100.5231]}
      zoom={6}
      maxZoom={20}
      className="h-full w-full"
      attributionControl={true}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url={theme.url}
        attribution={theme.attribution}
        maxZoom={theme.maxZoom}
      />
      {children}
    </MapContainer>
  );
}

export { Region };
