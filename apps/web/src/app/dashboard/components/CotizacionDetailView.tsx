"use client";
import React, { useState, useMemo } from "react";
import {
  ArrowLeft, User, Globe, MapPin, FileText, Calendar, Plane,
  Building2, CheckCircle2, Printer, X, XCircle,
} from "lucide-react";
import { COTIZACION_STATUS_LABEL } from "@land-tour/shared";
import type { CotizacionStatus } from "@land-tour/shared";
import { useDashboard, type CotizacionExtended, type HotelCompSnapshot } from "../DashboardContext";
import { cartesian, combineComboLegs, type ComboLeg } from "../cotizar-price";

const PAX_BY_TYPE: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

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
// Diagonal stamp on the document sheet.
const STAMP_STYLE: Record<CotizacionStatus, string> = {
  BORRADOR:  "text-sky-500/30 border-sky-500/30",
  ENVIADA:   "text-amber-500/30 border-amber-500/30",
  APROBADA:  "text-emerald-600/40 border-emerald-600/40",
  RECHAZADA: "text-rose-500/40 border-rose-500/40",
};

const TERMINOS = `Los precios indicados son por persona en la categoría de habitación seleccionada y están sujetos a disponibilidad hotelera al momento de la reserva. Land Tour Travel actúa como operador mayorista; la agencia minorista es responsable de la relación comercial con el cliente final. El pago del depósito de reserva (40% del total) es obligatorio para confirmar los servicios. Cancelaciones con menos de 15 días de anticipación están sujetas a penalidades del 50%. Los vuelos, cuando son incluidos, están sujetos a las políticas de la aerolínea operadora. El pasajero es responsable de contar con documentación vigente (pasaporte, visa si aplica).`;

/** Converts "YYYY-MM-DD" → "DD/MM/YYYY". Returns the original string for other formats. */
const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "";
  const parts = s.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const stars = (n: number) => "★".repeat(Math.max(0, Math.min(n, 5)));
const money = (n: number) => (n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2));

