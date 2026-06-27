# Dashboard B2B — Rediseño y Reestructuración

**Fecha:** 2026-06-27  
**Autor:** Miguel Ticaray (diseño) + Claude Sonnet 4.6 (especificación)  
**Repositorio:** `land-tour-client` — `apps/web/src/app/dashboard/`

---

## Contexto

El portal B2B (`/dashboard/page.tsx`, ~2200 líneas) es un único componente cliente que maneja 5 tabs, el cotizador wizard de 4 pasos, y múltiples modales. Esta refactorización aborda:

1. Mejoras de rendimiento, accesibilidad y UX visual (Sprint A)
2. Corrección de lógica de precios y reestructuración del wizard de cotización (Sprint B)
3. Extracción de componentes y code-splitting (Sprint C)

---

## Auditoría de datos reales (Supabase MCP — 2026-06-27)

### TarifaHotel (precioBase por noche)
| Hotel | Ciudad | SGL | DBL | TPL | QUAD | CHD |
|-------|--------|-----|-----|-----|------|-----|
| Hotel Luxury 2 (id 7) | París | $40 | $20 | $18 | $15 | $10 |
| LTT03 (id 8) | París | $100 | $50 | $40 | — | $0 |
| LTT004 (id 9) | Cartagena | $90 | $45 | $30 | — | $0 |
| Dreams Playa Cancún (id 10) | Cancún | $220 | $280 | $320 | $360 | $80 |
| Be Live Experience Cancún (id 11) | Cancún | $150 | $200 | $230 | $260 | $55 |
| Cartagena plus (id 12) | Cartagena | $40 | $35 | $30 | $25 | — |

> ⚠️ Hoteles 7 y 9 tienen tarifas muy bajas — probablemente datos de prueba. No se modifica la BD.

### VersionPaquete (precioPorPersona — cubre TODAS las noches)
| Paquete | tipoPax | precioPorPersona |
|---------|---------|-----------------|
| Magias de Francia (id 8) | SGL | $452 |
| Magias de Francia (id 8) | DBL | $381 |
| Viajes memoriales (id 9) | SGL | $535 |
| Viajes memoriales (id 9) | TPL | $438.33 |
| Viajes memoriales (id 9) | QUAD | $418.25 |
| Paraíso Caribeño Cancún (id 10) | SGL | $1850 |
| Paraíso Caribeño Cancún (id 10) | DBL | $1420 |
| Paraíso Caribeño Cancún (id 10) | TPL | $1250 |
| Paraíso Caribeño Cancún (id 10) | QUAD | $1150 |
| Paraíso Caribeño Cancún (id 10) | CHD | $680 |

### Bugs críticos identificados en el código actual
- `cotHabs` se inicializa con `{ DBL: 1 }` (línea 226) — debe ser `{}`
- `resetForm()` también restaura `{ DBL: 1 }` (línea 480) — debe ser `{}`
- `getCotPrice()` en modo libre usa `cotPrimaryHotel` (primer hotel) para todos los subtotales — incorrecto
- `confirm()` nativo en `handleEliminar` (línea 530) — reemplazar con modal branded
- `<img>` sin optimización en catálogo de paquetes (línea 1279)
- `step1CanProceed` verifica solo `clientName` pero la guarda era inconsistente con CLAUDE.md — **decisión final: solo `clientName` requerido**
- Campo "Servicios Adicionales" (`cotManualServices`) — será eliminado en Sprint B

---

## Sprint A — Cosmético / Accesibilidad

**Alcance:** Sin cambios a lógica de negocio ni estado de cotizaciones.

### A.1 — `<Image>` en catálogo de paquetes
- Línea 1279: reemplazar `<img>` con `<Image>` de Next.js
- `width={64} height={64}` con `className="object-cover"`
- Si la URL es externa (Unsplash), usar el dominio en `next.config.ts` (ya configurado) o `unoptimized` como fallback

