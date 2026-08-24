import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Solo las páginas públicas indexables. El resto del sitio (/dashboard, /panel)
// vive detrás de login y ya está excluido en robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/paquetes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
