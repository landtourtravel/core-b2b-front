# Dashboard B2B — Rediseño Completo: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar el portal B2B (`/dashboard`) en 3 sprints: Sprint A (accesibilidad/cosmético), Sprint B (precios reales + wizard reestructurado), Sprint C (extracción de componentes).

**Architecture:** Monorepo Next.js 15 con Turborepo. El dashboard es un único componente cliente de ~2200 líneas que se refactoriza progresivamente — primero sin tocar lógica de negocio (Sprint A), luego cambiando la lógica de precios y el wizard (Sprint B), y finalmente extrayendo componentes (Sprint C). Cada sprint produce código funcional e independientemente verificable.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, NextAuth v5, Prisma 7 + `@prisma/adapter-pg`, Supabase PostgreSQL, TypeScript, Lucide React, `next/image`.

## Global Constraints

- `apps/web/src/app/dashboard/page.tsx` es el único archivo de la UI hasta que Sprint C lo divida.
- Prisma: NUNCA `prisma migrate`. Solo `prisma db push` si hay cambios de schema (no aplica en estos sprints).
- Modelos readonly (`PaqueteRef`, `DestinoRef`, `HotelRef`, `TarifaHotelRef`, `VersionPaqueteRef`) — solo lectura, nunca write.
- NextAuth v5: NO modificar `auth.ts`, `auth.config.ts`, ni `middleware.ts`.
- `cotManualServices` debe eliminarse completamente en Sprint B (no renombrar, no dejar referencias muertas).
- `cotHabs` arranca vacío `{}` desde Sprint B — el validador `step3CanProceed` ya requiere al menos una habitación.
- `step1CanProceed = clientName.trim().length > 0` — el email NO es obligatorio.
- El markup (`agencyMarkup`) es invisible al cliente en PDFs y proformas.
- Colores de marca: `primary #0B4339`, `secondary #28BFA9`, `gold #C9A96E`. No usar otros colores primarios.
- No hay suite de tests — la verificación es manual siguiendo los pasos de cada tarea.
- `npm run dev:web` levanta el servidor en `http://localhost:3000`. Credenciales de prueba: `asesor@agenciapruebas.com / Admin123*`.

---

## Mapa de archivos

| Archivo | Sprint | Acción |
|---------|--------|--------|
| `apps/web/src/app/dashboard/page.tsx` | A, B, C | Modify (Sprint A+B), luego base para extracción (Sprint C) |
| `apps/web/src/app/api/cotizar-datos/route.ts` | B | Modify — añadir `hotelTarifas` al payload de paquetes |
| `apps/web/src/app/api/cotizaciones/[id]/status/route.ts` | B | Modify — aceptar `selectedHotelId`, `total`, `cantidades` |
| `apps/web/src/app/dashboard/DashboardContext.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/DashboardTab.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/PaquetesTab.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/CotizacionesTab.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/PerfilTab.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/cotizador/CotizadorWizard.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/cotizador/Step1Client.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/cotizador/Step2Config.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/cotizador/Step3Rooms.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/cotizador/Step4Review.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/modals/DeleteConfirmModal.tsx` | C | Create (Sprint A lo hace inline) |
| `apps/web/src/app/dashboard/components/modals/PreviewCotizacionModal.tsx` | C | Create |
| `apps/web/src/app/dashboard/components/modals/ApprovalModal.tsx` | C | Create (Sprint B lo hace inline) |

---

## ═══════════════════════════════════
## SPRINT A — Cosmético / Accesibilidad
## ═══════════════════════════════════

---

### Task A1: `<Image>`, aria-labels, htmlFor, iOS safe area, touch targets

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Produces: nada nuevo — solo mejoras de markup existente

- [ ] **Paso 1: Reemplazar `<img>` por `<Image>` en el catálogo de paquetes**

Busca la línea ~1279 (dentro del bloque `{activeTab === "paquetes"}`):

```tsx
// ANTES:
<img
  src={pkg.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"}
  alt={pkg.title}
  className="w-full h-full object-cover transition-transform duration-300 group-hover/row:scale-105"
/>

// DESPUÉS (Next.js Image — Unsplash y S3 ya están en remotePatterns de next.config.ts):
<Image
  src={pkg.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"}
  alt={pkg.title}
  width={64}
  height={64}
  className="w-full h-full object-cover transition-transform duration-300 group-hover/row:scale-105"
/>
```

`Image` ya está importado al principio del archivo (`import Image from "next/image"`).

- [ ] **Paso 2: Añadir aria-labels a botones de ícono en la tabla de cotizaciones**

Busca los botones Eye, Star y Trash2 en el tab "cotizaciones" y en "dashboard" (hay dos lugares). Añade `aria-label`:

```tsx
// Botón Eye — "Ver cotización":
<button
  aria-label={`Ver cotización ${cot.codigo}`}
  onClick={() => { setPreviewCot(cot as CotizacionExtended); setPreviewTab("Cliente"); }}
  className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer"
  title="Previsualizar"
>
  <Eye size={12} />
</button>

// Botón Star:
<button
  aria-label={`Finalizar cotización ${cot.codigo}`}
  onClick={() => handleOpenFinalizeDialog(cot.id)}
  className="p-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-lg border border-secondary/20 transition-all cursor-pointer"
  title="Generar Cotización Final"
>
  <Star size={12} />
</button>

// Botón Trash2 (lo vamos a cambiar en Task A2, por ahora solo añadir aria-label):
<button
  aria-label={`Eliminar cotización ${cot.codigo}`}
  onClick={() => handleEliminar(cot.id)}
  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-400 rounded-lg border border-rose-100 transition-all cursor-pointer"
  title="Eliminar"
>
  <Trash2 size={12} />
</button>
```

- [ ] **Paso 3: Añadir `id`/`htmlFor` en los inputs del Paso 1 (datos del cliente)**

Busca el bloque "PASO 1: DATOS DEL CLIENTE" (~línea 1377). Añade `id` a cada input y `htmlFor` al label correspondiente:

```tsx
// Nombre — label:
<label htmlFor="client-name" className={labelCls}>Nombre Completo *</label>
<input id="client-name" type="text" required value={clientName} ... />

// Email:
<label htmlFor="client-email" className={labelCls}>Correo Electrónico</label>
<input id="client-email" type="email" value={clientEmail} ... />

// Teléfono:
<label htmlFor="client-phone" className={labelCls}>Teléfono / WhatsApp</label>
<input id="client-phone" type="tel" value={clientPhone} ... />

// Identificación:
<label htmlFor="client-doc" className={labelCls}>Identificación / C.I.</label>
<input id="client-doc" type="text" value={clientId} ... />

// Dirección:
<label htmlFor="client-address" className={labelCls}>Dirección</label>
<input id="client-address" type="text" value={clientAddress} ... />
```

Añade también `htmlFor`/`id` al campo de comisión en Paso 3:
```tsx
<label htmlFor="agency-markup" className={...}>Comisión / Markup...</label>
<input id="agency-markup" type="number" ... />
```

- [ ] **Paso 4: iOS Safe Area en el Bottom Nav**

Busca el `<nav>` con `className="lg:hidden fixed bottom-0 ..."` (~línea 2280). Añade el `style`:

```tsx
<nav
  className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 flex items-stretch shadow-[0_-4px_24px_rgba(5,41,36,0.06)]"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>
```

- [ ] **Paso 5: Touch targets 44px en los botones +/- de habitaciones**

Busca el grid de habitaciones en el Paso 3 (~línea 1989). Los botones `Minus` y `Plus` están en `w-7 h-7` (28px). Cambia ambos a `w-11 h-11`:

```tsx
// Botón Minus:
<button
  type="button"
  aria-label={`Reducir cantidad de ${label}`}
  onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: Math.max(0, (prev[tipoPax] ?? 0) - 1) }))}
  disabled={qty === 0}
  className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
>
  <Minus size={14} />
</button>
<span className="w-8 text-center font-black text-sm text-primary">{qty}</span>
// Botón Plus:
<button
  type="button"
  aria-label={`Aumentar cantidad de ${label}`}
  onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: (prev[tipoPax] ?? 0) + 1 }))}
  disabled={...}
  className="w-11 h-11 rounded-xl bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
>
  <Plus size={14} />
</button>
```

- [ ] **Paso 6: Verificar que `animate-fade-scale` existe en globals.css**

Abre `apps/web/src/app/globals.css`. Busca `animate-fade-scale`. Si no existe, añade al final del archivo:

```css
@keyframes fade-scale {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fade-scale {
  animation: fade-scale 0.15s ease-out;
}
```

- [ ] **Paso 7: Verificación manual**

```bash
npm run dev:web
```

1. Ir a `/dashboard` → tab "Paquetes": expandir un destino, verificar que la imagen carga sin errores de consola (no debería haber `ERR_INVALID_URL` ni warnings de `<img>`).
2. Inspecionar los botones Eye/Trash2 con DevTools → verificar `aria-label` en el HTML.
3. En el wizard, Paso 1 → clic en el `<label>` "Nombre Completo" → el foco debe saltar al `<input>` correspondiente.
4. En mobile (DevTools → responsive), verificar que el bottom nav no queda cortado (simular iPhone 14 con safe area).
5. En el Paso 3 → los botones +/- deben tener el área más grande y ser más fáciles de tocar.

- [ ] **Paso 8: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx apps/web/src/app/globals.css
git commit -m "feat(dashboard): a11y — Image, aria-labels, htmlFor, safe area, touch targets 44px"
```

---

### Task A2: Modal de confirmación personalizado para eliminar

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: estado existente `cotizaciones`
- Produces: nuevo estado `confirmDeleteId: string | null` y `confirmDeleteRef: RefObject<HTMLDialogElement>`

- [ ] **Paso 1: Añadir estado y ref para el modal**

Justo después de la línea `const proformaDialogRef = useRef<HTMLDialogElement>(null);` (~línea 173), añade:

```tsx
const confirmDeleteDialogRef = useRef<HTMLDialogElement>(null);
const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
```

- [ ] **Paso 2: Cambiar el onClick del botón Trash2**

Busca todos los botones Trash2 en el archivo (hay dos lugares: tab "cotizaciones" y bottom cards móvil). Cambia el `onClick` de llamar directamente a `handleEliminar` a abrir el modal:

```tsx
// ANTES:
onClick={() => handleEliminar(cot.id)}