### A.2 — `aria-label` en botones de íconos
| Botón | aria-label |
|-------|-----------|
| Eye (cotizaciones) | `"Ver cotización {cot.codigo}"` |
| Trash2 (cotizaciones) | `"Eliminar cotización {cot.codigo}"` |
| Star (cotizaciones) | `"Finalizar cotización {cot.codigo}"` |
| + habitación | `"Aumentar cantidad de {label}"` |
| − habitación | `"Reducir cantidad de {label}"` |
| Toggle vuelo | `"Activar/desactivar boleto aéreo"` |

### A.3 — `htmlFor`/`id` en inputs del wizard
Cada `<label>` del wizard recibe `htmlFor="campo-id"` y su `<input>` correspondiente recibe `id="campo-id"`. Campos afectados: `clientName`, `clientEmail`, `clientPhone`, `clientId`, `clientAddress`, `cotFechaSalida`, `cotNumPersonas`, `cotExtraNights`, `agencyMarkup`.

### A.4 — iOS Safe Area en Bottom Nav
```tsx
// Antes
<nav className="lg:hidden fixed bottom-0 ...">

// Después
<nav className="lg:hidden fixed bottom-0 ..." style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
```

### A.5 — Transiciones de tab
El contenedor de cada tab ya tiene `animate-fade-scale`. Se verifica que la clase existe en `globals.css`; si no, se añade:
```css
@keyframes fade-scale {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fade-scale { animation: fade-scale 0.15s ease-out; }
```

### A.6 — Bottom Nav animación de ítem activo
Añadir `transition-all duration-200` al ítem del bottom nav y `scale-105` al estado activo. El ícono activo recibe `animate-bounce` de un frame o `scale-110` con transición.

### A.7 — Etiqueta descriptiva en stepper móvil
En el `<div className="h-6" />` debajo de la barra de progreso, añadir (visible solo en `sm:hidden`):
```tsx
<p className="text-center text-[10px] font-black text-primary/50 uppercase tracking-wider mt-1 sm:hidden">
  Paso {step}: {["Cliente", "Configuración", "Habitaciones", "Revisión"][step - 1]}
</p>
```

### A.8 — Renombrar labels del selector de modo
| Antes | Después |
|-------|---------|
| "Catálogo DB" | "Paquetes Disponibles" |
| "Cotización Libre" | "Armar desde Cero" |
| "Paquetes con precios del catálogo" | "Elige de los paquetes armados por Land Tour Travel" |
| "Selecciona destino y hotel manualmente" | "Selecciona destino, hotel y servicios manualmente" |

### A.9 — Modal de confirmación para eliminar (reemplaza `confirm()`)
**Estado nuevo:** `const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);`

**Flujo:**
1. Botón Trash2 → `setConfirmDeleteId(cot.id)` (no llama `handleEliminar` directamente)
2. `<dialog>` nativo con `showModal()` muestra: nombre del cliente, código, warning rojo
3. Botón "Cancelar" → `setConfirmDeleteId(null)` + `dialog.close()`
4. Botón "Eliminar" → llama `handleEliminar(id)` + cierra el modal

**Diseño:** Header rojo oscuro, icono `Trash2`, texto: _"¿Eliminar la cotización {codigo} de {cliente.nombre}? Esta acción no se puede deshacer."_. Botones: `"Cancelar"` (borde gray) y `"Sí, eliminar"` (bg-red-500 text-white).

### A.10 — Touch targets 44px en botones +/-
```tsx
// Antes
<button className="w-7 h-7 rounded-lg ...">

// Después
<button className="w-11 h-11 rounded-xl flex items-center justify-center ...">
```

### A.11 — Auto-save del wizard en progreso
**Storage:** `sessionStorage` con clave `"cotizador-draft"`.

**Campos serializados:** `clientName`, `clientEmail`, `clientPhone`, `clientId`, `clientAddress`, `cotMode`, `cotSelectedPkgId`, `cotSelectedDestinoId`, `cotSelectedHotelIds`, `cotHabs`, `cotFechaSalida`, `cotCustomDias`, `cotExtraNights`, `cotFlightOverride`, `cotFlightPrice`, `cotLibreActSel`, `cotLibreTrsSel`, `step`.

