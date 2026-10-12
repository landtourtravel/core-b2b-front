// Documento de cotización renderizado como HTML de correo — espejo de
// `CotizacionDetailView.tsx` (la página que ve el asesor), pero con tablas y estilos en línea
// porque los clientes de correo no soportan flex/grid ni clases de Tailwind.
//
// Función pura (sin React, sin I/O): recibe la cotización ya mapeada (`mapCotizacionRow`) y los
// datos de la agencia. El cálculo de precios replica el de la vista y reutiliza los mismos
// helpers de `cotizar-price.ts` — si cambia la lógica de la vista, hay que mantener ambas.

import type { CotizacionStatus } from "@land-tour/shared";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionExtended, HotelCompSnapshot } from "@/app/dashboard/DashboardContext";
import {
  cartesian, combineComboLegs, hotelPerDestinoPrice, type ComboLeg,
} from "@/app/dashboard/cotizar-price";
import { GENERIC_CLIENT_EMAIL } from "@/lib/constants";

export interface CotizacionEmailAgency {
  nombre: string;
  email: string;
  telefono: string;
  descripcion: string;
  logo: string | null;
}

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

const C = {
  primary: "#0b4339",
  secondary: "#28bfa9",
  light: "#f5faf9",
  gold: "#c9a96e",
  line: "#eef2f1",
  muted: "rgba(11,67,57,0.45)",
};

const STATUS_STYLE: Record<CotizacionStatus, { bg: string; fg: string }> = {
  BORRADOR:  { bg: "#f0f9ff", fg: "#0284c7" },
  ENVIADA:   { bg: "#fffbeb", fg: "#d97706" },
  APROBADA:  { bg: "#ecfdf5", fg: "#059669" },
  RECHAZADA: { bg: "#fff1f2", fg: "#e11d48" },
  LIQUIDADA: { bg: "#f5f3ff", fg: "#7c3aed" },
};

// Mismos textos que la vista (y que el modal público de paquete) — una sola fuente de verdad.
const NO_INCLUYE =
  "Servicios, alimentación, entradas, actividades, gastos personales, propinas y cualquier otro concepto que no esté expresamente indicado en “Incluye”.";
const CONDICIONES: string[] = [
  "La cotización no constituye una reserva. Los precios están sujetos a disponibilidad y pueden variar sin previo aviso. Una vez confirmado el servicio, aplicarán las políticas de cambios, cancelaciones y penalidades de los proveedores correspondientes.",
  "Los pagos realizados pueden estar sujetos a condiciones de no reembolso, de acuerdo con las políticas de cada servicio contratado.",
  "LT TOURS actúa como intermediario entre el pasajero/agencia y los proveedores de servicios turísticos.",
];

const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number) => (n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2));
const stars = (n: number) => "★".repeat(Math.max(0, Math.min(n, 5)));

const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "";
  const parts = s.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const toItem = (item: string | { nombre: string; detalle?: string }): { nombre: string; detalle?: string } =>
  typeof item === "string" ? { nombre: item } : item;

const sectionTitle = (t: string) =>
  `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${C.secondary};border-bottom:1px solid ${C.line};padding-bottom:5px;margin:0 0 12px;">${esc(t)}</div>`;

type ComboView = { legs: HotelCompSnapshot[]; adultP: number; childP: number };

