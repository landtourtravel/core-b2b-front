"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/services/api";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { SessionTimeoutModal } from "@/components/SessionTimeoutModal";
import {
  Package,
  Cotizacion,
  CotizacionStatus,
  PreciosCotizacion,
  PasajerosCotizacion,
  COTIZACION_STATUS_LABEL,
  calcularSubtotal,
  resumenPasajeros,
} from "@land-tour/shared";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Minus,
  Search,
  User,
  Download,
  AlertCircle,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Check,
  Eye,
  Settings2,
  LogOut,
  Compass,
  Plane,
  Star,
  Globe,
  Printer,
  Trash2,
} from "lucide-react";
import { DashboardContext, type CotizacionExtended, type HotelCompSnapshot } from "./DashboardContext";
import DashboardTab from "./components/DashboardTab";
import PaquetesTab from "./components/PaquetesTab";
import CotizacionesTab from "./components/CotizacionesTab";
import {
  getAdultAccomPrice,
  getChildPriceForAge,
  getActividadAdultPerPax,
  getActividadChildPerPax,
  getTrasladoPerPax,
  calcHotelBreakdown,
  type HotelBreakdown,
} from "./cotizar-price";

// ─── Cotizar-datos API types ──────────────────────────────────────────────────
interface CotHotelTarifa { tipoHabitacion: string; precioBase: number }
interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[] }
interface CotActividadTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
interface CotActividad { id: number; nombre: string; descripcion: string | null; tarifas: CotActividadTarifa[] }
interface CotTrasladoTarifa { precio: number; tipoCobro: string; paxMin: number; paxMax: number }
interface CotTraslado { id: number; tipo: string; tarifas: CotTrasladoTarifa[] }
interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[]; actividades: CotActividad[]; traslados: CotTraslado[] }
interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
interface CotPoliticaNinos { edadMin: number; edadMax: number; precio: number | null }
interface CotPaqueteActividad {
  id: number; nombre: string; descripcion: string | null;
  destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }[];
}
interface CotPaqueteTraslado {
  id: number; tipo: string; destinoId: number; destinoCiudad: string;
  tarifas: { precio: number; tipoCobro: string; paxMin: number; paxMax: number }[];
}
interface CotPaqueteDestino   { id: number; ciudad: string; pais: string }
interface CotPaqueteHotel {
  id: number; nombre: string; estrellas: number;
  destinoId: number; destinoCiudad: string; noches: number;
  tarifas: { tipoHabitacion: string; precioBase: number }[];
  politicaNinos: CotPoliticaNinos[];
}
interface CotPaquete {
  id: number; nombre: string; numPax: number; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  hotelTarifas: { hotelId: number; tipoHabitacion: string; precioBase: number }[];
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
}
interface CotizarData { destinos: CotDestino[]; paquetes: CotPaquete[] }

// ─── Status style maps (must be at file scope for Tailwind scanning) ──────────
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

// ─── T&C static text ──────────────────────────────────────────────────────────
const TERMINOS_CONDICIONES = `Los precios indicados son por persona en la categoría de habitación seleccionada y están sujetos a disponibilidad hotelera al momento de la reserva. Land Tour Travel actúa como operador mayorista; la agencia minorista es responsable de la relación comercial con el cliente final. El pago del depósito de reserva (40% del total) es obligatorio para confirmar los servicios. Cancelaciones con menos de 15 días de anticipación están sujetas a penalidades del 50%. Los vuelos, cuando son incluidos, están sujetos a las políticas de la aerolínea operadora. Land Tour Travel no se responsabiliza por cambios de vuelo, demoras o cancelaciones por parte de la aerolínea. El pasajero es responsable de contar con documentación vigente (pasaporte, visa si aplica). Las tarifas de niños aplican para menores de 2 a 11 años compartiendo habitación con adultos. El markup/comisión de agencia no es visible para el cliente final en los documentos exportados.`;

// ─── Draft key ───────────────────────────────────────────────────────────────
const DRAFT_KEY = "cotizador-draft-v1";


// ─── Input style helper ───────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const inputDisabledCls = "w-full px-4 py-3 bg-light border border-lighter text-primary/50 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-not-allowed";
const labelCls = "block text-[10px] font-black uppercase text-primary/40 tracking-wider";

function numPaxToTipoPax(n: number): "SGL" | "DBL" | "TPL" | "QUAD" | null {
  if (n === 1) return "SGL";
  if (n === 2) return "DBL";
  if (n === 3) return "TPL";
  if (n === 4) return "QUAD";
  return null;
}

