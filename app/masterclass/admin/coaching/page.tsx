import Link from "next/link";
import { getCoachingClients } from "@/lib/coaching-db";
import ClientsList from "./ClientsList";

export const dynamic = "force-dynamic";

// Lista de clientas de coaching (el gate isAdmin lo hace el layout del panel).
export default async function CoachingClientsPage() {
  const clients = await getCoachingClients();

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl">
            Tus <em className="marker pr-1">clientas</em>
          </h1>
          <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
            {clients.length} clienta{clients.length === 1 ? "" : "s"} de coaching
          </p>
        </div>
        <Link href="/masterclass/admin/invitar" className="btn-ink">
          + Dar acceso
        </Link>
      </div>

      <div className="mt-8">
        <ClientsList clients={clients} />
      </div>
    </main>
  );
}
