"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberRow } from "@/lib/members-db";

const STATUS: Record<MemberRow["status"], { label: string; dot: string }> = {
  active: { label: "Activa", dot: "🟢" },
  pending: { label: "En espera", dot: "🟡" },
  revoked: { label: "Sin acceso", dot: "🔴" },
};

// "hace 2 días" — relativo y en español, sin librerías.
function timeAgo(iso: string | null): string {
  if (!iso) return "nunca";
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days} día${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months === 1 ? "" : "es"}`;
}

export default function MembersTable({
  members,
  totalLessons,
}: {
  members: MemberRow[];
  totalLessons: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      (m) =>
        (m.fullName ?? "").toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle)
    );
  }, [members, q]);

  async function act(uid: string, action: "activate" | "revoke") {
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
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl md:text-4xl">
          Tus <em className="marker-lilac pr-1">miembras</em>
        </h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="input-line w-full max-w-xs"
        />
      </div>

      <div className="mt-6 border-t-2 border-[color:var(--ink)]">
        {filtered.length === 0 && (
          <p className="font-meta py-6 text-[11px] text-[color:var(--ink-soft)]">
            No hay miembras que coincidan.
          </p>
        )}
        {filtered.map((m) => {
          const pct = totalLessons > 0 ? Math.round((m.completedCount / totalLessons) * 100) : 0;
          return (
            <div
              key={m.uid}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--ink)]/15 py-5"
            >
              {/* Identidad */}
              <div className="min-w-[180px] flex-1">
                <p className="text-lg leading-snug">{m.fullName ?? "—"}</p>
                <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{m.email}</p>
                {m.whatsapp && (
                  <p className="font-meta mt-1 text-[10px] text-[color:var(--grape)]">{m.whatsapp}</p>
                )}
              </div>

              {/* Estado + última conexión */}
              <div className="min-w-[120px]">
                <p className="text-sm">
                  {STATUS[m.status].dot} {STATUS[m.status].label}
                </p>
                <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">
                  Entró {timeAgo(m.lastSignIn)}
                </p>
              </div>

              {/* Progreso */}
              <div className="min-w-[140px]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--paper-deep)]">
                  <div className="h-full bg-[color:var(--neon)]" style={{ width: `${pct}%` }} />
                </div>
                <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">
                  {m.completedCount} de {totalLessons} lecciones
                </p>
              </div>

              {/* Acción */}
              <div className="shrink-0">
                {m.status === "active" ? (
                  <button
                    onClick={() => act(m.uid, "revoke")}
                    disabled={busy === m.uid}
                    className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px] text-[color:var(--ink-soft)] disabled:opacity-60"
                  >
                    {busy === m.uid ? "…" : "Quitar acceso"}
                  </button>
                ) : (
                  <button
                    onClick={() => act(m.uid, "activate")}
                    disabled={busy === m.uid}
                    className="btn-ink disabled:opacity-60"
                  >
                    {busy === m.uid ? "…" : "Dar acceso"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
