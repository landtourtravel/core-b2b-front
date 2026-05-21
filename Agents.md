# Land Tour & Travel - Plataforma Turística B2B

## Agentes.md - Registro del Proyecto

> **Última actualización:** 16/05/2026
> **Cliente:** Kevin Silva - Agencia de Viajes Mayorista
> **Estado:** EN DESARROLLO - Fase 1 MVP

---

## 1. Información General del Proyecto

### 1.1 Resumen Ejecutivo

Plataforma web B2B compuesta por dos aplicaciones principales que optimizan y automatizan los procesos operativos de una agencia de viajes mayorista. El sistema permite a agencias minoristas cotizar paquetes turísticos de manera autónoma y genera liquidaciones/proformas eficientes.

### 1.2 Contactos

| Rol | Nombre | Notas |
|-----|--------|-------|
| Cliente | Kevin Silva | Propietario - Agencia de Viajes Mayorista |
| Equipo | Eduardo / Miguel | Desarrollo |

### 1.3 Documentación de Referencia

- **Requerimientos:** `documents/Requerimiento_Plataforma_Turistica_KevinSilva.docx`
- **Propuesta:** `documents/propuesta_easy_store.docx`
- **Manual de Marca:** `documents/MANUAL MARCA LTT.pdf`
- **Logo:** `documents/lttlogo.png`

---

## 2. Stack Tecnológico

| Tecnología | Elección | Notas |
|------------|----------|-------|
| **Framework** | Next.js 15 (App Router) | Monorepo, server components, API routes |
| **Lenguaje** | TypeScript | type-safety, mantenibilidad |
| **Base de Datos** | PostgreSQL + Supabase | BD relacional según req. |
| **Auth** | NextAuth v5 | Cambio confirmado por cliente |
| **ORM** | Prisma 7 | Compatibilidad con PostgreSQL |
| **CSS** | Tailwind CSS v4 | Diseño rápido, consistencia con mockups |
| **Monorepo** | Turborepo | Multi-app, shared packages |
| **Hosting** | Por definir | Cliente aún no tiene dominio |

---

## 3. Arquitectura del Sistema

### 3.1 Estructura de Monorepo

```
land-tour-client/
├── apps/
│   ├── web/              # Frontend público (landing + paquetes)
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globally.css
│   │   │   │   └── paquetes/
│   │   │   │       └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   ├── PackageCard.tsx
│   │   │   │   ├── PackagesSection.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── public/
│   │   └── package.json
│   │
│   └── admin/           # Panel admin + API + Cotizador
│       ├── src/
│       │   ├── app/
│       │   ├── auth.ts    # NextAuth config
│       │   ├── components/
│       │   ├── lib/
│       │   ├── types/
│       │   └── services/
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── ui/              # Design system compartido
│   │   └── package.json
│   │
│   └── shared/          # Tipos, constantes, utilidades
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── docs/                 # Documentación
├── turbo.json           # Config Turborepo
├── package.json         # Root monorepo
└── tsconfig.json       # TypeScript config base
```

### 3.2 Flujo de Datos (Fase 1)

```
                    ┌─────��───────────┐
                    │   apps/admin   │
                    │  (Backend)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │           │          │
         ┌────▼────┐ ┌──▼────┐ ┌──▼────┐
         │ Admin  │ │  DB   │ │  Web  │
         │Panel  │ │(Postgre)│ │(fetch)│
         └───────┘ └───────┘ └───────┘
```

---

## 4. Paleta de Colores y Diseño

### 4.1 Colores de Marca

| Nombre | Hex | Uso |
|--------|-----|-----|
| `primary` | #0B4339 | Botones, headers, textos principales |
| `primary-dark` | #052924 | Sidebar, fondos oscuros |
| `primary-light` | #156B5A | Hover states |
| `secondary` | #28BFA9 | CTAs, acentos, iconos |
| `secondary-light` | #54DAC0 | Badges, highlights |
| `white` | #FFFFFF | Fondos, tarjetas |
| `light` | #F5FAF9 | Backgrounds suaves |
| `lighter` | #EDF7F5 | Bordes muy claros |
| `gold` | #C9A96E | Acentos premium |

### 4.2 Tipografía

- **Frontend público:** Montserrat (300,400,500,600,700,800)
- **Panel Admin:** Inter (300,400,500,600,700,800)

---

## 5. Fases del Proyecto

### 5.1 Fase 1 - MVP (EN DESARROLLO)

> **Nota:** Testing sin DB - Datos mockeados para pruebas locales

#### Entregables Fase 1

