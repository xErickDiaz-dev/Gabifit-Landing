"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PendingMemberRow, MemberRow } from "@/lib/members-db";
import AltaManual from "./AltaManual";
import MembersTable from "./MembersTable";

export default function AdminPanel({
  pending,
  members,
  totalLessons,
}: {
  pending: PendingMemberRow[];
  members: MemberRow[];
  totalLessons: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const activas = members.filter((m) => m.status === "active").length;

  async function act(uid: string, action: "approve" | "reject") {
    if (busy) return;
    setBusy(uid);
    try {
      await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      {/* Encabezado + resumen */}
      <h1 className="text-4xl md:text-5xl">
        Tu <em className="marker pr-1">panel</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        {members.length} miembra{members.length === 1 ? "" : "s"} · {activas} activa
        {activas === 1 ? "" : "s"} · {pending.length} en espera
      </p>

      {/* Bloque 1 — Solicitudes en espera */}
      <section className="mt-10">
        <h2 className="text-2xl md:text-3xl">
          Solicitudes <em className="marker pr-1">en espera</em>
        </h2>
        {pending.length === 0 ? (
          <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
            No hay solicitudes nuevas.
          </p>
        ) : (
          <div className="mt-5 border-t-2 border-[color:var(--ink)]">
            {pending.map((p) => (
              <div
                key={p.uid}
                className="flex flex-wrap items-center gap-4 border-b border-[color:var(--ink)]/15 py-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-snug">{p.fullName ?? "—"}</p>
                  <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{p.email}</p>
                  <p className="font-meta mt-1 text-[10px] text-[color:var(--grape)]">
                    {p.whatsapp ?? "sin WhatsApp"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(p.uid, "approve")}
                    disabled={busy === p.uid}
                    className="btn-ink disabled:opacity-60"
                  >
                    {busy === p.uid ? "…" : "Aprobar"}
                  </button>
                  <button
                    onClick={() => act(p.uid, "reject")}
                    disabled={busy === p.uid}
                    className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px] text-[color:var(--ink-soft)] disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Alta manual */}
      <div className="mt-10">
        <AltaManual />
      </div>

      {/* Bloque 2 — Todas las miembras */}
      <MembersTable members={members} totalLessons={totalLessons} />
    </main>
  );
}
