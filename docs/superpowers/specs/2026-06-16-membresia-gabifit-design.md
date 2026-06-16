# Plataforma de Membresía Gabifit — Diseño

**Fecha:** 2026-06-16
**Dominio:** gabifitrd.com (Vercel, proyecto `gabifit-landing-full-proyect`, repo `Landing-GABI`)
**Stack actual:** Next.js 16 (App Router, Turbopack) + React 19 + Tailwind 3

## Objetivo

Convertir el portal masterclass actual (acceso por **código compartido** `MAMAFUERTE8`)
en una **plataforma de membresía con cuentas individuales**:

- Login por compradora (correo + contraseña).
- Cuentas creadas **automáticamente** cuando alguien compra en **Hotmart** (webhook).
- **Panel de admin** para Gaby: ver miembras, dar/quitar acceso, gestionar videos, ver progreso.

## Decisiones tomadas (brainstorming 2026-06-15/16)

- **Pago:** Hotmart (Gaby está en RD; Stripe no recibe pagos en RD).
- **Motor:** **Firebase** (Auth + Firestore) — elegido por el usuario por ser más fácil de manejar para él.
- **Creación de cuenta:** automática vía webhook de Hotmart (pago aprobado → cuenta + activación).
- **Login:** **correo + contraseña**. La compradora fija su contraseña vía el email de Firebase tras comprar.
- **Sign-up:** NO hay registro público abierto. La cuenta se crea por compra; "activar" = fijar contraseña.
- **Lanzamiento:** por fases. Fase 0 (parche actual) ya vende hoy mientras se construye el sistema real.
- **Protección de PDFs:** se sirven por una ruta autenticada de Next (Node), no desde `/public`.

## Modelo de datos (Firestore)

Firebase Auth gestiona las credenciales (correo + contraseña). Firestore guarda:

- **`members/{uid}`** — perfil de cada compradora.
  - `email`, `fullName`
  - `status`: `active` | `pending` | `revoked`
  - `hotmartTransactionId` (string | null)
  - `purchasedAt` (timestamp | null)
  - `isAdmin` (bool, default false) — marca a Gaby
  - `createdAt` (timestamp)
- **`lessons/{id}`** — las 11 lecciones, migradas desde `lessons.ts` (editables desde admin en Fase 3).
  - `id` (number), `phase` (1|2|3), `week`, `title`, `duration`, `description`, `videoUrl`, `isPublished` (bool), `sortOrder`
- **`progress/{uid}/lessons/{lessonId}`** — subcolección de progreso por miembra (la usa Fase 3).
  - `completedAt` (timestamp)

Las 7 guías PDF dejan de estar en `/public/guias/` y pasan a `protected/guias/` (fuera de lo público),
servidas por `/api/guias/[file]` solo a sesiones válidas. Las **portadas** siguen públicas en `/public/guias/covers/`.

## Sesión y protección de rutas

- **Login (cliente):** `signInWithEmailAndPassword` → se obtiene el ID token → `POST /api/auth/session`.
- **`/api/auth/session` (Node):** con Firebase Admin `createSessionCookie(idToken)` fija cookie httpOnly `gabifit_session` (14 días). `DELETE` la borra (logout).
- **Verificación server-side:** helper `getSessionMember()` lee la cookie, `verifySessionCookie` (Admin),
  y confirma que `members/{uid}.status === 'active'`. Devuelve la miembra o null.
- **Gating:**
  - `/masterclass` (server) → login si no hay miembra activa; dashboard si la hay.
  - `/masterclass/leccion/[id]` (server) → redirige a `/masterclass` si no hay miembra activa.
  - `/api/guias/[file]` (server) → verifica sesión y luego hace stream del PDF.
  - **No se usa middleware en Edge** (Firebase Admin no corre en Edge); el gating vive en server components y rutas Node. `proxy.ts` se retira.

## Componentes

