"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/services/api";
import {
  Package,
  Cotizacion,
  CotizacionStatus,
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
} from "lucide-react";

// ─── Cotizar-datos API types ──────────────────────────────────────────────────
interface CotHotelTarifa { tipoHabitacion: string; precioBase: number }
interface CotHotel { id: number; nombre: string; estrellas: number; tarifas: CotHotelTarifa[] }
interface CotDestino { id: number; ciudad: string; pais: string; hoteles: CotHotel[] }
interface CotPaqueteVersion { tipoPax: string; numPax: number; precioPorPersona: number | null }
interface CotPaquete {
  id: number; nombre: string; diasEstancia: number; nochesBase: number;
  incluyeBoleto: boolean; destinoCiudad: string; destinoPais: string;
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
const inputCls = "w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all";
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
  const [step,        setStep]        = useState(1);
  const [quoteLocked, setQuoteLocked] = useState(false);

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
        if (cfg.defaultMarkup) setDefaultMarkup(cfg.defaultMarkup);
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

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedPkg = packages.find((p) => String(p.id) === String(selectedPkgId)) ?? packages[0];

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
  const cotAvailableHotels = cotSelectedDestino?.hoteles ?? [];
  const cotPrimaryHotel    = cotAvailableHotels.find((h) => cotSelectedHotelIds.includes(h.id)) ?? null;

  const cotNoches = cotMode === "catalogo"
    ? (cotSelectedPkg?.nochesBase ?? 0)
    : Math.max(0, cotCustomDias - 1);

  const cotFechaRetorno = cotFechaSalida
    ? (() => {
        const d = new Date(cotFechaSalida + "T00:00:00");
        d.setDate(d.getDate() + cotCustomDias);
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
  const cotTotal       = cotSubtotalAlojamiento + cotManualTotal + agencyMarkup;

  const cotPaxResumen = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .map(([tipoPax, qty]) => `${qty} ${tipoPax}`)
    .join(" + ") || "—";

  const cotTotalRoomPax = Object.entries(cotHabs)
    .reduce((sum, [tipoPax, qty]) => sum + (COT_NUM_PAX[tipoPax] ?? 1) * qty, 0);

  const cotShowPaxWarning = cotNumPersonas > 0 && cotTotalRoomPax > 0 && cotTotalRoomPax !== cotNumPersonas;

  const cotDestinoCiudad = cotMode === "catalogo"
    ? (cotSelectedPkg?.destinoCiudad ?? "—")
    : (cotSelectedDestino?.ciudad ?? "—");
  const cotDestinoPais = cotMode === "catalogo"
    ? (cotSelectedPkg?.destinoPais ?? "")
    : (cotSelectedDestino?.pais ?? "");
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

  const handleSaveProforma = async () => {
    let paqueteId: number | null = null;
    let paqueteNombre = "";
    let paqueteDestino = "";
    let paqueteDuracion = "";
    let paqueteIncluye: string[] = cotManualServices.map((s) => s.descripcion).filter(Boolean);
    let incluyeBoleto = false;

    if (cotMode === "catalogo" && cotSelectedPkg) {
      paqueteId       = cotSelectedPkg.id;
      paqueteNombre   = cotSelectedPkg.nombre;
      paqueteDestino  = `${cotSelectedPkg.destinoCiudad}, ${cotSelectedPkg.destinoPais}`;
      paqueteDuracion = `${cotSelectedPkg.diasEstancia} Días / ${cotSelectedPkg.nochesBase} Noches`;
      incluyeBoleto   = cotSelectedPkg.incluyeBoleto;
    } else if (cotMode === "libre" && cotSelectedDestino) {
      paqueteNombre   = `Cotización Libre — ${cotSelectedDestino.ciudad}`;
      paqueteDestino  = `${cotSelectedDestino.ciudad}, ${cotSelectedDestino.pais}`;
      paqueteDuracion = `${cotCustomDias} Días / ${cotNoches} Noches`;
    }

    const now    = new Date();
    const fecha  = now.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
    const cliId  = `cli-${Date.now()}`;
    const codigo = `PRF-${now.getFullYear()}-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const notasStr = cotManualServices.length > 0
      ? cotManualServices.map((s) => `${s.descripcion}: $${s.costo}`).join("; ")
      : undefined;

    const newCot: CotizacionExtended = {
      id: `cot-${Date.now()}`,
      codigo,
      agenciaId:   "agencia-andina",
      creadoPorId: "user-session",
      paqueteId:   paqueteId ?? 0,
      clienteId: cliId,
      cliente: {
        id: cliId, agenciaId: "agencia-andina",
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
        precioSGL:  getCotPrice("SGL"),  precioDBL:  getCotPrice("DBL"),
        precioTPL:  getCotPrice("TPL"),  precioQUAD: getCotPrice("QUAD"), precioCHD: getCotPrice("CHD"),
      },
      subtotal:      cotSubtotalAlojamiento,
      markup:        agencyMarkup,
      total:         cotTotal,
      fechaViaje:    cotFechaSalida || undefined,
      status:        "BORRADOR",
      notas:         notasStr,
      fechaCreacion: fecha,
    };

    setCotizaciones((prev) => [newCot, ...prev]);
    setActiveTab("cotizaciones");
    resetForm();

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
          subtotal: cotSubtotalAlojamiento, markup: agencyMarkup, total: cotTotal,
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
      }
    } catch {}
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
                { id: "paquetes",     icon: <Compass size={16} />,         label: "Cotizar Paquetes" },
                { id: "cotizar",      icon: <Plus size={16} className="stroke-[2.5]" />, label: "Nueva Cotización" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if (item.id === "cotizar") resetForm(); }}
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
                onClick={() => setActiveTab("cotizaciones")}
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

            {isAdmin && (
              <div className="space-y-1.5">
                <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">Configuración</span>
                <button
                  onClick={() => setActiveTab("marca-blanca")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "marca-blanca"
                      ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings2 size={16} /> Mi Marca Blanca
                </button>
              </div>
            )}
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
              {activeTab === "marca-blanca" && "Marca Blanca"}
              {activeTab === "perfil"       && "Mi Perfil"}
            </h2>
            <div className="hidden lg:flex flex-col">
              <h2 className="text-base font-black text-primary uppercase tracking-widest leading-none">
                {activeTab === "dashboard"    && "Dashboard"}
                {activeTab === "paquetes"     && "Cotizar Paquetes"}
                {activeTab === "cotizar"      && "Nueva Cotización"}
                {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
                {activeTab === "marca-blanca" && "Mi Marca Blanca"}
                {activeTab === "perfil"       && "Mi Perfil"}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1.5">
                <span>Inicio</span><span>/</span>
                <span className="text-secondary">
                  {activeTab === "dashboard"    && "Dashboard"}
                  {activeTab === "paquetes"     && "Cotizar Paquetes"}
                  {activeTab === "cotizar"      && "Nueva Cotización"}
                  {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
                  {activeTab === "marca-blanca" && "Mi Marca Blanca"}
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
                              <button onClick={() => alert(`Previsualizando ${cot.codigo}`)} className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer"><Eye size={12} /></button>
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
                          <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border-2 transition-all ${active ? "bg-secondary border-secondary text-primary shadow-glow scale-110" : "border-gray-200 bg-white text-gray-400"}`}>
                            {si.s}
                          </div>
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
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
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
                          <label className={labelCls}>Correo Electrónico *</label>
                          <input type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} onBlur={handleClientEmailBlur} placeholder="cliente@email.com" className={inputCls} />
                          {clientFoundMsg && <p className="text-[10px] font-bold text-secondary mt-1">{clientFoundMsg}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Teléfono / WhatsApp *</label>
                          <input type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+593 9XXXXXXXX" className={inputCls} />
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

                      <div className="flex justify-end pt-2">
                        <button onClick={() => setStep(2)} className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                          Siguiente Paso <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── PASO 2: CONFIGURACIÓN DEL VIAJE ── */}
                  {step === 2 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
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
                        </div>
                      )}