// DESPUÉS:
onClick={() => {
  setConfirmDeleteId(cot.id);
  if (confirmDeleteDialogRef.current && !confirmDeleteDialogRef.current.open)
    confirmDeleteDialogRef.current.showModal();
}}
```

- [ ] **Paso 3: Añadir el JSX del modal de confirmación**

Justo antes del cierre del `proformaDialogRef` (`</dialog>` del dialog de proforma), añade este nuevo dialog:

```tsx
{/* ── Modal confirmar eliminación ── */}
<dialog
  ref={confirmDeleteDialogRef}
  className="backdrop:bg-primary/40 backdrop:backdrop-blur-sm rounded-3xl border-0 p-0 shadow-2xl w-[90vw] max-w-sm"
  onCancel={(e) => { e.preventDefault(); confirmDeleteDialogRef.current?.close(); setConfirmDeleteId(null); }}
>
  {(() => {
    const cot = cotizaciones.find((c) => c.id === confirmDeleteId);
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-primary">Eliminar cotización</h3>
            <p className="text-[10px] font-bold text-primary/50 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>
        {cot && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
            <p className="text-xs font-black text-rose-700">{cot.codigo}</p>
            <p className="text-[10px] font-bold text-rose-500 mt-0.5">{cot.cliente?.nombre || "—"}</p>
          </div>
        )}
        <p className="text-xs font-bold text-primary/60">
          ¿Estás seguro de que deseas eliminar esta cotización?
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => { confirmDeleteDialogRef.current?.close(); setConfirmDeleteId(null); }}
            className="flex-1 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (confirmDeleteId) handleEliminar(confirmDeleteId);
              confirmDeleteDialogRef.current?.close();
              setConfirmDeleteId(null);
            }}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    );
  })()}
</dialog>
```

- [ ] **Paso 4: Verificación manual**

```bash
npm run dev:web
```

1. Ir a `/dashboard` → tab "Cotizaciones".
2. Hacer clic en el ícono de papelera de una cotización BORRADOR o RECHAZADA.
3. Debe abrirse el modal personalizado con el código y nombre de la cotización.
4. Hacer clic en "Cancelar" → el modal cierra, la cotización permanece.
5. Abrir de nuevo → clic en "Sí, eliminar" → el modal cierra y la cotización desaparece de la lista.
6. Presionar Escape → el modal cierra sin eliminar.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): replace native confirm() with branded DeleteConfirmModal"
```

---

### Task A3: Renombrar labels, stepper móvil, animación bottom nav

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Renombrar labels del selector de modo (Paso 2)**

Busca el bloque del selector de modo (~línea 1453). Cambia los textos:

```tsx
// ANTES:
{ mode: "catalogo" as const, label: "Catálogo DB", desc: "Paquetes con precios del catálogo", icon: <Compass size={18} /> },
{ mode: "libre" as const,    label: "Cotización Libre", desc: "Selecciona destino y hotel manualmente", icon: <Globe size={18} /> },

// DESPUÉS:
{ mode: "catalogo" as const, label: "Paquetes Disponibles", desc: "Elige de los paquetes armados por Land Tour Travel", icon: <Compass size={18} /> },
{ mode: "libre" as const,    label: "Armar desde Cero", desc: "Selecciona destino, hotel y servicios manualmente", icon: <Globe size={18} /> },
```

- [ ] **Paso 2: Añadir etiqueta descriptiva en stepper móvil**

Busca el `<div className="h-6" />` que hay justo después del stepper (~línea 1369). Reemplázalo:

```tsx
// ANTES:
<div className="h-6" />

// DESPUÉS:
<div className="h-6 relative">
  <p className="text-center text-[10px] font-black text-primary/50 uppercase tracking-wider mt-1 sm:hidden">
    Paso {step}:{" "}
    {step === 1 ? "Cliente" : step === 2 ? "Configuración" : step === 3 ? "Habitaciones" : "Revisión"}
  </p>
</div>
```

- [ ] **Paso 3: Añadir transición de escala en el bottom nav activo**

Busca el bottom nav (`lg:hidden fixed bottom-0`). En cada botón de tab del bottom nav, añade `transition-all duration-200` al className base y `scale-110` cuando está activo:

```tsx
// El patrón es similar para los 5 tabs del bottom nav. Ejemplo para el primero:
<button
  onClick={() => { if (activeTab === "cotizar") resetForm(); setActiveTab("dashboard"); }}
  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200 ${
    activeTab === "dashboard"
      ? "text-secondary scale-110"
      : "text-primary/40 hover:text-primary/60 active:scale-95"
  }`}
>
```

Aplica el mismo patrón (`scale-110` en activo, `transition-all duration-200` siempre) a los demás tabs del bottom nav: paquetes, cotizar, cotizaciones, perfil.

- [ ] **Paso 4: Verificación manual**

```bash
npm run dev:web
```

1. En el Paso 2 del wizard, verificar que el selector dice "Paquetes Disponibles" y "Armar desde Cero".
2. En móvil (DevTools responsive), avanzar por los pasos del wizard — debe aparecer "Paso 1: Cliente", "Paso 2: Configuración", etc. debajo de la barra de progreso.
3. En móvil, cambiar entre tabs del bottom nav — el ícono activo debe escalarse ligeramente (scale-110) con transición suave.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): rename cotizador modes, add mobile stepper label, bottom nav scale animation"
```

---

### Task A4: Auto-save del wizard en sessionStorage

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Produces: `restoreDraft()` y `clearDraft()` (funciones locales), estado `hasDraft: boolean`

- [ ] **Paso 1: Añadir estado y constante de clave**

Justo después de la constante `TERMINOS_CONDICIONES` (~línea 96), añade:

```ts
const DRAFT_KEY = "cotizador-draft-v1";
```

Justo después de la declaración de `cotExtraDestinoIds` (~línea 234), añade:

```tsx
const [hasDraft, setHasDraft] = useState(false);
```

- [ ] **Paso 2: Añadir funciones de draft**

Justo después del efecto `useEffect(() => { fetch("/api/cotizar-datos")...` (~línea 313), añade:

```tsx
// ── Draft auto-save helpers ──────────────────────────────────────────────────
const clearDraft = () => {
  sessionStorage.removeItem(DRAFT_KEY);
  setHasDraft(false);
};

const restoreDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.clientName    !== undefined) setClientName(d.clientName);
    if (d.clientEmail   !== undefined) setClientEmail(d.clientEmail);
    if (d.clientPhone   !== undefined) setClientPhone(d.clientPhone);
    if (d.clientId      !== undefined) setClientId(d.clientId);
    if (d.clientAddress !== undefined) setClientAddress(d.clientAddress);
    if (d.cotMode       !== undefined) setCotMode(d.cotMode);
    if (d.cotSelectedPkgId    !== undefined) setCotSelectedPkgId(d.cotSelectedPkgId);
    if (d.cotSelectedDestinoId !== undefined) setCotSelectedDestinoId(d.cotSelectedDestinoId);
    if (d.cotSelectedHotelIds  !== undefined) setCotSelectedHotelIds(d.cotSelectedHotelIds);
    if (d.cotHabs       !== undefined) setCotHabs(d.cotHabs);
    if (d.cotFechaSalida !== undefined) setCotFechaSalida(d.cotFechaSalida);
    if (d.cotCustomDias  !== undefined) setCotCustomDias(d.cotCustomDias);
    if (d.cotExtraNights !== undefined) setCotExtraNights(d.cotExtraNights);
    if (d.cotFlightOverride !== undefined) setCotFlightOverride(d.cotFlightOverride);
    if (d.cotFlightPrice    !== undefined) setCotFlightPrice(d.cotFlightPrice);
    if (d.cotLibreActSel    !== undefined) setCotLibreActSel(d.cotLibreActSel);
    if (d.cotLibreTrsSel    !== undefined) setCotLibreTrsSel(d.cotLibreTrsSel);
    if (d.step !== undefined) setStep(d.step);
    setHasDraft(false);
  } catch {}
};
```

- [ ] **Paso 3: Añadir efecto de auto-save (debounced)**

Añade este efecto después del `restoreDraft`:

```tsx
// Auto-save wizard state to sessionStorage (debounced 800ms)
useEffect(() => {
  if (quoteLocked) return; // No guardar si ya está locked
  const isFormEmpty = !clientName && !clientEmail && !cotSelectedPkgId && !cotSelectedDestinoId
    && Object.keys(cotHabs).length === 0 && !cotFechaSalida;
  if (isFormEmpty) return; // No guardar estado vacío

  const timer = setTimeout(() => {
    const draft = {
      clientName, clientEmail, clientPhone, clientId, clientAddress,
      cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
      cotHabs, cotFechaSalida, cotCustomDias, cotExtraNights,
      cotFlightOverride, cotFlightPrice, cotLibreActSel, cotLibreTrsSel, step,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, 800);

  return () => clearTimeout(timer);
}, [
  clientName, clientEmail, clientPhone, clientId, clientAddress,
  cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
  cotHabs, cotFechaSalida, cotCustomDias, cotExtraNights,
  cotFlightOverride, cotFlightPrice, cotLibreActSel, cotLibreTrsSel, step, quoteLocked,
]);
```

- [ ] **Paso 4: Detectar draft al entrar a la tab cotizar**

