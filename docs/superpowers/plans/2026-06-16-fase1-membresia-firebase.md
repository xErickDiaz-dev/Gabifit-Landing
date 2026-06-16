# Fase 1 — Membresía Gabifit (Firebase Auth + Webhook Hotmart) — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el acceso por código compartido del portal por cuentas individuales en Firebase (correo + contraseña), creadas automáticamente cuando alguien compra en Hotmart, leyendo las lecciones desde Firestore.

**Architecture:** Firebase Auth (email/password) + Firestore. Un webhook de Hotmart (ruta Next, Node) usa el Admin SDK para crear/activar/revocar cuentas. Al loguear, una cookie de sesión de Firebase (`createSessionCookie`) habilita el gating server-side. Los PDFs se sirven por una ruta Node autenticada (fuera de `/public`). No se usa middleware en Edge.

**Tech Stack:** Next.js 16 (App Router), React 19, `firebase` (web SDK), `firebase-admin` (server SDK), Vitest (lógica pura).

**Spec:** `docs/superpowers/specs/2026-06-16-membresia-gabifit-design.md`

**Dependencia externa (antes de tareas que conectan en vivo):** proyecto Firebase con Email/Password habilitado, config web pública, service account JSON, y producto Hotmart con webhook + `hottok`.

---

## Estructura de archivos

**Crear:**
- `lib/firebase/client.ts` — init del SDK web (auth en el navegador).
- `lib/firebase/admin.ts` — init del Admin SDK (service account, solo servidor).
- `lib/session.ts` — `getSessionMember()` (cookie → verify → miembra activa).
- `lib/hotmart.ts` — `isValidHottok` + `parseHotmartEvent` (puro, testeable).
- `lib/lessons-db.ts` — lectura de lecciones de Firestore (lista sin `videoUrl`; detalle con).
- `app/api/auth/session/route.ts` — crea/borra la cookie de sesión.
- `app/api/hotmart/webhook/route.ts` — webhook de Hotmart.
- `app/api/guias/[file]/route.ts` — sirve los PDFs solo a sesiones válidas.
- `app/masterclass/login/LoginForm.tsx` — formulario de login.
- `app/masterclass/recuperar/page.tsx` + `RecuperarForm.tsx` — pedir/crear contraseña por email.
- `scripts/seed-lessons.mjs` — siembra las 11 lecciones en Firestore.
- `vitest.config.ts`, `lib/__tests__/hotmart.test.ts`, `lib/__tests__/lessons-db.test.ts`.

**Mover:** `public/guias/*.pdf` → `protected/guias/*.pdf` (las **portadas** `public/guias/covers/*.jpg` se quedan).

**Modificar:**
- `app/masterclass/page.tsx` — login si no hay miembra; dashboard (lee Firestore) si la hay.
- `app/masterclass/leccion/[id]/page.tsx` — leer de Firestore; dinámica; gating; `playableUrl`.
- `app/masterclass/lessons.ts` — conservar tipos + `PHASES` + `GUIDES` (con `file: /api/guias/...`) + `MEDICAL_DISCLAIMER` + `cloudinaryPoster` + `guidesForPhase`; quitar `LESSONS` y helpers del array.
- `app/acceso/page.tsx` — "activa tu cuenta: ingresa tu correo".
- `next.config.mjs` — `outputFileTracingIncludes` para incluir `protected/guias/**` en la ruta de PDFs.
- `package.json` — deps + script `test`.
- `.env.local` / Vercel env.

**Retirar (Task 9):** `lib/masterclass-auth.ts`, `app/api/masterclass/login/route.ts`, `app/masterclass/AccessGate.tsx`, `app/acceso/CopyCode.tsx`, `proxy.ts`, env `MASTERCLASS_CODE`.

**Sin cambios en Fase 1:** `app/masterclass/progress.ts` (localStorage; migra en Fase 3).

---

## Task 1: Dependencias, clientes Firebase y env

**Files:** Modify `package.json`, `.env.local`; Create `lib/firebase/client.ts`, `lib/firebase/admin.ts`

- [ ] **Step 1: Instalar deps**

```bash
npm install firebase firebase-admin
npm install -D vitest
```