| # | Módulo | Descripción | Estado |
|---|-------|-------------|--------|
| 1 | Landing Page | Hero, búsqueda, paquetes destacados | ✅ Completado |
| 2 | /paquetes | Catálogo + filtro dropdown país/ciudad + búsqueda | ✅ Completado |
| 3 | Modal Detalle Paquete | Información completa con incluye/no incluye | ✅ Completado |
| 4 | Modal Aliados | Lista aliados por ciudad, WhatsApp, email | ✅ Completado |
| 5 | Login | Modal + API route (sin DB aún) | ✅ Completado |
| 6 | Cotizador | Programas armados | ⏳ Pendiente |
| 7 | Panel Admin | CRUD destinos, hoteles, tarifas | ⏳ Pendiente |
| 8 | Backend + API | REST API + PostgreSQL | ⏳ Pendiente (sin DB) |

#### Mejoras Visuales Realizadas (06/05/2026)

**Diseño y Animaciones:**
- ✨ Animaciones de entrada suaves (`fadeInUp`, `cardReveal`, `heroTextReveal`)
- ✨ Hover effects mejorados en tarjetas, botones y enlaces
- ✨ Gradientes de marca en botones y acentos visuales
- ✨ Efecto glassmorphism en navbar y overlays de modales
- ✨ Sombras y glows con colores de marca (`shadow-glow`, `hover-glow`)
- ✨ Patrones decorativos de fondo (`bg-pattern-dots`, `bg-pattern-grid`)
- ✨ Indicadores de sección con acento dorado (`gold-accent`)

**Componentes Mejorados:**
- **Navbar:** Logo con icono Compass, indicadores animados en enlaces, efectos de scroll suaves
- **Hero:** Badge flotante, elementos decorativos animados, estadísticas visuales (50+ destinos, 200+ agencias, 15+ años)
- **SearchBox:** Iconos Lucide, selects estilizados con flechas personalizadas, gradiente en botón de búsqueda
- **PackageCard:** Badges con gradientes por categoría, efecto zoom en imagen al hover, indicador de flecha animado
- **PackagesSection:** Header con badge decorativo, animación escalonada en tarjetas
- **Footer:** Layout mejorado con iconos Lucide, enlaces con flechas animadas, sección de alianzas
- **Modales:** Animaciones de entrada (`modal-enter`, `overlay-enter`), headers con iconos, badges mejorados, gradientes en CTAs
- **Página /paquetes:** Hero header con gradiente, barra de filtros flotante, búsqueda por texto, contador de resultados
**Mejoras Visuales y UX (16/05/2026)**
- 🚀 **Corrección Crítica de Interacción:** Implementación de `React Portals` en todos los modales para evitar bloqueos de clic en el fondo al cerrar.
- 🚀 **Scroll Reveal Global:** Se extendieron las animaciones de aparición al hacer scroll a las secciones de Destinos, Agencias y Comentarios, logrando una experiencia fluida en toda la página.
- 🚀 **Gestión de Scroll:** Sistema robusto de bloqueo de scroll en `html/body` con compensación de ancho de barra para evitar saltos de layout ("layout shift").
- 🚀 **Optimización Next.js 15:** Migración de estilos inline a utilidades de `globals.css` para mejorar el rendimiento de compilación y limpieza de componentes.
- 🔗 **Conexión API Backend (Mock):** Refactorización de `DestinationsSection`, `PackagesSection` y `/paquetes` para consumir datos dinámicos desde el Panel Administrativo.
- 🔗 **Infraestructura de Datos:** Creación de `api.ts` centralizado y configuración de path aliases `@land-tour/shared`.
- 🔗 **Sincronización de Tipos:** Actualización de la interfaz `Package` en el paquete compartido para incluir `flightIncluded` y `transport`, resolviendo errores de tipado en `PackageCard`.

**Sistema de Iconos:**
- Reemplazo completo de Font Awesome por Lucide React en todos los componentes
- Iconos consistentes con la paleta de colores de marca

#### Componentes Creados

```
apps/web/src/components/
├── Navbar.tsx              # Navegación con botón login
├── Hero.tsx              # Hero con CTA
├── SearchBox.tsx         # Buscador básico
├── PackageCard.tsx       # Card de paquete
├── PackagesSection.tsx    # Sección paquetes destacados
├── Footer.tsx          # Footer
├── PackageDetailModal.tsx   # Modal detalle (NUEVO)
├── AgencyModal.tsx          # Modal aliados (NUEVO)
└── LoginModal.tsx         # Modal login (NUEVO)
```

#### Plantillas de Diseño utilizadas

