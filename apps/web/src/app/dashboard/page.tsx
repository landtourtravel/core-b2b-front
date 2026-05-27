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

// ─── Hotel comparison types ────────────────────────────────────────────────────
interface HotelRates {
  sgl: number; sglExtra: number;
  dbl: number; dblExtra: number;
  tpl: number; tplExtra: number;
  chd: number; chdExtra: number;
  quad: number; quadExtra: number;
}
interface HotelOption {
  id: string;
  name: string;
  quadEnabled: boolean;
  rates: HotelRates;
}
interface HotelComparison {
  hotel: HotelOption;
  subtotal: number;
  extraNightsCost: number;
  total: number;
}
type CotizacionExtended = Cotizacion & {
  hotelsComparison?: HotelComparison[];
  chosenHotelId?: string;
  extraNights?: number;
  adultAirfareInput?: number;
  childAirfareInput?: number;
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

// ─── Panama mock hotels ───────────────────────────────────────────────────────
const PANAMA_HOTELS: HotelOption[] = [
  {
    id: "h1", name: "Ramada Via Argentina / Exe Oriental", quadEnabled: false,
    rates: { sgl: 559, sglExtra: 79, dbl: 429, dblExtra: 37, tpl: 399, tplExtra: 33, chd: 349, chdExtra: 33, quad: 0, quadExtra: 0 },
  },
  {
    id: "h2", name: "Soloy", quadEnabled: false,
    rates: { sgl: 569, sglExtra: 82, dbl: 439, dblExtra: 40, tpl: 409, tplExtra: 39, chd: 349, chdExtra: 35, quad: 0, quadExtra: 0 },
  },
  {
    id: "h3", name: "The Executive / El Panama", quadEnabled: true,
    rates: { sgl: 589, sglExtra: 92, dbl: 449, dblExtra: 45, tpl: 419, tplExtra: 41, chd: 349, chdExtra: 35, quad: 419, quadExtra: 41 },
  },
  {
    id: "h4", name: "Holiday Inn Express", quadEnabled: false,
    rates: { sgl: 599, sglExtra: 98, dbl: 459, dblExtra: 49, tpl: 429, tplExtra: 45, chd: 349, chdExtra: 35, quad: 0, quadExtra: 0 },
  },
];
const HOTELS_BY_PACKAGE: Record<string, HotelOption[]> = {
  "1": PANAMA_HOTELS,
  default: PANAMA_HOTELS,
};

// ─── Fallback packages ────────────────────────────────────────────────────────
const FALLBACK_PACKAGES: Package[] = [
  {
    id: "1",
    title: "Panamá Ciudad + Playa Todo Incluido",
    description: "Vive la magia de Panamá con todo incluido.",
    price: 869,
    image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
    category: "Playa",
    duration: "5 días / 4 noches",
    nochesBase: 4,
    diasEstancia: 5,
    location: { country: "Panamá", city: "Ciudad de Panamá" },
    includes: ["Vuelo GYE-PTY-GYE vía COPA", "Traslados compartidos", "Hotel seleccionado", "Traslados aeropuerto"],
    notIncludes: [],
    prices: { sgl: 969, dbl: 869, tpl: 849, quad: 829, chd: 450 },
    flightIncluded: false,
  },
  {
    id: "2",
    title: "Cancún Todo Incluido Premium",
    description: "Paraíso en el Caribe mexicano.",
    price: 1250,
    image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
    category: "Playa",
    duration: "7 días / 6 noches",
    nochesBase: 6,
    diasEstancia: 7,
    location: { country: "México", city: "Cancún" },
    includes: ["Vuelo GYE-CUN-GYE", "Traslados aeropuerto", "6 noches resort 5★ Todo Incluido", "Bebidas ilimitadas"],
    notIncludes: [],
    prices: { sgl: 1450, dbl: 1250, tpl: 1190, quad: 1150, chd: 750 },
    flightIncluded: true,
  },
  {
    id: "3",
    title: "Cartagena de Indias Mágica",
    description: "Joyas del Caribe colombiano.",
    price: 990,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "Cultural",
    duration: "5 días / 4 noches",
    nochesBase: 4,
    diasEstancia: 5,
    location: { country: "Colombia", city: "Cartagena" },
    includes: ["Vuelo GYE-CTG-GYE", "Traslados aeropuerto", "Hotel colonial 4★"],
    notIncludes: [],
    prices: { sgl: 1100, dbl: 990, tpl: 950, quad: 0, chd: 500 },
    flightIncluded: false,
  },
];

// ─── Initial mock cotizaciones ─────────────────────────────────────────────────
const INITIAL_COTIZACIONES: CotizacionExtended[] = [
  {
    id: "cot-001", codigo: "COT-2024-001",
    agenciaId: "agencia-andina", creadoPorId: "user-ana", paqueteId: 1, clienteId: "cli-001",
    cliente: { id: "cli-001", agenciaId: "agencia-andina", nombre: "María González", email: "maria@email.com", telefono: "+593 912345678" },
    paqueteNombre: "Panamá Ciudad + Playa Todo Incluido", paqueteDuracion: "5 Días / 4 Noches",
    paqueteDestino: "Ciudad de Panamá, Panamá",
    paqueteIncluye: ["Vuelo GYE-PTY-GYE vía COPA", "Traslados compartidos", "Hotel seleccionado"],
    incluyeBoleto: true,
    pasajeros: { cantSGL: 0, cantDBL: 2, cantTPL: 0, cantQUAD: 0, cantCHD: 0 },
    precios: { precioSGL: 559, precioDBL: 429, precioTPL: 399, precioQUAD: 0, precioCHD: 0 },
    subtotal: 858, markup: 0, total: 858,
    fechaViaje: "09-13 May 2025", status: "ENVIADA", fechaCreacion: "28 Abr 2025",
  },
  {
    id: "cot-002", codigo: "COT-2024-002",
    agenciaId: "agencia-andina", creadoPorId: "user-ana", paqueteId: 1, clienteId: "cli-002",
    cliente: { id: "cli-002", agenciaId: "agencia-andina", nombre: "Carlos Ruiz", email: "carlos@email.com", telefono: "+593 998877665" },
    paqueteNombre: "Panamá Ciudad + Playa Todo Incluido", paqueteDuracion: "5 Días / 4 Noches",
    paqueteDestino: "Ciudad de Panamá, Panamá",
    paqueteIncluye: ["Vuelo GYE-PTY-GYE vía COPA", "Traslados compartidos", "Hotel seleccionado"],
    incluyeBoleto: true,
    pasajeros: { cantSGL: 0, cantDBL: 0, cantTPL: 3, cantQUAD: 0, cantCHD: 0 },
    precios: { precioSGL: 559, precioDBL: 429, precioTPL: 399, precioQUAD: 0, precioCHD: 0 },
    subtotal: 1197, markup: 0, total: 1197,
    fechaViaje: "15-19 Jun 2025", status: "APROBADA", fechaCreacion: "28 Abr 2025",
  },
  {
    id: "cot-003", codigo: "PRF-2024-001",
    agenciaId: "agencia-andina", creadoPorId: "user-ana", paqueteId: 1, clienteId: "cli-003",
    cliente: { id: "cli-003", agenciaId: "agencia-andina", nombre: "Laura Méndez" },
    paqueteNombre: "Panamá Ciudad + Playa Todo Incluido", paqueteDuracion: "5 Días / 4 Noches",
    paqueteDestino: "Ciudad de Panamá, Panamá",
    paqueteIncluye: ["Traslados compartidos", "Hotel seleccionado"],
    incluyeBoleto: false,
    pasajeros: { cantSGL: 0, cantDBL: 2, cantTPL: 3, cantQUAD: 0, cantCHD: 0 },
    precios: { precioSGL: 559, precioDBL: 429, precioTPL: 399, precioQUAD: 0, precioCHD: 0 },
    subtotal: 2055, markup: 150, total: 2205,
    fechaViaje: "20-24 May 2025", status: "BORRADOR", fechaCreacion: "28 Abr 2025",
    notas: "Proforma: Ramada Via Argentina / Exe Oriental, Soloy",
    hotelsComparison: [
      { hotel: PANAMA_HOTELS[0], subtotal: 858 + 1197, extraNightsCost: 0, total: 858 + 1197 + 150 },
      { hotel: PANAMA_HOTELS[1], subtotal: 878 + 1227, extraNightsCost: 0, total: 878 + 1227 + 150 },
    ],
    extraNights: 0, adultAirfareInput: 0, childAirfareInput: 0,
  },
  {
    id: "cot-004", codigo: "COT-2024-004",
    agenciaId: "agencia-andina", creadoPorId: "user-ana", paqueteId: 3, clienteId: "cli-004",
    cliente: { id: "cli-004", agenciaId: "agencia-andina", nombre: "Pedro Vargas" },
    paqueteNombre: "Cartagena de Indias Mágica", paqueteDuracion: "5 Días / 4 Noches",
    paqueteDestino: "Cartagena, Colombia",
    paqueteIncluye: ["Vuelo GYE-CTG-GYE", "Traslados aeropuerto", "Hotel colonial 4★"],
    incluyeBoleto: true,
    pasajeros: { cantSGL: 0, cantDBL: 2, cantTPL: 0, cantQUAD: 0, cantCHD: 0 },
    precios: { precioSGL: 1100, precioDBL: 990, precioTPL: 950, precioQUAD: 0, precioCHD: 500 },
    subtotal: 1980, markup: 0, total: 1980,
    fechaViaje: "01-05 Jun 2025", status: "RECHAZADA", fechaCreacion: "27 Abr 2025",
  },
];

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
  const isAdmin       = rawRole !== "COLABORADOR";
  const agenciaDisplay = (sessionData?.user as any)?.agenciaNombre || "Viajes Andina Tours";
  const userRoleDisplay =
    rawRole === "ADMIN"       ? "Administrador" :
    rawRole === "COLABORADOR" ? "Colaborador"   : "Ejecutiva de Ventas";

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");

  // ── Packages ─────────────────────────────────────────────────────────────────
  const [packages, setPackages]           = useState<Package[]>([]);
  const [isLoadingPackages, setLoadingPkg] = useState(true);
  const [searchPkgTerm, setSearchPkgTerm] = useState("");

  useEffect(() => {
    setLoadingPkg(true);
    api.getPackages()
      .then((data) => setPackages(data))
      .catch(() => {})
      .finally(() => setLoadingPkg(false));
  }, []);

  const activePackages: Package[] = packages.length > 0 ? packages : FALLBACK_PACKAGES;
  const filteredPackages = activePackages.filter((pkg) => {
    const loc = `${pkg.location?.city || ""} ${pkg.location?.country || ""}`;
    return (
      pkg.title.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchPkgTerm.toLowerCase())
    );
  });

  // ── Cotizaciones ─────────────────────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState<CotizacionExtended[]>(INITIAL_COTIZACIONES);

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

  // Hotels
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);

  // Rooms
  const [cantSGL,  setCantSGL]  = useState(0);
  const [cantDBL,  setCantDBL]  = useState(1);
  const [cantTPL,  setCantTPL]  = useState(0);
  const [cantQUAD, setCantQUAD] = useState(0);
  const [cantCHD,  setCantCHD]  = useState(0);

  // Passengers / services
  const [numPasajeros,  setNumPasajeros]  = useState(0);
  const [childAges,     setChildAges]     = useState<number[]>([]);
  const [childAirfare,  setChildAirfare]  = useState(0);
  const [adultAirfare,  setAdultAirfare]  = useState(0);
  const [extraNights,   setExtraNights]   = useState(0);
  const [agencyMarkup,  setAgencyMarkup]  = useState(100);

  // Marca blanca
  const [agencyLogo,    setAgencyLogo]    = useState<string | null>(null);
  const [agencyName,    setAgencyName]    = useState("Viajes Andina Tours");
  const [agencyPhone,   setAgencyPhone]   = useState("+593 912345678");
  const [agencyAddress, setAgencyAddress] = useState("Av. Francisco de Orellana, Guayaquil");
  const [defaultMarkup, setDefaultMarkup] = useState("100");

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setChildAges((prev) => {
      if (cantCHD > prev.length) return [...prev, ...Array(cantCHD - prev.length).fill(8)];
      return prev.slice(0, cantCHD);
    });
  }, [cantCHD]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedPkg = (
    activePackages.find((p) => String(p.id) === String(selectedPkgId)) ?? activePackages[0]
  ) as Package;

  const availableHotels: HotelOption[] =
    HOTELS_BY_PACKAGE[String(selectedPkgId)] ?? HOTELS_BY_PACKAGE["default"];

  const firstSelectedHotel = availableHotels.find((h) => h.id === selectedHotelIds[0]);
  const quadEnabled = selectedHotelIds.some(
    (id) => availableHotels.find((h) => h.id === id)?.quadEnabled === true
  );

  const effectivePrices = firstSelectedHotel
    ? { sgl: firstSelectedHotel.rates.sgl, dbl: firstSelectedHotel.rates.dbl,
        tpl: firstSelectedHotel.rates.tpl, quad: firstSelectedHotel.rates.quad, chd: firstSelectedHotel.rates.chd }
    : { sgl: selectedPkg.prices?.sgl || 0, dbl: selectedPkg.prices?.dbl || 0,
        tpl: selectedPkg.prices?.tpl || 0, quad: selectedPkg.prices?.quad || 0, chd: selectedPkg.prices?.chd || 0 };

  const computedSubtotal = calcularSubtotal(
    { cantSGL, cantDBL, cantTPL, cantQUAD: quadEnabled ? cantQUAD : 0, cantCHD },
    { precioSGL: effectivePrices.sgl, precioDBL: effectivePrices.dbl, precioTPL: effectivePrices.tpl,
      precioQUAD: effectivePrices.quad, precioCHD: effectivePrices.chd }
  );
  const totalAdults     = cantSGL + cantDBL + cantTPL + (quadEnabled ? cantQUAD : 0);
  const airfareCost     = (selectedPkg as any).flightIncluded
    ? 0
    : adultAirfare * totalAdults + childAirfare * cantCHD;
  const extraNightsCost = firstSelectedHotel && extraNights > 0
    ? extraNights * (
        cantSGL * firstSelectedHotel.rates.sglExtra +
        cantDBL * firstSelectedHotel.rates.dblExtra +
        cantTPL * firstSelectedHotel.rates.tplExtra +
        (quadEnabled ? cantQUAD * firstSelectedHotel.rates.quadExtra : 0) +
        cantCHD * firstSelectedHotel.rates.chdExtra
      )
    : 0;
  const computedTotal   = computedSubtotal + airfareCost + extraNightsCost + agencyMarkup;
  const paxResumen      = resumenPasajeros({ cantSGL, cantDBL, cantTPL, cantQUAD: quadEnabled ? cantQUAD : 0, cantCHD });
  const totalRoomPax    = cantSGL + cantDBL + cantTPL + (quadEnabled ? cantQUAD : 0) + cantCHD;
  const showPaxWarning  = numPasajeros > 0 && totalRoomPax > 0 && totalRoomPax !== numPasajeros;

  const roomRows = [
    { label: "Hab. Sencilla (SGL)", qty: cantSGL,                          price: effectivePrices.sgl  },
    { label: "Hab. Doble (DBL)",    qty: cantDBL,                          price: effectivePrices.dbl  },
    { label: "Hab. Triple (TPL)",   qty: cantTPL,                          price: effectivePrices.tpl  },
    { label: "Cuádruple (QUAD)",    qty: quadEnabled ? cantQUAD : 0,       price: effectivePrices.quad },
    { label: "Niños 2-11 (CHD)",    qty: cantCHD,                          price: effectivePrices.chd  },
  ].filter((r) => r.qty > 0);

  const selectedPkgLocation = `${selectedPkg.location?.city || "Destino"}, ${selectedPkg.location?.country || ""}`;
  const selectedPkgDuration = selectedPkg.duration || `${selectedPkg.diasEstancia} Días / ${selectedPkg.nochesBase} Noches`;
  const selectedPkgDates    = travelDateFrom
    ? `${travelDateFrom}${travelDateTo ? ` → ${travelDateTo}` : ""}`
    : "Según disponibilidad";
  const reservationFee = Math.round((effectivePrices.dbl || selectedPkg.price) * 0.4);

  const packagesByCountry = activePackages.reduce<Record<string, Package[]>>((acc, pkg) => {
    const c = pkg.location?.country || "Otros";
    if (!acc[c]) acc[c] = [];
    acc[c].push(pkg);
    return acc;
  }, {});

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
    setSelectedPkgId("1"); setExpandedCountry(null);
    setTravelDateFrom(""); setTravelDateTo("");
    setSelectedHotelIds([]);
    setNumPasajeros(0); setCantSGL(0); setCantDBL(1); setCantTPL(0); setCantQUAD(0); setCantCHD(0);
    setChildAges([]); setChildAirfare(0); setAdultAirfare(0); setExtraNights(0);
    setAgencyMarkup(parseInt(defaultMarkup) || 100);
  };

  const handleQuickQuote = (pkgId: string) => {
    resetForm();
    setSelectedPkgId(pkgId);
    setQuoteLocked(true);
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

  const handleAprobar  = (id: string) =>
    setCotizaciones((prev) => prev.map((c) => c.id === id ? { ...c, status: "APROBADA" as CotizacionStatus } : c));
  const handleRechazar = (id: string) =>
    setCotizaciones((prev) => prev.map((c) => c.id === id ? { ...c, status: "RECHAZADA" as CotizacionStatus } : c));

  const handleSaveProforma = () => {
    const selHotels = availableHotels.filter((h) => selectedHotelIds.includes(h.id));
    const adultsPax = cantSGL + cantDBL + cantTPL + (quadEnabled ? cantQUAD : 0);

    const hotelsComparison: HotelComparison[] = selHotels.map((hotel) => {
      const sub =
        cantSGL * hotel.rates.sgl +
        cantDBL * hotel.rates.dbl +
        cantTPL * hotel.rates.tpl +
        (hotel.quadEnabled ? cantQUAD * hotel.rates.quad : 0) +
        cantCHD * hotel.rates.chd +
        ((selectedPkg as any).flightIncluded ? 0 : adultAirfare * adultsPax + childAirfare * cantCHD);
      const extNightsCost = extraNights > 0 ? extraNights * (
        cantSGL * hotel.rates.sglExtra +
        cantDBL * hotel.rates.dblExtra +
        cantTPL * hotel.rates.tplExtra +
        (hotel.quadEnabled ? cantQUAD * hotel.rates.quadExtra : 0) +
        cantCHD * hotel.rates.chdExtra
      ) : 0;
      return { hotel, subtotal: sub, extraNightsCost: extNightsCost, total: sub + extNightsCost + agencyMarkup };
    });

    const now    = new Date();
    const fecha  = now.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
    const cliId  = `cli-${Date.now()}`;
    const codigo = `PRF-${now.getFullYear()}-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const first  = hotelsComparison[0];

    const newCot: CotizacionExtended = {
      id: `cot-${Date.now()}`,
      codigo,
      agenciaId: "agencia-andina",
      creadoPorId: "user-session",
      paqueteId: Number(selectedPkgId) || 1,
      clienteId: cliId,
      cliente: {
        id: cliId, agenciaId: "agencia-andina",
        nombre: clientName || "Sin nombre",
        email: clientEmail || undefined,
        telefono: clientPhone || undefined,
        documento: clientId || undefined,
        direccion: clientAddress || undefined,
      },
      paqueteNombre:   selectedPkg.title,
      paqueteDuracion: selectedPkgDuration,
      paqueteDestino:  selectedPkgLocation,
      paqueteIncluye:  selectedPkg.includes || [],
      incluyeBoleto:   (selectedPkg as any).flightIncluded || adultAirfare > 0,
      pasajeros: { cantSGL, cantDBL, cantTPL, cantQUAD: quadEnabled ? cantQUAD : 0, cantCHD },
      precios: {
        precioSGL:  firstSelectedHotel?.rates.sgl  || selectedPkg.prices?.sgl  || 0,
        precioDBL:  firstSelectedHotel?.rates.dbl  || selectedPkg.prices?.dbl  || 0,
        precioTPL:  firstSelectedHotel?.rates.tpl  || selectedPkg.prices?.tpl  || 0,
        precioQUAD: firstSelectedHotel?.rates.quad || selectedPkg.prices?.quad || 0,
        precioCHD:  firstSelectedHotel?.rates.chd  || selectedPkg.prices?.chd  || 0,
      },
      subtotal: first?.subtotal ?? computedSubtotal,
      markup:   agencyMarkup,
      total:    first?.total    ?? computedTotal,
      fechaViaje:    selectedPkgDates,
      status:        "BORRADOR",
      notas:         selHotels.length > 0 ? `Proforma: ${selHotels.map((h) => h.name).join(", ")}` : undefined,
      fechaCreacion: fecha,
      hotelsComparison:   selHotels.length > 0 ? hotelsComparison : undefined,
      extraNights,
      adultAirfareInput:  adultAirfare,
      childAirfareInput:  childAirfare,
    };

    setCotizaciones((prev) => [newCot, ...prev]);
    setActiveTab("cotizaciones");
    resetForm();
  };

  const handleOpenFinalizeDialog = (cotId: string) => {
    setProformaCotId(cotId);
    setProformaChosenHotel("");
    if (proformaDialogRef.current && !proformaDialogRef.current.open)
      proformaDialogRef.current.showModal();
  };

  const handleFinalizeCotizacion = () => {
    if (!proformaCotId || !proformaChosenHotel) return;
    setCotizaciones((prev) =>
      prev.map((c) => {
        if (c.id !== proformaCotId) return c;
        const chosen = (c as CotizacionExtended).hotelsComparison?.find(
          (h) => h.hotel.id === proformaChosenHotel
        );
        if (!chosen) return c;
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
    proformaDialogRef.current?.close();
    setProformaCotId(null);
    setProformaChosenHotel("");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4FAF8] flex font-inter text-primary select-none">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-primary-dark text-white flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(5,41,36,0.15)] relative z-20">
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
                { id: "paquetes",     icon: <Compass size={16} />,         label: "Paquetes Disponibles" },
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
        <header className="h-[76px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-primary uppercase tracking-widest leading-none">
              {activeTab === "dashboard"    && "Dashboard"}
              {activeTab === "paquetes"     && "Paquetes Disponibles"}
              {activeTab === "cotizar"      && "Nueva Cotización"}
              {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
              {activeTab === "marca-blanca" && "Mi Marca Blanca"}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1.5">
              <span>Inicio</span><span>/</span>
              <span className="text-secondary">
                {activeTab === "dashboard"    && "Dashboard"}
                {activeTab === "paquetes"     && "Paquetes Disponibles"}
                {activeTab === "cotizar"      && "Nueva Cotización"}
                {activeTab === "cotizaciones" && "Listado de Cotizaciones"}
                {activeTab === "marca-blanca" && "Mi Marca Blanca"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F4FAF8] border border-[#EDF7F5] rounded-xl text-[10px] font-black text-primary uppercase tracking-wider">
            <Building2 size={12} className="text-secondary" /> {agenciaDisplay}
          </div>
        </header>

        <main className="flex-1 p-8">

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
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.trend === "up" ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-500"}`}>
                        {item.icon}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md tracking-wider ${item.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {item.change}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-primary tracking-tight">{item.value}</span>
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
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Catálogo de Programas Turísticos
                  </h3>
                  <p className="text-[11px] text-primary/50 font-semibold mt-1">Selecciona un programa para cotizar al instante con tus comisiones.</p>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40"><Search size={14} /></span>
                  <input
                    type="text" placeholder="Buscar por destino o nombre..."
                    value={searchPkgTerm} onChange={(e) => setSearchPkgTerm(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-light border border-lighter rounded-2xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-64 focus:border-secondary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {isLoadingPackages ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                  <p className="text-primary/50 font-bold text-xs">Cargando programas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm flex flex-col hover:shadow-md hover:border-secondary/20 transition-all duration-300 group">
                      <div className="relative w-full h-44 overflow-hidden">
                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-secondary text-primary font-black text-[9px] uppercase rounded-md shadow-sm">{pkg.duration || `${pkg.diasEstancia}d/${pkg.nochesBase}n`}</span>
                        <span className="absolute bottom-3 left-3 px-2.5 py-0.5 bg-primary/80 backdrop-blur-sm text-white font-black text-[8px] uppercase rounded-md tracking-wider">{pkg.category}</span>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[9px] font-black text-primary/40 uppercase tracking-wider">
                            <MapPin size={9} className="text-secondary" /> {pkg.location?.city}, {pkg.location?.country}
                          </div>
                          <h4 className="text-xs font-black text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-2">{pkg.title}</h4>
                        </div>
                        <div className="flex items-center justify-between pt-3.5 border-t border-gray-50 mt-auto">
                          <div>
                            <span className="text-[8px] font-black uppercase text-gray-400 leading-none">Precio Base</span>
                            <span className="block text-xs font-black text-primary mt-1">${pkg.price} USD</span>
                          </div>
                          <button onClick={() => handleQuickQuote(String(pkg.id))} className="px-3.5 py-2.5 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer">
                            <Plus size={10} className="stroke-[2.5]" /> Cotizar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredPackages.length === 0 && (
                    <div className="col-span-full py-16 text-center text-primary/40 font-bold text-xs">
                      No se encontraron paquetes para &quot;{searchPkgTerm}&quot;
                    </div>
                  )}
                </div>
              )}
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
                    { s: 2, label: "Paquete & Hotel" },
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
                          <span className={`text-[10px] font-black uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${active ? "text-primary" : "text-gray-400"}`}>{si.label}</span>
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
                          <input type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="cliente@email.com" className={inputCls} />
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

                  {/* ── PASO 2: PAQUETE & HOTEL ── */}
                  {step === 2 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Paquete & Hotel
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Paso 2 de 4</span>
                      </div>

                      {/* Package section */}
                      <div className="space-y-3">
                        <label className={labelCls}>Programa Turístico *</label>

                        {quoteLocked ? (
                          /* Locked: show read-only package badge */
                          <div className="flex items-start gap-3 p-4 bg-secondary/5 border border-secondary/20 rounded-2xl">
                            <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                              <Compass size={14} className="text-secondary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-primary">{selectedPkg.title}</p>
                              <p className="text-[10px] text-primary/50 font-bold mt-0.5">
                                {selectedPkgLocation} · {selectedPkgDuration}
                              </p>
                            </div>
                            <span className="ml-auto px-2 py-0.5 bg-secondary text-primary text-[9px] font-black rounded-md shrink-0">Seleccionado</span>
                          </div>
                        ) : (
                          /* Accordion by destination country */
                          <div className="space-y-2">
                            {Object.entries(packagesByCountry).map(([country, pkgs]) => (
                              <div key={country} className="border border-gray-100 rounded-2xl overflow-hidden">
                                <button
                                  onClick={() => setExpandedCountry(expandedCountry === country ? null : country)}
                                  className="w-full flex items-center justify-between px-5 py-3.5 bg-light hover:bg-secondary/5 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Globe size={13} className="text-secondary" />
                                    <span className="text-xs font-black text-primary uppercase tracking-wider">{country}</span>
                                    <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[9px] font-black rounded-md">
                                      {pkgs.length} programa{pkgs.length > 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {expandedCountry === country ? <ChevronUp size={14} className="text-primary/40" /> : <ChevronDown size={14} className="text-primary/40" />}
                                </button>
                                {expandedCountry === country && (
                                  <div className="divide-y divide-gray-50 bg-white">
                                    {pkgs.map((pkg) => {
                                      const isSelected = String(pkg.id) === String(selectedPkgId);
                                      return (
                                        <div key={pkg.id} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${isSelected ? "bg-secondary/5 border-l-2 border-secondary" : "hover:bg-light/50"}`}>
                                          <div className="min-w-0">
                                            <p className="text-xs font-black text-primary truncate">{pkg.title}</p>
                                            <p className="text-[10px] text-primary/40 font-bold mt-0.5">
                                              {pkg.duration || `${pkg.diasEstancia}d / ${pkg.nochesBase}n`} · Desde ${pkg.price} USD
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => setSelectedPkgId(String(pkg.id))}
                                            className={`ml-4 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 ${
                                              isSelected
                                                ? "bg-secondary text-primary"
                                                : "bg-light border border-lighter text-primary/60 hover:border-secondary/30 hover:text-secondary"
                                            }`}
                                          >
                                            {isSelected ? "✓ Seleccionado" : "Seleccionar"}
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
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Salida</label>
                          {quoteLocked ? (
                            <input type="text" disabled value="Según disponibilidad" className={inputDisabledCls} />
                          ) : (
                            <input type="date" value={travelDateFrom} onChange={(e) => setTravelDateFrom(e.target.value)} className={inputCls} />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className={`${labelCls} flex items-center gap-1.5`}><Calendar size={10} /> Fecha de Retorno</label>
                          {quoteLocked ? (
                            <input type="text" disabled value="Según disponibilidad" className={inputDisabledCls} />
                          ) : (
                            <input type="date" value={travelDateTo} onChange={(e) => setTravelDateTo(e.target.value)} className={inputCls} />
                          )}
                        </div>
                      </div>

                      {/* Hotel selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className={labelCls}>Hoteles para Comparar (máx. 4)</label>
                          {selectedHotelIds.length > 0 && (
                            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20">
                              {selectedHotelIds.length} seleccionado{selectedHotelIds.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {availableHotels.map((hotel) => {
                            const checked  = selectedHotelIds.includes(hotel.id);
                            const disabled = !checked && selectedHotelIds.length >= 4;
                            return (
                              <button
                                key={hotel.id}
                                type="button"
                                onClick={() => !disabled && handleHotelToggle(hotel.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                                  checked  ? "border-secondary bg-secondary/5 shadow-sm"
                                  : disabled ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-100 hover:border-secondary/40 hover:bg-light/60"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-secondary border-secondary" : "border-gray-300"}`}>
                                  {checked && <Check size={11} className="text-primary stroke-[3]" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="text-xs font-black text-primary">{hotel.name}</p>
                                  <p className="text-[10px] text-primary/40 font-bold mt-0.5">
                                    DBL ${hotel.rates.dbl} · TPL ${hotel.rates.tpl} · SGL ${hotel.rates.sgl}
                                    {hotel.quadEnabled ? ` · QUAD $${hotel.rates.quad}` : " · Sin QUAD"}
                                  </p>
                                </div>
                                {hotel.quadEnabled && (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md shrink-0">QUAD ✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {selectedHotelIds.length === 0 && (
                          <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5">
                            <AlertCircle size={11} /> Selecciona al menos un hotel para continuar.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Atrás</button>
                        <button
                          onClick={() => selectedHotelIds.length > 0 && setStep(3)}
                          disabled={selectedHotelIds.length === 0}
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

                      {/* Hotel selected badges */}
                      {selectedHotelIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {availableHotels.filter((h) => selectedHotelIds.includes(h.id)).map((h) => (
                            <span key={h.id} className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg border border-secondary/20 flex items-center gap-1.5">
                              <Building2 size={10} /> {h.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* numPasajeros */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={labelCls}>Total de Pasajeros</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number" min={1} max={50}
                              value={numPasajeros || ""}
                              onChange={(e) => handleNumPasajerosChange(Number(e.target.value))}
                              placeholder="Ej. 5"
                              className={`${inputCls} w-28`}
                            />
                            {numPasajeros === 5 && (
                              <span className="text-[10px] text-secondary font-black">Auto-distribuido: 2 DBL + 3 TPL</span>
                            )}
                          </div>
                        </div>
                        {paxResumen !== "—" && (
                          <div className="space-y-1.5">
                            <label className={labelCls}>Distribución Actual</label>
                            <div className="px-4 py-3 bg-secondary/5 border border-secondary/15 rounded-2xl text-xs font-black text-secondary">
                              {paxResumen}
                            </div>
                          </div>
                        )}
                      </div>

                      {showPaxWarning && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-[10px] font-bold">
                          <AlertCircle size={13} className="shrink-0" />
                          El total de habitaciones ({totalRoomPax} pax) no coincide con los pasajeros declarados ({numPasajeros}).
                        </div>
                      )}

                      {/* Room counters */}
                      <div className="space-y-2">
                        <label className={labelCls}>Distribución por Tipo de Habitación *</label>
                        <p className="text-[10px] text-primary/40 font-bold -mt-1">
                          Precios basados en: {firstSelectedHotel?.name ?? "tarifa del paquete"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { label: "Sencilla (SGL)", desc: `$${effectivePrices.sgl}/p`, count: cantSGL,  setter: setCantSGL,  avail: true },
                            { label: "Doble (DBL)",    desc: `$${effectivePrices.dbl}/p`, count: cantDBL,  setter: setCantDBL,  avail: true },
                            { label: "Triple (TPL)",   desc: `$${effectivePrices.tpl}/p`, count: cantTPL,  setter: setCantTPL,  avail: true },
                            { label: "Cuádruple (QUAD)", desc: quadEnabled ? `$${effectivePrices.quad}/p` : "No disponible", count: cantQUAD, setter: setCantQUAD, avail: quadEnabled },
                            { label: "Niños 2-11 (CHD)", desc: `$${effectivePrices.chd}/p`, count: cantCHD, setter: setCantCHD, avail: true },
                          ].map((room, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${room.avail ? "bg-light border-lighter hover:border-secondary/30" : "bg-gray-50 border-gray-100 opacity-50"}`}>
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-black text-primary block">{room.label}</span>
                                <span className="text-[10px] font-bold text-secondary block">{room.desc}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <button type="button" onClick={() => room.setter(Math.max(0, room.count - 1))} disabled={!room.avail || room.count === 0} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary hover:border-secondary hover:text-secondary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center font-black text-sm text-primary">{room.count}</span>
                                <button type="button" onClick={() => room.avail && room.setter(room.count + 1)} disabled={!room.avail} className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed">
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Child ages */}
                      {cantCHD > 0 && (
                        <div className="space-y-3 p-4 bg-light border border-lighter rounded-2xl">
                          <label className={labelCls}>Edades de los Niños (2–11 años)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {childAges.map((age, i) => (
                              <div key={i} className="space-y-1">
                                <label className="text-[9px] font-black text-primary/40 uppercase">Niño {i + 1}</label>
                                <input
                                  type="number" min={2} max={11} value={age}
                                  onChange={(e) => handleChildAgeChange(i, Number(e.target.value))}
                                  className={`${inputCls} py-2`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1.5 pt-2 border-t border-lighter">
                            <label className={labelCls}>Tarifa Aérea Niño (opcional, por niño USD)</label>
                            <input type="number" min={0} value={childAirfare || ""} onChange={(e) => setChildAirfare(Number(e.target.value))} placeholder="Ej. 280" className={inputCls} />
                          </div>
                        </div>
                      )}

                      {/* Adult airfare or flight included badge */}
                      <div className="space-y-1.5">
                        <label className={`${labelCls} flex items-center gap-1.5`}><Plane size={10} /> Tarifa Aérea Adulto</label>
                        {(selectedPkg as any).flightIncluded ? (
                          <div className="flex items-center gap-2.5 px-4 py-3 bg-secondary/5 border border-secondary/20 rounded-2xl">
                            <Plane size={13} className="text-secondary" />
                            <span className="text-xs font-black text-secondary">Vuelo Incluido por Land Tour Travel</span>
                          </div>
                        ) : (
                          <input type="number" min={0} value={adultAirfare || ""} onChange={(e) => setAdultAirfare(Number(e.target.value))} placeholder="USD por adulto (dejar en 0 si no aplica)" className={inputCls} />
                        )}
                      </div>

                      {/* Extra nights */}
                      <div className="space-y-2">
                        <label className={labelCls}>Noches Adicionales</label>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setExtraNights(Math.max(0, extraNights - 1))} className="w-8 h-8 rounded-xl bg-light border border-lighter flex items-center justify-center hover:border-secondary hover:text-secondary transition-all cursor-pointer">
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center font-black text-sm text-primary">{extraNights}</span>
                          <button type="button" onClick={() => setExtraNights(extraNights + 1)} className="w-8 h-8 rounded-xl bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-all cursor-pointer shadow-sm">
                            <Plus size={13} />
                          </button>
                          {extraNights > 0 && firstSelectedHotel && (
                            <span className="text-[10px] font-bold text-secondary">
                              ≈ ${extraNightsCost.toLocaleString()} USD extra (1er hotel)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Markup */}
                      <div className="space-y-1.5">
                        <label className={`${labelCls} flex items-center gap-1.5`}><DollarSign size={10} /> Comisión / Markup de la Agencia (USD)</label>
                        <input type="number" min={0} value={agencyMarkup} onChange={(e) => setAgencyMarkup(Number(e.target.value))} placeholder="Ej. 100" className={inputCls} />
                        <p className="text-[10px] text-primary/40 font-bold">Este valor se suma al total final y no es visible para el cliente.</p>
                      </div>

                      {/* T&C */}
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

                      {/* Client summary */}
                      <div className="grid grid-cols-2 gap-3 p-4 bg-light border border-lighter rounded-2xl text-xs">
                        {[
                          ["Cliente",   clientName  || "—"],
                          ["Email",     clientEmail || "—"],
                          ["Teléfono",  clientPhone || "—"],
                          ["Paquete",   selectedPkg.title],
                          ["Destino",   selectedPkgLocation],
                          ["Duración",  selectedPkgDuration],
                          ["Fechas",    selectedPkgDates],
                          ["Pasajeros", paxResumen !== "—" ? paxResumen : "Sin configurar"],
                        ].map(([lbl, val]) => (
                          <div key={lbl}>
                            <span className="text-[9px] font-black uppercase text-primary/30 tracking-wider block">{lbl}</span>
                            <span className="font-bold text-primary/80 truncate block">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Hotel comparison table */}
                      {selectedHotelIds.length > 0 && (() => {
                        const selH = availableHotels.filter((h) => selectedHotelIds.includes(h.id));
                        return (
                          <div className="overflow-x-auto">
                            <p className="text-[10px] font-black uppercase text-primary/40 tracking-wider mb-2">Comparativa por Hotel</p>
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="pb-2 text-[9px] font-black uppercase text-gray-400 tracking-wider w-32">Servicio</th>
                                  {selH.map((h) => (
                                    <th key={h.id} className="pb-2 text-[9px] font-black text-primary/60 tracking-wide pl-4">{h.name}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/70">
                                {[
                                  { label: `SGL (×${cantSGL})`,  qty: cantSGL,  rate: (h: HotelOption) => h.rates.sgl },
                                  { label: `DBL (×${cantDBL})`,  qty: cantDBL,  rate: (h: HotelOption) => h.rates.dbl },
                                  { label: `TPL (×${cantTPL})`,  qty: cantTPL,  rate: (h: HotelOption) => h.rates.tpl },
                                  { label: `QUAD (×${cantQUAD})`, qty: quadEnabled ? cantQUAD : 0, rate: (h: HotelOption) => h.quadEnabled ? h.rates.quad : 0 },
                                  { label: `CHD (×${cantCHD})`,  qty: cantCHD,  rate: (h: HotelOption) => h.rates.chd },
                                ].filter((r) => r.qty > 0).map((row) => (
                                  <tr key={row.label}>
                                    <td className="py-2.5 text-[10px] text-primary/50">{row.label}</td>
                                    {selH.map((h) => (
                                      <td key={h.id} className="py-2.5 pl-4">${(row.qty * row.rate(h)).toLocaleString()}</td>
                                    ))}
                                  </tr>
                                ))}
                                {extraNights > 0 && (
                                  <tr>
                                    <td className="py-2.5 text-[10px] text-primary/50">Noches extra (×{extraNights})</td>
                                    {selH.map((h) => {
                                      const c = extraNights * (
                                        cantSGL * h.rates.sglExtra + cantDBL * h.rates.dblExtra +
                                        cantTPL * h.rates.tplExtra + (h.quadEnabled ? cantQUAD * h.rates.quadExtra : 0) +
                                        cantCHD * h.rates.chdExtra
                                      );
                                      return <td key={h.id} className="py-2.5 pl-4">${c.toLocaleString()}</td>;
                                    })}
                                  </tr>
                                )}
                                {agencyMarkup > 0 && (
                                  <tr>
                                    <td className="py-2.5 text-[10px] text-primary/50">Markup agencia</td>
                                    {selH.map((h) => <td key={h.id} className="py-2.5 pl-4">${agencyMarkup.toLocaleString()}</td>)}
                                  </tr>
                                )}
                                <tr className="border-t-2 border-secondary/30">
                                  <td className="py-3 text-[10px] font-black text-primary uppercase">TOTAL</td>
                                  {selH.map((h) => {
                                    const sub = cantSGL * h.rates.sgl + cantDBL * h.rates.dbl + cantTPL * h.rates.tpl +
                                      (h.quadEnabled ? cantQUAD * h.rates.quad : 0) + cantCHD * h.rates.chd +
                                      ((selectedPkg as any).flightIncluded ? 0 : adultAirfare * totalAdults + childAirfare * cantCHD);
                                    const ext = extraNights > 0 ? extraNights * (
                                      cantSGL * h.rates.sglExtra + cantDBL * h.rates.dblExtra +
                                      cantTPL * h.rates.tplExtra + (h.quadEnabled ? cantQUAD * h.rates.quadExtra : 0) +
                                      cantCHD * h.rates.chdExtra
                                    ) : 0;
                                    return <td key={h.id} className="py-3 pl-4 font-black text-secondary text-sm">${(sub + ext + agencyMarkup).toLocaleString()}</td>;
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}

                      {/* No hotel selected fallback */}
                      {selectedHotelIds.length === 0 && roomRows.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-100">
                                {["Servicio","Cant.","P. Unit","Total"].map((h) => (
                                  <th key={h} className={`pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider ${h !== "Servicio" ? "text-right" : ""}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                              {roomRows.map((row, idx) => (
                                <tr key={idx}>
                                  <td className="py-3 text-primary/70">{row.label}</td>
                                  <td className="py-3 text-right">{row.qty}</td>
                                  <td className="py-3 text-right">${row.price.toLocaleString()}</td>
                                  <td className="py-3 text-right font-black text-primary">${(row.qty * row.price).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Atrás</button>
                        <button
                          onClick={handleSaveProforma}
                          className="px-6 py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <Star size={14} /> Guardar Proforma
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Summary sidebar ── */}
                <div className="space-y-5">
                  <div className="bg-primary p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col gap-5 border border-white/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-secondary tracking-widest">Resumen</h3>
                      <span className="px-2 py-0.5 bg-white/10 text-[8px] font-black uppercase tracking-wider rounded-md border border-white/5">Proforma</span>
                    </div>
                    <div className="space-y-2 text-[11px] border-t border-white/10 pt-4 font-bold text-white/70">
                      <div className="flex justify-between items-center">
                        <span>Subtotal habitaciones</span>
                        <span className="font-black text-white">${computedSubtotal.toLocaleString()}</span>
                      </div>
                      {airfareCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Tarifa aérea</span>
                          <span className="font-black text-white">${airfareCost.toLocaleString()}</span>
                        </div>
                      )}
                      {extraNightsCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Noches extra</span>
                          <span className="font-black text-white">${extraNightsCost.toLocaleString()}</span>
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
                        <span className="block text-2xl font-black text-white">${computedTotal.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 rounded-lg border border-white/5">USD</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 space-y-2 text-[10px] font-bold text-white/50">
                      <div className="flex justify-between">
                        <span>Reserva inicial (40%)</span>
                        <span className="text-secondary">${reservationFee}/p</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pasajeros</span>
                        <span className="text-white/80">{paxResumen !== "—" ? paxResumen : "Sin definir"}</span>
                      </div>
                      {selectedHotelIds.length > 0 && (
                        <div className="flex justify-between">
                          <span>Hoteles</span>
                          <span className="text-white/80">{selectedHotelIds.length} seleccionado{selectedHotelIds.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-50 pb-2">Info del Paquete</h4>
                    <div className="space-y-2 text-xs font-bold text-primary/70">
                      {[
                        ["Destino",   selectedPkgLocation],
                        ["Duración",  selectedPkgDuration],
                        ["Fechas",    selectedPkgDates],
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

              <div className="overflow-x-auto">
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
          {activeTab === "marca-blanca" && (
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
                  <button disabled={!isAdmin} onClick={() => isAdmin && alert("Configuración guardada exitosamente.")}
                    className={`px-6 py-3.5 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 ${isAdmin ? "bg-primary hover:bg-primary-light cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}>
                    Guardar Configuración
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

        </main>
      </div>

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
