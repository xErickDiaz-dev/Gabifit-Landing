import RecuperarForm from "./RecuperarForm";

export const dynamic = "force-dynamic";

export default function RecuperarPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:py-24">
      <p className="font-meta text-[10px] text-[color:var(--grape)] md:text-xs">
        Área de miembros · Gabifit
      </p>
      <h1 className="mt-4 text-4xl md:text-5xl">
        Crea o recupera <em className="marker pr-1">tu contraseña</em>
      </h1>
      <p className="mt-4 leading-relaxed text-[color:var(--ink-soft)]">
        Te enviamos un enlace al correo de tu compra para que fijes tu contraseña y entres a tu
        portal.
      </p>
      <RecuperarForm />
      <p className="font-meta mt-10 text-[10px] text-[color:var(--ink-soft)]">
        <a href="/masterclass" className="text-[color:var(--grape)] underline">
          ← Volver al inicio de sesión
        </a>
      </p>
    </main>
  );
}