- [ ] **Step 2: Variables de entorno** (`.env.local`, y luego en Vercel)

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
HOTMART_HOTTOK=...
NEXT_PUBLIC_SITE_URL=https://www.gabifitrd.com
```

- [ ] **Step 3: Cliente web** — `lib/firebase/client.ts`

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
```

- [ ] **Step 4: Admin SDK** — `lib/firebase/admin.ts`

```ts
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Solo servidor. Lazy init para no romper el import en tests/cliente.
function adminApp() {
  if (getApps().length) return getApp();
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/firebase
git commit -m "feat(firebase): clientes web y admin + env"
```

---

## Task 2: Modelo en Firestore + seed de lecciones

**Files:** Create `scripts/seed-lessons.mjs`

- [ ] **Step 1: Habilitar en consola Firebase**

Authentication → Sign-in method → habilitar **Email/Password**. Firestore Database → crear en modo producción.
Reglas Firestore (todo el acceso es por Admin SDK desde el servidor, así que se bloquea el cliente):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

- [ ] **Step 2: Script de seed** — `scripts/seed-lessons.mjs`

```js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();

// Las 11 lecciones (texto exacto copiado de app/masterclass/lessons.ts).
const LESSONS = [
  { id:1, phase:1, week:"Semana 1", title:"El Despertar — Respiración Diafragmática y Piso Pélvico", duration:"20-25 min", description:"Tu cuerpo no está roto: está en proceso de reconstruirse. Hoy no vamos a quemar grasa — vamos a despertar el sistema que controla todo lo demás: tu diafragma y tu piso pélvico. Lo que hagas estas dos primeras semanas determina cómo avanza todo el programa.", videoUrl:"", isPublished:false, sortOrder:1 },
  // ... pegar las 11 con su texto exacto (id 2..11) ...
];

for (const l of LESSONS) {
  await db.collection("lessons").doc(String(l.id)).set(l);
}
console.log(`Seeded ${LESSONS.length} lessons`);
process.exit(0);
```

- [ ] **Step 3: Correr el seed** (con el env cargado)

```bash
node --env-file=.env.local scripts/seed-lessons.mjs
```
Expected: `Seeded 11 lessons`. Verificar en la consola de Firestore que existe `lessons/1`..`lessons/11`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-lessons.mjs
git commit -m "feat(lessons): script de seed de lecciones en Firestore"
```

---

## Task 3: Lógica del webhook (pura, con tests)

**Files:** Create `lib/hotmart.ts`, `vitest.config.ts`, `lib/__tests__/hotmart.test.ts`; Modify `package.json`

- [ ] **Step 1: Vitest** — `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["lib/**/*.test.ts"] } });
```
`package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Test que falla** — `lib/__tests__/hotmart.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { isValidHottok, parseHotmartEvent } from "../hotmart";

describe("isValidHottok", () => {
  it("acepta el token correcto", () => expect(isValidHottok("secreto", "secreto")).toBe(true));
  it("rechaza incorrecto/vacío", () => {
    expect(isValidHottok("malo", "secreto")).toBe(false);
    expect(isValidHottok(undefined, "secreto")).toBe(false);
    expect(isValidHottok("secreto", "")).toBe(false);
  });
});

describe("parseHotmartEvent", () => {
  const base = (event) => ({ event, data: { buyer: { email: "Ana@Mail.com", name: "Ana" }, purchase: { transaction: "HP123" } } });
  it("compra aprobada → grant, email normalizado", () =>
    expect(parseHotmartEvent(base("PURCHASE_APPROVED"))).toEqual({ action:"grant", email:"ana@mail.com", name:"Ana", transaction:"HP123" }));
  it("reembolso/chargeback/cancelación → revoke", () => {
    for (const e of ["PURCHASE_REFUNDED","PURCHASE_CHARGEBACK","PURCHASE_CANCELED"])
      expect(parseHotmartEvent(base(e)).action).toBe("revoke");
  });
  it("evento no relevante → null", () => expect(parseHotmartEvent(base("PURCHASE_BILLET_PRINTED"))).toBeNull());
});
```

