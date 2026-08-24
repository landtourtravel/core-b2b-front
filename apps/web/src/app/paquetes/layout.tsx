import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paquetes Turísticos",
  description:
    "Explora el catálogo completo de paquetes turísticos de Land Tour & Travel: destinos, precios y disponibilidad para agencias minoristas.",
};

export default function PaquetesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
