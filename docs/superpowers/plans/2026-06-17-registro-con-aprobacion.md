# Registro con aprobación de Gabi — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un segundo camino de acceso al masterclass: registro abierto desde el landing que crea cuentas en estado `pending`, una pantalla de espera con adelanto del temario, y un panel para que Gabi apruebe — sin tocar el flujo de Hotmart.

**Architecture:** Next.js 16 App Router. La lógica pura (validación, normalización, decisión de pantalla) vive en `lib/members.ts` y se testea con vitest. El estado de sesión se amplía con `getSessionMemberAny()` (devuelve cualquier `status`), mientras `getSessionMember()` sigue filtrando a `active` para que lecciones y guías queden bloqueadas a las `pending` sin tocarse. Las escrituras a Firestore pasan siempre por route handlers server-side con Admin SDK; el cliente nunca escribe el `status`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Firebase Auth (cliente) + Firebase Admin (servidor) + Firestore, Tailwind, vitest.

---

## Estructura de archivos

**Crear:**
- `lib/members.ts` — lógica pura: validadores, `buildPendingMember`, `screenForMember`.
- `lib/__tests__/members.test.ts` — tests vitest de la lógica pura.
- `lib/members-db.ts` — I/O Firestore: `getPendingMembers()` para el panel.
- `app/api/auth/registro/route.ts` — crea el `member` en `pending` tras verificar el idToken.
- `app/api/admin/members/route.ts` — aprueba/rechaza (verifica `isAdmin` en servidor).
- `app/masterclass/registro/page.tsx` + `RegistroForm.tsx` — registro.
- `app/masterclass/PendingPreview.tsx` — pantalla de espera + adelanto.
- `app/masterclass/admin/page.tsx` + `AdminPanel.tsx` — panel de Gabi.

**Modificar:**
- `lib/session.ts` — añadir `getSessionMemberAny()`, `whatsapp` al tipo `Member`, refactor de `getSessionMember()`.
- `app/masterclass/page.tsx` — ramificar con `screenForMember`.
- `app/page.tsx` — navbar con "Entrar" / "Registrarme".

**No se tocan (gating ya correcto):** `app/masterclass/leccion/[id]/page.tsx` y `app/api/guias/[file]/route.ts` siguen usando `getSessionMember()` (active).

---

### Task 1: Lógica pura de registro (`lib/members.ts`)

**Files:**
- Create: `lib/members.ts`
- Test: `lib/__tests__/members.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/members.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateRegistro, buildPendingMember, screenForMember } from "../members";

describe("validateRegistro", () => {
  const ok = {
    fullName: "Ana Pérez",
    email: "ana@mail.com",
    whatsapp: "+1 809 123 4567",
    password: "12345678",
  };
  it("acepta un registro válido", () => {
    expect(validateRegistro(ok)).toBeNull();
  });
  it("rechaza nombre vacío", () => {
    expect(validateRegistro({ ...ok, fullName: " " })).toMatch(/nombre/i);
  });
  it("rechaza correo inválido", () => {
    expect(validateRegistro({ ...ok, email: "no-es-correo" })).toMatch(/correo/i);
  });
  it("rechaza whatsapp corto", () => {
    expect(validateRegistro({ ...ok, whatsapp: "123" })).toMatch(/whatsapp/i);
  });
  it("rechaza contraseña corta", () => {
    expect(validateRegistro({ ...ok, password: "123" })).toMatch(/contraseña/i);
  });
});

describe("buildPendingMember", () => {
  it("normaliza datos y marca pending, no-admin, origen web", () => {
    const doc = buildPendingMember({
      email: "  Ana@Mail.COM ",
      fullName: "  Ana  ",
      whatsapp: " +1 809 123 4567 ",
    });
    expect(doc.email).toBe("ana@mail.com");
    expect(doc.fullName).toBe("Ana");
    expect(doc.whatsapp).toBe("+1 809 123 4567");
    expect(doc.status).toBe("pending");
    expect(doc.isAdmin).toBe(false);
    expect(doc.source).toBe("registro-web");
  });
});

describe("screenForMember", () => {
  it("sin miembra → login", () => expect(screenForMember(null)).toBe("login"));
  it("active → active", () => expect(screenForMember({ status: "active" })).toBe("active"));
  it("pending → pending", () => expect(screenForMember({ status: "pending" })).toBe("pending"));
  it("revoked → revoked", () => expect(screenForMember({ status: "revoked" })).toBe("revoked"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/members.test.ts`
