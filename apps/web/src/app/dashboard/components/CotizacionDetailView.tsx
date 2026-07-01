"use client";
import React, { useState, useMemo } from "react";
import {
  ArrowLeft, User, Globe, MapPin, FileText, Calendar, Plane,
  Building2, CheckCircle2, Printer, X,
} from "lucide-react";
import { COTIZACION_STATUS_LABEL, resumenPasajeros } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard, type CotizacionExtended, type HotelCompSnapshot } from "../DashboardContext";

/**
 * Combines the selected hotels into one package total without double-counting the
 * shared cost (services + boleto + markup). v3 snapshots carry `accomTotal` (this
 * hotel's accommodation) and `sharedTotal` (the package-wide shared cost, identical
 * for every hotel): total = Σ accomTotal + sharedTotal (once). Falls back to summing
 * `total` for legacy v1/v2 snapshots that lack those fields.
 */
function combineHotels(selHotels: HotelCompSnapshot[]): number {
  if (selHotels.length === 0) return 0;
  const hasV3 = selHotels[0].accomTotal != null && selHotels[0].sharedTotal != null;
  if (!hasV3) return selHotels.reduce((s, h) => s + h.total, 0);
  const accom = selHotels.reduce((s, h) => s + (h.accomTotal ?? 0), 0);
  return accom + (selHotels[0].sharedTotal ?? 0);
}

const STATUS_BADGE: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-50 text-sky-600",
  ENVIADA:   "bg-amber-50 text-amber-600",
  APROBADA:  "bg-emerald-50 text-emerald-600",
  RECHAZADA: "bg-rose-50 text-rose-600",
};
const STATUS_DOT: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-500",
  ENVIADA:   "bg-amber-500",
  APROBADA:  "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
};

const TERMINOS = `Los precios indicados son por persona en la categoría de habitación seleccionada y están sujetos a disponibilidad hotelera al momento de la reserva. Land Tour Travel actúa como operador mayorista; la agencia minorista es responsable de la relación comercial con el cliente final. El pago del depósito de reserva (40% del total) es obligatorio para confirmar los servicios. Cancelaciones con menos de 15 días de anticipación están sujetas a penalidades del 50%. Los vuelos, cuando son incluidos, están sujetos a las políticas de la aerolínea operadora. El pasajero es responsable de contar con documentación vigente (pasaporte, visa si aplica).`;

/** Converts "YYYY-MM-DD" → "DD/MM/YYYY". Returns the original string for other formats. */
const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "";
  const parts = s.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

interface Props {
  cotId: string;
  onBack: () => void;
}