**Cuándo guardar:** `useEffect` con `debounce` de 800ms que escucha todos los campos del wizard. Solo guarda si `step >= 1 && !quoteLocked`.

**Cuándo limpiar:** En `resetForm()` y en `handleSaveProforma()` tras éxito.

**Banner de restauración:** Al montar `CotizadorWizard` (o al entrar a la tab `cotizar`), si `sessionStorage["cotizador-draft"]` existe y el form está en estado inicial:
```tsx
<div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
  <p className="text-xs font-bold text-amber-700">Tienes una cotización en progreso sin guardar.</p>
  <div className="flex gap-2">
    <button onClick={restoreDraft}>Continuar</button>
    <button onClick={discardDraft}>Descartar</button>
  </div>
</div>
```

---

## Sprint B — Datos Reales + Reestructura del Wizard

**Alcance:** Cambios a la API, lógica de precios y flujo del wizard.

### B.1 — Extensión de `/api/cotizar-datos`

**Cambio en el tipo `CotPaquete`:**
```ts
// Añadir:
hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[]
```

**Query Prisma adicional por paquete:**
```ts
// En el include del paquete, incluir tarifas de hoteles:
hoteles: {
  include: {
    hotel: {
      include: {
        tarifas: true  // TarifaHotelRef
      }
    }
  }
}
```
El mapper extrae `hotelTarifas` del resultado.

### B.2 — Eliminar `cotHabs` default `DBL: 1`

```ts
// Antes (línea 226)
const [cotHabs, setCotHabs] = useState<Record<string, number>>({ DBL: 1 });

// Después
const [cotHabs, setCotHabs] = useState<Record<string, number>>({});

// Antes en resetForm() (línea 480)
setCotHabs({ DBL: 1 });

// Después
setCotHabs({});
```

### B.3 — Eliminar `cotManualServices`

Eliminar completamente:
- Estado: `cotManualServices`
- Setter: `setCotManualServices`
- El bloque UI "Servicios Adicionales" del Paso 3
- Su inclusión en `handleSaveProforma`, `handlePrintPreview` y el cálculo de `cotManualTotal`

El campo `notas` de la cotización ya no incluirá servicios manuales.

### B.4 — Noches adicionales con tarifa real

**Nuevo estado:** ninguno nuevo — `cotExtraNights` ya existe.

**Nueva función de cálculo:**
```ts
const cotExtraCost = useMemo(() => {
  if (cotExtraNights <= 0) return 0;
  if (cotMode === "catalogo" && cotSelectedPkg) {
    // Usar TarifaHotel del primer hotel del paquete
    const firstHotelId = cotSelectedPkg.hoteles[0]?.id;
    return Object.entries(cotHabs)
      .filter(([, qty]) => qty > 0)
      .reduce((sum, [tipoPax, qty]) => {
        const tarifa = cotSelectedPkg.hotelTarifas.find(
          t => t.hotelId === firstHotelId && t.tipoHabitacion === tipoPax
        );
        return sum + (tarifa?.precioBase ?? 0) * (COT_NUM_PAX[tipoPax] ?? 1) * qty * cotExtraNights;
      }, 0);
  }
  if (cotMode === "libre" && cotPrimaryHotel) {
    return Object.entries(cotHabs)
      .filter(([, qty]) => qty > 0)
      .reduce((sum, [tipoPax, qty]) => {
        const tarifa = cotPrimaryHotel.tarifas.find(t => t.tipoHabitacion === tipoPax);
        return sum + (tarifa?.precioBase ?? 0) * (COT_NUM_PAX[tipoPax] ?? 1) * qty * cotExtraNights;
      }, 0);
  }
  return 0;
}, [cotExtraNights, cotMode, cotSelectedPkg, cotPrimaryHotel, cotHabs]);
```

