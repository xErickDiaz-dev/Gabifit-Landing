import { getPendingMembers, getAllMembers } from "@/lib/members-db";
import { getClientLessons } from "@/lib/lessons-db";
import AdminPanel from "../AdminPanel";

export const dynamic = "force-dynamic";

// Administración de miembras de la Masterclass (el gate isAdmin lo hace el layout).
export default async function MiembrasPage() {
  const [pending, members, lessons] = await Promise.all([
    getPendingMembers(),
    getAllMembers(),
    getClientLessons(),
  ]);

  return <AdminPanel pending={pending} members={members} totalLessons={lessons.length} />;
}
