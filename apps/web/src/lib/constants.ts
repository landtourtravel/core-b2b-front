/** Cliente genérico find-or-create usado por `POST /api/cotizaciones/quick`.
 * También sirve como señal para detectar cotizaciones rápidas sin editar
 * (ver `CotizacionDetailView.tsx` — oculta Aprobar/Rechazar mientras el
 * cliente siga siendo este placeholder). */
export const GENERIC_CLIENT_EMAIL = "cliente.potencial@landtourtravel.com";
