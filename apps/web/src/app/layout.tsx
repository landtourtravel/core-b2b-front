import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const TITLE = "Land Tour & Travel | Agencia Mayorista de Viajes";
const DESCRIPTION =
  "Land Tour & Travel es un operador mayorista de turismo: paquetes turísticos pre-negociados para agencias minoristas, con portal B2B de cotización en línea.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Land Tour & Travel",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: SITE_URL,
    siteName: "Land Tour & Travel",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/images/playa_hero.jpg",
        width: 1200,
        height: 630,
        alt: "Land Tour & Travel — paquetes turísticos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/playa_hero.jpg"],
  },
};

// Schema.org TravelAgency — ayuda a buscadores y asistentes de IA a identificar
// la empresa como mayorista de turismo B2B (no venta directa al consumidor final).
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Land Tour & Travel",
  url: SITE_URL,
  logo: `${SITE_URL}/images/lttlogo.png`,
  description: DESCRIPTION,
  areaServed: "EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
