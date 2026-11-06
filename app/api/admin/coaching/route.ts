import { NextResponse } from "next/server";
import { getSessionMemberAny } from "@/lib/session";
import { validateEmail } from "@/lib/members";
import { normalizeClientType } from "@/lib/coaching";
import {
  createCoachingClient,
  setCoachingStatus,
  saveProfile,
  saveRoutine,
  saveMealPlan,
  saveTasks,
  saveRoutineTemplate,
  saveMealPlanTemplate,
  saveTaskTemplate,
  deleteTemplate,
  saveExercise,
  deleteExercise,
  setAnnouncement,
} from "@/lib/coaching-db";

export const dynamic = "force-dynamic";

// CRM de coaching de Gabi (solo isAdmin). Un switch por acción, igual que
// /api/admin/members. Toda escritura del CRM pasa por aquí.
export async function POST(request: Request) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const action = body.action as string;

  try {
    switch (action) {
      case "createClient": {
        const err = validateEmail(body.email ?? "");
        if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
        const uid = await createCoachingClient(
          body.email,
          body.fullName ?? "",
          normalizeClientType(body.clientType)
        );
        return NextResponse.json({ ok: true, uid });
      }
      case "setStatus": {
        if (!body.uid || (body.status !== "active" && body.status !== "revoked")) {
          return NextResponse.json({ ok: false }, { status: 400 });
        }
        await setCoachingStatus(body.uid, body.status);
        return NextResponse.json({ ok: true });
      }
      case "saveProfile":
        await saveProfile(body.uid, body.profile, {
          whatsapp: body.whatsapp,
          clientType: body.clientType ? normalizeClientType(body.clientType) : undefined,
        });
        return NextResponse.json({ ok: true });
      case "saveRoutine":
        await saveRoutine(body.uid, body.routine);
        return NextResponse.json({ ok: true });
      case "saveMealPlan":
        await saveMealPlan(body.uid, body.mealPlan);
        return NextResponse.json({ ok: true });
      case "saveTasks":
        await saveTasks(body.uid, body.tasks ?? []);
        return NextResponse.json({ ok: true });
      case "saveTemplate": {
        if (body.kind === "routine") await saveRoutineTemplate(body.template);
        else if (body.kind === "mealPlan") await saveMealPlanTemplate(body.template);
        else if (body.kind === "task") await saveTaskTemplate(body.template);
        else return NextResponse.json({ ok: false }, { status: 400 });
        return NextResponse.json({ ok: true });
      }
      case "deleteTemplate":
        await deleteTemplate(body.kind, body.id);
        return NextResponse.json({ ok: true });
      case "saveExercise": {
        const id = await saveExercise(body.exercise);
        return NextResponse.json({ ok: true, id });
      }
      case "deleteExercise":
        await deleteExercise(body.id);
        return NextResponse.json({ ok: true });
      case "setAnnouncement":
        await setAnnouncement(body.announcement);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ ok: false, error: "acción inválida" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "error" },
      { status: 500 }
    );
  }
}