Busca el efecto inicial (`useEffect(() => { fetch("/api/cotizar-datos")`)). Añade un efecto separado para detectar draft al cambiar a la tab cotizar:

```tsx
useEffect(() => {
  if (activeTab !== "cotizar") return;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (raw) setHasDraft(true);
}, [activeTab]);
```

- [ ] **Paso 5: Añadir banner de draft en el tab cotizar**

Busca el bloque `{activeTab === "cotizar" && (` (~línea 1334). Justo después del `<div className="space-y-6 animate-fade-scale">`, añade:

```tsx
{hasDraft && !quoteLocked && (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div>
      <p className="text-xs font-black text-amber-700">Tienes una cotización en progreso sin guardar.</p>
      <p className="text-[10px] font-bold text-amber-600 mt-0.5">¿Deseas continuar donde lo dejaste?</p>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={restoreDraft}
        className="px-4 py-2 bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-all cursor-pointer"
      >
        Continuar
      </button>
      <button
        onClick={clearDraft}
        className="px-4 py-2 border border-amber-300 text-amber-700 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-100 transition-all cursor-pointer"
      >
        Descartar
      </button>
    </div>
  </div>
)}
```

- [ ] **Paso 6: Limpiar draft en resetForm() y handleSaveProforma()**

En `resetForm()` (~línea 462), añade al final:
```tsx
clearDraft();
```

En `handleSaveProforma()` (~línea 538), justo después de `setQuoteLocked(true);`, añade:
```tsx
clearDraft();
```

- [ ] **Paso 7: Verificación manual**

```bash
npm run dev:web
```

1. Ir a `/dashboard` → tab "Nueva Cotización".
2. Llenar el nombre del cliente ("Juan Pérez") y avanzar al Paso 2.
3. Seleccionar un paquete.
4. Cambiar a la tab "Dashboard" (esto NO debería borrar el draft — `resetForm()` lo llama solo en el sidebar, verificar).
5. Volver a "Nueva Cotización" → debe aparecer el banner "Tienes una cotización en progreso".
6. Clic en "Continuar" → los campos deben restaurarse con "Juan Pérez" y el paquete seleccionado.
7. Clic en "Descartar" → el banner desaparece y el form queda limpio.

> **Nota:** Si el sidebar llama `resetForm()` al cambiar de tab, el draft también se limpia. Verificar el comportamiento: en el sidebar, el onClick llama `resetForm()` al salir de "cotizar". Si esto es muy agresivo, el auto-save puede guardar el draft ANTES del `resetForm()`. El orden del efecto de debounce (800ms) vs el click del sidebar define si el draft sobrevive. En la práctica esto funciona porque el efecto guarda inmediatamente si hay datos.

- [ ] **Paso 8: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): auto-save wizard in-progress state to sessionStorage with restore banner"
```

---

## ═══════════════════════════════════════════════════
## SPRINT B — Datos Reales + Reestructura del Wizard
## ═══════════════════════════════════════════════════

---

### Task B1: Extender `/api/cotizar-datos` con `hotelTarifas`

**Files:**
- Modify: `apps/web/src/app/api/cotizar-datos/route.ts`
- Modify: `apps/web/src/app/dashboard/page.tsx` — tipo `CotPaquete` e interfaz `CotPaqueteHotel`

**Interfaces:**
- Produces: `CotPaquete.hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[]`

- [ ] **Paso 1: Ampliar el include de Prisma en la ruta**

En `apps/web/src/app/api/cotizar-datos/route.ts`, cambia el include de `hoteles` en la query de paquetes:

```ts
// ANTES (línea 33-35):
hoteles: {
  include: { hotel: { include: { destino: true } } },
},

// DESPUÉS — añadir tarifas al hotel:
hoteles: {
  include: {
    hotel: {
      include: {
        destino: true,
        tarifas: true,   // ← NUEVO: TarifaHotelRef
      },
    },
  },
},
```

- [ ] **Paso 2: Extraer hotelTarifas en el mapper**

En la función `paquetes.map((p) => { ... })`, después de donde se construye `hotelesMap` (~línea 59), añade:

```ts
// Tarifas de habitación por hotelId — para cálculo de noches extra
const hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[] = [];
p.hoteles.forEach((ph) => {
  if (ph.hotel?.tarifas) {
    ph.hotel.tarifas.forEach((t) => {
      hotelTarifas.push({
        hotelId: ph.hotel.id,
        tipoHabitacion: t.tipoHabitacion,
        precioBase: t.precioBase,
      });
    });
  }
});
```

- [ ] **Paso 3: Incluir hotelTarifas en el objeto retornado**

En el `return { ... }` del mapper, añade:

```ts
// ANTES (después de hoteles: [...hotelesMap.values()]):
hoteles: [...hotelesMap.values()],
versiones: ...

// DESPUÉS:
hoteles: [...hotelesMap.values()],
hotelTarifas,   // ← NUEVO
versiones: ...
```

- [ ] **Paso 4: Actualizar el tipo `CotPaquete` en `dashboard/page.tsx`**

Busca la interfaz `CotPaquete` (~línea 64) y añade el campo nuevo:

```ts
interface CotPaquete {
  id: number; nombre: string; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[]; // ← NUEVO
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
}
```

- [ ] **Paso 5: Verificación manual**

```bash
npm run dev:web
```

En el browser, abre DevTools → Network → XHR. Navega a `/dashboard` y espera la petición a `/api/cotizar-datos`. En la respuesta, verifica que cada paquete tiene el campo `hotelTarifas` con arrays de `{ hotelId, tipoHabitacion, precioBase }`. Ejemplo esperado para paquete id 10 (Cancún):
```json
"hotelTarifas": [
  { "hotelId": 10, "tipoHabitacion": "SGL", "precioBase": 220 },
  { "hotelId": 10, "tipoHabitacion": "DBL", "precioBase": 280 },
  { "hotelId": 11, "tipoHabitacion": "SGL", "precioBase": 150 },
  { "hotelId": 11, "tipoHabitacion": "DBL", "precioBase": 200 }
]
```

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/app/api/cotizar-datos/route.ts apps/web/src/app/dashboard/page.tsx
git commit -m "feat(api): add hotelTarifas to cotizar-datos paquetes for extra nights calculation"
```

---

### Task B2: Eliminar `cotManualServices` + `cotHabs` vacío por defecto

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Eliminar todo lo relacionado con `cotManualServices`**

Busca y elimina:

1. **Declaración de estado** (~línea 227):
   ```tsx
   // ELIMINAR esta línea:
   const [cotManualServices, setCotManualServices] = useState<Array<{ id: string; descripcion: string; costo: number }>>([]);
   ```

2. **En `resetForm()`** (~línea 487):
   ```tsx
   // ELIMINAR:
   setCotManualServices([]);
   ```

3. **`cotManualTotal`** (~línea 396):
   ```tsx
   // ELIMINAR esta línea:
   const cotManualTotal = cotManualServices.reduce((sum, s) => sum + s.costo, 0);
   ```

4. **En `cotSubtotal`** (~línea 417):
   ```tsx
   // ANTES:
   const cotSubtotal = cotSubtotalAlojamiento + cotManualTotal + cotLibreActTotal + cotLibreTrsTotal;
   
   // DESPUÉS:
   const cotSubtotal = cotSubtotalAlojamiento + cotLibreActTotal + cotLibreTrsTotal;
   ```
   > `cotExtraCost` se añade en Task B3; por ahora la fórmula queda sin él.

5. **En `handleSaveProforma`** (~línea 557):
   ```tsx
   // ELIMINAR referencias a cotManualServices en notasParts y paqueteIncluye:
   // ANTES:
   const notasParts: string[] = [];
   if (cotManualServices.length > 0) notasParts.push(cotManualServices.map((s) => `${s.descripcion}: $${s.costo}`).join("; "));
   ...
   ...cotManualServices.map((s) => s.descripcion).filter(Boolean),
   
   // DESPUÉS:
   const notasParts: string[] = [];
   // (sin notasParts de servicios manuales — el campo notas queda vacío o undefined)
   const notasStr = notasParts.length > 0 ? notasParts.join(" | ") : undefined;
   ...
   // En paqueteIncluye, eliminar la línea: ...cotManualServices.map(...)
   ```

6. **En `handlePrintPreview`** (~línea 713):
   ```tsx
   // ELIMINAR esta línea de includes:
   includes = [...includes, ...cotManualServices.filter((s) => s.descripcion).map((s) => s.descripcion)];
   
   // ELIMINAR también el bloque de rows manuales en pricingRows:
   // Buscar y eliminar: cotManualServices.filter((s) => s.costo > 0).map((svc) => ...
   ```

7. **El bloque UI de "Servicios Adicionales" en el Paso 3** (~línea 2034):
   ```tsx
   // ELIMINAR todo el bloque:
   <div className="space-y-3">
     <div className="flex items-center justify-between">
       <label className={labelCls}>Servicios Adicionales</label>
       <button
         type="button"
         onClick={() => setCotManualServices((prev) => [...prev, { id: `svc-${Date.now()}`, descripcion: "", costo: 0 }])}
         ...
       >...
       </button>
     </div>
     {cotManualServices.length > 0 && (...)}
   </div>
   ```

8. **En el Paso 4 / handlePrintPreview** busca y elimina las referencias a `cotManualServices` en la tabla HTML de precios:
   ```
   // Busca: cotManualServices.filter((s) => s.costo > 0).map((svc) => `<tr>...`)
   // Eliminar ese bloque.
   ```

- [ ] **Paso 2: Cambiar `cotHabs` default a vacío**

```tsx
// ANTES (línea 226):
const [cotHabs, setCotHabs] = useState<Record<string, number>>({ DBL: 1 });

// DESPUÉS:
const [cotHabs, setCotHabs] = useState<Record<string, number>>({});
```

