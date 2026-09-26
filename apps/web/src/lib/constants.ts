/** Dominio público canónico — usado para metadata SEO (Open Graph, robots, sitemap),
 * no para lógica de auth (eso es `AUTH_URL`, configurado por ambiente en Vercel). */
export const SITE_URL = "https://landtourtravel.com";

/** Cliente genérico find-or-create usado por `POST /api/cotizaciones/quick`.
 * También sirve como señal para detectar cotizaciones rápidas sin editar
 * (ver `CotizacionDetailView.tsx` — oculta Aprobar/Rechazar mientras el
 * cliente siga siendo este placeholder). */
export const GENERIC_CLIENT_EMAIL = "cliente.potencial@landtourtravel.com";

/** Prefijo del ID temporal que `handleSaveProforma` (dashboard/page.tsx) asigna a una
 * cotización recién creada mientras el guardado real en el servidor sigue en curso (update
 * optimista de la lista). Si el asesor hace clic en Ver/Editar/Eliminar sobre esa fila antes
 * de que el guardado real complete, el id sigue siendo este placeholder — nunca existe en la
 * BD, así que navegar con él da "No encontrada". CotizacionesTab/DashboardTab usan este
 * prefijo para deshabilitar esas acciones mientras la fila sigue en este estado transitorio. */
export const OPTIMISTIC_COT_ID_PREFIX = "cot-";
