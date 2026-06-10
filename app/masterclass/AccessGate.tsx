"use client";

import { useState } from "react";
import Image from "next/image";
import { LOGO_URL } from "./lessons";

export default function AccessGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/masterclass/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Image
        src={LOGO_URL}
        alt="Gabifit"
        width={220}
        height={70}
        className="mb-10 h-auto w-44 md:w-56"
        priority
      />

      <div className="w-full max-w-md border-4 border-white bg-black p-6 shadow-[10px_10px_0px_#c4b5fd] md:p-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-purple">
          Área de miembros
        </p>
        <h1 className="mb-4 text-3xl text-white md:text-4xl">
          Bienvenida a tu espacio
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-white/80">
          Este es tu masterclass: 8 semanas para recuperar tu figura, tu
          energía y tu identidad — a tu ritmo, sin culpa y acompañada.
          Escribe el código que recibiste al unirte al programa.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="TU CÓDIGO DE ACCESO"
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full border-4 border-white bg-black px-4 py-3 font-mono text-base uppercase tracking-widest text-brand-neon placeholder:text-white/30 focus:border-brand-neon focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full border-4 border-black bg-brand-neon px-4 py-3 font-heading text-lg font-black uppercase text-black shadow-[6px_6px_0px_#ffffff] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Entrar a mi masterclass →"}
          </button>
        </form>

        {error && (
          <p className="mt-4 border-2 border-brand-purple bg-brand-purple/10 p-3 text-sm text-brand-purple">
            Ese código no es correcto. Revísalo tal como lo recibiste, o
            escríbenos por WhatsApp y te ayudamos al instante. 💜
          </p>
        )}
      </div>

      <p className="mt-8 max-w-md text-center font-mono text-xs text-white/40">
        ¿Aún no eres parte del programa?{" "}
        <a href="/" className="text-brand-neon underline">
          Conoce el Programa Gabifit Post-Parto
        </a>
      </p>
    </main>
  );
}
