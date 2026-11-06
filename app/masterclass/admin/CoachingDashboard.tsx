"use client";

import { useState } from "react";
import Link from "next/link";
import {
  attentionReasons,
  waLink,
  CLIENT_TYPE_LABEL,
  type CoachingClientSummary,
  type Announcement,
} from "@/lib/coaching";

function StatCard({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`${accent ? "plate-neon" : "plate"} bg-[color:var(--paper)] p-4`}>
      <p className="text-3xl md:text-4xl">{value}</p>
      <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{label}</p>
    </div>
  );
}

export default function CoachingDashboard({
  clients,
  today,
  announcement: initialAnnouncement,
}: {
  clients: CoachingClientSummary[];
  today: string;
  announcement: Announcement;
}) {
  const activasSemana = clients.filter((c) => c.workoutsThisWeek > 0).length;
  const avgAdherence = clients.length
    ? Math.round(clients.reduce((s, c) => s + c.adherence, 0) / clients.length)
    : 0;

  const attention = clients
    .map((c) => ({ c, reasons: attentionReasons(c, today) }))
    .filter((x) => x.reasons.length > 0);

  return (
    <main>
      <h1 className="text-4xl md:text-5xl">
        Tu <em className="marker pr-1">día a día</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        {clients.length} clienta{clients.length === 1 ? "" : "s"} de coaching
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard value={`${clients.length}`} label="clientas activas" />
        <StatCard value={`${activasSemana}`} label="entrenaron esta semana" accent={activasSemana > 0} />
        <StatCard value={`${avgAdherence}%`} label="adherencia promedio" />
      </div>

      {/* Anuncio */}
      <AnnouncementEditor initial={initialAnnouncement} />

      {/* Necesitan atención */}
      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl">
          Necesitan <em className="marker-lilac pr-1">atención</em>
        </h2>
        <div className="mt-5 border-t-2 border-[color:var(--ink)]">
          {attention.length === 0 && (
            <p className="font-meta py-6 text-[11px] text-[color:var(--ink-soft)]">
              ¡Todo al día! Nadie necesita atención urgente. 🎉
            </p>
          )}
          {attention.map(({ c, reasons }) => {
            const wa = waLink(
              c.whatsapp,
              `¡Hola ${c.fullName?.split(" ")[0] ?? ""}! Soy Gabi 💜 ¿cómo vas con tu plan?`
            );
            return (
              <div
                key={c.uid}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--ink)]/15 py-4"
              >
                <div className="min-w-[180px] flex-1">
                  <Link href={`/masterclass/admin/coaching/${c.uid}`} className="text-lg leading-snug hover:text-[color:var(--grape)]">
                    {c.fullName ?? c.email}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {reasons.map((r) => (
                      <span key={r} className="border border-[color:var(--grape)] px-2 py-0.5 font-meta text-[9px] text-[color:var(--grape)]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-meta text-[9px] text-[color:var(--ink-soft)]">
                  {CLIENT_TYPE_LABEL[c.clientType]}
                </span>
                <div className="flex shrink-0 gap-2">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-[color:var(--ink)] px-3 py-2 font-meta text-[10px]"
                    >
                      WhatsApp
                    </a>
                  )}
                  <Link href={`/masterclass/admin/coaching/${c.uid}`} className="btn-ink">
                    Ver
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function AnnouncementEditor({ initial }: { initial: Announcement }) {
  const [message, setMessage] = useState(initial.message);
  const [active, setActive] = useState(initial.active);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    const res = await fetch("/api/admin/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setAnnouncement", announcement: { message, active } }),
    });
    setBusy(false);
    if (res.ok) setSaved(true);
  }

  return (
    <section className="plate-lilac mt-8 bg-[color:var(--paper)] p-5">
      <div className="flex items-center justify-between">
        <p className="font-meta text-[10px] text-[color:var(--grape)]">Anuncio al portal</p>
        <label className="flex items-center gap-2 font-meta text-[10px] text-[color:var(--ink-soft)]">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Mostrar a las clientas
        </label>
      </div>
      <textarea
        className="mt-3 w-full border-2 border-[color:var(--ink)] bg-transparent p-3 text-sm"
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ej: Esta semana subimos la intensidad 💪 ¡revisa tu nueva rutina!"
      />
      <div className="mt-3 flex items-center gap-4">
        <button onClick={save} disabled={busy} className="btn-ink disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar anuncio"}
        </button>
        {saved && <span className="font-hand -rotate-1 text-xl text-[color:var(--grape)]">¡listo! ♡</span>}
      </div>
    </section>
  );
}
