"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Da de alta a alguien por correo, sin que se registre. Crea su cuenta en estado
// "active"; la persona fija su contraseña con "Crear / recuperar contraseña".
export default function AltaManual() {
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
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", email, fullName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "No se pudo dar de alta. Revisa el correo." });
      } else {
        setMsg({
          ok: true,
          text: `Listo: ${email.trim().toLowerCase()} ya tiene acceso. Dile que entre y use "Crear / recuperar contraseña" para poner su clave.`,
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
    <form onSubmit={submit} className="plate-lilac bg-[color:var(--paper)] p-5 md:p-6">
      <p className="font-meta text-[10px] text-[color:var(--grape)]">Dar de alta a mano</p>
      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
        Crea acceso para alguien sin que se registre (regalo, caso especial…).
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
          <span className="font-meta block text-[10px] text-[color:var(--ink-soft)]">Nombre (opcional)</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-line mt-2 w-full"
            placeholder="Ana Pérez"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-ink shrink-0 disabled:opacity-60">
          {busy ? "Dando acceso…" : "Dar acceso"}
        </button>
      </div>
      {msg && (
        <p
          role="status"
          className={`mt-4 border-2 p-3 text-sm leading-relaxed ${
            msg.ok
              ? "border-[color:var(--grape)] bg-[color:var(--lilac)]/20 text-[color:var(--ink)]"
              : "border-[color:var(--grape)] bg-[color:var(--paper-deep)] text-[color:var(--ink)]"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
