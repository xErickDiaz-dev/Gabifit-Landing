import type { Metadata } from "next";
import { oswald, robotoMono, spaceGrotesk } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabifit | Recuperación Post-Parto Real",
  description:
    "El programa de 8 semanas que enseña a las madres a recuperar su figura, su energía y su identidad — con ciencia real, sin rutinas imposibles ni dietas de castigo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${robotoMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
