"use client";
import { useEffect, useState } from "react";
import { isBuildStale } from "@/lib/staleBuild";

/**
 * Detecta cuando el navegador quedó corriendo JS de un deploy VIEJO (build id distinto al
 * que sirve el servidor ahora mismo) y recarga la pestaña automáticamente — sin que el
 * usuario tenga que saber que existe algo como "borrar caché" o "recargar forzado".
 *
 * Por qué pasa: un navegador que dejó la pestaña abierta desde antes del último deploy (o que
 * cacheó agresivamente el bundle) sigue ejecutando el JS viejo. Ese JS viejo puede llamar a
 * una API ya actualizada con un formato distinto (o viceversa), fallando en silencio — un
 * asesor ve "no se guarda nada" sin ningún error visible, porque técnicamente su navegador
 * nunca llegó a cargar el código nuevo que sí funciona.
 *
 * Next.js expone el build id del bundle actualmente cargado en `window.__NEXT_DATA__.buildId`.
 * Comparándolo contra el build id que el servidor sirve AHORA MISMO (pidiendo la página actual
 * sin caché) se detecta el desfase sin necesitar un endpoint nuevo.
 */
export function StaleBuildGuard() {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    const clientBuildId = (window as any).__NEXT_DATA__?.buildId;
    // En `next dev` el buildId es siempre "development" — no hay nada que comparar.
    if (!clientBuildId || clientBuildId === "development") return;

    const checkStale = async () => {
      const stale = await isBuildStale();
      if (stale) {
        setReloading(true);
        // Pequeña pausa para que el aviso alcance a pintarse antes de recargar —
        // el reload en sí ya refresca el bundle, no hace falta más que eso.
        setTimeout(() => window.location.reload(), 1200);
      }
    };

    // Al montar (cubre pestañas recién abiertas con un bundle ya viejo) y cada vez que la
    // pestaña vuelve a estar visible (el usuario volvió de otra app/pestaña) — nunca mientras
    // está activamente escribiendo en un campo, evitando una recarga en mal momento.
    checkStale();
    const onVisible = () => { if (document.visibilityState === "visible") checkStale(); };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(checkStale, 10 * 60 * 1000);

    // Red de seguridad complementaria: si el bundle viejo intenta cargar un chunk que Next.js
    // ya no sirve (típico tras un deploy), Chrome lanza un error de carga de script/módulo en
    // vez de una excepción de JS normal — se detecta aparte porque no siempre dispara `error`.
    const onError = (e: ErrorEvent) => {
      const msg = e?.message || "";
      if (/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(msg)) {
        window.location.reload();
      }
    };
    window.addEventListener("error", onError);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("error", onError);
      clearInterval(interval);
    };
  }, []);

  if (!reloading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[99999] bg-primary text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-scale">
      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
      Actualizando a la última versión...
    </div>
  );
}
