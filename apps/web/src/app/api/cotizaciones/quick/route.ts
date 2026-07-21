// apps/web/src/app/api/cotizaciones/quick/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { logError } from "@/lib/logger";
import { paqueteInclude, mapPaqueteRow } from "@/lib/cotizar-paquete-mapper";
import {
  calcHotelBreakdown,
  cartesian,
  combineComboLegs,
  numPaxToTipoPax,
  PAX_BY_TYPE,
  type ComboLeg,
} from "@/app/dashboard/cotizar-price";
import type { HotelCompSnapshot } from "@/app/dashboard/DashboardContext";

const r2 = (n: number) => Math.round(n * 100) / 100;
const GENERIC_CLIENT_EMAIL = "cliente.potencial@landtourtravel.com";
const GENERIC_CLIENT_NAME = "Cliente Potencial";

function generateCodigo(agenciaId: string, userId: string, seq: number): string {
  const agCod  = agenciaId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const usrCod = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `${agCod}-${usrCod}-${String(seq).padStart(4, "0")}`;
}

// `count()` de filas restantes no sirve de base para la secuencia: si se borró alguna
// cotización, el conteo baja por debajo del máximo ya usado y el próximo código choca con
// uno que todavía existe (P2002 en `codigo`, @unique). Se toma el máximo sufijo numérico
// realmente usado por esa agencia+usuario (mismo fix que POST /api/cotizaciones).
async function nextCodigoSeq(agenciaId: string, creadoPorId: string): Promise<number> {
  const last = await prisma.cotizacion.findFirst({
    where: { agenciaId, creadoPorId },
    orderBy: { codigo: "desc" },
    select: { codigo: true },
  });
  const lastSeq = last ? parseInt(last.codigo.slice(-4), 10) || 0 : 0;
  return lastSeq + 1;
}

