import { NextResponse } from "next/server";
import { getCoachingClient } from "@/lib/session";
import { toggleTaskCompletion } from "@/lib/coaching-db";

export const dynamic = "force-dynamic";

// La clienta marca/desmarca una tarea en una fecha. El uid sale de la sesión:
// solo puede escribir SUS propias tareas.
export async function POST(request: Request) {
  const me = await getCoachingClient();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const { taskId, date, done } = await request.json().catch(() => ({}));
  if (typeof taskId !== "string" || typeof date !== "string" || typeof done !== "boolean") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await toggleTaskCompletion(me.uid, taskId, date, done);
  return NextResponse.json({ ok: true });
}