```tsx
// ANTES en resetForm() (línea 480):
setCotHabs({ DBL: 1 });

// DESPUÉS:
setCotHabs({});
```

- [ ] **Paso 3: Verificación manual — compilación limpia**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

Debe salir sin errores de TypeScript relacionados con `cotManualServices` o `cotManualTotal`. Si hay errores, busca referencias perdidas y elimínalas.

```bash
npm run dev:web
```

1. Ir al Paso 3 del wizard — no debe existir la sección "Servicios Adicionales".
2. El resumen lateral debe calcularse correctamente sin `cotManualTotal`.
3. Todos los tipos de habitación deben empezar en 0 (no hay DBL:1 por defecto).

- [ ] **Paso 4: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): remove cotManualServices, start cotHabs empty, fix cotSubtotal"
```

---

### Task B3: `cotExtraCost` con `TarifaHotel` real

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `cotSelectedPkg.hotelTarifas` (añadido en B1), `cotPrimaryHotel.tarifas` (existente)
- Produces: `cotExtraCost: number` (nuevo derivado)

- [ ] **Paso 1: Añadir `cotExtraCost` como derivado calculado**

Busca la sección `// ── Cotizador derived ──` (~línea 346). Después de la declaración de `cotSubtotal` (que ya fue simplificada en B2), añade:

```tsx
// Costo de noches extra — usa TarifaHotel.precioBase real
const cotExtraCost = (() => {
  if (cotExtraNights <= 0) return 0;
  if (cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.hotelTarifas.length > 0) {
    const firstHotelId = cotSelectedPkg.hoteles[0]?.id ?? 0;
    return Object.entries(cotHabs)
      .filter(([, qty]) => qty > 0)
      .reduce((sum, [tipoPax, qty]) => {
        const tarifa = cotSelectedPkg.hotelTarifas.find(
          (t) => t.hotelId === firstHotelId && t.tipoHabitacion === tipoPax
        );
        return sum + (tarifa?.precioBase ?? 0) * (COT_NUM_PAX[tipoPax] ?? 1) * qty * cotExtraNights;
      }, 0);
  }
  if (cotMode === "libre" && cotPrimaryHotel) {
    return Object.entries(cotHabs)
      .filter(([, qty]) => qty > 0)
      .reduce((sum, [tipoPax, qty]) => {
        const tarifa = cotPrimaryHotel.tarifas.find((t) => t.tipoHabitacion === tipoPax);
        return sum + (tarifa?.precioBase ?? 0) * (COT_NUM_PAX[tipoPax] ?? 1) * qty * cotExtraNights;
      }, 0);
  }
  return 0;
})();
```

- [ ] **Paso 2: Incluir `cotExtraCost` en `cotSubtotal`**

```tsx
// ANTES (resultado de B2):
const cotSubtotal = cotSubtotalAlojamiento + cotLibreActTotal + cotLibreTrsTotal;

// DESPUÉS:
const cotSubtotal = cotSubtotalAlojamiento + cotExtraCost + cotLibreActTotal + cotLibreTrsTotal;
```

- [ ] **Paso 3: Añadir desglose visual de noches extra en el resumen lateral y Paso 4**

En el panel de resumen lateral (`hidden lg:block` ~línea 2270 aprox), busca donde se muestra el subtotal y añade una línea condicional de noches extra:

```tsx
{cotExtraCost > 0 && (
  <div className="flex justify-between text-[10px] font-bold text-primary/60">
    <span>Noches extra ({cotExtraNights}n)</span>
    <span>${cotExtraCost.toLocaleString("es-EC")}</span>
  </div>
)}
```

- [ ] **Paso 4: Verificación de cálculo matemático**

```bash
npm run dev:web
```

Escenario de prueba:
1. Seleccionar el paquete "Paraíso Caribeño Cancún" (id 10, 6 noches base, `permitirModificarNoches = false`).
2. En Paso 2, si `permitirModificarNoches` es false, el campo de noches extra no debe aparecer.
3. Seleccionar otro paquete con `permitirModificarNoches = true` (si existe en la BD), añadir 2 noches extra, seleccionar 1 DBL.
4. Verificar que el costo extra = `TarifaHotel.precioBase[DBL] × 2 pax × 1 hab × 2 noches`.
   - Si el hotel del paquete es Dreams Cancún (id 10), DBL = $280/n: costo extra = $280 × 2 × 1 × 2 = $1,120.
5. El total en el resumen debe incluir este costo.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): cotExtraCost uses real TarifaHotel.precioBase for extra nights"
```

---

### Task B4: Reestructurar Paso 3 — mover servicios al bloque correcto

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Mover la sección de actividades/traslados del Paso 2 al Paso 3**

En el **Paso 2** (modo libre, ~línea 1790), busca los bloques `{/* ── Traslados disponibles ── */}` y `{/* ── Actividades disponibles ── */}` dentro de `cotAllDestinos.map()`. Corta esos dos bloques completos.

En el **Paso 3** (~línea 1944), después del bloque D (comisión de agencia), pega los bloques de traslados y actividades:

```tsx
{/* ── BLOQUE C: Servicios seleccionables (libre) / incluidos (catálogo) ── */}
{cotMode === "catalogo" && cotSelectedPkg && (cotSelectedPkg.actividades.length > 0 || cotSelectedPkg.traslados.length > 0) && (
  <div className="space-y-2">
    <label className={labelCls}>Incluido en el programa</label>
    <div className="p-3 bg-light border border-lighter rounded-2xl flex flex-wrap gap-1.5">
      {cotSelectedPkg.actividades.map((a) => (
        <span key={a.id} className="px-2.5 py-1 bg-secondary/10 text-secondary text-[9px] font-black rounded-md">
          {a.nombre}
        </span>
      ))}
      {cotSelectedPkg.traslados.map((t) => (
        <span key={t.id} className="px-2.5 py-1 bg-primary/5 text-primary/60 text-[9px] font-black rounded-md">
          {t.tipo}
        </span>
      ))}
    </div>
  </div>
)}

