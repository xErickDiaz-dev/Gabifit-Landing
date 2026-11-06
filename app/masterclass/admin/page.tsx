import { getCoachingClients, getAnnouncement } from "@/lib/coaching-db";
import { isoDate } from "@/lib/coaching";
import CoachingDashboard from "./CoachingDashboard";

export const dynamic = "force-dynamic";

// Inicio del panel: día a día del coaching (el gate isAdmin lo hace el layout).
export default async function AdminHomePage() {
  const [clients, announcement] = await Promise.all([
    getCoachingClients(),
    getAnnouncement(),
  ]);

  return (
    <CoachingDashboard clients={clients} today={isoDate(new Date())} announcement={announcement} />
  );
}
