# Registro con aprobación de Gabi — Diseño

**Fecha:** 2026-06-17
**Proyecto:** Landing-GABI (Next.js 16 · React 19 · Firebase Auth + Firestore)

## Objetivo

Hoy las miembras solo entran al portal del masterclass cuando **pagan en Hotmart**
(el webhook crea su cuenta en estado `active` automáticamente). No existe forma de
registrarse desde la web.

Queremos sumar un **segundo camino**, sin romper el de Hotmart:

1. Cualquiera puede **registrarse** desde el landing.
2. Queda **en espera** (`pending`) hasta que **Gabi la apruebe** a mano.
3. Mientras espera, ve un **adelanto del temario** (las 3 fases, la lista de clases
   y las guías) con el contenido bloqueado.
4. Cuando Gabi la aprueba, se desbloquea el **portal completo** (videos + guías).

Los dos caminos conviven: Hotmart sigue activando cuentas solo; el registro web
siempre crea cuentas en `pending`.

## Lo que ya existe (y reutilizamos)

- **Firebase Auth** (email/contraseña) en cliente (`lib/firebase/client.ts`) y
  **Admin SDK** en servidor (`lib/firebase/admin.ts`).
- Colección **`members`** en Firestore con `status: "active" | "pending" | "revoked"`
  e `isAdmin`. El estado `pending` ya está contemplado en los tipos.
- **Sesión por cookie httpOnly** (`gabifit_session`): `app/api/auth/session/route.ts`
  cambia un ID token por la cookie; `lib/session.ts → getSessionMember()` la valida.
  Hoy `getSessionMember()` devuelve `null` si la miembra no está `active`.
- **Login** y **recuperar contraseña** ya construidos en `app/masterclass/`.
- **Webhook de Hotmart** (`app/api/hotmart/webhook/route.ts`) crea/activa/revoca
  miembras. **No se toca.**
- Contenido del adelanto disponible sin exponer videos: `PHASES` y `GUIDES`
  (estáticos en `app/masterclass/lessons.ts`) y `getClientLessons()`
  (`lib/lessons-db.ts`), que devuelve `ClientLesson` **sin `videoUrl`** y con
  `hasVideo`. El portal ya pinta un sello **"Pronto"** cuando `!hasVideo`
  (patrón reutilizable para el estado bloqueado).

## Flujo de la usuaria (estados)

Al entrar a `/masterclass`, según la sesión:

| Estado | Qué ve |
|---|---|
| Sin sesión | Login actual + enlace **"¿Primera vez? Regístrate"** |
| `pending` | Pantalla **"Tu solicitud está en revisión 💜"** + **adelanto** del temario (fases, clases con candado, guías en vista previa). Sin acceso a videos ni descargas. |
| `active` | **Portal completo** actual (sin cambios) |
| `revoked` | Mensaje de que su acceso terminó + contacto |

## Componentes a crear / modificar

### Nuevos

- **`app/masterclass/registro/page.tsx`** + **`RegistroForm.tsx`** (client):
  formulario Nombre · Correo · WhatsApp (obligatorio) · Contraseña.
  Al enviar: `createUserWithEmailAndPassword` → obtiene idToken →
  `POST /api/auth/registro` (crea el `member` en `pending`) →
  reutiliza `POST /api/auth/session` para la cookie → redirige a `/masterclass`.
- **`app/api/auth/registro/route.ts`** (server): verifica el idToken con Admin SDK,
  extrae `uid`/`email`, y crea/mergea el doc `members/{uid}` con
  `status: "pending"`, `fullName`, `whatsapp`, `source: "registro-web"`,
  `createdAt`. **Idempotente:** si la cuenta ya existe en `active`, no la degrada.
- **`app/masterclass/PendingPreview.tsx`** (client): la pantalla de espera + el
  adelanto. Recibe `PHASES`, `GUIDES` y `ClientLesson[]` por props (igual que
  `Dashboard`, para no filtrar `videoUrl`). Clases y guías **sin enlaces activos**.
- **`app/masterclass/admin/page.tsx`** + **`AdminPanel.tsx`** (client): panel de
  Gabi. Solo si `isAdmin`. Lista de **pendientes** (nombre, correo, WhatsApp, fecha)
  con **contador** ("3 nuevas") y botones **Aprobar** / **Rechazar**.
- **`app/api/admin/members/route.ts`** (server): verifica que quien llama es
  `isAdmin`; aplica `approve` (→ `active`) o `reject` (→ `revoked`).

### Modificados

- **`lib/session.ts`**: añadir `getSessionMemberAny()` que devuelve la miembra con
  cualquier `status` (o `null` si no hay sesión válida). `getSessionMember()` pasa a
  apoyarse en ella, filtrando a `active` (sin cambiar su contrato actual).
- **`app/masterclass/page.tsx`**: usar `getSessionMemberAny()` y ramificar a las 4
  pantallas de la tabla de arriba.
- **`app/page.tsx`** (landing): el navbar pasa de solo-logo a **logo (izquierda) +
  "Entrar" y "Registrarme" (derecha)**, en el estilo brutalist existente
  (neon/negro), responsive. "Entrar" → `/masterclass`; "Registrarme" →
  `/masterclass/registro`.

## Modelo de datos — `members/{uid}`

Campos nuevos para el registro web (se suman a los del webhook):

- `whatsapp: string`
- `source: "registro-web"` (las de Hotmart quedan implícitas / `"hotmart"`)
- `status: "pending"` al crearse; `createdAt` (ya se usa).

Sin `hotmartTransactionId` ni `purchasedAt` (esos son del camino de pago).

## Seguridad

- El registro web **solo** crea `pending`. Activar a alguien es exclusivo de (a) el
  webhook de Hotmart o (b) el panel de Gabi. El cliente nunca escribe el `status`.
- `/api/admin/members` verifica `isAdmin` **en el servidor** (vía sesión), no confía
  en el navegador.
- Las pending **no** pueden ver videos ni descargar guías: las rutas
  `app/masterclass/leccion/[id]/page.tsx` y `app/api/guias/[file]/route.ts` deben
  seguir exigiendo `getSessionMember()` (= `active`). Se verifica como parte del
  trabajo.
- El adelanto se renderiza desde el servidor con datos `ClientLesson` (sin
  `videoUrl`), igual que el `Dashboard`.
- Anti-enumeración aceptable: si el correo ya existe, Firebase lo revela al
  registrar; mostramos un mensaje amable que dirige a iniciar sesión / recuperar
  contraseña (no es un contexto de alta sensibilidad).

## Fuera de alcance (YAGNI por ahora)

- **Aviso por email a Gabi** (Resend u otro): se decidió no incluirlo; el panel con
  contador de pendientes es la fuente de verdad. Se puede añadir después.
- **"Mi portal" dinámico en el navbar** del landing cuando ya hay sesión: lo
  dejamos fijo en "Entrar" + "Registrarme" para mantener el landing estático/rápido.
  Mejora opcional futura.
- Menú hamburguesa en móvil: los dos botones caben sin él.

## Criterios de éxito

1. Desde el landing, una visitante nueva puede registrarse (Nombre, Correo,
   WhatsApp, Contraseña) y queda en `pending`.
2. Recién registrada, ve la pantalla "en revisión" con el adelanto del temario y
   **no** puede abrir videos ni descargar guías.
3. Gabi entra a `/masterclass/admin`, ve la pendiente con su WhatsApp y la aprueba.
4. Tras aprobarla, la miembra ve el portal completo (videos + guías) sin volver a
   registrarse.
5. El flujo de Hotmart sigue funcionando igual que antes.
