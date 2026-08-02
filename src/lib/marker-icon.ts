import L from "leaflet";

import type { BrandInfo } from "@/lib/types";

const EV_STATION_PATH =
  "M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 " +
  "0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 11v8H6V5h6v6zm6-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z";

function badgePath(color: string, size: number): string {
  const r = size / 2;
  return `<circle cx="${r}" cy="${r}" r="${r - 1}" fill="#ffffff" stroke="${color}" stroke-width="1.5"/>`;
}

export function buildStationSvg(color: string, size = 24): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${badgePath(color, size)}
    <path d="${EV_STATION_PATH}" fill="${color}" transform="translate(${size / 2 - 12} ${size / 2 - 12}) scale(0.94)"/>
  </svg>`;
}

function logoFrameHtml(url: string, color: string): string {
  return `<div style="width:30px;height:30px;border-radius:9999px;background:#fff;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.3);overflow:hidden">
    <img src="${url}" alt="" style="width:20px;height:20px;object-fit:contain"/>
  </div>`;
}

export function createStationIcon(brand: BrandInfo | null): L.DivIcon {
  const color = brand?.color ?? "#0ea5e9";
  if (brand?.logoUrl) {
    return L.divIcon({
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      html: logoFrameHtml(brand.logoUrl, color),
    });
  }
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: buildStationSvg(color, 30),
  });
}

export function buildBrandSvg(brand: BrandInfo | null, size = 20): string {
  const color = brand?.color ?? "#0ea5e9";
  if (brand?.logoUrl) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${badgePath(color, size)}
      <image href="${brand.logoUrl}" x="${size * 0.18}" y="${size * 0.18}" width="${size * 0.64}" height="${size * 0.64}" preserveAspectRatio="xMidYMid meet"/>
    </svg>`;
  }
  return buildStationSvg(color, size);
}
