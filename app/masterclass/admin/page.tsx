import { notFound } from "next/navigation";
import { getSessionMemberAny } from "@/lib/session";
import { getPendingMembers, getAllMembers } from "@/lib/members-db";
import { getClientLessons } from "@/lib/lessons-db";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) notFound();

  const [pending, members, lessons] = await Promise.all([
    getPendingMembers(),
    getAllMembers(),
    getClientLessons(),
  ]);

  return <AdminPanel pending={pending} members={members} totalLessons={lessons.length} />;
}
