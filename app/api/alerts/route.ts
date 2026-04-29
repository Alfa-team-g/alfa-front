import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/firebase";
import { mapAlert, mapAlertRegistration } from "@/lib/server/mappers";

function isRegistrationPayload(
  body: Record<string, unknown>,
): body is {
  personId: string;
  personName: string;
  store: string;
  rule: ">=" | "<=";
  targetPoints: number;
} {
  return body.kind === "registration";
}

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const summary = searchParams.get("summary");

  if (type === "registrations" && summary === "count") {
    const pendingSnapshot = await db
      .collection("alertRegistrations")
      .where("status", "==", "aguardando")
      .where("active", "==", true)
      .get();

    return NextResponse.json({ pendingCount: pendingSnapshot.size });
  }

  if (type === "registrations") {
    const registrationsSnapshot = await db
      .collection("alertRegistrations")
      .orderBy("createdAt", "desc")
      .get();

    const registrations = registrationsSnapshot.docs.map((doc) =>
      mapAlertRegistration(doc.id, doc.data()),
    );

    return NextResponse.json({ registrations });
  }

  const alertsSnapshot = await db.collection("alerts").orderBy("triggeredAt", "desc").get();
  const alerts = alertsSnapshot.docs.map((doc) => mapAlert(doc.id, doc.data()));
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as Record<string, unknown>;
  const now = new Date().toISOString();

  if (isRegistrationPayload(body)) {
    const ref = db.collection("alertRegistrations").doc();
    await ref.set({
      id: ref.id,
      personId: body.personId,
      personName: body.personName,
      store: body.store,
      rule: body.rule,
      targetPoints: body.targetPoints,
      status: "aguardando",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  }

  const ref = db.collection("alerts").doc();
  await ref.set({
    id: ref.id,
    store: body.store,
    currentPoints: body.currentPoints,
    previousPoints: body.previousPoints,
    notifiedPeople: body.notifiedPeople ?? [],
    triggeredAt: now,
    source: body.source ?? "frontend",
    createdAt: now,
  });

  return NextResponse.json({ id: ref.id }, { status: 201 });
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = (await request.json()) as {
    id: string;
    active?: boolean;
    rule?: ">=" | "<=";
    targetPoints?: number;
    status?: "aguardando" | "concluido";
  };

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db
    .collection("alertRegistrations")
    .doc(body.id)
    .set(
      {
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.collection("alertRegistrations").doc(id).delete();
  return NextResponse.json({ ok: true });
}
