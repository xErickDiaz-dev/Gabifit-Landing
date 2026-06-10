import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  createAccessToken,
  normalizeCode,
} from "@/lib/masterclass-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown };
    const submitted =
      typeof body.code === "string" ? normalizeCode(body.code) : "";
    const configured = process.env.MASTERCLASS_CODE
      ? normalizeCode(process.env.MASTERCLASS_CODE)
      : "";

    if (!configured || !submitted || submitted !== configured) {
      // Pequeña pausa para frenar intentos de adivinar el código por fuerza bruta
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const token = await createAccessToken(configured);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_MAX_AGE,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
