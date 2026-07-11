# Spec: Vista de Detalle de Paquete + Cotización Rápida

**Fecha:** 2026-07-11
**Autor:** Miguel Ticaray
**Alcance:** `apps/web/src/app/dashboard/components/PaquetesTab.tsx`, `apps/web/src/app/dashboard/paquetes/[id]/page.tsx` (nuevo), `apps/web/src/app/dashboard/components/PaqueteDetailView.tsx` (nuevo), `apps/web/src/app/api/cotizar-datos/route.ts`, `apps/web/src/app/api/cotizaciones/quick/route.ts` (nuevo), `apps/web/src/app/dashboard/cotizar-price.ts`, `apps/web/src/lib/cotizacion-create.ts` (nuevo)

---

## Contexto

Hoy el tab "Paquetes" del cotizador (`PaquetesTab.tsx`) muestra un acordeón agrupado por destino con filas livianas (imagen, duración, "incluye", precio) y un único botón "Cotizar" que salta directo al wizard de 4 pasos. No existe forma de que el asesor explore la información completa de un paquete (galería, itinerario, servicios incluidos) ni compare el precio real de sus variantes (SGL/DBL/TPL/QUAD) antes de decidir cotizar.

Este spec agrega:

1. Una página de detalle de paquete, inspirada en la vista `PaqueteDetailClient.tsx` de `lt-core-admin` mejor: galería, itinerario, servicios incluidos por destino y tarjetas de variantes con precio real calculado.
2. Una acción de **"Cotización rápida"** que, sin pasar por el wizard, genera de inmediato una `Cotizacion` real en estado `BORRADOR` con un cliente genérico y todos los hoteles disponibles cargados, lista para revisar/imprimir.

---

## 1. Ruteo y origen de datos

**Nueva ruta:** `apps/web/src/app/dashboard/paquetes/[id]/page.tsx` — página standalone `"use client"`, sin sidebar/bottom-nav, siguiendo el mismo patrón ya establecido por `dashboard/cotizaciones/[id]/page.tsx` (no depende de `DashboardContext`, hace su propio fetch). Botón "Volver" usa `router.back()` con fallback a `<Link href="/dashboard">`.

**Origen de datos:** la página reutiliza `GET /api/cotizar-datos` (ya autenticado, ya devuelve la forma `CotPaquete` completa: hoteles+tarifas+actividades+traslados+versiones por destino) y filtra el paquete por `id` en el cliente. No se crea un endpoint nuevo de lectura para evitar duplicar esa consulta Prisma compleja.

**Entrypoint:** en `PaquetesTab.tsx`, cada fila del acordeón gana un botón "Ver detalles" junto al "Cotizar" existente (que no cambia de comportamiento). "Ver detalles" navega con `router.push(\`/dashboard/paquetes/${pkg.id}\`)` (misma pestaña).

---

## 2. Extensión de `/api/cotizar-datos`

El tipo `CotPaquete` actual no incluye galería ni itinerario. Se agregan dos campos al `select`/`include` de la query existente, usando relaciones Prisma que `PaqueteRef` ya declara (agregadas en trabajo previo de landing/multi-destino):

```ts
imagenes: { orderBy: { orden: "asc" }, select: { url: true } },
itinerario: { orderBy: { orden: "asc" }, select: { dia: true, titulo: true, descripcion: true } },
```

Mapeo agregado a `CotPaquete`:

```ts
interface CotPaquete {
  // ...campos existentes...
  imagenes: string[];
  itinerario: { day: number; title: string; description: string }[];
}
```

Si el paquete no tiene imágenes o itinerario, los arrays quedan vacíos y las secciones correspondientes no se renderizan (mismo patrón que ya usa `PackageDetailModal` en la landing).

---

## 3. Página de detalle: `/dashboard/paquetes/[id]`

### 3.1 Secciones

1. **Header** — título, badges (multi-destino si aplica, "Vuelo incluido" si `visibleBoleto && incluyeBoleto`), ciudades, botón "Volver".
2. **Galería** (si `imagenes.length > 0`) — grid de miniaturas; click alterna a una vista ampliada simple (sin librería de lightbox nueva).
3. **Datos rápidos** — duración (días/noches), boleto (incluido/no incluido + descripción + precio si `visibleBoleto`), destinos.
4. **Itinerario** (si `itinerario.length > 0`) — lista vertical día por día, numerada por `day`.
5. **Servicios incluidos**, agrupados por destino (mismo patrón visual del admin): hoteles disponibles (nombre + estrellas, sin precio individual), actividades y traslados (solo nombres, informativo).
6. **Variantes disponibles** — grid de tarjetas: una tarjeta por la **versión base** (`tipoPax = numPaxToTipoPax(paquete.numPax)`, `numPax = paquete.numPax` — la primera versión, que no vive como fila en `VersionPaquete`) más una tarjeta por cada fila en `paquete.versiones`. Cada tarjeta:
   - Badge de color por `tipoPax` + `numPax`
   - **"Desde $X/persona"** — precio calculado en vivo (ver 3.2)
   - Botón "Cotización rápida" con el `numPax` de esa variante
7. **CTAs de la página** (siempre visibles, fuera del grid):
   - "Cotizar este paquete" → comportamiento actual de `handleQuickQuote` (entra al wizard completo, Paso 1, paquete preseleccionado)
   - "Cotización rápida" → usa `numPax`/`numNinos` BASE del paquete

### 3.2 Precio por variante (cliente, sin red)