**Actualización de `cotSubtotal`:**
```ts
// cotManualTotal eliminado (ya no existe cotManualServices)
const cotSubtotal = cotSubtotalAlojamiento + cotExtraCost + cotLibreActTotal + cotLibreTrsTotal;
```

> Todas las referencias a `cotManualTotal`, `cotManualServices` y `setCotManualServices` deben eliminarse de: estado, `resetForm()`, `handleSaveProforma()`, `handlePrintPreview()`, y la UI del Paso 3.

**UI en Paso 3** (cuando `permitirModificarNoches === true` o en modo libre):
```
[Noches adicionales: ___]
→ Costo noches extra: 2 noches × (1 DBL × $280/n) = $560
```

### B.5 — Paso 3 reestructurado

El Paso 3 queda organizado en 4 bloques:

**Bloque A — Distribución de habitaciones**
- Grid de tarjetas +/- igual que antes
- Sin default DBL:1
- `cotHabs` vacío hasta que el asesor selecciona

**Bloque B — Noches adicionales** (solo si aplica)
- Condición de aparición: `cotMode === "libre" || cotSelectedPkg?.permitirModificarNoches`
- Campo `cotExtraNights` con cálculo automático mostrado debajo

**Bloque C — Servicios incluidos / seleccionables** (movido de Paso 2)
- **Catálogo (mono-hotel o multi):** chips no editables con actividades + traslados del paquete. Subtítulo: _"Incluido en el paquete"_.
- **Libre:** checkboxes de actividades y traslados según el destino. Esto se mueve exactamente de Paso 2 a Paso 3 (mismo código).

**Bloque D — Comisión de agencia**
- Campo `agencyMarkup` igual que antes

### B.6 — Vista comparativa multi-hotel (catálogo Y libre)

**Condición de activación:**
- Catálogo: `cotSelectedPkg?.hoteles.length > 1`
- Libre: `cotSelectedHotelIds.length > 1`

**En ambos casos, el Paso 3 muestra la tabla comparativa** en lugar de un único subtotal:

```
┌─────────────────────┬──────────┬──────────────┬──────────────────────────┐
│ Tipo Habitación     │ Hotel A  │ Hotel B      │ Hotel C                  │
├─────────────────────┼──────────┼──────────────┼──────────────────────────┤
│ Sencilla (SGL) /pax │ $1,850   │ $1,850       │ —                        │
│ Doble (DBL) /pax    │ $1,420   │ $1,420       │ $1,420                   │
└─────────────────────┴──────────┴──────────────┴──────────────────────────┘
Nota: El total se calculará cuando el cliente elija su hotel.
```

- **Catálogo:** precio = `VersionPaquete.precioPorPersona` (mismo para todos los hoteles del paquete). La comparativa es por **calidad**, no por precio — el cliente elige el hotel según estrellas/servicios.
- **Libre:** precio = `TarifaHotel.precioBase × cotNoches` (distinto por hotel — comparativa real de precio)
- No se muestra subtotal ni total en el Paso 3 cuando hay comparativa activa
- El Paso 4 (Revisión) tampoco muestra total en este caso: muestra "Total: Pendiente de selección de hotel"

**Selección de cantidades (+/-)** en la vista comparativa: se deshabilita. Las cantidades se ingresan al momento de aprobación.

**Importante:** Para cotizaciones con un solo hotel, el flujo actual se mantiene: cantidades seleccionables en Paso 3 y total mostrado en Paso 4.

### B.7 — Modal de aprobación con selección de hotel

El `proformaDialogRef` existente se expande para manejar el caso multi-hotel:

**Estado del modal:**
```ts
const [approvalHotelId,  setApprovalHotelId]  = useState<number | null>(null);
const [approvalHabs,     setApprovalHabs]      = useState<Record<string, number>>({});
```

