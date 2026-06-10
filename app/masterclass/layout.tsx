import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu Masterclass | Gabifit",
  description:
    "Área de miembros del Programa Gabifit Post-Parto — 8 semanas para recuperar tu figura, tu energía y tu identidad.",
  robots: { index: false, follow: false },
};

export default function MasterclassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
