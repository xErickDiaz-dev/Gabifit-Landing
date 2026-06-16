import Image from "next/image";
import { getSessionMember } from "@/lib/session";
import { getClientLessons } from "@/lib/lessons-db";
import LoginForm from "./login/LoginForm";
import Dashboard from "./Dashboard";
import { GABI_PHOTO, LOGO_INK } from "./branding";
import { GUIDES, MEDICAL_DISCLAIMER, PHASES } from "./lessons";

export const dynamic = "force-dynamic";

export default async function MasterclassPage() {
  const member = await getSessionMember();

  if (!member) {
    return (
      <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
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

        <div className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10 md:py-14">
          <div className="grid w-full items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
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

            <div>
              <p className="rise rise-1 font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
                Programa Post-Parto · 8 semanas
              </p>
              <h1 className="rise rise-2 mt-4 text-5xl md:text-6xl lg:text-7xl">
                Bienvenida a<br />
                <em className="marker pr-2">tu espacio.</em>
              </h1>
              <p className="rise rise-3 mt-6 max-w-md text-base leading-relaxed text-[color:var(--ink-soft)] md:text-lg">
                Entra con el correo de tu compra. Aquí están tus guías y tus clases — a tu
                ritmo, sin culpa y acompañada.
              </p>
              <LoginForm />
            </div>
          </div>
        </div>

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

  // Solo con sesión válida y miembra activa: las lecciones viajan sin videoUrl.
  const lessons = await getClientLessons();
  return (
    <Dashboard
      phases={PHASES}
      lessons={lessons}
      guides={GUIDES}
      disclaimer={MEDICAL_DISCLAIMER}
    />
  );
}