Expected: FAIL — "Cannot find module '../members'".

- [ ] **Step 3: Write the implementation**

Create `lib/members.ts`:

```ts
// Lógica PURA de registro y miembras — sin Firebase, testeable en aislamiento.

export type RegistroInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFullName(v: string): string | null {
  if (!v || v.trim().length < 2) return "Escribe tu nombre completo.";
  return null;
}

export function validateEmail(v: string): string | null {
  if (!v || !EMAIL_RE.test(v.trim())) return "Escribe un correo válido.";
  return null;
}

export function validateWhatsapp(v: string): string | null {
  const digits = (v ?? "").replace(/\D/g, "");
  if (digits.length < 8) return "Escribe tu WhatsApp con código de país.";
  return null;
}

export function validatePassword(v: string): string | null {
  if (!v || v.length < 8) return "Tu contraseña debe tener al menos 8 caracteres.";
  return null;
}

// Devuelve el primer mensaje de error, o null si todo está bien.
export function validateRegistro(input: Partial<RegistroInput>): string | null {
  return (
    validateFullName(input.fullName ?? "") ??
    validateEmail(input.email ?? "") ??
    validateWhatsapp(input.whatsapp ?? "") ??
    validatePassword(input.password ?? "")
  );
}

export type NewMemberDoc = {
  email: string;
  fullName: string;
  whatsapp: string;
  status: "pending";
  source: "registro-web";
  isAdmin: false;
};

// Construye el documento del nuevo member (sin createdAt; el handler añade el timestamp).
export function buildPendingMember(input: {
  email: string;
  fullName: string;
  whatsapp: string;
}): NewMemberDoc {
  return {
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    whatsapp: input.whatsapp.replace(/\s+/g, " ").trim(),
    status: "pending",
    source: "registro-web",
    isAdmin: false,
  };
}

export type Screen = "login" | "pending" | "active" | "revoked";

// Decide qué pantalla ver en /masterclass según el estado de la miembra.
export function screenForMember(member: { status: string } | null): Screen {
  if (!member) return "login";
  if (member.status === "active") return "active";
  if (member.status === "pending") return "pending";
  return "revoked";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/members.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/members.ts lib/__tests__/members.test.ts
git commit -m "feat: lógica pura de registro (validación, member pending, pantalla por estado)"
```

---

### Task 2: Ampliar sesión con `getSessionMemberAny()`

**Files:**
- Modify: `lib/session.ts`

- [ ] **Step 1: Replace the file contents**

Replace all of `lib/session.ts` with:

```ts
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "gabifit_session";
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60; // 14 días, en segundos

export type Member = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  status: "active" | "pending" | "revoked";
  isAdmin: boolean;
};

// Lee la cookie, la verifica con Firebase Admin y devuelve la miembra con
// CUALQUIER estado (pending/active/revoked). null si no hay sesión válida o el
// doc no existe. La usa /masterclass para decidir qué pantalla mostrar.
export async function getSessionMemberAny(): Promise<Member | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, false);
    const snap = await adminDb().collection("members").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const m = snap.data()!;
    return {
      uid: decoded.uid,
      email: m.email,
      fullName: m.fullName ?? null,
      whatsapp: m.whatsapp ?? null,
      status: m.status,
      isAdmin: Boolean(m.isAdmin),
    };
  } catch {
    return null;
  }
}

// Solo miembras ACTIVAS. Contrato usado por el portal, las lecciones y las guías
// — mantener este filtro es lo que bloquea a las pending del contenido pagado.
export async function getSessionMember(): Promise<Member | null> {
  const member = await getSessionMemberAny();
  if (!member || member.status !== "active") return null;
  return member;
}
```

