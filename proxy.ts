import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, isValidAccessToken } from "./lib/masterclass-auth";

// Protege las lecciones del masterclass Y los PDFs de las guías.
// Sin cookie válida, todo redirige a la pantalla del código en /masterclass.
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (await isValidAccessToken(token)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/masterclass";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/masterclass/leccion/:path*", "/guias/:path*"],
};
