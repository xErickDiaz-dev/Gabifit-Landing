"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { validateRegistro } from "@/lib/members";

export default function RegistroForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const v = validateRegistro({ fullName, email, whatsapp, password });
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const idToken = await cred.user.getIdToken();

      const reg = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, fullName, whatsapp }),
      });
      if (!reg.ok) throw new Error("registro");

      const sess = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sess.ok) throw new Error("session");

      window.location.assign("/masterclass");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.");
      } else {
        setError("No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rise rise-4 mt-10 max-w-md">
      <label htmlFor="nombre" className="font-meta block text-[10px] text-[color:var(--ink-soft)]">
        Tu nombre completo
      </label>
      <input
        id="nombre"
        type="text"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="input-line mt-3"
        placeholder="Ana Pérez"
      />

      <label htmlFor="email" className="font-meta mt-6 block text-[10px] text-[color:var(--ink-soft)]">
        Tu correo
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-line mt-3"
        placeholder="tucorreo@mail.com"
      />

      <label htmlFor="whatsapp" className="font-meta mt-6 block text-[10px] text-[color:var(--ink-soft)]">
        Tu WhatsApp (con código de país)
      </label>
      <input
        id="whatsapp"
        type="tel"
        autoComplete="tel"
        required
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="input-line mt-3"
        placeholder="+1 809 123 4567"
      />

      <label htmlFor="password" className="font-meta mt-6 block text-[10px] text-[color:var(--ink-soft)]">
        Crea tu contraseña (mínimo 8 caracteres)
      </label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-line mt-3"
        placeholder="••••••••"
      />

      <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">
        {loading ? "Creando tu cuenta…" : "Quiero unirme →"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-6 max-w-md border-2 border-[color:var(--grape)] bg-[color:var(--lilac)]/20 p-4 text-sm leading-relaxed text-[color:var(--ink)]"
        >
          {error}
        </p>
      )}

      <p className="font-meta mt-5 text-[10px] text-[color:var(--ink-soft)]">
        ¿Ya tienes cuenta?{" "}
        <a href="/masterclass" className="text-[color:var(--grape)] underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
