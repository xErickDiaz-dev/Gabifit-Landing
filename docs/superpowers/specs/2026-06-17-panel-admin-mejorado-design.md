# Panel de admin mejorado — Diseño

**Fecha:** 2026-06-17
**Proyecto:** Landing-GABI (Next.js 16 · React 19 · Firebase Auth + Firestore)

## Objetivo

Hoy `/masterclass/admin` solo lista las solicitudes `pending` y permite aprobar/
rechazar. Gabi quiere **más control**: ver a TODAS sus miembras, su estado, cuándo
entraron por última vez, **en qué lección van**, dar/quitar acceso a mano, y dar de
alta a alguien sin que se registre.

## Lo que ya existe (y reutilizamos)

- Colección **`members/{uid}`**: `email`, `fullName`, `whatsapp`, `status`
  (`active|pending|revoked`), `isAdmin`, `source`, `createdAt`.
- **`/api/admin/members`** (POST, solo `isAdmin`): `approve` (→active) / `reject` (→revoked).
- **`lib/members-db.ts`** → `getPendingMembers()`.
- **`lib/session.ts`** → `getSessionMember()` (active) y `getSessionMemberAny()`.
- **`AdminPanel.tsx`** (client) → lista pending + aprobar/rechazar.
- **Progreso**: hoy en **localStorage** (`app/masterclass/progress.ts`, `useProgress`),
  array de `lessonId` completados. NUNCA llega al servidor → el admin no lo ve.
- **11 lecciones** estáticas (`PHASES`/`lessons-db`). El total para el progreso es
  el número de lecciones (`getClientLessons().length`).

## Diseño

`/masterclass/admin` pasa de una lista a un panel con **dos bloques** + alta manual.

### Bloque 1 — Solicitudes en espera (existente, arriba)
Las `pending` con **Aprobar / Rechazar**. Sin cambios funcionales.

### Bloque 2 — Todas las miembras (nuevo)
- **Resumen**: total · activas · en espera (ej. "24 miembras · 18 activas · 3 en espera").
- **Buscador** (cliente): filtra por nombre o correo.
- **Lista**, cada miembra muestra:
  - Nombre · correo · WhatsApp
  - **Estado**: 🟢 Activa · 🟡 En espera · 🔴 Sin acceso
  - **Última conexión**: relativa ("hace 2 días") desde Firebase Auth `lastSignInTime`.
  - **Progreso**: barra + "5 de 11 lecciones" (0/11 si no empezó).
  - Botón **Dar acceso** (si no está activa) / **Quitar acceso** (si está activa).

### Alta manual
- Un pequeño formulario "Dar de alta": Gabi escribe **correo** (+ nombre opcional).
- Crea la cuenta en Auth si no existe + doc `members` en **active**, `source: "alta-manual"`.
- La persona fija su contraseña con **"Crear / recuperar contraseña"** (flujo de email
  de Firebase ya existente en `/masterclass/recuperar`). Gabi NO maneja contraseñas.

### Progreso guardado en el servidor (el cambio de fondo)
- Cuando una miembra marca/desmarca una lección, además de localStorage hace
  `POST /api/progress { lessonId, done }`.
- El handler (server, sesión `active`) actualiza `members/{uid}.completedLessons`
  (`number[]`) con `arrayUnion`/`arrayRemove`. Idempotente.
- `useProgress` se inicializa desde localStorage (instantáneo) y sincroniza al servidor
  en cada cambio; si la red falla, el check local se mantiene (no se pierde la UX).
- El panel lee `completedLessons.length` por miembra para la barra.
- No se migra el progreso histórico de localStorage (empieza a contar desde el deploy).

## Modelo de datos — campos nuevos en `members/{uid}`
- `completedLessons: number[]` — lecciones completadas (default `[]`).
- `source` admite además `"alta-manual"`.
- La **última conexión** NO se guarda en Firestore: se lee de Firebase Auth
  (`getUser(uid).metadata.lastSignInTime`) al construir la lista.

## Componentes a crear / modificar

**Crear:**
- `lib/progress-db.ts` — pura/IO mínima: normaliza el toggle de `completedLessons`.
- `app/api/progress/route.ts` — POST guarda progreso (sesión active).
- `app/api/admin/members` — extender acciones: `activate`, `revoke`, `create` (alta manual).
  (approve/reject se mantienen como alias de activate/revoke.)
- `app/masterclass/admin/MembersTable.tsx` — bloque 2 (client): buscador + lista + acciones.
- `app/masterclass/admin/AltaManual.tsx` — formulario de alta manual (client).

**Modificar:**
- `lib/members-db.ts` — `getAllMembers()`: todas las miembras + `completedLessons` +
  `lastSignInTime` (vía Auth). Reusa el tipo para pending.
- `app/masterclass/admin/page.tsx` — server: carga pending + todas + total de lecciones,
  pasa a `AdminPanel`.
- `app/masterclass/admin/AdminPanel.tsx` — compone Bloque 1 (pending) + AltaManual +
  MembersTable (Bloque 2).
- `app/masterclass/progress.ts` (`useProgress`) — sincroniza al servidor además de localStorage.

## Seguridad
- `/api/admin/members` y `getAllMembers` exigen `isAdmin` server-side (sesión). El cliente
  nunca escribe estados ni `isAdmin`.
- `/api/progress` exige sesión `active`; cada miembra solo escribe SU propio progreso
  (uid de la sesión, no del body).
- Alta manual crea siempre `active` con `source: "alta-manual"`; nunca `isAdmin`.
- `lessons`, `leccion/[id]` y `guias` siguen detrás de `getSessionMember()` (active).

## Fuera de alcance (YAGNI)
- CMS de videos (editar lecciones desde el admin) — Fase aparte.
- Ficha de detalle con qué lección específica completó cada una (por ahora solo el conteo X/N).
- Exportar a CSV / filtros avanzados / paginación (con el volumen actual no hace falta).
- Migrar el progreso histórico de localStorage.

## Criterios de éxito
1. En `/masterclass/admin` Gabi ve a TODAS sus miembras con estado, última conexión y
   progreso (X de N), además del bloque de solicitudes en espera.
2. Puede **buscar** por nombre/correo y **dar/quitar acceso** a cualquiera con un clic.
3. Puede **dar de alta** un correo nuevo; esa persona fija su contraseña por email y entra.
4. Cuando una miembra marca una lección, su progreso queda en el servidor y se ve en el panel.
5. El gating del contenido pagado (videos/guías) sigue intacto.
