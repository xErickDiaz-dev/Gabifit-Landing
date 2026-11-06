import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSessionMemberAny } from "@/lib/session";
import { LOGO_INK } from "../branding";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

// Shell común de TODO el panel admin: centraliza el gate isAdmin y pinta la
// barra de menú (sidebar en desktop, barra scroll arriba en móvil).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
      <header className="flex items-center justify-between border-b-2 border-[color:var(--ink)] pb-3">
        <Link href="/masterclass/admin" className="flex items-center gap-3">
          <Image src={LOGO_INK} alt="Gabifit" width={120} height={42} className="h-auto w-24" priority />
          <span className="font-meta text-[10px] text-[color:var(--ink-soft)]">Panel</span>
        </Link>
        <Link
          href="/masterclass"
          className="font-meta text-[10px] text-[color:var(--ink-soft)] hover:text-[color:var(--grape)]"
        >
          Salir del panel →
        </Link>
      </header>

      <div className="mt-5 md:flex md:gap-8">
        <aside className="md:sticky md:top-6 md:h-fit md:w-48 md:shrink-0">
          <AdminNav />
        </aside>
        <div className="mt-4 min-w-0 flex-1 md:mt-0">{children}</div>
      </div>
    </div>
  );
}
