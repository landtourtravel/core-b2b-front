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
  IncluyeDestinoGroup,
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
  AlertTriangle,
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
  Pencil,
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { DashboardContext, type CotizacionExtended, type HotelCompSnapshot } from "./DashboardContext";
import DashboardTab from "./components/DashboardTab";
import PaquetesTab from "./components/PaquetesTab";
import { QUICK_QUOTE_PENDING_KEY } from "./components/PaqueteDetailView";
import { EDIT_COT_PENDING_KEY } from "./components/CotizacionDetailView";
import { GENERIC_CLIENT_EMAIL } from "@/lib/constants";
import CotizacionesTab from "./components/CotizacionesTab";
import {
  calcHotelBreakdown,
  getUncoveredChildAges,
  getChildPriceForAge,
  getActividadAdultPerPax,
  getActividadChildPerPax,
  getTrasladoPerPax,
  getTrasladoChildPerPax,
  cartesian,
  combineComboLegs,
  hotelPerDestinoPrice,
  buildRoomRates,
  numPaxToTipoPax,
  groupIncluyeByDestino,
  dedupeDestinoLabels,
  toggleHotelWithSingleDestinoCap,
  type HotelBreakdown,
  type ComboLeg,
  type ComboTotals,
} from "./cotizar-price";
import type {
  CotHotel, CotActividad, CotTraslado, CotDestino, CotPaqueteVersion, CotPoliticaNinos,
  CotPaqueteActividad, CotPaqueteTraslado, CotPaqueteDestino, CotPaqueteHotel, CotPaquete,
  CotizarData,
} from "./cotizar-types";

// ─── Status style maps (must be at file scope for Tailwind scanning) ──────────
const STATUS_BADGE: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-50 text-sky-600",
  ENVIADA:   "bg-amber-50 text-amber-600",
  APROBADA:  "bg-emerald-50 text-emerald-600",
  RECHAZADA: "bg-rose-50 text-rose-600",
  LIQUIDADA: "bg-violet-50 text-violet-600",
};
const STATUS_DOT: Record<CotizacionStatus, string> = {
  BORRADOR:  "bg-sky-500",
  ENVIADA:   "bg-amber-500",
  APROBADA:  "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
  LIQUIDADA: "bg-violet-500",
};

// ─── Aviso de política de niños (edad no cubierta) ────────────────────────────
// Muestra un warning ámbar dentro de la card del hotel cuando la edad de uno o más
// niños no cae en ningún rango de PoliticaNinos. NO bloquea la selección: el niño se
// cotiza a tarifa de adulto (coherente con getChildPriceForAge → aplica:false).
function formatEdades(ages: number[]): string {
  if (ages.length === 1) return `${ages[0]} años`;
  return `${ages.slice(0, -1).join(", ")} y ${ages[ages.length - 1]} años`;
}
function ChildPolicyWarning({
  politicaNinos,
  childAges,
  className = "",
}: {
  politicaNinos: CotPoliticaNinos[];
  childAges: number[];
  className?: string;
}) {
  const uncovered = getUncoveredChildAges({ politicaNinos }, childAges);
  if (uncovered.length === 0) return null;
  const edadesTxt = formatEdades(uncovered);
  const plural = uncovered.length !== 1;
  return (
    <div className={`flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl ${className}`}>
      <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-black text-amber-700 leading-snug">
          {uncovered.length} niño{plural ? "s" : ""} sin política de edad ({edadesTxt})
        </p>
        <p className="text-[10px] font-semibold text-amber-600/90 leading-snug mt-0.5">
          Este hotel cobrará tarifa de adulto para {plural ? "los niños" : "el niño"} de {edadesTxt} al no contar con políticas de rango de edad disponibles.
        </p>
      </div>
    </div>
  );
}

// ─── T&C static text ──────────────────────────────────────────────────────────
const TERMINOS_CONDICIONES = `Los precios indicados son por persona en la categoría de habitación seleccionada y están sujetos a disponibilidad hotelera al momento de la reserva. Land Tour Travel actúa como operador mayorista; la agencia minorista es responsable de la relación comercial con el cliente final. El pago del depósito de reserva (40% del total) es obligatorio para confirmar los servicios. Cancelaciones con menos de 15 días de anticipación están sujetas a penalidades del 50%. Los vuelos, cuando son incluidos, están sujetos a las políticas de la aerolínea operadora. Land Tour Travel no se responsabiliza por cambios de vuelo, demoras o cancelaciones por parte de la aerolínea. El pasajero es responsable de contar con documentación vigente (pasaporte, visa si aplica). Las tarifas de niños aplican para menores de 2 a 11 años compartiendo habitación con adultos. El markup/comisión de agencia no es visible para el cliente final en los documentos exportados.`;

// ─── Draft key ───────────────────────────────────────────────────────────────
const DRAFT_KEY = "cotizador-draft-v1";


// ─── Input style helper ───────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const inputDisabledCls = "w-full px-4 py-3 bg-light border border-lighter text-primary/50 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-not-allowed";
const labelCls = "block text-[10px] font-black uppercase text-primary/40 tracking-wider";

