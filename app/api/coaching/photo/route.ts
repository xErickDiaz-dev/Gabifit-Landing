import { NextResponse } from "next/server";
import { getSessionMemberAny } from "@/lib/session";
import { readPhoto } from "@/lib/coaching-db";

export const dynamic = "force-dynamic";

// Sirve una foto de progreso desde Firebase Storage, comprobando propiedad.
// La clienta solo ve SUS fotos (coaching/{uid}/...); Gabi (isAdmin) ve todas.
export async function GET(request: Request) {
  const me = await getSessionMemberAny();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!/^coaching\/[^/]+\/progress\/[^/]+\/\d+\.(jpg|png|webp)$/.test(path)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const ownsIt = path.startsWith(`coaching/${me.uid}/`);
  if (!ownsIt && !me.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const photo = await readPhoto(path);
  if (!photo) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(photo.buffer), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