- [ ] **Step 2: Type-check the whole app**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). This confirms `leccion/[id]/page.tsx` and `api/guias/[file]/route.ts` still compile against the unchanged `getSessionMember()` signature.

- [ ] **Step 3: Run existing tests to confirm nothing broke**

Run: `npm run test`
Expected: PASS (hotmart, lessons-dto, members).

- [ ] **Step 4: Commit**

```bash
git add lib/session.ts
git commit -m "feat: getSessionMemberAny() para distinguir pending/active/revoked"
```

---

### Task 3: API de registro (`/api/auth/registro`)

**Files:**
- Create: `app/api/auth/registro/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/auth/registro/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateFullName, validateWhatsapp, buildPendingMember } from "@/lib/members";

export const dynamic = "force-dynamic";

// Crea el documento de la miembra en estado "pending" tras un signup en el cliente.
// El email se toma del idToken verificado (confiable); el cliente no fija el status.
export async function POST(request: Request) {
  const { idToken, fullName, whatsapp } = await request
    .json()
    .catch(() => ({ idToken: null, fullName: "", whatsapp: "" }));
  if (!idToken) return NextResponse.json({ ok: false }, { status: 400 });

  const err = validateFullName(fullName ?? "") ?? validateWhatsapp(whatsapp ?? "");
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const ref = adminDb().collection("members").doc(decoded.uid);
  const existing = await ref.get();
  // No degradar a quien ya está activa (p. ej. compró por Hotmart).
  if (existing.exists && existing.data()!.status === "active") {
    return NextResponse.json({ ok: true, alreadyActive: true });
  }

  const doc = buildPendingMember({
    email: decoded.email ?? "",
    fullName,
    whatsapp,
  });
  await ref.set({ ...doc, createdAt: FieldValue.serverTimestamp() }, { merge: true });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/registro/route.ts
git commit -m "feat: API de registro crea member en pending"
```

---

### Task 4: Página y formulario de registro

**Files:**
- Create: `app/masterclass/registro/page.tsx`
- Create: `app/masterclass/registro/RegistroForm.tsx`

- [ ] **Step 1: Write the form (client)**

Create `app/masterclass/registro/RegistroForm.tsx`:

```tsx
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
```

- [ ] **Step 2: Write the page (server)**

Create `app/masterclass/registro/page.tsx`:

```tsx
import Image from "next/image";
import { LOGO_INK, GABI_PHOTO } from "../branding";
import RegistroForm from "./RegistroForm";

export const dynamic = "force-dynamic";

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
      <header className="rise mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between pb-3">
          <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">Crea tu cuenta</p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10 md:py-14">
        <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
          <figure className="rise-1 rise mx-auto w-56 max-w-full md:w-full md:max-w-xs">
            <div className="arch plate-lilac">
              <Image src={GABI_PHOTO} alt="Gabi, tu coach" width={560} height={840} className="block h-auto w-full object-cover" priority />
            </div>
            <figcaption className="font-hand mt-4 -rotate-2 text-center text-2xl text-[color:var(--grape)]">
              te espero adentro ♡
            </figcaption>
          </figure>

          <div>
            <p className="rise rise-1 font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
              Programa Post-Parto · 8 semanas
            </p>
            <h1 className="rise rise-2 mt-4 text-5xl md:text-6xl lg:text-7xl">
              Pide tu<br />
              <em className="marker pr-2">acceso.</em>
            </h1>
            <p className="rise rise-3 mt-6 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
              Regístrate y Gabi revisará tu solicitud. Mientras tanto, podrás ver
              el temario completo del programa por dentro.
            </p>
            <RegistroForm />
          </div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-5xl">
        <div className="rule-double" />
        <p className="font-meta py-4 text-center text-[10px] text-[color:var(--ink-soft)]">
          <a href="/" className="text-[color:var(--grape)] underline">← Volver al inicio</a>
        </p>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Verify in the dev server**

Run: `npm run dev`. Open `http://localhost:3000/masterclass/registro`.
Expected: the registration form renders in the cream "portal" style with fields Nombre, Correo, WhatsApp, Contraseña and the button "Quiero unirme →".
- Submit with a short password → inline error "Tu contraseña debe tener al menos 8 caracteres." (no network call).
- Submit a full valid form with a NEW email → redirects to `/masterclass`. (This creates a real `pending` member in Firestore; note the email to clean up later.)