export default function CotizacionDetailView({ cotId, onBack }: Props) {
  const {
    cotizaciones, setCotizaciones,
    agencyName, agencyPhone, agencyAddress, agencyLogo,
  } = useDashboard();

  const cot = cotizaciones.find((c) => c.id === cotId) as CotizacionExtended | undefined;

  const allHotels     = cot?.hotelsComparison ?? [];
  const isV2Snapshot  = allHotels.length > 0 && allHotels[0].destinoId !== undefined;
  const hasKids       = allHotels.some((h) => (h.avgChildPerPax ?? 0) > 0);
  const hasBoleto     = allHotels.some((h) => (h.boletoPerPax  ?? 0) > 0);
  const tipoPaxLabel  = allHotels[0]?.tipoPax ?? "Aloj.";

  // Group hotels by destino (v2)
  const destMap = useMemo(() => {
    const m = new Map<number, { ciudad: string; pais: string; hotels: typeof allHotels }>();
    allHotels.forEach((h) => {
      const dId = h.destinoId ?? 0;
      if (!m.has(dId)) m.set(dId, { ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
      m.get(dId)!.hotels.push(h);
    });
    return m;
  }, [allHotels]);
  const destiEntries = [...destMap.entries()];
  const isMultiDest  = destiEntries.length > 1;

  // Selection state: destinoId → hotelId (multi-destino aware)
  const buildInitialSel = () => {
    const init: Record<number, number> = {};
    if (!cot) return init;
    allHotels.forEach((h) => {
      if (h.selected && h.destinoId != null) init[h.destinoId] = h.hotelId;
    });
    if (Object.keys(init).length === 0 && cot.selectedHotelId != null) {
      const ph = allHotels.find((h) => h.hotelId === cot.selectedHotelId);
      if (ph) init[ph.destinoId ?? 0] = ph.hotelId;
    }
    return init;
  };
  const [selByDestino, setSelByDestino] = useState<Record<number, number>>(buildInitialSel);
  const [isApproving, setIsApproving] = useState(false);

  if (!cot) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm font-bold text-primary/40">Cotización no encontrada.</p>
      </div>
    );
  }

  const hasComparison = allHotels.length > 0;
  const isApproved    = cot.status === "APROBADA";
  const isRejected    = cot.status === "RECHAZADA";
  const canAct        = cot.status === "BORRADOR" || cot.status === "ENVIADA";
  const allDestinosSelected = destiEntries.length === 0 ||
    destiEntries.every(([dId]) => selByDestino[dId] !== undefined);
  const canApprove    = canAct && (!hasComparison || allDestinosSelected);

  // Primary active hotel (first selected)
  const primarySelectedId = Object.values(selByDestino)[0] ?? null;
  const activeHotelId = isApproved
    ? (allHotels.find((h) => h.selected)?.hotelId ?? cot.selectedHotelId ?? primarySelectedId)
    : primarySelectedId;
  const activeHotel = allHotels.find((h) => h.hotelId === activeHotelId) ?? null;

  // Hotels to display in print: selected (approved) or all (borrador)
  const hotelsForPrint = isApproved
    ? (allHotels.some((h) => h.selected) ? allHotels.filter((h) => h.selected) : (activeHotel ? [activeHotel] : allHotels))
    : allHotels;

  // ─── Approve ──────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!canApprove || isApproving) return;
    setIsApproving(true);

    const selIds  = Object.values(selByDestino);
    const primaryId = selIds[0] ?? null;
    const selHotels = selIds
      .map((hId) => allHotels.find((h) => h.hotelId === hId))
      .filter(Boolean) as typeof allHotels;
    // Combina sin duplicar servicios/boleto/markup: Σ alojamiento + sharedTotal (una vez).
    const combined = combineHotels(selHotels);
    const names    = selHotels.map((h) => h.nombre).join(", ");

    setCotizaciones((prev) =>
      prev.map((c) => {
        if (c.id !== cotId) return c;
        const updatedComparison = c.hotelsComparison?.map((h) => ({
          ...h,
          selected: selIds.includes(h.hotelId),
        }));
        return {
          ...c,
          status:    "APROBADA" as CotizacionStatus,
          total:     combined,
          ...(primaryId != null ? { selectedHotelId: primaryId } : {}),
          ...(updatedComparison ? { hotelsComparison: updatedComparison } : {}),
        };
      })
    );

    try {
      await fetch(`/api/cotizaciones/${cotId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APROBADA",
          ...(primaryId != null ? { selectedHotelId: primaryId } : {}),
          ...(selIds.length > 1 ? { selectedHotelIds: selIds } : {}),
          total: Math.round(combined * 100) / 100,
          nota: selHotels.length > 0 ? `Hotel(es) seleccionado(s): ${names}` : undefined,
        }),
      });
    } catch {}

    setIsApproving(false);
  };

  // ─── Print (adapts handlePrintPreview to use stored cotización data) ──
  const handlePrint = () => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fmt = (n: number) => (n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2));
    const today = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });

    const tipos = ["SGL", "DBL", "TPL", "QUAD", "CHD"] as const;
    const typeLabelMap: Record<string, string> = {
      SGL: "Sencilla", DBL: "Doble", TPL: "Triple", QUAD: "Cuádruple", CHD: "Niño (2-11)",
    };
    const rooms = tipos
      .map((t) => ({
        t,
        qty:    (cot.pasajeros as any)[`cant${t}`]  as number ?? 0,
        precio: (cot.precios   as any)[`precio${t}`] as number ?? 0,
      }))
      .filter((r) => r.qty > 0);

    const logoHTML = agencyLogo
      ? `<img src="${agencyLogo}" alt="${esc(agencyName)}" style="width:80px;height:32px;object-fit:contain;" />`
      : `<div style="width:72px;height:30px;background:#0B4339;border-radius:5px;display:flex;align-items:center;justify-content:center;"><span style="color:#28BFA9;font-size:10px;font-weight:900;">LTT</span></div>`;

    // Build hotel comparison section (v2: multi-destino columnar; v1: simple table)
    let hotelTableHTML = "";
    if (hotelsForPrint.length > 0) {
      if (isV2Snapshot) {
        const pDMap = new Map<number, { ciudad: string; pais: string; hotels: typeof hotelsForPrint }>();
        hotelsForPrint.forEach((h) => {
          const dId = h.destinoId ?? 0;
          if (!pDMap.has(dId)) pDMap.set(dId, { ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
          pDMap.get(dId)!.hotels.push(h);
        });
        const pEntries = [...pDMap.entries()];
        const pMulti = pEntries.length > 1;
        const pTip = hotelsForPrint[0]?.tipoPax ?? "Aloj.";

        const groupsHTML = pEntries.map(([, { ciudad, pais, hotels: dHotels }]) => {
          const dShowChd = dHotels.some((h) => (h.avgChildPerPax ?? 0) > 0);
          const dShowBol = dHotels.some((h) => (h.boletoPerPax  ?? 0) > 0);
          const colCount   = dHotels.length;
          const conceptPct = Math.max(30, 100 - colCount * 22);
          const colPct     = Math.floor((100 - conceptPct) / colCount);

          const hdrs = dHotels.map((h) =>
            `<th class="right" style="width:${colPct}%;word-break:break-word">` +
            `<span style="font-weight:900;font-size:10px">${esc(h.nombre)}</span><br>` +
            `<span class="amber" style="font-size:9px">${"★".repeat(Math.min(h.estrellas, 5))}</span></th>`
          ).join("");

          const alojCells = dHotels.map((h) => {
            const p = h.adultColPerPax != null ? h.adultColPerPax : h.pricePerPax;
            return `<td class="right bold">$${fmt(p)}/pax</td>`;
          }).join("");

          const chdCells = dHotels.map((h) =>
            `<td class="right">${(h.avgChildPerPax ?? 0) > 0 ? "+$" + fmt(h.avgChildPerPax!) + "/pax" : "—"}</td>`
          ).join("");

          const bolCells = dHotels.map((h) =>
            `<td class="right">${(h.boletoPerPax ?? 0) > 0 ? "$" + fmt(h.boletoPerPax!) + "/pax" : "—"}</td>`
          ).join("");

          const totalCells = dHotels.map((h) =>
            `<td class="right green bold" style="font-size:13px">$${fmt(h.pricePerPax)}</td>`
          ).join("");

          return (
            `<div class="dest-group">` +
            (pMulti ? `<div class="dest-label">${esc(ciudad)}${pais ? ", " + esc(pais) : ""}</div>` : "") +
            `<table class="hotel-comp-table"><thead><tr>` +
            `<th style="width:${conceptPct}%;text-align:left">Concepto</th>${hdrs}` +
            `</tr></thead><tbody>` +
            `<tr><td style="font-size:9px;line-height:1.5">Alojamiento ${esc(pTip)}<br>` +
            `<span style="opacity:.45;font-size:8px;font-weight:400">(hab. + act. + traslados)</span></td>${alojCells}</tr>` +
            (dShowChd ? `<tr><td style="font-size:9px">Suplemento menores <span style="opacity:.45;font-size:8px;font-weight:400">(/adulto)</span></td>${chdCells}</tr>` : "") +
            (dShowBol ? `<tr><td style="font-size:9px">&#9992; Boleto aéreo</td>${bolCells}</tr>` : "") +
            `<tr class="total-row"><td class="green" style="font-size:10px;text-transform:uppercase;` +
            `letter-spacing:1px;font-weight:900">PRECIO / PERSONA *</td>${totalCells}</tr>` +
            `</tbody></table></div>`
          );
        }).join("");

        hotelTableHTML = `
      <div class="section">
        <div class="section-title">${isApproved ? "Hotel(es) Seleccionado(s)" : "Comparativa de Alojamiento"}</div>
        ${groupsHTML}
      </div>`;
      } else {
        // v1 backward compat
        hotelTableHTML = `
      <div class="section">
        <div class="section-title">${isApproved ? "Hotel Seleccionado" : "Opciones de Alojamiento"}</div>
        <table>
          <thead><tr><th>Hotel</th><th class="center">★</th><th class="right">Precio/pax</th><th class="right">Total</th></tr></thead>
          <tbody>
            ${hotelsForPrint.map((h) => `<tr>
              <td class="bold">${esc(h.nombre)}</td>
              <td class="center amber">${"★".repeat(h.estrellas)}</td>
              <td class="right">$${fmt(h.pricePerPax)}</td>
              <td class="right bold">$${fmt(h.total)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
      }
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Proforma ${esc(cot.codigo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
@page{margin:15mm 20mm;size:A4 portrait;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Montserrat',Arial,sans-serif;font-size:11px;color:#0B4339;background:#fff;line-height:1.5;}
.toolbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0B4339;color:white;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;font-size:12px;font-weight:700;}
.toolbar button{padding:6px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;margin-left:6px;}
.btn-print{background:#28BFA9;color:#0B4339;}
.btn-close{background:transparent;color:white;border:1px solid rgba(255,255,255,0.3)!important;}
.page{max-width:800px;margin:60px auto 40px;padding:32px;background:white;}
@media print{.toolbar{display:none!important;}.page{margin:0;padding:0;max-width:none;}}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #28BFA9;}
.header-left{display:flex;align-items:center;gap:12px;}
.agency-name{font-size:14px;font-weight:900;color:#0B4339;}
.agency-contact{font-size:9px;color:#0B4339;opacity:.6;margin-top:2px;}
.header-right{text-align:right;}
.proforma-title{font-size:20px;font-weight:900;color:#0B4339;letter-spacing:3px;}
.proforma-code{font-size:11px;font-weight:700;color:#28BFA9;margin-top:3px;}
.proforma-date{font-size:9px;color:#0B4339;opacity:.5;margin-top:2px;}
.section{margin-bottom:20px;}
.section-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#28BFA9;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #EDF7F5;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;}
.field label{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;color:#0B4339;opacity:.4;display:block;}
.field span{font-size:11px;font-weight:700;color:#0B4339;}
table{width:100%;border-collapse:collapse;}
th{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;color:#0B4339;opacity:.5;padding:6px 8px 6px 0;border-bottom:1px solid #EDF7F5;}
td{font-size:11px;font-weight:600;color:#0B4339;padding:7px 8px 7px 0;border-bottom:1px solid #F5FAF9;}
.right{text-align:right;padding-right:0;}
.center{text-align:center;}
.amber{color:#C9A96E;}
.bold{font-weight:900;}
.green{color:#28BFA9;}
.total-row td{border-top:2px solid #28BFA9;border-bottom:none;font-weight:900;font-size:13px;padding-top:10px;}
.includes-list{display:flex;flex-wrap:wrap;gap:6px;}
.include-tag{background:#EDF7F5;color:#0B4339;font-size:9px;font-weight:700;padding:3px 8px;border-radius:5px;border:1px solid #28BFA9;opacity:.8;}
.terms-text{font-size:8px;color:#0B4339;opacity:.5;line-height:1.6;}
.footer{margin-top:24px;padding-top:12px;border-top:1px solid #EDF7F5;display:flex;justify-content:space-between;align-items:flex-end;}
.footer-left{font-size:9px;font-weight:700;color:#0B4339;opacity:.6;line-height:1.8;}
.footer-seal{width:52px;height:52px;border-radius:50%;background:#0B4339;color:#28BFA9;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;text-align:center;line-height:1.4;flex-shrink:0;}
.hotel-comp-table{width:100%;border-collapse:collapse;}
.dest-group{margin-bottom:12px;}
.dest-label{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#0B4339;opacity:.45;margin-bottom:4px;}
</style>
</head>
<body>
<div class="toolbar">
  <span>Proforma · ${esc(cot.codigo)}</span>
  <div>
    <button class="btn-print" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  </div>
</div>
<div class="page">
  <div class="header">
    <div class="header-left">
      ${logoHTML}
      <div>
        <div class="agency-name">${esc(agencyName)}</div>
        <div class="agency-contact">${esc(agencyPhone)}${agencyAddress ? " · " + esc(agencyAddress) : ""}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="proforma-title">PROFORMA</div>
      <div class="proforma-code">${esc(cot.codigo)}</div>
      <div class="proforma-date">${today}</div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Datos del Cliente</div>
    <div class="grid-2">
      <div class="field"><label>Nombre</label><span>${esc(cot.cliente?.nombre || "—")}</span></div>
      <div class="field"><label>Email</label><span>${esc(cot.cliente?.email || "—")}</span></div>
      ${cot.cliente?.telefono ? `<div class="field"><label>Teléfono</label><span>${esc(cot.cliente.telefono)}</span></div>` : ""}
      ${cot.cliente?.documento ? `<div class="field"><label>Documento</label><span>${esc(cot.cliente.documento)}</span></div>` : ""}
      ${cot.cliente?.direccion ? `<div class="field" style="grid-column:1/-1"><label>Dirección</label><span>${esc(cot.cliente.direccion)}</span></div>` : ""}
    </div>
  </div>
  <div class="section">
    <div class="section-title">Detalles del Viaje</div>
    <div class="grid-2">
      <div class="field"><label>Programa</label><span>${esc(cot.paqueteNombre || "—")}</span></div>
      <div class="field"><label>Destino</label><span>${esc(cot.paqueteDestino || "—")}</span></div>
      <div class="field"><label>Duración</label><span>${esc(cot.paqueteDuracion || "—")}</span></div>
      ${cot.fechaViaje ? `<div class="field"><label>Salida</label><span>${esc(fmtDate(cot.fechaViaje))}</span></div>` : ""}
      ${cot.fechaRetorno ? `<div class="field"><label>Retorno</label><span>${esc(fmtDate(cot.fechaRetorno))}</span></div>` : ""}
      <div class="field"><label>Pasajeros</label><span>${esc(resumenPasajeros(cot.pasajeros))}</span></div>
      ${cot.incluyeBoleto ? `<div class="field"><label>Boleto</label><span style="color:#28BFA9;">✓ Incluido</span></div>` : ""}
    </div>
  </div>
  ${hotelTableHTML}
  ${(cot.paqueteIncluye?.length ?? 0) > 0 ? `
  <div class="section">
    <div class="section-title">Servicios Incluidos</div>
    <div class="includes-list">
      ${(cot.paqueteIncluye ?? []).map((inc: string) => `<span class="include-tag">✓ ${esc(inc)}</span>`).join("")}
    </div>
  </div>` : ""}
  <div class="section">
    <div class="section-title">Resumen de Precios</div>
    <table>
      <thead><tr><th>Habitación</th><th class="center">Cant.</th><th class="right">$/pax</th><th class="right">Subtotal</th></tr></thead>
      <tbody>
        ${rooms.map((r) => `<tr>
          <td>${typeLabelMap[r.t] ?? r.t}</td>
          <td class="center">${r.qty}</td>
          <td class="right">$${fmt(r.precio)}</td>
          <td class="right bold">$${fmt(r.precio * r.qty)}</td>
        </tr>`).join("")}
        ${(cot.precios.precioBoleto ?? 0) > 0 ? `<tr>
          <td>Boleto aéreo</td><td class="center">—</td>
          <td class="right">$${fmt(cot.precios.precioBoleto!)}</td>
          <td class="right bold">$${fmt(cot.precios.precioBoleto!)}</td>
        </tr>` : ""}
        <tr class="total-row">
          <td colspan="3" class="green">TOTAL</td>
          <td class="right green">$${fmt(activeHotel?.total ?? cot.total)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="section">
    <div class="section-title">Términos y Condiciones</div>
    <p class="terms-text">${esc(TERMINOS)}</p>
  </div>
  <div class="footer">
    <div class="footer-left">
      Preparado por: <strong>${esc(agencyName)}</strong><br>
      ${esc(agencyPhone)} · ${today}<br>
      <span style="color:#28BFA9">Land Tour Travel — Mayorista de Turismo</span>
    </div>
    <div class="footer-seal">LTT<br>PROFORMA</div>
  </div>
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Permite ventanas emergentes para ver la proforma."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-scale space-y-6 pb-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-primary/50 hover:text-primary text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft size={13} /> Cotizaciones
        </button>
        <span className="text-primary/20">/</span>
        <span className="text-[11px] font-black text-secondary tracking-widest uppercase">{cot.codigo}</span>
        <span className={`ml-auto px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 ${STATUS_BADGE[cot.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
          {COTIZACION_STATUS_LABEL[cot.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Proforma Body (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Agency Header */}
          <div className="bg-primary rounded-3xl p-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {agencyLogo
                ? <img src={agencyLogo} alt={agencyName} className="w-16 h-8 object-contain bg-white/90 rounded-xl p-1 shrink-0" />
                : <div className="w-12 h-10 bg-secondary/20 rounded-2xl flex items-center justify-center shrink-0"><span className="text-secondary text-[10px] font-black">LTT</span></div>}
              <div className="min-w-0">
                <h3 className="text-white font-black text-sm truncate">{agencyName}</h3>
                <p className="text-white/40 text-[10px] font-bold mt-0.5 truncate">{agencyPhone}{agencyAddress ? ` · ${agencyAddress}` : ""}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-secondary text-base font-black tracking-[3px] block">PROFORMA</span>
              <span className="text-secondary/70 text-[10px] font-black block mt-0.5">{cot.codigo}</span>
              <span className="text-white/30 text-[9px] font-bold block mt-0.5">{cot.fechaCreacion}</span>
            </div>
          </div>

          {/* Client + Trip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Client card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-3">Datos del Cliente</span>
              <div className="space-y-0">
                {([
                  [<User size={11} />,     "Nombre",    cot.cliente?.nombre    || ""],
                  [<Globe size={11} />,    "Email",     cot.cliente?.email     || ""],
                  [<MapPin size={11} />,   "Teléfono",  cot.cliente?.telefono  || ""],
                  [<FileText size={11} />, "Documento", cot.cliente?.documento || ""],
                  [<MapPin size={11} />,   "Dirección", cot.cliente?.direccion || ""],
                ] as [React.ReactNode, string, string][]).filter(([, , v]) => !!v).map(([icon, label, value]) => (
                  <div key={label} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-secondary mt-0.5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <span className="text-[8px] font-black uppercase text-primary/30 tracking-wider block">{label}</span>
                      <span className="text-xs font-bold text-primary break-words">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-3">Detalles del Viaje</span>
              <div className="space-y-0">
                {([
                  [<Building2 size={11} />, "Programa",  cot.paqueteNombre   || ""],
                  [<MapPin size={11} />,    "Destino",   cot.paqueteDestino  || ""],
                  [<Calendar size={11} />,  "Duración",  cot.paqueteDuracion || ""],
                  [<Calendar size={11} />,  "Salida",    fmtDate(cot.fechaViaje)],
                  [<Calendar size={11} />,  "Retorno",   fmtDate(cot.fechaRetorno)],
                  [<User size={11} />,      "Pasajeros", resumenPasajeros(cot.pasajeros)],
                  [<Plane size={11} />,     "Boleto",    cot.incluyeBoleto ? "✓ Incluido" : ""],
                ] as [React.ReactNode, string, string][]).filter(([, , v]) => !!v).map(([icon, label, value]) => (
                  <div key={label} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className={`mt-0.5 shrink-0 ${label === "Boleto" ? "text-secondary" : "text-secondary"}`}>{icon}</span>
                    <div className="min-w-0">
                      <span className="text-[8px] font-black uppercase text-primary/30 tracking-wider block">{label}</span>
                      <span className={`text-xs font-bold break-words ${label === "Boleto" ? "text-secondary" : "text-primary"}`}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hotel comparison table — per-destino, hotels as columns */}
          {hasComparison && isV2Snapshot && (() => {
            const fmtN = (n: number) => n % 1 === 0 ? n.toLocaleString() : n.toFixed(2);
            return (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-5">
                <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest">
                  {isApproved ? "Hotel(es) Seleccionado(s)" : "Comparativa de Alojamiento"}
                </span>

                {destiEntries.map(([dId, { ciudad, pais, hotels }]) => {
                  const dHasChd = hotels.some((h) => (h.avgChildPerPax ?? 0) > 0);
                  const dHasBol = hotels.some((h) => (h.boletoPerPax  ?? 0) > 0);
                  const tipLbl  = hotels[0]?.tipoPax ?? "DBL";
                  return (
                    <div key={dId} className="space-y-2">
                      {isMultiDest && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={9} className="text-secondary/60 shrink-0" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/50">
                            {ciudad}{pais ? `, ${pais}` : ""}
                          </p>
                        </div>
                      )}
                      <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-light border-b border-gray-100">
                              <th className="px-3 py-2.5 text-left text-[8px] font-black uppercase text-primary/40 tracking-wider" style={{ width: "38%" }}>
                                Concepto
                              </th>
                              {hotels.map((h) => {
                                const isSel = h.hotelId === selByDestino[dId];
                                return (
                                  <th key={h.hotelId} className={`px-3 py-2 text-center transition-colors ${isSel ? "bg-secondary/10" : ""}`} style={{ minWidth: 110 }}>
                                    <p className="font-black text-primary text-[11px] leading-snug">{h.nombre}</p>
                                    <p className="text-amber-400 text-[9px] font-bold mt-0.5">{"★".repeat(Math.min(h.estrellas, 5))}</p>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">

                            {/* Alojamiento row */}
                            <tr>
                              <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px] leading-relaxed">
                                Alojamiento {tipLbl}
                                <br /><span className="text-[9px] text-primary/30 font-normal">(hab. + act. + traslados)</span>
                              </td>
                              {hotels.map((h) => {
                                const adultP = h.adultColPerPax != null ? h.adultColPerPax : h.pricePerPax;
                                const isSel  = h.hotelId === selByDestino[dId];
                                return (
                                  <td key={h.hotelId} className={`px-3 py-2.5 text-center font-black text-primary ${isSel ? "bg-secondary/10" : ""}`}>
                                    ${fmtN(adultP)}/pax
                                  </td>
                                );
                              })}
                            </tr>

                            {/* CHD row */}
                            {dHasChd && (
                              <tr>
                                <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px]">Suplemento menores<br /><span className="text-[9px] text-primary/30 font-normal">(/adulto)</span></td>
                                {hotels.map((h) => {
                                  const isSel = h.hotelId === selByDestino[dId];
                                  return (
                                    <td key={h.hotelId} className={`px-3 py-2.5 text-center font-bold text-primary/60 ${isSel ? "bg-secondary/10" : ""}`}>
                                      {(h.avgChildPerPax ?? 0) > 0
                                        ? `+$${fmtN(h.avgChildPerPax!)}/pax`
                                        : <span className="text-primary/20">—</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            )}

                            {/* Boleto row */}
                            {dHasBol && (
                              <tr>
                                <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px]">
                                  <span className="flex items-center gap-1"><Plane size={9} className="text-secondary/60" /> Boleto aéreo</span>
                                </td>
                                {hotels.map((h) => {
                                  const isSel = h.hotelId === selByDestino[dId];
                                  return (
                                    <td key={h.hotelId} className={`px-3 py-2.5 text-center font-bold text-secondary/70 ${isSel ? "bg-secondary/10" : ""}`}>
                                      {(h.boletoPerPax ?? 0) > 0
                                        ? `$${fmtN(h.boletoPerPax!)}/pax`
                                        : <span className="text-primary/20">—</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            )}

                            {/* PRECIO/PERSONA total row */}
                            <tr className="border-t-2 border-secondary/30">
                              <td className="px-3 py-3 font-black text-[10px] uppercase tracking-wider text-primary bg-primary/5 whitespace-nowrap">
                                PRECIO / PERSONA *
                              </td>
                              {hotels.map((h) => {
                                const isSel = h.hotelId === selByDestino[dId];
                                return (
                                  <td key={h.hotelId} className={`px-3 py-3 text-center font-black text-secondary text-sm ${isSel ? "bg-secondary/15" : "bg-primary/5"}`}>
                                    ${fmtN(h.pricePerPax)}
                                  </td>
                                );
                              })}
                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                <p className="text-[9px] font-bold text-primary/30 leading-relaxed">
                  * Precio por persona incluye alojamiento, actividades y traslados{hasBoleto ? ", y boleto aéreo" : ""}. Sujeto a disponibilidad.
                </p>
              </div>
            );
          })()}

          {/* Pricing table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-4">Desglose de Precios</span>
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-light">
                    {["Tipo", "$/pax", "Cant.", "Subtotal"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase text-primary/40 tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(["SGL","DBL","TPL","QUAD","CHD"] as const).map((t) => {
                    const qty    = (cot.pasajeros as any)[`cant${t}`]  as number ?? 0;
                    const precio = (cot.precios   as any)[`precio${t}`] as number ?? 0;
                    if (!qty) return null;
                    return (
                      <tr key={t} className="hover:bg-light/50">
                        <td className="px-3 py-2.5 font-black text-primary">{t}</td>
                        <td className="px-3 py-2.5 font-black text-secondary">${precio.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-primary/60">{qty}</td>
                        <td className="px-3 py-2.5 font-black text-primary">${(precio * qty).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {(cot.precios.precioBoleto ?? 0) > 0 && (
                    <tr className="hover:bg-light/50">
                      <td className="px-3 py-2.5 font-black text-primary">
                        <span className="flex items-center gap-1.5"><Plane size={10} className="text-secondary" /> Boleto</span>
                      </td>
                      <td className="px-3 py-2.5 font-black text-secondary">${cot.precios.precioBoleto!.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-primary/60">—</td>
                      <td className="px-3 py-2.5 font-black text-primary">${cot.precios.precioBoleto!.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-primary border-t-2 border-secondary/40">
                    <td colSpan={3} className="px-3 py-3 font-black text-white text-[10px] uppercase tracking-wider">
                      Total
                    </td>
                    <td className="px-3 py-3 font-black text-secondary text-sm">
                      ${cot.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Includes */}
          {(cot.paqueteIncluye?.length ?? 0) > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-3">Servicios Incluidos</span>
              <div className="flex flex-wrap gap-1.5">
                {(cot.paqueteIncluye ?? []).map((item: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/15">
                    <CheckCircle2 size={9} /> {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {cot.notas && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-2">Notas</span>
              <p className="text-xs font-bold text-primary/70 leading-relaxed whitespace-pre-wrap">{cot.notas}</p>
            </div>
          )}
        </div>

        {/* ── Right: Actions (1/3) ── */}
        <div className="space-y-4">

          {/* Hotel comparison — multi-destino radio selection */}
          {hasComparison && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest">
                {isApproved ? "Hotel(es) Confirmado(s)" : "Selección de Hotel"}
              </span>

              {isApproved && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <p className="text-[10px] font-black text-emerald-700">Aprobada — hotel(es) confirmado(s)</p>
                </div>
              )}

              {!isApproved && !isRejected && isV2Snapshot && (
                <p className="text-[10px] font-bold text-primary/50 leading-relaxed">
                  Selecciona{isMultiDest ? " un hotel por destino" : " el hotel"} para la proforma definitiva.
                </p>
              )}

              {/* Per-destino hotel cards */}
              {destiEntries.map(([dId, { ciudad, pais, hotels }]) => {
                const selIdForDest = selByDestino[dId];
                return (
                  <div key={dId}>
                    {isMultiDest && (
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest mb-2">
                        {ciudad}{pais ? `, ${pais}` : ""}
                      </p>
                    )}
                    <div className="space-y-2">
                      {hotels.map((h) => {
                        const isSel = h.hotelId === selIdForDest;
                        const isDisabled = isApproved || isRejected;
                        const adultP = h.adultColPerPax != null ? h.adultColPerPax : h.pricePerPax;
                        return (
                          <button
                            key={h.hotelId}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && setSelByDestino((prev) => ({ ...prev, [dId]: h.hotelId }))}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                              isDisabled ? "cursor-default" : "cursor-pointer"
                            } ${isSel
                              ? "border-secondary bg-secondary/5"
                              : isDisabled
                                ? "border-gray-100 opacity-40"
                                : "border-gray-100 hover:border-secondary/40 hover:bg-light/60"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              isSel ? "border-secondary bg-secondary" : "border-gray-300"
                            }`}>
                              {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-black text-primary leading-tight">{h.nombre}</p>
                              <p className="text-[10px] font-bold text-amber-400 mt-0.5">{"★".repeat(Math.min(h.estrellas, 5))}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-primary/40 font-bold">
                                  {tipoPaxLabel}: <strong className="text-primary/70">${adultP.toLocaleString()}</strong>/pax
                                </span>
                                {(h.avgChildPerPax ?? 0) > 0 && (
                                  <span className="text-[10px] text-primary/40 font-bold">
                                    Menores: <strong className="text-primary/70">+${h.avgChildPerPax!.toLocaleString()}</strong>/adulto
                                  </span>
                                )}
                                {(h.boletoPerPax ?? 0) > 0 && (
                                  <span className="text-[10px] text-secondary/70 font-bold">
                                    ✈ ${h.boletoPerPax!.toLocaleString()}/pax
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-secondary">${h.total.toLocaleString()}</span>
                              <span className="block text-[9px] text-primary/30 font-bold">USD</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
            <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest">Acciones</span>

            {canAct && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={!canApprove || isApproving}
                  className="w-full py-3 bg-secondary hover:bg-secondary-light disabled:opacity-40 disabled:cursor-not-allowed text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isApproving
                    ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    : <CheckCircle2 size={14} />}
                  {isApproving ? "Aprobando..." : "Aprobar"}
                </button>

                {hasComparison && !allDestinosSelected && (
                  <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 text-center leading-relaxed">
                    Selecciona {isMultiDest ? "un hotel por destino" : "un hotel"} para habilitar la aprobación.
                  </p>
                )}
              </>
            )}

            {isApproved && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <p className="text-[10px] font-black text-emerald-700">Cotización aprobada</p>
              </div>
            )}

            {isRejected && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <X size={14} className="text-rose-500 shrink-0" />
                <p className="text-[10px] font-black text-rose-600">Cotización rechazada</p>
              </div>
            )}
          </div>

          {/* Print/PDF — only after APROBADA */}
          {isApproved && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest">Documento</span>
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer size={14} /> Imprimir / Guardar PDF
              </button>
              <p className="text-[9px] font-bold text-primary/30 text-center leading-relaxed">
                Se exportará la proforma con el hotel seleccionado únicamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