                      {/* Modo Libre */}
                      {cotMode === "libre" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className={labelCls}>Destino *</label>
                            {cotizarData === null ? (
                              <div className="flex items-center gap-2 py-3 text-primary/40 text-xs font-bold">
                                <div className="w-4 h-4 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                Cargando destinos...
                              </div>
                            ) : (
                              <select
                                value={cotSelectedDestinoId ?? ""}
                                onChange={(e) => { setCotSelectedDestinoId(Number(e.target.value) || null); setCotSelectedHotelIds([]); }}
                                className={inputCls}
                              >
                                <option value="">Seleccionar destino...</option>
                                {cotizarData.destinos.map((d) => (
                                  <option key={d.id} value={d.id}>{d.ciudad}, {d.pais}</option>
                                ))}
                              </select>
                            )}
                          </div>
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
                          {cotSelectedDestino && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className={labelCls}>Hoteles del Destino (máx. 4)</label>
                                {cotSelectedHotelIds.length > 0 && (
                                  <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20">
                                    {cotSelectedHotelIds.length} seleccionado{cotSelectedHotelIds.length > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {cotAvailableHotels.map((hotel) => {
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
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {cotSelectedHotelIds.length === 0 && (
                                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5"><AlertCircle size={11} /> Selecciona al menos un hotel para continuar.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Atrás</button>
                        <button
                          onClick={() => {
                            const ok = cotMode === "catalogo" ? cotSelectedPkgId !== null : cotSelectedHotelIds.length > 0;
                            if (ok) setStep(3);
                          }}
                          disabled={cotMode === "catalogo" ? cotSelectedPkgId === null : cotSelectedHotelIds.length === 0}
                          className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          Siguiente Paso <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── PASO 3: HABITACIONES & SERVICIOS ── */}
                  {step === 3 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
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
                                  <button type="button" onClick={() => setCotHabs((prev) => ({ ...prev, [tipoPax]: (prev[tipoPax] ?? 0) + 1 }))} className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm">
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

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Atrás</button>
                        <button onClick={() => setStep(4)} className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                          Revisar Proforma <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
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

                      {Object.entries(cotHabs).some(([, qty]) => qty > 0) && (
                        <div className="overflow-x-auto">
                          <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider mb-2">Detalle de Habitaciones</p>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-100">
                                {["Tipo","Cant.","P. Persona","P. Habitación","Total"].map((h) => (
                                  <th key={h} className={`pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider ${h !== "Tipo" ? "text-right" : ""}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/70">
                              {Object.entries(cotHabs).filter(([, qty]) => qty > 0).map(([tipoPax, qty]) => {
                                const precio = getCotPrice(tipoPax);
                                const numPax = COT_NUM_PAX[tipoPax] ?? 1;
                                const precioHab = precio * numPax;
                                const subtotalRow = cotMode === "libre" ? precioHab * qty * cotNoches : precioHab * qty;
                                return (
                                  <tr key={tipoPax}>
                                    <td className="py-2.5 text-primary/50">{tipoPax}</td>
                                    <td className="py-2.5 text-right">{qty}</td>
                                    <td className="py-2.5 text-right">${precio.toLocaleString()}</td>
                                    <td className="py-2.5 text-right">${precioHab.toLocaleString()}</td>
                                    <td className="py-2.5 text-right font-black text-primary">${subtotalRow.toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                              {cotManualServices.filter((s) => s.costo > 0).map((svc) => (
                                <tr key={svc.id}>
                                  <td className="py-2.5 text-primary/50 text-[10px]" colSpan={4}>{svc.descripcion || "Servicio adicional"}</td>
                                  <td className="py-2.5 text-right font-black text-primary">${svc.costo.toLocaleString()}</td>
                                </tr>
                              ))}
                              {agencyMarkup > 0 && (
                                <tr>
                                  <td className="py-2.5 text-[10px] text-primary/50" colSpan={4}>Markup agencia</td>
                                  <td className="py-2.5 text-right font-black text-secondary">${agencyMarkup.toLocaleString()}</td>
                                </tr>
                              )}
                              <tr className="border-t-2 border-secondary/30">
                                <td className="py-3 text-[10px] font-black text-primary uppercase" colSpan={4}>TOTAL</td>
                                <td className="py-3 text-right font-black text-secondary text-sm">${cotTotal.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Atrás</button>
                        <button onClick={handleSaveProforma} className="px-6 py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
                          <Star size={14} /> Guardar Cotización
                        </button>
                      </div>
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
                          <button onClick={() => alert(`Visualizando ${cot.codigo}`)} className="p-2 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-xl border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={14} /></button>
                          {cot.status === "BORRADOR" && !!ext.hotelsComparison?.length && (
                            <button onClick={() => handleOpenFinalizeDialog(cot.id)} className="p-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary rounded-xl border border-secondary/20 transition-all cursor-pointer"><Star size={14} /></button>
                          )}
                          {(cot.status === "ENVIADA" || cot.status === "BORRADOR") && (
                            <>
                              <button onClick={() => handleAprobar(cot.id)} className="p-2 bg-light hover:bg-emerald-50 text-primary hover:text-emerald-600 rounded-xl border border-lighter transition-all cursor-pointer"><Check size={14} /></button>
                              <button onClick={() => handleRechazar(cot.id)} className="p-2 bg-light hover:bg-rose-50 text-primary hover:text-rose-600 rounded-xl border border-lighter transition-all cursor-pointer"><X size={14} /></button>
                            </>
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
                              <button onClick={() => alert(`Visualizando ${cot.codigo}`)} className="p-1.5 bg-light hover:bg-secondary/15 text-primary hover:text-secondary rounded-lg border border-lighter transition-all cursor-pointer" title="Previsualizar"><Eye size={12} /></button>

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

          {/* ════════════════════════ MARCA BLANCA ════════════════════════ */}
          {activeTab === "marca-blanca" && isAdmin && (
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
                          <Image src={agencyLogo} alt="Logotipo" fill className="object-contain p-1" />
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
                        <div className="relative w-28 h-10 mb-1"><img src={agencyLogo} alt="Logo" className="max-h-full object-contain" /></div>
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

              {/* Marca Blanca — solo admins */}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("marca-blanca")}
                  className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center justify-between text-left active:bg-light transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Settings2 size={16} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary">Mi Marca Blanca</p>
                      <p className="text-[10px] font-bold text-primary/40 mt-0.5">Logo, datos y markup de agencia</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-primary/30 shrink-0" />
                </button>
              )}

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
          const isActive = id === "perfil"
            ? activeTab === "perfil" || activeTab === "marca-blanca"
            : activeTab === id;
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

    </div>
  );
}
