import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSessionMember } from "@/lib/session";

export const dynamic = "force-dynamic";

// Sirve los PDFs de las guías SOLO a miembras activas. Los archivos viven en
// `protected/guias/` (fuera de /public) para que no sean accesibles sin sesión.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { file } = await params;
  if (!/^[a-z0-9-]+\.pdf$/i.test(file)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    const buf = await readFile(path.join(process.cwd(), "protected", "guias", file));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