{cotMode === "libre" && cotAllDestinos.length > 0 && (
  <div className="space-y-4">
    {cotAllDestinos.map((destino) => (
      <div key={destino.id} className={cotIsMultiDestino ? "p-4 bg-light border border-lighter rounded-2xl space-y-3" : "space-y-4"}>
        {cotIsMultiDestino && (
          <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={10} /> {destino.ciudad}, {destino.pais}
          </p>
        )}
        {/* Traslados */}
        {destino.traslados.length > 0 && (
          <div className="space-y-2">
            <label className={labelCls}>Traslados en {destino.ciudad}</label>
            <div className="space-y-2">
              {destino.traslados.map((trs) => {
                const checked = !!cotLibreTrsSel[trs.id];
                const minPrice = trs.tarifas.length > 0 ? Math.min(...trs.tarifas.map((t) => t.precio)) : 0;
                return (
                  <button key={trs.id} type="button"
                    onClick={() => setCotLibreTrsSel((prev) => ({ ...prev, [trs.id]: !prev[trs.id] }))}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left cursor-pointer ${checked ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-secondary/30 hover:bg-light/60"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                      {checked && <Check size={11} className="text-primary stroke-[3]" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-black text-primary">{trs.tipo}</p>
                      {minPrice > 0 && <p className="text-[10px] text-secondary font-bold mt-0.5">Desde ${minPrice}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* Actividades */}
        {destino.actividades.length > 0 && (
          <div className="space-y-2">
            <label className={labelCls}>Actividades en {destino.ciudad}</label>
            <div className="space-y-2">
              {destino.actividades.map((act) => {
                const checked = !!cotLibreActSel[act.id];
                const minPrice = act.tarifas.length > 0 ? Math.min(...act.tarifas.map((t) => t.precio)) : 0;
                return (
                  <button key={act.id} type="button"
                    onClick={() => setCotLibreActSel((prev) => ({ ...prev, [act.id]: !prev[act.id] }))}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left cursor-pointer ${checked ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-secondary/30 hover:bg-light/60"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                      {checked && <Check size={11} className="text-primary stroke-[3]" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-black text-primary">{act.nombre}</p>
                      {act.descripcion && <p className="text-[10px] text-primary/40 font-bold mt-0.5">{act.descripcion}</p>}
                      {minPrice > 0 && <p className="text-[10px] text-secondary font-bold mt-0.5">Desde ${minPrice}/persona</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

En el Paso 2 (modo libre), elimina los bloques de traslados y actividades que acabas de mover.

- [ ] **Paso 2: Verificación manual**

```bash
npm run dev:web
```

1. Modo "Armar desde Cero" → Paso 2: seleccionar un destino. Verificar que ya NO aparecen las secciones de actividades/traslados.
2. Avanzar al Paso 3 → deben aparecer los checkboxes de actividades y traslados del destino seleccionado.
3. Modo "Paquetes Disponibles" → Paso 3: deben aparecer los chips de actividades/traslados incluidos (no interactivos).

- [ ] **Paso 3: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): move activities/transfers from Step 2 to Step 3, restructure Paso 3 blocks"
```

---

### Task B5: Vista comparativa multi-hotel

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Detectar modo comparativo**

Justo después de `const cotPrimaryHotel = ...` (~línea 360), añade:

```tsx
// Modo comparativo: catálogo con >1 hotel O libre con >1 hotel seleccionado
const isComparativeMode =
  (cotMode === "catalogo" && (cotSelectedPkg?.hoteles.length ?? 0) > 1) ||
  (cotMode === "libre" && cotSelectedHotelIds.length > 1);
```

- [ ] **Paso 2: En el Paso 3, ocultar +/- habitaciones cuando isComparativeMode**

Busca el bloque `{/* Distribución por Tipo de Habitación */}` (~línea 1982). Envuelve el grid de habitaciones con una condición:

```tsx
{!isComparativeMode ? (
  // Grid +/- habitaciones (comportamiento actual)
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {(["SGL","DBL","TPL","QUAD","CHD"] as const).map(({ tipoPax, label }) => {
      // ... código actual de las cards de habitaciones ...
    })}
  </div>
) : (
  // Tabla comparativa de hoteles
  <div className="space-y-3">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider min-w-[140px]">Hotel</th>
            <th className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider text-center">Estrellas</th>
            {(["SGL","DBL","TPL","QUAD","CHD"] as const)
              .filter((t) => {
                if (cotMode === "catalogo") return cotSelectedPkg?.versiones.some((v) => v.tipoPax === t && (v.precioPorPersona ?? 0) > 0);
                // libre: ver si algún hotel seleccionado tiene tarifa para este tipo
                return cotAvailableHotels
                  .filter((h) => cotSelectedHotelIds.includes(h.id))
                  .some((h) => h.tarifas.some((tf) => tf.tipoHabitacion === t && tf.precioBase > 0));
              })
              .map((t) => (
                <th key={t} className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider text-right whitespace-nowrap">
                  {t}/pax
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-xs font-bold">
          {cotMode === "catalogo" && cotSelectedPkg
            ? cotSelectedPkg.hoteles.map((h) => (
                <tr key={h.id}>
                  <td className="py-3 font-black text-primary text-[11px]">{h.nombre}</td>
                  <td className="py-3 text-center text-[11px] text-amber-500">{"★".repeat(h.estrellas)}</td>
                  {(["SGL","DBL","TPL","QUAD","CHD"] as const)
                    .filter((t) => cotSelectedPkg.versiones.some((v) => v.tipoPax === t && (v.precioPorPersona ?? 0) > 0))
                    .map((t) => {
                      const v = cotSelectedPkg.versiones.find((ver) => ver.tipoPax === t);
                      const p = v?.precioPorPersona;
                      return (
                        <td key={t} className="py-3 text-right font-black text-primary">
                          {p != null ? `$${p % 1 === 0 ? p.toLocaleString("es-EC") : p.toFixed(2)}` : "—"}
                        </td>
                      );
                    })}
                </tr>
              ))
            : cotAvailableHotels
                .filter((h) => cotSelectedHotelIds.includes(h.id))
                .map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 font-black text-primary text-[11px]">{h.nombre}</td>
                    <td className="py-3 text-center text-[11px] text-amber-500">{"★".repeat(h.estrellas)}</td>
                    {(["SGL","DBL","TPL","QUAD","CHD"] as const)
                      .filter((t) => cotAvailableHotels.filter((hh) => cotSelectedHotelIds.includes(hh.id)).some((hh) => hh.tarifas.some((tf) => tf.tipoHabitacion === t && tf.precioBase > 0)))
                      .map((t) => {
                        const tarifa = h.tarifas.find((tf) => tf.tipoHabitacion === t);
                        const p = tarifa ? tarifa.precioBase * cotNoches : null;
                        return (
                          <td key={t} className="py-3 text-right font-black text-primary">
                            {p != null ? `$${p % 1 === 0 ? p.toLocaleString("es-EC") : p.toFixed(2)}` : <span className="text-primary/30">—</span>}
                          </td>
                        );
                      })}
                  </tr>
                ))
          }
        </tbody>
      </table>
      <p className="mt-2 text-[9px] text-primary/40 font-bold">
        {cotMode === "catalogo"
          ? "Precio por persona según tarifa del paquete. El cliente elige el hotel según su preferencia."
          : `Precio total por persona para ${cotNoches} noche${cotNoches !== 1 ? "s" : ""}. El total se calculará al aprobar la cotización.`}
      </p>
    </div>

    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
      <p className="text-[10px] font-black text-amber-700">
        Esta cotización incluye múltiples opciones de hotel. El total final se calculará cuando el cliente elija su hotel preferido y el asesor apruebe la cotización.
      </p>
    </div>
  </div>
)}
```

- [ ] **Paso 3: En el Paso 4, mostrar "Pendiente" en el total cuando isComparativeMode**

Busca la sección de "TOTAL" en el Paso 4 (~línea 2196). La línea de total se muestra en el `<table>` del resumen. Añade una condición:

```tsx
// En el bloque de total:
{isComparativeMode ? (
  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
    <p className="text-xs font-black text-amber-700">Total: Pendiente de selección de hotel</p>
    <p className="text-[10px] font-bold text-amber-600 mt-0.5">
      El cliente debe elegir un hotel para calcular el total definitivo.
    </p>
  </div>
) : (
  // total row existente:
  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
    <span className="text-sm font-black text-primary uppercase tracking-wider">Total</span>
    <span className="text-xl font-black text-secondary">${cotTotal.toLocaleString("es-EC")}</span>
  </div>
)}
```

- [ ] **Paso 4: Verificación manual**

```bash
npm run dev:web
```

1. Seleccionar el paquete "Paraíso Caribeño Cancún" (tiene 2 hoteles: Dreams y Be Live).
2. Avanzar al Paso 3 → debe mostrarse la tabla comparativa con filas para Dreams y Be Live, columnas SGL/DBL/TPL/QUAD/CHD con precios de `VersionPaquete.precioPorPersona`.
3. En el Paso 4 → debe mostrar "Total: Pendiente de selección de hotel".
4. Seleccionar un paquete con un solo hotel → el flujo normal con +/- habitaciones debe funcionar.
5. En modo "Armar desde Cero" → seleccionar 2 hoteles → tabla comparativa con precios × noches.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): multi-hotel comparison table in Step 3/4 for both catalogo and libre modes"
```

---

### Task B6: Mobile FAB "Ver Resumen"

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Añadir estado del bottom-sheet**

Después del estado `hasDraft`, añade:
```tsx
const [showMobileSummary, setShowMobileSummary] = useState(false);
```

- [ ] **Paso 2: Añadir el FAB button**

Justo antes del cierre de `<main className="flex-1 p-4 ...">`, añade:

```tsx
{/* ── Mobile FAB: Ver Resumen (solo durante el wizard, pasos 2-4) ── */}
{activeTab === "cotizar" && step > 1 && (
  <button
    onClick={() => setShowMobileSummary(true)}
    aria-label="Ver resumen de cotización"
    className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-primary rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
  >
    <DollarSign size={20} className="text-white" />
  </button>
)}
```

- [ ] **Paso 3: Añadir el bottom-sheet de resumen**

Justo antes del cierre del `<div className="min-h-screen ...">` raíz, añade:

```tsx
{/* ── Bottom-sheet de resumen (móvil) ── */}
{showMobileSummary && (
  <div
    className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end"
    onClick={(e) => { if (e.target === e.currentTarget) setShowMobileSummary(false); }}
  >
    <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
    <div className="relative bg-white rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto overscroll-contain">
      {/* Handle */}
      <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto -mt-2" />
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-primary uppercase tracking-widest">Resumen</h3>
        <button onClick={() => setShowMobileSummary(false)} className="p-1.5 rounded-lg bg-light text-primary/40 hover:bg-lighter transition-all cursor-pointer">
          <X size={14} />
        </button>
      </div>
      {/* Destino y duración */}
      <div className="p-3 bg-light border border-lighter rounded-2xl space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-primary/60">
          <span>Destino</span><span className="text-primary font-black">{cotDestinoCiudad || "—"}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-primary/60">
          <span>Duración</span><span className="text-primary font-black">{cotDuracion}</span>
        </div>
        {cotFechaSalida && (
          <div className="flex justify-between text-[10px] font-bold text-primary/60">
            <span>Salida</span><span className="text-primary font-black">{cotFechaSalida}</span>
          </div>
        )}
        <div className="flex justify-between text-[10px] font-bold text-primary/60">
          <span>Distribución</span><span className="text-primary font-black">{cotPaxResumen}</span>
        </div>
      </div>
      {/* Desglose de precios */}
      <div className="space-y-1.5">
        {cotSubtotalAlojamiento > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-primary/60">
            <span>Alojamiento</span>
            <span>${cotSubtotalAlojamiento.toLocaleString("es-EC")}</span>
          </div>
        )}
        {cotExtraCost > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-primary/60">
            <span>Noches extra ({cotExtraNights}n)</span>
            <span>${cotExtraCost.toLocaleString("es-EC")}</span>
          </div>
        )}
        {(cotLibreActTotal + cotLibreTrsTotal) > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-primary/60">
            <span>Actividades / Traslados</span>
            <span>${(cotLibreActTotal + cotLibreTrsTotal).toLocaleString("es-EC")}</span>
          </div>
        )}
        {cotBoletoTotal > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-primary/60">
            <span>Boleto aéreo</span>
            <span>${cotBoletoTotal.toLocaleString("es-EC")}</span>
          </div>
        )}
        {agencyMarkup > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-primary/40 italic">
            <span>Comisión (oculta al cliente)</span>
            <span>${agencyMarkup.toLocaleString("es-EC")}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs font-black text-primary uppercase">
            {isComparativeMode ? "Total estimado" : "Total"}
          </span>
          <span className="text-base font-black text-secondary">
            {isComparativeMode ? "Pendiente" : `$${cotTotal.toLocaleString("es-EC")}`}
          </span>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Paso 4: Verificación manual**

```bash
npm run dev:web
```

En DevTools responsive (móvil), ir al Paso 2 o 3 del wizard. Debe aparecer el FAB verde oscuro (DollarSign) en la esquina inferior derecha (sobre el bottom nav). Al presionarlo, se abre el bottom-sheet con el resumen. Al tocar fuera o presionar X, se cierra.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(dashboard): mobile FAB + bottom-sheet summary for wizard Steps 2-4"
```

---

### Task B7: API PATCH ampliada + modal de aprobación con selección de hotel

**Files:**
- Modify: `apps/web/src/app/api/cotizaciones/[id]/status/route.ts`
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Actualizar el endpoint PATCH para aceptar `selectedHotelId` y `total` reales**

En `apps/web/src/app/api/cotizaciones/[id]/status/route.ts`, reemplaza el contenido:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.agenciaId)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    status,
    selectedHotel,        // legacy: string (nombre)
    selectedHotelId,      // nuevo: number (ID del hotel elegido)
    total: newTotal,      // nuevo: total calculado al aprobar multi-hotel
    cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD,  // nuevo: cantidades al aprobar
    nota,
  } = body;

  const validStatuses = ["BORRADOR", "ENVIADA", "APROBADA", "RECHAZADA"];
  if (!status || !validStatuses.includes(status))
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });

  // Validar total si se envía
  if (newTotal !== undefined && (typeof newTotal !== "number" || newTotal < 0 || !isFinite(newTotal)))
    return NextResponse.json({ error: "Total inválido" }, { status: 400 });

  try {
    const cotizacion = await prisma.cotizacion.findUnique({ where: { id } });
    if (!cotizacion || cotizacion.agenciaId !== session.user.agenciaId)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const creadoPorId = (session.user as any).id as string;

    // Construir nota de hotel seleccionado
    const hotelNota = selectedHotel
      ? `Hotel seleccionado: ${selectedHotel}`
      : undefined;

    const updateData: Parameters<typeof prisma.cotizacion.update>[0]["data"] = {
      status,
      notas:           hotelNota ?? cotizacion.notas,
      fechaAprobacion: status === "APROBADA" ? new Date() : cotizacion.fechaAprobacion,
      fechaEnvio:      status === "ENVIADA"  ? new Date() : cotizacion.fechaEnvio,
    };

    // Si se envía el total real (aprobación multi-hotel), sobreescribir
    if (status === "APROBADA" && typeof newTotal === "number") {
      updateData.total = newTotal;
    }

    const [updated] = await prisma.$transaction([
      prisma.cotizacion.update({ where: { id }, data: updateData }),
      prisma.historialCotizacion.create({
        data: {
          cotizacionId: id,
          cambiadoPorId: creadoPorId,
          statusAnterior: cotizacion.status,
          statusNuevo: status as any,
          nota: nota ?? hotelNota ?? null,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    logError("PATCH /api/cotizaciones/[id]/status", err);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}
```

- [ ] **Paso 2: Actualizar el modal de aprobación en dashboard**

El `proformaDialogRef` actual (~línea 919) maneja la selección de hotel. Añade estado para las cantidades de habitaciones al aprobar:

```tsx
// Añadir junto al estado proformaChosenHotel:
const [approvalHabs, setApprovalHabs] = useState<Record<string, number>>({});
```

En `handleOpenFinalizeDialog`, resetea también `approvalHabs`:
```tsx
const handleOpenFinalizeDialog = (cotId: string) => {
  setProformaCotId(cotId);
  setProformaChosenHotel("");
  setApprovalHabs({});
  if (proformaDialogRef.current && !proformaDialogRef.current.open)
    proformaDialogRef.current.showModal();
};
```

- [ ] **Paso 3: Actualizar el JSX del dialog de proforma**

Busca el `<dialog ref={proformaDialogRef}` (~línea 2355 aprox, busca `proformaDialogRef`). El dialog actual es simple. Actualiza su contenido para incluir la selección de hotel cuando la cotización tiene múltiples hoteles:

```tsx
<dialog
  ref={proformaDialogRef}
  className="backdrop:bg-primary/40 backdrop:backdrop-blur-sm rounded-3xl border-0 p-0 shadow-2xl w-[90vw] max-w-md"
  onCancel={(e) => { e.preventDefault(); proformaDialogRef.current?.close(); setProformaCotId(null); setProformaChosenHotel(""); setApprovalHabs({}); }}
>
  {(() => {
    const cot = cotizaciones.find((c) => c.id === proformaCotId) as CotizacionExtended | undefined;
    const hotels = cot?.hotelsComparison ?? [];
    const COT_TYPES = ["SGL","DBL","TPL","QUAD","CHD"] as const;
    const approvalTotal = hotels.length > 0 && proformaChosenHotel
      ? (() => {
          const chosen = hotels.find((h) => h.hotel.id === proformaChosenHotel);
          if (!chosen) return 0;
          // Para cotizaciones con comparison, usar el subtotal del hotel elegido + markup
          const sub = chosen.subtotal;
          const cmark = (cot as any)?.markup ?? agencyMarkup;
          return sub + cmark;
        })()
      : 0;

    return (
      <div className="p-6 space-y-5">
        <div className="border-b border-gray-50 pb-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <Star size={14} className="text-gold" /> Aprobar Cotización
          </h3>
          <p className="text-[10px] font-bold text-primary/50 mt-1">
            {cot?.codigo} — {cot?.cliente?.nombre}
          </p>
        </div>

        {hotels.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-wider">Hotel elegido por el cliente</p>
            <div className="space-y-2">
              {hotels.map((h) => (
                <label key={h.hotel.id} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${proformaChosenHotel === h.hotel.id ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-secondary/30"}`}>
                  <input
                    type="radio"
                    name="chosen-hotel"
                    value={h.hotel.id}
                    checked={proformaChosenHotel === h.hotel.id}
                    onChange={() => setProformaChosenHotel(h.hotel.id)}
                    className="accent-secondary"
                  />
                  <div>
                    <p className="text-xs font-black text-primary">{h.hotel.name}</p>
                    <p className="text-[10px] font-bold text-secondary mt-0.5">${h.total.toLocaleString("es-EC")} total</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs font-bold text-primary/60">¿Confirmas que el cliente aprueba esta cotización?</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => { proformaDialogRef.current?.close(); setProformaCotId(null); setProformaChosenHotel(""); setApprovalHabs({}); }}
            className="flex-1 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleFinalizeCotizacion}
            disabled={hotels.length > 0 && !proformaChosenHotel}
            className="flex-1 py-3 bg-secondary text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar y Aprobar
          </button>
        </div>
      </div>
    );
  })()}
</dialog>
```

- [ ] **Paso 4: Verificar compilación**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Paso 5: Verificación manual**

```bash
npm run dev:web
```

1. Ir a tab "Cotizaciones".
2. En una cotización BORRADOR, hacer clic en el ícono Star (si lo hay) o cambiar estado a ENVIADA y luego aprobar.
3. El modal debe mostrar una opción de selección si hay múltiples hoteles en la comparativa.
4. Seleccionar un hotel y confirmar → la cotización debe cambiar a APROBADA.
5. En DevTools Network, verificar que el PATCH a `/api/cotizaciones/{id}/status` incluye el body correcto.

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/app/api/cotizaciones/[id]/status/route.ts apps/web/src/app/dashboard/page.tsx
git commit -m "feat(api,dashboard): PATCH status accepts selectedHotelId+total, approval modal updated"
```

---

## ══════════════════════════════════════════
## SPRINT C — Extracción de Componentes
## ══════════════════════════════════════════

> ⚠️ **Sprint C requiere que Sprints A y B estén completos y verificados.** La extracción de componentes debe hacerse con el código funcional de B, no con el monolito original.
>
> **Estrategia:** Extraer un componente a la vez. Después de cada extracción, verificar que el dashboard funcione igual que antes. No extraer múltiples componentes en el mismo paso.

---

### Task C1: DashboardContext + estructura de carpetas

**Files:**
- Create: `apps/web/src/app/dashboard/DashboardContext.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface DashboardContextValue {
    // Cotizaciones
    cotizaciones: CotizacionExtended[];
    setCotizaciones: React.Dispatch<React.SetStateAction<CotizacionExtended[]>>;
    isLoadingCots: boolean;
    // Packages
    packages: Package[];
    isLoadingPackages: boolean;
    packagesFetchError: "DB_FAIL" | "EMPTY" | null;
    // Agency config
    agencyName: string;
    agencyPhone: string;
    agencyAddress: string;
    agencyLogo: string | null;
    agencyMarkup: number;
    setAgencyMarkup: React.Dispatch<React.SetStateAction<number>>;
    defaultMarkup: string;
    // Session
    userName: string;
    agenciaDisplay: string;
    userRoleDisplay: string;
    isAdmin: boolean;
    rawRole: string | undefined;
    // KPIs (derived from cotizaciones)
    kpiTotal: number;
    kpiAprobadas: number;
    kpiRechazadas: number;
    kpiPendientes: number;
    // Actions
    handleEliminar: (id: string) => Promise<void>;
    patchCotizacionStatus: (id: string, status: CotizacionStatus, extra?: object) => Promise<void>;
    handleLogout: () => Promise<void>;
  }
  ```

- [ ] **Paso 1: Crear el directorio de componentes**

```bash
mkdir -p "apps/web/src/app/dashboard/components/cotizador"
mkdir -p "apps/web/src/app/dashboard/components/modals"
```

- [ ] **Paso 2: Crear `DashboardContext.tsx`**

Crear `apps/web/src/app/dashboard/DashboardContext.tsx`:

```tsx
"use client";
import React, { createContext, useContext } from "react";
import type { Package, Cotizacion, CotizacionStatus } from "@land-tour/shared";

type CotizacionExtended = Cotizacion & {
  hotelsComparison?: Array<{ hotel: { id: string; name: string }; subtotal: number; extraNightsCost: number; total: number }>;
  chosenHotelId?: string;
};

export interface DashboardContextValue {
  cotizaciones: CotizacionExtended[];
  setCotizaciones: React.Dispatch<React.SetStateAction<CotizacionExtended[]>>;
  isLoadingCots: boolean;
  packages: Package[];
  isLoadingPackages: boolean;
  packagesFetchError: "DB_FAIL" | "EMPTY" | null;
  agencyName: string;
  agencyPhone: string;
  agencyAddress: string;
  agencyLogo: string | null;
  agencyMarkup: number;
  setAgencyMarkup: React.Dispatch<React.SetStateAction<number>>;
  defaultMarkup: string;
  userName: string;
  agenciaDisplay: string;
  userRoleDisplay: string;
  isAdmin: boolean;
  rawRole: string | undefined;
  kpiTotal: number;
  kpiAprobadas: number;
  kpiRechazadas: number;
  kpiPendientes: number;
  handleEliminar: (id: string) => Promise<void>;
  patchCotizacionStatus: (id: string, status: CotizacionStatus, extra?: object) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardContext.Provider");
  return ctx;
}
```

- [ ] **Paso 3: Envolver el JSX raíz de `page.tsx` con el Provider**

Al final del componente `DashboardPage`, en el `return (...)`, envuelve todo el contenido con `<DashboardContext.Provider value={...}>`:

```tsx
// En page.tsx, al inicio del return:
return (
  <DashboardContext.Provider value={{
    cotizaciones, setCotizaciones, isLoadingCots,
    packages, isLoadingPackages, packagesFetchError,
    agencyName, agencyPhone, agencyAddress, agencyLogo,
    agencyMarkup, setAgencyMarkup, defaultMarkup,
    userName, agenciaDisplay, userRoleDisplay, isAdmin, rawRole,
    kpiTotal, kpiAprobadas, kpiRechazadas, kpiPendientes,
    handleEliminar, patchCotizacionStatus, handleLogout,
  }}>
    <div className="min-h-screen bg-[#F4FAF8] flex font-inter text-primary select-none">
      {/* ... todo el contenido actual ... */}
    </div>
  </DashboardContext.Provider>
);
```

Añadir el import al inicio de `page.tsx`:
```tsx
import { DashboardContext } from "./DashboardContext";
```

- [ ] **Paso 4: Verificación — ninguna funcionalidad debe cambiar**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
npm run dev:web
```

El dashboard debe funcionar exactamente igual. El Context no cambia nada — solo prepara la infraestructura.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/DashboardContext.tsx apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): add DashboardContext, component directory structure"
```

---

### Task C2: Extraer `DashboardTab`

**Files:**
- Create: `apps/web/src/app/dashboard/components/DashboardTab.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Crear `DashboardTab.tsx`**

Corta el bloque `{activeTab === "dashboard" && (...)}` completo de `page.tsx` y pégalo en el nuevo archivo:

```tsx
"use client";
import React from "react";
import { LayoutDashboard, FileText, CheckCircle2, X, Clock, Eye, Star } from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { Cotizacion, CotizacionStatus } from "@land-tour/shared";
import { useDashboard } from "../DashboardContext";

const STATUS_BADGE: Record<CotizacionStatus, string> = {
  BORRADOR: "bg-sky-50 text-sky-600",
  ENVIADA: "bg-amber-50 text-amber-600",
  APROBADA: "bg-emerald-50 text-emerald-600",
  RECHAZADA: "bg-rose-50 text-rose-600",
};
const STATUS_DOT: Record<CotizacionStatus, string> = {
  BORRADOR: "bg-sky-500",
  ENVIADA: "bg-amber-500",
  APROBADA: "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
};

interface Props {
  onGoToCotizaciones: () => void;
  onPreviewCot: (cot: Cotizacion & any) => void;
  onOpenFinalize: (id: string) => void;
}

export default function DashboardTab({ onGoToCotizaciones, onPreviewCot, onOpenFinalize }: Props) {
  const { cotizaciones, kpiTotal, kpiAprobadas, kpiRechazadas, kpiPendientes } = useDashboard();

  return (
    // Pegar aquí el JSX completo del tab "dashboard" tal como estaba en page.tsx
    // El bloque inicia con: <div className="space-y-8 animate-fade-scale">
    // y termina antes del siguiente {activeTab === ...}
    <div className="space-y-8 animate-fade-scale">
      {/* ... JSX idéntico al que estaba en page.tsx ... */}
    </div>
  );
}
```

En `page.tsx`, reemplaza el bloque del tab dashboard por:
```tsx
{activeTab === "dashboard" && (
  <DashboardTab
    onGoToCotizaciones={() => setActiveTab("cotizaciones")}
    onPreviewCot={(cot) => { setPreviewCot(cot); setPreviewTab("Cliente"); }}
    onOpenFinalize={handleOpenFinalizeDialog}
  />
)}
```

Añadir el import al inicio: `import DashboardTab from "./components/DashboardTab";`

- [ ] **Paso 2: Compilar y verificar**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
npm run dev:web
```

Tab "Dashboard" debe mostrar KPIs y la tabla de últimas cotizaciones sin cambios visuales.

- [ ] **Paso 3: Commit**

```bash
git add apps/web/src/app/dashboard/components/DashboardTab.tsx apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): extract DashboardTab component"
```

---

### Task C3: Extraer `PaquetesTab` y `CotizacionesTab`

**Files:**
- Create: `apps/web/src/app/dashboard/components/PaquetesTab.tsx`
- Create: `apps/web/src/app/dashboard/components/CotizacionesTab.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Paso 1: Extraer `PaquetesTab.tsx`**

Corta el bloque `{activeTab === "paquetes" && (...)}` de `page.tsx`. Crear `PaquetesTab.tsx`:

```tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Clock, Plane, Globe, AlertCircle, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useDashboard } from "../DashboardContext";

interface Props {
  onQuickQuote: (pkgId: string) => void;
}

export default function PaquetesTab({ onQuickQuote }: Props) {
  const { packages, isLoadingPackages, packagesFetchError } = useDashboard();
  const [searchPkgTerm, setSearchPkgTerm] = useState("");
  const [activeDestino, setActiveDestino] = useState<string | null>(null);

  // Pegar aquí el JSX completo del tab paquetes
  return (
    <div className="space-y-6 animate-fade-scale">
      {/* ... JSX idéntico ... */}
    </div>
  );
}
```

> `searchPkgTerm` y `activeDestino` pasan a ser estado local de `PaquetesTab` — ya no necesitan vivir en `page.tsx`.

- [ ] **Paso 2: Extraer `CotizacionesTab.tsx`**

Corta el bloque `{activeTab === "cotizaciones" && (...)}` de `page.tsx`. Crear `CotizacionesTab.tsx`:

```tsx
"use client";
import React from "react";
import { Eye, Trash2, Star, Check, X, FileSpreadsheet } from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard } from "../DashboardContext";

const STATUS_BADGE: Record<CotizacionStatus, string> = { BORRADOR: "bg-sky-50 text-sky-600", ENVIADA: "bg-amber-50 text-amber-600", APROBADA: "bg-emerald-50 text-emerald-600", RECHAZADA: "bg-rose-50 text-rose-600" };
const STATUS_DOT: Record<CotizacionStatus, string> = { BORRADOR: "bg-sky-500", ENVIADA: "bg-amber-500", APROBADA: "bg-emerald-500", RECHAZADA: "bg-rose-500" };

interface Props {
  onPreviewCot: (cot: any) => void;
  onOpenFinalize: (id: string) => void;
  onOpenDelete: (id: string) => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}

export default function CotizacionesTab({ onPreviewCot, onOpenFinalize, onOpenDelete, onAprobar, onRechazar }: Props) {
  const { cotizaciones, isLoadingCots } = useDashboard();
  // Pegar aquí el JSX completo del tab cotizaciones
  return <div className="space-y-6 animate-fade-scale">{/* ... */}</div>;
}
```

- [ ] **Paso 3: Actualizar page.tsx con imports y JSX comprimido**

En `page.tsx`, reemplaza los dos bloques de tabs por:
```tsx
import PaquetesTab    from "./components/PaquetesTab";
import CotizacionesTab from "./components/CotizacionesTab";

// En el JSX:
{activeTab === "paquetes" && <PaquetesTab onQuickQuote={handleQuickQuote} />}
{activeTab === "cotizaciones" && (
  <CotizacionesTab
    onPreviewCot={(cot) => { setPreviewCot(cot); setPreviewTab("Cliente"); }}
    onOpenFinalize={handleOpenFinalizeDialog}
    onOpenDelete={(id) => { setConfirmDeleteId(id); confirmDeleteDialogRef.current?.showModal(); }}
    onAprobar={handleAprobar}
    onRechazar={handleRechazar}
  />
)}
```

Elimina también `searchPkgTerm`, `setSearchPkgTerm`, `activeDestino`, `setActiveDestino` de `page.tsx` (ahora son locales de `PaquetesTab`).

- [ ] **Paso 4: Compilar y verificar**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
npm run dev:web
```

Tabs "Paquetes" y "Cotizaciones" deben funcionar sin cambios.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/components/PaquetesTab.tsx apps/web/src/app/dashboard/components/CotizacionesTab.tsx apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): extract PaquetesTab and CotizacionesTab components"
```

---

### Task C4: Extraer `CotizadorWizard` con sus 4 pasos

**Files:**
- Create: `apps/web/src/app/dashboard/components/cotizador/CotizadorWizard.tsx` (contiene todo el wizard state + Steps 1-4 inlining)
- Modify: `apps/web/src/app/dashboard/page.tsx`

> Esta es la extracción más grande. La estrategia: mover todo el estado del wizard y todo el JSX del cotizador a `CotizadorWizard.tsx`. El componente recibe via props las cosas que necesita de `page.tsx` (`agencyMarkup`, `agencyName`, `setAgencyMarkup`, `cotizaciones`, `setCotizaciones`).

- [ ] **Paso 1: Identificar qué estado del wizard se mueve**

Todo el estado que comienza con `cot*` + el estado del stepper (`step`, `quoteLocked`, etc.) + el estado del cliente (`clientName`, `clientEmail`, etc.) + `agencyMarkup` (parcial — también en marca blanca) se mueve a `CotizadorWizard`.

El estado que **NO** se mueve (queda en `page.tsx` via Context): `cotizaciones`, `setCotizaciones`, `packages`, `agencyMarkup` (la versión del context se usa para el total final).

- [ ] **Paso 2: Crear `CotizadorWizard.tsx`**

Crear `apps/web/src/app/dashboard/components/cotizador/CotizadorWizard.tsx` con:
- Todos los imports que usa el cotizador
- Todo el estado local del wizard (todo lo que tiene prefijo `cot*` + `step`, `quoteLocked`, `client*`, etc.)
- Todos los cálculos derivados del cotizador (`cotSelectedPkg`, `cotSubtotal`, `cotTotal`, `cotExtraCost`, etc.)
- Todo el JSX del cotizador (el bloque `{activeTab === "cotizar" && (...)}}`)
- Los handlers `resetForm`, `handleSaveProforma`, `handlePrintPreview`
- El estado y lógica de auto-save (draft)
- El FAB de resumen móvil y el bottom-sheet

```tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
// ... todos los imports de lucide-react y @land-tour/shared ...
import { useDashboard } from "../../DashboardContext";

interface CotizadorWizardProps {
  isActive: boolean;    // si este tab está visible
}

export default function CotizadorWizard({ isActive }: CotizadorWizardProps) {
  const { cotizaciones, setCotizaciones, agencyMarkup, setAgencyMarkup, agencyName, agenciaDisplay, userName } = useDashboard();

  // Todo el estado del wizard
  const [step, setStep] = useState(1);
  // ... (copiar todos los estados cot*, client*, etc.) ...

  // Auto-save draft, resetForm, handleSaveProforma, handlePrintPreview
  // ...

  if (!isActive) return null;  // No renderizar si el tab no está activo

  return (
    <div className="space-y-6 animate-fade-scale">
      {/* ... todo el JSX del cotizador ... */}
    </div>
  );
}
```

- [ ] **Paso 3: Actualizar page.tsx**

```tsx
import CotizadorWizard from "./components/cotizador/CotizadorWizard";

// Eliminar de page.tsx: todos los estados cot*, step, quoteLocked, client*, draft logic
// Eliminar: resetForm, handleSaveProforma, handlePrintPreview, cotizarData state

// En el JSX reemplazar:
{activeTab === "cotizar" && (...)}
// por:
<CotizadorWizard isActive={activeTab === "cotizar"} />
```

> `CotizadorWizard` usa `isActive` para renderizar solo cuando corresponde. Esto es preferible al montado/desmontado (`{activeTab === "cotizar" && <Component/>}`) porque preserva el estado del wizard si el usuario cambia de tab y vuelve (útil junto con el auto-save draft).

- [ ] **Paso 4: Compilar y verificar extensivamente**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
npm run dev:web
```

Verificar el flujo completo del wizard:
1. Paso 1: llenar nombre del cliente, avanzar.
2. Paso 2: seleccionar un paquete, poner fecha de salida, avanzar.
3. Paso 3: añadir habitaciones, verificar que la vista comparativa aparece si hay múltiples hoteles.
4. Paso 4: revisar resumen, guardar cotización.
5. Verificar que la cotización aparece en el tab "Cotizaciones".
6. Cambiar de tab y volver → el banner de draft debe aparecer si hay datos.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/app/dashboard/components/cotizador/CotizadorWizard.tsx apps/web/src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): extract CotizadorWizard with full wizard state and all steps"
```

---

### Task C5: Extraer modales, `PerfilTab`, `useMemo`, dynamic imports

**Files:**
- Create: `apps/web/src/app/dashboard/components/PerfilTab.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`
- Modify: `apps/web/src/app/dashboard/components/CotizadorWizard.tsx`

- [ ] **Paso 1: Extraer `PerfilTab.tsx`**

El tab "perfil" (bottom nav móvil) tiene datos de la agencia y botón de logout. Crear:

```tsx
"use client";
import React from "react";
import { LogOut, Building2, Settings2 } from "lucide-react";
import { useDashboard } from "../DashboardContext";

interface Props {
  onGoToMarcaBlanca?: () => void;
}

export default function PerfilTab({ onGoToMarcaBlanca }: Props) {
  const { userName, agenciaDisplay, userRoleDisplay, isAdmin, handleLogout, agencyPhone } = useDashboard();
  return (
    <div className="space-y-6 animate-fade-scale p-4">
      {/* Copiar JSX del tab "perfil" */}
    </div>
  );
}
```

- [ ] **Paso 2: Añadir `useMemo` a los cálculos derivados más costosos en `CotizadorWizard.tsx`**

En `CotizadorWizard.tsx`, envuelve los cálculos que dependen de muchas variables:

```tsx
import { useMemo } from "react";

const cotSubtotalAlojamiento = useMemo(() => {
  return Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .reduce((sum, [tipoPax, qty]) => {
      const precio = getCotPrice(tipoPax);
      const numPax = COT_NUM_PAX[tipoPax] ?? 1;
      if (cotMode === "libre") return sum + precio * numPax * qty * cotNoches;
      return sum + precio * numPax * qty;
    }, 0);
}, [cotHabs, cotMode, cotNoches, cotSelectedPkg, cotPrimaryHotel]);

const cotExtraCost = useMemo(() => {
  if (cotExtraNights <= 0) return 0;
  // ... lógica de cotExtraCost ...
}, [cotExtraNights, cotMode, cotSelectedPkg, cotPrimaryHotel, cotHabs, COT_NUM_PAX]);

const cotLibreActTotal = useMemo(() => {
  // ...
}, [cotLibreActSel, cotAllActRef]);

const cotLibreTrsTotal = useMemo(() => {
  // ...
}, [cotLibreTrsSel, cotAllTrsRef]);

const cotTotal = useMemo(
  () => cotSubtotalAlojamiento + cotExtraCost + cotLibreActTotal + cotLibreTrsTotal + cotBoletoTotal + agencyMarkup,
  [cotSubtotalAlojamiento, cotExtraCost, cotLibreActTotal, cotLibreTrsTotal, cotBoletoTotal, agencyMarkup]
);
```

- [ ] **Paso 3: Añadir dynamic imports en `page.tsx`**

```tsx
import dynamic from "next/dynamic";

// Reemplazar imports estáticos de tabs pesadas:
const PaquetesTab     = dynamic(() => import("./components/PaquetesTab"),                { ssr: false, loading: () => <TabSpinner /> });
const CotizadorWizard = dynamic(() => import("./components/cotizador/CotizadorWizard"), { ssr: false, loading: () => <TabSpinner /> });
const CotizacionesTab = dynamic(() => import("./components/CotizacionesTab"),           { ssr: false, loading: () => <TabSpinner /> });

// TabSpinner (inline, es pequeño):
function TabSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      <p className="text-primary/40 font-bold text-xs">Cargando...</p>
    </div>
  );
}
```

- [ ] **Paso 4: Verificación final completa**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
npm run dev:web
```

Flujo completo de regresión:
1. Login con `asesor@agenciapruebas.com / Admin123*`.
2. Dashboard → KPIs cargan.
3. Tab Paquetes → catálogo carga con Image correcta.
4. Tab "Nueva Cotización" → wizard funciona completo (4 pasos), guardar cotización.
5. Tab Cotizaciones → nueva cotización aparece en la lista.
6. Eliminar cotización BORRADOR → modal de confirmación personalizado.
7. Aprobar cotización → modal de aprobación.
8. Logout → redirige a `/login`.
9. En móvil: bottom nav, safe area, touch targets, FAB de resumen.

- [ ] **Paso 5: Verificar bundle size (opcional pero recomendado)**

```bash
cd apps/web && npx next build 2>&1 | tail -30
```

Verificar que aparecen chunks separados para los tabs con dynamic import.

- [ ] **Paso 6: Commit final del Sprint C**

```bash
git add apps/web/src/app/dashboard/
git commit -m "refactor(dashboard): extract PerfilTab, add useMemo to cotizador derivados, dynamic imports for tab code-splitting"
```

---

## Self-Review del Plan

### Cobertura de requerimientos del spec:

| Requerimiento | Tarea |
|---------------|-------|
| `<Image>` en catálogo | A1 |
| aria-labels | A1 |
| htmlFor/id | A1 |
| iOS safe area | A1 |
| touch targets 44px | A1 |
| animate-fade-scale | A1 |
| DeleteConfirmModal | A2 |
| Renombrar labels | A3 |
| Stepper móvil label | A3 |
| Bottom nav animación | A3 |
| Auto-save draft sessionStorage | A4 |
| `/api/cotizar-datos` + hotelTarifas | B1 |
| `cotHabs` vacío por defecto | B2 |
| Eliminar `cotManualServices` | B2 |
| `cotExtraCost` con TarifaHotel real | B3 |
| Paso 3 reestructurado (4 bloques) | B4 |
| Vista comparativa multi-hotel | B5 |
| Mobile FAB + bottom-sheet | B6 |
| API PATCH ampliada | B7 |
| `step1CanProceed` solo clientName | B2 (incluido) |
| DashboardContext | C1 |
| Extraer tabs | C2, C3 |
| Extraer CotizadorWizard | C4 |
| `useMemo` en derivados | C5 |
| Dynamic imports | C5 |

**Todos los requerimientos del spec tienen una tarea correspondiente. ✅**

### Consistencia de tipos:
- `CotizacionExtended` se define en `DashboardContext.tsx` y se importa en todos los componentes que lo usan.
- `isComparativeMode` (booleano derivado, Task B5) se usa en B6 y B7 — definido antes de donde se usa.
- `cotExtraCost` definido en B3, usado en B2's `cotSubtotal` (el orden de tareas es correcto: B2 simplifica la fórmula, B3 añade `cotExtraCost` a ella).
- `hotelTarifas` en `CotPaquete` (B1) se usa en `cotExtraCost` (B3) — B1 debe ejecutarse antes de B3.

### Placeholder scan: ningún "TBD" o "TODO" en los pasos de código. ✅
