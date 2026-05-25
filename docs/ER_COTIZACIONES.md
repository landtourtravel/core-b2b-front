# ER Model — Portal de Cotizaciones (land-tour-client)

> **Última actualización:** 24/05/2026  
> **Contexto:** Este documento describe las tablas NUEVAS que gestiona el portal de agencias, y cómo se relacionan con las tablas existentes de `lt-core-admin`.

---

## 1. Arquitectura de Datos: Dos Apps, Una Base de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PostgreSQL (Supabase) — DB compartida             │
│                                                                     │
│  ┌─────────────────────────────┐  ┌────────────────────────────┐   │
│  │    lt-core-admin (owner)    │  │  land-tour-client (owner)  │   │
│  │    Tablas de datos maestros │  │  Tablas de cotizaciones     │   │
│  │                             │  │                            │   │
│  │  Agencia ─────────────────────────► agenciaId (FK)          │   │
│  │  User    ─────────────────────────► creadoPorId (FK)        │   │
│  │  Paquete ─────────────────────────► paqueteId (FK)          │   │
│  │                             │  │                            │   │
│  │  (Kevin gestiona esto)      │  │  Cliente                   │   │
│  │                             │  │  Cotizacion ◄──────────────│   │
│  │                             │  │  HistorialCotizacion       │   │
│  └─────────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Principio:** lt-core-admin es el **owner** de los datos maestros (Paquetes, Hoteles, Tarifas, Agencias). El portal de agencias solo **lee** esos datos y **escribe** las cotizaciones.

---

## 2. Tablas Existentes (lt-core-admin) — Solo Lectura desde el Portal

| Tabla | Campos relevantes para cotizaciones |
|-------|-------------------------------------|
| `Agencia` | `id`, `nombre` |
| `User` | `id`, `name`, `email`, `agenciaId`, `role` |
| `Paquete` | `id`, `nombre`, `diasEstancia`, `nochesBase`, `incluyeBoleto`, `precioBoleto`, `precioSGL`, `precioDBL`, `precioTPL`, `precioQUAD`, `imagenes` |
| `VersionPaquete` | `paqueteId`, `tipoPax`, `numPax`, `precioTotal`, `precioPorPersona` |

---

## 3. Modelo de Precios — Regla Clave

Los precios de un paquete son **por configuración de habitación** (snapshot pre-calculado por Kevin), NO por multiplicador.

```
Paquete "Panamá 5D/4N":
  precioSGL  = $1.200   → 1 persona  en habitación simple
  precioDBL  = $1.738   → 2 personas en habitación doble
  precioTPL  = $2.607   → 3 personas en habitación triple
  precioQUAD = $3.200   → 4 personas en habitación cuádruple
  precioCHD  = $500     → 1 niño (agrega al cuarto adulto)
```

**Fórmula de cotización:**
```
subtotal = (cantSGL × precioSGL)
         + (cantDBL × precioDBL)
         + (cantTPL × precioTPL)
         + (cantQUAD × precioQUAD)
         + (cantCHD × precioCHD)

total = subtotal + markup   ← markup = comisión de la agencia (oculta en PDF)
```

**Ejemplo:**
- Grupo de 7 personas: 1 SGL + 2 DBL + 1 CHD
- subtotal = $1.200 + (2 × $1.738) + $500 = **$5.176**
- markup agencia = $200
- **Total para el pasajero = $5.376**

---

## 4. Diagrama ER — Tablas Nuevas

```
┌──────────────────────────────────────────────────────────────────────┐
│ Cliente                                                              │
├──────────────────────────────────────────────────────────────────────┤
│ id           String PK                                               │
│ agenciaId    String FK→Agencia.id  (cada cliente pertenece a 1       │
│              agencia, no se comparte entre agencias)                 │
│ nombre       String                                                  │
│ email        String?                                                 │
│ telefono     String?                                                 │
│ documento    String? (CC, pasaporte)                                 │
│ direccion    String?                                                 │
│ fechaAlta    DateTime                                                │
│                                                                      │
│ UNIQUE(agenciaId, email)                                             │
│ UNIQUE(agenciaId, documento)                                         │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ 1
                           │
                           ▼ N
┌──────────────────────────────────────────────────────────────────────┐
│ Cotizacion                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ id               String PK                                           │
│ codigo           String UNIQUE  (auto: COT-20260524-001)             │
│                                                                      │
│ ── Referencias a lt-core-admin (FK por ID) ──                        │
│ agenciaId        String FK→Agencia.id                                │
│ creadoPorId      String FK→User.id                                   │
│ paqueteId        Int    FK→Paquete.id                                │
│                                                                      │
│ ── Snapshot del paquete (congelado al cotizar) ──                    │
│ paqueteNombre    String                                              │
│ paqueteDuracion  String   (Ej: "5 Días / 4 Noches")                 │
│ paqueteDestino   String   (Ej: "Panamá")                             │
│ paqueteIncluye   String[] (Lista de includes)                        │
│ incluyeBoleto    Boolean                                             │
│ precioBoleto     Float?   (por persona, si aplica)                   │
│                                                                      │
│ ── Datos del cliente ──                                              │
│ clienteId        String FK→Cliente.id                                │
│                                                                      │
│ ── Pasajeros (cuántos de cada tipo de habitación) ──                 │
│ cantSGL          Int @default(0)                                     │
│ cantDBL          Int @default(0)                                     │
│ cantTPL          Int @default(0)                                     │
│ cantQUAD         Int @default(0)                                     │
│ cantCHD          Int @default(0)                                     │
│                                                                      │
│ ── Snapshot de precios al cotizar ──                                 │
│ precioSGL        Float?                                              │
│ precioDBL        Float?                                              │
│ precioTPL        Float?                                              │
│ precioQUAD       Float?                                              │
│ precioCHD        Float?   (precio por niño)                          │
│                                                                      │
│ ── Totales ──                                                        │
│ subtotal         Float    (suma de cant × precio sin markup)         │
│ markup           Float @default(0) (comisión agencia, oculta PDF)    │
│ total            Float    (subtotal + markup)                        │
│                                                                      │
│ ── Fechas de viaje ──                                                │
│ fechaViaje       DateTime?                                           │
│ fechaRetorno     DateTime?                                           │
│                                                                      │
│ ── Estado y flujo ──                                                 │
│ status           CotizacionStatus @default(BORRADOR)                 │
│ notas            String?                                             │
│ tokenAprobacion  String? UNIQUE (UUID para link al cliente)          │
│                                                                      │
│ ── Timestamps de estado ──                                           │
│ fechaCreacion    DateTime @default(now())                            │
│ fechaEnvio       DateTime?                                           │
│ fechaAprobacion  DateTime?                                           │
│ fechaVencimiento DateTime?                                           │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ 1
                           │
                           ▼ N
┌──────────────────────────────────────────────────────────────────────┐
│ HistorialCotizacion                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ id              String PK                                            │
│ cotizacionId    String FK→Cotizacion.id (CASCADE)                    │
│ statusAnterior  CotizacionStatus?                                    │
│ statusNuevo     CotizacionStatus                                     │
│ nota            String?                                              │
│ cambiadoPorId   String FK→User.id                                    │
│ fecha           DateTime @default(now())                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Ciclo de Vida de una Cotización

```
                  ┌─────────────────────────────────────────┐
                  │  Portal de Agencias (land-tour-client)  │
                  └─────────────────────────────────────────┘

