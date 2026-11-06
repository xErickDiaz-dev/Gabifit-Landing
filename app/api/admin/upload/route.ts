import { NextResponse } from "next/server";
import { getSessionMemberAny } from "@/lib/session";
import { uploadLibraryImage } from "@/lib/coaching-db";

export const dynamic = "force-dynamic";

function parseDataUrl(s: string): { buffer: Buffer; contentType: string } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(s);
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}

// Subida de imágenes de la librería de ejercicios (cartoon/foto). Solo admin.
// Recibe { id, dataUrl } y devuelve la ruta en Storage para guardar en el ejercicio.
export async function POST(request: Request) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) return NextResponse.json({ ok: false }, { status: 403 });

  const { id, dataUrl } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !id || typeof dataUrl !== "string") {
    return NextResponse.json({ ok: false, error: "datos inválidos" }, { status: 400 });
  }
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return NextResponse.json({ ok: false, error: "imagen inválida" }, { status: 400 });
  if (parsed.buffer.length > 6 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "imagen muy grande" }, { status: 400 });
  }

  const path = await uploadLibraryImage(id, parsed.buffer, parsed.contentType);
  return NextResponse.json({ ok: true, path });
}
