"use server";

import { updateTag } from "next/cache";

import { submitStation, updateStationStatus } from "@/lib/stations";

export interface SubmitStationState {
  ok: boolean;
  message: string;
}

export async function submitStationAction(
  _previousState: SubmitStationState,
  formData: FormData
): Promise<SubmitStationState> {
  const name = String(formData.get("name") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const region = String(formData.get("region") ?? "");
  const kwRaw = String(formData.get("kw") ?? "").trim();
  const ampRaw = String(formData.get("amp") ?? "").trim();
  const slotsRaw = String(formData.get("slots") ?? "").trim();

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, message: "กรุณากรอกชื่อสถานีและเลือกตำแหน่งบนแผนที่" };
  }

  const result = await submitStation({
    name,
    lat,
    lng,
    region: region === "" ? null : (region as never),
    kw: kwRaw === "" ? null : Number(kwRaw),
    amp: ampRaw === "" ? null : Number(ampRaw),
    slots: slotsRaw === "" ? null : Number(slotsRaw),
  });

  return result.ok
    ? { ok: true, message: "ส่งข้อมูลสำเร็จ รอการอนุมัติจากทีมงาน" }
    : { ok: false, message: result.message };
}

export async function approveStationAction(
  _previousState: SubmitStationState,
  formData: FormData
): Promise<SubmitStationState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateStationStatus(id, "approved");
  if (result.ok) {
    updateTag("stations");
  }
  return result.ok
    ? { ok: true, message: "อนุมัติแล้ว" }
    : { ok: false, message: result.message };
}

export async function rejectStationAction(
  _previousState: SubmitStationState,
  formData: FormData
): Promise<SubmitStationState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateStationStatus(id, "rejected");
  return result.ok
    ? { ok: true, message: "ปฏิเสธแล้ว" }
    : { ok: false, message: result.message };
}
