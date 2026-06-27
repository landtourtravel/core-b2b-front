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

// ─── Cotizar-datos API types ──────────────────────────────────────────────────
interface CotHotelTarifa { tipoHabitacion: string; precioBase: number }
interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[] }
interface CotActividadTarifa { precio: number; tipoPasajero: string; paxMin: number; paxMax: number }
interface CotActividad { id: number; nombre: string; descripcion: string | null; tarifas: CotActividadTarifa[] }
interface CotTrasladoTarifa { precio: number; tipoCobro: string; paxMin: number; paxMax: number }
interface CotTraslado { id: number; tipo: string; tarifas: CotTrasladoTarifa[] }
interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[]; actividades: CotActividad[]; traslados: CotTraslado[] }
interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
interface CotPaqueteActividad { id: number; nombre: string; destinoId: number; destinoCiudad: string }
interface CotPaqueteTraslado  { id: number; tipo: string;   destinoId: number; destinoCiudad: string }
interface CotPaqueteDestino   { id: number; ciudad: string; pais: string }
interface CotPaqueteHotel { id: number; nombre: string; estrellas: number }
interface CotPaquete {
  id: number; nombre: string; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; precioBoleto: number | null; descripcionBoleto: string | null;
  permitirModificarBoleto: boolean; permitirModificarNoches: boolean;
  destinoCiudad: string; destinoPais: string;
  destinos: CotPaqueteDestino[];
  hoteles: CotPaqueteHotel[];
  actividades: CotPaqueteActividad[];
  traslados: CotPaqueteTraslado[];
  versiones: CotPaqueteVersion[];
}
interface CotizarData { destinos: CotDestino[]; paquetes: CotPaquete[] }

type CotizacionExtended = Cotizacion & {
  hotelsComparison?: Array<{ hotel: { id: string; name: string }; subtotal: number; extraNightsCost: number; total: number }>;
  chosenHotelId?: string;
};

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

