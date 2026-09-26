/** Compara el build id del JS que el navegador tiene cargado (`__NEXT_DATA__.buildId`,
 * embebido por Next.js en cada página) contra el que el servidor sirve AHORA MISMO. Si
 * difieren, el navegador quedó corriendo un bundle de un deploy anterior — ver
 * `StaleBuildGuard.tsx` para el porqué esto puede hacer que acciones como guardar fallen
 * en silencio. Usado como chequeo previo a acciones críticas (ej. guardar una cotización),
 * además del chequeo en segundo plano de `StaleBuildGuard`. */
export async function isBuildStale(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const clientBuildId = (window as any).__NEXT_DATA__?.buildId;
  if (!clientBuildId || clientBuildId === "development") return false;

  try {
    const res = await fetch(window.location.pathname + window.location.search, {
      cache: "no-store",
      headers: { "x-stale-build-check": "1" },
    });
    const html = await res.text();
    const match = html.match(/"buildId":"([^"]+)"/);
    const serverBuildId = match?.[1];
    return !!serverBuildId && serverBuildId !== clientBuildId;
  } catch {
    return false;
  }
}
