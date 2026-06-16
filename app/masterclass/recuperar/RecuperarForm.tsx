"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // No revelamos si el correo existe o no (privacidad / anti-enumeración).
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <p className="mt-8 max-w-md leading-relaxed text-[color:var(--ink-soft)]">
        Si ese correo tiene una cuenta, te enviamos un enlace para crear tu contraseña. Revisa
        tu bandeja (y la carpeta de spam). 💜
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 max-w-md">
      <label htmlFor="re" className="font-meta block text-[10px] text-[color:var(--ink-soft)]">
        Tu correo (el mismo de tu compra)
      </label>
      <input
        id="re"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-line mt-3"
        placeholder="tucorreo@mail.com"
      />
      <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">
        {loading ? "Enviando…" : "Enviarme el enlace →"}
      </button>
    </form>
  );
}