### Autenticación (Firebase)
- `lib/firebase/client.ts` — init del SDK web (config pública `NEXT_PUBLIC_FIREBASE_*`).
- `lib/firebase/admin.ts` — init del Admin SDK (service account, solo servidor).
- `lib/session.ts` — `getSessionMember()` server-side (cookie → verify → member activo).
- `app/api/auth/session/route.ts` — POST crea cookie de sesión; DELETE la borra.
- Login (`LoginForm`), activación/recuperación de contraseña (vía email de Firebase).

### Webhook de Hotmart — `/api/hotmart/webhook` (POST, Node)
- Verifica el token `hottok` (header `x-hotmart-hottok` o campo del body) antes de procesar.
- `PURCHASE_APPROVED` / `PURCHASE_COMPLETE` → `auth.createUser({email})` (idempotente) + doc `members` (active).
- `PURCHASE_REFUNDED` / `PURCHASE_CHARGEBACK` / `PURCHASE_CANCELED` → `members.status = revoked` + `revokeRefreshTokens`.
- Idempotente por `hotmartTransactionId`.

### Panel de admin — `/admin` (solo `isAdmin`)
1. **Miembras** — tabla con buscador (nombre/email), estado, fecha de compra.
2. **Acceso** — activar/revocar manual, alta manual, reenviar email de activación.
3. **Videos** — editar lección (pegar `videoUrl`, marcar `isPublished`) sin redeploy.
4. **Progreso** — por miembra: lecciones completadas y fase actual.

### Migración del portal actual
- `lessons.ts` → colección `lessons` en Firestore (server lee con Admin SDK; `videoUrl` nunca al cliente).
- `app/masterclass/page.tsx` y `leccion/[id]` → leen de Firestore; la lección se vuelve dinámica.
- `progress.ts` (localStorage) → subcolección `progress` (en Fase 3).
- Se retira el código compartido (`MASTERCLASS_CODE`, `/api/masterclass/login`, `lib/masterclass-auth.ts`, `proxy.ts`).
- `/acceso` evoluciona: "activa tu cuenta — ingresa tu correo para crear tu contraseña".

## Flujo de datos (compra → acceso)

1. Compradora paga en Hotmart.
2. Hotmart → `POST /api/hotmart/webhook` (con `hottok`).
3. Webhook crea usuario en Firebase Auth + doc `members` (active).
4. En `/acceso` la compradora ingresa su correo → Firebase le envía email para fijar contraseña.
5. Login → cookie de sesión → portal lee lecciones publicadas de Firestore.
6. Reembolso → webhook → `status = revoked` → el gating bloquea.

## Manejo de errores
- Webhook con `hottok` inválido → 401, no procesa.
- Email ya existente en Auth → reactivar `members` en vez de fallar (re-compra).
- Cookie inválida/expirada → tratar como no autenticada (mostrar login).
- Firebase caído → login muestra error amable + WhatsApp de soporte.

## Fases de entrega

| Fase | Alcance |
|---|---|
| **0** | ✅ DESPLEGADA — parche para vender hoy (botón→WhatsApp, `/acceso`, copy de fechas/videos, WhatsApp arreglado) |
| **1** | Firebase Auth + sesión + webhook Hotmart + gating server-side + portal lee de Firestore → **cuentas automáticas** |
| **2** | Admin: miembras + acceso (ver/buscar/activar/revocar/alta manual/reenviar) |
| **3** | Admin: CMS de videos (editar/publicar) + progreso por miembra en Firestore |

## Dependencias externas (las provee Gaby/usuario)
- Proyecto **Firebase** con:
  - Email/Password habilitado en Authentication.
  - Config web (pública) → `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`.
  - Service account JSON (privado) → `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- En **Hotmart**: producto creado, URL del webhook configurada, token `hottok` secreto.

## Fuera de alcance (YAGNI por ahora)
- CMS de las guías PDF (ya finales).
- Roles más allá de admin/miembra.
- App móvil nativa.
- Afiliados / cupones (los maneja Hotmart si se necesitan).
- Login social (Google, etc.) — solo correo + contraseña por ahora.