- [ ] **Step 3: Correr (debe fallar)** — `npm test` → FAIL.

- [ ] **Step 4: Implementar** — `lib/hotmart.ts`

```ts
export type HotmartAction = { action: "grant" | "revoke"; email: string; name: string | null; transaction: string | null };

const GRANT = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
const REVOKE = new Set(["PURCHASE_REFUNDED","PURCHASE_CHARGEBACK","PURCHASE_PROTEST","PURCHASE_CANCELED","SUBSCRIPTION_CANCELLATION"]);

export function isValidHottok(received: string | undefined | null, expected: string | undefined): boolean {
  if (!expected || !received) return false;
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function parseHotmartEvent(body: any): HotmartAction | null {
  const event = body?.event as string | undefined;
  if (!event) return null;
  const action = GRANT.has(event) ? "grant" : REVOKE.has(event) ? "revoke" : null;
  if (!action) return null;
  const buyer = body?.data?.buyer ?? {};
  const purchase = body?.data?.purchase ?? {};
  const email = String(buyer.email ?? "").trim().toLowerCase();
  if (!email) return null;
  return { action, email, name: buyer.name ? String(buyer.name) : null, transaction: purchase.transaction ? String(purchase.transaction) : null };
}
```

- [ ] **Step 5: Correr (debe pasar)** — `npm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/hotmart.ts lib/__tests__/hotmart.test.ts vitest.config.ts package.json
git commit -m "feat(hotmart): verificación de hottok y mapeo de eventos con tests"
```

---

## Task 4: Endpoint del webhook (Firebase Admin)

**Files:** Create `app/api/hotmart/webhook/route.ts`

- [ ] **Step 1: Implementar**

```ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isValidHottok, parseHotmartEvent } from "@/lib/hotmart";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headerToken = request.headers.get("x-hotmart-hottok");
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const token = headerToken ?? body?.hottok;
  if (!isValidHottok(token, process.env.HOTMART_HOTTOK)) return NextResponse.json({ ok: false }, { status: 401 });

  const parsed = parseHotmartEvent(body);
  if (!parsed) return NextResponse.json({ ok: true, ignored: true });

  const db = adminDb();
  const auth = adminAuth();

  if (parsed.action === "revoke") {
    const q = await db.collection("members").where("email", "==", parsed.email).get();
    for (const doc of q.docs) {
      await doc.ref.update({ status: "revoked" });
      try { await auth.revokeRefreshTokens(doc.id); } catch {}
    }
    return NextResponse.json({ ok: true });
  }

  if (parsed.transaction) {
    const dup = await db.collection("members").where("hotmartTransactionId", "==", parsed.transaction).limit(1).get();
    if (!dup.empty) return NextResponse.json({ ok: true, duplicate: true });
  }

  let uid: string;
  try {
    uid = (await auth.getUserByEmail(parsed.email)).uid;
  } catch {
    uid = (await auth.createUser({ email: parsed.email, emailVerified: false })).uid;
  }

  await db.collection("members").doc(uid).set({
    email: parsed.email,
    fullName: parsed.name,
    status: "active",
    hotmartTransactionId: parsed.transaction,
    purchasedAt: FieldValue.serverTimestamp(),
    isAdmin: false,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verificación manual (tras env + deploy)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.gabifitrd.com/api/hotmart/webhook \
  -H "Content-Type: application/json" -H "x-hotmart-hottok: malo" \
  -d '{"event":"PURCHASE_APPROVED","data":{"buyer":{"email":"x@y.com"}}}'
```
Expected: `401`. Luego el botón "Probar" de Hotmart con el token real → ver `members/{uid}` active en Firestore.

- [ ] **Step 3: Commit**

```bash
git add app/api/hotmart/webhook/route.ts
git commit -m "feat(hotmart): webhook crea/activa/revoca miembras en Firebase"
```

---

## Task 5: Sesión (cookie de Firebase) + helper server-side

**Files:** Create `app/api/auth/session/route.ts`, `lib/session.ts`

- [ ] **Step 1: Ruta de sesión** — `app/api/auth/session/route.ts`

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
const COOKIE = "gabifit_session";
const MAX_AGE = 14 * 24 * 60 * 60;