// POST /api/cotizaciones/quick — genera una Cotización BORRADOR al instante,
// sin pasar por el wizard, con cliente genérico y TODOS los hoteles del paquete
// (con o sin tarifa CHD — nunca bloquea; ver spec 2026-07-11 sección 4.3).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const paqueteId = Number(body?.paqueteId);
  const numPax = Number(body?.numPax);
  const numNinos = Number(body?.numNinos);

  if (!Number.isInteger(paqueteId) || paqueteId <= 0) {
    return NextResponse.json({ error: "paqueteId inválido" }, { status: 400 });
  }
  if (!Number.isInteger(numNinos) || numNinos < 0 || numNinos > 10) {
    return NextResponse.json({ error: "Número de niños inválido" }, { status: 400 });
  }
  const tipoPax = numPaxToTipoPax(numPax);
  if (!tipoPax) {
    return NextResponse.json({ error: "Cantidad de adultos no soportada (máximo 4)" }, { status: 400 });
  }

  const agenciaId   = session.user.agenciaId;
  const creadoPorId = (session.user as any).id as string;

  try {
    const paqueteRow = await prisma.paqueteRef.findUnique({ where: { id: paqueteId }, include: paqueteInclude });
    if (!paqueteRow || !paqueteRow.visibleEnFront) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
    }
    const paquete = mapPaqueteRow(paqueteRow);
    if (paquete.hoteles.length === 0) {
      return NextResponse.json({ error: "El paquete no tiene hoteles configurados" }, { status: 400 });
    }

    // ── Cliente genérico fijo — se reutiliza entre cotizaciones rápidas de la agencia ──
    let cliente = await prisma.cliente.findUnique({
      where: { agenciaId_email: { agenciaId, email: GENERIC_CLIENT_EMAIL } },
    });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: { agenciaId, nombre: GENERIC_CLIENT_NAME, email: GENERIC_CLIENT_EMAIL },
      });
    }

    // ── Precio: mismo motor que el wizard (calcHotelBreakdown + cartesian + combineComboLegs),
    // SIN filtrar hoteles por elegibilidad de niños — un paquete puede cotizarse solo para
    // adultos; los hoteles sin tarifa CHD se incluyen con costo de niño = $0 (ver sinTarifaNino).
    const ninosEdades = Array(numNinos).fill(5);
    const flightActive = paquete.incluyeBoleto;
    const boletoAdultoPerPax = flightActive ? (paquete.precioBoleto ?? 0) : 0;
    const boletoNinoPerPax   = flightActive ? (paquete.precioBoletoNino ?? paquete.precioBoleto ?? 0) : 0;
    // Piso de comisión fijado por el admin en el paquete — igual que en el wizard, la
    // cotización rápida nunca puede quedar por debajo (no hay input manual aquí, así que
    // se usa directo, sin posibilidad de que el asesor la suba desde este endpoint).
    const markup = paquete.ajustePrecio ?? 0;

    const breakdowns = paquete.hoteles.map((hotel) => ({
      hotel,
      hasChd: hotel.tarifas.some((t) => t.tipoHabitacion === "CHD"),
      bd: calcHotelBreakdown(
        hotel, tipoPax, ninosEdades, numPax,
        paquete.actividades.filter((a) => a.destinoId === hotel.destinoId),
        paquete.traslados.filter((t) => t.destinoId === hotel.destinoId),
        flightActive, boletoAdultoPerPax, 0, hotel.noches, boletoNinoPerPax,
      ),
    }));

    const byDestino = new Map<number, typeof breakdowns>();
    breakdowns.forEach((row) => {
      const arr = byDestino.get(row.hotel.destinoId) ?? [];
      arr.push(row);
      byDestino.set(row.hotel.destinoId, arr);
    });

    const groups = [...byDestino.values()];
    const combos = cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map(({ bd }) => ({
        adultAccomTotal: bd.adultAccomTotal, adultServicesTotal: bd.adultServicesTotal,
        childAccomTotal: bd.childAccomTotal, childServicesTotal: bd.childServicesTotal,
      }));
      return { legs, totals: combineComboLegs(comboLegs, numPax, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup) };
    });
    const repCombo = combos.reduce((min, c) => (c.totals.total < min.totals.total ? c : min));

    const subtotal    = r2(repCombo.totals.subtotal);
    const boletoTotal = r2(repCombo.totals.boletoAdultoTotal + repCombo.totals.boletoChildTotal);
    const total       = r2(repCombo.totals.total);
    const precioAdulto = numPax   > 0 ? (repCombo.totals.adultAccom + repCombo.totals.adultServices) / numPax   : 0;
    const precioChd    = numNinos > 0 ? (repCombo.totals.childAccom + repCombo.totals.childServices) / numNinos : 0;

    const hotelsComparison: HotelCompSnapshot[] = breakdowns.map(({ hotel, bd, hasChd }) => ({
      hotelId:            hotel.id,
      nombre:             hotel.nombre,
      estrellas:          hotel.estrellas,
      destinoId:          hotel.destinoId,
      destinoCiudad:      hotel.destinoCiudad,
      destinoPais:        paquete.destinos.find((d) => d.id === hotel.destinoId)?.pais ?? "",
      tipoPax,
      adultColPerPax:     r2(bd.adultColPerPax),
      boletoPerPax:       r2(bd.boletoPerPax),
      accomTotal:         r2(bd.stopTotal),
      sharedTotal:        r2(bd.sharedTotal),
      adultAccomTotal:    r2(bd.adultAccomTotal),
      adultServicesTotal: r2(bd.adultServicesTotal),
      childAccomTotal:    r2(bd.childAccomTotal),
      childServicesTotal: r2(bd.childServicesTotal),
      boletoChildPerPax:  r2(bd.boletoChildPerPax),
      boletoPrecioOculto: !paquete.visibleBoleto,
      pricePerPax:        r2(bd.pricePerPax),
      avgChildPerPax:     bd.childSupplementPerAdult > 0 ? r2(bd.childSupplementPerAdult) : null,
      total:              r2(bd.total),
      sinTarifaNino:      numNinos > 0 && !hasChd,
    }));

    // ── Fechas por defecto: hoy + 30 días, retorno = salida + diasEstancia ──
    const fechaSalida = new Date();
    fechaSalida.setDate(fechaSalida.getDate() + 30);
    const fechaRetorno = new Date(fechaSalida);
    fechaRetorno.setDate(fechaRetorno.getDate() + paquete.diasEstancia);

    const destinosLabel = paquete.destinos.length > 1
      ? paquete.destinos.map((d) => d.ciudad).join(" + ")
      : `${paquete.destinoCiudad}, ${paquete.destinoPais}`;
    const paqueteIncluye = [
      ...paquete.actividades.map((a) => a.nombre),
      ...paquete.traslados.map((t) => t.tipo),
    ];

    const habitaciones = [
      { tipoPax, cantidad: 1, precioPorPersona: r2(precioAdulto) },
      ...(numNinos > 0 ? [{ tipoPax: "CHD", cantidad: numNinos, precioPorPersona: r2(precioChd) }] : []),
    ].map((h) => {
      const px = PAX_BY_TYPE[h.tipoPax] ?? 1;
      const precioUnitario = r2(h.precioPorPersona * px);
      return {
        tipoPax: h.tipoPax, numPax: px, cantidad: h.cantidad,
        precioPorPersona: h.precioPorPersona, precioUnitario,
        subtotal: r2(precioUnitario * h.cantidad),
      };
    });

    // Estado crudo del wizard — permite reabrir esta cotización rápida en el cotizador
    // con el paquete y los hoteles ya seleccionados (mismo shape que el wizard normal).
    const wizardState = {
      clientName: cliente.nombre,
      clientEmail: cliente.email ?? "",
      clientPhone: "", clientId: "", clientAddress: "",
      cotMode: "catalogo" as const,
      cotSelectedPkgId: paquete.id,
      cotSelectedDestinoId: null,
      cotSelectedHotelIds: paquete.hoteles.map((h) => h.id),
      cotHabs: {},
      cotFechaSalida: fechaSalida.toISOString().slice(0, 10),
      cotCustomDias: paquete.diasEstancia,
      cotExtraNightsByDestino: {},
      cotFlightOverride: null,
      cotFlightPrice: 0,
      cotFlightPriceChild: 0,
      cotLibreFlightDesc: "",
      cotLibreActSel: {},
      cotLibreTrsSel: {},
      cotNumPersonas: numPax,
      cotNumNinos: numNinos,
      cotNinosEdades: ninosEdades,
      cotFromQuickQuote: true,
    };

    let seq = await nextCodigoSeq(agenciaId, creadoPorId);
    // Reintento acotado ante choque de `codigo` (P2002) — misma lógica que POST /api/cotizaciones.
    for (let attempt = 0; attempt < 3; attempt++) {
      const codigo = generateCodigo(agenciaId, creadoPorId, seq);
      try {
        const cotizacion = await prisma.cotizacion.create({
          data: {
            codigo, agenciaId, creadoPorId,
            clienteId: cliente.id,
            paqueteId: paquete.id,
            snapshotNombre:   paquete.nombre.slice(0, 200),
            snapshotDestino:  destinosLabel.slice(0, 200),
            snapshotDuracion: `${paquete.diasEstancia} Días / ${paquete.nochesBase} Noches`.slice(0, 100),
            snapshotIncluye:  paqueteIncluye,
            hotelsComparisonSnapshot: hotelsComparison as unknown as Prisma.InputJsonValue,
            wizardState: wizardState as unknown as Prisma.InputJsonValue,
            incluyeBoleto: flightActive,
            precioBoleto:  flightActive ? (paquete.precioBoleto ?? null) : null,
            boletoTotal,
            subtotal, markup, total,
            fechaViaje: fechaSalida,
            fechaRetorno,
            status: "BORRADOR",
            detalles: { create: habitaciones },
          },
        });

        return NextResponse.json({ id: cotizacion.id }, { status: 201 });
      } catch (err) {
        const isCodigoClash = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
        if (!isCodigoClash || attempt === 2) throw err;
        seq += 1;
      }
    }
    throw new Error("No se pudo generar un código único");
  } catch (err) {
    logError("POST /api/cotizaciones/quick", err);
    return NextResponse.json({ error: "Error al generar la cotización rápida" }, { status: 500 });
  }
}