type ComboView = {
  legs: HotelCompSnapshot[];
  hotelIds: number[];
  adultP: number;
  childP: number;
  /** Full combo total — persisted to the DB on approval, never shown to the user. */
  total: number;
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

  const allHotels = cot?.hotelsComparison ?? [];
  const hasV4     = allHotels.length > 0 && allHotels[0].adultAccomTotal != null;
  const boletoOculto = allHotels.some((h) => h.boletoPrecioOculto);

  // Passenger counts (from stored room distribution).
  const numNinos   = (cot?.pasajeros as any)?.cantCHD ?? 0;
  const numAdultos = (["SGL", "DBL", "TPL", "QUAD"] as const).reduce(
    (s, t) => s + (((cot?.pasajeros as any)?.[`cant${t}`] ?? 0) as number) * PAX_BY_TYPE[t], 0);

  const boletoAdultoPerPax = allHotels[0]?.boletoPerPax ?? 0;
  const boletoNinoPerPax   = allHotels[0]?.boletoChildPerPax ?? 0;
  const markup             = cot?.markup ?? 0;

  // Group hotels by destino (preserve insertion order).
  const destGroups = useMemo(() => {
    const m = new Map<number, { ciudad: string; pais: string; hotels: HotelCompSnapshot[] }>();
    allHotels.forEach((h) => {
      const dId = h.destinoId ?? 0;
      if (!m.has(dId)) m.set(dId, { ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
      m.get(dId)!.hotels.push(h);
    });
    return [...m.values()];
  }, [allHotels]);
  const isMultiDest = destGroups.length > 1;

  // Every combination (one hotel per destino) with per-person adult/child prices — same
  // model as Step 4 (combineComboLegs). Boleto + markup counted once per combo.
  const combos = useMemo<ComboView[]>(() => {
    if (allHotels.length === 0) return [];
    const groups = destGroups.map((g) => g.hotels);
    return cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map((h) => ({
        adultAccomTotal:    h.adultAccomTotal ?? 0,
        adultServicesTotal: h.adultServicesTotal ?? 0,
        childAccomTotal:    h.childAccomTotal ?? 0,
        childServicesTotal: h.childServicesTotal ?? 0,
      }));
      const t = combineComboLegs(comboLegs, numAdultos, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup);
      // Legacy (v1/v2) snapshots lack the adult/child split → fall back to pricePerPax.
      const adultP = hasV4 ? t.precioAdulto : legs.reduce((s, h) => s + (h.pricePerPax ?? 0), 0);
      const childP = hasV4 ? t.precioNino   : legs.reduce((s, h) => s + (h.avgChildPerPax ?? 0), 0);
      const total  = hasV4 ? t.total : (cot?.total ?? 0);
      return { legs, hotelIds: legs.map((h) => h.hotelId), adultP, childP, total };
    });
  }, [allHotels, destGroups, numAdultos, numNinos, boletoAdultoPerPax, boletoNinoPerPax, markup, hasV4, cot?.total]);

  // Which combo was approved (matches the hotels flagged `selected` in the snapshot).
  const approvedComboIdx = useMemo(() => {
    const selIds = allHotels.filter((h) => h.selected).map((h) => h.hotelId);
    if (selIds.length === 0) return null;
    const idx = combos.findIndex(
      (c) => c.hotelIds.length === selIds.length && c.hotelIds.every((id) => selIds.includes(id))
    );
    return idx >= 0 ? idx : null;
  }, [allHotels, combos]);

  const [userPickedIdx, setUserPickedIdx] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!cot) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm font-bold text-primary/40">Cotización no encontrada.</p>
      </div>
    );
  }

  const isApproved = cot.status === "APROBADA";
  const isRejected = cot.status === "RECHAZADA";
  const canAct     = cot.status === "BORRADOR" || cot.status === "ENVIADA";
  const hasCombos  = combos.length > 0;

  // When approved, the selection is locked to the approved combo.
  const selectedComboIdx = isApproved ? approvedComboIdx : userPickedIdx;
  const selectedCombo = selectedComboIdx != null ? combos[selectedComboIdx] ?? null : null;

  // Screen: approved → only the chosen combo; otherwise all combos.
  const combosToShow = isApproved && selectedCombo ? [selectedCombo] : combos;

  const pasajerosLabel = `${numAdultos} Adulto${numAdultos !== 1 ? "s" : ""}` +
    (numNinos > 0 ? ` + ${numNinos} Niño${numNinos !== 1 ? "s" : ""}` : "") +
    ` (${numAdultos + numNinos} pax)`;

  // ─── Status change (approve / reject) ─────────────────────────────
  const patchStatus = async (
    status: CotizacionStatus,
    extra: { hotelIds?: number[]; total?: number; nota?: string } = {}
  ) => {
    if (isBusy) return;
    setIsBusy(true);

    setCotizaciones((prev) =>
      prev.map((c) => {
        if (c.id !== cotId) return c;
        const updatedComparison = extra.hotelIds
          ? c.hotelsComparison?.map((h) => ({ ...h, selected: extra.hotelIds!.includes(h.hotelId) }))
          : c.hotelsComparison;
        return {
          ...c,
          status,
          ...(extra.total != null ? { total: extra.total } : {}),
          ...(extra.hotelIds && extra.hotelIds.length > 0 ? { selectedHotelId: extra.hotelIds[0] } : {}),
          ...(updatedComparison ? { hotelsComparison: updatedComparison } : {}),
        };
      })
    );

    try {
      await fetch(`/api/cotizaciones/${cotId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(extra.hotelIds && extra.hotelIds.length > 0
            ? { selectedHotelId: extra.hotelIds[0], selectedHotelIds: extra.hotelIds }
            : {}),
          ...(extra.total != null ? { total: Math.round(extra.total * 100) / 100 } : {}),
          ...(extra.nota ? { nota: extra.nota } : {}),
        }),
      });
    } catch {}

    setIsBusy(false);
  };

  const handleApprove = () => {
    if (!canAct || !selectedCombo) return;
    const nota = `Combinación aprobada: ${selectedCombo.legs.map((h) => h.nombre).join(", ")}`;
    patchStatus("APROBADA", { hotelIds: selectedCombo.hotelIds, total: selectedCombo.total, nota });
  };

  const handleReject = () => {
    if (!canAct) return;
    patchStatus("RECHAZADA");
  };

  // ─── Print / PDF (document view) ──────────────────────────────────
  const handlePrint = () => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const today = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
    const statusLabel = COTIZACION_STATUS_LABEL[cot.status];

    // Not approved → all combos; approved → only the chosen combo.
    const combosForPrint = isApproved && selectedCombo ? [selectedCombo] : combos;

    const logoHTML = agencyLogo
      ? `<img src="${agencyLogo}" alt="${esc(agencyName)}" style="width:80px;height:32px;object-fit:contain;" />`
      : `<div style="width:72px;height:30px;background:#0B4339;border-radius:5px;display:flex;align-items:center;justify-content:center;"><span style="color:#28BFA9;font-size:10px;font-weight:900;">LTT</span></div>`;

    // Compact table: one row per combination (hotels inline), adult + child columns.
    const showChild = numNinos > 0;
    const adultTipoLabel =
      ({ 1: "SGL", 2: "DBL", 3: "TPL", 4: "QUAD" } as Record<number, string>)[numAdultos] ?? "Adulto";

    const comboRowsHTML = combosForPrint.map((combo, i) => {
      const hotelsLine = combo.legs.map((h) => {
        const city = isMultiDest && h.destinoCiudad ? `${esc(h.destinoCiudad)} — ` : "";
        return `${city}${esc(h.nombre)} <span class="amber">${stars(h.estrellas)}</span>`;
      }).join(` <span class="plus">+</span> `);
      const title = combosForPrint.length > 1 ? `Combinación ${i + 1}` : (isMultiDest ? "Combinación" : "Alojamiento");
      return `<tr>` +
        `<td class="ct-name"><span class="ct-title">${esc(title)}</span><span class="ct-hotels">${hotelsLine}</span></td>` +
        `<td class="ct-price">$${esc(money(combo.adultP))}<em>/pax</em></td>` +
        (showChild ? `<td class="ct-price">$${esc(money(combo.childP))}<em>/niño</em></td>` : "") +
        `</tr>`;
    }).join("");

    const combosHTML =
      `<table class="combo-table">` +
      `<thead><tr>` +
      `<th class="ct-name-h">Combinación</th>` +
      `<th class="ct-price-h">${adultTipoLabel}</th>` +
      (showChild ? `<th class="ct-price-h">CHD</th>` : "") +
      `</tr></thead>` +
      `<tbody>${comboRowsHTML}</tbody>` +
      `</table>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cotización ${esc(cot.codigo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
@page{margin:14mm 18mm;size:A4 portrait;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Montserrat',Arial,sans-serif;font-size:11px;color:#0B4339;background:#e9eeed;line-height:1.5;}
.toolbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0B4339;color:white;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;font-size:12px;font-weight:700;}
.toolbar button{padding:6px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;margin-left:6px;}
.btn-print{background:#28BFA9;color:#0B4339;}
.btn-close{background:transparent;color:white;border:1px solid rgba(255,255,255,0.3)!important;}
.page{max-width:820px;margin:64px auto 40px;padding:40px;background:white;box-shadow:0 10px 40px rgba(11,67,57,.15);position:relative;}
@media print{body{background:#fff;}.toolbar{display:none!important;}.page{margin:0;padding:0;max-width:none;box-shadow:none;}}
.stamp{position:absolute;top:120px;right:44px;border:3px solid;border-radius:10px;padding:6px 16px;font-size:20px;font-weight:900;letter-spacing:3px;text-transform:uppercase;transform:rotate(9deg);opacity:.5;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #28BFA9;}
.header-left{display:flex;align-items:center;gap:12px;}
.agency-name{font-size:14px;font-weight:900;color:#0B4339;}
.agency-contact{font-size:9px;color:#0B4339;opacity:.6;margin-top:2px;}
.header-right{text-align:right;}
.doc-title{font-size:19px;font-weight:900;color:#0B4339;letter-spacing:3px;}
.doc-code{font-size:11px;font-weight:700;color:#28BFA9;margin-top:3px;}
.doc-date{font-size:9px;color:#0B4339;opacity:.5;margin-top:2px;}
.doc-status{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-top:4px;color:#0B4339;opacity:.6;}
.section{margin-bottom:20px;}
.section-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#28BFA9;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #EDF7F5;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;}
.field label{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;color:#0B4339;opacity:.4;display:block;}
.field span{font-size:11px;font-weight:700;color:#0B4339;}
.combo-table{width:100%;border-collapse:collapse;}
.combo-table thead th{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#28BFA9;padding:0 0 6px;border-bottom:1.5px solid #DCEEEA;}
.ct-name-h{text-align:left;}
.ct-price-h{text-align:right;width:88px;}
.combo-table tbody tr{border-bottom:1px solid #EDF7F5;break-inside:avoid;}
.combo-table td{padding:9px 0;vertical-align:middle;}
.ct-name{padding-right:14px;}
.ct-title{display:block;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#0B4339;opacity:.4;}
.ct-hotels{display:block;font-size:11px;font-weight:700;color:#0B4339;margin-top:1px;}
.ct-price{text-align:right;font-size:14px;font-weight:900;color:#0B4339;white-space:nowrap;}
.ct-price em{font-size:8px;font-weight:700;opacity:.4;font-style:normal;margin-left:2px;}
.plus{color:#28BFA9;font-weight:900;margin:0 2px;}
.amber{color:#C9A96E;font-size:9px;}
.includes-list{display:flex;flex-wrap:wrap;gap:6px;}
.include-tag{background:#EDF7F5;color:#0B4339;font-size:9px;font-weight:700;padding:3px 8px;border-radius:5px;border:1px solid #28BFA9;opacity:.8;}
.terms-text{font-size:8px;color:#0B4339;opacity:.5;line-height:1.6;}
.note-line{font-size:8px;color:#0B4339;opacity:.45;margin-top:8px;line-height:1.5;}
.footer{margin-top:24px;padding-top:12px;border-top:1px solid #EDF7F5;display:flex;justify-content:space-between;align-items:flex-end;}
.footer-left{font-size:9px;font-weight:700;color:#0B4339;opacity:.6;line-height:1.8;}
.footer-seal{width:52px;height:52px;border-radius:50%;background:#0B4339;color:#28BFA9;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;text-align:center;line-height:1.4;flex-shrink:0;}
</style>
</head>
<body>
<div class="toolbar">
  <span>Cotización · ${esc(cot.codigo)}</span>
  <div>
    <button class="btn-print" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  </div>
</div>
<div class="page">
  <div class="stamp" style="color:${cot.status === "APROBADA" ? "#059669" : cot.status === "RECHAZADA" ? "#e11d48" : "#64748b"};border-color:${cot.status === "APROBADA" ? "#059669" : cot.status === "RECHAZADA" ? "#e11d48" : "#64748b"};opacity:.28">${esc(statusLabel)}</div>
  <div class="header">
    <div class="header-left">
      ${logoHTML}
      <div>
        <div class="agency-name">${esc(agencyName)}</div>
        <div class="agency-contact">${esc(agencyPhone)}${agencyAddress ? " · " + esc(agencyAddress) : ""}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">COTIZACIÓN</div>
      <div class="doc-code">${esc(cot.codigo)}</div>
      <div class="doc-date">${today}</div>
      <div class="doc-status">${esc(statusLabel)}</div>
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
      <div class="field"><label>Pasajeros</label><span>${esc(pasajerosLabel)}</span></div>
      ${cot.incluyeBoleto ? `<div class="field"><label>Boleto</label><span style="color:#28BFA9;">✓ Incluido</span></div>` : ""}
    </div>
  </div>
  ${hasCombos ? `<div class="section">
    <div class="section-title">${combosForPrint.length > 1 ? "Combinaciones de Hoteles" : "Alojamiento"}</div>
    ${combosHTML}
    <p class="note-line">Precios por persona (incluyen alojamiento, actividades y traslados${cot.incluyeBoleto ? ", y boleto aéreo" : ""}). ${numNinos > 0 ? "El niño se calcula por separado del adulto. " : ""}Sujeto a disponibilidad.</p>
  </div>` : ""}
  ${(cot.paqueteIncluye?.length ?? 0) > 0 ? `
  <div class="section">
    <div class="section-title">Servicios Incluidos</div>
    <div class="includes-list">
      ${(cot.paqueteIncluye ?? []).map((inc: string) => `<span class="include-tag">✓ ${esc(inc)}</span>`).join("")}
    </div>
  </div>` : ""}
  ${cot.notas ? `<div class="section"><div class="section-title">Notas</div><p class="terms-text" style="opacity:.7">${esc(cot.notas)}</p></div>` : ""}
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
    <div class="footer-seal">LTT<br>COTIZACIÓN</div>
  </div>
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Permite ventanas emergentes para ver la cotización."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  // ─── Render ───────────────────────────────────────────────────────
  const clientRows: [React.ReactNode, string, string][] = [
    [<User size={11} key="n" />,     "Nombre",    cot.cliente?.nombre    || ""],
    [<Globe size={11} key="e" />,    "Email",     cot.cliente?.email     || ""],
    [<MapPin size={11} key="t" />,   "Teléfono",  cot.cliente?.telefono  || ""],
    [<FileText size={11} key="d" />, "Documento", cot.cliente?.documento || ""],
    [<MapPin size={11} key="a" />,   "Dirección", cot.cliente?.direccion || ""],
  ];
  const tripRows: [React.ReactNode, string, string][] = [
    [<Building2 size={11} key="p" />, "Programa",  cot.paqueteNombre   || ""],
    [<MapPin size={11} key="de" />,   "Destino",   cot.paqueteDestino  || ""],
    [<Calendar size={11} key="du" />, "Duración",  cot.paqueteDuracion || ""],
    [<Calendar size={11} key="s" />,  "Salida",    fmtDate(cot.fechaViaje)],
    [<Calendar size={11} key="r" />,  "Retorno",   fmtDate(cot.fechaRetorno)],
    [<User size={11} key="pa" />,     "Pasajeros", pasajerosLabel],
    [<Plane size={11} key="b" />,     "Boleto",    cot.incluyeBoleto ? "✓ Incluido" : ""],
  ];

  return (
    <div className="animate-fade-scale pb-10">

      {/* Action toolbar — not part of the document sheet */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-primary/50 hover:text-primary text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft size={13} /> Cotizaciones
        </button>
        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 ${STATUS_BADGE[cot.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
          {COTIZACION_STATUS_LABEL[cot.status]}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer size={13} /> Imprimir / PDF
          </button>
          {canAct && (
            <>
              <button
                onClick={handleReject}
                disabled={isBusy}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <XCircle size={13} /> Rechazar
              </button>
              <button
                onClick={handleApprove}
                disabled={isBusy || !selectedCombo}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-primary disabled:opacity-40 disabled:cursor-not-allowed font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isBusy
                  ? <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  : <CheckCircle2 size={13} />}
                Aprobar
              </button>
            </>
          )}
        </div>
      </div>

      {canAct && hasCombos && !selectedCombo && (
        <p className="max-w-[820px] mx-auto mb-4 text-[11px] font-bold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 text-center leading-relaxed">
          Selecciona una combinación para poder aprobar. También puedes imprimir sin aprobar.
        </p>
      )}

      {/* ── The document sheet ── */}
      <div className="max-w-[820px] mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">

        {/* Diagonal status stamp */}
        <div className={`pointer-events-none absolute top-28 right-8 z-10 border-4 rounded-xl px-4 py-1.5 text-xl font-black uppercase tracking-[3px] rotate-[9deg] ${STAMP_STYLE[cot.status]}`}>
          {COTIZACION_STATUS_LABEL[cot.status]}
        </div>

        {/* Header band */}
        <div className="bg-primary p-6 sm:p-8 flex items-start justify-between gap-4">
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
            <span className="text-secondary text-base font-black tracking-[3px] block">COTIZACIÓN</span>
            <span className="text-secondary/70 text-[10px] font-black block mt-0.5">{cot.codigo}</span>
            <span className="text-white/30 text-[9px] font-bold block mt-0.5">{cot.fechaCreacion}</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">

          {/* Client + Trip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-3">Datos del Cliente</span>
              <div className="space-y-0">
                {clientRows.filter(([, , v]) => !!v).map(([icon, label, value]) => (
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
            <div>
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-3">Detalles del Viaje</span>
              <div className="space-y-0">
                {tripRows.filter(([, , v]) => !!v).map(([icon, label, value]) => (
                  <div key={label} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-secondary mt-0.5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <span className="text-[8px] font-black uppercase text-primary/30 tracking-wider block">{label}</span>
                      <span className={`text-xs font-bold break-words ${label === "Boleto" ? "text-secondary" : "text-primary"}`}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Combinaciones */}
          {hasCombos && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest">
                  {isApproved
                    ? "Combinación Confirmada"
                    : (combos.length > 1 ? "Combinaciones de Hoteles" : "Alojamiento")}
                  {!isApproved && combos.length > 1 && (
                    <span className="ml-1 text-primary/25">({combos.length})</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {combosToShow.map((combo) => {
                  const idx = combos.indexOf(combo);
                  const isSel = idx === selectedComboIdx;
                  const selectable = canAct;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!selectable}
                      onClick={() => selectable && setUserPickedIdx(idx)}
                      className={`text-left rounded-3xl border-2 p-5 transition-all ${selectable ? "cursor-pointer" : "cursor-default"} ${
                        isSel
                          ? "border-secondary bg-secondary/5"
                          : selectable
                            ? "border-gray-100 hover:border-secondary/40 hover:bg-light/60"
                            : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">
                          {combos.length > 1 ? `Combinación ${idx + 1}` : (isMultiDest ? "Combinación" : "Alojamiento")}
                        </span>
                        {selectable && (
                          <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${isSel ? "border-secondary bg-secondary" : "border-gray-300"}`}>
                            {isSel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        )}
                      </div>

                      {/* Hotels of the combo (one per destino) */}
                      <div className="space-y-2 mb-3">
                        {combo.legs.map((h) => (
                          <div key={h.hotelId}>
                            {isMultiDest && (
                              <p className="text-[8px] font-black uppercase tracking-widest text-primary/35">{h.destinoCiudad}</p>
                            )}
                            <p className="text-xs font-bold text-primary leading-snug">{h.nombre}</p>
                            <p className="text-amber-400 text-[9px] font-bold">{stars(h.estrellas)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Adult / Child per-person prices — no totals */}
                      <div className="rounded-2xl bg-light/60 border border-secondary/15 divide-y divide-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className="text-[10px] font-bold text-primary/60">Adulto</span>
                          <span className="text-sm font-black text-primary">
                            ${money(combo.adultP)}<span className="text-[8px] font-bold text-primary/40"> /pax</span>
                          </span>
                        </div>
                        {numNinos > 0 && (
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-[10px] font-bold text-primary/60">Niño</span>
                            <span className="text-sm font-black text-primary">
                              ${money(combo.childP)}<span className="text-[8px] font-bold text-primary/40"> /niño</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] text-primary/35 font-bold mt-3 leading-relaxed">
                Precios por persona (incluyen alojamiento, actividades y traslados
                {cot.incluyeBoleto ? ", y boleto aéreo" : ""}).
                {numNinos > 0 ? " El niño se calcula por separado del adulto." : ""}
                {boletoOculto ? " El boleto aéreo va incluido en el precio." : ""}
              </p>
            </div>
          )}

          {/* Servicios incluidos */}
          {(cot.paqueteIncluye?.length ?? 0) > 0 && (
            <div>
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

          {/* Notas */}
          {cot.notas && (
            <div>
              <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-2">Notas</span>
              <p className="text-xs font-bold text-primary/70 leading-relaxed whitespace-pre-wrap">{cot.notas}</p>
            </div>
          )}

          {/* Términos */}
          <div className="border-t border-gray-100 pt-5">
            <span className="block text-[9px] font-black uppercase text-secondary/70 tracking-widest mb-2">Términos y Condiciones</span>
            <p className="text-[9px] text-primary/40 font-medium leading-relaxed">{TERMINOS}</p>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between gap-4 pt-2">
            <div className="text-[9px] font-bold text-primary/50 leading-relaxed">
              Preparado por: <strong className="text-primary/70">{agencyName}</strong><br />
              {agencyPhone} · {cot.fechaCreacion}<br />
              <span className="text-secondary">Land Tour Travel — Mayorista de Turismo</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary text-secondary flex items-center justify-center text-[8px] font-black text-center leading-tight shrink-0">
              LTT<br />COTIZACIÓN
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
