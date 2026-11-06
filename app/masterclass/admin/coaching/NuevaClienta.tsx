"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Da de alta una clienta de coaching por correo (sin esperar a Hotmart).
// Crea su cuenta con coachingStatus active; ella fija su clave en /masterclass/recuperar.
export default function NuevaClienta() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createClient", email, fullName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "No se pudo dar de alta. Revisa el correo." });
      } else {
        setMsg({
          ok: true,
          text: `Listo: ${email.trim().toLowerCase()} ya es clienta de coaching. Dile que entre a gabifitrd.com/coaching y use "Crear / recuperar contraseña".`,
        });
        setEmail("");
        setFullName("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="plate-neon bg-[color:var(--paper)] p-5 md:p-6">
      <p className="font-meta text-[10px] text-[color:var(--grape)]">Nueva clienta de coaching</p>
      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
        Crea acceso al portal de coaching personalizado.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="font-meta block text-[10px] text-[color:var(--ink-soft)]">Correo</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-line mt-2 w-full"
            placeholder="correo@mail.com"
          />
        </label>
        <label className="flex-1">
          <span className="font-meta block text-[10px] text-[color:var(--ink-soft)]">
            Nombre (opcional)
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-line mt-2 w-full"
            placeholder="Ana Pérez"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-ink shrink-0 disabled:opacity-60">
          {busy ? "Creando…" : "Crear clienta"}
        </button>
      </div>
      {msg && (
        <p
          role="status"
          className="mt-4 border-2 border-[color:var(--grape)] bg-[color:var(--lilac)]/20 p-3 text-sm leading-relaxed text-[color:var(--ink)]"
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
