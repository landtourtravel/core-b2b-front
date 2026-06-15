# Dashboard B2B — Adaptación Móvil

**Fecha:** 2026-06-14  
**Archivo principal:** `apps/web/src/app/dashboard/page.tsx`

## Decisiones de diseño (aprobadas)

### 1. Navegación
- **Sidebar** (`w-64` fijo): `hidden lg:flex` — desaparece en móvil
- **Bottom nav** (`lg:hidden`, `fixed bottom-0`): 5 tabs — Inicio, Paquetes, Nueva, Cotizaciones, Perfil
- Tab activo: fondo `bg-secondary`, icono `text-primary`
- Badge de notificación en "Cots." cuando `kpiPendientes > 0`
- "Marca Blanca" vive dentro del tab Perfil (solo admins)

### 2. Header móvil
- Altura: `h-14 lg:h-[76px]`
- **Logo LTT** (`opacity-60`, `w-[60px]`): solo visible en móvil (`lg:hidden`), izquierda del header
- Título de sección: `text-[11px]` truncado en móvil
- Badge de agencia: `hidden lg:flex` (se ve en Perfil tab en móvil)

### 3. Cotizador — Stepper
- Panel de resumen lateral (`lg:col-span-1`): `hidden lg:block` en móvil
- Etiquetas de paso ("Cliente", "Configuración"…): `hidden sm:block`
- Cada paso ocupa pantalla completa; botones Atrás/Siguiente inline al fondo del card

### 4. Listado de Cotizaciones
- Tabla (`min-w-[750px]`): `hidden sm:block` — no se ve en móvil
- **Vista de tarjetas** (`sm:hidden`): cada cotización = card con código, cliente, destino, total, estado y acciones

### 5. Tab Perfil (nuevo)
- Avatar con iniciales + nombre + rol + badge agencia
- Botón "Mi Marca Blanca" → `setActiveTab("marca-blanca")` (solo admins)
- Botón "Cerrar Sesión"

### 6. Ajustes menores
- Main padding: `p-4 lg:p-8`, `pb-24 lg:pb-8` (espacio para bottom nav)
- KPI cards: `p-3 sm:p-6`, cifras `text-2xl sm:text-3xl`

## Estado
Implementado en `dashboard/page.tsx`. Sin cambios en lógica de negocio ni en rutas API.