Colaborador/Admin
 │
 ├─► Crea cotización ──────────────────► BORRADOR
 │                                          │
 │   (edita, ajusta markup, revisa)         │
 │                                          │ enviar al cliente
 │                                          ▼
 │                                       ENVIADA
 │                                          │
 │                                          │ (cliente recibe email
 │                                          │  con link de aprobación)
 │                              ┌───────────┼───────────┐
 │                              ▼           │           ▼
 │                          APROBADA        │       RECHAZADA
 │                              │           │
 │                              │           │
 │                              ▼           │
 │                   ┌──────────────────┐   │
 │                   │  lt-core-admin   │   │
 │                   │  Kevin crea la   │   │
 │                   │  LIQUIDACIÓN     │   │
 │                   └──────────────────┘   │
 │                                          │
 └◄─────────────── nueva cotización ◄───────┘
```

---

## 6. Qué ve cada actor

| Actor | Acceso |
|-------|--------|
| **Colaborador** de agencia A | Ve y crea cotizaciones de agencia A solamente (`WHERE agenciaId = X`) |
| **Admin** de agencia A | Ve cotizaciones + configura Marca Blanca de agencia A |
| **Kevin (SuperAdmin)** | Ve todas las cotizaciones con status `APROBADA` para crear liquidaciones (en lt-core-admin) |

---

## 7. Tablas a agregar en lt-core-admin (para que Kevin vea cotizaciones)

Kevin necesita poder ver las `Cotizacion` con status `APROBADA`. Para eso, hay que agregar al schema de lt-core-admin los modelos `Cliente`, `Cotizacion` e `HistorialCotizacion` (sin las relaciones Prisma hacia los modelos del portal, solo como lectura). Esto se hace en la Fase 2 de la integración.

---

## 8. Campos que necesita el cotizador UI (Antigravity)

El cotizador de 4 pasos debe recopilar:

| Paso | Campos |
|------|--------|
| **1. Datos del Cliente** | nombre*, email, telefono, documento, direccion |
| **2. Seleccionar Paquete** | paqueteId*, fechaViaje*, fechaRetorno |
| **3. Habitaciones** | cantSGL, cantDBL*, cantTPL, cantQUAD, cantCHD — al menos 1 ≥ 1 |
| **4. Resumen** | markup (comisión agencia), notas, vista previa del total |

`*` = obligatorio

**Cálculo correcto del total (reemplazar el `price * multiplier * numAdults`):**
```ts
const subtotal =
  (cantSGL  * (pkg.precioSGL  ?? 0)) +
  (cantDBL  * (pkg.precioDBL  ?? 0)) +
  (cantTPL  * (pkg.precioTPL  ?? 0)) +
  (cantQUAD * (pkg.precioQUAD ?? 0)) +
  (cantCHD  * (pkg.precioCHD  ?? 0));

const total = subtotal + markup;
```

---

## 9. Correcciones de nomenclatura para Antigravity

| Mock actual | Valor correcto |
|-------------|---------------|
| `estado: "Pendiente"` | → `status: "ENVIADA"` |
| `estado: "Borrador"` | → `status: "BORRADOR"` |
| `estado: "Aprobada"` | → `status: "APROBADA"` |
| `estado: "Rechazada"` | → `status: "RECHAZADA"` |
| `pax: "2 Doble"` | → derivar de `cantDBL: 2` |
| `roomMultiplier * price * adultsNum` | → `cant × precioXXX` por tipo |