- [ ] **Step 5: Commit**

```bash
git add app/masterclass/registro/
git commit -m "feat: página de registro (signup → pending)"
```

---

### Task 5: Pantalla de espera + ramificación de `/masterclass`

**Files:**
- Create: `app/masterclass/PendingPreview.tsx`
- Modify: `app/masterclass/page.tsx`

- [ ] **Step 1: Write the PendingPreview (server component)**

Create `app/masterclass/PendingPreview.tsx`. Receives data by props (no `videoUrl` ever reaches it — same rule as `Dashboard`). Lessons render with a "Pronto" stamp and **no links**; guides show covers with **no download link**.

```tsx
import Image from "next/image";
import { LOGO_INK } from "./branding";
import type { ClientLesson, Guide, Phase } from "./lessons";

const PHASE_TINT: Record<Phase["color"], string> = {
  neon: "var(--neon)",
  purple: "var(--lilac)",
  white: "var(--paper-deep)",
};

export default function PendingPreview({
  phases,
  lessons,
  guides,
  email,
}: {
  phases: Phase[];
  lessons: ClientLesson[];
  guides: Guide[];
  email: string;
}) {
  return (
    <main className="pb-24">
      <header className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8">
        <div className="flex items-center justify-between pb-3">
          <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">Solicitud en revisión</p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* Banner de espera */}
        <section className="plate-lilac mt-10 bg-[color:var(--paper)] p-6 text-center md:p-10">
          <span className="stamp">En revisión</span>
          <h1 className="mt-5 text-4xl md:text-6xl">
            Tu solicitud está <em className="marker pr-2">en revisión</em> 💜
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
            Gracias por unirte, mamá. Gabi va a revisar tu solicitud ({email}) y te
            avisará en cuanto tu acceso esté listo. Mientras tanto, este es el
            programa completo que te espera:
          </p>
        </section>

        {/* Adelanto de las fases (sin enlaces, todo "Pronto") */}
        {phases.map((phase) => {
          const phaseLessons = lessons.filter((l) => l.phase === phase.id);
          return (
            <section key={phase.id} className="mt-16 md:mt-20">
              <div className="flex items-end gap-4 md:gap-6">
                <span className="outline-numeral text-7xl md:text-8xl" aria-hidden>
                  {String(phase.id).padStart(2, "0")}
                </span>
                <div className="pb-1">
                  <p className="font-meta text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                    Fase {phase.id} · {phase.weeks}
                  </p>
                  <h2 className="mt-1 text-3xl md:text-5xl">
                    <em
                      className="pr-1"
                      style={{
                        backgroundImage: `linear-gradient(to top, transparent 6%, ${PHASE_TINT[phase.color]} 6%, ${PHASE_TINT[phase.color]} 40%, transparent 40%)`,
                      }}
                    >
                      {phase.name}
                    </em>
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">{phase.subtitle}</p>
              <div className="mt-6 border-t-2 border-[color:var(--ink)]">
                {phaseLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-baseline gap-3 border-b border-[color:var(--ink)]/15 px-2 py-4 md:gap-4 md:px-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 translate-y-1 items-center justify-center rounded-full border-2 border-[color:var(--ink)]/40 font-meta text-[11px] text-[color:var(--ink-soft)]">
                      {String(lesson.id).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg leading-snug md:text-xl">{lesson.title}</span>
                      <span className="font-meta mt-1 block text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
                        {lesson.week}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0">
                      <span className="stamp">Pronto</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Adelanto de la biblioteca (portadas sin descarga) */}
        <section className="mt-16 md:mt-20">
          <h2 className="text-4xl md:text-5xl">
            Tu <em className="marker-lilac pr-1">biblioteca</em>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--ink-soft)] md:text-base">
            7 guías que se desbloquean cuando Gabi active tu acceso.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-7">
            {guides.map((guide, i) => (
              <div key={guide.slug} className="block">
                <div className="shelf-cover opacity-70" style={{ transform: `rotate(${i % 2 === 0 ? -1.2 : 1.4}deg)` }}>
                  <Image src={guide.cover} alt={`Portada: ${guide.title}`} width={560} height={792} className="block h-auto w-full" />
                </div>
                <h3 className="mt-4 text-base leading-snug md:text-lg">{guide.title}</h3>
                <p className="font-meta mt-1 text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">Disponible al activar</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20">
          <div className="rule-double" />
          <p className="font-meta py-5 text-center text-[9px] text-[color:var(--ink-soft)] md:text-[10px]">
            Gabifit · Programa Post-Parto · 8 semanas
          </p>
        </footer>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Rewrite `app/masterclass/page.tsx` to branch by screen**

Replace all of `app/masterclass/page.tsx` with:

```tsx
import Image from "next/image";
import { getSessionMemberAny } from "@/lib/session";
import { getClientLessons } from "@/lib/lessons-db";
import { screenForMember } from "@/lib/members";
import LoginForm from "./login/LoginForm";
import Dashboard from "./Dashboard";
import PendingPreview from "./PendingPreview";
import { GABI_PHOTO, LOGO_INK, WHATSAPP_HELP_URL } from "./branding";
import { GUIDES, MEDICAL_DISCLAIMER, PHASES } from "./lessons";

