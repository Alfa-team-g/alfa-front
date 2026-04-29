import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/firebase";
import { mapPerson } from "@/lib/server/mappers";

export async function GET() {
  const db = getDb();
  const snapshot = await db.collection("people").orderBy("createdAt", "desc").get();
  const people = snapshot.docs.map((doc) => mapPerson(doc.id, doc.data()));
  return NextResponse.json({ people });
}

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as {
    name?: string;
    store?: string;
    desiredPoints?: number;
  };

  if (!body.name || !body.store) {
    return NextResponse.json({ error: "name and store are required" }, { status: 400 });
  }

  const ref = db.collection("people").doc();
  const now = new Date().toISOString();
  await ref.set({
    id: ref.id,
    name: body.name,
    store: body.store,
    desiredPoints: Number(body.desiredPoints ?? 0),
    status: "waiting",
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: ref.id }, { status: 201 });
}

export async function PUT(request: Request) {
  const db = getDb();
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    store?: string;
    desiredPoints?: number;
    status?: "waiting" | "triggered";
    active?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.collection("people").doc(body.id).set(
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

  await db.collection("people").doc(id).delete();
  return NextResponse.json({ ok: true });
}