// ─── Input style helper ───────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const inputDisabledCls = "w-full px-4 py-3 bg-light border border-lighter text-primary/50 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-not-allowed";
const labelCls = "block text-[10px] font-black uppercase text-primary/40 tracking-wider";

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
  const [searchPkgTerm, setSearchPkgTerm]   = useState("");
  const [activeDestino, setActiveDestino]   = useState<string | null>(null);

  useEffect(() => {
    setLoadingPkg(true);
    api.getPackagesDetailed()
      .then(({ data, error }) => { setPackages(data); setPkgError(error); })
      .catch(() => setPkgError("DB_FAIL"))
      .finally(() => setLoadingPkg(false));
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    const loc = `${pkg.location?.city || ""} ${pkg.location?.country || ""}`;
    return (
      pkg.title.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchPkgTerm.toLowerCase())
    );
  });

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

  // ── Proforma dialog refs / state ─────────────────────────────────────────────
  const proformaDialogRef    = useRef<HTMLDialogElement>(null);
  const [proformaCotId, setProformaCotId]             = useState<string | null>(null);
  const [proformaChosenHotel, setProformaChosenHotel] = useState("");

  // ── Stepper ──────────────────────────────────────────────────────────────────
  const [step,            setStep]            = useState(1);
  const [quoteLocked,     setQuoteLocked]     = useState(false);
  const [previewCot,      setPreviewCot]      = useState<CotizacionExtended | null>(null);
  const [previewTab,      setPreviewTab]      = useState<"Cliente" | "Viaje & Precios" | "Notas">("Cliente");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSavingQuote,   setIsSavingQuote]   = useState(false);

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
  const [agencyMarkup,  setAgencyMarkup]  = useState(100);

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
  const [cotHabs,             setCotHabs]             = useState<Record<string, number>>({ DBL: 1 });
  const [cotManualServices,   setCotManualServices]   = useState<Array<{ id: string; descripcion: string; costo: number }>>([]);
  const [cotFlightOverride,   setCotFlightOverride]   = useState<boolean | null>(null);
  const [cotFlightPrice,      setCotFlightPrice]      = useState<number>(0);
  const [cotExtraNights,      setCotExtraNights]      = useState<number>(0);
  const [cotLibreActSel,      setCotLibreActSel]      = useState<Record<number, boolean>>({});
  const [cotLibreTrsSel,      setCotLibreTrsSel]      = useState<Record<number, boolean>>({});
  const [cotIsMultiDestino,   setCotIsMultiDestino]   = useState(false);
  const [cotExtraDestinoIds,  setCotExtraDestinoIds]  = useState<number[]>([]);

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
          setAgencyMarkup(parseInt(cfg.defaultMarkup) || 100);
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
    fetch("/api/cotizar-datos")
      .then((r) => r.json())
      .then((data: CotizarData) => setCotizarData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (previewCot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [previewCot]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedPkg = packages.find((p) => String(p.id) === String(selectedPkgId)) ?? packages[0];

  // Step guards
  const step1CanProceed = clientName.trim().length > 0;
  const step2CanProceed = cotFechaSalida.trim().length > 0 &&
    (cotMode === "catalogo" ? cotSelectedPkgId !== null : cotSelectedHotelIds.length > 0);
  const cotTotalHabs = Object.values(cotHabs).reduce((sum, qty) => sum + qty, 0);
  const step3CanProceed = cotTotalHabs > 0;

  const packagesByCountry = packages.reduce<Record<string, Package[]>>((acc, pkg) => {
    const c = pkg.location?.country || "Otros";
    if (!acc[c]) acc[c] = [];
    acc[c].push(pkg);
    return acc;
  }, {});

  // ── Cotizador derived ─────────────────────────────────────────────────────────
  const COT_NUM_PAX: Record<string, number> = { SGL: 1, DBL: 2, TPL: 3, QUAD: 4, CHD: 1 };

  const cotSelectedPkg     = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
  const cotSelectedDestino = cotizarData?.destinos.find((d) => d.id === cotSelectedDestinoId) ?? null;
  const cotFlightActive    = cotFlightOverride !== null ? cotFlightOverride : (cotSelectedPkg?.incluyeBoleto ?? false);
  // Multi-destino: all selected destino objects (primary + extra)
  const cotAllDestinoIds  = cotIsMultiDestino
    ? ([cotSelectedDestinoId, ...cotExtraDestinoIds].filter((id): id is number => id !== null && id !== 0))
    : (cotSelectedDestinoId ? [cotSelectedDestinoId] : []);
  const cotAllDestinos    = cotizarData?.destinos.filter((d) => cotAllDestinoIds.includes(d.id)) ?? [];
  const cotAvailableHotels = cotIsMultiDestino
    ? cotAllDestinos.flatMap((d) => d.hoteles)
    : (cotSelectedDestino?.hoteles ?? []);
  const cotPrimaryHotel    = cotAvailableHotels.find((h) => cotSelectedHotelIds.includes(h.id)) ?? null;

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

  const cotSubtotalAlojamiento = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .reduce((sum, [tipoPax, qty]) => {
      const precio = getCotPrice(tipoPax);
      const numPax = COT_NUM_PAX[tipoPax] ?? 1;
      if (cotMode === "libre") return sum + precio * numPax * qty * cotNoches;
      return sum + precio * numPax * qty;
    }, 0);

  const cotManualTotal = cotManualServices.reduce((sum, s) => sum + s.costo, 0);

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

  // subtotal = alojamiento + servicios manuales + actividades/traslados libres
  const cotSubtotal = cotSubtotalAlojamiento + cotManualTotal + cotLibreActTotal + cotLibreTrsTotal;

  const cotPaxResumen = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .map(([tipoPax, qty]) => `${qty} ${tipoPax}`)
    .join(" + ") || "—";

  const cotTotalRoomPax = Object.entries(cotHabs)
    .reduce((sum, [tipoPax, qty]) => sum + (COT_NUM_PAX[tipoPax] ?? 1) * qty, 0);

  // boletoTotal = precio por persona × total de pasajeros
  const cotBoletoTotal = cotFlightActive ? cotFlightPrice * cotTotalRoomPax : 0;
  // total = subtotal + boleto + markup (markup invisible al cliente)
  const cotTotal = cotSubtotal + cotBoletoTotal + agencyMarkup;

  const cotShowPaxWarning = cotNumPersonas > 0 && cotTotalRoomPax > 0 && cotTotalRoomPax !== cotNumPersonas;

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
    setCotHabs({ DBL: 1 });
    setCotManualServices([]);
    setCotFlightOverride(null);
    setCotFlightPrice(0);
    setCotExtraNights(0);
    setCotLibreActSel({});
    setCotLibreTrsSel({});
    setCotIsMultiDestino(false);
    setCotExtraDestinoIds([]);
  };

  const handleQuickQuote = (pkgId: string) => {
    resetForm();
    setCotMode("catalogo");
    setCotSelectedPkgId(Number(pkgId));
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
    if (!confirm("¿Eliminar esta cotización? Esta acción no se puede deshacer.")) return;
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
        ...cotManualServices.map((s) => s.descripcion).filter(Boolean),
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
      paqueteIncluye = [...actNombres, ...trsNombres, ...cotManualServices.map((s) => s.descripcion).filter(Boolean)];
    }

    const now    = new Date();
    const fecha  = now.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
    const cliId  = `cli-${Date.now()}`;
    const codigo = `PRF-${now.getFullYear()}-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const sessionAgenciaId = (sessionData?.user as any)?.agenciaId ?? "unknown";
    const sessionUserId    = (sessionData?.user as any)?.id ?? "unknown";

    const notasParts: string[] = [];
    if (cotManualServices.length > 0) notasParts.push(cotManualServices.map((s) => `${s.descripcion}: $${s.costo}`).join("; "));
    const notasStr = notasParts.length > 0 ? notasParts.join(" | ") : undefined;

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
        precioSGL:    getCotPrice("SGL"), precioDBL:  getCotPrice("DBL"),
        precioTPL:    getCotPrice("TPL"), precioQUAD: getCotPrice("QUAD"), precioCHD: getCotPrice("CHD"),
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
    };

    setCotizaciones((prev) => [newCot, ...prev]);
    setQuoteLocked(true);

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
          precioSGL:  getCotPrice("SGL"),  precioDBL:  getCotPrice("DBL"),
          precioTPL:  getCotPrice("TPL"),  precioQUAD: getCotPrice("QUAD"), precioCHD: getCotPrice("CHD"),
          subtotal: cotSubtotal, markup: agencyMarkup, total: cotTotal,
          precioBoleto: cotFlightActive && cotFlightPrice > 0 ? cotFlightPrice : null,
          fechaViaje:   cotFechaSalida   || null,
          fechaRetorno: cotFechaRetorno  || null,
          notas: notasStr,
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

  const handlePrintPreview = () => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fmt = (n: number) => n % 1 === 0 ? n.toLocaleString("es-EC") : n.toFixed(2);
    const codigo = cotizaciones[0]?.codigo ?? "—";
    const today = new Date().toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
    const markupPerPax = cotTotalRoomPax > 0 ? agencyMarkup / cotTotalRoomPax : 0;
    const ordered = (["SGL", "DBL", "TPL", "QUAD", "CHD"] as const).filter((t) => (cotHabs[t] ?? 0) > 0);

    type HRow = { nombre: string; estrellas: number; getPrice: (t: string) => number | null };
    let hotelRows: HRow[] = [];
    if (cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.hoteles.length > 0) {
      hotelRows = cotSelectedPkg.hoteles.map((h) => ({
        nombre: h.nombre, estrellas: h.estrellas,
        getPrice: (t: string) => {
          const v = cotSelectedPkg.versiones.find((ver) => ver.tipoPax === t);
          return v?.precioPorPersona != null ? v.precioPorPersona + markupPerPax : null;
        },
      }));
    } else if (cotMode === "libre" && cotSelectedHotelIds.length > 0) {
      hotelRows = cotAvailableHotels.filter((h) => cotSelectedHotelIds.includes(h.id)).map((h) => ({
        nombre: h.nombre, estrellas: h.estrellas,
        getPrice: (t: string) => {
          const tf = h.tarifas.find((tf) => tf.tipoHabitacion === t);
          return tf ? tf.precioBase * cotNoches + markupPerPax : null;
        },
      }));
    }

    let includes: string[] = [];
    if (cotMode === "catalogo" && cotSelectedPkg) {
      includes = [...cotSelectedPkg.actividades.map((a) => a.nombre), ...cotSelectedPkg.traslados.map((t) => t.tipo)];
    } else {
      includes = [
        ...cotAllActRef.filter((a) => cotLibreActSel[a.id]).map((a) => a.nombre),
        ...cotAllTrsRef.filter((t) => cotLibreTrsSel[t.id]).map((t) => t.tipo),
      ];
    }
    if (cotFlightActive) includes = [`Boleto aéreo${cotSelectedPkg?.descripcionBoleto ? ": " + cotSelectedPkg.descripcionBoleto : ""}`, ...includes];
    includes = [...includes, ...cotManualServices.filter((s) => s.descripcion).map((s) => s.descripcion)];

    const typeLabelMap: Record<string, string> = { SGL: "Sencilla", DBL: "Doble", TPL: "Triple", QUAD: "Cuádruple", CHD: "Niño (2-11)" };
    const pricingRows = ordered.map((tipoPax) => {
      const qty = cotHabs[tipoPax] ?? 0;
      if (!qty) return null;
      const numPax = COT_NUM_PAX[tipoPax] ?? 1;
      const pricePerPax = getCotPrice(tipoPax) + markupPerPax;
      const subtotal = pricePerPax * numPax * qty;
      return { tipoPax, qty, numPax, pricePerPax, subtotal };
    }).filter(Boolean);

    const logoHTML = agencyLogo
      ? `<img src="${agencyLogo}" alt="${esc(agencyName)}" class="header-logo" />`
      : `<div style="width:72px;height:30px;background:#0B4339;border-radius:5px;display:flex;align-items:center;justify-content:center;"><span style="color:#28BFA9;font-size:10px;font-weight:900;">LTT</span></div>`;

    const hotelTableHTML = hotelRows.length > 0 && ordered.length > 0 ? `
      <div class="section">
        <div class="section-title">Opciones de Alojamiento</div>
        <table>
          <thead><tr>
            <th>Hotel</th><th class="center">Estrellas</th>
            ${ordered.map((t) => `<th class="right">${t}/pax</th>`).join("")}
          </tr></thead>
          <tbody>
            ${hotelRows.map((h) => `<tr>
              <td class="bold">${esc(h.nombre)}</td>
              <td class="center amber">${"★".repeat(h.estrellas)}</td>
              ${ordered.map((t) => {
                const p = h.getPrice(t);
                return p == null ? `<td class="right muted">—</td>` : `<td class="right bold">$${fmt(p)}</td>`;
              }).join("")}
            </tr>`).join("")}
          </tbody>
        </table>
        <p class="note">Precios por persona${cotMode === "libre" ? ` · ${cotNoches} noche${cotNoches !== 1 ? "s" : ""}` : ""} · Sujetos a disponibilidad al momento de la reserva.</p>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Proforma ${esc(codigo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
@page { margin:15mm 20mm; size:A4 portrait; }
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
.header-logo{width:80px;height:32px;object-fit:contain;}
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
.muted{opacity:.3;}
.amber{color:#C9A96E;}
.bold{font-weight:900;}
.green{color:#28BFA9;}
.total-row td{border-top:2px solid #28BFA9;border-bottom:none;font-weight:900;font-size:13px;padding-top:10px;}
.includes-list{display:flex;flex-wrap:wrap;gap:6px;}
.include-tag{background:#EDF7F5;color:#0B4339;font-size:9px;font-weight:700;padding:3px 8px;border-radius:5px;border:1px solid #28BFA9;opacity:.8;}
.note{font-size:8px;color:#0B4339;opacity:.4;margin-top:6px;}
.terms-text{font-size:8px;color:#0B4339;opacity:.5;line-height:1.6;}
.footer{margin-top:24px;padding-top:12px;border-top:1px solid #EDF7F5;display:flex;justify-content:space-between;align-items:flex-end;}
.footer-left{font-size:9px;font-weight:700;color:#0B4339;opacity:.6;line-height:1.8;}
.footer-seal{width:52px;height:52px;border-radius:50%;background:#0B4339;color:#28BFA9;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;text-align:center;line-height:1.4;flex-shrink:0;}
</style>
</head>
<body>
<div class="toolbar">
  <span>Vista Previa · ${esc(codigo)}</span>
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
      <div class="proforma-code">${esc(codigo)}</div>
      <div class="proforma-date">${today}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Datos del Cliente</div>
    <div class="grid-2">
      <div class="field"><label>Nombre completo</label><span>${esc(clientName || "—")}</span></div>
      <div class="field"><label>Email</label><span>${esc(clientEmail || "—")}</span></div>
      ${clientPhone ? `<div class="field"><label>Teléfono</label><span>${esc(clientPhone)}</span></div>` : ""}
      ${clientId ? `<div class="field"><label>CI / Pasaporte</label><span>${esc(clientId)}</span></div>` : ""}
      ${clientAddress ? `<div class="field" style="grid-column:1/-1"><label>Dirección</label><span>${esc(clientAddress)}</span></div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Detalles del Viaje</div>
    <div class="grid-2">
      ${cotMode === "catalogo" && cotSelectedPkg ? `<div class="field"><label>Programa</label><span>${esc(cotSelectedPkg.nombre)}</span></div>` : ""}
      <div class="field"><label>Destino</label><span>${esc(cotDestinoCiudad)}${cotDestinoPais ? ", " + esc(cotDestinoPais) : ""}</span></div>
      <div class="field"><label>Duración</label><span>${esc(cotDuracion)}</span></div>
      ${cotFechaSalida ? `<div class="field"><label>Fecha de Salida</label><span>${esc(cotFechaSalida)}</span></div>` : ""}
      ${cotFechaRetorno ? `<div class="field"><label>Fecha de Retorno</label><span>${esc(cotFechaRetorno)}</span></div>` : ""}
      <div class="field"><label>Distribución</label><span>${esc(cotPaxResumen)}</span></div>
      <div class="field"><label>Total Pasajeros</label><span>${cotTotalRoomPax} persona${cotTotalRoomPax !== 1 ? "s" : ""}</span></div>
    </div>
  </div>

  ${hotelTableHTML}

  ${includes.length > 0 ? `
  <div class="section">
    <div class="section-title">Servicios Incluidos</div>
    <div class="includes-list">
      ${includes.map((inc) => `<span class="include-tag">✓ ${esc(inc)}</span>`).join("")}
    </div>
  </div>` : ""}

  <div class="section">
    <div class="section-title">Resumen de Precios</div>
    <table>
      <thead><tr>
        <th>Habitación</th><th class="center">Cant.</th><th class="right">Precio/pax</th><th class="right">Subtotal</th>
      </tr></thead>
      <tbody>
        ${pricingRows.map((row) => !row ? "" : `<tr>
          <td>${typeLabelMap[row.tipoPax] ?? row.tipoPax} · ${row.numPax} pax</td>
          <td class="center">${row.qty}</td>
          <td class="right">$${fmt(row.pricePerPax)}</td>
          <td class="right bold">$${fmt(row.subtotal)}</td>
        </tr>`).join("")}
        ${cotBoletoTotal > 0 ? `<tr>
          <td colspan="3">Boleto aéreo (${cotTotalRoomPax} pax × $${fmt(cotFlightPrice)})</td>
          <td class="right bold">$${fmt(cotBoletoTotal)}</td>
        </tr>` : ""}
        ${(cotLibreActTotal + cotLibreTrsTotal) > 0 ? `<tr>
          <td colspan="3">Actividades y traslados</td>
          <td class="right bold">$${fmt(cotLibreActTotal + cotLibreTrsTotal)}</td>
        </tr>` : ""}
        ${cotManualServices.filter((s) => s.costo > 0).map((svc) => `<tr>
          <td colspan="3">${esc(svc.descripcion || "Servicio adicional")}</td>
          <td class="right bold">$${fmt(svc.costo)}</td>
        </tr>`).join("")}
        <tr class="total-row">
          <td colspan="3" class="green">TOTAL</td>
          <td class="right green">$${fmt(cotTotal)}</td>
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
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Permite ventanas emergentes para ver la vista previa."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const handleOpenFinalizeDialog = (cotId: string) => {
    setProformaCotId(cotId);
    setProformaChosenHotel("");
    if (proformaDialogRef.current && !proformaDialogRef.current.open)
      proformaDialogRef.current.showModal();
  };

  const handleFinalizeCotizacion = async () => {
    if (!proformaCotId || !proformaChosenHotel) return;
    let chosenHotelName = "";
    setCotizaciones((prev) =>
      prev.map((c) => {
        if (c.id !== proformaCotId) return c;
        const chosen = (c as CotizacionExtended).hotelsComparison?.find(
          (h) => h.hotel.id === proformaChosenHotel
        );
        if (!chosen) return c;
        chosenHotelName = chosen.hotel.name;
        return {
          ...c,
          chosenHotelId: proformaChosenHotel,
          subtotal: chosen.subtotal,
          total:    chosen.total,
          status:   "APROBADA" as CotizacionStatus,
          notas:    `Hotel seleccionado: ${chosen.hotel.name}`,
        };
      })
    );
    try {
      await fetch(`/api/cotizaciones/${proformaCotId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APROBADA", selectedHotel: chosenHotelName }),
      });
    } catch {}

    proformaDialogRef.current?.close();
    setProformaCotId(null);
    setProformaChosenHotel("");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4FAF8] flex font-inter text-primary select-none">

      {/* ── Aviso de sesión por inactividad ── */}
      <SessionTimeoutModal
        isOpen={showWarning}
        secondsLeft={secondsLeft}
        onContinue={resetTimer}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
      />

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 bg-primary-dark text-white flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(5,41,36,0.15)] relative z-20">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">

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

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">

          {/* ════════════════════════ DASHBOARD ════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-scale">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { value: kpiTotal,      label: "Cotizaciones este mes",    change: "↑ 12%", trend: "up",   icon: <FileText size={16} /> },
                  { value: kpiAprobadas,  label: "Cotizaciones aprobadas",   change: "↑ 8%",  trend: "up",   icon: <CheckCircle2 size={16} /> },
                  { value: kpiRechazadas, label: "Cotizaciones canceladas",  change: "↓ 1%",  trend: "down", icon: <X size={16} /> },
                  { value: kpiPendientes, label: "Pendientes de aprobación", change: "↓ 2%",  trend: "down", icon: <Clock size={16} /> },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-3 sm:p-6 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col justify-between gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.trend === "up" ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-500"}`}>
                        {item.icon}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md tracking-wider ${item.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {item.change}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">{item.value}</span>
                      <span className="block text-[11px] font-bold text-primary/50 mt-1">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Últimas Cotizaciones
                  </h3>
                  <button onClick={() => setActiveTab("cotizaciones")} className="px-4 py-1.5 border border-gray-200 hover:border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    Ver todas
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Código","Cliente","Destino","Fecha","Total","Estado","Acciones"].map((h) => (
                          <th key={h} className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                      {cotizaciones.slice(0, 3).map((cot) => (
                        <tr key={cot.id} className="hover:bg-light/40 transition-colors">
                          <td className="py-4"><span className="font-black text-secondary block">{cot.codigo}</span></td>
                          <td className="py-4 font-black">{cot.cliente?.nombre || "—"}</td>
                          <td className="py-4 text-primary/60 max-w-[140px] truncate">{cot.paqueteNombre}</td>
                          <td className="py-4">{cot.fechaViaje || "—"}</td>
                          <td className="py-4 font-black">${cot.total.toLocaleString()}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${STATUS_BADGE[cot.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                              {COTIZACION_STATUS_LABEL[cot.status]}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1.5">
                              <button onClick={() => { setPreviewCot(cot as CotizacionExtended); setPreviewTab("Cliente"); }} className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={12} /></button>
                              {cot.status === "BORRADOR" && (cot as CotizacionExtended).hotelsComparison && (
                                <button onClick={() => handleOpenFinalizeDialog(cot.id)} className="p-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-lg border border-secondary/20 transition-all cursor-pointer" title="Generar Cotización Final"><Star size={12} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════ PAQUETES ════════════════════════ */}
          {activeTab === "paquetes" && (
            <div className="space-y-6 animate-fade-scale">
              {/* ── Header con buscador ── */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Catálogo de Programas Turísticos
                  </h3>
                  <p className="text-[11px] text-primary/50 font-semibold mt-1">
                    Selecciona un programa para cotizar al instante con tus comisiones.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Buscar por destino o nombre..."
                    value={searchPkgTerm}
                    onChange={(e) => { setSearchPkgTerm(e.target.value); setActiveDestino(null); }}
                    className="pl-9 pr-4 py-2.5 bg-light border border-lighter rounded-2xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-64 focus:border-secondary focus:bg-white transition-all"
                  />
                </div>
              </div>
              {/* ── Estados: cargando / error / vacío ── */}
              {isLoadingPackages ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                  <p className="text-primary/50 font-bold text-xs">Cargando programas...</p>
                </div>
              ) : packagesFetchError === "DB_FAIL" ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <AlertCircle size={28} className="text-amber-400" />
                  <p className="text-primary/60 font-bold text-xs">Conexión a DB fallida — no se pudieron cargar los paquetes.</p>
                </div>
              ) : packagesFetchError === "EMPTY" || packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <Globe size={28} className="text-primary/20" />
                  <p className="text-primary/50 font-bold text-xs">No hay paquetes creados en la base de datos.</p>
                  <p className="text-primary/30 text-[10px]">El administrador debe crear los paquetes desde el panel.</p>
                </div>
              ) : (() => {
                const pkgsFiltrados = packages.filter((pkg) => {
                  if (!searchPkgTerm) return true;
                  const loc = `${pkg.location?.city || ""} ${pkg.location?.country || ""}`.toLowerCase();
                  return (
                    pkg.title.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
                    loc.includes(searchPkgTerm.toLowerCase())
                  );
                });
                const byDestino = pkgsFiltrados.reduce<Record<string, { pais: string; pkgs: typeof pkgsFiltrados }>>((acc, pkg) => {
                  const ciudad = pkg.location?.city || "Sin destino";
                  const pais   = pkg.location?.country || "";
                  if (!acc[ciudad]) acc[ciudad] = { pais, pkgs: [] };
                  acc[ciudad].pkgs.push(pkg);
                  return acc;
                }, {});
                const destinos = Object.keys(byDestino).sort();
                if (destinos.length === 0) {
                  return (
                    <div className="py-16 text-center text-primary/40 font-bold text-xs">
                      No se encontraron paquetes para &quot;{searchPkgTerm}&quot;
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {destinos.map((ciudad) => {
                      const { pais, pkgs } = byDestino[ciudad];
                      const isOpen = activeDestino === ciudad;
                      return (
                        <div key={ciudad} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          {/* ── Cabecera del destino (acordeón) ── */}
                          <button
                            onClick={() => setActiveDestino(isOpen ? null : ciudad)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-light/60 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                                <MapPin size={14} className="text-secondary" />
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-black text-primary group-hover:text-secondary transition-colors">{ciudad}</span>
                                <span className="text-[10px] font-bold text-primary/40 ml-2">{pais}</span>
                              </div>
                              <span className="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black rounded-md">
                                {pkgs.length} {pkgs.length === 1 ? "programa" : "programas"}
                              </span>
                            </div>
                            {isOpen
                              ? <ChevronUp size={16} className="text-primary/40 shrink-0" />
                              : <ChevronDown size={16} className="text-primary/40 shrink-0" />
                            }
                          </button>
                          {/* ── Lista de paquetes desplegable ── */}
                          {isOpen && (
                            <div className="border-t border-gray-50 divide-y divide-gray-50">
                              {pkgs.map((pkg) => (
                                <div
                                  key={pkg.id}
                                  className="flex items-center gap-4 px-6 py-4 hover:bg-light/40 transition-colors group/row"
                                >
                                  {/* Miniatura */}
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                    <img
                                      src={pkg.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"}
                                      alt={pkg.title}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover/row:scale-105"
                                    />
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-primary leading-tight line-clamp-1 group-hover/row:text-secondary transition-colors">
                                      {pkg.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary/40">
                                        <Clock size={9} /> {pkg.duration || `${pkg.diasEstancia}d / ${pkg.nochesBase}n`}
                                      </span>
                                      {pkg.flightIncluded && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                                          <Plane size={9} /> Vuelo incluido
                                        </span>
                                      )}
                                    </div>
                                    {pkg.includes && pkg.includes.length > 0 && (
                                      <p className="text-[10px] font-medium text-primary/35 mt-1 line-clamp-1">
                                        Incluye: {pkg.includes.slice(0, 3).join(" · ")}
                                        {pkg.includes.length > 3 && ` y ${pkg.includes.length - 3} más`}
                                      </p>
                                    )}
                                  </div>
                                  {/* Precio + Botón */}
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="text-right">
                                      <span className="text-[8px] font-black uppercase text-gray-400 block leading-none">Desde</span>
                                      <span className="text-sm font-black text-primary">${pkg.price} <span className="text-[9px] font-bold text-primary/40">USD</span></span>
                                    </div>
                                    <button
                                      onClick={() => handleQuickQuote(String(pkg.id))}
                                      className="px-3.5 py-2 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    >
                                      <Plus size={10} className="stroke-[2.5]" /> Cotizar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ════════════════════════ NUEVA COTIZACIÓN (STEPPER) ════════════════════════ */}
          {activeTab === "cotizar" && (
            <div className="space-y-6 animate-fade-scale">

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
                <div className="h-6" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* ── Steps ── */}
                <div className="lg:col-span-2 space-y-6">

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
                          <label className={labelCls}>Nombre Completo *</label>
                          <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Correo Electrónico</label>
                          <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} onBlur={handleClientEmailBlur} placeholder="cliente@email.com" className={inputCls} />
                          {clientFoundMsg && <p className="text-[10px] font-bold text-secondary mt-1">{clientFoundMsg}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Teléfono / WhatsApp</label>
                          <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+593 9XXXXXXXX" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Identificación / C.I.</label>
                          <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Opcional" className={inputCls} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className={labelCls}>Dirección</label>
                          <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Dirección del cliente" className={inputCls} />
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

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        {!step1CanProceed && (
                          <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                            <AlertCircle size={11} className="shrink-0" />
                            El nombre del cliente es obligatorio.
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
                          { mode: "catalogo" as const, label: "Catálogo DB", desc: "Paquetes con precios del catálogo", icon: <Compass size={18} /> },
                          { mode: "libre" as const,    label: "Cotización Libre", desc: "Selecciona destino y hotel manualmente", icon: <Globe size={18} /> },
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
                          {cotizarData === null ? (
                            <div className="flex items-center gap-2 py-4 text-primary/40 text-xs font-bold">
                              <div className="w-4 h-4 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                              Cargando paquetes...
                            </div>
                          ) : cotizarData.paquetes.length === 0 ? (
                            <div className="py-8 text-center">
                              <Globe size={24} className="text-primary/20 mx-auto mb-2" />
                              <p className="text-primary/50 font-bold text-xs">No hay paquetes en la base de datos.</p>
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
                          {/* Fechas */}
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Salida</label>
                              <input type="date" value={cotFechaSalida} onChange={(e) => setCotFechaSalida(e.target.value)} className={inputCls} />
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

                          {/* Noches extra — solo si el paquete lo permite */}
                          {cotSelectedPkg?.permitirModificarNoches && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className={labelCls}>Noches extra</label>
                                <input type="number" min={0} max={14} value={cotExtraNights}
                                  onChange={(e) => setCotExtraNights(Math.max(0, Number(e.target.value)))}
                                  className={inputCls} />
                                <p className="text-[10px] text-primary/40 font-bold">Agrega días al programa base. El costo extra debe calcularse manualmente.</p>
                              </div>
                              <div className="space-y-1.5">
                                <label className={labelCls}>Duración total</label>
                                <input type="text" disabled value={`${(cotSelectedPkg.diasEstancia ?? 0) + cotExtraNights} días / ${(cotSelectedPkg.nochesBase ?? 0) + cotExtraNights} noches`} className={inputDisabledCls} />
                              </div>
                            </div>
                          )}

                          {/* Actividades + traslados del paquete (informativo) */}
                          {cotSelectedPkg && (cotSelectedPkg.actividades.length > 0 || cotSelectedPkg.traslados.length > 0) && (() => {
                            // Agrupar por destino
                            const porDestino = new Map<number, { ciudad: string; actividades: string[]; traslados: string[] }>();
                            cotSelectedPkg.actividades.forEach((a) => {
                              if (!porDestino.has(a.destinoId)) porDestino.set(a.destinoId, { ciudad: a.destinoCiudad, actividades: [], traslados: [] });
                              porDestino.get(a.destinoId)!.actividades.push(a.nombre);
                            });
                            cotSelectedPkg.traslados.forEach((t) => {
                              if (!porDestino.has(t.destinoId)) porDestino.set(t.destinoId, { ciudad: t.destinoCiudad, actividades: [], traslados: [] });
                              porDestino.get(t.destinoId)!.traslados.push(t.tipo);
                            });
                            return (
                              <div className="p-3 bg-light border border-lighter rounded-2xl space-y-3">
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-wider">Incluye en el programa</p>
                                {[...porDestino.entries()].map(([dId, data]) => (
                                  <div key={dId}>
                                    {cotSelectedPkg.destinos.length > 1 && (
                                      <p className="text-[9px] font-black text-secondary uppercase tracking-wider mb-1">{data.ciudad}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                      {data.actividades.map((a) => (
                                        <span key={a} className="px-2 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black rounded-md">{a}</span>
                                      ))}
                                      {data.traslados.map((t) => (
                                        <span key={t} className="px-2 py-0.5 bg-primary/5 text-primary/60 text-[9px] font-black rounded-md">{t}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

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
                              <input type="date" value={cotFechaSalida} onChange={(e) => setCotFechaSalida(e.target.value)} className={inputCls} />
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
                                const hotelsPorDestino = destino.hoteles;
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

                                    {/* ── Traslados disponibles ── */}
                                    {destino.traslados.length > 0 && (
                                      <div className="space-y-2">
                                        <label className={labelCls}>Traslados en {destino.ciudad}</label>
                                        <div className="space-y-2">
                                          {destino.traslados.map((trs) => {
                                            const checked = !!cotLibreTrsSel[trs.id];
                                            const minPrice = trs.tarifas.length > 0 ? Math.min(...trs.tarifas.map((t) => t.precio)) : 0;
                                            return (
                                              <button
                                                key={trs.id} type="button"
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

                                    {/* ── Actividades disponibles ── */}
                                    {destino.actividades.length > 0 && (
                                      <div className="space-y-2">
                                        <label className={labelCls}>Actividades en {destino.ciudad}</label>
                                        <div className="space-y-2">
                                          {destino.actividades.map((act) => {
                                            const checked = !!cotLibreActSel[act.id];
                                            const minPrice = act.tarifas.length > 0 ? Math.min(...act.tarifas.map((t) => t.precio)) : 0;
                                            return (
                                              <button
                                                key={act.id} type="button"
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
                                ? (!cotSelectedPkgId ? "Selecciona un programa turístico." : "La fecha de salida es obligatoria.")
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

                      {cotSelectedHotelIds.length > 0 && cotAvailableHotels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cotAvailableHotels.filter((h) => cotSelectedHotelIds.includes(h.id)).map((h) => (
                            <span key={h.id} className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20 flex items-center gap-1.5">
                              <Building2 size={10} /> {h.nombre}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={labelCls}>Total de Adultos</label>
                          <input type="number" min={1} max={50} value={cotNumPersonas || ""} onChange={(e) => setCotNumPersonas(Number(e.target.value))} placeholder="Ej. 4" className={`${inputCls} w-28`} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Distribución Actual</label>
                          <div className="px-4 py-3 bg-secondary/5 border border-secondary/15 rounded-2xl text-xs font-black text-secondary">{cotPaxResumen}</div>
                        </div>
                      </div>

                      {cotShowPaxWarning && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-[10px] font-bold">
                          <AlertCircle size={13} className="shrink-0" />
                          Pax en habitaciones ({cotTotalRoomPax}) no coincide con pasajeros declarados ({cotNumPersonas}).
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className={labelCls}>Distribución por Tipo de Habitación *</label>
                        {cotPrimaryHotel && (
                          <p className="text-[10px] text-primary/40 font-bold -mt-1">
                            Tarifas: {cotPrimaryHotel.nombre}{cotMode === "libre" ? ` · ${cotNoches} noches` : ""}
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
                            const tarifaLabel = precio > 0 ? `$${precio}/p${cotMode === "libre" ? "/noche" : ""}` : "Sin tarifa";
                            return (
                              <div key={tipoPax} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${precio > 0 || qty > 0 ? "bg-light border-lighter hover:border-secondary/30" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-xs font-black text-primary block">{label}</span>
                                  <span className={`text-[10px] font-bold block ${precio > 0 ? "text-secondary" : "text-primary/30"}`}>{tarifaLabel}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                  <button type="button" onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: Math.max(0, (prev[tipoPax] ?? 0) - 1) }))} disabled={qty === 0} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-6 text-center font-black text-sm text-primary">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: (prev[tipoPax] ?? 0) + 1 }))}
                                    disabled={
                                      (tipoPax === "CHD" && cotMode === "catalogo" && (cotSelectedPkg?.incluyeBoleto ?? false)) ||
                                      (cotMode === "catalogo" && cotSelectedPkgId !== null && precio === 0)
                                    }
                                    title={
                                      cotMode === "catalogo" && cotSelectedPkgId !== null && precio === 0
                                        ? "Este tipo de habitación no está disponible en el paquete seleccionado"
                                        : (tipoPax === "CHD" && cotMode === "catalogo" && cotSelectedPkg?.incluyeBoleto ? "El paquete ya incluye boleto para niños" : undefined)
                                    }
                                    className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className={labelCls}>Servicios Adicionales</label>
                          <button
                            type="button"
                            onClick={() => setCotManualServices((prev) => [...prev, { id: `svc-${Date.now()}`, descripcion: "", costo: 0 }])}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-secondary/20 transition-all cursor-pointer"
                          >
                            <Plus size={11} /> Agregar Servicio
                          </button>
                        </div>
                        {cotManualServices.length > 0 && (
                          <div className="space-y-2">
                            {cotManualServices.map((svc) => (
                              <div key={svc.id} className="flex items-center gap-2 p-3 bg-light border border-lighter rounded-2xl">
                                <input type="text" placeholder="Descripción del servicio..." value={svc.descripcion}
                                  onChange={(e) => setCotManualServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, descripcion: e.target.value } : s))}
                                  className="flex-1 px-3 py-2 bg-white border border-lighter text-primary rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                                />
                                <div className="relative shrink-0">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 text-xs font-black">$</span>
                                  <input type="number" min={0} placeholder="0" value={svc.costo || ""}
                                    onChange={(e) => setCotManualServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, costo: Number(e.target.value) } : s))}
                                    className="w-24 pl-6 pr-3 py-2 bg-white border border-lighter text-primary rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                                  />
                                </div>
                                <button type="button" onClick={() => setCotManualServices((prev) => prev.filter((s) => s.id !== svc.id))} className="p-1.5 bg-rose-50 text-rose-400 hover:bg-rose-100 rounded-lg transition-all cursor-pointer shrink-0">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className={`${labelCls} flex items-center gap-1.5`}><DollarSign size={10} /> Comisión / Markup de la Agencia (USD)</label>
                        <input type="number" min={0} value={agencyMarkup} onChange={(e) => setAgencyMarkup(Number(e.target.value))} placeholder="Ej. 100" className={inputCls} />
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

                      {/* ── Tabla comparativa de hoteles (ambos modos) ── */}
                      {(() => {
                        const ordered = (["SGL", "DBL", "TPL", "QUAD", "CHD"] as const).filter((t) => (cotHabs[t] ?? 0) > 0);
                        const markupPerPax = cotTotalRoomPax > 0 ? agencyMarkup / cotTotalRoomPax : 0;

                        type HotelRow = { id: number; nombre: string; estrellas: number; getPrice: (t: string) => number | null };
                        let hotelRows: HotelRow[] = [];

                        if (cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.hoteles.length > 0) {
                          hotelRows = cotSelectedPkg.hoteles.map((h) => ({
                            ...h,
                            getPrice: (tipoPax: string) => {
                              const v = cotSelectedPkg.versiones.find((ver) => ver.tipoPax === tipoPax);
                              return v?.precioPorPersona != null ? v.precioPorPersona + markupPerPax : null;
                            },
                          }));
                        } else if (cotMode === "libre" && cotSelectedHotelIds.length > 0) {
                          const selHotels = cotAvailableHotels.filter((h) => cotSelectedHotelIds.includes(h.id));
                          hotelRows = selHotels.map((h) => ({
                            id: h.id, nombre: h.nombre, estrellas: h.estrellas,
                            getPrice: (tipoPax: string) => {
                              const t = h.tarifas.find((tf) => tf.tipoHabitacion === tipoPax);
                              return t ? t.precioBase * cotNoches + markupPerPax : null;
                            },
                          }));
                        }

                        if (hotelRows.length === 0 || ordered.length === 0) return null;

                        return (
                          <div className="space-y-3">
                            <div className="overflow-x-auto">
                              <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider mb-2">Comparación de Hoteles</p>
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-100">
                                    <th className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider min-w-[120px]">Hotel</th>
                                    <th className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider text-center">Estrellas</th>
                                    {ordered.map((t) => (
                                      <th key={t} className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider text-right whitespace-nowrap">{t}/pax</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs font-bold">
                                  {hotelRows.map((hotel) => (
                                    <tr key={hotel.id}>
                                      <td className="py-2.5 font-black text-primary text-[11px]">{hotel.nombre}</td>
                                      <td className="py-2.5 text-center text-[11px] text-amber-500 whitespace-nowrap">{"★".repeat(hotel.estrellas)}</td>
                                      {ordered.map((tipoPax) => {
                                        const price = hotel.getPrice(tipoPax);
                                        if (price == null) return <td key={tipoPax} className="py-2.5 text-right text-primary/30">—</td>;
                                        const fmt = price % 1 === 0 ? price.toLocaleString() : price.toFixed(2);
                                        return <td key={tipoPax} className="py-2.5 text-right font-black text-primary">${fmt}</td>;
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <p className="mt-1.5 text-[9px] text-primary/35 font-bold">
                                {cotMode === "libre"
                                  ? `Precio por persona: ${cotNoches} noche${cotNoches !== 1 ? "s" : ""} + comisión agencia (${markupPerPax % 1 === 0 ? "$" + markupPerPax.toLocaleString() : "$" + markupPerPax.toFixed(2)}/pax).`
                                  : `Precio por persona según tarifa del paquete + comisión agencia (${markupPerPax % 1 === 0 ? "$" + markupPerPax.toLocaleString() : "$" + markupPerPax.toFixed(2)}/pax).`}
                              </p>
                            </div>

                            {/* Resumen de cargos adicionales + total */}
                            <div className="border-t border-gray-100 pt-3 space-y-1">
                              {cotManualServices.filter((s) => s.costo > 0).map((svc) => (
                                <div key={svc.id} className="flex justify-between text-[10px] font-bold text-primary/60">
                                  <span>{svc.descripcion || "Servicio adicional"}</span>
                                  <span>${svc.costo.toLocaleString()}</span>
                                </div>
                              ))}
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
                          </div>
                        );
                      })()}

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
                              onClick={handlePrintPreview}
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

                {/* ── Summary sidebar — solo desktop ── */}
                <div className="hidden lg:block space-y-5">
                  <div className="bg-primary p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col gap-5 border border-white/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-secondary tracking-widest">Resumen</h3>
                      <span className="px-2 py-0.5 bg-white/10 text-[8px] font-black uppercase tracking-wider rounded-md border border-white/5">Proforma</span>
                    </div>
                    <div className="space-y-2 text-[11px] border-t border-white/10 pt-4 font-bold text-white/70">
                      <div className="flex justify-between items-center">
                        <span>Subtotal alojamiento</span>
                        <span className="font-black text-white">${cotSubtotalAlojamiento.toLocaleString()}</span>
                      </div>
                      {cotManualTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Servicios adicionales</span>
                          <span className="font-black text-white">${cotManualTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span>Markup agencia</span>
                        <span className="font-black text-secondary-light">${agencyMarkup.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-secondary">Total Proforma</span>
                        <span className="block text-2xl font-black text-white">${cotTotal.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 rounded-lg border border-white/5">USD</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 space-y-2 text-[10px] font-bold text-white/50">
                      <div className="flex justify-between">
                        <span>Pasajeros</span>
                        <span className="text-white/80">{cotPaxResumen}</span>
                      </div>
                      {cotSelectedHotelIds.length > 0 && (
                        <div className="flex justify-between">
                          <span>Hoteles</span>
                          <span className="text-white/80">{cotSelectedHotelIds.length} seleccionado{cotSelectedHotelIds.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-50 pb-2">Info del Viaje</h4>
                    <div className="space-y-2 text-xs font-bold text-primary/70">
                      {[
                        ["Destino",  `${cotDestinoCiudad}${cotDestinoPais ? `, ${cotDestinoPais}` : ""}`],
                        ["Duración", cotDuracion],
                        ["Fechas",   cotFechasDisplay],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="flex justify-between gap-2">
                          <span className="text-primary/40 shrink-0">{lbl}:</span>
                          <span className="text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════ COTIZACIONES ════════════════════════ */}
          {activeTab === "cotizaciones" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-scale">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest">Listado de Cotizaciones Generadas</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/40"><Search size={12} /></span>
                    <input type="text" placeholder="Buscar por código, cliente..." className="pl-8 pr-4 py-2 bg-light border border-lighter rounded-xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-56" />
                  </div>
                  <select className="px-3 py-2 bg-light border border-lighter rounded-xl text-xs font-bold text-primary/60 outline-none cursor-pointer">
                    <option>Todos los estados</option>
                  </select>
                </div>
              </div>

              {/* ── Vista de tarjetas (solo móvil) ── */}
              <div className="sm:hidden space-y-3">
                {isLoadingCots ? (
                  <div className="flex justify-center py-10">
                    <div className="w-7 h-7 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                  </div>
                ) : cotizaciones.length === 0 ? (
                  <div className="text-center py-10 text-primary/40 text-xs font-bold">Sin cotizaciones registradas.</div>
                ) : cotizaciones.map((cot) => {
                  const ext = cot as CotizacionExtended;
                  return (
                    <div key={cot.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[11px] font-black text-secondary block">{cot.codigo}</span>
                          <span className="text-sm font-black text-primary block mt-0.5 truncate">{cot.cliente?.nombre || "—"}</span>
                          <span className="text-[11px] font-bold text-primary/50 block mt-0.5 truncate">
                            {cot.paqueteNombre}{cot.fechaViaje ? ` · ${cot.fechaViaje}` : ""}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg tracking-wider flex items-center gap-1.5 shrink-0 ${STATUS_BADGE[cot.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                          {COTIZACION_STATUS_LABEL[cot.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                        <span className="text-lg font-black text-primary">${cot.total.toLocaleString()} <span className="text-[10px] font-bold text-primary/40">USD</span></span>
                        <div className="flex gap-2">
                          <button onClick={() => { setPreviewCot(cot as CotizacionExtended); setPreviewTab("Cliente"); }} className="p-2 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-xl border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={14} /></button>
                          {cot.status === "BORRADOR" && !!ext.hotelsComparison?.length && (
                            <button onClick={() => handleOpenFinalizeDialog(cot.id)} className="p-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-xl border border-secondary/20 transition-all cursor-pointer"><Star size={14} /></button>
                          )}
                          {(cot.status === "ENVIADA" || cot.status === "BORRADOR") && (
                            <>
                              <button onClick={() => handleAprobar(cot.id)} className="p-2 bg-light hover:bg-emerald-50 text-primary hover:text-emerald-600 rounded-xl border border-lighter transition-all cursor-pointer"><Check size={14} /></button>
                              <button onClick={() => handleRechazar(cot.id)} className="p-2 bg-light hover:bg-rose-50 text-primary hover:text-rose-600 rounded-xl border border-lighter transition-all cursor-pointer"><X size={14} /></button>
                            </>
                          )}
                          {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                            <button onClick={() => handleEliminar(cot.id)} className="p-2 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-xl border border-lighter transition-all cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Vista de tabla (sm y arriba) ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Código","Cliente","Programa","Fechas","Pax","Total","Creación","Estado","Acciones"].map((h) => (
                        <th key={h} className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                    {cotizaciones.map((cot) => {
                      const ext = cot as CotizacionExtended;
                      const hasComparison = !!ext.hotelsComparison?.length;
                      return (
                        <tr key={cot.id} className="hover:bg-light/40 transition-colors">
                          <td className="py-4">
                            <span className="font-black text-secondary block">{cot.codigo}</span>
                            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">
                              {hasComparison ? `${ext.hotelsComparison!.length} hotel(es)` : `Por ${userName}`}
                            </span>
                          </td>
                          <td className="py-4 font-black">{cot.cliente?.nombre || "—"}</td>
                          <td className="py-4 text-primary/60 max-w-[140px] truncate">{cot.paqueteNombre}</td>
                          <td className="py-4">{cot.fechaViaje || "—"}</td>
                          <td className="py-4">{resumenPasajeros(cot.pasajeros)}</td>
                          <td className="py-4 font-black">${cot.total.toLocaleString()}</td>
                          <td className="py-4 text-gray-400">{cot.fechaCreacion}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${STATUS_BADGE[cot.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cot.status]}`} />
                              {COTIZACION_STATUS_LABEL[cot.status]}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              <button onClick={() => { setPreviewCot(cot as CotizacionExtended); setPreviewTab("Cliente"); }} className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={12} /></button>

                              {/* Generar Cotización Final — BORRADOR with hotelsComparison */}
                              {cot.status === "BORRADOR" && hasComparison && (
                                <button
                                  onClick={() => handleOpenFinalizeDialog(cot.id)}
                                  className="p-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-lg border border-secondary/20 transition-all cursor-pointer"
                                  title="Generar Cotización Final"
                                >
                                  <Star size={12} />
                                </button>
                              )}

                              {(cot.status === "ENVIADA" || cot.status === "BORRADOR") && (
                                <>
                                  <button onClick={() => handleAprobar(cot.id)} className="p-1.5 bg-light hover:bg-emerald-50 text-primary hover:text-emerald-600 rounded-lg border border-lighter transition-all cursor-pointer" title="Aprobar"><Check size={12} /></button>
                                  <button onClick={() => handleRechazar(cot.id)} className="p-1.5 bg-light hover:bg-rose-50 text-primary hover:text-rose-600 rounded-lg border border-lighter transition-all cursor-pointer" title="Rechazar"><X size={12} /></button>
                                </>
                              )}
                              {cot.status === "APROBADA" && (
                                <button className="p-1.5 bg-light text-primary/40 rounded-lg border border-lighter cursor-not-allowed" title="Aprobada"><Check size={12} className="text-emerald-500" /></button>
                              )}
                              {cot.status === "RECHAZADA" && (
                                <button className="p-1.5 bg-light text-primary/40 rounded-lg border border-lighter cursor-not-allowed" title="Rechazada"><X size={12} className="text-rose-400" /></button>
                              )}
                              {(cot.status === "BORRADOR" || cot.status === "RECHAZADA") && (
                                <button onClick={() => handleEliminar(cot.id)} className="p-1.5 bg-light hover:bg-rose-50 text-primary/40 hover:text-rose-500 rounded-lg border border-lighter transition-all cursor-pointer" title="Eliminar"><Trash2 size={12} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(11,67,57,0.08)] flex items-stretch h-16">
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
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative"
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

      {/* ════════════════════════ PROFORMA FINALIZATION DIALOG ════════════════════════ */}
      <dialog ref={proformaDialogRef} className="p-4" onClick={(e) => { if (e.target === proformaDialogRef.current) proformaDialogRef.current?.close(); }}>
        <div className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col select-none" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-50">
            <button onClick={() => proformaDialogRef.current?.close()} className="absolute top-5 right-5 p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-full transition-all border border-gray-100 cursor-pointer">
              <X size={16} />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Star size={22} className="stroke-[2.5]" />
              </div>
            </div>
            <h3 className="text-primary font-black text-lg tracking-tight text-center">Generar Cotización Final</h3>
            <p className="mt-1.5 text-primary/50 text-xs font-medium text-center max-w-xs mx-auto">
              Selecciona el hotel para la proforma definitiva. El estado pasará a Aprobada.
            </p>
          </div>

          {/* Hotel options */}
          <div className="px-8 py-6 space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {proformaCotId && (() => {
              const cot = cotizaciones.find((c) => c.id === proformaCotId) as CotizacionExtended | undefined;
              return (cot?.hotelsComparison ?? []).map((comp) => (
                <button
                  key={comp.hotel.id}
                  type="button"
                  onClick={() => setProformaChosenHotel(comp.hotel.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                    proformaChosenHotel === comp.hotel.id
                      ? "border-secondary bg-secondary/5"
                      : "border-gray-100 hover:border-secondary/30 hover:bg-light/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${proformaChosenHotel === comp.hotel.id ? "border-secondary bg-secondary" : "border-gray-300"}`}>
                    {proformaChosenHotel === comp.hotel.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-primary">{comp.hotel.name}</p>
                    <p className="text-[10px] text-primary/40 font-bold mt-0.5">
                      Subtotal: ${comp.subtotal.toLocaleString()}
                      {comp.extraNightsCost > 0 ? ` + $${comp.extraNightsCost.toLocaleString()} noches extra` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-secondary">${comp.total.toLocaleString()}</span>
                    <span className="block text-[9px] text-primary/30 font-bold">USD total</span>
                  </div>
                </button>
              ));
            })()}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-50 pt-5">
            <button onClick={() => proformaDialogRef.current?.close()} className="w-full sm:w-auto px-6 py-3 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer">
              Cancelar
            </button>
            <button
              onClick={handleFinalizeCotizacion}
              disabled={!proformaChosenHotel}
              className="w-full sm:w-auto px-6 py-3 bg-secondary hover:bg-secondary-light disabled:opacity-40 disabled:cursor-not-allowed text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={14} /> Confirmar y Aprobar
            </button>
          </div>
        </div>
      </dialog>

      {/* ════ COTIZACIÓN PREVIEW MODAL ════ */}
      {previewCot && (() => {
        const tabs = ["Cliente", "Viaje & Precios", "Notas"] as const;
        return (
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setPreviewCot(null); }}
          >
            {/* Shell — bottom-sheet on mobile, centered card on desktop */}
            <div className="relative bg-white w-full sm:max-w-xl sm:mx-4 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] sm:max-h-[88vh]">
              {/* ── Sticky Header ── */}
              <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 rounded-t-3xl bg-white">
                {/* drag handle — mobile only */}
                <div className="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
                <div className="flex items-start justify-between gap-3">
                  {/* Left: code + name */}
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-secondary/70 tracking-widest uppercase mb-0.5">{previewCot.codigo}</span>
                    <p className="font-black text-primary text-sm leading-tight truncate max-w-[220px] sm:max-w-xs">{previewCot.paqueteNombre}</p>
                    <p className="text-[11px] font-bold text-primary/50 mt-0.5 truncate">{previewCot.paqueteDestino || "—"}</p>
                  </div>
                  {/* Right: total hero + status + close */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewCot(null)}
                      className="w-7 h-7 rounded-xl bg-light hover:bg-gray-100 flex items-center justify-center text-primary/40 hover:text-primary transition-all cursor-pointer self-end"
                    >
                      <X size={14} />
                    </button>
                    <div className="text-right">
                      <span className="block text-xl font-black text-primary tracking-tight">${previewCot.total.toLocaleString()}</span>
                      <span className="block text-[9px] font-bold text-primary/40 uppercase tracking-wider">USD Total</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg tracking-wider flex items-center gap-1.5 ${STATUS_BADGE[previewCot.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[previewCot.status]}`} />
                      {COTIZACION_STATUS_LABEL[previewCot.status]}
                    </span>
                  </div>
                </div>
                {/* Tab bar */}
                <div className="flex gap-1 mt-4 bg-light p-1 rounded-xl">
                  {tabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setPreviewTab(t)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        previewTab === t
                          ? "bg-white shadow-sm text-primary"
                          : "text-primary/40 hover:text-primary/70"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
                {/* ── TAB 1: Cliente ── */}
                {previewTab === "Cliente" && (
                  <div className="space-y-2">
                    {([
                      [<User size={12} className="text-secondary shrink-0" />,   "Nombre",    previewCot.cliente?.nombre    || "—"],
                      [<Globe size={12} className="text-secondary shrink-0" />,  "Email",     previewCot.cliente?.email     || "—"],
                      [<MapPin size={12} className="text-secondary shrink-0" />, "Teléfono",  previewCot.cliente?.telefono  || "—"],
                      [<FileText size={12} className="text-secondary shrink-0" />, "Documento", previewCot.cliente?.documento || "—"],
                      [<MapPin size={12} className="text-secondary shrink-0" />, "Dirección", previewCot.cliente?.direccion || "—"],
                      [<Calendar size={12} className="text-secondary shrink-0" />, "Creada",  previewCot.fechaCreacion],
                    ] as [React.ReactNode, string, string][]).map(([icon, label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary/40 tracking-wider shrink-0">
                          {icon} {label}
                        </div>
                        <span className="text-xs font-bold text-primary text-right truncate max-w-[55%]">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* ── TAB 2: Viaje & Precios ── */}
                {previewTab === "Viaje & Precios" && (
                  <div className="space-y-4">
                    {/* Trip summary rows */}
                    <div className="space-y-2">
                      {([
                        [<MapPin size={12} />,   "Destino",   previewCot.paqueteDestino  || "—"],
                        [<Calendar size={12} />, "Duración",  previewCot.paqueteDuracion || "—"],
                        [<Calendar size={12} />, "Salida",    previewCot.fechaViaje      || "—"],
                        [<Calendar size={12} />, "Retorno",   previewCot.fechaRetorno    || "—"],
                        [<User size={12} />,     "Pasajeros", resumenPasajeros(previewCot.pasajeros)],
                        [<Plane size={12} />,    "Boleto",    previewCot.incluyeBoleto ? "Incluido ✓" : "No incluido"],
                      ] as [React.ReactNode, string, string][]).map(([icon, label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary/60 tracking-wider shrink-0">
                            <span className="text-secondary">{icon}</span> {label}
                          </div>
                          <span className={`text-xs font-bold text-right ${label === "Boleto" && previewCot.incluyeBoleto ? "text-secondary" : "text-primary"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Incluye list — compact pills */}
                    {previewCot.paqueteIncluye?.length > 0 && (
                      <div>
                        <span className="block text-[9px] font-black uppercase text-primary/40 tracking-widest mb-2">Incluye</span>
                        <div className="flex flex-wrap gap-1.5">
                          {previewCot.paqueteIncluye.map((item, i) => (
                            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/15">
                              <CheckCircle2 size={9} /> {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Pricing table — compact */}
                    <div>
                      <span className="block text-[9px] font-black uppercase text-primary/40 tracking-widest mb-2">Desglose</span>
                      <div className="rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-light">
                              {["Tipo", "$/Pax", "Cant.", "Total"].map((h) => (
                                <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase text-primary/40 tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {(() => {
                              const tipos = ["SGL","DBL","TPL","QUAD","CHD"] as const;
                              const activeRooms = tipos.map((tipo) => {
                                const qty    = (previewCot.pasajeros as any)[`cant${tipo}`] as number ?? 0;
                                const precio = (previewCot.precios   as any)[`precio${tipo}`] as number ?? 0;
                                return { tipo, qty, precio, roomSub: precio * qty };
                              }).filter((r) => r.qty > 0);
                              const showMarkupPerRoom = previewCot.status === "BORRADOR" || previewCot.status === "ENVIADA";
                              const totalRoomSub = activeRooms.reduce((s, r) => s + r.roomSub, 0);
                              const markup = previewCot.markup ?? 0;
                              return (
                                <>
                                  {activeRooms.map(({ tipo, qty, precio, roomSub }) => {
                                    const markupShare = totalRoomSub > 0 ? Math.round(markup * (roomSub / totalRoomSub)) : 0;
                                    const displayTotal = showMarkupPerRoom ? roomSub + markupShare : roomSub;
                                    return (
                                      <tr key={tipo} className="hover:bg-light/60">
                                        <td className="px-3 py-2.5 font-black text-primary">{tipo}</td>
                                        <td className="px-3 py-2.5 font-black text-secondary">${precio.toLocaleString()}</td>
                                        <td className="px-3 py-2.5 text-primary/60">{qty}</td>
                                        <td className="px-3 py-2.5 font-black text-primary">
                                          ${displayTotal.toLocaleString()}
                                          {showMarkupPerRoom && markupShare > 0 && (
                                            <span className="ml-1 text-[9px] font-bold text-primary/30">(+${markupShare})</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {(previewCot.precios.precioBoleto ?? 0) > 0 && (
                                    <tr className="hover:bg-light/60">
                                      <td className="px-3 py-2.5 font-black text-primary">
                                        <span className="flex items-center gap-1.5"><Plane size={10} className="text-secondary" /> Boleto</span>
                                      </td>
                                      <td className="px-3 py-2.5 font-black text-secondary">${previewCot.precios.precioBoleto!.toLocaleString()}</td>
                                      <td className="px-3 py-2.5 text-primary/60">—</td>
                                      <td className="px-3 py-2.5 font-black text-primary">${previewCot.precios.precioBoleto!.toLocaleString()}</td>
                                    </tr>
                                  )}
                                  {!showMarkupPerRoom && markup > 0 && (
                                    <tr className="bg-light/40">
                                      <td className="px-3 py-2.5 text-primary/50 font-bold text-[10px]" colSpan={3}>Markup agencia</td>
                                      <td className="px-3 py-2.5 font-black text-secondary">${markup.toLocaleString()}</td>
                                    </tr>
                                  )}
                                  <tr className="bg-primary border-t-2 border-secondary/40">
                                    <td className="px-3 py-3 font-black text-white text-[10px] uppercase tracking-wider" colSpan={3}>
                                      {showMarkupPerRoom ? "Total por Habitación" : "Total Proforma"}
                                    </td>
                                    <td className="px-3 py-3 font-black text-secondary text-sm">${previewCot.total.toLocaleString()}</td>
                                  </tr>
                                </>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {/* ── TAB 3: Notas ── */}
                {previewTab === "Notas" && (
                  <div className="space-y-3">
                    {previewCot.notas ? (
                      <p className="text-xs font-bold text-primary/70 p-4 bg-light border border-lighter rounded-2xl leading-relaxed whitespace-pre-wrap">{previewCot.notas}</p>
                    ) : (
                      <div className="py-12 text-center">
                        <FileText size={24} className="text-primary/15 mx-auto mb-2" />
                        <p className="text-xs font-bold text-primary/30">Sin notas en esta cotización.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* ── Sticky Footer ── */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-3xl sm:rounded-b-3xl">
                <span className="text-[10px] font-bold text-primary/40">Creada: {previewCot.fechaCreacion}</span>
                <button
                  onClick={() => setPreviewCot(null)}
                  className="px-5 py-2.5 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
