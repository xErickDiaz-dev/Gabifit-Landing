import { notFound } from "next/navigation";
import { getSessionMemberAny } from "@/lib/session";
import { getPendingMembers } from "@/lib/members-db";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) notFound();
  const pending = await getPendingMembers();
  return <AdminPanel pending={pending} />;
}
