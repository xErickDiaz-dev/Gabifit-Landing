import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getSessionMemberAny } from "@/lib/session";

export const dynamic = "force-dynamic";

// Aprueba (→ active) o rechaza (→ revoked) a una miembra. Solo admins.
export async function POST(request: Request) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) return NextResponse.json({ ok: false }, { status: 403 });

  const { uid, action } = await request.json().catch(() => ({ uid: null, action: null }));
  if (!uid || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const status = action === "approve" ? "active" : "revoked";
  await adminDb().collection("members").doc(uid).update({ status });
  if (action === "reject") {
    try {
      await adminAuth().revokeRefreshTokens(uid);
    } catch {
      /* puede no existir en Auth; el estado revoked basta */
    }
  }
  return NextResponse.json({ ok: true });
}
