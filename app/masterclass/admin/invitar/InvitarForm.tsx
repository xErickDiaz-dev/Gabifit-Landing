"use client";

import { useState } from "react";
import Link from "next/link";
import { CLIENT_TYPES, CLIENT_TYPE_LABEL, type ClientType } from "@/lib/coaching";

const PORTAL_URL = "https://www.gabifitrd.com/coaching";

const TYPE_HINT: Record<ClientType, string> = {
  upsell: "Compró el coaching",
  regalo: "Acceso gratis (regalo)",
  influencer: "Influencer (gratis por difusión)",
  vip: "Caso especial / VIP",
};

export default function InvitarForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [clientType, setClientType] = useState<ClientType>("regalo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const invite = done
    ? `¡Hola ${done.name || ""}! 🎁 Te di acceso a tu coaching personalizado con Gabi.\n\n` +
      `Entra aquí: ${PORTAL_URL}\n` +
      `Tu correo: ${done.email}\n` +
      `La primera vez, toca "Crear / recuperar contraseña" para poner tu clave.\n\n¡Nos vemos adentro! 💜`
    : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createClient", email, fullName, clientType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el acceso. Revisa el correo.");
      } else {
        setDone({ email: email.trim().toLowerCase(), name: fullName.trim() });
        setEmail("");
        setFullName("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el textarea de abajo permite copiar a mano */
    }
  }

  if (done) {
    return (
      <div className="plate-neon bg-[color:var(--paper)] p-5 md:p-6">
        <p className="font-meta text-[10px] text-[color:var(--grape)]">Acceso creado ✓</p>
        <p className="mt-2 text-lg">
          {done.name || done.email} ya es clienta de coaching.
        </p>
        <p className="font-meta mt-4 text-[10px] text-[color:var(--ink-soft)]">
          Cópiale este mensaje y mándaselo:
        </p>
        <textarea
          readOnly
          value={invite}
          rows={7}
          className="mt-2 w-full border-2 border-[color:var(--ink)] bg-[color:var(--paper-deep)]/40 p-3 text-sm"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={copy} className="btn-ink">
            {copied ? "¡Copiado! ✓" : "Copiar mensaje"}
          </button>
          <button
            onClick={() => setDone(null)}
            className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px]"
          >
            Crear otra
          </button>
          <Link
            href="/masterclass/admin/coaching"
            className="px-4 py-2 font-meta text-[11px] text-[color:var(--grape)] underline"
          >
            Ver clientas →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="plate bg-[color:var(--paper)] p-5 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
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
        <label>
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
      </div>

      <fieldset className="mt-5">
        <legend className="font-meta text-[10px] text-[color:var(--ink-soft)]">Tipo de acceso</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CLIENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setClientType(t)}
              className={`border-2 px-3 py-2 text-left ${
                clientType === t
                  ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                  : "border-[color:var(--ink)]/30 text-[color:var(--ink-soft)]"
              }`}
            >
              <span className="font-meta block text-[11px]">{CLIENT_TYPE_LABEL[t]}</span>
              <span className="mt-1 block text-[10px] leading-tight opacity-80">{TYPE_HINT[t]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="mt-4 border-2 border-[color:var(--grape)] bg-[color:var(--lilac)]/20 p-3 text-sm"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-ink mt-6 disabled:opacity-60">
        {busy ? "Creando acceso…" : "Crear acceso"}
      </button>
    </form>
  );
}
