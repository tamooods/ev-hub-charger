export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLng = (b.lng - a.lng) * DEG_TO_RAD;
  const lat1 = a.lat * DEG_TO_RAD;
  const lat2 = b.lat * DEG_TO_RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function distanceToSegmentKm(p: LatLng, a: LatLng, b: LatLng): number {
  const pX = p.lng;
  const pY = p.lat;
  const aX = a.lng;
  const aY = a.lat;
  const bX = b.lng;
  const bY = b.lat;

  const dx = bX - aX;
  const dy = bY - aY;
  const lengthSq = dx * dx + dy * dy;

  let t = 0;
  if (lengthSq > 0) {
    t = ((pX - aX) * dx + (pY - aY) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
  }

  const projX = aX + t * dx;
  const projY = aY + t * dy;

  return haversineKm(p, { lat: projY, lng: projX });
}

export function distanceToPolylineKm(p: LatLng, polyline: LatLng[]): number {
  if (polyline.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  if (polyline.length === 1) {
    return haversineKm(p, polyline[0]);
  }

  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(p, polyline[i], polyline[i + 1]);
    if (d < min) {
      min = d;
    }
  }
  return min;
}

export function routeLengthKm(polyline: LatLng[]): number {
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineKm(polyline[i], polyline[i + 1]);
  }
  return total;
}