**Flujo del modal:**
1. Radio buttons: "¿Qué hotel eligió el cliente?" (un radio por hotel)
2. Grid de cantidades +/- por tipo de habitación (igual que Paso 3 en mono-hotel)
3. Total calculado en tiempo real: `precio × numPax × qty × noches + actividades/traslados seleccionados + boleto + markup`
4. Botón "Confirmar y Aprobar" → PATCH `/api/cotizaciones/{id}/status` con `{ status: "APROBADA", selectedHotelId, total, pasajeros }`

> ⚠️ **API change requerido en Sprint B.7:** El endpoint `PATCH /api/cotizaciones/{id}/status` actualmente solo acepta `{ status, nota? }`. Deberá ampliarse para aceptar `{ status, nota?, selectedHotelId?, total?, cantSGL?, cantDBL?, cantTPL?, cantQUAD?, cantCHD? }`. Cuando se recibe `total`, el servidor lo sobreescribe en la `Cotizacion` y crea/actualiza los `CotizacionDetalle`. La validación server-side `total >= subtotal` se mantiene.

**Para cotizaciones mono-hotel** (`hoteles.length === 1`): el modal de aprobación es el mismo pero sin el radio de selección de hotel (ya está implícito).

### B.8 — Mobile FAB "Ver Resumen"

```tsx
{/* Visible solo en móvil, solo durante el wizard (tabs 2-4) */}
{activeTab === "cotizar" && step > 1 && (
  <button
    className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-primary rounded-full shadow-xl flex items-center justify-center"
    onClick={() => setShowMobileSummary(true)}
    aria-label="Ver resumen de cotización"
  >
    <DollarSign size={20} className="text-white" />
  </button>
)}
```

El bottom-sheet de resumen muestra:
- Destino, duración, fechas
- Distribución de habitaciones actual
- Subtotal alojamiento + noches extra + servicios
- Boleto (si aplica)
- Markup
- **Total** (o "Pendiente" si multi-hotel)

### B.9 — `step1CanProceed` sin email obligatorio

```ts
// Solo nombre requerido (decisión acordada)
const step1CanProceed = clientName.trim().length > 0;
```

---

## Sprint C — Extracción de Componentes

**Alcance:** Refactoring arquitectónico. Sin cambios de funcionalidad.

### C.1 — Estructura de archivos

```
apps/web/src/app/dashboard/
├── page.tsx                          ← Layout + estado global + tab routing + context provider
├── DashboardContext.tsx              ← createContext con cotizaciones, packages, agencyConfig, session
└── components/
    ├── DashboardTab.tsx
    ├── PaquetesTab.tsx
    ├── CotizacionesTab.tsx
    ├── PerfilTab.tsx
    ├── cotizador/
    │   ├── CotizadorWizard.tsx       ← Stepper + wizard state + FAB + auto-save
    │   ├── Step1Client.tsx
    │   ├── Step2Config.tsx
    │   ├── Step3Rooms.tsx
    │   └── Step4Review.tsx
    └── modals/
        ├── DeleteConfirmModal.tsx
        ├── PreviewCotizacionModal.tsx ← Extraído del inline IIFE actual
        └── ApprovalModal.tsx
```

### C.2 — Distribución de estado

| Estado | Dónde vive | Cómo se comparte |
|--------|-----------|-----------------|
| `cotizaciones` | `page.tsx` (Context) | `DashboardContext` |
| `packages` | `page.tsx` (Context) | `DashboardContext` |
| `agencyConfig` | `page.tsx` (Context) | `DashboardContext` |
| `sessionData` | `page.tsx` | Props o Context |
| `activeTab` | `page.tsx` | Props → componentes |
| `cotMode`, `cotHabs`, etc. | `CotizadorWizard.tsx` | Local (no sube) |
| `step`, `quoteLocked` | `CotizadorWizard.tsx` | Local |
| `clientName`, etc. | `CotizadorWizard.tsx` | Pasado a `Step1Client` vía props |

**Regla de oro:** El estado del wizard es completamente local a `CotizadorWizard`. Al navegar fuera del wizard (`setActiveTab`), el estado se limpia via `resetForm()` en `useEffect` del wizard.

### C.3 — `useMemo` en cálculos derivados