export const dynamic = "force-dynamic";

export default async function MasterclassPage() {
  const member = await getSessionMemberAny();
  const screen = screenForMember(member);

  if (screen === "active") {
    const lessons = await getClientLessons();
    return <Dashboard phases={PHASES} lessons={lessons} guides={GUIDES} disclaimer={MEDICAL_DISCLAIMER} />;
  }

  if (screen === "pending") {
    const lessons = await getClientLessons();
    return <PendingPreview phases={PHASES} lessons={lessons} guides={GUIDES} email={member!.email} />;
  }

  if (screen === "revoked") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
        <h1 className="mt-10 text-4xl md:text-6xl">Tu acceso terminó</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)]">
          Si crees que es un error o quieres volver, escríbele a Gabi.
        </p>
        <a href={WHATSAPP_HELP_URL} target="_blank" rel="noopener noreferrer" className="btn-ink mt-8">
          Escribir por WhatsApp →
        </a>
      </main>
    );
  }

  // screen === "login"
  return (
    <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
      <header className="rise mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between pb-3">
          <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
          <p className="font-meta text-[10px] text-[color:var(--ink-soft)] md:text-xs">Área de miembros</p>
        </div>
        <div className="rule-double" />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10 md:py-14">
        <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
          <figure className="rise-1 rise mx-auto w-56 max-w-full md:w-full md:max-w-xs">
            <div className="arch plate-lilac">
              <Image src={GABI_PHOTO} alt="Gabi, tu coach" width={560} height={840} className="block h-auto w-full object-cover" priority />
            </div>
            <figcaption className="font-hand mt-4 -rotate-2 text-center text-2xl text-[color:var(--grape)]">
              tu coach, Gabi ♡
            </figcaption>
          </figure>

          <div>
            <p className="rise rise-1 font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
              Programa Post-Parto · 8 semanas
            </p>
            <h1 className="rise rise-2 mt-4 text-5xl md:text-6xl lg:text-7xl">
              Bienvenida a<br />
              <em className="marker pr-2">tu espacio.</em>
            </h1>
            <p className="rise rise-3 mt-6 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
              Entra con tu correo. Aquí están tus guías y tus clases — a tu ritmo, sin culpa y acompañada.
            </p>
            <LoginForm />
            <p className="font-meta mt-6 text-[10px] text-[color:var(--ink-soft)]">
              ¿Primera vez?{" "}
              <a href="/masterclass/registro" className="text-[color:var(--grape)] underline">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-5xl">
        <div className="rule-double" />
        <p className="font-meta py-4 text-center text-[10px] text-[color:var(--ink-soft)]">
          ¿Aún no eres parte?{" "}
          <a href="/" className="text-[color:var(--grape)] underline">Conoce el programa</a>
        </p>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Verify the three states in the dev server**

With `npm run dev` running:
- **Logged out** → `/masterclass` shows the login + "¿Primera vez? Regístrate aquí".
- **Pending** → log in (or register) as the pending test user → see "Tu solicitud está en revisión 💜", the 3 phases with every lesson stamped "Pronto" (no clickable rows), and guide covers labeled "Disponible al activar".
- **Gate check** → while pending, manually visit `/masterclass/leccion/1` → you are redirected back to `/masterclass` (no video). Visit `/api/guias/guia-nutricion-gabifit.pdf` → `401`. This confirms pending users cannot reach paid content.

- [ ] **Step 5: Commit**

```bash
git add app/masterclass/page.tsx app/masterclass/PendingPreview.tsx
git commit -m "feat: pantalla de espera con adelanto del temario para pending"
```

---

### Task 6: Panel de Gabi (`/masterclass/admin`)

**Files:**
- Create: `lib/members-db.ts`
- Create: `app/api/admin/members/route.ts`
- Create: `app/masterclass/admin/page.tsx`
- Create: `app/masterclass/admin/AdminPanel.tsx`

- [ ] **Step 1: Write the Firestore reader**

Create `lib/members-db.ts`:

```ts
import { adminDb } from "@/lib/firebase/admin";

export type PendingMemberRow = {
  uid: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  createdAt: string | null; // ISO string, o null
};

// Lista las miembras en espera. Ordena en memoria (sin índice compuesto en Firestore).
export async function getPendingMembers(): Promise<PendingMemberRow[]> {
  const snap = await adminDb().collection("members").where("status", "==", "pending").get();
  const rows: PendingMemberRow[] = snap.docs.map((d) => {
    const m = d.data();
    const ts = m.createdAt as { toDate?: () => Date } | undefined;
    return {
      uid: d.id,
      email: m.email ?? "",
      fullName: m.fullName ?? null,
      whatsapp: m.whatsapp ?? null,
      createdAt: ts?.toDate ? ts.toDate().toISOString() : null,
    };
  });
  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return rows;
}
```

- [ ] **Step 2: Write the admin API**

Create `app/api/admin/members/route.ts`:

```ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getSessionMemberAny } from "@/lib/session";

export const dynamic = "force-dynamic";

// Aprueba (→ active) o rechaza (→ revoked) a una miembra. Solo admins.
export async function POST(request: Request) {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) return NextResponse.json({ ok: false }, { status: 403 });

  const { uid, action } = await request.json().catch(() => ({ uid: null, action: null }));
  if (!uid || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const status = action === "approve" ? "active" : "revoked";
  await adminDb().collection("members").doc(uid).update({ status });
  if (action === "reject") {
    try {
      await adminAuth().revokeRefreshTokens(uid);
    } catch {
      /* puede no existir en Auth; el estado revoked basta */
    }
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Write the panel UI (client)**

Create `app/masterclass/admin/AdminPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PendingMemberRow } from "@/lib/members-db";