Se reutilizan las funciones puras de `cotizar-price.ts` ya usadas por el wizard (`calcHotelBreakdown`, `combineComboLegs`) contra los datos de `CotPaquete` ya cargados en memoria — sin llamadas de red adicionales. Para cada variante: `numAdultos = variante.numPax`, `numNinos = paquete.numNinos` (base), se agrupan los hoteles por destino, se toma la combinación cartesiana más barata, y se muestra `precioAdulto` de `combineComboLegs`. Este es el mismo cálculo que produce el motor real del cotizador — evita mostrar el campo estático `VersionPaquete.precioPorPersona`, que es solo referencial y puede no coincidir con el precio final real.

---

## 4. Endpoint nuevo: `POST /api/cotizaciones/quick`

Autenticado (requiere `session.user.agenciaId`).

**Request:** `{ paqueteId: number; numPax: number; numNinos: number }`

**Response (éxito):** `{ id: string }` (id de la `Cotizacion` creada)
**Response (error):** `{ error: string }` con status 400/404 según corresponda. No hay camino de error por "sin hoteles disponibles" (ver 4.3).

### 4.1 Lógica paso a paso

1. Busca (o crea) el **cliente genérico fijo** de la agencia: `findFirst({ agenciaId, email: "cliente.potencial@landtourtravel.com" })`; si no existe, lo crea con `nombre: "Cliente Potencial"`. Todas las cotizaciones rápidas de una agencia reutilizan el mismo registro `Cliente` — no se acumulan duplicados.
2. Trae el paquete completo reutilizando el mismo helper de consulta que usa `/api/cotizar-datos` (se extrae a una función compartida, p. ej. `getPaquetesParaCotizar(agenciaId)`, para no triplicar esa lógica Prisma).
3. Calcula `fechaSalida = hoy + 30 días` y `fechaRetorno` derivada de `diasEstancia`.
4. Corre `calcHotelBreakdown` para **cada hotel de cada destino del paquete, sin filtrar por elegibilidad de niños** (ver 4.3) y construye el snapshot `hotelsComparison` v4 completo (mismo shape que produce el wizard).
5. Determina la combinación cartesiana más barata (`combineComboLegs`) como valores provisionales de `subtotal`/`total`, con `markup = 0` y boleto = default del paquete (`incluyeBoleto`/`precioBoleto`/`precioBoletoNino` si `visibleBoleto`). `selectedHotelId: null` — la elección final de hotel queda pendiente para la aprobación, igual que en el flujo normal.
6. Construye la composición de habitación: una sola entrada `{ [numPaxToTipoPax(numPax)]: 1 }` (una habitación del tipo que corresponde al total de adultos) + `CHD: numNinos` (una entrada por niño). `numPaxToTipoPax` se mueve de `page.tsx` a `cotizar-price.ts` para poder importarse también desde este endpoint server-side.
7. Crea `Cliente`(ya resuelto)/`Cotizacion`(`status: "BORRADOR"`)/`CotizacionDetalle` reutilizando la misma función de creación + redondeo (`r2`) + validación numérica que usa `POST /api/cotizaciones` — se extrae a `apps/web/src/lib/cotizacion-create.ts` para que ambas rutas la compartan (mismo patrón que `cotizacion-mapper.ts` para lectura).
8. Responde `{ id }`.

### 4.2 En la página de detalle

El botón "Cotización rápida" (general o por variante) hace `POST` con el `numPax`/`numNinos` correspondiente, muestra spinner mientras espera, y al éxito hace `window.open(\`/dashboard/cotizaciones/${id}\`, "_blank")` — consistente con el resto del sistema, donde abrir una cotización guardada siempre es pestaña nueva (a diferencia de la página de detalle del paquete, que es misma pestaña por ser navegación de catálogo).

### 4.3 Regla de hoteles sin tarifa CHD

A diferencia del wizard normal (que oculta con `hotelAptoNinos` los hoteles sin tarifa CHD válida cuando hay niños), **la cotización rápida nunca excluye hoteles**: siempre incluye todos los hoteles de cada destino, tengan o no tarifa CHD configurada. Un paquete puede cotizarse válidamente solo para adultos.

- Hotel **con** tarifa CHD → cálculo normal (incluye costo de alojamiento del niño).
- Hotel **sin** tarifa CHD → el alojamiento del niño en ese hotel específico se computa como **$0** (sin cargo de hospedaje infantil ahí); sus actividades/traslados de niño sí se cobran normal si el destino los tiene tarifados (eso es independiente del hotel elegido). El snapshot marca la fila con una etiqueta visible: *"Sin tarifa de niño en este hotel — alojamiento cotizado solo para adultos"*, para que no se lea como "niño gratis" por omisión de datos.

Esto elimina cualquier escenario de error 422 por "destino sin hoteles elegibles" — nunca se excluye ninguno. Es un trade-off aceptado que el combo "más barato" provisional (paso 4.1.5) pueda terminar siendo uno sin tarifa CHD; el asesor revisa y elige el hotel real al aprobar, igual que en el flujo normal.

---

## 5. Fuera de alcance

- Editar el cliente genérico o los datos de la cotización rápida desde esta página (eso ocurre en el flujo existente de edición/aprobación).
- Extras por variante (`VersionPaquete.actividades`/`traslados`) — el modelo `CotPaqueteVersion` del cliente no expone esos datos hoy; no se agregan en este ciclo.
- Cambiar el filtro `hotelAptoNinos` del wizard normal (Pasos 2/3) — se mantiene igual; el cambio de la sección 4.3 aplica únicamente a `POST /api/cotizaciones/quick`.
- Lightbox de galería con librería externa — solo toggle simple de imagen ampliada.
