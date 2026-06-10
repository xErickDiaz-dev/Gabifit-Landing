import { cookies } from "next/headers";
import { ACCESS_COOKIE, isValidAccessToken } from "@/lib/masterclass-auth";
import AccessGate from "./AccessGate";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function MasterclassPage() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const authed = await isValidAccessToken(token);
  return authed ? <Dashboard /> : <AccessGate />;
}