```
documents/Plantillas/
├── Fronted Publico/
│   ├── Landingpage/
│   │   └── 3_proposal.html       ← Referencia diseño
│   └── Detalles Paquetes/
├── Panel Colaboradores/
│   └── Mockup_Panel_Colaborador1.html
└── Formatos Cotizacion/
    └── *.docx, *.pdf
```

### 5.2 Fase 2 - Cotización Avanzada

- Cotizador personalizado
- Multidestinos
- Temporadas alta/baja
- Módulo liquidación
- Flujo de aprobación

### 5.3 Fase 3 - Escalabilidad (Futuro)

- Integración API Channel Manager
- Se cotizará por separado

---

## 6. Actores del Sistema

| Actor | Acceso | Descripción |
|-------|--------|-------------|
| Cliente final | Solo lectura | Navega sitio público |
| Aliado / Agencia | Login → Cotizador | Genera cotizaciones |
| Colaborador interno | Login → Cotizador + Liquidación | Acceso completo |
| Súper Admin (Kevin) | Subdominio admin | Gestión total |

---

## 7. Decisiones Clave Documentadas

| Fecha | Decisión | Notas |
|-------|----------|-------|
| 05/05/2026 | Stack: Next.js + PostgreSQL/Supabase + Prisma | Cliente confirmó |
| 05/05/2026 | Estructura: Monorepo Turborepo | apps/web + apps/admin |
| 05/05/2026 | Auth: JWT → NextAuth | Cliente cambió a NextAuth |
| 05/05/2026 | Iniciar Fase 1 MVP | Cliente confirmó |
| 05/05/2026 | Filtro países: dropdown | Cliente confirmó |
| 05/05/2026 | Vistas separadas: /paquetes | Cliente confirmó |
| 05/05/2026 | Permisos escritura habilitados | Aplicado |
| 16/05/2026 | Uso de React Portals para Modales | Evitar bloqueos de interacción en el fondo |

---

## 8. Pendientes del Cliente

- [ ] Documentación técnica API channel manager (Fase 3)
- [ ] Plantilla liquidación/proforma
- [ ] Tablas de tarifas Excel
- [ ] Lista destinos activos
- [ ] Lista aliados actuales
- [ ] Dominio y hosting

---

## 9. Comandos de Desarrollo

```bash
# Desarrollo
npm run dev             # Todo el monorepo
npm run dev:web         # Solo frontend público
npm run dev:admin       # Solo admin

# Build
npm run build          # Todo
npm run build:web     # Solo web
npm run build:admin   # Solo admin

# Base de datos
npm run db:push        # Push schema a DB
npm run db:generate    # Generar cliente Prisma
```

---

## 10. Estándares de UI — Reglas Permanentes

> Estas reglas aplican a **todos** los componentes del frontend público (`apps/web`) y deben respetarse siempre, sin excepción.

### 10.1 Encabezados de Sección (Section Headers)

Todas las secciones de la landing page y páginas públicas deben usar el mismo patrón de encabezado centrado. **No se permiten headers alineados a la izquierda ni layouts flex split (título izquierda / botón derecha) en encabezados de sección.**

**Estructura obligatoria:**
```tsx
<div className="text-center mb-12 sm:mb-16">
  {/* 1. Badge / etiqueta de categoría */}
  <span className="inline-block px-4 py-1.5 bg-secondary/15 text-secondary text-xs font-bold rounded-lg mb-4 uppercase tracking-widest">
    Etiqueta
  </span>

  {/* 2. Título principal con palabra clave subrayada */}
  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
    Texto principal{" "}
    <span className="relative">
      Palabra clave
      <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
    </span>
  </h2>

  {/* 3. Subtítulo descriptivo (opcional pero recomendado) */}
  <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
    Descripción breve de la sección.
  </p>
</div>
```

**Reglas específicas:**
- Badge: `bg-secondary/15 text-secondary` — nunca usar otro color base
- Título: `text-primary` con `<span>` de palabra clave usando underline `bg-secondary/40`
- Subtítulo: `text-primary/60`, `max-w-xl mx-auto` para limitar el ancho
- Todo el bloque: `text-center`, nunca `text-left` o flex-row
- Secciones que aplican: Paquetes, Destinos, Comentarios, Captación de Agencias, Contacto y cualquier nueva sección futura

| Decisión | Fecha | Solicitado por |
|----------|-------|----------------|
| Headers de sección: centrados, badge + título con underline + subtítulo | 10/05/2026 | Kevin Silva |

---

> *Este documento se actualiza continuamente.*