export function buildCotizacionEmailHtml(
  cot: CotizacionExtended,
  agency: CotizacionEmailAgency,
  opts: { actualizada?: boolean } = {}
): string {
  const allHotels = cot.hotelsComparison ?? [];
  const hasV4 = allHotels.length > 0 && allHotels[0].adultAccomTotal != null;
  const boletoOculto = allHotels.some((h) => h.boletoPrecioOculto);

  const pasajeros = cot.pasajeros as unknown as Record<string, number>;
  const numNinos = pasajeros?.cantCHD ?? 0;
  const numAdultos = (["SGL", "DBL", "TPL", "QUAD"] as const).reduce(
    (s, t) => s + (pasajeros?.[`cant${t}`] ?? 0) * PAX_BY_TYPE[t], 0);

  const boletoAdultoPerPax = allHotels[0]?.boletoPerPax ?? 0;
  const boletoNinoPerPax = allHotels[0]?.boletoChildPerPax ?? 0;
  const markup = (cot.markup ?? 0) + (cot.ajuste ?? 0);

  const roomTypeEntries = (["SGL", "DBL", "TPL", "QUAD"] as const)
    .map((t) => ({ tipo: t as string, qty: pasajeros?.[`cant${t}`] ?? 0 }))
    .filter((r) => r.qty > 0);
  const hasRoomRates = allHotels.length > 0 && allHotels.every((h) => h.roomRates != null);
  const showRoomTypes = hasRoomRates && roomTypeEntries.length > 0;

  // Hoteles agrupados por destino, el más económico primero.
  const destMap = new Map<number, { destinoId: number; ciudad: string; hotels: HotelCompSnapshot[] }>();
  allHotels.forEach((h) => {
    const id = h.destinoId ?? 0;
    if (!destMap.has(id)) destMap.set(id, { destinoId: id, ciudad: h.destinoCiudad ?? "", hotels: [] });
    destMap.get(id)!.hotels.push(h);
  });
  const destGroups = [...destMap.values()].map((g) => ({
    ...g,
    hotels: [...g.hotels].sort((a, b) => (a.adultColPerPax ?? 0) - (b.adultColPerPax ?? 0)),
  }));
  const ciudadById = new Map(destGroups.map((g) => [g.destinoId, g.ciudad]));
  const hotelCiudad = (h: HotelCompSnapshot) =>
    (h.destinoId != null ? ciudadById.get(h.destinoId) : undefined) ?? h.destinoCiudad ?? "";

  const isMultiDest = destGroups.length > 1;
  const multiHotelDestCount = destGroups.filter((g) => g.hotels.length >= 2).length;
  const useGrouped = hasV4 && destGroups.length > 1 && multiHotelDestCount >= 2;

  const combos: ComboView[] = allHotels.length === 0 ? [] : cartesian(destGroups.map((g) => g.hotels))
    .map((legs) => {
      const comboLegs: ComboLeg[] = legs.map((h) => ({
        adultAccomTotal: h.adultAccomTotal ?? 0,
        adultServicesTotal: h.adultServicesTotal ?? 0,
        childAccomTotal: h.childAccomTotal ?? 0,
        childServicesTotal: h.childServicesTotal ?? 0,
      }));
      const t = combineComboLegs(comboLegs, numAdultos, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup);
      const adultP = hasV4 ? t.precioAdulto : legs.reduce((s, h) => s + (h.pricePerPax ?? 0), 0);
      const childP = hasV4 ? t.precioNino : legs.reduce((s, h) => s + (h.avgChildPerPax ?? 0), 0);
      return { legs, adultP, childP };
    })
    .sort((a, b) => a.adultP - b.adultP);

  const isGenericClient = cot.cliente?.email === GENERIC_CLIENT_EMAIL;
  const adultTipoLabel =
    ({ 1: "SGL", 2: "DBL", 3: "TPL", 4: "QUAD" } as Record<number, string>)[numAdultos] ?? "Adulto";
  const showChild = numNinos > 0;
  const adultColumns = showRoomTypes ? roomTypeEntries : [{ tipo: adultTipoLabel, qty: numAdultos }];

  const pasajerosLabel = `${numAdultos} Adulto${numAdultos !== 1 ? "s" : ""}` +
    (numNinos > 0 ? ` + ${numNinos} Niño${numNinos !== 1 ? "s" : ""}` : "") +
    ` (${numAdultos + numNinos} pax)`;

  const comboRoomPrices = (combo: ComboView) => {
    if (!showRoomTypes) return [{ tipo: adultTipoLabel, price: combo.adultP }];
    const adultServices = combo.legs.reduce((s, h) => s + (h.adultServicesTotal ?? 0), 0);
    const servicesPerAdult = numAdultos > 0 ? adultServices / numAdultos : 0;
    return roomTypeEntries.map(({ tipo }) => {
      const accom = combo.legs.reduce((s, h) => s + (h.roomRates?.[tipo] ?? 0), 0);
      return { tipo, price: accom + servicesPerAdult + boletoAdultoPerPax + markup };
    });
  };

  const hotelRoomPrices = (h: HotelCompSnapshot) => {
    const div = Math.max(1, destGroups.length);
    if (!showRoomTypes) {
      const p = hotelPerDestinoPrice({
        adultColPerPax: h.adultColPerPax ?? 0,
        childAccomTotal: h.childAccomTotal ?? 0,
        childServicesTotal: h.childServicesTotal ?? 0,
        boletoAdultoPerPax, boletoNinoPerPax,
        agencyMarkup: markup, numAdultos, numNinos, numDestinos: div,
      });
      return [{ tipo: adultTipoLabel, price: p.precioAdulto }];
    }
    const servicesPerAdult = numAdultos > 0 ? (h.adultServicesTotal ?? 0) / numAdultos : 0;
    return roomTypeEntries.map(({ tipo }) => ({
      tipo,
      price: (h.roomRates?.[tipo] ?? 0) + servicesPerAdult + (boletoAdultoPerPax + markup) / div,
    }));
  };

  const childTiers = (legs: HotelCompSnapshot[], div: number): { label: string; price: number }[] | null => {
    if (legs.length !== 1) return null;
    const leg = legs[0];
    if (!leg.childAgeUnknown || !leg.childRateTiers) return null;
    if (new Set(leg.childRateTiers.map((t) => t.accomTotal)).size < 2) return null;
    const servicesPerChild = numNinos > 0 ? (leg.childServicesTotal ?? 0) / numNinos : 0;
    return leg.childRateTiers.map((t) => ({
      label: `${t.edadMin}-${t.edadMax} años`,
      price: t.accomTotal + servicesPerChild + (boletoNinoPerPax + markup) / Math.max(1, div),
    }));
  };

  // ─── Fragmentos ────────────────────────────────────────────────────────────
  const statusStyle = STATUS_STYLE[cot.status] ?? STATUS_STYLE.BORRADOR;
  const statusPill = (small = false) =>
    `<span style="display:inline-block;padding:${small ? "2px 8px" : "3px 10px"};background:${statusStyle.bg};color:${statusStyle.fg};border-radius:6px;font-size:${small ? 9 : 10}px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">${esc(COTIZACION_STATUS_LABEL[cot.status])}</span>`;

  const logoImg = agency.logo
    ? `<img src="${esc(agency.logo)}" alt="${esc(agency.nombre)}" width="80" height="32" style="display:block;width:80px;height:32px;object-fit:contain;border:0;" />`
    : `<div style="width:72px;height:30px;background:${C.primary};border-radius:6px;text-align:center;line-height:30px;color:${C.secondary};font-size:10px;font-weight:800;">LTT</div>`;

  const header = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:3px solid ${C.secondary};margin-bottom:24px;">
      <tr>
        <td class="stack" valign="top" style="padding:0 0 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="middle" style="padding-right:12px;">${logoImg}</td>
            <td valign="middle">
              <div style="font-size:15px;font-weight:800;color:${C.primary};">${esc(agency.nombre)}</div>
              <div style="font-size:10px;font-weight:700;color:${C.muted};margin-top:2px;">${esc([agency.email, agency.telefono].filter(Boolean).join(" · "))}</div>
              ${agency.descripcion ? `<div style="font-size:9px;color:rgba(11,67,57,0.4);margin-top:2px;">${esc(agency.descripcion)}</div>` : ""}
            </td>
          </tr></table>
        </td>
        <td class="stack" valign="top" align="right" style="padding:0 0 14px;">
          <div style="font-size:17px;font-weight:800;color:${C.secondary};letter-spacing:3px;">COTIZACIÓN</div>
          <div style="font-size:12px;font-weight:700;color:rgba(40,191,169,0.75);margin-top:2px;">${esc(cot.codigo)}</div>
          <div style="font-size:10px;font-weight:700;color:rgba(11,67,57,0.4);margin-top:2px;">${esc(cot.fechaCreacion)}</div>
          <div style="margin-top:6px;">${statusPill(true)}</div>
        </td>
      </tr>
    </table>`;

  // Servicios incluidos
  const incluyeGrupos = (cot.paqueteIncluyeDestinos ?? []).filter((g) => g.actividades.length > 0 || g.traslados.length > 0);
  const showFlatIncluye = incluyeGrupos.length === 0 && (cot.paqueteIncluye?.length ?? 0) > 0;
  let serviciosHtml = "";
  if (cot.incluyeBoleto || incluyeGrupos.length > 0 || showFlatIncluye) {
    const grupos = incluyeGrupos.map((g) => {
      const items = [...g.traslados.map(toItem), ...g.actividades.map(toItem)];
      return `
        <div style="margin-bottom:12px;">
          <div style="display:inline-block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${C.primary};background:${C.light};padding:3px 8px;border-radius:6px;margin-bottom:6px;">&bull; ${esc(g.destinoCiudad)}</div>
          ${items.map((item) => `
            <div style="font-size:11px;margin-bottom:8px;">
              <div style="font-weight:700;color:${C.primary};"><span style="color:${C.secondary};">✓</span> ${esc(item.nombre)}</div>
              ${item.detalle ? `<div style="margin:4px 0 0 14px;padding-left:9px;border-left:2px solid rgba(40,191,169,0.25);font-size:10px;color:rgba(11,67,57,0.7);line-height:1.6;white-space:pre-line;">${esc(item.detalle)}</div>` : ""}
            </div>`).join("")}
        </div>`;
    }).join("");
    const flat = showFlatIncluye
      ? (cot.paqueteIncluye ?? []).map((i) => `<div style="font-size:11px;font-weight:600;color:${C.primary};margin-bottom:6px;">✓ ${esc(i)}</div>`).join("")
      : "";
    serviciosHtml = `
      ${sectionTitle("Servicios Incluidos")}
      ${cot.incluyeBoleto ? `<div style="margin-bottom:12px;"><span style="display:inline-block;padding:4px 10px;background:rgba(40,191,169,0.12);color:${C.secondary};font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-radius:6px;">✓ Boleto Aéreo Incluido</span></div>` : ""}
      ${grupos}${flat}`;
  }

  const kv = (rows: [string, string][]) => {
    const filled = rows.filter(([, v]) => !!v);
    const cells = filled.map(([l, v]) => `
      <td width="50%" valign="top" style="padding:0 8px 10px 0;">
        <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:rgba(11,67,57,0.4);">${esc(l)}</div>
        <div style="font-size:12px;font-weight:700;color:${C.primary};margin-top:2px;word-break:break-word;">${esc(v)}</div>
      </td>`);
    const trs: string[] = [];
    for (let i = 0; i < cells.length; i += 2) trs.push(`<tr>${cells[i]}${cells[i + 1] ?? "<td></td>"}</tr>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${trs.join("")}</table>`;
  };

  const clientRows: [string, string][] = [
    ["Nombre", cot.cliente?.nombre || ""],
    ["Email", cot.cliente?.email || ""],
    ["Teléfono", cot.cliente?.telefono || ""],
    ["Documento", cot.cliente?.documento || ""],
    ["Dirección", cot.cliente?.direccion || ""],
  ];
  const tripRows: [string, string][] = [
    ["Programa", cot.paqueteNombre || ""],
    ["Destino", cot.paqueteDestino || ""],
    ["Duración", cot.paqueteDuracion || ""],
    ["Salida", fmtDate(cot.fechaViaje)],
    ["Retorno", fmtDate(cot.fechaRetorno)],
    ...(isGenericClient ? [] : [["Pasajeros", pasajerosLabel] as [string, string]]),
  ];

  const datosHtml = `
    ${sectionTitle("Datos Cliente")}${kv(clientRows)}
    <div style="height:10px;"></div>
    ${sectionTitle("Detalles Viaje")}${kv(tripRows)}`;

  const twoCols = (serviciosHtml || datosHtml) ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
      <tr>
        ${serviciosHtml ? `<td class="stack" width="50%" valign="top" style="padding:0 16px 0 0;">${serviciosHtml}</td>` : ""}
        <td class="stack" ${serviciosHtml ? 'width="50%"' : ""} valign="top" style="padding:0;">${datosHtml}</td>
      </tr>
    </table>` : "";

  // Tabla de hoteles / combinaciones
  const th = (label: string, sub = "", right = true) =>
    `<th align="${right ? "right" : "left"}" style="padding:8px 10px;background:rgba(245,250,249,0.7);border-bottom:1.5px solid ${C.line};font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${C.secondary};white-space:nowrap;">${esc(label)}${sub ? `<div style="font-size:7px;text-transform:none;font-weight:600;color:rgba(11,67,57,0.4);">${esc(sub)}</div>` : ""}</th>`;

  const priceTd = (n: number) =>
    `<td align="right" style="padding:10px;border-bottom:1px solid #f6f8f7;font-size:13px;font-weight:800;color:${C.primary};white-space:nowrap;">$${money(n)}</td>`;

  const childTd = (tiers: { label: string; price: number }[] | null, single: number) =>
    `<td align="right" style="padding:10px;border-bottom:1px solid #f6f8f7;white-space:nowrap;">${
      tiers
        ? tiers.map((t) => `<div style="font-size:10px;font-weight:800;color:${C.primary};line-height:1.4;">$${money(t.price)} <span style="font-size:8px;font-weight:700;color:rgba(11,67,57,0.4);">(${esc(t.label)})</span></div>`).join("")
        : `<span style="font-size:13px;font-weight:800;color:${C.primary};">$${money(single)}</span>`
    }</td>`;

  const hotelNameHtml = (h: HotelCompSnapshot, prefixCity: boolean, plus: boolean) => `
    <div style="margin:1px 0;">
      <span style="font-size:11px;font-weight:700;color:${C.primary};">${prefixCity && hotelCiudad(h) ? esc(hotelCiudad(h)) + " — " : ""}${esc(h.nombre)}</span>
      <span style="font-size:9px;color:${C.gold};">${stars(h.estrellas)}</span>
      ${plus ? `<span style="font-size:10px;font-weight:800;color:${C.secondary};"> +</span>` : ""}
      ${showChild && h.sinTarifaNino ? `<span style="font-size:8px;font-weight:800;color:#d97706;text-transform:uppercase;"> Sin tarifa niño</span>` : ""}
    </div>`;

  let hotelesHtml = "";
  if (combos.length > 0) {
    const colSpan = 1 + adultColumns.length + (showChild ? 1 : 0);
    const head = `<tr>
      ${th(useGrouped ? "Hotel" : "Hotel a elegir", "", false)}
      ${adultColumns.map((c) => th(c.tipo, showRoomTypes ? `${c.qty} hab.` : "")).join("")}
      ${showChild ? th("Niño") : ""}
    </tr>`;

    let body = "";
    if (useGrouped) {
      for (const g of destGroups) {
        body += `<tr><td colspan="${colSpan}" style="padding:10px 10px 4px;background:rgba(245,250,249,0.5);border-bottom:1px solid ${C.line};font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${C.secondary};">${esc(g.ciudad)}</td></tr>`;
        for (const h of g.hotels) {
          const childP = hotelPerDestinoPrice({
            adultColPerPax: h.adultColPerPax ?? 0,
            childAccomTotal: h.childAccomTotal ?? 0,
            childServicesTotal: h.childServicesTotal ?? 0,
            boletoAdultoPerPax, boletoNinoPerPax, agencyMarkup: markup,
            numAdultos, numNinos, numDestinos: destGroups.length,
          }).precioNino;
          body += `<tr>
            <td style="padding:10px;border-bottom:1px solid #f6f8f7;border-right:1px solid ${C.line};">${hotelNameHtml(h, false, false)}</td>
            ${hotelRoomPrices(h).map((r) => priceTd(r.price)).join("")}
            ${showChild ? childTd(childTiers([h], destGroups.length), childP) : ""}
          </tr>`;
        }
      }
    } else {
      for (const combo of combos) {
        body += `<tr>
          <td style="padding:10px;border-bottom:1px solid #f6f8f7;border-right:1px solid ${C.line};">
            ${combo.legs.map((h, i) => hotelNameHtml(h, isMultiDest, i < combo.legs.length - 1)).join("")}
          </td>
          ${comboRoomPrices(combo).map((r) => priceTd(r.price)).join("")}
          ${showChild ? childTd(childTiers(combo.legs, 1), combo.childP) : ""}
        </tr>`;
      }
    }

    const notaPie =
      (boletoOculto ? "El boleto aéreo va incluido en el precio." : "") +
      (showChild && allHotels.some((h) => h.childAgeUnknown && (h.childRateTiers?.length ?? 0) > 1)
        ? " El precio de niño varía según su edad — se muestran todas las tarifas configuradas por rango de edad."
        : "");

    hotelesHtml = `
      <div style="margin-bottom:22px;">
        ${(useGrouped || combos.length <= 1) ? sectionTitle(useGrouped ? "Hoteles por Destino" : "Alojamiento") : ""}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden;">
          ${head}${body}
        </table>
        ${notaPie ? `<div style="font-size:9px;color:rgba(11,67,57,0.45);margin-top:10px;line-height:1.6;">${esc(notaPie.trim())}</div>` : ""}
      </div>`;
  }

  const notasHtml = cot.notas
    ? `<div style="margin-bottom:22px;">${sectionTitle("Notas")}<div style="font-size:11px;font-weight:600;color:rgba(11,67,57,0.7);line-height:1.6;white-space:pre-wrap;">${esc(cot.notas)}</div></div>`
    : "";

  const terminosHtml = `
    <div style="margin-bottom:22px;">
      ${sectionTitle("Términos y Condiciones")}
      <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:rgba(11,67,57,0.7);margin-bottom:3px;">No incluye</div>
      <div style="font-size:9px;color:rgba(11,67,57,0.55);line-height:1.6;margin-bottom:10px;">${esc(NO_INCLUYE)}</div>
      <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:rgba(11,67,57,0.7);margin-bottom:3px;">💼 Condiciones</div>
      ${CONDICIONES.map((t) => `<div style="font-size:9px;color:rgba(11,67,57,0.55);line-height:1.6;margin-bottom:4px;">&bull; ${esc(t)}</div>`).join("")}
    </div>`;

  const footerBadge = agency.logo
    ? `<img src="${esc(agency.logo)}" alt="${esc(agency.nombre)}" width="52" height="52" style="display:block;width:52px;height:52px;border-radius:26px;object-fit:cover;border:1px solid ${C.line};" />`
    : `<div style="width:52px;height:52px;border-radius:26px;background:${C.primary};color:${C.secondary};font-size:8px;font-weight:800;text-align:center;line-height:1.2;"><div style="padding-top:19px;">COTIZACIÓN</div></div>`;

  const footer = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
      <tr>
        <td valign="bottom" style="padding-top:14px;font-size:10px;font-weight:700;color:rgba(11,67,57,0.6);line-height:1.8;">
          Preparado por: <strong>${esc(agency.nombre)}</strong><br />
          ${esc([agency.telefono, cot.fechaCreacion].filter(Boolean).join(" · "))}
        </td>
        <td align="right" valign="bottom" style="padding-top:14px;">${footerBadge}</td>
      </tr>
    </table>`;

  const aviso = opts.actualizada ? "Cotización actualizada" : "Nueva cotización guardada";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Cotización ${esc(cot.codigo)}</title>
  <style>
    @media only screen and (max-width:620px) {
      .stack { display:block !important; width:100% !important; padding-right:0 !important; padding-bottom:14px !important; text-align:left !important; }
      .card { padding:20px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.light};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.light};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;">
        <tr><td align="center" style="padding:0 0 14px;">
          <span style="display:inline-block;padding:6px 16px;background:#edf7f5;border-radius:100px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${C.secondary};">&#10022; ${esc(aviso)}</span>
          <div style="font-size:12px;color:#6b7280;margin-top:8px;">${esc(agency.nombre)} · ${esc(cot.codigo)}</div>
        </td></tr>
        <tr><td class="card" style="background:#ffffff;border:1px solid #e5eceb;border-radius:16px;padding:32px 36px;color:${C.primary};">
          ${header}
          ${twoCols}
          ${hotelesHtml}
          ${notasHtml}
          ${terminosHtml}
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
