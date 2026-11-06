"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CLIENT_TYPES,
  CLIENT_TYPE_LABEL,
  waLink,
  type CoachingClientSummary,
  type ClientType,
} from "@/lib/coaching";

function timeAgo(iso: string | null): string {
  if (!iso) return "nunca";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days} día${days === 1 ? "" : "s"}`;
  return `hace ${Math.floor(days / 30)} mes(es)`;
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-[color:var(--ink-soft)]">—</span>;
  const down = delta < 0;
  return (
    <span className={down ? "text-[color:var(--grape)]" : "text-[color:var(--ink)]"}>
      {down ? "▼" : delta > 0 ? "▲" : "•"} {Math.abs(delta)} kg
    </span>
  );
}

type Filter = "all" | ClientType;

export default function ClientsList({ clients }: { clients: CoachingClientSummary[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter !== "all" && c.clientType !== filter) return false;
      if (!n) return true;
      return (c.fullName ?? "").toLowerCase().includes(n) || c.email.toLowerCase().includes(n);
    });
  }, [clients, q, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: clients.length };
    for (const t of CLIENT_TYPES) m[t] = clients.filter((c) => c.clientType === t).length;
    return m;
  }, [clients]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`Todas (${counts.all})`} />
          {CLIENT_TYPES.map((t) => (
            <FilterChip
              key={t}
              active={filter === t}
              onClick={() => setFilter(t)}
              label={`${CLIENT_TYPE_LABEL[t]} (${counts[t]})`}
            />
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="input-line w-full max-w-xs"
        />
      </div>

      <div className="mt-6 border-t-2 border-[color:var(--ink)]">
        {filtered.length === 0 && (
          <p className="font-meta py-6 text-[11px] text-[color:var(--ink-soft)]">
            No hay clientas que coincidan. Crea una en “Invitar”.
          </p>
        )}
        {filtered.map((c) => {
          const wa = waLink(
            c.whatsapp,
            `¡Hola ${c.fullName?.split(" ")[0] ?? ""}! Soy Gabi 💜`
          );
          return (
            <div
              key={c.uid}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[color:var(--ink)]/15 py-5"
            >
              {/* Identidad + tipo */}
              <div className="min-w-[180px] flex-1">
                <Link
                  href={`/masterclass/admin/coaching/${c.uid}`}
                  className="text-lg leading-snug hover:text-[color:var(--grape)]"
                >
                  {c.fullName ?? "—"}
                </Link>
                <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{c.email}</p>
                <span className="mt-1 inline-block border border-[color:var(--grape)] px-2 py-0.5 font-meta text-[9px] text-[color:var(--grape)]">
                  {CLIENT_TYPE_LABEL[c.clientType]}
                </span>
              </div>

              {/* Peso */}
              <div className="min-w-[100px]">
                <p className="text-sm">{c.latestWeight !== null ? `${c.latestWeight} kg` : "sin peso"}</p>
                <p className="font-meta mt-1 text-[10px]">
                  <DeltaBadge delta={c.weightDelta} />
                </p>
              </div>

              {/* Adherencia */}
              <div className="min-w-[130px]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--paper-deep)]">
                  <div className="h-full bg-[color:var(--neon)]" style={{ width: `${c.adherence}%` }} />
                </div>
                <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">
                  {c.adherence}% · entró {timeAgo(c.lastSignIn)}
                </p>
              </div>

              {/* Acciones */}
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
                  Ficha
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 font-meta text-[10px] ${
        active
          ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
          : "border border-[color:var(--ink)]/30 text-[color:var(--ink-soft)]"
      }`}
    >
      {label}
    </button>
  );
}
