"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

// Login del portal de coaching. Reusa Firebase Auth + la cookie de sesión del
// sitio; al entrar redirige a /coaching (no a /masterclass).
export default function CoachingLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session");
      window.location.assign("/coaching");
    } catch {
      setError("Correo o contraseña incorrectos. ¿Primera vez o la olvidaste? Créala abajo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 max-w-md">
      <label htmlFor="email" className="font-meta block text-[10px] text-[color:var(--ink-soft)]">
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
      <label htmlFor="password" className="font-meta mt-6 block text-[10px] text-[color:var(--ink-soft)]">
        Tu contraseña
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-line mt-3"
        placeholder="••••••••"
      />
      <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">
        {loading ? "Entrando…" : "Entrar a mi coaching →"}
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
        <a href="/masterclass/recuperar" className="text-[color:var(--grape)] underline">
          Crear / recuperar mi contraseña
        </a>
      </p>
    </form>
  );
}
