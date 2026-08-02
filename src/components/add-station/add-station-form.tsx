"use client";

import { useActionState, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

import { SiteHeader } from "@/components/layout/site-header";
import { DEFAULT_THEME_ID, MAP_THEMES, REGION_LABELS, ALL_REGIONS } from "@/lib/map";
import { submitStationAction, type SubmitStationState } from "@/app/actions";
import type { Region } from "@/lib/types";

const initialState: SubmitStationState = { ok: false, message: "" };

function createPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid #fff;border-radius:9999px;box-shadow:0 1px 6px rgba(0,0,0,.5)"></div>`,
  });
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function PanToPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.panTo([lat, lng]);
  return null;
}

export function AddStationForm() {
  const [state, formAction, pending] = useActionState(
    submitStationAction,
    initialState
  );
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const theme = MAP_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ?? MAP_THEMES[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="mb-1 text-xl font-bold">เพิ่มสถานีชาร์จ EV</h1>
        <p className="mb-6 text-sm text-slate-600">
          ช่วยเพิ่มสถานีชาร์จที่ยังไม่มีในแผนที่ของเรา ข้อมูลจะถูกตรวจสอบก่อนเผยแพร่
        </p>

        <div className="mb-4 h-72 overflow-hidden rounded-xl border border-slate-300">
          <MapContainer
            center={[13.7367, 100.5231]}
            zoom={6}
            className="h-full w-full"
          >
            <TileLayer
              url={theme.url}
              attribution={theme.attribution}
              maxZoom={theme.maxZoom}
            />
            <ClickToPlace
              onPick={(nextLat, nextLng) => {
                setLat(nextLat);
                setLng(nextLng);
              }}
            />
            {lat !== null && lng !== null && (
              <>
                <Marker position={[lat, lng]} icon={createPinIcon()} />
                <PanToPosition lat={lat} lng={lng} />
              </>
            )}
          </MapContainer>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          คลิกบนแผนที่เพื่อเลือกตำแหน่งของสถานี{lat !== null && lng !== null && ` (${lat.toFixed(5)}, ${lng.toFixed(5)})`}
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="lat" value={lat ?? ""} />
          <input type="hidden" name="lng" value={lng ?? ""} />

          <Field label="ชื่อสถานี">
            <input
              name="name"
              type="text"
              required
              placeholder="เช่น HUB PTT สาขา... หรือ OneCharge - ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </Field>

          <Field label="ภูมิภาค">
            <select
              name="region"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">ไม่ระบุ</option>
              {ALL_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {REGION_LABELS[region as Region]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="กำลังชาร์จสูงสุด (kW)">
              <input
                name="kw"
                type="number"
                min="0"
                placeholder="180"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </Field>
            <Field label="กระแส (A)">
              <input
                name="amp"
                type="number"
                min="0"
                placeholder="300"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </Field>
            <Field label="จำนวนหัวชาร์จ">
              <input
                name="slots"
                type="number"
                min="0"
                placeholder="4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </Field>
          </div>

          {state.message && (
            <p
              className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}
              role={state.ok ? "status" : "alert"}
            >
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || lat === null || lng === null}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "กำลังส่ง..." : "ส่งข้อมูลสถานี"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
