import { cookies } from "next/headers";
import { ACCESS_COOKIE, isValidAccessToken } from "@/lib/masterclass-auth";
import AccessGate from "./AccessGate";
import Dashboard from "./Dashboard";
import {
  GUIDES,
  MEDICAL_DISCLAIMER,
  PHASES,
  toClientLessons,
} from "./lessons";

export const dynamic = "force-dynamic";

export default async function MasterclassPage() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const authed = await isValidAccessToken(token);

  if (!authed) return <AccessGate />;

  // Los datos viajan como props server→cliente SOLO con código válido,
  // y sin videoUrl (toClientLessons) — nunca en el JS público.
  return (
    <Dashboard
      phases={PHASES}
      lessons={toClientLessons()}
      guides={GUIDES}
      disclaimer={MEDICAL_DISCLAIMER}
    />
  );
}
