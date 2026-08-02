"use client";

import { useActionState } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { approveStationAction, rejectStationAction } from "@/app/actions";
import { getBrand } from "@/lib/brands";
import { REGION_LABELS } from "@/lib/map";
import type { Region, Station } from "@/lib/types";

interface AdminPanelProps {
  stations: Station[];
}

export function AdminPanel({ stations }: AdminPanelProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold">
          สถานีที่รอตรวจสอบ ({stations.length})
        </h1>
        {stations.length === 0 ? (
          <p className="text-sm text-slate-500">ไม่มีสถานีที่รอตรวจสอบ</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {stations.map((station) => (
              <PendingStationRow key={station.id} station={station} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PendingStationRow({ station }: { station: Station }) {
  const brand = station.brand ? getBrand(station.brand) : null;

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="font-medium text-slate-900">{station.name}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {station.region ? REGION_LABELS[station.region as Region] : "ไม่ระบุภูมิภาค"}
          {station.kw !== null && ` · ${station.kw} kW`}
          {station.amp !== null && ` · ${station.amp} A`}
          {station.slots !== null && ` · ${station.slots} หัวชาร์จ`}
          {brand && ` · ${brand.label}`}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
        </p>
      </div>
      <div className="flex gap-2">
        <ApproveButton id={station.id} />
        <RejectButton id={station.id} />
      </div>
    </li>
  );
}

function ApproveButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(approveStationAction, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "กำลัง..." : "อนุมัติ"}
      </button>
      {state.message && <span className="ml-2 text-xs text-slate-500">{state.message}</span>}
    </form>
  );
}

function RejectButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(rejectStationAction, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "กำลัง..." : "ปฏิเสธ"}
      </button>
      {state.message && <span className="ml-2 text-xs text-slate-500">{state.message}</span>}
    </form>
  );
}
