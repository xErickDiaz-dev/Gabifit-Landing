"use client";

import { useState } from "react";

export default function LeadForm({ ctaLabel = "QUIERO MI PLAN GRATIS" }: { ctaLabel?: string }) {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Ponme un correo válido, mami.");
      return;
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          source: "mamasaludable",
          utm_source: params.get("utm_source") ?? null,
          utm_medium: params.get("utm_medium") ?? null,
          utm_campaign: params.get("utm_campaign") ?? null,
          utm_content: params.get("utm_content") ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error("No pudimos guardar tu correo. Intenta de nuevo.");
      }

      window.location.href = "/mamasaludable/gracias";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-white text-brand-black p-6 md:p-8 brutalist-shadow-neon flex flex-col gap-4"
    >
      <input
        type="text"
        placeholder="TU NOMBRE"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 font-mono text-base placeholder:text-brand-black/40 placeholder:uppercase focus:outline-none focus:border-brand-purple"
        autoComplete="given-name"
      />
      <input
        type="email"
        placeholder="TU@CORREO.COM"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 font-mono text-base placeholder:text-brand-black/40 placeholder:uppercase focus:outline-none focus:border-brand-purple"
        autoComplete="email"
      />
      <input
        type="tel"
        placeholder="TU WHATSAPP (OPCIONAL)"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 font-mono text-base placeholder:text-brand-black/40 placeholder:uppercase focus:outline-none focus:border-brand-purple"
        autoComplete="tel"
      />
      {error && (
        <p className="text-brand-purple font-mono text-sm normal-case">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand-neon text-brand-black px-6 py-5 text-xl md:text-2xl font-heading brutalist-shadow-neon hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "ENVIANDO..." : `→ ${ctaLabel}`}
      </button>
      <p className="font-mono text-xs normal-case text-brand-black/60 text-center">
        Te lo enviamos en menos de 60 segundos. Cero spam, cero dietas locas.
      </p>
    </form>
  );
}
