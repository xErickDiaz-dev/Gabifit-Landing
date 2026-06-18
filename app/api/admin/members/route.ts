import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionMemberAny } from "@/lib/session";
import { validateEmail } from "@/lib/members";

export const dynamic = "force-dynamic";

const STATUS_FOR: Record<string, "active" | "revoked"> = {
  approve: "active",
  activate: "active",
  reject: "revoked",
  revoke: "revoked",
};

// Panel de Gabi (solo isAdmin):
//  - approve/activate → active ; reject/revoke → revoked (sobre un uid)
//  - create → alta manual por correo (crea cuenta active; fija contraseña por email)
export async function POST(request: Request) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const action = body.action;

  // Alta manual
  if (action === "create") {
    const email = (body.email ?? "").trim().toLowerCase();
    const fullName = (body.fullName ?? "").trim();
    const err = validateEmail(email);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

    let user = await adminAuth().getUserByEmail(email).catch(() => null);
    if (!user) user = await adminAuth().createUser({ email });

    await adminDb()
      .collection("members")
      .doc(user.uid)
      .set(
        {
          email,
          fullName: fullName || null,
          status: "active",
          isAdmin: false,
          source: "alta-manual",
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    return NextResponse.json({ ok: true });
  }

  // activar / revocar
  const uid = body.uid;
  const status = STATUS_FOR[action];
  if (!uid || !status) return NextResponse.json({ ok: false }, { status: 400 });

  await adminDb().collection("members").doc(uid).update({ status });
  if (status === "revoked") {
    try {
      await adminAuth().revokeRefreshTokens(uid);
    } catch {
      /* puede no existir en Auth; el estado revoked basta */
    }
  }
  return NextResponse.json({ ok: true });
}
