import InvitarForm from "./InvitarForm";

export const dynamic = "force-dynamic";

export default function InvitarPage() {
  return (
    <main>
      <h1 className="text-4xl md:text-5xl">
        Dar <em className="marker pr-1">acceso</em>
      </h1>
      <p className="font-meta mt-3 text-[11px] text-[color:var(--ink-soft)]">
        Crea acceso al coaching: clientas, regalos, influencers o VIP.
      </p>
      <div className="mt-8 max-w-2xl">
        <InvitarForm />
      </div>
    </main>
  );
}
