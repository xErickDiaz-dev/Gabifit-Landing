import { NextResponse } from "next/server";
import { getCoachingClient } from "@/lib/session";
import { logWorkout } from "@/lib/coaching-db";
import { isoDate } from "@/lib/coaching";

export const dynamic = "force-dynamic";

// La clienta registra que completó un día de entrenamiento (hoy).
export async function POST(request: Request) {
  const me = await getCoachingClient();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const { dayLabel } = await request.json().catch(() => ({}));
  if (typeof dayLabel !== "string" || !dayLabel) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await logWorkout(me.uid, dayLabel, isoDate(new Date()));
  return NextResponse.json({ ok: true });
}