export default function DashboardPage() {
  // ── Session ─────────────────────────────────────────────────────────────────
  let sessionData: ReturnType<typeof useSession>["data"] = null;
  let sessionStatus: "loading" | "authenticated" | "unauthenticated" = "loading";
  try {
    const { data, status } = useSession();
    sessionData = data;
    sessionStatus = status;
  } catch {}

  // While the session hook is still resolving, identity fields render skeletons
  // instead of placeholder text (no fake "Ana Córdova" / "Viajes Andina Tours").
  const sessionReady   = sessionStatus !== "loading";
  const userName       = sessionData?.user?.name || "";
  const rawRole        = (sessionData?.user as any)?.role as string | undefined;
  const isAdmin        = rawRole === "SUPERADMIN" || rawRole === "COLABORADOR_INTERNO";
  const agenciaDisplay = (sessionData?.user as any)?.agenciaNombre || "";
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

  // Picks up a pending quick-quote request stashed by /dashboard/paquetes/[id]'s
  // "Cotizar este paquete" button (that route has no access to this component's state).
  useEffect(() => {
    const pending = localStorage.getItem(QUICK_QUOTE_PENDING_KEY);
    if (pending) {
      localStorage.removeItem(QUICK_QUOTE_PENDING_KEY);
      handleQuickQuote(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Picks up a pending "Editar" request stashed by CotizacionDetailView's edit button
  // (that route is a standalone page with no access to this component's state).
  useEffect(() => {
    const pendingEditId = localStorage.getItem(EDIT_COT_PENDING_KEY);
    if (pendingEditId) {
      localStorage.removeItem(EDIT_COT_PENDING_KEY);
      handleEditCot(pendingEditId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // When true, the next "default hotel per destino" effect run skips auto-selecting
  // and consumes the flag — set right before restoreDraft()/handleEditCot() write a
  // restored cotSelectedHotelIds, so that restore doesn't get clobbered by the default.
  const skipHotelDefaultRef = useRef(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Stepper ──────────────────────────────────────────────────────────────────
  const [step,              setStep]              = useState(1);
  const [quoteLocked,       setQuoteLocked]       = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSavingQuote,   setIsSavingQuote]   = useState(false);
  const [hasDraft,        setHasDraft]        = useState(false);
  // Cotización BORRADOR que se está editando (id real en BD). Se setea al abrir
  // "Editar" desde el listado, y también tras cualquier guardado exitoso — así,
  // si el asesor desbloquea y vuelve a guardar dentro de la misma sesión, se
  // actualiza la misma fila en vez de crear una cotización duplicada.
  const [editingCotId,     setEditingCotId]     = useState<string | null>(null);

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
  // Child air fare per pax (separate from the adult fare). Defaults from the package's
  // precioBoletoNino, falling back to the adult precioBoleto when no child fare is declared.
  const [cotFlightPriceChild, setCotFlightPriceChild] = useState<number>(0);
  // Descripción libre del boleto — solo modo libre (no hay paquete de donde tomarla).
  const [cotLibreFlightDesc, setCotLibreFlightDesc] = useState<string>("");
  // Noches adicionales por destino (#5). Keyed by destinoId. Total derived as cotExtraNights.
  const [cotExtraNightsByDestino, setCotExtraNightsByDestino] = useState<Record<number, number>>({});
  // Modo libre multi-destino: noches que se pasan en CADA destino (keyed por destinoId).
  // La "Cantidad de Días" (cotCustomDias) sigue siendo el total global — este mapa se valida
  // contra ese total (cotLibreNochesMatch) antes de dejar avanzar el wizard, para que el
  // asesor declare explícitamente cuántas noches van en cada parada (nunca se asume un reparto).
  const [cotLibreNochesByDestino, setCotLibreNochesByDestino] = useState<Record<number, number>>({});
  const [cotLibreActSel,      setCotLibreActSel]      = useState<Record<number, boolean>>({});
  const [cotLibreTrsSel,      setCotLibreTrsSel]      = useState<Record<number, boolean>>({});
  const [cotIsMultiDestino,   setCotIsMultiDestino]   = useState(false);
  const [cotExtraDestinoIds,  setCotExtraDestinoIds]  = useState<number[]>([]);
  const [cotFromQuickQuote,   setCotFromQuickQuote]   = useState(false);
  const [cotNinosEdades,      setCotNinosEdades]      = useState<number[]>([]);

  // Marca blanca (persiste en localStorage)
  const [agencyLogo,    setAgencyLogo]    = useState<string | null>(null);
  const [agencyName,    setAgencyName]    = useState("");
  const [agencyPhone,   setAgencyPhone]   = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [defaultMarkup, setDefaultMarkup] = useState("0");
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
      } catch {}
    }
    fetch("/api/agency/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nombre)   setAgencyName(data.nombre);
        if (data?.telefono) setAgencyPhone(data.telefono);
        // logoUrl vive en Agencia (BD, gestionado desde lt-core-admin) — fuente
        // única de verdad, nunca localStorage, para que se refleje igual en
        // todos los agentes de la agencia sin depender de este navegador.
        setAgencyLogo(data?.logoUrl ?? null);
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

  // (#3) Default the per-person flight price from the package's real precioBoleto.
  // Only while there's no explicit user override (cotFlightOverride === null).
  useEffect(() => {
    if (cotMode !== "catalogo" || cotFlightOverride !== null) return;
    const pkg = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
    setCotFlightPrice(pkg?.precioBoleto ?? 0);
    // Child fare defaults to precioBoletoNino; falls back to the adult fare when the
    // package has no child fare declared (column absent / null).
    setCotFlightPriceChild(pkg?.precioBoletoNino ?? pkg?.precioBoleto ?? 0);
  }, [cotMode, cotSelectedPkgId, cotizarData, cotFlightOverride]);

  // El admin fija en el paquete (`gananciaAgencia`) un piso de comisión — la ganancia mínima
  // garantizada para la agencia. Al elegir un paquete, se precarga ese valor en el
  // campo de comisión de agencia; el asesor puede subirlo pero el input nunca queda por
  // debajo (ver `min`/`onBlur` en el input y `cotMarkupFloor` más abajo). Ya NO se usa
  // `ajustePrecio` (puede ser negativo — es un descuento/oferta del admin, no una ganancia).
  useEffect(() => {
    if (cotMode !== "catalogo") return;
    const pkg = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
    setAgencyMarkup(pkg?.gananciaAgencia ?? 0);
  }, [cotMode, cotSelectedPkgId, cotizarData]);

  // (#5) Reset per-destino extra nights whenever the selected package changes.
  useEffect(() => {
    setCotExtraNightsByDestino({});
  }, [cotSelectedPkgId]);

  // (#7) Default hotel selection in Catalogue Mode: pick the first eligible hotel
  // of each destino so the checkboxes below start with a valid, priceable choice.
  useEffect(() => {
    if (cotMode !== "catalogo") return;
    if (skipHotelDefaultRef.current) { skipHotelDefaultRef.current = false; return; }
    const pkg = cotizarData?.paquetes.find((p) => p.id === cotSelectedPkgId) ?? null;
    if (!pkg) return;
    const defaultIds: number[] = [];
    pkg.destinos.forEach((d) => {
      const eligibleHotels = pkg.hoteles
        .filter((h) => h.destinoId === d.id)
        .filter((h) => cotNumNinos <= 0 || h.tarifas.some((t) => t.tipoHabitacion === "CHD"));
      if (eligibleHotels.length > 0) defaultIds.push(eligibleHotels[0].id);
    });
    setCotSelectedHotelIds(defaultIds);
  }, [cotMode, cotSelectedPkgId]);

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
      // Restoring a catalogo selection changes cotSelectedPkgId, which would otherwise
      // trigger the "default hotel per destino" effect and clobber this exact selection.
      if (d.cotMode === "catalogo" && d.cotSelectedHotelIds !== undefined) skipHotelDefaultRef.current = true;
      if (d.cotSelectedPkgId     !== undefined) setCotSelectedPkgId(d.cotSelectedPkgId);
      if (d.cotSelectedDestinoId !== undefined) setCotSelectedDestinoId(d.cotSelectedDestinoId);
      if (d.cotSelectedHotelIds  !== undefined) setCotSelectedHotelIds(d.cotSelectedHotelIds);
      if (d.cotHabs        !== undefined) setCotHabs(d.cotHabs);
      if (d.cotFechaSalida !== undefined) setCotFechaSalida(d.cotFechaSalida);
      if (d.cotCustomDias  !== undefined) setCotCustomDias(d.cotCustomDias);
      if (d.cotExtraNightsByDestino !== undefined) setCotExtraNightsByDestino(d.cotExtraNightsByDestino);
      if (d.cotLibreNochesByDestino !== undefined) setCotLibreNochesByDestino(d.cotLibreNochesByDestino);
      if (d.cotFlightOverride !== undefined) setCotFlightOverride(d.cotFlightOverride);
      if (d.cotFlightPrice    !== undefined) setCotFlightPrice(d.cotFlightPrice);
      if (d.cotFlightPriceChild !== undefined) setCotFlightPriceChild(d.cotFlightPriceChild);
      if (d.cotLibreFlightDesc !== undefined) setCotLibreFlightDesc(d.cotLibreFlightDesc);
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
        cotHabs, cotFechaSalida, cotCustomDias, cotExtraNightsByDestino, cotLibreNochesByDestino,
        cotFlightOverride, cotFlightPrice, cotFlightPriceChild, cotLibreFlightDesc, cotLibreActSel, cotLibreTrsSel, step,
        cotNumPersonas, cotNumNinos, cotNinosEdades, cotFromQuickQuote,
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 800);

    return () => clearTimeout(timer);
  }, [
    clientName, clientEmail, clientPhone, clientId, clientAddress,
    cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
    cotHabs, cotFechaSalida, cotCustomDias, cotExtraNightsByDestino, cotLibreNochesByDestino,
    cotFlightOverride, cotFlightPrice, cotFlightPriceChild, cotLibreFlightDesc, cotLibreActSel, cotLibreTrsSel, step, quoteLocked,
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
  // Visibilidad del boleto (adulto Y niño) — manda `visibleBoleto`, no `permitirModificarBoleto`.
  // Si visibleBoleto === false, el apartado de boleto no se muestra por ningún lado (cotizador
  // ni cotización final); el monto sigue sumado automáticamente al total.
  const cotBoletoVisible =
    cotMode !== "catalogo" || (cotSelectedPkg?.visibleBoleto ?? true);
  // Piso de comisión fijado por el admin en el paquete — la agencia solo puede aumentarlo.
  const cotMarkupFloor = cotMode === "catalogo" ? (cotSelectedPkg?.gananciaAgencia ?? 0) : 0;
  // Ajuste de precio del paquete (`Paquete.ajustePrecio`) — automático, NO editable por el
  // asesor (a diferencia de `agencyMarkup`/comisión). Puede ser negativo (descuento/oferta
  // del admin) o positivo (recargo); se aplica igual que la comisión: por persona, sumado
  // una vez por cada adulto Y una vez por cada niño (ver combineComboLegs). El asesor nunca
  // ve este número por separado — solo se refleja en el total final.
  const cotAjustePrecio = cotMode === "catalogo" ? (cotSelectedPkg?.ajustePrecio ?? 0) : 0;
  // Monto por-persona que se pasa a combineComboLegs/hotelPerDestinoPrice/calcHotelBreakdown
  // en lugar de `agencyMarkup` crudo: comisión editable + ajuste automático del paquete.
  const cotEffectiveMarkup = agencyMarkup + cotAjustePrecio;
  // (#5) Total extra nights across all destinos (per-destino counters are summed here).
  const cotExtraNights = Object.values(cotExtraNightsByDestino).reduce((a, b) => a + b, 0);

  // (#4) A hotel is eligible only if — when children are travelling — it has a CHD category
  // configured at all (price can be $0: kids may stay free). Always evaluated against live
  // DB data (cotizarData). Without children every hotel is eligible.
  const hotelHasChildRate = (h: { tarifas: { tipoHabitacion: string; precioBase: number }[] }) =>
    h.tarifas.some((t) => t.tipoHabitacion === "CHD");
  const hotelAptoNinos = (h: { tarifas: { tipoHabitacion: string; precioBase: number }[] }) =>
    cotNumNinos <= 0 || hotelHasChildRate(h);
  // Orden "más económico primero": tarifa adulto (DBL, con fallback a SGL) por noche —
  // misma base per-persona que usa el motor de precios (cotizar-price.ts).
  const hotelAccomSortPrice = (h: { tarifas: { tipoHabitacion: string; precioBase: number }[] }, tipoPax: string = "DBL") =>
    h.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase
    ?? h.tarifas.find((t) => t.tipoHabitacion === "SGL")?.precioBase
    ?? 0;
  // Multi-destino: all selected destino objects (primary + extra)
  const cotAllDestinoIds  = cotIsMultiDestino
    ? ([cotSelectedDestinoId, ...cotExtraDestinoIds].filter((id): id is number => id !== null && id !== 0))
    : (cotSelectedDestinoId ? [cotSelectedDestinoId] : []);
  const cotAllDestinos    = cotizarData?.destinos.filter((d) => cotAllDestinoIds.includes(d.id)) ?? [];
  const cotAvailableHotels = cotIsMultiDestino
    ? cotAllDestinos.flatMap((d) => d.hoteles)
    : (cotSelectedDestino?.hoteles ?? []);
  const cotPrimaryHotel    = cotAvailableHotels.find((h) => cotSelectedHotelIds.includes(h.id)) ?? null;
  // hotelId → destinoId lookups, usados para aplicar la regla "solo un destino puede
  // tener más de un hotel marcado a la vez" (evita explosión combinatoria del cartesiano).
  const cotLibreDestinoIdByHotelId = new Map<number, number>(
    cotAllDestinos.flatMap((d) => d.hoteles.map((h) => [h.id, d.id] as [number, number]))
  );
  const cotCatDestinoIdByHotelId = new Map<number, number>(
    (cotSelectedPkg?.hoteles ?? []).map((h) => [h.id, h.destinoId])
  );
  const toggleLibreHotel = (hotelId: number) => {
    const destinoId = cotLibreDestinoIdByHotelId.get(hotelId);
    if (destinoId === undefined) return;
    setCotSelectedHotelIds((prev) =>
      toggleHotelWithSingleDestinoCap(prev, hotelId, destinoId, cotLibreDestinoIdByHotelId)
    );
  };
  const toggleCatHotel = (hotelId: number) => {
    const destinoId = cotCatDestinoIdByHotelId.get(hotelId);
    if (destinoId === undefined) return;
    setCotSelectedHotelIds((prev) =>
      toggleHotelWithSingleDestinoCap(prev, hotelId, destinoId, cotCatDestinoIdByHotelId)
    );
  };
  // Comparative mode: catálogo with >1 hotel OR libre with >1 hotel selected
  const isComparativeMode =
    (cotMode === "catalogo" && (cotSelectedPkg?.hoteles.length ?? 0) > 1) ||
    (cotMode === "libre" && cotSelectedHotelIds.length > 1);

  // Version validation for catalog mode
  const today = new Date().toISOString().split("T")[0];
  // El `numPax` base del paquete ES su primera versión (creada al crear el paquete;
  // NO se guarda como fila en VersionPaquete). Las versiones adicionales que el admin
  // crea después sí viven en VersionPaquete (cada una con su numPax + tipoPax).
  // Por tanto un paquete es cotizable para N adultos si:
  //   (a) N === numPax base, o
  //   (b) existe una VersionPaquete (no-CHD) con numPax === N.
  // Si no ocurre ninguna → alerta. (Ej: pkg 17 base=2 → 2 adultos válido por base
  // aunque no haya fila DBL; 3/4 adultos válidos por versión TPL/QUAD.)
  const matchesBaseVersion = !!cotSelectedPkg && cotNumPersonas === cotSelectedPkg.numPax;
  const matchingAdultVersion = cotSelectedPkg?.versiones.find(
    (v) => v.numPax === cotNumPersonas && v.tipoPax !== "CHD" && (v.precioPorPersona ?? 0) > 0
  ) ?? null;
  const hasMatchingVersion = matchesBaseVersion || matchingAdultVersion !== null;
  // El nº de niños del paquete (`numNinos`) es solo una referencia usada por el admin para
  // configurar tarifas — NO limita cuántos niños puede declarar el asesor. El motor de
  // precios (calcHotelBreakdown) siempre calcula sobre `cotNinosEdades.length` (los niños
  // reales de la cotización), nunca sobre `Paquete.numNinos`, así que un paquete puede
  // cotizarse sin niños o con más/menos niños que los declarados por el admin sin afectar
  // el cálculo.
  // (#6) Warn only when NONE of the package's hotels has a valid CHD rate (live DB check).
  // If at least one hotel supports children, no alert — the non-apt ones are filtered in Step 3.
  const pkgHasAnyChildHotel = !!cotSelectedPkg &&
    cotSelectedPkg.hoteles.some((h) => h.tarifas.some((t) => t.tipoHabitacion === "CHD"));
  const versionWarning     = cotMode === "catalogo" && cotSelectedPkgId !== null && cotNumPersonas >= 1 &&
    !hasMatchingVersion;
  const childNoVersionWarn = cotMode === "catalogo" && cotNumNinos > 0 && cotSelectedPkgId !== null && !pkgHasAnyChildHotel;

  // Step guards
  const step1CanProceed = clientName.trim().length > 0 && cotNumPersonas >= 1;
  // Libre: exige destino(s) elegidos explícitamente (no solo "hay hoteles marcados" — esos
  // ids pueden quedar como residuo de una selección previa en modo catálogo tras cambiar de
  // modo sin resetear) — con multidestino activo, exige más de un destino.
  const cotLibreDestinosOk = cotIsMultiDestino ? cotAllDestinoIds.length > 1 : cotAllDestinoIds.length > 0;

  const cotNoches = cotMode === "catalogo"
    ? (cotSelectedPkg?.nochesBase ?? 0) + cotExtraNights
    : Math.max(0, cotCustomDias - 1);

  // Modo libre multi-destino: "Cantidad de Días" (cotCustomDias → cotNoches) es el total
  // global del viaje, pero con 2+ destinos el sistema no puede adivinar cuántas de esas
  // noches corresponden a cada parada — se pide explícitamente por destino (cotLibreNochesByDestino,
  // input en la card de selección de hoteles) y se valida que la suma cuadre con el total
  // antes de dejar avanzar. Single-destino sigue usando el total global directo (sin input extra).
  const cotLibreHotelNoches = (destinoId: number): number =>
    cotMode === "libre" && cotIsMultiDestino ? (cotLibreNochesByDestino[destinoId] ?? 0) : cotNoches;
  const cotLibreNochesAsignadas = cotAllDestinoIds.reduce((sum, id) => sum + (cotLibreNochesByDestino[id] ?? 0), 0);
  const cotLibreNochesMatch = cotMode !== "libre" || !cotIsMultiDestino || cotLibreNochesAsignadas === cotNoches;

  const step2CanProceed = cotFechaSalida.trim().length > 0 &&
    (cotMode === "catalogo"
      ? cotSelectedPkgId !== null && !versionWarning
      : cotLibreDestinosOk && cotSelectedHotelIds.length > 0 && cotLibreNochesMatch);
  const cotTotalHabs = Object.values(cotHabs).reduce((sum, qty) => sum + qty, 0);
  // In Catalogue Mode every destino must have a hotel checked (checkboxes in Step 3)
  // before the quote can be priced — otherwise that destino's stop has no rate.
  const cotCatAllDestinosSelected = cotMode !== "catalogo" || !cotSelectedPkg
    ? true
    : cotSelectedPkg.destinos.every((d) =>
        cotSelectedPkg.hoteles.filter(hotelAptoNinos).filter((h) => h.destinoId === d.id).length === 0 ||
        cotSelectedHotelIds.some((id) => cotSelectedPkg.hoteles.find((h) => h.id === id)?.destinoId === d.id)
      );
  // Modo libre multi-destino: igual que catálogo, cada destino con hoteles elegibles debe
  // tener al menos un hotel marcado — si no, ese tramo no tiene tarifa y no se puede combinar
  // con los demás destinos (ver cotLibreByDestino/cotLibreCombos más abajo).
  const cotLibreAllDestinosSelected = cotMode !== "libre"
    ? true
    : cotAllDestinos.every((d) =>
        d.hoteles.filter(hotelAptoNinos).length === 0 ||
        d.hoteles.some((h) => cotSelectedHotelIds.includes(h.id))
      );
  const step3CanProceed = (isComparativeMode || cotTotalHabs > 0) && cotCatAllDestinosSelected && cotLibreAllDestinosSelected;

  const cotFechaRetorno = cotFechaSalida
    ? (() => {
        const d = new Date(cotFechaSalida + "T00:00:00");
        d.setDate(d.getDate() + cotNoches);
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

  // Boleto por tipo de pasajero. Adulto = cotFlightPrice. Niño = cotFlightPriceChild
  // (por defecto la tarifa de adulto cuando el paquete no declara una propia).
  const cotBoletoAdultoPerPax = cotFlightActive ? cotFlightPrice : 0;
  const cotBoletoNinoPerPax = cotFlightActive ? cotFlightPriceChild : 0;

  const cotCatBreakdowns: { hotel: CotPaqueteHotel; bd: HotelBreakdown }[] =
    cotMode === "catalogo" && cotSelectedPkg
      ? cotSelectedPkg.hoteles
          .filter(hotelAptoNinos)
          .filter((h) => cotSelectedHotelIds.includes(h.id))
          .map((hotel) => ({
            hotel,
            bd: calcHotelBreakdown(
              hotel, cotReqTipoPax, cotNinosEdades, cotNumPersonas,
              // Local services only: each hotel's stop bears just its own destino's
              // actividades/traslados. Boleto/markup are global (added once per combo).
              cotSelectedPkg!.actividades.filter((a) => a.destinoId === hotel.destinoId),
              cotSelectedPkg!.traslados.filter((t) => t.destinoId === hotel.destinoId),
              cotFlightActive, cotBoletoAdultoPerPax, cotEffectiveMarkup,
              cotHotelNoches(hotel),
              cotBoletoNinoPerPax,
            ),
          }))
          // Más económico primero (por-adulto, alojamiento+servicios locales) — filtrar por
          // destinoId después conserva este orden dentro de cada grupo (sort estable + subsecuencia).
          .sort((a, b) => a.bd.adultColPerPax - b.bd.adultColPerPax)
      : [];

  // Agrupa los hoteles elegidos por destino y genera TODAS las combinaciones
  // (producto cartesiano: un hotel por destino). Cada combinación se cotiza con el
  // desglose por persona adulto/niño; boleto + markup se cuentan UNA sola vez por combo.
  const cotCatByDestino = (() => {
    const m = new Map<number, { hotel: CotPaqueteHotel; bd: HotelBreakdown }[]>();
    cotCatBreakdowns.forEach((row) => {
      const dId = row.hotel.destinoId;
      if (!m.has(dId)) m.set(dId, []);
      m.get(dId)!.push(row);
    });
    return m;
  })();

  // Cuántos destinos tienen ≥2 hoteles seleccionados. Si son 2 o más, las combinaciones
  // (producto cartesiano) explotan → se muestra la lista agrupada por destino en vez de
  // combinaciones. Con 0 o 1 destino múltiple, las combinaciones siguen siendo manejables.
  const cotCatMultiHotelDestinos = [...cotCatByDestino.values()].filter((hs) => hs.length >= 2).length;
  const cotCatUseGrouped = cotCatByDestino.size > 1 && cotCatMultiHotelDestinos >= 2;

  type CotCombo = { legs: { hotel: CotPaqueteHotel; bd: HotelBreakdown }[]; totals: ComboTotals };
  const cotCatCombos: CotCombo[] = (() => {
    const groups = [...cotCatByDestino.values()];
    if (groups.length === 0) return [];
    return cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map(({ bd }) => ({
        adultAccomTotal:    bd.adultAccomTotal,
        adultServicesTotal: bd.adultServicesTotal,
        childAccomTotal:    bd.childAccomTotal,
        childServicesTotal: bd.childServicesTotal,
      }));
      const totals = combineComboLegs(
        comboLegs, cotNumPersonas, cotNumNinos,
        cotBoletoAdultoPerPax, cotBoletoNinoPerPax, cotEffectiveMarkup,
      );
      return { legs, totals };
    })
      // Más económica primero (mismo criterio — precio adulto — que CotizacionDetailView).
      .sort((a, b) => a.totals.precioAdulto - b.totals.precioAdulto);
  })();

  // Combinación representativa = la más barata (define el precio de portada y los
  // valores por persona que se guardan en el detalle).
  const cotCatRepCombo: CotCombo | null = cotCatCombos.length > 0
    ? cotCatCombos.reduce((min, c) => (c.totals.total < min.totals.total ? c : min))
    : null;
  // Precios por persona para GUARDAR el detalle: alojamiento + servicios locales SIN
  // boleto ni markup (el boleto se guarda aparte en precios.precioBoleto y el total
  // autoritativo es cotTotal). Las cards del Paso 4 usan los precios all-in de
  // combineComboLegs (t.precioAdulto/t.precioNino); esto es solo para el detalle guardado.
  const cotCatRep = cotCatRepCombo
    ? {
        subtotal:     cotCatRepCombo.totals.subtotal,
        boletoTotal:  cotCatRepCombo.totals.boletoAdultoTotal + cotCatRepCombo.totals.boletoChildTotal,
        precioAdulto: cotNumPersonas > 0
          ? (cotCatRepCombo.totals.adultAccom + cotCatRepCombo.totals.adultServices) / cotNumPersonas
          : 0,
        precioCHD:    cotNumNinos > 0
          ? (cotCatRepCombo.totals.childAccom + cotCatRepCombo.totals.childServices) / cotNumNinos
          : 0,
      }
    : null;

  // (#1) Alojamiento de niños en modo libre — según la PoliticaNinos declarada al crear el
  // hotel (no una tarifa CHD plana). `getChildPriceForAge` resuelve el fallback por cada edad
  // declarada en Paso 1: política del rango de edad → tarifa CHD del hotel → tarifa de adulto.
  // `refRate` (tarifa de adulto) es la del primer tipo de habitación de adulto seleccionado.
  const cotLibreAdultRefTipo = (["DBL", "SGL", "TPL", "QUAD"] as const).find((t) => (cotHabs[t] ?? 0) > 0) ?? null;
  const cotLibreChildAccomFor = (hotel: CotHotel | null, noches: number): number => {
    if (!hotel || cotNinosEdades.length === 0) return 0;
    const refRate = cotLibreAdultRefTipo
      ? hotel.tarifas.find((t) => t.tipoHabitacion === cotLibreAdultRefTipo)?.precioBase ?? 0
      : 0;
    return cotNinosEdades.reduce((sum, age) => sum + getChildPriceForAge(hotel, age, refRate).precio * noches, 0);
  };
  // Noches del destino de cotPrimaryHotel (preview de un solo hotel en Paso 3) — en
  // multi-destino usa las noches declaradas para ESE destino, no el total global.
  const cotPrimaryHotelNoches = cotMode === "libre" && cotPrimaryHotel
    ? cotLibreHotelNoches(cotLibreDestinoIdByHotelId.get(cotPrimaryHotel.id) ?? -1)
    : cotNoches;
  const cotLibreChildAccomTotal = cotMode === "libre" ? cotLibreChildAccomFor(cotPrimaryHotel, cotPrimaryHotelNoches) : 0;

  const cotAllActRef = cotAllDestinos.flatMap((d) => d.actividades);
  const cotAllTrsRef = cotAllDestinos.flatMap((d) => d.traslados);

  // ── Modo libre: combinación automática multi-destino (mismo patrón que catálogo) ──
  // Antes el total solo usaba `cotPrimaryHotel` (el primer hotel marcado, sin importar en
  // qué destino), ignorando los hoteles elegidos en los demás destinos — un multi-destino
  // con un hotel por destino terminaba cotizando solo con uno de ellos. Ahora se agrupan los
  // hoteles marcados por destino y se generan todas las combinaciones (un hotel por destino,
  // producto cartesiano) — la más barata es la representativa (subtotal/total guardados);
  // el asesor ve y elige entre todas al aprobar (mismo snapshot `hotelsComparison` que
  // catálogo — ver handleSaveProforma).
  const cotLibreRoomEntries = Object.entries(cotHabs).filter(([t, q]) => t !== "CHD" && q > 0);
  // Servicios (actividades/traslados) de ESTE destino — independientes del hotel elegido ahí,
  // igual que en catálogo. Misma regla de bracket adulto/niño que las sumas planas de antes.
  const cotLibreServicesForDestino = (d: CotDestino) => {
    let adultServicesTotal = 0, childServicesTotal = 0;
    d.actividades.filter((a) => cotLibreActSel[a.id]).forEach((a) => {
      adultServicesTotal += getActividadAdultPerPax(a.tarifas, cotNumPersonas) * cotNumPersonas;
      childServicesTotal += getActividadChildPerPax(a.tarifas, cotNumNinos) * cotNumNinos;
    });
    d.traslados.filter((t) => cotLibreTrsSel[t.id]).forEach((t) => {
      const adultPerPax = getTrasladoPerPax(t.tarifas, cotNumPersonas);
      adultServicesTotal += adultPerPax * cotNumPersonas;
      const childPerPax = getTrasladoChildPerPax(t.tarifas, cotNumNinos) ?? adultPerPax;
      childServicesTotal += childPerPax * cotNumNinos;
    });
    return { adultServicesTotal, childServicesTotal };
  };
  const cotLibreAccomTotalFor = (h: CotHotel, noches: number) =>
    cotLibreRoomEntries.reduce((sum, [tipoPax, qty]) => {
      const rate = h.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
      return sum + rate * (COT_NUM_PAX[tipoPax] ?? 1) * qty * noches;
    }, 0);

  type CotLibreLeg = {
    destino: CotDestino; hotel: CotHotel; noches: number;
    adultAccomTotal: number; adultServicesTotal: number;
    childAccomTotal: number; childServicesTotal: number; adultColPerPax: number;
  };
  const cotLibreBreakdowns: CotLibreLeg[] = cotMode === "libre"
    ? cotAllDestinos.flatMap((d) => {
        const { adultServicesTotal, childServicesTotal } = cotLibreServicesForDestino(d);
        const nochesDestino = cotLibreHotelNoches(d.id);
        return d.hoteles
          .filter(hotelAptoNinos)
          .filter((h) => cotSelectedHotelIds.includes(h.id))
          .map((hotel) => {
            const adultAccomTotal = cotLibreAccomTotalFor(hotel, nochesDestino);
            return {
              destino: d, hotel, noches: nochesDestino,
              adultAccomTotal, adultServicesTotal,
              childAccomTotal: cotLibreChildAccomFor(hotel, nochesDestino),
              childServicesTotal,
              adultColPerPax: cotNumPersonas > 0 ? (adultAccomTotal + adultServicesTotal) / cotNumPersonas : 0,
            };
          })
          // Más económico primero (mismo criterio que catálogo).
          .sort((a, b) => a.adultColPerPax - b.adultColPerPax);
      })
    : [];

  const cotLibreByDestino = (() => {
    const m = new Map<number, CotLibreLeg[]>();
    cotLibreBreakdowns.forEach((leg) => {
      if (!m.has(leg.destino.id)) m.set(leg.destino.id, []);
      m.get(leg.destino.id)!.push(leg);
    });
    return m;
  })();
  // Misma regla que catálogo: si ≥2 destinos tienen ≥2 hoteles marcados, las combinaciones
  // (cartesiano) explotan → se muestra la lista agrupada por destino en vez de combinaciones.
  const cotLibreMultiHotelDestinos = [...cotLibreByDestino.values()].filter((hs) => hs.length >= 2).length;
  const cotLibreUseGrouped = cotLibreByDestino.size > 1 && cotLibreMultiHotelDestinos >= 2;

  const cotBoletoAdultoPerPaxLibre = cotMode === "libre" && cotFlightActive ? cotFlightPrice : 0;
  const cotBoletoNinoPerPaxLibre   = cotMode === "libre" && cotFlightActive ? cotFlightPriceChild : 0;

  type CotLibreCombo = { legs: CotLibreLeg[]; totals: ComboTotals };
  const cotLibreCombos: CotLibreCombo[] = (() => {
    const groups = [...cotLibreByDestino.values()];
    if (groups.length === 0) return [];
    return cartesian(groups).map((legs) => {
      const comboLegs: ComboLeg[] = legs.map((l) => ({
        adultAccomTotal:    l.adultAccomTotal,
        adultServicesTotal: l.adultServicesTotal,
        childAccomTotal:    l.childAccomTotal,
        childServicesTotal: l.childServicesTotal,
      }));
      const totals = combineComboLegs(
        comboLegs, cotNumPersonas, cotNumNinos,
        cotBoletoAdultoPerPaxLibre, cotBoletoNinoPerPaxLibre, cotEffectiveMarkup,
      );
      return { legs, totals };
    })
      // Más económica primero (mismo criterio — precio adulto — que CotizacionDetailView).
      .sort((a, b) => a.totals.precioAdulto - b.totals.precioAdulto);
  })();
  // Combinación representativa = la más barata (define subtotal/total y los precios que
  // se guardan en el detalle — ver getSavePrice más abajo).
  const cotLibreRepCombo: CotLibreCombo | null = cotLibreCombos.length > 0
    ? cotLibreCombos.reduce((min, c) => (c.totals.total < min.totals.total ? c : min))
    : null;

  // Precio por persona para guardar el detalle (catálogo: derivado del breakdown; libre:
  // derivado de la combinación representativa — suma, por tipo de habitación, la tarifa del
  // hotel elegido en cada destino × noches; CHD usa el alojamiento de niños de la combinación).
  const getSavePrice = (tipoPax: string): number => {
    if (cotMode === "catalogo" && cotCatRep) {
      if (tipoPax === "CHD") return Math.round(cotCatRep.precioCHD * 100) / 100;
      if (tipoPax === cotReqTipoPax) return Math.round(cotCatRep.precioAdulto * 100) / 100;
      return 0;
    }
    if (cotMode === "libre") {
      if (tipoPax === "CHD") {
        if (cotNumNinos === 0 || cotNoches === 0 || !cotLibreRepCombo) return 0;
        return Math.round((cotLibreRepCombo.totals.childAccom / cotNumNinos / cotNoches) * 100) / 100;
      }
      if (!cotLibreRepCombo) return 0;
      const total = cotLibreRepCombo.legs.reduce((sum, leg) => {
        const rate = leg.hotel.tarifas.find((t) => t.tipoHabitacion === tipoPax)?.precioBase ?? 0;
        return sum + rate * leg.noches;
      }, 0);
      return Math.round(total * 100) / 100;
    }
    return getCotPrice(tipoPax);
  };

  // Costo de noches extra usando tarifas reales de TarifaHotel — solo modo catálogo.
  // (#3) Modo libre no tiene UI de noches extra (no se agrega nada extra); siempre 0.
  const cotExtraCost = (() => {
    if (cotMode !== "catalogo" || !cotSelectedPkg || cotExtraNights <= 0) return 0;
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
  })();

  // subtotal — catálogo: breakdown del hotel representativo (alojamiento×noches +
  // servicios prorrateados, niños incluidos); libre: combinación representativa
  // (cotLibreRepCombo) — un hotel por destino, sumado. Sin noches extra en libre (#3).
  const cotSubtotal = cotMode === "catalogo"
    ? (cotCatRep?.subtotal ?? 0)
    : (cotLibreRepCombo?.totals.subtotal ?? 0);

  const cotPaxResumen = Object.entries(cotHabs)
    .filter(([, qty]) => qty > 0)
    .map(([tipoPax, qty]) => `${qty} ${tipoPax}`)
    .join(" + ") || "—";

  // Total de pax en habitaciones + niños declarados en Paso 1 (ya no hay contador manual de
  // CHD en modo libre — ver #1).
  const cotTotalRoomPax = Object.entries(cotHabs)
    .filter(([tipoPax]) => tipoPax !== "CHD")
    .reduce((sum, [tipoPax, qty]) => sum + (COT_NUM_PAX[tipoPax] ?? 1) * qty, 0) + cotNumNinos;

  // (#4) boletoTotal en libre: adultos × tarifa adulto + niños × tarifa niño, cuando el
  // boleto está activo (catálogo lo toma del breakdown, sin cambios).
  const cotBoletoTotal = cotMode === "catalogo"
    ? (cotCatRep?.boletoTotal ?? 0)
    : (cotFlightActive ? cotFlightPrice * cotNumPersonas + cotFlightPriceChild * cotNumNinos : 0);
  // total = subtotal + boleto + markup (markup invisible al cliente). Se toma directo del
  // combo representativo (ya multiplicado por persona vía combineComboLegs) en vez de sumar
  // `agencyMarkup` una sola vez — antes este cálculo NO multiplicaba la comisión por la
  // cantidad de pasajeros, subestimando el total guardado con 2+ pax y comisión > 0.
  const cotTotal = cotMode === "catalogo"
    ? (cotCatRepCombo?.totals.total ?? 0)
    : (cotLibreRepCombo?.totals.total ?? 0);

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
  // Fechas en formato día/mes/año (los inputs date entregan YYYY-MM-DD).
  const fmtFechaDMY = (iso: string) => {
    const [y, m, d] = (iso || "").split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };
  const cotFechasDisplay = cotFechaSalida
    ? `${fmtFechaDMY(cotFechaSalida)}${cotFechaRetorno ? ` → ${fmtFechaDMY(cotFechaRetorno)}` : ""}`
    : "Según disponibilidad";

  // Nombre del paquete y resumen de pasajeros (adultos + niños declarados en el Paso 1).
  const cotPaqueteNombre = cotMode === "catalogo"
    ? (cotSelectedPkg?.nombre ?? "—")
    : "Cotización libre";
  const cotPasajerosDisplay = (() => {
    const parts: string[] = [];
    if (cotNumPersonas > 0) parts.push(`${cotNumPersonas} Adulto${cotNumPersonas !== 1 ? "s" : ""}`);
    if (cotNumNinos > 0) parts.push(`${cotNumNinos} Niño${cotNumNinos !== 1 ? "s" : ""}`);
    const totalPax = cotNumPersonas + cotNumNinos;
    return parts.length > 0 ? `${parts.join(" + ")} (${totalPax} pax)` : "—";
  })();

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
    setStep(1); setQuoteLocked(false); setEditingCotId(null);
    setClientName(""); setClientEmail(""); setClientPhone(""); setClientId(""); setClientAddress("");
    setClientFoundMsg(null);
    setSelectedPkgId("1"); setExpandedCountry(null);
    setTravelDateFrom(""); setTravelDateTo("");
    setSelectedHotelIds([]);
    setNumPasajeros(0); setCantSGL(0); setCantDBL(1); setCantTPL(0); setCantQUAD(0); setCantCHD(0);
    setChildAges([]); setChildAirfare(0); setAdultAirfare(0); setExtraNights(0);
    // El asesor debe ingresar el markup manualmente en cada cotización — sin autocompletar.
    setAgencyMarkup(0);
    // Reset cotizador nuevo
    setCotMode("catalogo");
    setCotSelectedPkgId(null);
    setCotSelectedDestinoId(null);
    setCotSelectedHotelIds([]);
    setCotCustomDias(5);
    setCotFechaSalida("");
    setCotNumPersonas(2);
    setCotNumNinos(0);
    // DBL:1 refleja el default de 2 adultos / catálogo — si se deja en {} y el asesor
    // nunca toca el campo de adultos (sigue en 2), el efecto que deriva cotHabs desde
    // cotNumPersonas no se re-ejecuta (la dependencia no cambió) y la cotización se
    // guarda con 0 pax en las habitaciones.
    setCotHabs({ DBL: 1 });
    setCotFlightOverride(null);
    setCotFlightPrice(0);
    setCotFlightPriceChild(0);
    setCotLibreFlightDesc("");
    setCotExtraNightsByDestino({});
    setCotLibreNochesByDestino({});
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

  // Reabre una cotización BORRADOR propia en el wizard, poblando el estado crudo
  // guardado en `wizardState` (mismos campos que el auto-guardado de sessionStorage).
  // Cotizaciones guardadas antes de que existiera este campo (wizardState null) solo
  // recuperan los datos del cliente — el resto debe rearmarse manualmente.
  const handleEditCot = async (id: string) => {
    try {
      const res = await fetch(`/api/cotizaciones/${id}`);
      if (!res.ok) return;
      const cot = await res.json();
      if (cot.status !== "BORRADOR") return;

      resetForm();
      const ws = (cot.wizardState ?? {}) as Record<string, unknown>;
      const get = <T,>(key: string, fallback: T): T =>
        ws[key] !== undefined ? (ws[key] as T) : fallback;

      // Fallback derivado de los campos persistidos — cubre cotizaciones sin wizardState
      // (creadas antes de que este campo existiera, o por un flujo que aún no lo guardaba,
      // ej. cotización rápida antes de este fix).
      const pax = cot.pasajeros ?? {};
      // Cotización rápida (cliente genérico, ver GENERIC_CLIENT_EMAIL): siempre entra al
      // wizard con 0 niños, sin importar lo que traiga guardado — la cotización rápida no
      // pregunta por niños, así que ese dato nunca fue una decisión real de la agencia.
      // Es la agencia quien decide si van niños y cuántos al convertirla en una cotización real.
      const isQuickQuoteEdit = cot.cliente?.email === GENERIC_CLIENT_EMAIL;
      const REV_TIPO: [string, number][] = [["cantSGL", 1], ["cantDBL", 2], ["cantTPL", 3], ["cantQUAD", 4]];
      const fallbackNumPersonas = REV_TIPO.find(([key]) => (pax[key] ?? 0) > 0)?.[1] ?? 2;
      const fallbackHotelIds: number[] = Array.isArray(cot.hotelsComparison)
        ? [...new Set((cot.hotelsComparison as HotelCompSnapshot[]).map((h) => h.hotelId))]
        : [];

      const finalCotMode  = get<"catalogo" | "libre">("cotMode", cot.paqueteId ? "catalogo" : "libre");
      const finalHotelIds = get<number[]>("cotSelectedHotelIds", fallbackHotelIds);
      // See restoreDraft: avoid the default-hotel effect clobbering the restored selection.
      if (finalCotMode === "catalogo" && finalHotelIds.length > 0) skipHotelDefaultRef.current = true;

      setClientName(get("clientName", cot.cliente?.nombre ?? ""));
      setClientEmail(get("clientEmail", cot.cliente?.email ?? ""));
      setClientPhone(get("clientPhone", cot.cliente?.telefono ?? ""));
      setClientId(get("clientId", cot.cliente?.documento ?? ""));
      setClientAddress(get("clientAddress", cot.cliente?.direccion ?? ""));
      setCotMode(finalCotMode);
      setCotSelectedPkgId(get("cotSelectedPkgId", cot.paqueteId ?? null));
      setCotSelectedDestinoId(get("cotSelectedDestinoId", null));
      setCotSelectedHotelIds(finalHotelIds);
      setCotHabs(get("cotHabs", {}));
      setCotFechaSalida(get("cotFechaSalida", cot.fechaViaje ?? ""));
      setCotCustomDias(get("cotCustomDias", 5));
      setCotExtraNightsByDestino(get("cotExtraNightsByDestino", {}));
      setCotLibreNochesByDestino(get("cotLibreNochesByDestino", {}));
      setCotFlightOverride(get("cotFlightOverride", null));
      setCotFlightPrice(get("cotFlightPrice", cot.precios?.precioBoleto ?? 0));
      setCotFlightPriceChild(get("cotFlightPriceChild", 0));
      setCotLibreFlightDesc(get("cotLibreFlightDesc", ""));
      setCotLibreActSel(get("cotLibreActSel", {}));
      setCotLibreTrsSel(get("cotLibreTrsSel", {}));
      setCotNumPersonas(get("cotNumPersonas", fallbackNumPersonas));
      setCotNumNinos(isQuickQuoteEdit ? 0 : get("cotNumNinos", pax.cantCHD ?? 0));
      setCotNinosEdades(isQuickQuoteEdit ? [] : get("cotNinosEdades", Array(pax.cantCHD ?? 0).fill(5)));
      setCotFromQuickQuote(get("cotFromQuickQuote", true));

      setEditingCotId(id);
      setQuoteLocked(false);
      setStep(1);
      setActiveTab("cotizar");
    } catch {}
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
    let paqueteIncluyeDestinos: IncluyeDestinoGroup[] = [];
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
      paqueteIncluyeDestinos = groupIncluyeByDestino(
        cotSelectedPkg.actividades.map((a) => ({ id: a.id, destinoId: a.destinoId, destinoCiudad: a.destinoCiudad, label: a.nombre })),
        cotSelectedPkg.traslados.map((t) => ({ id: t.id, destinoId: t.destinoId, destinoCiudad: t.destinoCiudad, label: t.tipo })),
      );
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
      if (incluyeBoleto && cotLibreFlightDesc.trim()) {
        paqueteIncluye.push(`Boleto aéreo: ${cotLibreFlightDesc.trim()}`);
      }
      paqueteIncluyeDestinos = groupIncluyeByDestino(
        cotAllDestinos.flatMap((d) => d.actividades
          .filter((a) => cotLibreActSel[a.id])
          .map((a) => ({ id: a.id, destinoId: d.id, destinoCiudad: d.ciudad, label: a.nombre }))),
        cotAllDestinos.flatMap((d) => d.traslados
          .filter((t) => cotLibreTrsSel[t.id])
          .map((t) => ({ id: t.id, destinoId: d.id, destinoCiudad: d.ciudad, label: t.tipo }))),
      );
    }

    const now    = new Date();
    const fecha  = now.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Guayaquil" });
    const cliId  = `cli-${Date.now()}`;
    const codigo = `COT-${now.getFullYear()}-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const sessionAgenciaId = (sessionData?.user as any)?.agenciaId ?? "unknown";
    const sessionUserId    = (sessionData?.user as any)?.id ?? "unknown";
    const isEditing = editingCotId !== null;

    const notasParts: string[] = [];
    const notasStr = notasParts.length > 0 ? notasParts.join(" | ") : undefined;

    const r2 = (n: number) => Math.round(n * 100) / 100;
    // agencyMarkup es POR PERSONA (ver combineComboLegs en cotizar-price.ts) — se multiplica
    // por el total de pax, no se divide.
    const cotLibreTotalPax = cotNumPersonas + cotNumNinos;
    const cotLibreSharedTotal = cotBoletoTotal + cotEffectiveMarkup * cotLibreTotalPax;
    // Composición de habitaciones (sin CHD) — igual en todos los hoteles/legs de esta
    // cotización, solo la TARIFA por tipo varía según el hotel elegido.
    const cotCatRoomEntries: [string, number][] =
      Object.entries(cotHabs).filter(([t, q]) => t !== "CHD" && q > 0) as [string, number][];
    const hotelsComparison: HotelCompSnapshot[] = dedupeDestinoLabels(
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
              roomRates:        buildRoomRates(hotel.tarifas, cotCatRoomEntries, cotHotelNoches(hotel)),
              adultColPerPax:   r2(bd.adultColPerPax),
              boletoPerPax:     r2(bd.boletoPerPax),
              // Combinable per-destino total (accom + this destino's local services).
              // combineHotels() sums this across stops + sharedTotal (boleto+markup) once.
              accomTotal:       r2(bd.stopTotal),
              sharedTotal:      r2(bd.sharedTotal),
              // v4 — explicit adult/child split (per destino) + child air fare (global).
              adultAccomTotal:    r2(bd.adultAccomTotal),
              adultServicesTotal: r2(bd.adultServicesTotal),
              childAccomTotal:    r2(bd.childAccomTotal),
              childServicesTotal: r2(bd.childServicesTotal),
              boletoChildPerPax:  r2(bd.boletoChildPerPax),
              boletoPrecioOculto: !cotBoletoVisible,
              pricePerPax:      r2(bd.pricePerPax),
              avgChildPerPax:   bd.childSupplementPerAdult > 0 ? r2(bd.childSupplementPerAdult) : null,
              total:            r2(bd.total),
            };
          })
        : cotMode === "libre" && cotLibreBreakdowns.length > 0
        ? cotLibreBreakdowns.map((b) => {
            const stopTotal = b.adultAccomTotal + b.adultServicesTotal + b.childAccomTotal + b.childServicesTotal;
            const childSupplementPerAdult = cotNumPersonas > 0
              ? (b.childAccomTotal + b.childServicesTotal) / cotNumPersonas
              : 0;
            const pricePerPax = b.adultColPerPax + childSupplementPerAdult + cotBoletoAdultoPerPaxLibre + cotEffectiveMarkup;
            return {
              hotelId:          b.hotel.id,
              nombre:           b.hotel.nombre,
              estrellas:        b.hotel.estrellas,
              destinoId:        b.destino.id,
              destinoCiudad:    b.destino.ciudad,
              destinoPais:      b.destino.pais,
              tipoPax:          cotLibreAdultRefTipo ?? undefined,
              roomRates:        buildRoomRates(b.hotel.tarifas, cotLibreRoomEntries, b.noches),
              adultColPerPax:   r2(b.adultColPerPax),
              boletoPerPax:     r2(cotBoletoAdultoPerPaxLibre),
              accomTotal:       r2(stopTotal),
              sharedTotal:      r2(cotLibreSharedTotal),
              adultAccomTotal:    r2(b.adultAccomTotal),
              adultServicesTotal: r2(b.adultServicesTotal),
              childAccomTotal:    r2(b.childAccomTotal),
              childServicesTotal: r2(b.childServicesTotal),
              boletoChildPerPax:  r2(cotBoletoNinoPerPaxLibre),
              boletoPrecioOculto: !cotBoletoVisible,
              pricePerPax:      r2(pricePerPax),
              avgChildPerPax:   childSupplementPerAdult > 0 ? r2(childSupplementPerAdult) : null,
              total:            r2(stopTotal + cotLibreSharedTotal),
            };
          })
        : []
    );

    // Estado crudo del wizard — persistido para poder reabrir esta cotización en edición.
    // Los datos de cliente (nombre/email/teléfono/etc.) NO se guardan aquí — ya viven
    // normalizados en `Cliente` (FK `clienteId`); `handleEditCot` los reconstruye desde
    // `cot.cliente` al reabrir, así nunca quedan desactualizados frente al registro real.
    const wizardState = {
      cotMode, cotSelectedPkgId, cotSelectedDestinoId, cotSelectedHotelIds,
      cotHabs, cotFechaSalida, cotCustomDias, cotExtraNightsByDestino, cotLibreNochesByDestino,
      cotFlightOverride, cotFlightPrice, cotFlightPriceChild, cotLibreFlightDesc,
      cotLibreActSel, cotLibreTrsSel, cotNumPersonas, cotNumNinos, cotNinosEdades,
      cotFromQuickQuote,
    };

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
      paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, paqueteIncluyeDestinos, incluyeBoleto,
      pasajeros: {
        cantSGL:  cotHabs.SGL  ?? 0, cantDBL:  cotHabs.DBL  ?? 0, cantTPL:  cotHabs.TPL  ?? 0,
        cantQUAD: cotHabs.QUAD ?? 0, cantCHD:  cotNumNinos,
      },
      precios: {
        precioSGL:    getSavePrice("SGL"), precioDBL:  getSavePrice("DBL"),
        precioTPL:    getSavePrice("TPL"), precioQUAD: getSavePrice("QUAD"), precioCHD: getSavePrice("CHD"),
        precioBoleto: cotFlightActive && cotFlightPrice > 0 ? cotFlightPrice : undefined,
      },
      subtotal:      r2(cotSubtotal),
      markup:        r2(cotEffectiveMarkup),
      total:         r2(cotTotal),
      fechaViaje:    cotFechaSalida  || undefined,
      fechaRetorno:  cotFechaRetorno || undefined,
      status:        "BORRADOR",
      notas:         notasStr,
      fechaCreacion: fecha,
      hotelsComparison: hotelsComparison.length > 0 ? hotelsComparison : undefined,
      selectedHotelId:  null,
    };

    if (isEditing && editingCotId) {
      setCotizaciones((prev) => prev.map((c) => c.id === editingCotId ? {
        ...c,
        paqueteId: newCot.paqueteId, paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, paqueteIncluyeDestinos, incluyeBoleto,
        pasajeros: newCot.pasajeros, precios: newCot.precios,
        subtotal: newCot.subtotal, markup: newCot.markup, total: newCot.total,
        fechaViaje: newCot.fechaViaje, fechaRetorno: newCot.fechaRetorno,
        hotelsComparison: newCot.hotelsComparison,
        cliente: c.cliente ? {
          ...c.cliente,
          nombre:    clientName  || "Sin nombre",
          email:     clientEmail || undefined,
          telefono:  clientPhone || undefined,
          documento: clientId    || undefined,
          direccion: clientAddress || undefined,
        } : c.cliente,
      } : c));
    } else {
      setCotizaciones((prev) => [newCot, ...prev]);
    }
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

      const cotRes = await fetch(
        isEditing ? `/api/cotizaciones/${editingCotId}` : "/api/cotizaciones",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId: clientData.id, paqueteId,
            paqueteNombre, paqueteDuracion, paqueteDestino, paqueteIncluye, paqueteIncluyeDestinos, incluyeBoleto,
            cantSGL:  cotHabs.SGL  ?? 0, cantDBL:  cotHabs.DBL  ?? 0, cantTPL:  cotHabs.TPL  ?? 0,
            cantQUAD: cotHabs.QUAD ?? 0, cantCHD:  cotNumNinos,
            precioSGL:  getSavePrice("SGL"),  precioDBL:  getSavePrice("DBL"),
            precioTPL:  getSavePrice("TPL"),  precioQUAD: getSavePrice("QUAD"), precioCHD: getSavePrice("CHD"),
            subtotal: r2(cotSubtotal), markup: r2(cotEffectiveMarkup), total: r2(cotTotal),
            precioBoleto: cotFlightActive && cotFlightPrice > 0 ? r2(cotFlightPrice) : null,
            fechaViaje:   cotFechaSalida   || null,
            fechaRetorno: cotFechaRetorno  || null,
            notas: notasStr,
            hotelsComparison: hotelsComparison.length > 0 ? hotelsComparison : undefined,
            wizardState,
          }),
        }
      );
      if (cotRes.ok) {
        const saved = await cotRes.json();
        // Se actualiza siempre — así, si el asesor desbloquea y vuelve a guardar en
        // la misma sesión (aunque haya sido una creación nueva), la próxima vez PUT
        // actualiza esta misma fila en vez de duplicarla.
        setEditingCotId(saved.id);
        setCotizaciones((prev) =>
          prev.map((c) => c.id === (isEditing ? editingCotId : newCot.id) ? { ...c, ...saved } : c)
        );
        if (!isEditing) {
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
      }
    } catch {}
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
            <div className="relative w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border border-white/10 shrink-0 shadow-inner overflow-hidden">
              {agencyLogo
                ? <Image src={agencyLogo} alt={agencyName || "Logo de la agencia"} fill className="object-cover" unoptimized />
                : (sessionReady ? userName.split(" ").map((n) => n[0]).join("") : "")
              }
            </div>
            <div className="min-w-0 space-y-1">
              {sessionReady ? (
                <>
                  <h4 className="text-xs font-black text-white truncate leading-tight">{userName}</h4>
                  <p className="text-[9px] font-bold text-secondary">{userRoleDisplay}</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-3 w-24 bg-white/10" />
                  <Skeleton className="h-2.5 w-16 bg-white/10" />
                </>
              )}
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
              <Building2 size={12} className="text-secondary shrink-0" />
              {sessionReady ? agenciaDisplay : <Skeleton className="h-2.5 w-20" />}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">

          {/* ════════════════════════ DASHBOARD ════════════════════════ */}
          {activeTab === "dashboard" && (
            <DashboardTab
              onGoToCotizaciones={() => setActiveTab("cotizaciones")}
              onViewCot={(cot) => window.open(`/dashboard/cotizaciones/${cot.id}`, "_blank")}
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

              {editingCotId && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3">
                  <Pencil size={16} className="text-sky-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-sky-700">
                      Editando cotización {cotizaciones.find((c) => c.id === editingCotId)?.codigo ?? ""}
                    </p>
                    <p className="text-[10px] font-bold text-sky-600 mt-0.5">Los cambios reemplazarán la cotización guardada al confirmar.</p>
                  </div>
                </div>
              )}

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
                          {sessionReady ? (
                            <div className="flex items-center gap-2.5 px-4 py-3 bg-secondary/8 border border-secondary/20 rounded-2xl">
                              <Building2 size={13} className="text-secondary shrink-0" />
                              <span className="text-xs font-black text-secondary truncate">{agenciaDisplay}</span>
                            </div>
                          ) : (
                            <Skeleton className="h-[46px] w-full rounded-2xl" />
                          )}
                        </div>

                        {/* Agent name disabled */}
                        <div className="space-y-1.5">
                          <label className={labelCls}>Ejecutivo de Cuenta</label>
                          {sessionReady ? (
                            <input type="text" disabled value={userName} className={inputDisabledCls} />
                          ) : (
                            <Skeleton className="h-[46px] w-full rounded-2xl" />
                          )}
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
                              value={cotNumPersonas === 0 ? "" : cotNumPersonas}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") { setCotNumPersonas(0); return; }
                                const val = parseInt(raw, 10);
                                if (isNaN(val) || val < 0) return;
                                setCotNumPersonas(Math.min(50, val));
                              }}
                              placeholder="Ej. 2"
                              className={inputCls}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="cot-ninos" className={labelCls}>Niños (2–11 años)</label>
                            <input
                              id="cot-ninos" type="number" min={0} max={10}
                              value={cotNumNinos === 0 ? "" : cotNumNinos}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") { setCotNumNinos(0); return; }
                                const val = parseInt(raw, 10);
                                if (isNaN(val) || val < 0) return;
                                setCotNumNinos(Math.min(10, val));
                              }}
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
                                  const addPackage = (country: string) => {
                                    if (!acc[country]) acc[country] = [];
                                    if (!acc[country].some(pkg => pkg.id === p.id)) {
                                      acc[country].push(p);
                                    }
                                  };
                                  if (p.destinos && p.destinos.length > 0) {
                                    p.destinos.forEach(d => addPackage(d.pais || "Otros"));
                                  } else {
                                    addPackage(p.destinoPais || "Otros");
                                  }
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
                                <p className="text-xs font-black text-amber-700">
                                  Sin versión configurada para {cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""}.
                                </p>
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
                              <input type="text" disabled value={cotFechaRetorno ? fmtFechaDMY(cotFechaRetorno) : "Calculada automáticamente"} className={inputDisabledCls} />
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

                          {/* Flight toggle — visibilidad controlada por visibleBoleto, edición por permitirModificarBoleto */}
                          {cotSelectedPkg && cotBoletoVisible && (
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
                                  <label className={labelCls}>
                                    {cotNumNinos > 0 ? "Precio boleto adulto por persona (USD)" : "Precio boleto por persona (USD)"}
                                  </label>
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
                                    Total boleto adultos: ${(cotFlightPrice * cotNumPersonas).toLocaleString()} ({cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""} × ${cotFlightPrice})
                                  </p>
                                </div>
                              )}

                              {/* Boleto de niño — tarifa separada */}
                              {cotFlightActive && cotNumNinos > 0 && (
                                cotSelectedPkg.permitirModificarBoleto ? (
                                  <div className="space-y-1.5">
                                    <label className={labelCls}>Precio boleto niño por persona (USD)</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xs font-black">$</span>
                                      <input
                                        type="number" min={0} step={1} value={cotFlightPriceChild}
                                        onChange={(e) => setCotFlightPriceChild(Math.max(0, Number(e.target.value)))}
                                        placeholder={String(cotSelectedPkg.precioBoletoNino ?? cotSelectedPkg.precioBoleto ?? 0)}
                                        className={`${inputCls} pl-8`}
                                      />
                                    </div>
                                    <p className="text-[10px] text-primary/40 font-bold">
                                      Total boleto niños: ${(cotFlightPriceChild * cotNumNinos).toLocaleString()} ({cotNumNinos} niño{cotNumNinos > 1 ? "s" : ""} × ${cotFlightPriceChild})
                                      {cotSelectedPkg.precioBoletoNino == null && (
                                        <span className="text-amber-500"> · el paquete no declara tarifa de niño; se usa la de adulto por defecto</span>
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-primary/50 font-bold">
                                    Boleto aéreo de niño incluido — ${(cotSelectedPkg.precioBoletoNino ?? cotSelectedPkg.precioBoleto ?? 0).toLocaleString()}/niño (precio fijo, no editable).
                                  </p>
                                )
                              )}

                              {cotFlightActive && !cotSelectedPkg.permitirModificarBoleto && (
                                <p className="text-[10px] text-primary/50 font-bold">
                                  Boleto aéreo incluido — ${(cotSelectedPkg.precioBoleto ?? 0).toLocaleString()}/persona (precio fijo, no editable).
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
                              <input
                                type="number" min={2} max={30}
                                value={cotCustomDias === 0 ? "" : cotCustomDias}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") { setCotCustomDias(0); return; }
                                  const val = parseInt(raw, 10);
                                  if (isNaN(val) || val < 0) return;
                                  setCotCustomDias(Math.min(30, val));
                                }}
                                onBlur={() => { if (cotCustomDias < 2) setCotCustomDias(2); }}
                                className={inputCls}
                              />
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
                              <input type="text" disabled value={cotFechaRetorno ? fmtFechaDMY(cotFechaRetorno) : "—"} className={inputDisabledCls} />
                            </div>
                          </div>

                          {/* (#4) Boleto Aéreo — cotización libre: opcional, config manual completa (sin paquete de referencia) */}
                          <div className="p-4 bg-light border border-lighter rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Plane size={13} className="text-secondary" />
                                <span className="text-xs font-black text-primary uppercase tracking-wider">Boleto Aéreo</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCotFlightOverride(!cotFlightActive)}
                                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${cotFlightActive ? "bg-secondary" : "bg-gray-200"}`}
                                aria-label="Toggle boleto aéreo"
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cotFlightActive ? "translate-x-5" : "translate-x-0"}`} />
                              </button>
                            </div>
                            {cotFlightActive && (
                              <>
                                <div className="space-y-1.5">
                                  <label className={labelCls}>Descripción del boleto (opcional)</label>
                                  <input
                                    type="text" value={cotLibreFlightDesc}
                                    onChange={(e) => setCotLibreFlightDesc(e.target.value.slice(0, 200))}
                                    placeholder="Ej: Vuelo redondo Quito–Cancún, 23kg equipaje"
                                    className={inputCls}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className={labelCls}>
                                    {cotNumNinos > 0 ? "Precio boleto adulto por persona (USD)" : "Precio boleto por persona (USD)"}
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xs font-black">$</span>
                                    <input
                                      type="number" min={0} step={1} value={cotFlightPrice}
                                      onChange={(e) => setCotFlightPrice(Math.max(0, Number(e.target.value)))}
                                      className={`${inputCls} pl-8`}
                                    />
                                  </div>
                                  <p className="text-[10px] text-primary/40 font-bold">
                                    Total boleto adultos: ${(cotFlightPrice * cotNumPersonas).toLocaleString()} ({cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""} × ${cotFlightPrice})
                                  </p>
                                </div>
                                {cotNumNinos > 0 && (
                                  <div className="space-y-1.5">
                                    <label className={labelCls}>Precio boleto niño por persona (USD)</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-xs font-black">$</span>
                                      <input
                                        type="number" min={0} step={1} value={cotFlightPriceChild}
                                        onChange={(e) => setCotFlightPriceChild(Math.max(0, Number(e.target.value)))}
                                        className={`${inputCls} pl-8`}
                                      />
                                    </div>
                                    <p className="text-[10px] text-primary/40 font-bold">
                                      Total boleto niños: ${(cotFlightPriceChild * cotNumNinos).toLocaleString()} ({cotNumNinos} niño{cotNumNinos > 1 ? "s" : ""} × ${cotFlightPriceChild})
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Hoteles, traslados y actividades — agrupados por destino en multidestino */}
                          {cotAllDestinos.length > 0 && (
                            <div className="space-y-4">
                              {cotAllDestinos.map((destino) => {
                                // (#4) Con niños, ocultar hoteles sin tarifa CHD válida.
                                // Orden: más económico primero (tarifa DBL/noche).
                                const hotelsPorDestino = destino.hoteles
                                  .filter(hotelAptoNinos)
                                  .slice()
                                  .sort((a, b) => hotelAccomSortPrice(a) - hotelAccomSortPrice(b));
                                return (
                                  <div key={destino.id} className={cotIsMultiDestino ? "p-4 bg-light border border-lighter rounded-2xl space-y-3" : "space-y-4"}>
                                    {/* Título de destino solo en multidestino */}
                                    {cotIsMultiDestino && (
                                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <MapPin size={10} /> {destino.ciudad}, {destino.pais}
                                      </p>
                                    )}

                                    {/* ── Noches en este destino (obligatorio en multidestino: el total global no
                                        alcanza para saber cuántas noches corresponden a cada parada) ── */}
                                    {cotIsMultiDestino && (
                                      <div className="space-y-1.5">
                                        <label className={labelCls}>Noches en {destino.ciudad} *</label>
                                        <input
                                          type="number" min={0} max={cotNoches}
                                          value={(cotLibreNochesByDestino[destino.id] ?? 0) === 0 ? "" : cotLibreNochesByDestino[destino.id]}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") {
                                              setCotLibreNochesByDestino((prev) => ({ ...prev, [destino.id]: 0 }));
                                              return;
                                            }
                                            const val = parseInt(raw, 10);
                                            if (isNaN(val) || val < 0) return;
                                            setCotLibreNochesByDestino((prev) => ({ ...prev, [destino.id]: Math.min(cotNoches, val) }));
                                          }}
                                          placeholder="0"
                                          className={inputCls}
                                        />
                                      </div>
                                    )}

                                    {/* ── Hoteles ── */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <label className={labelCls}>Hoteles en {destino.ciudad}</label>
                                        {cotSelectedHotelIds.length > 0 && !cotIsMultiDestino && (
                                          <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20">
                                            {cotSelectedHotelIds.length} seleccionado{cotSelectedHotelIds.length > 1 ? "s" : ""}
                                          </span>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        {hotelsPorDestino.map((hotel) => {
                                          const checked  = cotSelectedHotelIds.includes(hotel.id);
                                          const dblRate  = hotel.tarifas.find((t) => t.tipoHabitacion === "DBL")?.precioBase ?? 0;
                                          const sglRate  = hotel.tarifas.find((t) => t.tipoHabitacion === "SGL")?.precioBase ?? 0;
                                          return (
                                            <button
                                              key={hotel.id} type="button"
                                              onClick={() => toggleLibreHotel(hotel.id)}
                                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer ${checked ? "border-secondary bg-secondary/5 shadow-sm" : "border-gray-100 hover:border-secondary/40 hover:bg-light/60"}`}
                                            >
                                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                                                {checked && <Check size={11} className="text-primary stroke-[3]" />}
                                              </div>
                                              <div className="flex-grow min-w-0">
                                                <p className="text-xs font-black text-primary">{hotel.nombre}</p>
                                                <p className="text-[10px] text-primary/40 font-bold mt-0.5">{"★".repeat(hotel.estrellas)} · DBL ${dblRate}/noche · SGL ${sglRate}/noche</p>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                  {hotel.tarifas.map((t, i) => {
                                                    // Un hotel puede declarar VARIAS filas "CHD" (una por rango de
                                                    // edad de PoliticaNinos) — se distinguen por rangoNombre/edad.
                                                    const pol = t.tipoHabitacion === "CHD"
                                                      ? hotel.politicaNinos.find((p) => p.tarifaChdId === t.id)
                                                      : null;
                                                    const label = pol ? `CHD ${pol.rangoNombre} (${pol.edadMin}-${pol.edadMax})` : t.tipoHabitacion;
                                                    return (
                                                      <span key={`${hotel.id}-${t.tipoHabitacion}-${i}`} className="px-1.5 py-0.5 bg-white border border-gray-100 text-[8px] font-black text-primary/50 rounded">
                                                        {label} ${t.precioBase}/n
                                                      </span>
                                                    );
                                                  })}
                                                </div>
                                                {cotNumNinos > 0 && (
                                                  <ChildPolicyWarning
                                                    politicaNinos={hotel.politicaNinos}
                                                    childAges={cotNinosEdades}
                                                    className="mt-2"
                                                  />
                                                )}
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
                              {/* ── Validación: la suma de noches por destino debe cuadrar con el total global ── */}
                              {cotIsMultiDestino && (
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-[10px] font-bold ${cotLibreNochesMatch ? "bg-secondary/5 border-secondary/15 text-secondary" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                  {cotLibreNochesMatch ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
                                  Noches asignadas: {cotLibreNochesAsignadas} / {cotNoches} requeridas
                                  {!cotLibreNochesMatch && " — ajusta las noches por destino para que sumen el total de \"Cantidad de Días\"."}
                                </div>
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
                                : (!cotLibreDestinosOk
                                    ? (cotIsMultiDestino ? "Selecciona al menos dos destinos." : "Selecciona un destino.")
                                    : cotSelectedHotelIds.length === 0
                                      ? "Selecciona al menos un hotel."
                                      : !cotLibreNochesMatch
                                        ? `Las noches por destino deben sumar ${cotNoches} (llevas ${cotLibreNochesAsignadas}).`
                                        : "La fecha de salida es obligatoria.")}
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
                              Tarifas: {cotPrimaryHotel.nombre} · {cotPrimaryHotelNoches} noches
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {([
                              { tipoPax: "SGL",  label: "Sencilla (SGL)",   numPax: 1 },
                              { tipoPax: "DBL",  label: "Doble (DBL)",      numPax: 2 },
                              { tipoPax: "TPL",  label: "Triple (TPL)",     numPax: 3 },
                              { tipoPax: "QUAD", label: "Cuádruple (QUAD)", numPax: 4 },
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

                          {/* (#1) Alojamiento de niños — según la política de edad del hotel, no un contador manual. */}
                          {cotNumNinos > 0 && cotPrimaryHotel && (
                            <div className="p-4 bg-secondary/5 border border-secondary/15 rounded-2xl space-y-1.5">
                              <p className="text-[10px] font-black uppercase text-secondary/70 tracking-wider">
                                Alojamiento niños ({cotNumNinos})
                              </p>
                              <p className="text-[10px] text-primary/50 font-bold">
                                Calculado según la política de edad de {cotPrimaryHotel.nombre} — $
                                {cotLibreChildAccomTotal % 1 === 0 ? cotLibreChildAccomTotal.toLocaleString() : cotLibreChildAccomTotal.toFixed(2)}
                                {" "}en total ({cotPrimaryHotelNoches} noche{cotPrimaryHotelNoches !== 1 ? "s" : ""}).
                              </p>
                              <ChildPolicyWarning politicaNinos={cotPrimaryHotel.politicaNinos} childAges={cotNinosEdades} className="mt-1" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Modo catálogo: itinerario agrupado por destino (hoteles, actividades, traslados) ── */}
                      {cotMode === "catalogo" && cotSelectedPkg && cotSelectedPkg.destinos.length > 0 && (() => {
                        const requiredTipoPax = numPaxToTipoPax(cotNumPersonas) ?? "DBL";
                        // (#4) Con niños, ocultar hoteles sin tarifa CHD válida (verificado en vivo contra BD).
                        const elegibles = cotSelectedPkg.hoteles.filter(hotelAptoNinos);
                        const excluidos = cotSelectedPkg.hoteles.length - elegibles.length;
                        const occupancyLabel = `${requiredTipoPax} · ${cotNumPersonas} ADT${cotNumNinos > 0 ? ` + ${cotNumNinos} CHD` : ""}`;
                        const paxLabel = `${cotNumPersonas} Adulto${cotNumPersonas !== 1 ? "s" : ""}${cotNumNinos > 0 ? ` + ${cotNumNinos} Niño${cotNumNinos !== 1 ? "s" : ""}` : ""}`;
                        // Selección manual (checkbox): el asesor puede marcar varios hoteles en UN
                        // destino; los demás quedan limitados a uno solo (toggleCatHotel, ver arriba).
                        const toggleHotel = toggleCatHotel;
                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin size={10} /> Itinerario por destino
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
                            <div className={`grid grid-cols-1 ${cotSelectedPkg.destinos.length > 1 ? "lg:grid-cols-2" : ""} gap-6 items-start`}>
                              {cotSelectedPkg.destinos.map((destino) => {
                                // Orden: más económico primero (tarifa de la ocupación requerida/noche).
                                const hotelesDestino = elegibles
                                  .filter((h) => h.destinoId === destino.id)
                                  .sort((a, b) => hotelAccomSortPrice(a, requiredTipoPax) - hotelAccomSortPrice(b, requiredTipoPax));
                                const actividadesDestino = cotSelectedPkg.actividades.filter(
                                  (act) => act.destinoId === destino.id
                                );
                                const trasladosDestino = cotSelectedPkg.traslados.filter(
                                  (trs) => trs.destinoId === destino.id
                                );
                                const hasSelection = hotelesDestino.some((h) => cotSelectedHotelIds.includes(h.id));
                                return (
                                  <div key={destino.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2">
                                      <MapPin size={14} className="text-secondary" />
                                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                                        {destino.ciudad}, {destino.pais}
                                      </h4>
                                    </div>

                                    {/* ── Hoteles disponibles (carril horizontal, sin precios) ── */}
                                    {hotelesDestino.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-1.5">
                                          <Building2 size={10} /> Hoteles disponibles
                                        </p>
                                        <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                                          {hotelesDestino.map((hotel) => {
                                            const isChecked = cotSelectedHotelIds.includes(hotel.id);
                                            return (
                                              <div
                                                key={hotel.id}
                                                role="checkbox"
                                                aria-checked={isChecked}
                                                tabIndex={0}
                                                onClick={() => toggleHotel(hotel.id)}
                                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleHotel(hotel.id); } }}
                                                className={`relative flex-shrink-0 w-56 p-4 bg-white border rounded-2xl transition-all cursor-pointer select-none ${isChecked ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-secondary/35"}`}
                                              >
                                                <div className="flex items-start justify-between gap-2">
                                                  <div className="min-w-0">
                                                    <span className="text-xs font-black text-primary block truncate">{hotel.nombre}</span>
                                                    <span className="text-amber-400 text-[10px] block mt-0.5">{"★".repeat(hotel.estrellas)}</span>
                                                  </div>
                                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                                                    {isChecked && <Check size={11} className="text-primary stroke-[3]" />}
                                                  </div>
                                                </div>
                                                <div className="mt-3 text-[10px] font-bold text-primary/50 uppercase tracking-wide">
                                                  {occupancyLabel}
                                                </div>
                                                {cotNumNinos > 0 && (
                                                  <ChildPolicyWarning
                                                    politicaNinos={hotel.politicaNinos}
                                                    childAges={cotNinosEdades}
                                                    className="mt-3"
                                                  />
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {!hasSelection && (
                                          <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5">
                                            <AlertCircle size={11} /> Selecciona un hotel en {destino.ciudad} para continuar.
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* ── Actividades incluidas (carril horizontal, sin precios) ── */}
                                    {actividadesDestino.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Actividades incluidas</p>
                                        <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                                          {actividadesDestino.map((act) => (
                                            <div key={act.id} className="flex-shrink-0 w-56 p-4 bg-light border border-lighter rounded-2xl">
                                              <span className="text-xs font-bold text-primary block truncate">{act.nombre}</span>
                                              {act.descripcion && <p className="text-[10px] text-primary/40 mt-1 line-clamp-2">{act.descripcion}</p>}
                                              <div className="mt-3 text-[10px] font-bold text-primary/50 uppercase tracking-wide">{paxLabel}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* ── Traslados incluidos (carril horizontal, sin precios) ── */}
                                    {trasladosDestino.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Traslados incluidos</p>
                                        <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                                          {trasladosDestino.map((trs) => (
                                            <div key={trs.id} className="flex-shrink-0 w-56 p-4 bg-light border border-lighter rounded-2xl">
                                              <span className="text-xs font-bold text-primary block truncate">{trs.tipo}</span>
                                              <div className="mt-3 text-[10px] font-bold text-primary/50 uppercase tracking-wide">{paxLabel}</div>
                                            </div>
                                          ))}
                                        </div>
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
                                // Rango de precio entre los hoteles SELECCIONADOS (checkbox) de este destino.
                                const destinationHotels = cotSelectedPkg!.hoteles
                                  .filter((h) => h.destinoId === d.id)
                                  .filter((h) => cotSelectedHotelIds.includes(h.id));
                                const rates = destinationHotels
                                  .map((h) => h.tarifas.find((t) => t.tipoHabitacion === requiredTipoPax)?.precioBase ?? 0)
                                  .filter((r) => r > 0);
                                const minRate = rates.length > 0 ? Math.min(...rates) : 0;
                                const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
                                const rateLabel = rates.length === 0
                                  ? "Sin tarifa/noche"
                                  : minRate === maxRate
                                    ? `$${fmtN(minRate)}/persona/noche (${requiredTipoPax})`
                                    : `Desde $${fmtN(minRate)} hasta $${fmtN(maxRate)}/persona/noche (${requiredTipoPax})`;
                                return (
                                  <div key={d.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${enabled ? "bg-light border-lighter" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-xs font-black text-primary block flex items-center gap-1.5">
                                        <MapPin size={10} className="text-secondary shrink-0" /> {d.ciudad}
                                      </span>
                                      <span className="text-[10px] font-bold text-secondary block">
                                        {rateLabel}
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

                      {/* ── Boleto aéreo (catálogo) ── */}
                      {cotMode === "catalogo" && cotFlightActive && cotBoletoVisible && cotFlightPrice > 0 && (
                        <div className="flex items-center justify-between p-3 bg-secondary/5 border border-secondary/15 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-primary block">Boleto aéreo</span>
                            {cotSelectedPkg?.descripcionBoleto && (
                              <p className="text-[10px] text-primary/40 mt-0.5">{cotSelectedPkg.descripcionBoleto}</p>
                            )}
                          </div>
                          <span className="font-black text-secondary text-xs shrink-0 ml-3">
                            ${cotFlightPrice.toLocaleString()}/pax
                          </span>
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
                                      {[...destino.traslados]
                                        .sort((a, b) => getTrasladoPerPax(a.tarifas, cotNumPersonas) - getTrasladoPerPax(b.tarifas, cotNumPersonas))
                                        .map((trs) => {
                                        const checked = !!cotLibreTrsSel[trs.id];
                                        // Precio real de adulto para el grupo declarado — NO el mínimo entre
                                        // todas las tarifas (eso mezclaba la tarifa NINO, más barata, aunque
                                        // no haya niños en la cotización y nunca se vaya a cobrar ese precio).
                                        const adultPrice = getTrasladoPerPax(trs.tarifas, cotNumPersonas);
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
                                              {adultPrice > 0 && <p className="text-[10px] text-secondary font-bold mt-0.5">${adultPrice}/persona ({cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""})</p>}
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
                                      {[...destino.actividades]
                                        .sort((a, b) => getActividadAdultPerPax(a.tarifas, cotNumPersonas) - getActividadAdultPerPax(b.tarifas, cotNumPersonas))
                                        .map((act) => {
                                        const checked = !!cotLibreActSel[act.id];
                                        // Precio real de adulto para el grupo declarado — ver mismo fix en traslados arriba.
                                        const adultPrice = getActividadAdultPerPax(act.tarifas, cotNumPersonas);
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
                                              {adultPrice > 0 && <p className="text-[10px] text-secondary font-bold mt-0.5">${adultPrice}/persona ({cotNumPersonas} adulto{cotNumPersonas !== 1 ? "s" : ""})</p>}
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
                        <label htmlFor="agency-markup" className={`${labelCls} flex items-center gap-1.5`}><DollarSign size={10} /> Comisión / Markup de la Agencia (USD por persona)</label>
                        <input
                          id="agency-markup" type="number" min={cotMarkupFloor}
                          value={agencyMarkup === 0 ? "" : agencyMarkup}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") { setAgencyMarkup(0); return; }
                            const val = Number(raw);
                            if (isNaN(val) || val < 0) return;
                            setAgencyMarkup(val);
                          }}
                          onBlur={(e) => { if ((Number(e.target.value) || 0) < cotMarkupFloor) setAgencyMarkup(cotMarkupFloor); }}
                          placeholder="Ej. 50" className={inputCls}
                        />
                        <p className="text-[10px] text-primary/40 font-bold">
                          {cotMarkupFloor > 0
                            ? `Este paquete tiene un ajuste mínimo de $${cotMarkupFloor.toLocaleString()}/persona definido por Land Tour Travel — puedes aumentarlo, no reducirlo. Se suma a cada pasajero (adultos y niños) y no es visible para el cliente.`
                            : "Este valor se suma a cada pasajero (adultos y niños) y no es visible para el cliente."}
                        </p>
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
                              {(!cotCatAllDestinosSelected || !cotLibreAllDestinosSelected)
                                ? "Selecciona un hotel para cada destino."
                                : "Agrega al menos una habitación para continuar."}
                            </p>
                          )}
                          <button
                            onClick={() => { if (step3CanProceed) setStep(4); }}
                            disabled={!step3CanProceed || quoteLocked}
                            className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            Revisar Cotización <ChevronRight size={14} />
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
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Revisión Final de Cotización
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Paso 4 de 4</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-4 bg-light border border-lighter rounded-2xl text-xs">
                        {[
                          ["Paquete",    cotPaqueteNombre],
                          ["Cliente",    clientName  || "—"],
                          ["Email",      clientEmail || "—"],
                          ["Teléfono",   clientPhone || "—"],
                          ["Modo",       cotMode === "catalogo" ? "Catálogo" : "Cotización Libre"],
                          ["Destino",    `${cotDestinoCiudad}${cotDestinoPais ? `, ${cotDestinoPais}` : ""}`],
                          ["Duración",   cotDuracion],
                          ["Fechas",     cotFechasDisplay],
                          ["Pasajeros",  cotPasajerosDisplay],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className={lbl === "Paquete" ? "col-span-2" : undefined}>
                            <span className="text-[9px] font-black uppercase text-primary/30 tracking-wider block">{lbl}</span>
                            <span className="font-bold text-primary/80 truncate block">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* ── Agrupado por destino (≥2 destinos con varios hoteles): sin combinaciones ── */}
                      {cotMode === "catalogo" && cotCatUseGrouped && (() => {
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        const numDestinos = cotCatByDestino.size;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider">
                                Hoteles por destino
                                <span className="ml-1 text-primary/25">({cotSelectedHotelIds.length})</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                              {[...cotCatByDestino.values()].map((rows) => {
                                const ciudad = rows[0]?.hotel.destinoCiudad ?? "";
                                return (
                                  <div key={rows[0]?.hotel.destinoId} className="space-y-3 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/40">
                                      {ciudad}
                                      <span className="ml-1 text-primary/25">· {rows.length} hotel{rows.length !== 1 ? "es" : ""}</span>
                                    </p>
                                    <div className="space-y-2.5">
                                      {rows.map(({ hotel, bd }) => {
                                        const p = hotelPerDestinoPrice({
                                          adultColPerPax:     bd.adultColPerPax,
                                          childAccomTotal:    bd.childAccomTotal,
                                          childServicesTotal: bd.childServicesTotal,
                                          boletoAdultoPerPax: bd.boletoPerPax,
                                          boletoNinoPerPax:   bd.boletoChildPerPax,
                                          agencyMarkup: cotEffectiveMarkup,
                                          numAdultos: cotNumPersonas,
                                          numNinos:   cotNumNinos,
                                          numDestinos,
                                        });
                                        return (
                                          <div key={hotel.id} className="rounded-2xl bg-light/60 border border-secondary/15 overflow-hidden">
                                            <div className="flex items-start justify-between gap-2 px-3 pt-2.5">
                                              <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-primary leading-snug truncate">{hotel.nombre}</p>
                                                <p className="text-amber-400 text-[8px] font-bold">{"★".repeat(Math.min(hotel.estrellas, 5))}</p>
                                              </div>
                                              <span className="text-[9px] font-bold text-primary/40 shrink-0 mt-0.5">
                                                {bd.noches} noche{bd.noches !== 1 ? "s" : ""}
                                              </span>
                                            </div>
                                            <div className="divide-y divide-gray-100 mt-2">
                                              <div className="flex items-center justify-between px-3 py-1.5">
                                                <span className="text-[10px] font-bold text-primary/60">Adulto</span>
                                                <span className="text-sm font-black text-primary">
                                                  ${fmtN(p.precioAdulto)}
                                                </span>
                                              </div>
                                              {cotNumNinos > 0 && (
                                                <div className="flex items-center justify-between px-3 py-1.5">
                                                  <span className="text-[10px] font-bold text-primary/60">Niño</span>
                                                  <span className="text-sm font-black text-primary">
                                                    ${fmtN(p.precioNino)}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <p className="text-[9px] text-primary/35 font-bold leading-relaxed">
                              Precio por persona por hotel (incluye alojamiento, actividades y traslados de ese destino
                              {cotFlightActive ? ", y la parte proporcional del boleto aéreo" : ""}
                              {agencyMarkup > 0 ? " y de la comisión de agencia" : ""}). El cliente elige un hotel por destino;
                              la combinación final se define al aprobar la cotización.
                            </p>
                          </div>
                        );
                      })()}

                      {/* ── Combinaciones de hoteles (cartesiano) con precio Adulto / Niño ── */}
                      {cotMode === "catalogo" && !cotCatUseGrouped && cotCatCombos.length > 0 && (() => {
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        const isMulti = cotCatByDestino.size > 1;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider">
                                {isMulti ? "Combinaciones de hoteles" : "Opciones de hotel"}
                                <span className="ml-1 text-primary/25">({cotCatCombos.length})</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                              {cotCatCombos.map((combo, idx) => {
                                const isCheapest = combo === cotCatRepCombo;
                                const t = combo.totals;
                                return (
                                  <div
                                    key={idx}
                                    className={`space-y-3 bg-white p-5 rounded-3xl border shadow-sm ${isCheapest && cotCatCombos.length > 1 ? "border-secondary/40 ring-1 ring-secondary/20" : "border-gray-100"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-primary/40">
                                        {isMulti ? `Combinación ${idx + 1}` : `Opción ${idx + 1}`}
                                      </p>
                                      {isCheapest && cotCatCombos.length > 1 && (
                                        <span className="text-[8px] font-black uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                                          Más económica
                                        </span>
                                      )}
                                    </div>

                                    {/* Un hotel por destino */}
                                    <div className="space-y-1.5">
                                      {combo.legs.map(({ hotel, bd }) => (
                                        <div key={hotel.id} className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            {isMulti && (
                                              <p className="text-[8px] font-black uppercase tracking-widest text-primary/35">
                                                {hotel.destinoCiudad}
                                              </p>
                                            )}
                                            <p className="text-[11px] font-bold text-primary leading-snug truncate">{hotel.nombre}</p>
                                            <p className="text-amber-400 text-[8px] font-bold">{"★".repeat(Math.min(hotel.estrellas, 5))}</p>
                                          </div>
                                          <span className="text-[9px] font-bold text-primary/40 shrink-0">
                                            {bd.noches} noche{bd.noches !== 1 ? "s" : ""}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Precios por persona — Adulto y Niño separados */}
                                    <div className="rounded-2xl bg-light/60 border border-secondary/15 divide-y divide-gray-100 overflow-hidden">
                                      <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-[10px] font-bold text-primary/60">Adulto</span>
                                        <span className="text-sm font-black text-primary">
                                          ${fmtN(t.precioAdulto)}
                                        </span>
                                      </div>
                                      {cotNumNinos > 0 && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                          <span className="text-[10px] font-bold text-primary/60">Niño</span>
                                          <span className="text-sm font-black text-primary">
                                            ${fmtN(t.precioNino)}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <p className="text-[8px] text-primary/30 font-bold leading-relaxed">
                                      Incluye alojamiento, actividades y traslados{cotFlightActive ? ", boleto aéreo" : ""}{agencyMarkup > 0 ? ", comisión de agencia" : ""}.
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            <p className="text-[9px] text-primary/35 font-bold leading-relaxed">
                              Precios por persona.{" "}
                              {cotNumNinos > 0 ? "El precio del niño se calcula por separado (alojamiento según política, actividades y traslado propios, y boleto de niño cuando aplica). " : ""}
                              {agencyMarkup > 0 ? `Incluye comisión de $${fmtN(agencyMarkup)} por persona, no visible para el cliente.` : ""}
                            </p>
                          </div>
                        );
                      })()}

                      {/* ── Modo libre — agrupado por destino (≥2 destinos con varios hoteles): sin combinaciones ── */}
                      {cotMode === "libre" && cotLibreUseGrouped && (() => {
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        const numDestinos = cotLibreByDestino.size;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider">
                                Hoteles por destino
                                <span className="ml-1 text-primary/25">({cotSelectedHotelIds.length})</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                              {[...cotLibreByDestino.values()].map((rows) => {
                                const ciudad = rows[0]?.destino.ciudad ?? "";
                                return (
                                  <div key={rows[0]?.destino.id} className="space-y-3 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/40">
                                      {ciudad}
                                      <span className="ml-1 text-primary/25">· {rows.length} hotel{rows.length !== 1 ? "es" : ""}</span>
                                    </p>
                                    <div className="space-y-2.5">
                                      {rows.map((leg) => {
                                        const p = hotelPerDestinoPrice({
                                          adultColPerPax:     leg.adultColPerPax,
                                          childAccomTotal:    leg.childAccomTotal,
                                          childServicesTotal: leg.childServicesTotal,
                                          boletoAdultoPerPax: cotBoletoAdultoPerPaxLibre,
                                          boletoNinoPerPax:   cotBoletoNinoPerPaxLibre,
                                          agencyMarkup: cotEffectiveMarkup,
                                          numAdultos: cotNumPersonas,
                                          numNinos:   cotNumNinos,
                                          numDestinos,
                                        });
                                        return (
                                          <div key={leg.hotel.id} className="rounded-2xl bg-light/60 border border-secondary/15 overflow-hidden">
                                            <div className="flex items-start justify-between gap-2 px-3 pt-2.5">
                                              <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-primary leading-snug truncate">{leg.hotel.nombre}</p>
                                                <p className="text-amber-400 text-[8px] font-bold">{"★".repeat(Math.min(leg.hotel.estrellas, 5))}</p>
                                              </div>
                                              <span className="text-[9px] font-bold text-primary/40 shrink-0 mt-0.5">
                                                {leg.noches} noche{leg.noches !== 1 ? "s" : ""}
                                              </span>
                                            </div>
                                            <div className="divide-y divide-gray-100 mt-2">
                                              <div className="flex items-center justify-between px-3 py-1.5">
                                                <span className="text-[10px] font-bold text-primary/60">Adulto</span>
                                                <span className="text-sm font-black text-primary">
                                                  ${fmtN(p.precioAdulto)}
                                                </span>
                                              </div>
                                              {cotNumNinos > 0 && (
                                                <div className="flex items-center justify-between px-3 py-1.5">
                                                  <span className="text-[10px] font-bold text-primary/60">Niño</span>
                                                  <span className="text-sm font-black text-primary">
                                                    ${fmtN(p.precioNino)}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <p className="text-[9px] text-primary/35 font-bold leading-relaxed">
                              Precio por persona por hotel (incluye alojamiento, actividades y traslados de ese destino
                              {cotFlightActive ? ", y la parte proporcional del boleto aéreo" : ""}
                              {agencyMarkup > 0 ? " y de la comisión de agencia" : ""}). El asesor elige un hotel por destino;
                              la combinación final se define al aprobar la cotización.
                            </p>
                          </div>
                        );
                      })()}

                      {/* ── Modo libre — combinaciones de hoteles (cartesiano) con precio Adulto / Niño ── */}
                      {cotMode === "libre" && !cotLibreUseGrouped && cotLibreCombos.length > 0 && (() => {
                        const fmtN = (n: number) => (n % 1 === 0 ? n.toLocaleString() : n.toFixed(2));
                        const isMulti = cotLibreByDestino.size > 1;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider">
                                {isMulti ? "Combinaciones de hoteles" : "Opciones de hotel"}
                                <span className="ml-1 text-primary/25">({cotLibreCombos.length})</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                              {cotLibreCombos.map((combo, idx) => {
                                const isCheapest = combo === cotLibreRepCombo;
                                const t = combo.totals;
                                return (
                                  <div
                                    key={idx}
                                    className={`space-y-3 bg-white p-5 rounded-3xl border shadow-sm ${isCheapest && cotLibreCombos.length > 1 ? "border-secondary/40 ring-1 ring-secondary/20" : "border-gray-100"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-primary/40">
                                        {isMulti ? `Combinación ${idx + 1}` : `Opción ${idx + 1}`}
                                      </p>
                                      {isCheapest && cotLibreCombos.length > 1 && (
                                        <span className="text-[8px] font-black uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                                          Más económica
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-1.5">
                                      {combo.legs.map((leg) => (
                                        <div key={leg.hotel.id} className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            {isMulti && (
                                              <p className="text-[8px] font-black uppercase tracking-widest text-primary/35">
                                                {leg.destino.ciudad}
                                              </p>
                                            )}
                                            <p className="text-[11px] font-bold text-primary leading-snug truncate">{leg.hotel.nombre}</p>
                                            <p className="text-amber-400 text-[8px] font-bold">{"★".repeat(Math.min(leg.hotel.estrellas, 5))}</p>
                                          </div>
                                          <span className="text-[9px] font-bold text-primary/40 shrink-0">
                                            {leg.noches} noche{leg.noches !== 1 ? "s" : ""}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="rounded-2xl bg-light/60 border border-secondary/15 divide-y divide-gray-100 overflow-hidden">
                                      <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-[10px] font-bold text-primary/60">Adulto</span>
                                        <span className="text-sm font-black text-primary">
                                          ${fmtN(t.precioAdulto)}
                                        </span>
                                      </div>
                                      {cotNumNinos > 0 && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                          <span className="text-[10px] font-bold text-primary/60">Niño</span>
                                          <span className="text-sm font-black text-primary">
                                            ${fmtN(t.precioNino)}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <p className="text-[8px] text-primary/30 font-bold leading-relaxed">
                                      Incluye alojamiento, actividades y traslados{cotFlightActive ? ", boleto aéreo" : ""}{agencyMarkup > 0 ? ", comisión de agencia" : ""}.
                                    </p>
                                  </div>
                                );
                              })}
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
                            <Star size={14} /> {editingCotId ? "Actualizar Cotización" : "Guardar Cotización"}
                          </button>
                        )}
                        {quoteLocked && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => { if (editingCotId) window.open(`/dashboard/cotizaciones/${editingCotId}`, "_blank"); }}
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
                                <p className="text-[10px] text-primary/50 font-bold">
                                  {editingCotId ? "Se actualizará la cotización con los cambios realizados." : "Se guardará la cotización y se notificará a las partes."}
                                </p>
                              </div>
                            </div>
                            <ul className="space-y-1.5 text-[10px] font-bold text-primary/60">
                              {editingCotId ? (
                                <>
                                  <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />Se reemplazarán los datos y habitaciones anteriores de esta cotización.</li>
                                  <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />El código y la fecha de creación se mantienen.</li>
                                </>
                              ) : (
                                <>
                                  <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-secondary shrink-0" />Se enviará un correo de confirmación a tu agencia.</li>
                                </>
                              )}
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
              onViewCot={(cot) => window.open(`/dashboard/cotizaciones/${cot.id}`, "_blank")}
              onEditCot={handleEditCot}
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
                      <span className="block text-[8px] font-bold text-primary/40 mt-0.5">{cotizaciones[0]?.codigo || "COT-2025-001"}</span>
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
                  {sessionReady ? userName.split(" ").map((n) => n[0]).join("") : ""}
                </div>
                {sessionReady ? (
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-primary truncate">{userName}</h3>
                    <p className="text-[11px] font-bold text-secondary mt-0.5">{userRoleDisplay}</p>
                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-[#F4FAF8] border border-[#EDF7F5] rounded-lg w-fit">
                      <Building2 size={10} className="text-secondary shrink-0" />
                      <span className="text-[10px] font-black text-primary truncate max-w-[160px]">{agenciaDisplay}</span>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-5 w-28 rounded-lg" />
                  </div>
                )}
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
