"use client";

import { useState } from "react";
import Image from "next/image";
import { GABI_PHOTO, LOGO_INK, WHATSAPP_HELP_URL } from "./branding";

type GateError = null | "wrong" | "network";

export default function AccessGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<GateError>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
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
      setError("wrong");
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
      {/* Masthead */}
      <header className="rise mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between pb-3">
          <Image
            src={LOGO_INK}
            alt="Gabifit"
            width={130}
            height={46}
            className="h-auto w-28 md:w-32"
            priority
          />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">
            Área de miembros
          </p>
        </div>
        <div className="rule-double" />
      </header>

      {/* Invitación */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10 md:py-14">
        <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
          {/* Foto de Gabi */}
          <figure className="rise-1 rise mx-auto w-56 max-w-full md:w-full md:max-w-xs">
            <div className="arch plate-lilac">
              <Image
                src={GABI_PHOTO}
                alt="Gabi, tu coach"
                width={560}
                height={840}
                className="block h-auto w-full object-cover"
                priority
              />
            </div>
            <figcaption className="font-hand mt-4 -rotate-2 text-center text-2xl text-[color:var(--grape)]">
              tu coach, Gabi ♡
            </figcaption>
          </figure>

          {/* Carta + código */}
          <div>
            <p className="rise rise-1 font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
              Invitación personal · Programa Post-Parto
            </p>
            <h1 className="rise rise-2 mt-4 text-5xl md:text-6xl lg:text-7xl">
              Bienvenida a<br />
              <em className="marker pr-2">tu espacio.</em>
            </h1>
            <p className="rise rise-3 mt-6 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
              Ocho semanas para recuperar tu figura, tu energía y tu identidad
              — a tu ritmo, sin culpa y acompañada. Esto lo preparé para ti.
            </p>

            <form onSubmit={submit} className="rise rise-4 mt-10 max-w-md">
              <label
                htmlFor="codigo"
                className="font-meta block text-[10px] text-[color:var(--ink-soft)]"
              >
                Escribe el código que recibiste al unirte
              </label>
              <input
                id="codigo"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TU CÓDIGO"
                autoCapitalize="characters"
                autoComplete="off"
                className="input-line mt-3"
              />
              <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">
                {loading ? "Verificando…" : "Entrar a mi masterclass →"}
              </button>
            </form>

            {error && (
              <p
                role="alert"
                className="mt-6 max-w-md border-2 border-[color:var(--grape)] bg-[color:var(--lilac)]/20 p-4 text-sm leading-relaxed text-[color:var(--ink)]"
              >
                {error === "wrong" ? (
                  <>
                    Ese código no es correcto. Revísalo tal como lo recibiste,
                    o{" "}
                    <a
                      href={WHATSAPP_HELP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[color:var(--grape)] underline"
                    >
                      escríbenos por WhatsApp
                    </a>{" "}
                    y te ayudamos al instante. 💜
                  </>
                ) : (
                  <>
                    No pudimos verificar tu código — parece un problema de
                    conexión. Inténtalo de nuevo, o{" "}
                    <a
                      href={WHATSAPP_HELP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[color:var(--grape)] underline"
                    >
                      escríbenos por WhatsApp
                    </a>
                    . 💜
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pie */}
      <footer className="mx-auto w-full max-w-5xl">
        <div className="rule-double" />
        <p className="font-meta py-4 text-center text-[10px] text-[color:var(--ink-soft)]">
          ¿Aún no eres parte?{" "}
          <a href="/" className="text-[color:var(--grape)] underline">
            Conoce el programa
          </a>
        </p>
      </footer>
    </main>
  );
}
