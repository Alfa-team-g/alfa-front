import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/firebase";
import { mapScheduler } from "@/lib/server/mappers";
import type { SchedulerState } from "@/lib/store";

const defaultScheduler: SchedulerState = {
  isRunning: false,
  isEnabled: true,
  frequency: "30min",
  lastScanTime: null,
};

export async function GET() {
  const db = getDb();
  const snapshot = await db.collection("scheduler").doc("config").get();
  if (!snapshot.exists) {
    return NextResponse.json({ scheduler: defaultScheduler });
  }

  const scheduler = mapScheduler(snapshot.data() ?? {});
  return NextResponse.json({ scheduler });
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = (await request.json()) as Partial<SchedulerState>;

  await db.collection("scheduler").doc("config").set(
    {
      ...body,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}