export async function POST(request: Request) {
  const { idToken } = await request.json().catch(() => ({ idToken: null }));
  if (!idToken) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: MAX_AGE * 1000 });
    const store = await cookies();
    store.set(COOKIE, sessionCookie, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: MAX_AGE, path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

export async function DELETE() {
  (await cookies()).delete(COOKIE);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Helper** — `lib/session.ts`

```ts
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "gabifit_session";

export type Member = {
  uid: string; email: string; fullName: string | null;
  status: "active" | "pending" | "revoked"; isAdmin: boolean;
};

export async function getSessionMember(): Promise<Member | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, false);
    const snap = await adminDb().collection("members").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const m = snap.data()!;
    if (m.status !== "active") return null;
    return { uid: decoded.uid, email: m.email, fullName: m.fullName ?? null, status: m.status, isAdmin: !!m.isAdmin };
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/session/route.ts lib/session.ts
git commit -m "feat(auth): cookie de sesión de Firebase y helper getSessionMember"
```

---

## Task 6: UI de login y recuperación/activación de contraseña

**Files:** Create `app/masterclass/login/LoginForm.tsx`, `app/masterclass/recuperar/page.tsx`, `app/masterclass/recuperar/RecuperarForm.tsx`

- [ ] **Step 1: LoginForm** — `app/masterclass/login/LoginForm.tsx`

```tsx
"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session");
      window.location.assign("/masterclass");
    } catch {
      setError("Correo o contraseña incorrectos. ¿Primera vez o la olvidaste? Crea tu contraseña abajo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rise rise-4 mt-10 max-w-md">
      <label htmlFor="email" className="font-meta block text-[10px] text-[color:var(--ink-soft)]">Tu correo</label>
      <input id="email" type="email" autoComplete="email" required value={email}
        onChange={(e) => setEmail(e.target.value)} className="input-line mt-3" placeholder="tucorreo@mail.com" />
      <label htmlFor="password" className="font-meta mt-6 block text-[10px] text-[color:var(--ink-soft)]">Tu contraseña</label>
      <input id="password" type="password" autoComplete="current-password" required value={password}
        onChange={(e) => setPassword(e.target.value)} className="input-line mt-3" placeholder="••••••••" />
      <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">
        {loading ? "Entrando…" : "Entrar a mi masterclass →"}
      </button>
      {error && (
        <p role="alert" className="mt-6 max-w-md border-2 border-[color:var(--grape)] bg-[color:var(--lilac)]/20 p-4 text-sm text-[color:var(--ink)]">{error}</p>
      )}
      <p className="font-meta mt-5 text-[10px] text-[color:var(--ink-soft)]">
        <a href="/masterclass/recuperar" className="text-[color:var(--grape)] underline">Crear / recuperar mi contraseña</a>
      </p>
    </form>
  );
}
```

- [ ] **Step 2: RecuperarForm** — `app/masterclass/recuperar/RecuperarForm.tsx`

```tsx
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
    try { await sendPasswordResetEmail(auth, email.trim()); } catch { /* no revelar si existe */ }
    setSent(true); setLoading(false);
  }

  if (sent) return <p className="mt-8 max-w-md text-[color:var(--ink-soft)]">Si ese correo tiene una cuenta, te enviamos un enlace para crear tu contraseña. Revisa tu bandeja (y spam). 💜</p>;

  return (
    <form onSubmit={submit} className="mt-10 max-w-md">
      <label htmlFor="re" className="font-meta block text-[10px] text-[color:var(--ink-soft)]">Tu correo (el mismo de tu compra)</label>
      <input id="re" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-line mt-3" placeholder="tucorreo@mail.com" />
      <button type="submit" disabled={loading} className="btn-ink mt-7 disabled:opacity-60">{loading ? "Enviando…" : "Enviarme el enlace →"}</button>
    </form>
  );
}
```

`app/masterclass/recuperar/page.tsx`:
```tsx
import RecuperarForm from "./RecuperarForm";
export const dynamic = "force-dynamic";
export default function RecuperarPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16">
      <h1 className="text-4xl md:text-5xl">Crea o recupera tu contraseña</h1>
      <p className="mt-4 text-[color:var(--ink-soft)]">Te enviamos un enlace al correo de tu compra para fijar tu contraseña.</p>
      <RecuperarForm />
    </main>
  );
}
```

- [ ] **Step 3: Personalizar el email** (consola Firebase → Authentication → Templates → "Restablecimiento de contraseña"): asunto/cuerpo en español con la marca Gabifit.

- [ ] **Step 4: Commit**

```bash
git add app/masterclass/login app/masterclass/recuperar
git commit -m "feat(auth): login y creación/recuperación de contraseña"
```

---

## Task 7: Lecciones desde Firestore + portal con gating

**Files:** Create `lib/lessons-db.ts`, `lib/__tests__/lessons-db.test.ts`; Modify `app/masterclass/lessons.ts`, `app/masterclass/page.tsx`, `app/masterclass/leccion/[id]/page.tsx`

- [ ] **Step 1: Test que falla** — `lib/__tests__/lessons-db.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { toClientLesson } from "../lessons-db";

describe("toClientLesson", () => {
  it("quita videoUrl y expone hasVideo", () => {
    const dto = toClientLesson({ id:1, phase:1, week:"S1", title:"T", duration:"20", description:"D", videoUrl:"http://v.mp4", isPublished:true, sortOrder:1 });
    expect((dto as any).videoUrl).toBeUndefined();
    expect(dto.hasVideo).toBe(true);
  });
  it("hasVideo false si no publicada o sin url", () => {
    const b = { id:2, phase:1, week:"S", title:"T", duration:"x", description:"D", sortOrder:2 };
    expect(toClientLesson({ ...b, videoUrl:"", isPublished:true }).hasVideo).toBe(false);
    expect(toClientLesson({ ...b, videoUrl:"http://v", isPublished:false }).hasVideo).toBe(false);
  });
});
```

- [ ] **Step 2: Correr (debe fallar)** — `npm test` → FAIL.

- [ ] **Step 3: Implementar** — `lib/lessons-db.ts`

```ts
import { adminDb } from "@/lib/firebase/admin";

export type LessonRow = { id:number; phase:number; week:string; title:string; duration:string; description:string; videoUrl:string; isPublished:boolean; sortOrder:number };
export type ClientLesson = { id:number; phase:number; week:string; title:string; duration:string; description:string; hasVideo:boolean };

export function toClientLesson(row: any): ClientLesson {
  return {
    id: row.id, phase: row.phase, week: row.week, title: row.title,
    duration: row.duration, description: row.description,
    hasVideo: Boolean(row.videoUrl) && Boolean(row.isPublished),
  };
}

export async function getClientLessons(): Promise<ClientLesson[]> {
  const snap = await adminDb().collection("lessons").orderBy("sortOrder").get();
  return snap.docs.map((d) => toClientLesson(d.data()));
}

export async function getLessonForView(id: number): Promise<(LessonRow & { playableUrl: string }) | null> {
  const snap = await adminDb().collection("lessons").doc(String(id)).get();
  if (!snap.exists) return null;
  const d = snap.data() as LessonRow;
  return { ...d, playableUrl: d.isPublished ? d.videoUrl : "" };
}

export async function getLessonCount(): Promise<number> {
  const snap = await adminDb().collection("lessons").count().get();
  return snap.data().count;
}
```

- [ ] **Step 4: Limpiar `lessons.ts`** — quitar `LESSONS`, `getLesson`, `toClientLessons`. Conservar `Phase`/`Guide` (tipos), `PHASES`, `GUIDES`, `MEDICAL_DISCLAIMER`, `cloudinaryPoster`, y añadir `guidesForPhase`. **Cambiar cada `GUIDES[].file`** de `/guias/x.pdf` a `/api/guias/x.pdf`.

- [ ] **Step 5: Correr (debe pasar)** — `npm test` → PASS.

- [ ] **Step 6: `app/masterclass/page.tsx`** — login si no hay miembra; dashboard si la hay

```tsx
import { getSessionMember } from "@/lib/session";
import LoginForm from "./login/LoginForm";
import Dashboard from "./Dashboard";
import { GUIDES, MEDICAL_DISCLAIMER, PHASES } from "./lessons";
import { getClientLessons } from "@/lib/lessons-db";
import Image from "next/image";
import { GABI_PHOTO, LOGO_INK } from "./branding";

export const dynamic = "force-dynamic";

export default async function MasterclassPage() {
  const member = await getSessionMember();
  if (!member) {
    return (
      <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10">
          <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr]">
            <figure className="rise mx-auto w-56 md:w-full md:max-w-xs">
              <div className="arch plate-lilac">
                <Image src={GABI_PHOTO} alt="Gabi, tu coach" width={560} height={840} className="block h-auto w-full object-cover" priority />
              </div>
              <figcaption className="font-hand mt-4 -rotate-2 text-center text-2xl text-[color:var(--grape)]">tu coach, Gabi ♡</figcaption>
            </figure>
            <div>
              <Image src={LOGO_INK} alt="Gabifit" width={130} height={46} className="h-auto w-28 md:w-32" priority />
              <h1 className="mt-4 text-5xl md:text-6xl">Bienvenida a<br /><em className="marker pr-2">tu espacio.</em></h1>
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
    );
  }
  const lessons = await getClientLessons();
  return <Dashboard phases={PHASES} lessons={lessons} guides={GUIDES} disclaimer={MEDICAL_DISCLAIMER} />;
}
```

- [ ] **Step 7: `app/masterclass/leccion/[id]/page.tsx`** — gating + Firestore + dinámica

Quitar `generateStaticParams` y los imports de `LESSONS`/`getLesson`. Al inicio del componente:
```tsx
import { redirect, notFound } from "next/navigation";
import { getSessionMember } from "@/lib/session";
import { getLessonForView, getLessonCount } from "@/lib/lessons-db";
import { MEDICAL_DISCLAIMER, PHASES, cloudinaryPoster, guidesForPhase } from "../../lessons";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const member = await getSessionMember();
  if (!member) redirect("/masterclass");
  const { id } = await params;
  const lessonId = Number(id);
  const lesson = await getLessonForView(lessonId);
  if (!lesson) notFound();
  const total = await getLessonCount();
  const phase = PHASES.find((p) => p.id === lesson.phase)!;
  const guides = guidesForPhase(lesson.phase);
  const prev = await getLessonForView(lessonId - 1);
  const next = await getLessonForView(lessonId + 1);
  // ...JSX idéntico al actual, sustituyendo:
  //   lesson.videoUrl  → lesson.playableUrl
  //   cloudinaryPoster(lesson.videoUrl) → cloudinaryPoster(lesson.playableUrl)
  //   LESSONS.length   → total
  //   prev/next siguen siendo objetos con .id y .title
}
```

- [ ] **Step 8: Verificación (local)**

`npm run dev`. Sin sesión → `/masterclass` muestra login; `/masterclass/leccion/1` redirige a `/masterclass`. Loguear con una cuenta de prueba (crearla en consola Firebase + doc `members` active). Dashboard muestra 11 lecciones. Publicar una en Firestore (`isPublished:true`, `videoUrl:"https://...mp4"`) y recargar la lección → aparece el video sin redeploy.

- [ ] **Step 9: Commit**

```bash
git add lib/lessons-db.ts lib/__tests__/lessons-db.test.ts app/masterclass/lessons.ts app/masterclass/page.tsx "app/masterclass/leccion/[id]/page.tsx"
git commit -m "feat(portal): lecciones desde Firestore + gating por sesión"
```

---

## Task 8: Proteger los PDFs por ruta autenticada

**Files:** Move `public/guias/*.pdf` → `protected/guias/*.pdf`; Create `app/api/guias/[file]/route.ts`; Modify `next.config.mjs`, `app/acceso/page.tsx`

- [ ] **Step 1: Mover los PDFs**

```bash
mkdir -p protected/guias
mv public/guias/*.pdf protected/guias/
```
(Las portadas `public/guias/covers/*.jpg` se quedan donde están.)

- [ ] **Step 2: Ruta autenticada** — `app/api/guias/[file]/route.ts`

```ts
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSessionMember } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { file } = await params;
  if (!/^[a-z0-9-]+\.pdf$/i.test(file)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    const buf = await readFile(path.join(process.cwd(), "protected", "guias", file));
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${file}"` },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
```

- [ ] **Step 3: Incluir los PDFs en el bundle de la función** — `next.config.mjs`

Añadir dentro de `nextConfig`:
```js
outputFileTracingIncludes: {
  "/api/guias/[file]": ["./protected/guias/**"],
},
```

- [ ] **Step 4: `app/acceso/page.tsx`** — copy de activación

Reemplazar el bloque del código por:
```tsx
<div className="bg-brand-purple text-brand-black p-8 md:p-10 brutalist-shadow-neon mb-10">
  <p className="font-mono text-sm normal-case leading-relaxed">
    Para entrar, <strong>crea tu contraseña</strong>: ve a tu portal, toca
    "Crear / recuperar mi contraseña" e ingresa el correo de tu compra. Te llega
    un enlace para fijarla y entrar.
  </p>
</div>
```
Quitar el import/uso de `CopyCode` y la lectura de `MASTERCLASS_CODE`.

- [ ] **Step 5: Verificación**

`npm run dev` (o tras deploy): sin sesión, `GET /api/guias/guia-nutricion-gabifit.pdf` → 401. Con sesión → descarga el PDF. En el dashboard/lección los links de guías (`/api/guias/...`) abren los PDFs.

- [ ] **Step 6: Commit**

```bash
git add app/api/guias next.config.mjs app/acceso/page.tsx
git commit -m "feat(guias): PDFs servidos solo a sesiones válidas"
```

---

## Task 9: Build + deploy + verificación e2e + retiro del código compartido

**Files:** Delete `lib/masterclass-auth.ts`, `app/api/masterclass/login/route.ts`, `app/masterclass/AccessGate.tsx`, `app/acceso/CopyCode.tsx`, `proxy.ts`

- [ ] **Step 1: Quitar el flujo de código compartido**

Confirmar que nada importa `masterclass-auth`, `AccessGate`, `CopyCode`, `proxy`. Borrar los 5 archivos. Quitar `MASTERCLASS_CODE` del env de Vercel.

- [ ] **Step 2: Tests + build locales** — `npm test` (PASS) y `npm run build` (sin errores).

- [ ] **Step 3: Env en Vercel** — añadir las 11 variables `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_*` + `HOTMART_HOTTOK` + `NEXT_PUBLIC_SITE_URL` (Production).

- [ ] **Step 4: Deploy** (pedir OK al usuario por ser producción): `vercel deploy --prod --yes`

- [ ] **Step 5: Verificación e2e en producción**

1. `/api/hotmart/webhook` con token malo → 401.
2. Compra de prueba Hotmart → `members` active en Firestore → en `/acceso` crear contraseña → login → entra al portal.
3. `/masterclass/leccion/1` sin sesión → redirige a login. `GET /api/guias/...pdf` sin sesión → 401.
4. Reembolso de prueba → `members.status=revoked` → el portal bloquea.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: retirar acceso por código compartido (reemplazado por Firebase Auth)"
```

---

## Self-Review (cobertura del spec)

- Cuentas automáticas por Hotmart → Tasks 3, 4. ✅
- Login correo + contraseña + recuperación → Tasks 5, 6. ✅
- Sesión server-side + gating (portal + lección + PDFs) → Tasks 5, 7, 8. ✅
- Lecciones desde Firestore, `videoUrl` server-only → Tasks 2, 7. ✅
- Revocación por reembolso → Task 4. ✅
- Retiro del código compartido → Task 9. ✅
- Admin (miembras/acceso/CMS/progreso) → **Fase 2 y 3 (planes aparte).**
- Progreso por usuaria en Firestore → **Fase 3.**

Sin placeholders en el código de los pasos. Tipos consistentes (`Member`, `ClientLesson`, `LessonRow`, `HotmartAction`).
Riesgo anotado: el campo exacto del `hottok` (header vs body) y los nombres de evento de Hotmart deben confirmarse contra el panel de Hotmart al conectar (Task 4 verifica con 401 + prueba real).
```
