"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/masterclass/admin", label: "Inicio" },
  { href: "/masterclass/admin/coaching", label: "Clientas" },
  { href: "/masterclass/admin/invitar", label: "Invitar" },
  { href: "/masterclass/admin/coaching/plantillas", label: "Plantillas" },
  { href: "/masterclass/admin/ejercicios", label: "Ejercicios" },
  { href: "/masterclass/admin/miembras", label: "Masterclass" },
];

export default function AdminNav() {
  const pathname = usePathname();

  // El item activo es el de href más largo que coincide (exacto o prefijo de ruta).
  let activeHref = "";
  for (const it of ITEMS) {
    const matches = pathname === it.href || pathname.startsWith(it.href + "/");
    if (matches && it.href.length > activeHref.length) activeHref = it.href;
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
      {ITEMS.map((it) => {
        const active = it.href === activeHref;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`shrink-0 whitespace-nowrap px-4 py-2 font-meta text-[11px] transition-colors ${
              active
                ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                : "text-[color:var(--ink-soft)] hover:bg-[color:var(--paper-deep)] hover:text-[color:var(--ink)]"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