Los siguientes valores se envuelven en `useMemo`:

```ts
const cotSubtotalAlojamiento = useMemo(() => { ... }, [cotHabs, cotMode, cotNoches, cotSelectedPkg, cotPrimaryHotel]);
const cotLibreActTotal       = useMemo(() => { ... }, [cotLibreActSel, cotAllActRef]);
const cotLibreTrsTotal       = useMemo(() => { ... }, [cotLibreTrsSel, cotAllTrsRef]);
const cotExtraCost           = useMemo(() => { ... }, [cotExtraNights, cotMode, cotSelectedPkg, cotPrimaryHotel, cotHabs]);
const cotTotal               = useMemo(() => cotSubtotalAlojamiento + cotExtraCost + cotLibreActTotal + cotLibreTrsTotal + cotBoletoTotal + agencyMarkup,
  [cotSubtotalAlojamiento, cotExtraCost, cotLibreActTotal, cotLibreTrsTotal, cotBoletoTotal, agencyMarkup]);
const filteredPackages       = useMemo(() => packages.filter(...), [packages, searchPkgTerm]);
```

### C.4 — Dynamic imports

```ts
// En page.tsx
import dynamic from "next/dynamic";

const PaquetesTab     = dynamic(() => import("./components/PaquetesTab"),     { ssr: false, loading: () => <TabSpinner /> });
const CotizadorWizard = dynamic(() => import("./components/cotizador/CotizadorWizard"), { ssr: false, loading: () => <TabSpinner /> });
const CotizacionesTab = dynamic(() => import("./components/CotizacionesTab"), { ssr: false, loading: () => <TabSpinner /> });
```

`DashboardTab` y `PerfilTab` son livianos — no necesitan `dynamic()`.

---

## Reglas técnicas

1. **No se toca NextAuth v5 ni el middleware** — las rutas protegidas siguen igual.
2. **`prisma migrate` jamás** — solo `db push` si se agregan campos nuevos (no aplica en estos sprints).
3. **Las firmas de API se mantienen** — `/api/cotizar-datos` añade `hotelTarifas` al JSON pero los campos existentes no cambian.
4. **Markup invisible al cliente** — el campo `agencyMarkup` sigue sin aparecer en proformas PDF.
5. **Validación server-side** — `POST /api/cotizaciones` sigue validando que `total >= subtotal` y que los precios sean `>= 0`.
6. **`calcularSubtotal` de `@land-tour/shared`** — los nuevos cálculos de `cotExtraCost` usan aritmética local (no `calcularSubtotal` ya que ese opera sobre `PasajerosCotizacion` que no incluye noches extra). Si la función se amplía en el futuro, migrar.

---

## Orden de implementación

```
Sprint A  (sin riesgo)
├── A.1  <Image> en catálogo
├── A.2  aria-labels
├── A.3  htmlFor/id
├── A.4  iOS safe area
├── A.5  animate-fade-scale check
├── A.6  bottom nav animación
├── A.7  stepper label móvil
├── A.8  renombrar labels
├── A.9  DeleteConfirmModal
├── A.10 touch targets 44px
└── A.11 auto-save sessionStorage

Sprint B  (lógica crítica)
├── B.1  /api/cotizar-datos + hotelTarifas
├── B.2  cotHabs default vacío
├── B.3  eliminar cotManualServices
├── B.4  cotExtraCost con TarifaHotel real
├── B.5  Paso 3 reestructurado
├── B.6  vista comparativa multi-hotel
├── B.7  ApprovalModal ampliado
├── B.8  Mobile FAB "Ver Resumen"
└── B.9  step1CanProceed solo clientName

Sprint C  (arquitectura)
├── C.1  DashboardContext
├── C.2  extracción componentes (tab a tab)
├── C.3  useMemo en derivados
└── C.4  dynamic imports
```

**Commit strategy:** Un commit por sprint (A, B, C). Dentro de cada sprint, los cambios se acumulan antes de hacer commit para facilitar el revert si hay regressions.