export default function DashboardPage() {
  // ── Session ─────────────────────────────────────────────────────────────────
  let sessionData = null;
  try {
    const { data } = useSession();
    sessionData = data;
  } catch {}

  const userName      = sessionData?.user?.name || "Ana Córdova";
  const rawRole       = (sessionData?.user as any)?.role as string | undefined;
  const isAdmin       = rawRole === "SUPERADMIN" || rawRole === "COLABORADOR_INTERNO";
  const agenciaDisplay = (sessionData?.user as any)?.agenciaNombre || "Viajes Andina Tours";
  const userRoleDisplay =
    rawRole === "SUPERADMIN"         ? "Super Administrador" :
    rawRole === "COLABORADOR_INTERNO" ? "Colaborador Interno" :
    rawRole === "ASESOR_MINORISTA"   ? "Asesor de Ventas"    : "Asesor de Ventas";

  // ── Idle session timeout ──────────────────────────────────────────────────
  // 60 min sin actividad → aviso con countdown de 90s → signOut automático.
  const { showWarning, secondsLeft, resetTimer } = useIdleTimer({
    idleMs: 60 * 60 * 1000,
    warningMs: 90 * 1000,
    enabled: !!sessionData,
    onTimeout: () => signOut({ callbackUrl: "/login" }),
  });

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");

  // ── Packages ─────────────────────────────────────────────────────────────────
  const [packages, setPackages]             = useState<Package[]>([]);
  const [isLoadingPackages, setLoadingPkg]  = useState(true);
  const [packagesFetchError, setPkgError]   = useState<"DB_FAIL" | "EMPTY" | null>(null);

  useEffect(() => {
    setLoadingPkg(true);
    api.getPackagesDetailed()
      .then(({ data, error }) => { setPackages(data); setPkgError(error); })
      .catch(() => setPkgError("DB_FAIL"))
      .finally(() => setLoadingPkg(false));
  }, []);

  // ── Cotizaciones ─────────────────────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState<CotizacionExtended[]>([]);
  const [isLoadingCots, setLoadingCots] = useState(false);

  useEffect(() => {
    setLoadingCots(true);
    fetch("/api/cotizaciones")
      .then((r) => r.json())
      .then((data: CotizacionExtended[]) => {
        if (Array.isArray(data) && data.length > 0) setCotizaciones(data);
      })
      .catch(() => {})
      .finally(() => setLoadingCots(false));
  }, []);

  const confirmDeleteDialogRef = useRef<HTMLDialogElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Stepper ──────────────────────────────────────────────────────────────────
  const [step,              setStep]              = useState(1);
  const [quoteLocked,       setQuoteLocked]       = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSavingQuote,   setIsSavingQuote]   = useState(false);
  const [hasDraft,        setHasDraft]        = useState(false);

  // Client fields
  const [clientName,    setClientName]    = useState("");
  const [clientEmail,   setClientEmail]   = useState("");
  const [clientPhone,   setClientPhone]   = useState("");
  const [clientId,      setClientId]      = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Package & dates
  const [selectedPkgId,    setSelectedPkgId]    = useState("1");
  const [expandedCountry,  setExpandedCountry]  = useState<string | null>(null);
  const [travelDateFrom,   setTravelDateFrom]   = useState("");
  const [travelDateTo,     setTravelDateTo]     = useState("");

  // Hotels (legacy — kept for paquetes tab quick-quote flow)
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);

  // Rooms (legacy)
  const [cantSGL,  setCantSGL]  = useState(0);
  const [cantDBL,  setCantDBL]  = useState(1);
  const [cantTPL,  setCantTPL]  = useState(0);
  const [cantQUAD, setCantQUAD] = useState(0);
  const [cantCHD,  setCantCHD]  = useState(0);

  // Passengers / services (legacy)
  const [numPasajeros,  setNumPasajeros]  = useState(0);
  const [childAges,     setChildAges]     = useState<number[]>([]);
  const [childAirfare,  setChildAirfare]  = useState(0);
  const [adultAirfare,  setAdultAirfare]  = useState(0);
  const [extraNights,   setExtraNights]   = useState(0);
  const [agencyMarkup,  setAgencyMarkup]  = useState(0);
  const [cotHotelAccordionOpen, setCotHotelAccordionOpen] = useState<number | null>(null);

  // ── Cotizador dual (nuevo sistema) ──────────────────────────────────────────
  const [cotMode,             setCotMode]             = useState<"catalogo" | "libre">("catalogo");
  const [cotizarData,         setCotizarData]         = useState<CotizarData | null>(null);
  const [cotSelectedPkgId,    setCotSelectedPkgId]    = useState<number | null>(null);
  const [cotSelectedDestinoId,setCotSelectedDestinoId]= useState<number | null>(null);
  const [cotSelectedHotelIds, setCotSelectedHotelIds] = useState<number[]>([]);
  const [cotCustomDias,       setCotCustomDias]       = useState(5);
  const [cotFechaSalida,      setCotFechaSalida]      = useState("");
  const [cotNumPersonas,      setCotNumPersonas]      = useState(2);
  const [cotNumNinos,         setCotNumNinos]         = useState(0);
  const [cotHabs,             setCotHabs]             = useState<Record<string, number>>({});
  const [cotFlightOverride,   setCotFlightOverride]   = useState<boolean | null>(null);
  const [cotFlightPrice,      setCotFlightPrice]      = useState<number>(0);
  // Noches adicionales por destino (#5). Keyed by destinoId. Total derived as cotExtraNights.
  const [cotExtraNightsByDestino, setCotExtraNightsByDestino] = useState<Record<number, number>>({});
  const [cotLibreActSel,      setCotLibreActSel]      = useState<Record<number, boolean>>({});
  const [cotLibreTrsSel,      setCotLibreTrsSel]      = useState<Record<number, boolean>>({});
  const [cotIsMultiDestino,   setCotIsMultiDestino]   = useState(false);
  const [cotExtraDestinoIds,  setCotExtraDestinoIds]  = useState<number[]>([]);
  const [cotFromQuickQuote,   setCotFromQuickQuote]   = useState(false);
  const [cotNinosEdades,      setCotNinosEdades]      = useState<number[]>([]);

  // Marca blanca (persiste en localStorage)
  const [agencyLogo,    setAgencyLogo]    = useState<string | null>(null);
  const [agencyName,    setAgencyName]    = useState("Viajes Andina Tours");
  const [agencyPhone,   setAgencyPhone]   = useState("+593 912345678");
  const [agencyAddress, setAgencyAddress] = useState("Av. Francisco de Orellana, Guayaquil");
  const [defaultMarkup, setDefaultMarkup] = useState("100");
  const [isSavingConfig, setSavingConfig] = useState(false);
  const [configSaved,    setConfigSaved]  = useState(false);

  // Cargar config de agencia desde API + localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("agencyConfig");
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.agencyName)    setAgencyName(cfg.agencyName);
        if (cfg.agencyPhone)   setAgencyPhone(cfg.agencyPhone);
        if (cfg.agencyAddress) setAgencyAddress(cfg.agencyAddress);
        if (cfg.defaultMarkup) {
          setDefaultMarkup(cfg.defaultMarkup);
          setAgencyMarkup(parseInt(cfg.defaultMarkup) || 0);
        }
        if (cfg.agencyLogo)    setAgencyLogo(cfg.agencyLogo);
      } catch {}
    }
    fetch("/api/agency/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nombre)   setAgencyName(data.nombre);
        if (data?.telefono) setAgencyPhone(data.telefono);
      })
      .catch(() => {});
  }, []);

  const handleSaveAgencyConfig = async () => {
    setSavingConfig(true);
    const cfg = { agencyName, agencyPhone, agencyAddress, defaultMarkup, agencyLogo };
    localStorage.setItem("agencyConfig", JSON.stringify(cfg));
    try {
      await fetch("/api/agency/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: agencyName, telefono: agencyPhone, direccion: agencyAddress }),
      });
    } catch {}
    setSavingConfig(false);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  // Búsqueda de cliente existente por email
  const [clientFoundMsg, setClientFoundMsg] = useState<string | null>(null);
  const handleClientEmailBlur = async () => {
    if (!clientEmail) return;
    try {
      const r = await fetch(`/api/clients?email=${encodeURIComponent(clientEmail)}`);
      const c = await r.json();
      if (c?.id) {
        setClientName(c.nombre || clientName);
        setClientPhone(c.telefono || clientPhone);
        setClientId(c.documento || clientId);
        setClientAddress(c.direccion || clientAddress);
        setClientFoundMsg(`Cliente encontrado: ${c.nombre}`);
      } else {
        setClientFoundMsg(null);
      }
    } catch { setClientFoundMsg(null); }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setChildAges((prev) => {
      if (cantCHD > prev.length) return [...prev, ...Array(cantCHD - prev.length).fill(8)];
      return prev.slice(0, cantCHD);
    });
  }, [cantCHD]);

  useEffect(() => {
    setCotNinosEdades((prev) => {
      if (cotNumNinos > prev.length) return [...prev, ...Array(cotNumNinos - prev.length).fill(5)];
      return prev.slice(0, cotNumNinos);
    });
  }, [cotNumNinos]);

  // Auto-derive room distribution from Step 1 passengers (catalog mode only)
  useEffect(() => {
    if (cotMode !== "catalogo") return;
    const typeMap: Record<number, string> = { 1: "SGL", 2: "DBL", 3: "TPL", 4: "QUAD" };
    const adultType = typeMap[cotNumPersonas] ?? null;
    const newHabs: Record<string, number> = {};
    if (adultType) newHabs[adultType] = 1;
    if (cotNumNinos > 0) newHabs["CHD"] = cotNumNinos;
    setCotHabs(newHabs);
  }, [cotMode, cotNumPersonas, cotNumNinos]);

  useEffect(() => {
    fetch("/api/cotizar-datos")
      .then((r) => r.json())
      .then((data: CotizarData) => setCotizarData(data))
      .catch(() => {});
  }, []);

  // Listen for approval confirmations posted from the preview popup window
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "COT_APPROVED") {
        const { cotId, selectedHotelId, selectedHotelIds, total } = event.data as {
          cotId: string;
          selectedHotelId: number | null;
          selectedHotelIds?: number[];
          total: number | null;
        };
        setCotizaciones((prev) =>
          prev.map((c) => {
            if (c.id !== cotId) return c;
            const allIds = selectedHotelIds?.length ? selectedHotelIds : (selectedHotelId != null ? [selectedHotelId] : []);
            const updatedComparison = c.hotelsComparison?.map((h) => ({
              ...h,
              selected: allIds.includes(h.hotelId),
            }));
            return {
              ...c,
              status: "APROBADA" as CotizacionStatus,
              ...(selectedHotelId != null ? { selectedHotelId } : {}),
              ...(total != null ? { total } : {}),
              ...(updatedComparison ? { hotelsComparison: updatedComparison } : {}),
            };
          })
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-open first hotel accordion when entering Step 3
  useEffect(() => {
    if (step === 3 && cotMode === "catalogo") {
      const pkg = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
      const eligible = (pkg?.hoteles ?? []).filter(
        (h) => cotNumNinos <= 0 || h.tarifas.some((t) => t.tipoHabitacion === "CHD" && t.precioBase > 0)
      );
      const firstHotel = eligible[0];
      if (firstHotel) setCotHotelAccordionOpen(firstHotel.id);
    }
  }, [step, cotMode, cotSelectedPkgId, cotizarData, cotNumNinos]);

  // (#3) Default the per-person flight price from the package's real precioBoleto.
  // Only while there's no explicit user override (cotFlightOverride === null).
  useEffect(() => {
    if (cotMode !== "catalogo" || cotFlightOverride !== null) return;
    const pkg = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
    setCotFlightPrice(pkg?.precioBoleto ?? 0);
  }, [cotMode, cotSelectedPkgId, cotizarData, cotFlightOverride]);

  // (#5) Reset per-destino extra nights whenever the selected package changes.
  useEffect(() => {
    setCotExtraNightsByDestino({});
  }, [cotSelectedPkgId]);

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
      if (d.cotSelectedPkgId     !== undefined) setCotSelectedPkgId(d.cotSelectedPkgId);
      if (d.cotSelectedDestinoId !== undefined) setCotSelectedDestinoId(d.cotSelectedDestinoId);
      if (d.cotSelectedHotelIds  !== undefined) setCotSelectedHotelIds(d.cotSelectedHotelIds);
      if (d.cotHabs        !== undefined) setCotHabs(d.cotHabs);
      if (d.cotFechaSalida !== undefined) setCotFechaSalida(d.cotFechaSalida);
      if (d.cotCustomDias  !== undefined) setCotCustomDias(d.cotCustomDias);
      if (d.cotExtraNightsByDestino !== undefined) setCotExtraNightsByDestino(d.cotExtraNightsByDestino);
      if (d.cotFlightOverride !== undefined) setCotFlightOverride(d.cotFlightOverride);
      if (d.cotFlightPrice    !== undefined) setCotFlightPrice(d.cotFlightPrice);
      if (d.cotLibreActSel    !== undefined) setCotLibreActSel(d.cotLibreActSel);
      if (d.cotLibreTrsSel    !== undefined) setCotLibreTrsSel(d.cotLibreTrsSel);
      if (d.cotNumPersonas    !== undefined) setCotNumPersonas(d.cotNumPersonas);
      if (d.cotNumNinos       !== undefined) setCotNumNinos(d.cotNumNinos);
      if (d.cotNinosEdades    !== undefined) setCotNinosEdades(d.cotNinosEdades);
      if (d.cotFromQuickQuote !== undefined) setCotFromQuickQuote(d.cotFromQuickQuote);
      if (d.step !== undefined) setStep(d.step);
      setHasDraft(false);
    } catch {
      // ignore parse errors
    }
  };

  // Auto-save wizard state to sessionStorage (debounced 800ms)
  useEffect(() => {
    if (quoteLocked) return;
    const isFormEmpty = !clientName && !clientEmail && !cotSelectedPkgId && !cotSelectedDestinoId
      && Object.keys(cotHabs).length === 0 && !cotFechaSalida;
    if (isFormEmpty) return;

    const timer = setTimeout(() => {
      const draft: Record<string, unknown> = {
        clientName, clientEmail, clientPhone, clientId, clientAddress,
        cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
        cotHabs, cotFechaSalida, cotCustomDias, cotExtraNightsByDestino,
        cotFlightOverride, cotFlightPrice, cotLibreActSel, cotLibreTrsSel, step,
        cotNumPersonas, cotNumNinos, cotNinosEdades, cotFromQuickQuote,
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 800);

    return () => clearTimeout(timer);
  }, [
    clientName, clientEmail, clientPhone, clientId, clientAddress,
    cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
    cotHabs, cotFechaSalida, cotCustomDias, cotExtraNightsByDestino,
    cotFlightOverride, cotFlightPrice, cotLibreActSel, cotLibreTrsSel, step, quoteLocked,
    cotNumPersonas, cotNumNinos, cotNinosEdades, cotFromQuickQuote,
  ]);

  useEffect(() => {
    if (activeTab !== "cotizar") return;
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) setHasDraft(true);
  }, [activeTab]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedPkg = packages.find((p) => String(p.id) === String(selectedPkgId)) ?? packages[0];

  // ── Cotizador derived ─────────────────────────────────────────────────────────
  const COT_NUM_PAX: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

  const cotSelectedPkg     = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
  const cotSelectedDestino = cotizarData?.destinos.find((d) => d.id === cotSelectedDestinoId) ?? null;
  const cotFlightActive    = cotFlightOverride !== null ? cotFlightOverride : (cotSelectedPkg?.incluyeBoleto ?? false);
  // (#5) Total extra nights across all destinos (per-destino counters are summed here).
  const cotExtraNights = Object.values(cotExtraNightsByDestino).reduce((a, b) => a + b, 0);

  // (#4) A hotel is eligible only if — when children are travelling — it has a valid CHD rate.
  // Always evaluated against live DB data (cotizarData), so adding a CHD price in the admin
  // panel makes the hotel eligible on the next load. Without children every hotel is eligible.
  const hotelHasChildRate = (h: { tarifas: { tipoHabitacion: string; precioBase: number }[] }) =>
    h.tarifas.some((t) => t.tipoHabitacion === "CHD" && t.precioBase > 0);
  const hotelAptoNinos = (h: { tarifas: { tipoHabitacion: string; precioBase: number }[] }) =>
    cotNumNinos <= 0 || hotelHasChildRate(h);
  // Multi-destino: all selected destino objects (primary + extra)
  const cotAllDestinoIds  = cotIsMultiDestino
    ? ([cotSelectedDestinoId, ...cotExtraDestinoIds].filter((id): id is number => id !== null && id !== 0))
    : (cotSelectedDestinoId ? [cotSelectedDestinoId] : []);
  const cotAllDestinos    = cotizarData?.destinos.filter((d) => cotAllDestinoIds.includes(d.id)) ?? [];
  const cotAvailableHotels = cotIsMultiDestino
    ? cotAllDestinos.flatMap((d) => d.hoteles)
    : (cotSelectedDestino?.hoteles ?? []);
  const cotPrimaryHotel    = cotAvailableHotels.find((h) => cotSelectedHotelIds.includes(h.id)) ?? null;
  // Comparative mode: catálogo with >1 hotel OR libre with >1 hotel selected
  const isComparativeMode =
    (cotMode === "catalogo" && (cotSelectedPkg?.hoteles.length ?? 0) > 1) ||
    (cotMode === "libre" && cotSelectedHotelIds.length > 1);

  // Version validation for catalog mode
  const today = new Date().toISOString().split("T")[0];
  // 2 adults = always valid (uses the DBL base price, even without explicit version record).
  // For any other count, look for a non-CHD version whose numPax matches exactly.
  const matchingAdultVersion = cotNumPersonas !== 2
    ? (cotSelectedPkg?.versiones.find(
        (v) => v.numPax === cotNumPersonas && v.tipoPax !== "CHD" && (v.precioPorPersona ?? 0) > 0
      ) ?? null)
    : null;
  const hasMatchingVersion = cotNumPersonas === 2 || matchingAdultVersion !== null;
  const exceedsCapacity    = !!cotSelectedPkg && cotNumPersonas > cotSelectedPkg.numPax;
  // (#6) Warn only when NONE of the package's hotels has a valid CHD rate (live DB check).
  // If at least one hotel supports children, no alert — the non-apt ones are filtered in Step 3.
  const pkgHasAnyChildHotel = !!cotSelectedPkg &&
    cotSelectedPkg.hoteles.some((h) => h.tarifas.some((t) => t.tipoHabitacion === "CHD" && t.precioBase > 0));
  const versionWarning     = cotMode === "catalogo" && cotSelectedPkgId !== null && cotNumPersonas >= 1 &&
    (!hasMatchingVersion || exceedsCapacity);
  const childNoVersionWarn = cotMode === "catalogo" && cotNumNinos > 0 && cotSelectedPkgId !== null && !pkgHasAnyChildHotel;

  // Step guards
  const step1CanProceed = clientName.trim().length > 0 && cotNumPersonas >= 1;
  const step2CanProceed = cotFechaSalida.trim().length > 0 &&
    (cotMode === "catalogo" ? cotSelectedPkgId !== null && !versionWarning : cotSelectedHotelIds.length > 0);
  const cotTotalHabs = Object.values(cotHabs).reduce((sum, qty) => sum + qty, 0);
  const step3CanProceed = isComparativeMode || cotTotalHabs > 0;

  const cotNoches = cotMode === "catalogo"
    ? (cotSelectedPkg?.nochesBase ?? 0) + cotExtraNights
    : Math.max(0, cotCustomDias - 1);

  const cotFechaRetorno = cotFechaSalida
    ? (() => {
        const d = new Date(cotFechaSalida + "T00:00:00");
        const dias = cotMode === "catalogo"
          ? (cotSelectedPkg?.diasEstancia ?? cotCustomDias) + cotExtraNights
          : cotCustomDias;
        d.setDate(d.getDate() + dias);
        return d.toISOString().split("T")[0];
      })()
    : "";

  const getCotPrice = (tipoPax: string): number => {
    if (cotMode === "libre" && cotPrimaryHotel) {
      return cotPrimaryHotel.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
    }
    if (cotMode === "catalogo" && cotSelectedPkg) {
      return cotSelectedPkg.versiones.find((v) => v.tipoPax === tipoPax)?.precioPorPersona ?? 0;
    }
    return 0;
  };

  // ── Catálogo: breakdown por hotel (paridad con el Admin) ──────────────────────
  const cotReqTipoPax = numPaxToTipoPax(cotNumPersonas) ?? "DBL";
  // Noches que cubre cada hotel: base de su parada + noches extra de su destino.
  const cotHotelNoches = (h: CotPaqueteHotel) =>
    (h.noches ?? 1) + (cotExtraNightsByDestino[h.destinoId] ?? 0);

  const cotCatBreakdowns: { hotel: CotPaqueteHotel; bd: HotelBreakdown }[] =
    cotMode === "catalogo" && cotSelectedPkg
      ? cotSelectedPkg.hoteles.filter(hotelAptoNinos).map((hotel) => ({
          hotel,
          bd: calcHotelBreakdown(
            hotel, cotReqTipoPax, cotNinosEdades, cotNumPersonas,
            cotSelectedPkg!.actividades, cotSelectedPkg!.traslados,
            cotFlightActive, cotFlightPrice, agencyMarkup,
            cotHotelNoches(hotel),
          ),
        }))
      : [];

  // Hotel representativo (BORRADOR, sin selección): el más barato por alojamiento de
  // cada destino, combinado. Servicios/boleto/markup se cuentan UNA sola vez.
  const cotCatRep = (() => {
    if (cotCatBreakdowns.length === 0) return null;
    const byDest = new Map<number, { hotel: CotPaqueteHotel; bd: HotelBreakdown }>();
    for (const item of cotCatBreakdowns) {
      const cur = byDest.get(item.hotel.destinoId);
      if (!cur || item.bd.accomTotal < cur.bd.accomTotal) byDest.set(item.hotel.destinoId, item);
    }
    const chosen = [...byDest.values()];
    const repAdultAccomTotal = chosen.reduce((s, c) => s + c.bd.adultAccomTotal, 0);
    const repChildAccomTotal = chosen.reduce((s, c) => s + c.bd.childAccomTotal, 0);
    const repAccomTotal      = repAdultAccomTotal + repChildAccomTotal;
    const ref = cotCatBreakdowns[0].bd; // servicios/boleto son independientes del hotel
    return {
      subtotal:     repAccomTotal + ref.servicesTotal,
      boletoTotal:  ref.boletoTotal,
      precioAdulto: cotNumPersonas > 0 ? repAdultAccomTotal / cotNumPersonas + ref.servicesPerPax : 0,
      precioCHD:    cotNumNinos > 0 ? (repChildAccomTotal + ref.childServicesTotal) / cotNumNinos : 0,
    };
  })();

  // Precio por persona para guardar el detalle (catálogo: derivado del breakdown).
  const getSavePrice = (tipoPax: string): number => {
    if (cotMode === "catalogo" && cotCatRep) {
      if (tipoPax === "CHD") return Math.round(cotCatRep.precioCHD * 100) / 100;
      if (tipoPax === cotReqTipoPax) return Math.round(cotCatRep.precioAdulto * 100) / 100;
      return 0;
    }
    return getCotPrice(tipoPax);
  };

  const cotSubtotalAlojamiento = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .reduce((sum, [tipoPax, qty]) => {
      const precio = getCotPrice(tipoPax);
      const numPax = COT_NUM_PAX[tipoPax] ?? 1;
      return sum + precio * numPax * qty * cotNoches;
    }, 0);

  // Actividades y traslados seleccionados en modo libre — busca en todos los destinos activos
  const cotAllActRef = cotAllDestinos.flatMap((d) => d.actividades);
  const cotAllTrsRef = cotAllDestinos.flatMap((d) => d.traslados);
  const cotLibreActTotal = cotAllDestinos.length > 0
    ? Object.entries(cotLibreActSel).filter(([, sel]) => sel).reduce((sum, [idStr]) => {
        const act = cotAllActRef.find((a) => a.id === Number(idStr));
        const minT = act?.tarifas.sort((a, b) => a.precio - b.precio)[0];
        return sum + (minT?.precio ?? 0);
      }, 0)
    : 0;
  const cotLibreTrsTotal = cotAllDestinos.length > 0
    ? Object.entries(cotLibreTrsSel).filter(([, sel]) => sel).reduce((sum, [idStr]) => {
        const trs = cotAllTrsRef.find((t) => t.id === Number(idStr));
        const minT = trs?.tarifas.sort((a, b) => a.precio - b.precio)[0];
        return sum + (minT?.precio ?? 0);
      }, 0)
    : 0;

  // Costo de noches extra usando tarifas reales de TarifaHotel.
  // (#5) Catálogo: por destino, nochesDelDestino × tarifa/noche del hotel representativo de ese destino.
  const cotExtraCost = (() => {
    if (cotExtraNights <= 0) return 0;
    if (cotMode === "catalogo" && cotSelectedPkg) {
      return cotSelectedPkg.destinos.reduce((destSum, d) => {
        const nights = cotExtraNightsByDestino[d.id] ?? 0;
        if (nights <= 0) return destSum;
        const hotelD = cotSelectedPkg.hoteles.find((h) => h.destinoId === d.id) ?? cotSelectedPkg.hoteles[0];
        if (!hotelD) return destSum;
        const roomsCost = Object.entries(cotHabs)
          .filter(([, qty]) => qty > 0)
          .reduce((sum, [tipoPax, qty]) => {
            const rate = hotelD.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
            return sum + rate * (COT_NUM_PAX[tipoPax] ?? 1) * qty * nights;
          }, 0);
        return destSum + roomsCost;
      }, 0);
    }
    if (cotMode === "libre" && cotPrimaryHotel) {
      return Object.entries(cotHabs)
        .filter(([, qty]) => qty > 0)
        .reduce((sum, [tipoPax, qty]) => {
          const tarifa = cotPrimaryHotel.tarifas?.find((t) => t.tipoHabitacion === tipoPax);
          return sum + (tarifa?.precioBase ?? 0) * (COT_NUM_PAX[tipoPax] ?? 1) * qty * cotExtraNights;
        }, 0);
    }
    return 0;
  })();

  // subtotal — catálogo: breakdown del hotel representativo (alojamiento×noches +
  // servicios prorrateados, niños incluidos); libre: alojamiento + extra + servicios libres.
  const cotSubtotal = cotMode === "catalogo"
    ? (cotCatRep?.subtotal ?? 0)
    : cotSubtotalAlojamiento + cotExtraCost + cotLibreActTotal + cotLibreTrsTotal;

  const cotPaxResumen = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .map(([tipoPax, qty]) => `${qty} ${tipoPax}`)
    .join(" + ") || "—";

  const cotTotalRoomPax = Object.entries(cotHabs)
    .reduce((sum, [tipoPax, qty]) => sum + (COT_NUM_PAX[tipoPax] ?? 1) * qty, 0);

  // boletoTotal = precio por persona × total de pasajeros (catálogo lo toma del breakdown)
  const cotBoletoTotal = cotMode === "catalogo"
    ? (cotCatRep?.boletoTotal ?? 0)
    : (cotFlightActive ? cotFlightPrice * cotTotalRoomPax : 0);
  // total = subtotal + boleto + markup (markup invisible al cliente)
  const cotTotal = cotSubtotal + cotBoletoTotal + agencyMarkup;

  // In catalog mode cotHabs is auto-derived so adults always match; only warn in libre mode.
  const cotAdultRoomPax = Object.entries(cotHabs)
    .filter(([tipoPax]) => tipoPax !== "CHD")
    .reduce((sum, [tipoPax, qty]) => sum + (COT_NUM_PAX[tipoPax] ?? 1) * qty, 0);
  const cotShowPaxWarning = cotMode === "libre" && cotNumPersonas > 0 && cotAdultRoomPax > 0 && cotAdultRoomPax !== cotNumPersonas;

  const cotDestinoCiudad = cotMode === "catalogo"
    ? (cotSelectedPkg?.destinoCiudad ?? "—")
    : (cotAllDestinos.length > 1
        ? cotAllDestinos.map((d) => d.ciudad).join(" + ")
        : (cotSelectedDestino?.ciudad ?? "—"));
  const cotDestinoPais = cotMode === "catalogo"
    ? (cotSelectedPkg?.destinoPais ?? "")
    : (cotAllDestinos.length > 1
        ? [...new Set(cotAllDestinos.map((d) => d.pais))].join(" / ")
        : (cotSelectedDestino?.pais ?? ""));
  const cotDuracion = cotMode === "catalogo"
    ? `${cotSelectedPkg?.diasEstancia ?? "—"} Días / ${cotSelectedPkg?.nochesBase ?? "—"} Noches`
    : `${cotCustomDias} Días / ${cotNoches} Noches`;
  const cotFechasDisplay = cotFechaSalida
    ? `${cotFechaSalida}${cotFechaRetorno ? ` → ${cotFechaRetorno}` : ""}`
    : "Según disponibilidad";

  // KPIs
  const kpiTotal      = cotizaciones.length;
  const kpiAprobadas  = cotizaciones.filter((c) => c.status === "APROBADA").length;
  const kpiRechazadas = cotizaciones.filter((c) => c.status === "RECHAZADA").length;
  const kpiPendientes = cotizaciones.filter((c) => c.status === "ENVIADA" || c.status === "BORRADOR").length;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await signOut({ callbackUrl: "/login" }); } catch { window.location.href = "/login"; }
  };

  const resetForm = () => {
    setStep(1); setQuoteLocked(false);
    setClientName(""); setClientEmail(""); setClientPhone(""); setClientId(""); setClientAddress("");
    setClientFoundMsg(null);
    setSelectedPkgId("1"); setExpandedCountry(null);
    setTravelDateFrom(""); setTravelDateTo("");
    setSelectedHotelIds([]);
    setNumPasajeros(0); setCantSGL(0); setCantDBL(1); setCantTPL(0); setCantQUAD(0); setCantCHD(0);
    setChildAges([]); setChildAirfare(0); setAdultAirfare(0); setExtraNights(0);
    setAgencyMarkup(parseInt(defaultMarkup) || 100);
    // Reset cotizador nuevo
    setCotMode("catalogo");
    setCotSelectedPkgId(null);
    setCotSelectedDestinoId(null);
    setCotSelectedHotelIds([]);
    setCotCustomDias(5);
    setCotFechaSalida("");
    setCotNumPersonas(2);
    setCotNumNinos(0);
    setCotHabs({});
    setCotFlightOverride(null);
    setCotFlightPrice(0);
    setCotExtraNightsByDestino({});
    setCotLibreActSel({});
    setCotLibreTrsSel({});
    setCotIsMultiDestino(false);
    setCotExtraDestinoIds([]);
    setCotFromQuickQuote(false);
    setCotNinosEdades([]);
    clearDraft();
  };

  const handleQuickQuote = (pkgId: string) => {
    resetForm();
    setCotMode("catalogo");
    setCotSelectedPkgId(Number(pkgId));
    setCotFromQuickQuote(true);
    setActiveTab("cotizar");
  };

  const handleHotelToggle = (hotelId: string) => {
    setSelectedHotelIds((prev) => {
      if (prev.includes(hotelId)) return prev.filter((id) => id !== hotelId);
      if (prev.length >= 4) return prev;
      return [...prev, hotelId];
    });
  };

  const handleNumPasajerosChange = (n: number) => {
    setNumPasajeros(n);
    if (n === 5) { setCantSGL(0); setCantDBL(2); setCantTPL(3); setCantQUAD(0); setCantCHD(0); }
  };

  const handleChildAgeChange = (index: number, age: number) => {
    setChildAges((prev) => { const next = [...prev]; next[index] = age; return next; });
  };

  const patchCotizacionStatus = async (id: string, status: CotizacionStatus, extra?: object) => {
    setCotizaciones((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    try {
      await fetch(`/api/cotizaciones/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
    } catch {}
  };

  const handleAprobar  = (id: string) => patchCotizacionStatus(id, "APROBADA");
  const handleRechazar = (id: string) => patchCotizacionStatus(id, "RECHAZADA");

  const handleEliminar = async (id: string) => {
    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/cotizaciones/${id}`, { method: "DELETE" });
    } catch {}
  };

  const handleSaveProforma = async () => {
    let paqueteId: number | null = null;
    let paqueteNombre = "";
    let paqueteDestino = "";
    let paqueteDuracion = "";
    let paqueteIncluye: string[] = [];
    let incluyeBoleto = false;

    if (cotMode === "catalogo" && cotSelectedPkg) {
      paqueteId       = cotSelectedPkg.id;
      paqueteNombre   = cotSelectedPkg.nombre;
      // Multidestino: mostrar todos los destinos
      const destinosLabel = cotSelectedPkg.destinos.length > 1
        ? cotSelectedPkg.destinos.map((d) => d.ciudad).join(" + ")
        : `${cotSelectedPkg.destinoCiudad}, ${cotSelectedPkg.destinoPais}`;
      paqueteDestino  = destinosLabel;
      paqueteDuracion = `${cotSelectedPkg.diasEstancia + cotExtraNights} Días / ${cotSelectedPkg.nochesBase + cotExtraNights} Noches`;
      incluyeBoleto   = cotFlightActive;
      paqueteIncluye  = [
        ...cotSelectedPkg.actividades.map((a) => a.nombre),
        ...cotSelectedPkg.traslados.map((t) => t.tipo),
      ];
    } else if (cotMode === "libre" && cotAllDestinos.length > 0) {
      const cities    = cotAllDestinos.map((d) => d.ciudad).join(" + ");
      const countries = [...new Set(cotAllDestinos.map((d) => d.pais))].join(" / ");
      paqueteNombre   = `Cotización Libre — ${cities}`;
      paqueteDestino  = countries ? `${cities}, ${countries}` : cities;
      paqueteDuracion = `${cotCustomDias} Días / ${cotNoches} Noches`;
      incluyeBoleto   = cotFlightActive;
      const actNombres = cotAllActRef.filter((a) => cotLibreActSel[a.id]).map((a) => a.nombre);
      const trsNombres = cotAllTrsRef.filter((t) => cotLibreTrsSel[t.id]).map((t) => t.tipo);
      paqueteIncluye = [...actNombres, ...trsNombres];
    }

    const now    = new Date();
    const fecha  = now.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
    const cliId  = `cli-${Date.now()}`;
    const codigo = `PRF-${now.getFullYear()}-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const sessionAgenciaId = (sessionData?.user as any)?.agenciaId ?? "unknown";
    const sessionUserId    = (sessionData?.user as any)?.id ?? "unknown";

    const notasParts: string[] = [];
    const notasStr = notasParts.length > 0 ? notasParts.join(" | ") : undefined;

    const r2 = (n: number) => Math.round(n * 100) / 100;
    const hotelsComparison: HotelCompSnapshot[] =
      cotMode === "catalogo" && cotCatBreakdowns.length > 0
        ? cotCatBreakdowns.map(({ hotel, bd }) => {
            const destinoPais = cotSelectedPkg!.destinos.find((d) => d.id === hotel.destinoId)?.pais ?? "";
            return {
              hotelId:          hotel.id,
              nombre:           hotel.nombre,
              estrellas:        hotel.estrellas,
              destinoId:        hotel.destinoId,
              destinoCiudad:    hotel.destinoCiudad,
              destinoPais,
              tipoPax:          cotReqTipoPax,
              adultColPerPax:   r2(bd.adultColPerPax),
              boletoPerPax:     r2(bd.boletoPerPax),
              accomTotal:       r2(bd.accomTotal),
              sharedTotal:      r2(bd.sharedTotal),
              pricePerPax:      r2(bd.pricePerPax),
              avgChildPerPax:   bd.childSupplementPerAdult > 0 ? r2(bd.childSupplementPerAdult) : null,
              total:            r2(bd.total),
            };
          })
        : [];

    const newCot: CotizacionExtended = {
      id: `cot-${Date.now()}`,
      codigo,
      agenciaId:   sessionAgenciaId,
      creadoPorId: sessionUserId,
      paqueteId:   paqueteId ?? 0,
      clienteId: cliId,
      cliente: {
        id: cliId, agenciaId: sessionAgenciaId,
        nombre:    clientName  || "Sin nombre",
        email:     clientEmail || undefined,
        telefono:  clientPhone || undefined,
        documento: clientId    || undefined,
        direccion: clientAddress || undefined,
      },
      paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, incluyeBoleto,
      pasajeros: {
        cantSGL:  cotHabs.SGL  ?? 0, cantDBL:  cotHabs.DBL  ?? 0, cantTPL:  cotHabs.TPL  ?? 0,
        cantQUAD: cotHabs.QUAD ?? 0, cantCHD:  cotHabs.CHD  ?? 0,
      },
      precios: {
        precioSGL:    getSavePrice("SGL"), precioDBL:  getSavePrice("DBL"),
        precioTPL:    getSavePrice("TPL"), precioQUAD: getSavePrice("QUAD"), precioCHD: getSavePrice("CHD"),
        precioBoleto: cotFlightActive && cotFlightPrice > 0 ? cotFlightPrice : undefined,
      },
      subtotal:      cotSubtotal,
      markup:        agencyMarkup,
      total:         cotTotal,
      fechaViaje:    cotFechaSalida  || undefined,
      fechaRetorno:  cotFechaRetorno || undefined,
      status:        "BORRADOR",
      notas:         notasStr,
      fechaCreacion: fecha,
      hotelsComparison: hotelsComparison.length > 0 ? hotelsComparison : undefined,
      selectedHotelId:  null,
    };

    setCotizaciones((prev) => [newCot, ...prev]);
    setQuoteLocked(true);
    clearDraft();

    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:    clientName  || "Sin nombre",
          email:     clientEmail || undefined,
          telefono:  clientPhone || undefined,
          documento: clientId    || undefined,
          direccion: clientAddress || undefined,
        }),
      });
      const clientData = clientRes.ok ? await clientRes.json() : null;
      if (!clientData?.id) return;

      const cotRes = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clientData.id, paqueteId,
          paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, incluyeBoleto,
          cantSGL:  cotHabs.SGL  ?? 0, cantDBL:  cotHabs.DBL  ?? 0, cantTPL:  cotHabs.TPL  ?? 0,
          cantQUAD: cotHabs.QUAD ?? 0, cantCHD:  cotHabs.CHD  ?? 0,
          precioSGL:  getSavePrice("SGL"),  precioDBL:  getSavePrice("DBL"),
          precioTPL:  getSavePrice("TPL"),  precioQUAD: getSavePrice("QUAD"), precioCHD: getSavePrice("CHD"),
          subtotal: cotSubtotal, markup: agencyMarkup, total: cotTotal,
          precioBoleto: cotFlightActive && cotFlightPrice > 0 ? cotFlightPrice : null,
          fechaViaje:   cotFechaSalida   || null,
          fechaRetorno: cotFechaRetorno  || null,
          notas: notasStr,
          hotelsComparison: hotelsComparison.length > 0 ? hotelsComparison : undefined,
        }),
      });
      if (cotRes.ok) {
        const saved = await cotRes.json();
        setCotizaciones((prev) =>
          prev.map((c) => c.id === newCot.id ? { ...c, id: saved.id, codigo: saved.codigo } : c)
        );
        try {
          await fetch("/api/cotizaciones/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cotizacionId:  saved.id,
              codigo:        saved.codigo,
              agenciaEmail:  sessionData?.user?.email,
              agenciaNombre: agenciaDisplay,
              clienteNombre: clientName,
            }),
          });
        } catch {}
      }
    } catch {}
  };

  // ── Unified preview/approval popup ───────────────────────────────────────────
  const handleOpenPreview = (cot: CotizacionExtended) => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fmt = (n: number) => (n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2));
    const safeJSON = (v: unknown) => JSON.stringify(v).replace(/<\/script>/gi, "<\\/script>");
    const today = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
    const isApproved = cot.status === "APROBADA";
    const canApprove = cot.status === "BORRADOR" || cot.status === "ENVIADA";
    const hasComparison = (cot.hotelsComparison?.length ?? 0) > 0;
    const currentSelectedHotelId = cot.selectedHotelId ?? null;
    const activeHotel = cot.hotelsComparison?.find((h) => h.hotelId === currentSelectedHotelId) ?? null;

    const tipos = ["SGL", "DBL", "TPL", "QUAD", "CHD"] as const;
    const typeLabelMap: Record<string, string> = {
      SGL: "Sencilla", DBL: "Doble", TPL: "Triple", QUAD: "Cuádruple", CHD: "Niño (2-11)",
    };
    const rooms = tipos
      .map((t) => ({
        t,
        qty:    ((cot.pasajeros as unknown) as Record<string, number>)[`cant${t}`]  ?? 0,
        precio: ((cot.precios   as unknown) as Record<string, number>)[`precio${t}`] ?? 0,
      }))
      .filter((r) => r.qty > 0);

    const logoHTML = agencyLogo
      ? `<img src="${agencyLogo}" alt="${esc(agencyName)}" style="width:80px;height:32px;object-fit:contain;" />`
      : `<div style="width:72px;height:30px;background:#0B4339;border-radius:5px;display:flex;align-items:center;justify-content:center;"><span style="color:#28BFA9;font-size:10px;font-weight:900;">LTT</span></div>`;

    // Build hotel comparison section with multi-destino support (v2 snapshot) + v1 fallback
    const allHotels = cot.hotelsComparison ?? [];
    const isV2Snapshot = allHotels.length > 0 && allHotels[0].destinoId !== undefined;
    const hasKids    = allHotels.some((h) => (h.avgChildPerPax ?? 0) > 0);
    const hasBoleto  = allHotels.some((h) => (h.boletoPerPax  ?? 0) > 0);
    const tipoPaxLabel = allHotels[0]?.tipoPax ?? "Aloj.";

    // Approved: show only selected hotels (v2: selected flag; v1: fallback to selectedHotelId)
    const hotelsToDisplay = isApproved
      ? (allHotels.some((h) => h.selected)
          ? allHotels.filter((h) => h.selected)
          : activeHotel ? [activeHotel] : allHotels)
      : allHotels;

    let hotelSectionHTML = "";
    if (hotelsToDisplay.length > 0) {
      if (isV2Snapshot) {
        const destMap = new Map<number, { ciudad: string; pais: string; hotels: typeof allHotels }>();
        hotelsToDisplay.forEach((h) => {
          const dId = h.destinoId ?? 0;
          if (!destMap.has(dId)) destMap.set(dId, { ciudad: h.destinoCiudad ?? "", pais: h.destinoPais ?? "", hotels: [] });
          destMap.get(dId)!.hotels.push(h);
        });
        const destiEntries = [...destMap.entries()];
        const isMultiDest  = destiEntries.length > 1;
        const isInteractive = canApprove && hasComparison;

        const buildRows = (dId: number, hotels: typeof allHotels) =>
          hotels.map((h) => {
            const isSel  = h.hotelId === currentSelectedHotelId;
            const stars  = "★".repeat(Math.min(h.estrellas, 5));
            const adultP = h.adultColPerPax != null ? h.adultColPerPax : h.pricePerPax;
            const radioDot = isInteractive
              ? `<td class="radio-col"><div class="radio-dot${isSel ? " radio-checked" : ""}" id="rdot-${dId}-${h.hotelId}"></div></td>`
              : "";
            const onclk   = isInteractive ? ` onclick="selectHotelForDestino(${dId},${h.hotelId})"` : "";
            const rowStyle = isInteractive ? ` style="cursor:pointer"` : "";
            return `<tr class="hotel-row${isSel && isInteractive ? " selected" : ""}" data-hotel-id="${h.hotelId}" data-destino-id="${dId}"${rowStyle}${onclk}>
              ${radioDot}
              <td class="bold">${esc(h.nombre)}</td>
              <td class="center amber">${stars}</td>
              <td class="right">$${fmt(adultP)}</td>
              ${hasKids   ? `<td class="right">${h.avgChildPerPax != null && h.avgChildPerPax > 0 ? "+$" + fmt(h.avgChildPerPax) : "—"}</td>` : ""}
              ${hasBoleto ? `<td class="right">${(h.boletoPerPax ?? 0) > 0 ? "$" + fmt(h.boletoPerPax!) : "—"}</td>` : ""}
            </tr>`;
          }).join("");

        const buildTable = (dId: number, hotels: typeof allHotels) => `
          <table class="hotel-comp-table">
            <thead><tr>
              ${isInteractive ? `<th class="radio-col"></th>` : ""}
              <th>Hotel</th><th class="center">★</th>
              <th class="right">Aloj. ${esc(tipoPaxLabel)}/pax</th>
              ${hasKids   ? `<th class="right">Supl. menores/pax</th>`    : ""}
              ${hasBoleto ? `<th class="right">Boleto/pax</th>` : ""}
            </tr></thead>
            <tbody>${buildRows(dId, hotels)}</tbody>
          </table>`;

        const destGroupsHTML = destiEntries.map(([dId, { ciudad, pais, hotels }]) => `
          <div class="dest-group" data-destino-id="${dId}">
            ${isMultiDest ? `<div class="dest-label">${esc(ciudad)}${pais ? ", " + esc(pais) : ""}</div>` : ""}
            ${buildTable(dId, hotels)}
          </div>`).join("");

        const warnHTML = isInteractive && !currentSelectedHotelId
          ? `<p id="hotel-select-warn" class="note" style="color:#f59e0b;opacity:1;margin-top:8px;">⚠ Selecciona ${isMultiDest ? "un hotel por destino" : "un hotel"} para habilitar la aprobación.</p>`
          : "";

        hotelSectionHTML = `
<div class="section" id="comparison-section">
  <div class="section-title" id="comparison-main-title">${isApproved ? "Hotel(es) Seleccionado(s)" : "Comparativa de Alojamiento"}</div>
  ${destGroupsHTML}
  ${warnHTML}
</div>`;
      } else {
        // v1 backward compat: simple table
        const rows = hotelsToDisplay.map((h) => `<tr>
          <td class="bold">${esc(h.nombre)}</td>
          <td class="center amber">${"★".repeat(h.estrellas)}</td>
          <td class="right">$${fmt(h.pricePerPax)}</td>
          <td class="right bold">$${fmt(h.total)}</td>
        </tr>`).join("");
        hotelSectionHTML = `
<div class="section">
  <div class="section-title">${isApproved ? "Hotel Seleccionado" : "Opciones de Alojamiento"}</div>
  <table>
    <thead><tr><th>Hotel</th><th class="center">★</th><th class="right">Precio/pax</th><th class="right">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
      }
    }

    const toolbarTitle = `Proforma · ${esc(cot.codigo)}`;
    const approveBtn = canApprove
      ? `<button id="btn-approve" onclick="doApprove()" class="btn-approve"${hasComparison && !currentSelectedHotelId ? ` disabled style="opacity:.4;cursor:not-allowed"` : ""}>✓ Aprobar</button>`
      : "";
    const printBtn = `<button id="btn-print" class="btn-print" onclick="window.print()"${isApproved ? "" : ` style="display:none"`}>🖨 Imprimir / Guardar PDF</button>`;

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
.toolbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0B4339;color:white;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;font-size:12px;font-weight:700;gap:8px;flex-wrap:wrap;}
.toolbar-title{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.toolbar-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.toolbar button{padding:6px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;}
.btn-print{background:#28BFA9;color:#0B4339;}
.btn-approve{background:#C9A96E;color:#0B4339;}
.btn-approve:disabled{opacity:.4;cursor:not-allowed;}
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
.note{font-size:8px;color:#0B4339;opacity:.4;margin-top:6px;}
.hotel-comp-table{width:100%;border-collapse:collapse;margin-top:2px;}
.hotel-row{transition:background .12s;}
.hotel-row:hover{background:#F5FAF9;}
.hotel-row.selected{background:#EDFBF6;}
.radio-col{width:28px;padding-right:6px;}
.radio-dot{width:15px;height:15px;border-radius:50%;border:2px solid #CBD5E1;display:inline-flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;vertical-align:middle;}
.radio-dot.radio-checked{border-color:#28BFA9;background:#28BFA9;}
.radio-dot.radio-checked::after{content:'';display:block;width:5px;height:5px;border-radius:50%;background:white;}
.dest-group{margin-bottom:14px;}
.dest-label{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#0B4339;opacity:.45;margin-bottom:4px;}
@media print{.radio-col{display:none!important;}.hotel-row{cursor:default!important;}}
</style>
</head>
<body>
<div class="toolbar">
  <span class="toolbar-title" id="toolbar-title">${toolbarTitle}</span>
  <div class="toolbar-actions">
    ${approveBtn}
    ${printBtn}
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
      ${cot.fechaViaje ? `<div class="field"><label>Salida</label><span>${esc(cot.fechaViaje)}</span></div>` : ""}
      ${cot.fechaRetorno ? `<div class="field"><label>Retorno</label><span>${esc(cot.fechaRetorno)}</span></div>` : ""}
      <div class="field"><label>Pasajeros</label><span>${esc(resumenPasajeros(cot.pasajeros))}</span></div>
      ${cot.incluyeBoleto ? `<div class="field"><label>Boleto</label><span style="color:#28BFA9;">✓ Incluido</span></div>` : ""}
    </div>
  </div>

  ${hotelSectionHTML}

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
          <td id="total-display" class="right green">$${fmt(activeHotel?.total ?? cot.total)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Términos y Condiciones</div>
    <p class="terms-text">${esc(TERMINOS_CONDICIONES)}</p>
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

<script>
var _cotId = ${safeJSON(cot.id)};
var _hotels = ${safeJSON(cot.hotelsComparison ?? [])};
var _hasComparison = ${hasComparison ? "true" : "false"};

// Unique destinos from hotels
var _destinos = (function() {
  var seen = {}, list = [];
  _hotels.forEach(function(h) {
    if (h.destinoId != null && !seen[h.destinoId]) {
      seen[h.destinoId] = true;
      list.push({ id: h.destinoId });
    }
  });
  return list;
}());

// Selection state: destinoId → hotelId
var _selByDestino = {};

// Initialize from snapshot selected flags (v2) or persisted selectedHotelId (v1)
_hotels.forEach(function(h) {
  if (h.selected && h.destinoId != null) _selByDestino[h.destinoId] = h.hotelId;
});
if (Object.keys(_selByDestino).length === 0) {
  var _initSel = ${currentSelectedHotelId !== null ? currentSelectedHotelId : "null"};
  if (_initSel !== null) {
    var _initH = _hotels.find(function(h) { return h.hotelId === _initSel; });
    if (_initH) _selByDestino[_initH.destinoId != null ? _initH.destinoId : 0] = _initH.hotelId;
  }
}

function _canApproveNow() {
  if (_destinos.length === 0) return true;
  return _destinos.every(function(d) { return _selByDestino[d.id] !== undefined; });
}

function selectHotelForDestino(destinoId, hotelId) {
  _selByDestino[destinoId] = hotelId;
  document.querySelectorAll('.hotel-row[data-destino-id="' + destinoId + '"]').forEach(function(el) {
    var isThis = parseInt(el.getAttribute('data-hotel-id')) === hotelId;
    el.classList.toggle('selected', isThis);
    var dot = el.querySelector('.radio-dot');
    if (dot) { dot.classList.toggle('radio-checked', isThis); }
  });
  var ok = _canApproveNow();
  var btn = document.getElementById('btn-approve');
  if (btn) { btn.disabled = !ok; btn.style.opacity = ok ? '1' : '.4'; btn.style.cursor = ok ? 'pointer' : 'not-allowed'; }
  _updateTotal();
}

// Combina hoteles seleccionados sin duplicar servicios/boleto/markup (sharedTotal una vez).
function _combine(selHotels) {
  if (!selHotels.length) return 0;
  var hasV3 = selHotels[0].accomTotal != null && selHotels[0].sharedTotal != null;
  if (!hasV3) return selHotels.reduce(function(s, h) { return s + h.total; }, 0);
  var accom = selHotels.reduce(function(s, h) { return s + (h.accomTotal || 0); }, 0);
  return accom + (selHotels[0].sharedTotal || 0);
}

function _selectedHotels() {
  return _destinos.map(function(d) {
    var hId = _selByDestino[d.id];
    return hId != null ? _hotels.find(function(x) { return x.hotelId === hId; }) : null;
  }).filter(Boolean);
}

function _updateTotal() {
  if (!_canApproveNow()) return;
  var combined = _combine(_selectedHotels());
  var td = document.getElementById('total-display');
  if (td) td.textContent = '$' + (Number.isInteger(combined) ? combined.toLocaleString('es-EC') : combined.toFixed(2));
}

function doApprove() {
  var btn = document.getElementById('btn-approve');
  if (!btn || btn.disabled) return;
  if (_hasComparison && !_canApproveNow()) return;
  btn.textContent = '⏳ Aprobando...';
  btn.disabled = true;

  var selIds = _destinos.length > 0
    ? _destinos.map(function(d) { return _selByDestino[d.id]; }).filter(function(id) { return id != null; })
    : [];
  var primaryId = selIds[0] || null;
  var selHotels = selIds.map(function(hId) { return _hotels.find(function(h) { return h.hotelId === hId; }); }).filter(Boolean);
  var combined  = _combine(selHotels);
  var names     = selHotels.map(function(h) { return h.nombre; }).join(', ');

  var payload = { status: 'APROBADA', nota: 'Hotel(es) seleccionado(s): ' + names };
  if (primaryId) payload.selectedHotelId = primaryId;
  if (selIds.length > 1) payload.selectedHotelIds = selIds;
  payload.total = Math.round(combined * 100) / 100;

  fetch('/api/cotizaciones/' + _cotId + '/status', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(r) {
    if (r.ok) {
      if (window.opener) {
        window.opener.postMessage({ type: 'COT_APPROVED', cotId: _cotId, selectedHotelId: primaryId, selectedHotelIds: selIds, total: combined }, '*');
      }
      btn.remove();
      var pBtn = document.getElementById('btn-print');
      if (pBtn) pBtn.style.display = 'inline-block';
      var warn = document.getElementById('hotel-select-warn');
      if (warn) warn.remove();
      var mainTitle = document.getElementById('comparison-main-title');
      if (mainTitle) mainTitle.textContent = 'Hotel(es) Seleccionado(s)';
      document.querySelectorAll('.hotel-row').forEach(function(el) {
        var hId = parseInt(el.getAttribute('data-hotel-id'));
        var dId = parseInt(el.getAttribute('data-destino-id'));
        if (_selByDestino[dId] !== hId) el.style.display = 'none';
        else { el.style.cursor = 'default'; el.removeAttribute('onclick'); }
      });
    } else {
      btn.textContent = '✓ Aprobar'; btn.disabled = false;
      alert('Error al aprobar. Por favor intenta nuevamente.');
    }
  }).catch(function() {
    btn.textContent = '✓ Aprobar'; btn.disabled = false;
    alert('Error de conexión. Por favor intenta nuevamente.');
  });
}
</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Permite ventanas emergentes para ver la proforma."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardContext.Provider value={{
      cotizaciones,
      setCotizaciones,
      isLoadingCots,
      agencyName,
      agencyPhone,
      agencyAddress,
      agencyLogo,
      agencyMarkup,
      setAgencyMarkup,
      defaultMarkup,
      userName,
      agenciaDisplay,
      userRoleDisplay,
      isAdmin,
      rawRole,
      kpiTotal,
      kpiAprobadas,
      kpiRechazadas,
      kpiPendientes,
      handleEliminar,
      patchCotizacionStatus,
      handleLogout,
    }}>
    <div className="h-screen overflow-hidden bg-[#F4FAF8] flex font-inter text-primary select-none">

      {/* ── Aviso de sesión por inactividad ── */}
      <SessionTimeoutModal
        isOpen={showWarning}
        secondsLeft={secondsLeft}
        onContinue={resetTimer}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
      />

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 h-screen bg-primary-dark text-white flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(5,41,36,0.15)] relative z-20 overflow-y-auto">
        <div className="flex flex-col">
          <div className="p-6 border-b border-white/5 flex flex-col gap-2">
            <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center justify-center">
              <div className="relative w-full h-10">
                <Image src="/images/lttlogo.png" alt="Land Tour Travel" fill className="object-contain" priority />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Portal de Agencias</span>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <div className="space-y-1.5">
              <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">Principal</span>
              {[
                { id: "dashboard",    icon: <LayoutDashboard size={16} />, label: "Dashboard" },
                { id: "paquetes",     icon: <Compass size={16} />,         label: "Paquetes" },
                { id: "cotizar",      icon: <Plus size={16} className="stroke-[2.5]" />, label: "Nueva Cotización" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { if (activeTab === "cotizar") resetForm(); setActiveTab(item.id); if (item.id === "cotizar") resetForm(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">Gestión</span>
              <button
                onClick={() => { if (activeTab === "cotizar") resetForm(); setActiveTab("cotizaciones"); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "cotizaciones"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3"><FileSpreadsheet size={16} /> Cotizaciones</div>
                <span className="w-5 h-5 rounded-full bg-secondary text-primary font-black text-[10px] flex items-center justify-center shrink-0 border border-primary-dark/20">
                  {kpiPendientes}
                </span>
              </button>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-primary-dark/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border border-white/10 shrink-0 shadow-inner">
              {userName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white truncate leading-tight">{userName}</h4>
              <p className="text-[9px] font-bold text-secondary mt-0.5">{userRoleDisplay}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={13} className="stroke-[2.5]" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden custom-scrollbar">

        {/* Header */}
        <header className="h-14 lg:h-[76px] bg-white border-b border-gray-100 px-4 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm gap-3">
          {/* Mobile: logo LTT disimulado | Desktop: título + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden relative w-[60px] h-[20px] opacity-60 shrink-0">
              <Image src="/images/lttlogo.png" alt="LTT" fill className="object-contain" />
            </div>
            <h2 className="lg:hidden text-[11px] font-black text-primary uppercase tracking-widest truncate">
              {activeTab === "dashboard"    && "Dashboard"}
              {activeTab === "paquetes"     && "Paquetes"}
              {activeTab === "cotizar"      && "Nueva Cotización"}
              {activeTab === "cotizaciones" && "Cotizaciones"}
              {activeTab === "perfil"       && "Mi Perfil"}
            </h2>
            <div className="hidden lg:flex flex-col">
              <h2 className="text-base font-black text-primary uppercase tracking-widest leading-none">
                {activeTab === "dashboard"    && "Dashboard"}
                {activeTab === "paquetes"     && "Paquetes"}
                {activeTab === "cotizar"      && "Nueva Cotización"}
                {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
                {activeTab === "perfil"       && "Mi Perfil"}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1.5">
                <span>Inicio</span><span>/</span>
                <span className="text-secondary">
                  {activeTab === "dashboard"    && "Dashboard"}
                  {activeTab === "paquetes"     && "Paquetes"}
                  {activeTab === "cotizar"      && "Nueva Cotización"}
                  {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
                  {activeTab === "perfil"       && "Mi Perfil"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Portal badge — móvil */}
            <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[9px] font-black text-secondary uppercase tracking-wider">Portal</span>
            </div>
            {/* Agency badge — desktop */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-[#F4FAF8] border border-[#EDF7F5] rounded-xl text-[10px] font-black text-primary uppercase tracking-wider">
              <Building2 size={12} className="text-secondary" /> {agenciaDisplay}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">

          {/* ════════════════════════ DASHBOARD ════════════════════════ */}
          {activeTab === "dashboard" && (
            <DashboardTab
              onGoToCotizaciones={() => setActiveTab("cotizaciones")}
              onViewCot={handleOpenPreview}
            />
          )}

          {/* ════════════════════════ PAQUETES ════════════════════════ */}
          {activeTab === "paquetes" && (
            <PaquetesTab
              packages={packages}
              isLoadingPackages={isLoadingPackages}
              packagesFetchError={packagesFetchError}
              onQuickQuote={handleQuickQuote}
            />
          )}

          {/* ════════════════════════ NUEVA COTIZACIÓN (STEPPER) ════════════════════════ */}
          {activeTab === "cotizar" && (
            <div className="space-y-6 animate-fade-scale">

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

              {/* Stepper progress */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center max-w-2xl mx-auto">
                  {[
                    { s: 1, label: "Cliente" },
                    { s: 2, label: "Configuración" },
                    { s: 3, label: "Habitaciones" },
                    { s: 4, label: "Revisión" },
                  ].map((si, i, arr) => {
                    const active = step >= si.s;
                    return (
                      <React.Fragment key={si.s}>
                        <div className="flex flex-col items-center gap-1.5 relative">
                          <button
                            type="button"
                            onClick={() => { if (quoteLocked) setStep(si.s); }}
                            disabled={!quoteLocked}
                            className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border-2 transition-all
                              ${active ? "bg-secondary border-secondary text-primary shadow-glow scale-110" : "border-gray-200 bg-white text-gray-400"}
                              ${quoteLocked ? "cursor-pointer hover:scale-110" : "cursor-default"}
                            `}
                            title={quoteLocked ? `Ir al paso ${si.s}` : undefined}
                          >
                            {si.s}
                          </button>
                          <span className={`hidden sm:block text-[10px] font-black uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${active ? "text-primary" : "text-gray-400"}`}>{si.label}</span>
                        </div>
                        {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-4 transition-all ${step > si.s ? "bg-secondary" : "bg-gray-200"}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="h-6 relative">
                  <p className="text-center text-[10px] font-black text-primary/50 uppercase tracking-wider mt-1 sm:hidden">
                    Paso {step}:{" "}
                    {step === 1 ? "Cliente" : step === 2 ? "Configuración" : step === 3 ? "Habitaciones" : "Revisión"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">

                  {/* ── PASO 1: DATOS DEL CLIENTE ── */}
                  {step === 1 && (
                    <fieldset disabled={quoteLocked} className="bg-white p-6 md:p-8 rounded-3xl border border-solid border-gray-100 shadow-sm space-y-5 min-w-0">
                      <div className="border-b border-gray-50 pb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Datos del Cliente
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="client-name" className={labelCls}>Nombre Completo *</label>
                          <input id="client-name" type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="client-email" className={labelCls}>Correo Electrónico</label>
                          <input id="client-email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} onBlur={handleClientEmailBlur} placeholder="cliente@email.com" className={inputCls} />
                          {clientFoundMsg && <p className="text-[10px] font-bold text-secondary mt-1">{clientFoundMsg}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="client-phone" className={labelCls}>Teléfono / WhatsApp</label>
                          <input id="client-phone" type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+593 9XXXXXXXX" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="client-doc" className={labelCls}>Identificación / C.I.</label>
                          <input id="client-doc" type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Opcional" className={inputCls} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="client-address" className={labelCls}>Dirección</label>
                          <input id="client-address" type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Dirección del cliente" className={inputCls} />
                        </div>

                        {/* Agency read-only tag */}
                        <div className="space-y-1.5">
                          <label className={labelCls}>Agencia Minorista</label>
                          <div className="flex items-center gap-2.5 px-4 py-3 bg-secondary/8 border border-secondary/20 rounded-2xl">
                            <Building2 size={13} className="text-secondary shrink-0" />
                            <span className="text-xs font-black text-secondary truncate">{agenciaDisplay}</span>
                          </div>
                        </div>

                        {/* Agent name disabled */}
                        <div className="space-y-1.5">
                          <label className={labelCls}>Ejecutivo de Cuenta</label>
                          <input type="text" disabled value={userName} className={inputDisabledCls} />
                        </div>
                      </div>

                      {/* ── Pasajeros del Viaje ── */}
                      <div className="border-t border-gray-50 pt-5">
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4">
                          <span className="w-2.5 h-2.5 rounded bg-secondary/50 inline-block" /> Pasajeros del Viaje
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label htmlFor="cot-adultos" className={labelCls}>Adultos *</label>
                            <input
                              id="cot-adultos" type="number" min={1} max={50} required
                              value={cotNumPersonas || ""}
                              onChange={(e) => setCotNumPersonas(Math.max(1, Number(e.target.value) || 0))}
                              placeholder="Ej. 2"
                              className={inputCls}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="cot-ninos" className={labelCls}>Niños (2–11 años)</label>
                            <input
                              id="cot-ninos" type="number" min={0} max={10}
                              value={cotNumNinos || ""}
                              onChange={(e) => setCotNumNinos(Math.max(0, Number(e.target.value) || 0))}
                              placeholder="0"
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* Edades de niños — aparecen dinámicamente */}
                        {cotNumNinos > 0 && (
                          <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl space-y-3">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle size={11} /> Edad exacta de cada niño
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {cotNinosEdades.map((edad, idx) => (
                                <div key={idx} className="space-y-1">
                                  <label className={labelCls}>Niño {idx + 1}</label>
                                  <select
                                    value={edad}
                                    onChange={(e) => {
                                      const next = [...cotNinosEdades];
                                      next[idx] = Number(e.target.value);
                                      setCotNinosEdades(next);
                                    }}
                                    className={inputCls}
                                  >
                                    {Array.from({ length: 12 }, (_, i) => i + 2).map((a) => (
                                      <option key={a} value={a}>{a} años</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                            <p className="text-[9px] text-amber-600/70 font-bold">Las edades se usan para verificar las políticas de niños del paquete.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        {!step1CanProceed && (
                          <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                            <AlertCircle size={11} className="shrink-0" />
                            {!clientName.trim() ? "El nombre del cliente es obligatorio." : "Indica la cantidad de adultos que viajan."}
                          </p>
                        )}
                        <button
                          onClick={() => { if (step1CanProceed) setStep(2); }}
                          disabled={!step1CanProceed || quoteLocked}
                          className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                          Siguiente Paso <ChevronRight size={14} />
                        </button>
                      </div>
                    </fieldset>
                  )}

                  {/* ── PASO 2: CONFIGURACIÓN DEL VIAJE ── */}
                  {step === 2 && (
                    <fieldset disabled={quoteLocked} className="bg-white p-6 md:p-8 rounded-3xl border border-solid border-gray-100 shadow-sm space-y-6 min-w-0">
                      <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Configuración del Viaje
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Paso 2 de 4</span>
                      </div>

                      {/* Selector de modo */}
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { mode: "catalogo" as const, label: "Paquetes Disponibles", desc: "Elige de los paquetes armados por Land Tour Travel", icon: <Compass size={18} /> },
                          { mode: "libre" as const,    label: "Armar desde Cero", desc: "Selecciona destino, hotel y servicios manualmente", icon: <Globe size={18} /> },
                        ] as const).map(({ mode, label, desc, icon }) => (
                          <button
                            key={mode} type="button" onClick={() => setCotMode(mode)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${cotMode === mode ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-secondary/30 hover:bg-light/40"}`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${cotMode === mode ? "bg-secondary text-primary" : "bg-light text-primary/50"}`}>{icon}</div>
                            <p className="text-xs font-black text-primary">{label}</p>
                            <p className="text-[10px] text-primary/40 font-bold mt-0.5">{desc}</p>
                          </button>
                        ))}
                      </div>

                      {/* Modo Catálogo */}
                      {cotMode === "catalogo" && (
                        <div className="space-y-4">
                          <label className={labelCls}>Programa Turístico *</label>

                          {/* Paquete bloqueado (viene de quick-quote) */}
                          {cotFromQuickQuote && cotSelectedPkg ? (
                            <div className="p-4 bg-secondary/5 border-2 border-secondary/30 rounded-2xl flex items-start gap-4">
                              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                <CheckCircle2 size={18} className="text-primary" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-black text-primary">{cotSelectedPkg.nombre}</p>
                                <p className="text-[10px] text-primary/50 font-bold mt-0.5">
                                  {cotSelectedPkg.destinoCiudad}, {cotSelectedPkg.destinoPais} · {cotSelectedPkg.diasEstancia}d / {cotSelectedPkg.nochesBase}n
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setCotFromQuickQuote(false); setCotSelectedPkgId(null); }}
                                className="text-[9px] font-black text-primary/40 hover:text-secondary underline cursor-pointer transition-colors shrink-0"
                              >
                                Cambiar
                              </button>
                            </div>
                          ) : cotizarData === null ? (
                            <div className="flex items-center gap-2 py-4 text-primary/40 text-xs font-bold">
                              <div className="w-4 h-4 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                              Cargando paquetes...
                            </div>
                          ) : cotizarData.paquetes.length === 0 ? (
                            <div className="py-8 text-center">
                              <Globe size={24} className="text-primary/20 mx-auto mb-2" />
                              <p className="text-primary/50 font-bold text-xs">No hay paquetes disponibles en este momento.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {Object.entries(
                                cotizarData.paquetes.reduce<Record<string, CotPaquete[]>>((acc, p) => {
                                  const key = p.destinoPais || "Otros";
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(p);
                                  return acc;
                                }, {})
                              ).map(([pais, pkgs]) => (
                                <div key={pais} className="border border-gray-100 rounded-2xl overflow-hidden">
                                  <button
                                    onClick={() => setExpandedCountry(expandedCountry === pais ? null : pais)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 bg-light hover:bg-secondary/5 transition-all cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <Globe size={13} className="text-secondary" />
                                      <span className="text-xs font-black text-primary uppercase tracking-wider">{pais}</span>
                                      <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[9px] font-black rounded-md">{pkgs.length} prog.</span>
                                    </div>
                                    {expandedCountry === pais ? <ChevronUp size={14} className="text-primary/40" /> : <ChevronDown size={14} className="text-primary/40" />}
                                  </button>
                                  {expandedCountry === pais && (
                                    <div className="divide-y divide-gray-50 bg-white">
                                      {pkgs.map((pkg) => {
                                        const isSel = cotSelectedPkgId === pkg.id;
                                        return (
                                          <div key={pkg.id} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${isSel ? "bg-secondary/5 border-l-2 border-secondary" : "hover:bg-light/50"}`}>
                                            <div className="min-w-0">
                                              <p className="text-xs font-black text-primary truncate">{pkg.nombre}</p>
                                              <p className="text-[10px] text-primary/40 font-bold mt-0.5">{pkg.destinoCiudad} · {pkg.diasEstancia}d / {pkg.nochesBase}n</p>
                                            </div>
                                            <button
                                              onClick={() => setCotSelectedPkgId(pkg.id)}
                                              className={`ml-4 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 ${isSel ? "bg-secondary text-primary" : "bg-light border border-lighter text-primary/60 hover:border-secondary/30 hover:text-secondary"}`}
                                            >
                                              {isSel ? "✓ Seleccionado" : "Seleccionar"}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Warning: versión no configurada o capacidad excedida */}
                          {versionWarning && (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1.5">
                                {exceedsCapacity ? (
                                  <p className="text-xs font-black text-amber-700">
                                    Este paquete está configurado para máximo {cotSelectedPkg!.numPax} adulto{cotSelectedPkg!.numPax !== 1 ? "s" : ""}.
                                    Declaraste {cotNumPersonas} adultos.
                                  </p>
                                ) : (
                                  <p className="text-xs font-black text-amber-700">
                                    Sin versión configurada para {cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""}.
                                  </p>
                                )}
                                <p className="text-[10px] font-bold text-amber-600">
                                  Solicita al administrador configurar la versión o realiza una{" "}
                                  <button
                                    type="button"
                                    onClick={() => setCotMode("libre")}
                                    className="underline font-black cursor-pointer hover:text-amber-700"
                                  >
                                    Cotización Libre
                                  </button>
                                  .
                                </p>
                                {cotSelectedPkg && cotSelectedPkg.versiones.filter((v) => v.tipoPax !== "CHD").length > 0 && (
                                  <p className="text-[9px] text-amber-500 font-bold">
                                    Versiones disponibles:{" "}
                                    {cotSelectedPkg.versiones
                                      .filter((v) => v.tipoPax !== "CHD")
                                      .map((v) => `${v.numPax} pax — ${v.tipoPax}`)
                                      .join(" · ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Warning: paquete sin versión CHD pero hay niños */}
                          {childNoVersionWarn && (
                            <div className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                              <AlertCircle size={14} className="text-sky-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-bold text-sky-700">
                                Ninguno de los hoteles de este paquete tiene tarifa de niños (CHD) configurada. Verifica con el administrador antes de cotizar con menores.
                              </p>
                            </div>
                          )}

                          {/* Fechas */}
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Salida</label>
                              <input type="date" min={today} value={cotFechaSalida} onChange={(e) => setCotFechaSalida(e.target.value)} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                              <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Retorno</label>
                              <input type="text" disabled value={cotFechaRetorno || "Calculada automáticamente"} className={inputDisabledCls} />
                            </div>
                          </div>

                          {/* Multi-destination badge */}
                          {cotSelectedPkg && cotSelectedPkg.destinos.length > 1 && (
                            <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-2xl">
                              <p className="text-[10px] font-black text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Plane size={10} /> Paquete Multidestino — {cotSelectedPkg.destinos.length} destinos
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {cotSelectedPkg.destinos.map((d) => (
                                  <span key={d.id} className="px-2.5 py-1 bg-white border border-secondary/20 rounded-lg text-[10px] font-black text-primary">
                                    {d.ciudad}, {d.pais}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Noches adicionales: se configuran en el Paso 3 (por destino). */}

                          {/* Flight toggle — controlado por permitirModificarBoleto */}
                          {cotSelectedPkg && (
                            <div className="mt-4 p-4 bg-light border border-lighter rounded-2xl space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Plane size={13} className="text-secondary" />
                                  <span className="text-xs font-black text-primary uppercase tracking-wider">Boleto Aéreo</span>
                                  {cotSelectedPkg.incluyeBoleto && cotFlightOverride === null && (
                                    <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[9px] font-black rounded-md">Incluido en paquete</span>
                                  )}
                                  {!cotSelectedPkg.permitirModificarBoleto && (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-md">No modificable</span>
                                  )}
                                </div>
                                {cotSelectedPkg.permitirModificarBoleto ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (cotFlightOverride === null) {
                                        setCotFlightOverride(!cotSelectedPkg.incluyeBoleto);
                                        if (!cotSelectedPkg.incluyeBoleto === false) setCotFlightPrice(0);
                                        else if (cotSelectedPkg.precioBoleto) setCotFlightPrice(cotSelectedPkg.precioBoleto);
                                      } else {
                                        setCotFlightOverride((prev) => !prev);
                                      }
                                    }}
                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${cotFlightActive ? "bg-secondary" : "bg-gray-200"}`}
                                    aria-label="Toggle boleto aéreo"
                                  >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cotFlightActive ? "translate-x-5" : "translate-x-0"}`} />
                                  </button>
                                ) : (
                                  <span className={`relative w-11 h-6 rounded-full flex items-center shrink-0 ${cotSelectedPkg.incluyeBoleto ? "bg-secondary" : "bg-gray-200"} opacity-60`}>
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${cotSelectedPkg.incluyeBoleto ? "left-[calc(100%-22px)]" : "left-0.5"}`} />
                                  </span>
                                )}
                              </div>
                              {cotSelectedPkg.descripcionBoleto && cotFlightActive && (
                                <p className="text-[10px] text-primary/50 font-bold">{cotSelectedPkg.descripcionBoleto}</p>
                              )}
                              {cotFlightActive && cotSelectedPkg.permitirModificarBoleto && (
                                <div className="space-y-1.5">
                                  <label className={labelCls}>Precio boleto por persona (USD)</label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xs font-black">$</span>
                                    <input
                                      type="number" min={0} step={1} value={cotFlightPrice}
                                      onChange={(e) => setCotFlightPrice(Math.max(0, Number(e.target.value)))}
                                      placeholder={String(cotSelectedPkg.precioBoleto ?? 0)}
                                      className={`${inputCls} pl-8`}
                                    />
                                  </div>
                                  <p className="text-[10px] text-primary/40 font-bold">
                                    Total boleto: ${(cotFlightPrice * cotTotalRoomPax).toLocaleString()} ({cotTotalRoomPax} pax × ${cotFlightPrice})
                                  </p>
                                </div>
                              )}
                              {cotFlightActive && !cotSelectedPkg.permitirModificarBoleto && cotSelectedPkg.precioBoleto && (
                                <p className="text-[10px] text-primary/50 font-bold">
                                  Precio fijo: ${cotSelectedPkg.precioBoleto}/persona · Total: ${(cotSelectedPkg.precioBoleto * cotTotalRoomPax).toLocaleString()}
                                </p>
                              )}
                              {cotFlightOverride !== null && cotSelectedPkg.permitirModificarBoleto && (
                                <button
                                  type="button"
                                  onClick={() => { setCotFlightOverride(null); setCotFlightPrice(cotSelectedPkg.precioBoleto ?? 0); }}
                                  className="text-[10px] text-primary/40 hover:text-secondary font-bold underline cursor-pointer transition-colors"
                                >
                                  Restaurar configuración del paquete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Modo Libre */}
                      {cotMode === "libre" && (
                        <div className="space-y-4">
                          {/* Toggle multidestino */}
                          <div className="flex items-center justify-between p-3 bg-light border border-lighter rounded-2xl">
                            <div>
                              <p className="text-xs font-black text-primary">Cotización Multidestino</p>
                              <p className="text-[10px] text-primary/40 font-bold mt-0.5">Agrega múltiples destinos al itinerario</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setCotIsMultiDestino((v) => !v); setCotExtraDestinoIds([]); setCotSelectedHotelIds([]); }}
                              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${cotIsMultiDestino ? "bg-secondary" : "bg-gray-200"}`}
                              aria-label="Toggle multidestino"
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cotIsMultiDestino ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Destino principal */}
                          <div className="space-y-1.5">
                            <label className={labelCls}>{cotIsMultiDestino ? "Destino Principal *" : "Destino *"}</label>
                            {cotizarData === null ? (
                              <div className="flex items-center gap-2 py-3 text-primary/40 text-xs font-bold">
                                <div className="w-4 h-4 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                Cargando destinos...
                              </div>
                            ) : (
                              <select
                                value={cotSelectedDestinoId ?? ""}
                                onChange={(e) => { setCotSelectedDestinoId(Number(e.target.value) || null); setCotSelectedHotelIds([]); setCotExtraDestinoIds([]); }}
                                className={inputCls}
                              >
                                <option value="">Seleccionar destino...</option>
                                {cotizarData.destinos.map((d) => (
                                  <option key={d.id} value={d.id}>{d.ciudad}, {d.pais}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Destinos adicionales (multidestino) */}
                          {cotIsMultiDestino && cotizarData && (
                            <div className="space-y-2">
                              <label className={labelCls}>Destinos adicionales</label>
                              {cotExtraDestinoIds.map((extraId, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <select
                                    value={extraId || ""}
                                    onChange={(e) => {
                                      const newId = Number(e.target.value) || 0;
                                      setCotExtraDestinoIds((prev) => prev.map((id, i) => i === idx ? newId : id));
                                      setCotSelectedHotelIds([]);
                                    }}
                                    className={`${inputCls} flex-1`}
                                  >
                                    <option value="">Seleccionar destino...</option>
                                    {cotizarData.destinos
                                      .filter((d) => d.id !== cotSelectedDestinoId && cotExtraDestinoIds.every((id, i) => i === idx || id !== d.id))
                                      .map((d) => (
                                        <option key={d.id} value={d.id}>{d.ciudad}, {d.pais}</option>
                                      ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => { setCotExtraDestinoIds((prev) => prev.filter((_, i) => i !== idx)); setCotSelectedHotelIds([]); }}
                                    className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-400 hover:bg-rose-100 rounded-xl transition-all cursor-pointer shrink-0"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              ))}
                              {cotExtraDestinoIds.length < 3 && (
                                <button
                                  type="button"
                                  onClick={() => setCotExtraDestinoIds((prev) => [...prev, 0])}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-secondary/20 transition-all cursor-pointer"
                                >
                                  <Plus size={11} /> Agregar destino
                                </button>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>Cantidad de Días</label>
                              <input type="number" min={2} max={30} value={cotCustomDias} onChange={(e) => setCotCustomDias(Math.max(2, Number(e.target.value)))} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>Noches (calculado)</label>
                              <input type="text" disabled value={`${cotNoches} noches`} className={inputDisabledCls} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Salida</label>
                              <input type="date" min={today} value={cotFechaSalida} onChange={(e) => setCotFechaSalida(e.target.value)} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                              <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Retorno</label>
                              <input type="text" disabled value={cotFechaRetorno || "—"} className={inputDisabledCls} />
                            </div>
                          </div>

                          {/* Hoteles, traslados y actividades — agrupados por destino en multidestino */}
                          {cotAllDestinos.length > 0 && (
                            <div className="space-y-4">
                              {cotAllDestinos.map((destino) => {
                                // (#4) Con niños, ocultar hoteles sin tarifa CHD válida.
                                const hotelsPorDestino = destino.hoteles.filter(hotelAptoNinos);
                                return (
                                  <div key={destino.id} className={cotIsMultiDestino ? "p-4 bg-light border border-lighter rounded-2xl space-y-3" : "space-y-4"}>
                                    {/* Título de destino solo en multidestino */}
                                    {cotIsMultiDestino && (
                                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <MapPin size={10} /> {destino.ciudad}, {destino.pais}
                                      </p>
                                    )}

                                    {/* ── Hoteles ── */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <label className={labelCls}>Hoteles en {destino.ciudad} (máx. 4 total)</label>
                                        {cotSelectedHotelIds.length > 0 && !cotIsMultiDestino && (
                                          <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20">
                                            {cotSelectedHotelIds.length} seleccionado{cotSelectedHotelIds.length > 1 ? "s" : ""}
                                          </span>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        {hotelsPorDestino.map((hotel) => {
                                          const checked  = cotSelectedHotelIds.includes(hotel.id);
                                          const disabled = !checked && cotSelectedHotelIds.length >= 4;
                                          const dblRate  = hotel.tarifas.find((t) => t.tipoHabitacion === "DBL")?.precioBase ?? 0;
                                          const sglRate  = hotel.tarifas.find((t) => t.tipoHabitacion === "SGL")?.precioBase ?? 0;
                                          return (
                                            <button
                                              key={hotel.id} type="button"
                                              onClick={() => {
                                                if (disabled) return;
                                                setCotSelectedHotelIds((prev) =>
                                                  prev.includes(hotel.id) ? prev.filter((id) => id !== hotel.id) : [...prev, hotel.id]
                                                );
                                              }}
                                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer ${checked ? "border-secondary bg-secondary/5 shadow-sm" : disabled ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-100 hover:border-secondary/40 hover:bg-light/60"}`}
                                            >
                                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                                                {checked && <Check size={11} className="text-primary stroke-[3]" />}
                                              </div>
                                              <div className="flex-grow min-w-0">
                                                <p className="text-xs font-black text-primary">{hotel.nombre}</p>
                                                <p className="text-[10px] text-primary/40 font-bold mt-0.5">{"★".repeat(hotel.estrellas)} · DBL ${dblRate}/noche · SGL ${sglRate}/noche</p>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                  {hotel.tarifas.map((t) => (
                                                    <span key={t.tipoHabitacion} className="px-1.5 py-0.5 bg-white border border-gray-100 text-[8px] font-black text-primary/50 rounded">
                                                      {t.tipoHabitacion} ${t.precioBase}/n
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {cotSelectedHotelIds.length === 0 && !cotIsMultiDestino && (
                                        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5"><AlertCircle size={11} /> Selecciona al menos un hotel para continuar.</p>
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                              {cotIsMultiDestino && cotSelectedHotelIds.length === 0 && (
                                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5"><AlertCircle size={11} /> Selecciona al menos un hotel para continuar.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(1)} disabled={quoteLocked} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Atrás</button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:ml-auto">
                          {!step2CanProceed && (
                            <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                              <AlertCircle size={11} className="shrink-0" />
                              {cotMode === "catalogo"
                                ? (!cotSelectedPkgId
                                    ? "Selecciona un programa turístico."
                                    : versionWarning
                                      ? "No hay versión configurada para la cantidad de adultos."
                                      : "La fecha de salida es obligatoria.")
                                : (cotSelectedHotelIds.length === 0 ? "Selecciona al menos un hotel." : "La fecha de salida es obligatoria.")}
                            </p>
                          )}
                          <button
                            onClick={() => { if (step2CanProceed) setStep(3); }}
                            disabled={!step2CanProceed || quoteLocked}
                            className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            Siguiente Paso <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </fieldset>
                  )}

                  {/* ── PASO 3: HABITACIONES & SERVICIOS ── */}
                  {step === 3 && (
                    <fieldset disabled={quoteLocked} className="bg-white p-6 md:p-8 rounded-3xl border border-solid border-gray-100 shadow-sm space-y-6 min-w-0">
                      <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Habitaciones & Servicios
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Paso 3 de 4</span>
                      </div>

                      {/* Pasajeros declarados en Paso 1 — resumen read-only */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="px-4 py-3 bg-light border border-lighter rounded-2xl">
                          <span className="text-[9px] font-black uppercase text-primary/40 tracking-wider block">Adultos</span>
                          <span className="text-sm font-black text-primary">{cotNumPersonas}</span>
                        </div>
                        {cotNumNinos > 0 && (
                          <div className="px-4 py-3 bg-light border border-lighter rounded-2xl">
                            <span className="text-[9px] font-black uppercase text-primary/40 tracking-wider block">Niños</span>
                            <span className="text-sm font-black text-primary">{cotNumNinos}</span>
                          </div>
                        )}
                        <div className={cotNumNinos > 0 ? "col-span-2" : ""}>
                          <div className="px-4 py-3 bg-secondary/5 border border-secondary/15 rounded-2xl">
                            <span className="text-[9px] font-black uppercase text-secondary/60 tracking-wider block">
                              {cotMode === "catalogo" ? "Habitaciones" : "Distribución habitaciones"}
                            </span>
                            <span className="text-xs font-black text-secondary">{cotPaxResumen}</span>
                          </div>
                        </div>
                      </div>

                      {cotShowPaxWarning && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-[10px] font-bold">
                          <AlertCircle size={13} className="shrink-0" />
                          Pax en habitaciones ({cotTotalRoomPax}) no coincide con pasajeros declarados ({cotNumPersonas}).
                        </div>
                      )}

                      {/* ── Modo libre: contadores +/- de habitaciones ── */}
                      {cotMode === "libre" && (
                        <div className="space-y-2">
                          <label className={labelCls}>Distribución por Tipo de Habitación *</label>
                          {cotPrimaryHotel && (
                            <p className="text-[10px] text-primary/40 font-bold -mt-1">
                              Tarifas: {cotPrimaryHotel.nombre} · {cotNoches} noches
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {([
                              { tipoPax: "SGL",  label: "Sencilla (SGL)",   numPax: 1 },
                              { tipoPax: "DBL",  label: "Doble (DBL)",      numPax: 2 },
                              { tipoPax: "TPL",  label: "Triple (TPL)",     numPax: 3 },
                              { tipoPax: "QUAD", label: "Cuádruple (QUAD)", numPax: 4 },
                              { tipoPax: "CHD",  label: "Niños 2-11 (CHD)", numPax: 1 },
                            ] as const).map(({ tipoPax, label }) => {
                              const precio = getCotPrice(tipoPax);
                              const qty    = cotHabs[tipoPax] ?? 0;
                              const tarifaLabel = precio > 0 ? `$${precio}/p/noche` : "Sin tarifa";
                              return (
                                <div key={tipoPax} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${precio > 0 || qty > 0 ? "bg-light border-lighter hover:border-secondary/30" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-xs font-black text-primary block">{label}</span>
                                    <span className={`text-[10px] font-bold block ${precio > 0 ? "text-secondary" : "text-primary/30"}`}>{tarifaLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <button type="button" onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: Math.max(0, (prev[tipoPax] ?? 0) - 1) }))} disabled={qty === 0} aria-label={`Reducir cantidad de ${label}`} className="w-11 h-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-6 text-center font-black text-sm text-primary">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: (prev[tipoPax] ?? 0) + 1 }))}
                                      aria-label={`Aumentar cantidad de ${label}`}
                                      className="w-11 h-11 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Modo catálogo: acordeón por hotel ── */}
                      {cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.hoteles.length > 0 && (() => {
                        const requiredTipoPax = numPaxToTipoPax(cotNumPersonas) ?? "DBL";
                        // (#4) Con niños, ocultar hoteles sin tarifa CHD válida (verificado en vivo contra BD).
                        const elegibles = cotSelectedPkg.hoteles.filter(hotelAptoNinos);
                        const excluidos = cotSelectedPkg.hoteles.length - elegibles.length;
                        const singleHotel = elegibles.length === 1;
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-1.5">
                              <Building2 size={10} /> Hoteles disponibles
                            </p>
                            {excluidos > 0 && (
                              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertCircle size={11} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700">
                                  {excluidos} hotel{excluidos !== 1 ? "es" : ""} oculto{excluidos !== 1 ? "s" : ""}: no tiene{excluidos === 1 ? "" : "n"} tarifa de niños (CHD) configurada y hay {cotNumNinos} niño{cotNumNinos !== 1 ? "s" : ""} en el viaje.
                                </p>
                              </div>
                            )}
                            {elegibles.length === 0 && (
                              <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl">
                                <AlertCircle size={11} className="text-rose-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-rose-700">
                                  Ningún hotel de este paquete admite niños. Quita los niños en el Paso 1 o elige otro paquete.
                                </p>
                              </div>
                            )}
                            <div className="space-y-2">
                              {elegibles.map((hotel) => {
                                const isOpen = singleHotel || cotHotelAccordionOpen === hotel.id;
                                const adultPrice = getAdultAccomPrice(hotel, requiredTipoPax);
                                const childResults = cotNinosEdades.map((age) =>
                                  getChildPriceForAge(hotel, age, adultPrice)
                                );
                                const noApplyWarnings = childResults
                                  .map((r, i) => (!r.aplica ? { num: i + 1, age: cotNinosEdades[i] } : null))
                                  .filter((w): w is { num: number; age: number } => w !== null);
                                return (
                                  <div key={hotel.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                                    {!singleHotel ? (
                                      <button
                                        type="button"
                                        onClick={() => setCotHotelAccordionOpen(isOpen ? null : hotel.id)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-light/50 transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          {noApplyWarnings.length > 0 && <AlertCircle size={13} className="text-amber-500 shrink-0" />}
                                          <span className="font-black text-primary text-xs truncate">{hotel.nombre}</span>
                                          <span className="text-amber-400 text-[10px] shrink-0">{"★".repeat(hotel.estrellas)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                          {adultPrice > 0 && (
                                            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg">
                                              ${fmtN(adultPrice)}/pax
                                            </span>
                                          )}
                                          {isOpen ? <ChevronUp size={12} className="text-primary/40" /> : <ChevronDown size={12} className="text-primary/40" />}
                                        </div>
                                      </button>
                                    ) : (
                                      <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-2">
                                          <Building2 size={13} className="text-secondary shrink-0" />
                                          <span className="font-black text-primary text-xs">{hotel.nombre}</span>
                                          <span className="text-amber-400 text-[10px]">{"★".repeat(hotel.estrellas)}</span>
                                        </div>
                                        {adultPrice > 0 && (
                                          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg">
                                            ${fmtN(adultPrice)}/pax/noche
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {isOpen && (
                                      <div className={`px-4 pb-4 space-y-3 ${!singleHotel ? "border-t border-gray-50 pt-3" : ""}`}>
                                        <div>
                                          <p className="text-[9px] font-black text-primary/30 uppercase tracking-wider mb-1.5">Alojamiento adultos</p>
                                          <div className="flex items-center justify-between p-3 bg-light border border-lighter rounded-xl">
                                            <span className="text-xs font-bold text-primary">
                                              {requiredTipoPax} · {cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""}
                                            </span>
                                            <span className="font-black text-primary text-xs">
                                              {adultPrice > 0 ? `$${fmtN(adultPrice)}/persona/noche` : "Sin tarifa disponible"}
                                            </span>
                                          </div>
                                        </div>
                                        {cotNumNinos > 0 && (
                                          <div>
                                            <p className="text-[9px] font-black text-primary/30 uppercase tracking-wider mb-1.5">Niños ({cotNumNinos})</p>
                                            <div className="space-y-1.5">
                                              {childResults.map((result, i) => (
                                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${result.aplica ? "bg-light border-lighter" : "bg-amber-50 border-amber-100"}`}>
                                                  <div className="flex items-center gap-2">
                                                    {result.aplica
                                                      ? <CheckCircle2 size={11} className="text-secondary shrink-0" />
                                                      : <AlertCircle size={11} className="text-amber-500 shrink-0" />}
                                                    <span className="text-xs font-bold text-primary">Niño {i + 1} · {cotNinosEdades[i]} años</span>
                                                  </div>
                                                  <span className={`font-black text-xs ${result.aplica ? "text-primary" : "text-amber-600"}`}>
                                                    {result.aplica ? `$${fmtN(result.precio)}/noche` : `$${fmtN(result.precio)}/noche (tarifa adulto)`}
                                                  </span>
                                                </div>
                                              ))}
                                              {noApplyWarnings.length > 0 && (
                                                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                  <AlertCircle size={11} className="text-amber-600 shrink-0 mt-0.5" />
                                                  <p className="text-[10px] font-bold text-amber-700">
                                                    {noApplyWarnings.length} niño{noApplyWarnings.length !== 1 ? "s" : ""} no cumple{noApplyWarnings.length === 1 ? "" : "n"} la política de edad de este hotel (edad{noApplyWarnings.length !== 1 ? "es" : ""}: {noApplyWarnings.map((w) => `${w.age} años`).join(", ")}). Se cotizarán a tarifa de adulto.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Noches adicionales por destino (catálogo) #5 ── */}
                      {cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.destinos.length > 0 && (() => {
                        const enabled = cotSelectedPkg.permitirModificarNoches;
                        const requiredTipoPax = numPaxToTipoPax(cotNumPersonas) ?? "DBL";
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={10} /> Noches adicionales {cotSelectedPkg.destinos.length > 1 ? "por destino" : ""}
                              </p>
                              {!enabled && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-black rounded-md">Bloqueado</span>
                              )}
                            </div>
                            {!enabled && (
                              <p className="text-[10px] text-primary/40 font-bold">Este paquete no permite agregar noches adicionales. El administrador debe habilitarlo.</p>
                            )}
                            <div className="space-y-2">
                              {cotSelectedPkg.destinos.map((d) => {
                                const nights = cotExtraNightsByDestino[d.id] ?? 0;
                                const hotelD = cotSelectedPkg!.hoteles.find((h) => h.destinoId === d.id) ?? cotSelectedPkg!.hoteles[0];
                                const ratePerNight = hotelD?.tarifas.find((t) => t.tipoHabitacion === requiredTipoPax)?.precioBase ?? 0;
                                return (
                                  <div key={d.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${enabled ? "bg-light border-lighter" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-xs font-black text-primary block flex items-center gap-1.5">
                                        <MapPin size={10} className="text-secondary shrink-0" /> {d.ciudad}
                                      </span>
                                      <span className="text-[10px] font-bold text-secondary block">
                                        {ratePerNight > 0 ? `$${fmtN(ratePerNight)}/persona/noche (${requiredTipoPax})` : "Sin tarifa/noche"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                      <button type="button" disabled={!enabled || nights === 0}
                                        onClick={() => setCotExtraNightsByDestino((prev) => ({ ...prev, [d.id]: Math.max(0, (prev[d.id] ?? 0) - 1) }))}
                                        aria-label={`Reducir noches en ${d.ciudad}`}
                                        className="w-11 h-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                        <Minus size={12} />
                                      </button>
                                      <span className="w-6 text-center font-black text-sm text-primary">{nights}</span>
                                      <button type="button" disabled={!enabled || nights >= 14}
                                        onClick={() => setCotExtraNightsByDestino((prev) => ({ ...prev, [d.id]: Math.min(14, (prev[d.id] ?? 0) + 1) }))}
                                        aria-label={`Agregar noche en ${d.ciudad}`}
                                        className="w-11 h-11 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed">
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {enabled && cotExtraNights > 0 && (
                              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/5 border border-secondary/15 rounded-xl">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-wider">
                                  +{cotExtraNights} noche{cotExtraNights !== 1 ? "s" : ""} · costo adicional
                                </span>
                                <span className="font-black text-secondary text-xs">${fmtN(cotExtraCost)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ── Actividades incluidas (catálogo) ── */}
                      {cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.actividades.length > 0 && (() => {
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Actividades incluidas</p>
                            <div className="space-y-1.5">
                              {cotSelectedPkg.actividades.map((act) => {
                                const aduPerPax = getActividadAdultPerPax(act.tarifas, cotNumPersonas);
                                const ninPerPax = getActividadChildPerPax(act.tarifas, cotNumNinos);
                                return (
                                  <div key={act.id} className="flex items-center justify-between p-3 bg-light border border-lighter rounded-xl">
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-primary block">{act.nombre}</span>
                                      {act.descripcion && <p className="text-[10px] text-primary/40 mt-0.5">{act.descripcion}</p>}
                                      <div className="flex gap-3 mt-1 flex-wrap">
                                        {aduPerPax > 0 && <span className="text-[9px] font-bold text-primary/50">ADU: ${fmtN(aduPerPax)}/pax</span>}
                                        {ninPerPax > 0 && cotNumNinos > 0 && <span className="text-[9px] font-bold text-secondary/70">NIÑ: ${fmtN(ninPerPax)}/pax</span>}
                                      </div>
                                    </div>
                                    {aduPerPax > 0 && <span className="font-black text-secondary text-xs shrink-0 ml-3">${fmtN(aduPerPax)}/pax</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Traslados incluidos (catálogo) ── */}
                      {cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.traslados.length > 0 && (() => {
                        const totalPax = cotNumPersonas + cotNumNinos;
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Traslados incluidos</p>
                            <div className="space-y-1.5">
                              {cotSelectedPkg.traslados.map((trs) => {
                                const tarifa = trs.tarifas.find((t) => totalPax >= t.paxMin && totalPax <= t.paxMax);
                                const perPax = getTrasladoPerPax(trs.tarifas, totalPax);
                                return (
                                  <div key={trs.id} className="flex items-center justify-between p-3 bg-light border border-lighter rounded-xl">
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-primary block">{trs.tipo}</span>
                                      {tarifa && (
                                        <p className="text-[9px] font-bold text-primary/40 mt-0.5">
                                          {tarifa.tipoCobro === "POR_VEHICULO" ? `$${fmtN(tarifa.precio)} por vehículo (hasta ${tarifa.paxMax} pax)` : `$${fmtN(tarifa.precio)}/persona`}
                                        </p>
                                      )}
                                    </div>
                                    {perPax > 0 && <span className="font-black text-secondary text-xs shrink-0 ml-3">≈${fmtN(perPax)}/pax</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Boleto aéreo (catálogo) ── */}
                      {cotMode === "catalogo" && cotFlightActive && cotFlightPrice > 0 && (
                        <div className="flex items-center justify-between p-3 bg-secondary/5 border border-secondary/15 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-primary block">Boleto aéreo</span>
                            {cotSelectedPkg?.descripcionBoleto && (
                              <p className="text-[10px] text-primary/40 mt-0.5">{cotSelectedPkg.descripcionBoleto}</p>
                            )}
                          </div>
                          <span className="font-black text-secondary text-xs shrink-0 ml-3">${cotFlightPrice.toLocaleString()}/pax</span>
                        </div>
                      )}

                      {cotMode === "libre" && cotAllDestinos.length > 0 && (
                        <div className="space-y-4">
                          {cotAllDestinos.map((destino) => {
                            const hasMultiple = cotAllDestinos.length > 1;
                            return (
                              <div key={destino.id} className={hasMultiple ? "p-4 bg-light border border-lighter rounded-2xl space-y-3" : "space-y-4"}>
                                {hasMultiple && (
                                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={10} /> {destino.ciudad}, {destino.pais}
                                  </p>
                                )}
                                {destino.traslados.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Traslados en {destino.ciudad}</p>
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
                                {destino.actividades.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Actividades en {destino.ciudad}</p>
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
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor="agency-markup" className={`${labelCls} flex items-center gap-1.5`}><DollarSign size={10} /> Comisión / Markup de la Agencia (USD)</label>
                        <input id="agency-markup" type="number" min={0} value={agencyMarkup} onChange={(e) => setAgencyMarkup(Number(e.target.value))} placeholder="Ej. 100" className={inputCls} />
                        <p className="text-[10px] text-primary/40 font-bold">Este valor se suma al total final y no es visible para el cliente.</p>
                      </div>

                      <div className="space-y-2">
                        <label className={labelCls}>Términos y Condiciones</label>
                        <div className="p-4 bg-light border border-lighter rounded-2xl max-h-28 overflow-y-auto scrollbar-hide">
                          <p className="text-[9px] text-primary/55 font-medium leading-relaxed">{TERMINOS_CONDICIONES}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(2)} disabled={quoteLocked} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Atrás</button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:ml-auto">
                          {!step3CanProceed && (
                            <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                              <AlertCircle size={11} className="shrink-0" />
                              Agrega al menos una habitación para continuar.
                            </p>
                          )}
                          <button
                            onClick={() => { if (step3CanProceed) setStep(4); }}
                            disabled={!step3CanProceed || quoteLocked}
                            className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            Revisar Proforma <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </fieldset>
                  )}

                  {/* ── PASO 4: REVISIÓN FINAL ── */}
                  {step === 4 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Revisión Final de Proforma
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Paso 4 de 4</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-4 bg-light border border-lighter rounded-2xl text-xs">
                        {[
                          ["Cliente",    clientName  || "—"],
                          ["Email",      clientEmail || "—"],
                          ["Teléfono",   clientPhone || "—"],
                          ["Modo",       cotMode === "catalogo" ? "Catálogo" : "Cotización Libre"],
                          ["Destino",    `${cotDestinoCiudad}${cotDestinoPais ? `, ${cotDestinoPais}` : ""}`],
                          ["Duración",   cotDuracion],
                          ["Fechas",     cotFechasDisplay],
                          ["Pasajeros",  cotPaxResumen],
                        ].map(([lbl, val]) => (
                          <div key={lbl}>
                            <span className="text-[9px] font-black uppercase text-primary/30 tracking-wider block">{lbl}</span>
                            <span className="font-bold text-primary/80 truncate block">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* ── Tabla comparativa (catálogo) — agrupada por destino ── */}
                      {cotMode === "catalogo" && cotCatBreakdowns.length > 0 && (() => {
                        const requiredTipoPax = cotReqTipoPax;
                        const totalPax = cotNumPersonas + cotNumNinos;
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));

                        // Agrupar {hotel, breakdown} por destinoId preservando el orden
                        type DestGroup = {
                          ciudad: string; pais: string;
                          hotels: CotPaqueteHotel[];
                          breakdowns: HotelBreakdown[];
                        };
                        const destMap = new Map<number, DestGroup>();
                        cotCatBreakdowns.forEach(({ hotel: h, bd }) => {
                          if (!destMap.has(h.destinoId)) {
                            const destiInfo = cotSelectedPkg!.destinos.find((d) => d.id === h.destinoId);
                            destMap.set(h.destinoId, {
                              ciudad: h.destinoCiudad,
                              pais: destiInfo?.pais ?? "",
                              hotels: [], breakdowns: [],
                            });
                          }
                          const g = destMap.get(h.destinoId)!;
                          g.hotels.push(h);
                          g.breakdowns.push(bd);
                        });
                        const destEntries = [...destMap.entries()];
                        const isMultiDestino = destEntries.length > 1;

                        return (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider">
                              Comparativa por opción de hotel
                            </p>

                            {destEntries.map(([dId, { ciudad, pais, hotels: dHotels, breakdowns: dBds }]) => {
                              const dExtraNights = cotExtraNightsByDestino[dId] ?? 0;
                              return (
                                <div key={dId} className="space-y-2">
                                  {isMultiDestino && (
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
                                          {dHotels.map((h) => (
                                            <th key={h.id} className="px-3 py-2 text-center" style={{ minWidth: 110 }}>
                                              <p className="font-black text-primary text-[11px] leading-snug">{h.nombre}</p>
                                              <p className="text-amber-400 text-[9px] font-bold mt-0.5">{"★".repeat(Math.min(h.estrellas, 5))}</p>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">

                                        {/* Alojamiento (incl. todas las noches + servicios, por adulto) */}
                                        <tr>
                                          <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px] leading-relaxed">
                                            Alojamiento {requiredTipoPax}
                                            <br /><span className="text-[9px] text-primary/30 font-normal">
                                              (hab. {dBds[0]?.noches ?? 0} noche{(dBds[0]?.noches ?? 0) !== 1 ? "s" : ""}{dExtraNights > 0 ? ` · +${dExtraNights} extra` : ""} + act. + traslados)
                                            </span>
                                          </td>
                                          {dBds.map((bd, i) => (
                                            <td key={dHotels[i].id} className="px-3 py-2.5 text-center font-black text-primary">
                                              {bd.adultColPerPax > 0 ? `$${fmtN(bd.adultColPerPax)}/pax` : "—"}
                                            </td>
                                          ))}
                                        </tr>

                                        {/* Suplemento de menores prorrateado por adulto */}
                                        {cotNumNinos > 0 && (
                                          <tr>
                                            <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px]">
                                              Suplemento menores
                                              <br /><span className="text-[9px] text-primary/30 font-normal">(prorrateado /adulto)</span>
                                            </td>
                                            {dBds.map((bd, i) => {
                                              const hasWarning = bd.childResults.some((r) => !r.aplica);
                                              return (
                                                <td key={dHotels[i].id} className="px-3 py-2.5 text-center font-bold">
                                                  <span className={hasWarning ? "text-amber-600" : "text-primary/60"}>
                                                    +${fmtN(bd.avgChildPerPax)}/pax{hasWarning ? " ⚠" : ""}
                                                  </span>
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        )}

                                        {/* Boleto aéreo */}
                                        {cotFlightActive && cotFlightPrice > 0 && (
                                          <tr>
                                            <td className="px-3 py-2.5 font-bold text-primary/70 text-[10px]">
                                              <span className="flex items-center gap-1">
                                                <Plane size={9} className="text-secondary/60" /> Boleto aéreo
                                              </span>
                                            </td>
                                            {dBds.map((bd, i) => (
                                              <td key={dHotels[i].id} className="px-3 py-2.5 text-center font-bold text-secondary/70">
                                                ${fmtN(bd.boletoPerPax)}/pax
                                              </td>
                                            ))}
                                          </tr>
                                        )}

                                        {/* PRECIO / PERSONA */}
                                        <tr className="border-t-2 border-secondary/30">
                                          <td className="px-3 py-3 font-black text-[10px] uppercase tracking-wider text-primary bg-primary/5 whitespace-nowrap">
                                            PRECIO / PERSONA *
                                          </td>
                                          {dBds.map((bd, i) => (
                                            <td key={dHotels[i].id} className="px-3 py-3 text-center font-black text-secondary text-sm bg-primary/5">
                                              ${fmtN(bd.pricePerPax)}
                                            </td>
                                          ))}
                                        </tr>

                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })}

                            <p className="text-[9px] text-primary/35 font-bold">
                              {agencyMarkup > 0
                                ? `* Incluye comisión de $${fmtN(agencyMarkup)} distribuida entre ${totalPax} pasajero${totalPax !== 1 ? "s" : ""} ($${fmtN(agencyMarkup / totalPax)}/pax). No visible para el cliente.`
                                : "* Sin comisión de agencia aplicada."}
                            </p>
                          </div>
                        );
                      })()}

                      {/* ── Total estimado (libre) ── */}
                      {cotMode === "libre" && !isComparativeMode && (
                        <div className="border-t border-gray-100 pt-3 space-y-1">
                          {cotBoletoTotal > 0 && (
                            <div className="flex justify-between text-[10px] font-bold text-primary/60">
                              <span>Boleto aéreo ({cotTotalRoomPax} pax × ${cotFlightPrice})</span>
                              <span>${cotBoletoTotal.toLocaleString()}</span>
                            </div>
                          )}
                          {(cotLibreActTotal + cotLibreTrsTotal) > 0 && (
                            <div className="flex justify-between text-[10px] font-bold text-primary/60">
                              <span>Actividades y traslados</span>
                              <span>${(cotLibreActTotal + cotLibreTrsTotal).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-secondary/20">
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">Total estimado</span>
                            <span className="font-black text-secondary text-sm">${cotTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(3)} disabled={quoteLocked} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Atrás</button>
                        {!quoteLocked && (
                          <button
                            onClick={() => setShowSaveConfirm(true)}
                            className="px-6 py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <Star size={14} /> Guardar Cotización
                          </button>
                        )}
                        {quoteLocked && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => { const cot = cotizaciones[0]; if (cot) handleOpenPreview(cot); }}
                              className="px-5 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                              <Printer size={14} /> Ver Cotización
                            </button>
                            <button
                              onClick={() => setQuoteLocked(false)}
                              className="px-5 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                              <Settings2 size={14} /> Editar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Confirm save overlay */}
                      {showSaveConfirm && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-5 border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <AlertCircle size={20} className="text-amber-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-primary">¿Estás seguro?</h3>
                                <p className="text-[10px] text-primary/50 font-bold">Se guardará la cotización y se notificará a las partes.</p>
                              </div>
                            </div>
                            <ul className="space-y-1.5 text-[10px] font-bold text-primary/60">
                              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />Se enviará un correo de confirmación a tu agencia.</li>
                              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />Land Tour Travel recibirá una copia para gestión.</li>
                              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />Podrás editar la cotización después si es necesario.</li>
                            </ul>
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => setShowSaveConfirm(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                disabled={isSavingQuote}
                                onClick={async () => {
                                  setIsSavingQuote(true);
                                  await handleSaveProforma();
                                  setShowSaveConfirm(false);
                                  setIsSavingQuote(false);
                                }}
                                className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary-light disabled:opacity-40 text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                              >
                                {isSavingQuote
                                  ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                  : <Star size={13} />}
                                {isSavingQuote ? "Guardando..." : "Confirmar"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

              </div>
            </div>
          )}

          {/* ════════════════════════ COTIZACIONES ════════════════════════ */}
          {activeTab === "cotizaciones" && (
            <CotizacionesTab
              onViewCot={handleOpenPreview}
              onOpenDelete={(id) => { setConfirmDeleteId(id); if (confirmDeleteDialogRef.current && !confirmDeleteDialogRef.current.open) confirmDeleteDialogRef.current.showModal(); }}
            />
          )}

          {/* ════════════════════════ MARCA BLANCA (deshabilitado) ════════════════════════ */}
          {false && activeTab === "marca-blanca" && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-scale">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="border-b border-gray-50 pb-4">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest">Información Corporativa de tu Agencia</h3>
                  <p className="text-[11px] text-primary/60 font-semibold mt-1">Estos datos aparecerán en los encabezados de los archivos PDF exportados.</p>
                  {!isAdmin && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[10px] font-black">
                      <AlertCircle size={12} /> Solo el Administrador puede editar esta sección.
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { lbl: "Nombre de la Agencia",      val: agencyName,    set: setAgencyName,    type: "text" },
                    { lbl: "Teléfono / WhatsApp",        val: agencyPhone,   set: setAgencyPhone,   type: "text" },
                  ].map(({ lbl, val, set, type }) => (
                    <div key={lbl} className="space-y-1.5">
                      <label className={labelCls}>{lbl}</label>
                      <input type={type} value={val} onChange={(e) => isAdmin && set(e.target.value)} disabled={!isAdmin}
                        className={isAdmin ? inputCls : inputDisabledCls} />
                    </div>
                  ))}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className={labelCls}>Dirección Física</label>
                    <input type="text" value={agencyAddress} onChange={(e) => isAdmin && setAgencyAddress(e.target.value)} disabled={!isAdmin}
                      className={isAdmin ? inputCls : inputDisabledCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Markup Predeterminado ($ USD)</label>
                    <input type="number" value={defaultMarkup} onChange={(e) => isAdmin && setDefaultMarkup(e.target.value)} disabled={!isAdmin}
                      className={isAdmin ? inputCls : inputDisabledCls} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className={labelCls}>Logotipo (Marca Blanca)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-light border border-lighter rounded-2xl">
                      {agencyLogo ? (
                        <div className="relative w-32 h-16 bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-2 shadow-sm">
                          <Image src={agencyLogo!} alt="Logotipo" fill className="object-contain p-1" />
                          {isAdmin && (
                            <button type="button" onClick={() => setAgencyLogo(null)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full cursor-pointer"><X size={10} /></button>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-16 bg-white border border-dashed border-gray-200 rounded-xl flex items-center justify-center shrink-0 text-gray-400 text-[10px] font-bold">Sin Logotipo</div>
                      )}
                      <div className="flex-grow space-y-1.5 w-full text-left">
                        <input type="file" accept="image/*" id="agency-logo-upload" disabled={!isAdmin} className="hidden" onChange={(e) => {
                          if (!isAdmin) return;
                          const file = e.target.files?.[0];
                          if (file) { const r = new FileReader(); r.onload = (ev) => { if (ev.target?.result) setAgencyLogo(ev.target.result as string); }; r.readAsDataURL(file); }
                        }} />
                        <label htmlFor="agency-logo-upload" className={`inline-block px-4 py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all ${isAdmin ? "bg-primary hover:bg-primary-light cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}>
                          Seleccionar Archivo
                        </label>
                        <p className="text-[9px] font-bold text-primary/40 block">PNG/JPG con fondo claro. Máx 2MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    disabled={!isAdmin || isSavingConfig}
                    onClick={() => isAdmin && handleSaveAgencyConfig()}
                    className={`px-6 py-3.5 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 ${isAdmin ? "bg-primary hover:bg-primary-light cursor-pointer disabled:opacity-70" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    {isSavingConfig ? "Guardando..." : configSaved ? "¡Guardado!" : "Guardar Configuración"}
                  </button>
                </div>
              </div>

              {/* PDF preview */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Previsualización
                  </h3>
                  <p className="text-[10px] font-bold text-primary/40 mt-0.5">Encabezado de cotizaciones PDF.</p>
                </div>
                <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-[#FAFDFD] space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3 gap-3">
                    <div className="space-y-1 min-w-0 flex-grow">
                      {agencyLogo ? (
                        <div className="relative w-28 h-10 mb-1"><img src={agencyLogo ?? ""} alt="Logo" className="max-h-full object-contain" /></div>
                      ) : (
                        <div className="text-[13px] font-black text-primary uppercase truncate">{agencyName}</div>
                      )}
                      <p className="text-[8px] font-bold text-primary/50">{agencyAddress}</p>
                      <p className="text-[8px] font-bold text-primary/50">Telf: {agencyPhone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Cotización</span>
                      <span className="block text-[8px] font-bold text-primary/40 mt-0.5">{cotizaciones[0]?.codigo || "PRF-2025-001"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold text-primary/70">
                      <span>Destino:</span><span>{cotizaciones[0]?.paqueteDestino || "Ciudad de Panamá, Panamá"}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-primary/70">
                      <span>Pasajeros:</span><span>{cotizaciones[0] ? resumenPasajeros(cotizaciones[0].pasajeros) : "2 DBL"}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-primary border-t border-gray-100 pt-2">
                      <span>Total con Markup</span>
                      <span>${((cotizaciones[0]?.total || 0) + (parseInt(defaultMarkup) || 0)).toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-[10px] font-bold text-primary/60 leading-relaxed border-t border-gray-50 pt-4">
                  <p className="flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" /><span>Markup oculto sumado al precio final.</span></p>
                  <p className="flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" /><span>El cliente nunca verá el nombre de Land Tour.</span></p>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════ PERFIL (solo móvil) ════════════════════════ */}
          {activeTab === "perfil" && (
            <div className="space-y-4 animate-fade-scale max-w-lg mx-auto">
              {/* Usuario */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary text-primary flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                  {userName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-primary truncate">{userName}</h3>
                  <p className="text-[11px] font-bold text-secondary mt-0.5">{userRoleDisplay}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-[#F4FAF8] border border-[#EDF7F5] rounded-lg w-fit">
                    <Building2 size={10} className="text-secondary shrink-0" />
                    <span className="text-[10px] font-black text-primary truncate max-w-[160px]">{agenciaDisplay}</span>
                  </div>
                </div>
              </div>


              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 cursor-pointer"
              >
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </div>
          )}

        </main>
      </div>


      {/* ── BOTTOM NAV (solo móvil) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(11,67,57,0.08)] flex items-stretch h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {([
          { id: "dashboard",    icon: LayoutDashboard,  label: "Inicio"    },
          { id: "paquetes",     icon: Compass,          label: "Paquetes"  },
          { id: "cotizar",      icon: Plus,             label: "Nueva"     },
          { id: "cotizaciones", icon: FileSpreadsheet,  label: "Cots."     },
          { id: "perfil",       icon: User,             label: "Perfil"    },
        ] as const).map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); if (id === "cotizar") resetForm(); }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer relative ${isActive ? "scale-110" : "active:scale-95"}`}
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isActive ? "bg-secondary" : ""}`}>
                <Icon size={16} className={isActive ? "text-primary stroke-[2.5]" : "text-primary/40 stroke-2"} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${isActive ? "text-primary" : "text-primary/40"}`}>
                {label}
              </span>
              {id === "cotizaciones" && kpiPendientes > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-18px)] w-4 h-4 rounded-full bg-secondary text-primary font-black text-[8px] flex items-center justify-center border-2 border-white">
                  {kpiPendientes}
                </span>
              )}
            </button>
          );
        })}
      </nav>

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



    </div>
    </DashboardContext.Provider>
  );
}
