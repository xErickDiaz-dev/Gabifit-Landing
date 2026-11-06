import { NextResponse } from "next/server";
import { getSessionMemberAny } from "@/lib/session";
import { readPhoto } from "@/lib/coaching-db";

export const dynamic = "force-dynamic";

// Sirve imágenes COMPARTIDAS de la librería de ejercicios (no son privadas por
// usuario, pero sí solo para gente con sesión). Distinta de /api/coaching/photo,
// que es privada por uid.
export async function GET(request: Request) {
  const me = await getSessionMemberAny();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!/^library\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(path)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const asset = await readPhoto(path);
  if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(asset.buffer), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