export default function AdminPanel({ pending }: { pending: PendingMemberRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(uid: string, action: "approve" | "reject") {
    if (busy) return;
    setBusy(uid);
    try {
      await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
      <h1 className="text-4xl md:text-5xl">
        Solicitudes <em className="marker pr-1">en espera</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        {pending.length === 0 ? "No hay solicitudes nuevas." : `${pending.length} nueva${pending.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-8 border-t-2 border-[color:var(--ink)]">
        {pending.map((p) => (
          <div key={p.uid} className="flex flex-wrap items-center gap-4 border-b border-[color:var(--ink)]/15 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-lg leading-snug">{p.fullName ?? "—"}</p>
              <p className="font-meta mt-1 text-[10px] text-[color:var(--ink-soft)]">{p.email}</p>
              <p className="font-meta mt-1 text-[10px] text-[color:var(--grape)]">{p.whatsapp ?? "sin WhatsApp"}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => act(p.uid, "approve")}
                disabled={busy === p.uid}
                className="btn-ink disabled:opacity-60"
              >
                {busy === p.uid ? "…" : "Aprobar"}
              </button>
              <button
                onClick={() => act(p.uid, "reject")}
                disabled={busy === p.uid}
                className="border-2 border-[color:var(--ink)] px-4 py-2 font-meta text-[11px] text-[color:var(--ink-soft)] disabled:opacity-60"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write the admin page (server, gated by isAdmin)**

Create `app/masterclass/admin/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getSessionMemberAny } from "@/lib/session";
import { getPendingMembers } from "@/lib/members-db";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getSessionMemberAny();
  if (!me || !me.isAdmin) notFound();
  const pending = await getPendingMembers();
  return <AdminPanel pending={pending} />;
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Verify in the dev server**

You need an admin member: in the Firebase console, set `isAdmin: true` on your own `members/{uid}` doc (and `status: "active"`).
- Visit `/masterclass/admin` as a **non-admin** (or logged out) → `404`.
- Visit as **admin** → see the pending test user (name, email, WhatsApp) and the counter "1 nueva".
- Click **Aprobar** → the row disappears (list refreshes). Log in as that user → now sees the full `Dashboard`.
- Register another test user, then **Rechazar** → that user, on `/masterclass`, sees the "Tu acceso terminó" screen.

- [ ] **Step 7: Commit**

```bash
git add lib/members-db.ts app/api/admin/members/ app/masterclass/admin/
git commit -m "feat: panel admin para aprobar/rechazar solicitudes"
```

---

### Task 7: Menú en el landing

**Files:**
- Modify: `app/page.tsx:130-138` (the `{/* ── NAVBAR ── */}` block)

- [ ] **Step 1: Replace the navbar block**

In `app/page.tsx`, replace the current navbar (the `<nav>` that only centers the logo) with:

```tsx
      {/* ── NAVBAR ── */}
      <nav className="bg-brand-black px-4 py-4 md:px-8 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="/">
          <img
            src="https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png"
            alt="Gabifit"
            className="h-16 md:h-24 drop-shadow-[0_0_15px_rgba(207,241,84,0.3)] hover:scale-105 transition-transform cursor-pointer"
          />
        </a>
        <div className="flex items-center gap-3 md:gap-4">
          <a
            href="/masterclass"
            className="font-heading text-sm md:text-xl text-brand-white hover:text-brand-neon transition-colors"
          >
            ENTRAR
          </a>
          <a
            href="/masterclass/registro"
            className="bg-brand-neon text-brand-black px-4 py-2 md:px-6 md:py-3 font-heading text-sm md:text-xl brutalist-shadow-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            REGISTRARME
          </a>
        </div>
      </nav>
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify in the dev server**

Open `http://localhost:3000/`.
Expected: navbar shows the logo on the left and "ENTRAR" + a neon "REGISTRARME" button on the right, in the brutalist style. Resize to mobile width (~375px) → both still fit and are tappable. "ENTRAR" → `/masterclass`; "REGISTRARME" → `/masterclass/registro`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: menú del landing con Entrar y Registrarme"
```

---

## Verificación final (end-to-end)

- [ ] Run `npm run test` → all pass.
- [ ] Run `npx tsc --noEmit` → clean.
- [ ] Run `npm run build` → succeeds.
- [ ] Full flow in dev: landing → "REGISTRARME" → registro → pantalla "en revisión" con adelanto → (admin) Aprobar → la miembra ve el portal completo con videos y guías.
- [ ] Hotmart intacto: el webhook sigue creando miembras `active` (revisar que `app/api/hotmart/webhook/route.ts` no cambió).

## Notas para quien ejecuta

- **Firebase real:** las pruebas de runtime crean/actualizan documentos reales en la colección `members`. Anota los correos de prueba y bórralos del Firebase console al terminar.
- **Cuenta admin:** no hay UI para volverse admin; se hace una vez a mano en Firestore (`isAdmin: true`). Es intencional.
- **Fuera de alcance (del spec):** aviso por email a Gabi (Resend), y el navbar que detecta sesión para mostrar "Mi portal". No implementar aquí.
