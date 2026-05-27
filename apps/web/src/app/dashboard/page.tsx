"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/services/api";
import { Package } from "@land-tour/shared";
import { calcularSubtotal, resumenPasajeros } from "@land-tour/shared";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Search,
  User,
  Users,
  TrendingUp,
  Download,
  AlertCircle,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  FileText,
  Check,
  Eye,
  Settings2,
  Share2,
  LogOut,
  Compass,
  Plane,
  Building,
} from "lucide-react";

// ─── Mock Data para Hoteles y Tarifas ─────────────────────────────────────────

interface HotelRate {
  id: string;
  name: string;
  sgl: number;
  sglExtra: number;
  dbl: number;
  dblExtra: number;
  tpl: number;
  tplExtra: number;
  quad: number;
  quadExtra: number;
  chd: number;
  chdExtra: number;
  hasQuad: boolean;
}

const MOCK_HOTEL_RATES: Record<string, HotelRate[]> = {
  "1": [
    { id: "h1-1", name: "Exe Oriental / Ramada Via Argentina", sgl: 559, sglExtra: 79, dbl: 429, dblExtra: 37, tpl: 399, tplExtra: 33, chd: 349, chdExtra: 33, quad: 0, quadExtra: 0, hasQuad: false },
    { id: "h1-2", name: "Soloy", sgl: 569, sglExtra: 82, dbl: 439, dblExtra: 40, tpl: 409, tplExtra: 39, chd: 349, chdExtra: 35, quad: 0, quadExtra: 0, hasQuad: false },
    { id: "h1-3", name: "The Executive / El Panama", sgl: 589, sglExtra: 92, dbl: 449, dblExtra: 45, tpl: 419, tplExtra: 41, chd: 349, chdExtra: 35, quad: 399, quadExtra: 33, hasQuad: true },
    { id: "h1-4", name: "Holiday Inn Express", sgl: 599, sglExtra: 98, dbl: 459, dblExtra: 49, tpl: 429, tplExtra: 45, chd: 349, chdExtra: 35, quad: 0, quadExtra: 0, hasQuad: false }
  ],
  "2": [
    { id: "h2-1", name: "Riu Cancun All Inclusive", sgl: 890, sglExtra: 120, dbl: 690, dblExtra: 80, tpl: 650, tplExtra: 75, chd: 490, chdExtra: 50, quad: 0, quadExtra: 0, hasQuad: false },
    { id: "h2-2", name: "Grand Fiesta Americana", sgl: 1100, sglExtra: 150, dbl: 850, dblExtra: 110, tpl: 790, tplExtra: 95, chd: 590, chdExtra: 60, quad: 750, quadExtra: 85, hasQuad: true }
  ]
};

// ─── Cotizaciones Recientes ───────────────────────────────────────────────────

interface Cotizacion {
  id: string;
  pasajero: string;
  autor: string;
  fechaCreacion: string;
  paquete: string;
  fechas: string;
  total: number;
  pax: string;
  estado: "BORRADOR" | "ENVIADA" | "APROBADA" | "PENDIENTE" | "RECHAZADA" | "LIQUIDADA";
  comparedHotels: string[];
  selectedHotel: string;
  pasajerosData: {
    cantSGL: number;
    cantDBL: number;
    cantTPL: number;
    cantQUAD: number;
    cantCHD: number;
  };
  notes: string;
}

const MOCK_INITIAL_COTIZACIONES: Cotizacion[] = [
  {
    id: "COT-2024-001",
    pasajero: "María González",
    autor: "Ana Córdova",
    fechaCreacion: "28 Abr 2024",
    paquete: "Panamá Ciudad + Playa Todo Incluido",
    fechas: "09-13 May 2024",
    total: 1738,
    pax: "2 DBL",
    estado: "BORRADOR",
    comparedHotels: ["Exe Oriental / Ramada Via Argentina", "Soloy"],
    selectedHotel: "",
    pasajerosData: { cantSGL: 0, cantDBL: 1, cantTPL: 0, cantQUAD: 0, cantCHD: 0 },
    notes: "No incluye seguro de viaje."
  },
  {
    id: "COT-2024-002",
    pasajero: "Carlos Ruiz",
    autor: "Ana Córdova",
    fechaCreacion: "28 Abr 2024",
    paquete: "Cancún Todo Incluido Premium",
    fechas: "15-19 Jun 2024",
    total: 2607,
    pax: "3 TPL",
    estado: "APROBADA",
    comparedHotels: ["Grand Fiesta Americana"],
    selectedHotel: "Grand Fiesta Americana",
    pasajerosData: { cantSGL: 0, cantDBL: 0, cantTPL: 1, cantQUAD: 0, cantCHD: 0 },
    notes: "Vuelo confirmado."
  }
];

export default function DashboardPage() {
  // Integración de NextAuth
  let sessionData = null;
  try {
    const { data: session } = useSession();
    sessionData = session;
  } catch (e) {
    // Fail-safe
  }

  const userName = (sessionData as any)?.user?.name || "Ana Córdova";
  const userRole = (sessionData as any)?.user?.role || "ADMIN"; // ADMIN o COLABORADOR
  const agencyNameTag = (sessionData as any)?.user?.agenciaNombre || "Viajes Andina Tours";

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, paquetes, cotizar, cotizaciones, marca-blanca

  // Listado dinámico de paquetes
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [searchPkgTerm, setSearchPkgTerm] = useState("");

  // Sincronizar catálogo con API
  useEffect(() => {
    setIsLoadingPackages(true);
    api.getPackages()
      .then((data) => {
        setPackages(data);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
      })
      .finally(() => {
        setIsLoadingPackages(false);
      });
  }, []);

  const activePackages = packages.length > 0 ? packages : [
    {
      id: "1",
      title: "Panamá Ciudad + Playa Todo Incluido",
      price: 869,
      image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
      category: "Playa",
      duration: "5 días / 4 noches",
      nochesBase: 4,
      diasEstancia: 5,
      location: { country: "Panamá", city: "Ciudad de Panamá" },
      includes: ["Vuelo GYE-PTY-GYE vía COPA", "Traslados compartidos", "2 noches Marriott 4★ con desayuno", "2 noches Decameron Todo Incluido"],
      prices: { sgl: 559, dbl: 429, tpl: 399, quad: 399, chd: 349 },
      flightIncluded: true
    },
    {
      id: "2",
      title: "Cancún Todo Incluido Premium",
      price: 1250,
      image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
      category: "Playa",
      duration: "7 días / 6 noches",
      nochesBase: 6,
      diasEstancia: 7,
      location: { country: "México", city: "Cancún" },
      includes: ["Vuelo GYE-CUN-GYE", "Traslados aeropuerto", "6 noches resort 5★ Todo Incluido", "Bebidas ilimitadas"],
      prices: { sgl: 890, dbl: 690, tpl: 650, chd: 490 },
      flightIncluded: true
    }
  ] as unknown as Package[];

  // Definir filteredPackages para la pestaña de Catálogo
  const filteredPackages = activePackages.filter(p =>
    p.title.toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
    (p.location?.country || "").toLowerCase().includes(searchPkgTerm.toLowerCase()) ||
    (p.location?.city || "").toLowerCase().includes(searchPkgTerm.toLowerCase())
  );

  // ─── Cotizaciones (CRUD Simulado) ───────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(MOCK_INITIAL_COTIZACIONES);
  
  // ─── Estados del Cotizador Stepper ───
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  
  // Configuración del viaje
  const [isFromScratch, setIsFromScratch] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("1");
  const [customDestination, setCustomDestination] = useState("Panamá");
  const [customDuration, setCustomDuration] = useState("5 Días / 4 Noches");
  const [travelDate, setTravelDate] = useState("2026-06-15");
  const [extraNights, setExtraNights] = useState(0);

  // Pasajeros
  const [numPassengers, setNumPassengers] = useState("2");
  const [cantSGL, setCantSGL] = useState(0);
  const [cantDBL, setCantDBL] = useState(1);
  const [cantTPL, setCantTPL] = useState(0);
  const [cantQUAD, setCantQUAD] = useState(0);
  const [cantCHD, setCantCHD] = useState(0);
  const [childAges, setChildAges] = useState<string[]>([]);
  
  // Adicionales
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [adultAirfare, setAdultAirfare] = useState("0");
  const [childAirfare, setChildAirfare] = useState("0");
  const [extraGain, setExtraGain] = useState("100"); // markup adicional para su ganancia

  // Marca Blanca
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState("Viajes Andina Tours");
  const [agencyPhone, setAgencyPhone] = useState("+593 912345678");
  const [agencyAddress, setAgencyAddress] = useState("Av. Francisco de Orellana, Guayaquil");
  const [defaultMarkup, setDefaultMarkup] = useState("100");

  // Modal aprobación / elegir hotel
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedApproveQuoteId, setSelectedApproveQuoteId] = useState("");
  const [definitiveHotel, setDefinitiveHotel] = useState("");

  // ─── Sincronizar Pasajeros con Número de Pasajeros automáticamente ───
  useEffect(() => {
    const total = parseInt(numPassengers) || 0;
    if (total === 5) {
      setCantSGL(0);
      setCantDBL(1);
      setCantTPL(1);
      setCantQUAD(0);
      setCantCHD(0);
    } else if (total === 2) {
      setCantSGL(0);
      setCantDBL(1);
      setCantTPL(0);
      setCantQUAD(0);
      setCantCHD(0);
    }
  }, [numPassengers]);

  // Manejar cambio de niños para agregar edades
  useEffect(() => {
    const count = cantCHD;
    setChildAges((prev) => {
      const copy = [...prev];
      if (copy.length < count) {
        while (copy.length < count) copy.push("8");
      } else if (copy.length > count) {
        copy.length = count;
      }
      return copy;
    });
  }, [cantCHD]);

  // Variables calculadas
  const selectedPkg = activePackages.find(p => String(p.id) === String(selectedPkgId)) || activePackages[0];
  const selectedPkgLocation = selectedPkg ? `${selectedPkg.location?.city || ""}, ${selectedPkg.location?.country || ""}` : "";
  const hotelList = MOCK_HOTEL_RATES[String(selectedPkg.id)] || MOCK_HOTEL_RATES["1"];

  const hasQuadRoom = hotelList.some(h => h.hasQuad);

  // Calcular precio para cada hotel seleccionado
  const hotelPricesCalculated = hotelList.map((hotel) => {
    const isSelected = selectedHotels.includes(hotel.name);
    
    // Tarifas base
    const pricesObj = {
      precioSGL: hotel.sgl + (extraNights * hotel.sglExtra),
      precioDBL: hotel.dbl + (extraNights * hotel.dblExtra),
      precioTPL: hotel.tpl + (extraNights * hotel.tplExtra),
      precioQUAD: hotel.quad + (extraNights * hotel.quadExtra),
      precioCHD: hotel.chd + (extraNights * hotel.chdExtra),
    };

    const subtotal = calcularSubtotal({ cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD }, pricesObj);

    // Sumar boletos aéreos si es opcional (solo si el paquete no lo incluye ya)
    const airfareAdultCost = !selectedPkg.flightIncluded ? (parseInt(adultAirfare) || 0) * (cantSGL * 1 + cantDBL * 2 + cantTPL * 3 + cantQUAD * 4) : 0;
    const airfareChildCost = !selectedPkg.flightIncluded && cantCHD > 0 ? (parseInt(childAirfare) || 0) * cantCHD : 0;

    const totalGain = (parseInt(defaultMarkup) || 0) + (parseInt(extraGain) || 0);
    const finalTotal = subtotal + airfareAdultCost + airfareChildCost + totalGain;

    return {
      hotelName: hotel.name,
      subtotal,
      finalTotal,
      isSelected
    };
  });

  const activeHotelCalculation = hotelPricesCalculated.find(h => h.isSelected) || hotelPricesCalculated[0];
  const calculatedTotal = activeHotelCalculation?.finalTotal || 0;

  // Filtrar paquetes por destino para el cotizador
  const availablePackagesForDestination = activePackages.filter(p => 
    p.location.country.toLowerCase().includes(customDestination.toLowerCase()) ||
    p.location.city.toLowerCase().includes(customDestination.toLowerCase())
  );

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (e) {
      window.location.href = "/login";
    }
  };

  const handleQuickQuote = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setIsFromScratch(false);
    setStep(1);
    setActiveTab("cotizar");
  };

  const handleSaveQuote = (statusType: "BORRADOR" | "ENVIADA") => {
    if (!clientName) {
      alert("Por favor introduce el nombre del cliente.");
      return;
    }

    const newCode = `COT-2024-${String(cotizaciones.length + 1).padStart(3, "0")}`;
    const newQuote = {
      id: newCode,
      pasajero: clientName,
      autor: userName,
      fechaCreacion: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      paquete: isFromScratch ? `Personalizado a ${customDestination}` : selectedPkg.title,
      fechas: travelDate,
      total: calculatedTotal,
      pax: resumenPasajeros({ cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD }),
      estado: statusType,
      comparedHotels: selectedHotels.length > 0 ? selectedHotels : [hotelList[0].name],
      selectedHotel: "",
      pasajerosData: { cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD },
      notes: "Notas fijas de Land Tour Travel: No incluye gastos personales."
    };

    setCotizaciones([newQuote, ...cotizaciones]);
    alert(`Proforma ${newCode} guardada exitosamente en Marca Blanca.`);
    
    // Resetear formulario
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientId("");
    setClientAddress("");
    setSelectedHotels([]);
    setStep(1);
    setActiveTab("cotizaciones");
  };

  const handleApproveProforma = (quoteId: string) => {
    const quote = cotizaciones.find(c => c.id === quoteId);
    if (quote) {
      setSelectedApproveQuoteId(quoteId);
      setDefinitiveHotel(quote.comparedHotels[0] || "");
      setIsApproveOpen(true);
    }
  };

  const submitApprove = () => {
    setCotizaciones(prev => prev.map(c => {
      if (c.id === selectedApproveQuoteId) {
        return {
          ...c,
          estado: "APROBADA" as const,
          selectedHotel: definitiveHotel
        };
      }
      return c;
    }));
    setIsApproveOpen(false);
    alert(`Cotización ${selectedApproveQuoteId} ha sido aprobada de forma definitiva con el hotel ${definitiveHotel}.`);
  };

  // KPIs dinámicos
  const kpiTotalCount = cotizaciones.length;
  const kpiApprovedCount = cotizaciones.filter(c => c.estado === "APROBADA").length;
  const kpiRejectedCount = cotizaciones.filter(c => c.estado === "RECHAZADA").length;
  const kpiPendingCount = cotizaciones.filter(c => c.estado === "PENDIENTE" || c.estado === "BORRADOR").length;

  return (
    <div className="min-h-screen bg-[#F4FAF8] flex font-inter text-primary select-none">
      
      {/* ── 1. SIDEBAR DE NAVEGACIÓN LATERAL B2B ── */}
      <aside className="w-64 bg-primary-dark text-white flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(5,41,36,0.15)] relative z-20">
        
        <div className="flex flex-col">
          {/* Logo Real en Contenedor Blanco */}
          <div className="p-6 border-b border-white/5 flex flex-col gap-2">
            <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center justify-center">
              <div className="relative w-full h-10">
                <Image
                  src="/images/lttlogo.png"
                  alt="Land Tour Travel Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Portal de Agencias
              </span>
            </div>
          </div>

          {/* Menú de Navegación Lateral */}
          <div className="p-4 space-y-6">
            {/* Sección Principal */}
            <div className="space-y-1.5">
              <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">
                Principal
              </span>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("paquetes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "paquetes"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Compass size={16} />
                Paquetes Disponibles
              </button>
              <button
                onClick={() => {
                  setActiveTab("cotizar");
                  setStep(1);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "cotizar"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Plus size={16} className="stroke-[2.5]" />
                Nueva Cotización
              </button>
            </div>

            {/* Sección Gestión */}
            <div className="space-y-1.5">
              <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">
                Gestión
              </span>
              <button
                onClick={() => setActiveTab("cotizaciones")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "cotizaciones"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={16} />
                  Cotizaciones
                </div>
                <span className="w-5 h-5 rounded-full bg-secondary text-primary font-black text-[10px] flex items-center justify-center shrink-0 border border-primary-dark/20">
                  {kpiTotalCount}
                </span>
              </button>
            </div>

            {/* Sección Configuración */}
            <div className="space-y-1.5">
              <span className="block px-4 text-[10px] font-black uppercase tracking-wider text-white/30">
                Configuración
              </span>
              <button
                onClick={() => setActiveTab("marca-blanca")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "marca-blanca"
                    ? "bg-secondary text-primary shadow-lg shadow-secondary/15"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Settings2 size={16} />
                Mi Marca Blanca
              </button>
            </div>
          </div>
        </div>

        {/* Perfil del Ejecutivo e Inserción de Cierre de Sesión */}
        <div className="p-4 border-t border-white/5 bg-primary-dark/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border border-white/10 shrink-0 shadow-inner">
              {userName.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white truncate leading-tight">
                {userName}
              </h4>
              <p className="text-[9px] font-bold text-secondary mt-0.5">
                {userRole}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={13} className="stroke-[2.5]" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── 2. SECCIÓN PRINCIPAL DEL PORTAL ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        
        {/* Cabecera Superior */}
        <header className="h-[76px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-primary uppercase tracking-widest leading-none">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "paquetes" && "Paquetes Disponibles"}
              {activeTab === "cotizar" && "Nueva Cotización"}
              {activeTab === "cotizaciones" && "Listados de Cotizaciones Generadas"}
              {activeTab === "marca-blanca" && "Mi Marca Blanca"}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1.5">
              <span>Inicio</span>
              <span>/</span>
              <span className="text-secondary">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "paquetes" && "Paquetes Disponibles"}
                {activeTab === "cotizar" && "Nueva Cotización"}
                {activeTab === "cotizaciones" && "Listados de Cotizaciones Generadas"}
                {activeTab === "marca-blanca" && "Mi Marca Blanca"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F4FAF8] border border-[#EDF7F5] rounded-xl text-[10px] font-black text-primary uppercase tracking-wider">
            <Building2 size={12} className="text-secondary" /> {agencyNameTag}
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 p-8">

          {/* TABLA 1: DASHBOARD INICIO */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-scale">
              
              {/* Cuatro KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { value: String(kpiTotalCount), label: "Cotizaciones totales", change: "↑ Activo", trend: "up", icon: <FileText size={16} /> },
                  { value: String(kpiApprovedCount), label: "Cotizaciones aprobadas", change: "↑ Éxito", trend: "up", icon: <CheckCircle2 size={16} /> },
                  { value: String(kpiRejectedCount), label: "Cotizaciones Rechazadas", change: "↓ Baja", trend: "down", icon: <X size={16} /> },
                  { value: String(kpiPendingCount), label: "Pendientes / Borradores", change: "→ Espera", trend: "down", icon: <Clock size={16} /> },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col justify-between gap-4 relative group hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        item.trend === "up" ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-500"
                      }`}>
                        {item.icon}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md tracking-wider flex items-center gap-1 ${
                        item.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>
                        {item.change}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-primary tracking-tight">
                        {item.value}
                      </span>
                      <span className="block text-[11px] font-bold text-primary/50 mt-1">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fila de Contenido (Últimas Cotizaciones) */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Últimas Cotizaciones
                  </h3>
                  <button
                    onClick={() => setActiveTab("cotizaciones")}
                    className="px-4 py-1.5 border border-gray-200 hover:border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                  >
                    Ver todas
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Código</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Cliente</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Destino / Programa</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Pax</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Total</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Estado</th>
                        <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                      {cotizaciones.slice(0, 3).map((cot, idx) => (
                        <tr key={idx} className="hover:bg-[#FAFDFD] transition-colors">
                          <td className="py-4">
                            <span className="font-black text-secondary block">{cot.id}</span>
                            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{cot.fechaCreacion}</span>
                          </td>
                          <td className="py-4 font-black">{cot.pasajero}</td>
                          <td className="py-4 text-primary/60">{cot.paquete}</td>
                          <td className="py-4">{cot.pax}</td>
                          <td className="py-4 font-black">${cot.total.toLocaleString()} USD</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${
                              cot.estado === "APROBADA" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                cot.estado === "APROBADA" ? "bg-emerald-500" : "bg-amber-500"
                              }`} />
                              {cot.estado}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1.5">
                              {cot.estado === "BORRADOR" ? (
                                <button
                                  onClick={() => handleApproveProforma(cot.id)}
                                  className="px-2 py-1 bg-secondary text-primary rounded-lg text-[9px] font-black uppercase tracking-wider transition-all hover:bg-secondary-light cursor-pointer"
                                >
                                  Aprobar Hotel
                                </button>
                              ) : (
                                <span className="text-[9px] text-emerald-600 font-black uppercase flex items-center gap-1">
                                  <Check size={11} className="stroke-[3]" /> Liquidando
                                </span>
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

          {/* TABLA 2: PAQUETES DISPONIBLES (Catálogo Segmentado) */}
          {activeTab === "paquetes" && (
            <div className="space-y-6 animate-fade-scale">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Catálogo de Programas Turísticos
                  </h3>
                  <p className="text-[11px] text-primary/50 font-semibold mt-1">
                    Selecciona un programa para cotizar al instante con tus comisiones y marca blanca.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por destino..."
                    value={searchPkgTerm}
                    onChange={(e) => setSearchPkgTerm(e.target.value)}
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
                  {filteredPackages.map((pkg) => {
                    const locStr = `${pkg.location?.city || ""}, ${pkg.location?.country || ""}`;
                    const durationStr = pkg.duration || `${pkg.diasEstancia} Días / ${pkg.nochesBase} Noches`;
                    return (
                      <div key={pkg.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm flex flex-col hover:shadow-md hover:border-secondary/20 transition-all duration-300 group">
                        <div className="relative w-full h-44 overflow-hidden">
                          <img
                            src={pkg.image}
                            alt={pkg.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-secondary text-primary font-black text-[9px] uppercase rounded-md shadow-sm">
                            {durationStr}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-[9px] font-black text-primary/45 uppercase tracking-wider">
                              <MapPin size={9} className="text-secondary" /> {locStr}
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                              {pkg.title}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-gray-400">Precio Base</span>
                              <span className="text-xs sm:text-sm font-black text-primary mt-0.5">${pkg.price} USD</span>
                            </div>
                            <button
                              onClick={() => handleQuickQuote(String(pkg.id))}
                              className="px-3.5 py-2.5 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={10} className="stroke-[2.5]" />
                              Cotizar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABLA 3: COTIZADOR B2B STEPPER */}
          {activeTab === "cotizar" && (
            <div className="space-y-6 animate-fade-scale">
              
              {/* Stepper Horizontal */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center max-w-2xl mx-auto">
                  {[
                    { s: 1, label: "Datos del Cliente" },
                    { s: 2, label: "Configurar Paquete" },
                    { s: 3, label: "Servicios y Tarifas" },
                    { s: 4, label: "Resumen y Guardar" },
                  ].map((stepItem, i, arr) => {
                    const active = step >= stepItem.s;
                    return (
                      <React.Fragment key={stepItem.s}>
                        <div className="flex flex-col items-center gap-1.5 relative">
                          <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border-2 transition-all ${
                            active
                              ? "bg-secondary border-secondary text-primary shadow-glow scale-110"
                              : "border-gray-200 bg-white text-gray-400"
                          }`}>
                            {stepItem.s}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${
                            active ? "text-primary" : "text-gray-400"
                          }`}>
                            {stepItem.label}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-4 transition-all ${
                            step > stepItem.s ? "bg-secondary" : "bg-gray-200"
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="h-6" />
              </div>

              {/* Formulario y Resumen */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Bloque Izquierdo */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* PASO 1: DATOS CLIENTE */}
                  {step === 1 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4">
                        <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Datos del Cliente
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Nombre Completo *</label>
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nombre del cliente"
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Correo Electrónico *</label>
                          <input
                            type="email"
                            required
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="cliente@email.com"
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Teléfono / WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="+593 9XXXXXXXX"
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Identificación / RUC</label>
                          <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="C.I. / RUC"
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Dirección</label>
                          <input
                            type="text"
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                            placeholder="Dirección completa"
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Agente Emisor</label>
                          <input
                            type="text"
                            disabled
                            value={userName}
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary/50 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          Siguiente Paso <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASO 2: CONFIGURAR PAQUETE */}
                  {step === 2 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                        <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Configurar Paquete
                        </h3>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-black uppercase text-primary/40 tracking-wider cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isFromScratch} 
                              onChange={(e) => setIsFromScratch(e.target.checked)} 
                              className="mr-1.5 rounded"
                            />
                            Cotizar desde Cero
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isFromScratch ? (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Destino Personalizado</label>
                              <input
                                type="text"
                                value={customDestination}
                                onChange={(e) => setCustomDestination(e.target.value)}
                                className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Duración del Viaje</label>
                              <input
                                type="text"
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Paquete Prearmado *</label>
                              <select
                                value={selectedPkgId}
                                onChange={(e) => setSelectedPkgId(e.target.value)}
                                className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all cursor-pointer"
                              >
                                {activePackages.map(p => (
                                  <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Destino</label>
                              <input
                                type="text"
                                disabled
                                value={selectedPkgLocation}
                                className="w-full px-4 py-3 bg-light border border-lighter text-primary/50 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-not-allowed"
                              />
                            </div>
                          </>
                        )}
                        
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Fecha de Viaje</label>
                          <input
                            type="date"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Noches Adicionales</label>
                          <input
                            type="number"
                            min="0"
                            value={extraNights}
                            onChange={(e) => setExtraNights(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          Siguiente Paso <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASO 3: SERVICIOS Y TARIFAS */}
                  {step === 3 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4">
                        <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Selección de Hoteles y Distribución
                        </h3>
                        <p className="text-[10px] font-bold text-primary/40 mt-1">
                          Elige hasta un máximo de 4 hoteles para comparar. Primero selecciona el hotel, luego el tipo de habitación.
                        </p>
                      </div>

                      {/* Selector de Hoteles */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Hoteles Disponibles (Selecciona para comparar)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {hotelList.map((hotel) => {
                            const isSelected = selectedHotels.includes(hotel.name);
                            return (
                              <label
                                key={hotel.id}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                                  isSelected ? "border-secondary bg-[#FAFDFD]" : "border-gray-150 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedHotels(prev => prev.filter(h => h !== hotel.name));
                                    } else {
                                      if (selectedHotels.length >= 4) {
                                        alert("Puedes seleccionar un máximo de 4 hoteles.");
                                        return;
                                      }
                                      setSelectedHotels(prev => [...prev, hotel.name]);
                                    }
                                  }}
                                  className="rounded text-secondary focus:ring-secondary/40"
                                />
                                <div className="min-w-0">
                                  <span className="block text-xs font-black text-primary truncate">{hotel.name}</span>
                                  <span className="text-[9px] text-gray-400 font-bold block">
                                    Base DBL: ${hotel.dbl} USD | N/A Extra: ${hotel.dblExtra} USD
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Distribución de Pasajeros y Habitaciones */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Número de Pasajeros</label>
                            <input
                              type="number"
                              value={numPassengers}
                              onChange={(e) => setNumPassengers(e.target.value)}
                              className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary"
                            />
                            <p className="text-[9px] text-gray-400 font-semibold leading-none">
                              * Si pones 5 pasajeros se distribuirá automáticamente en 1 DBL + 1 TPL.
                            </p>
                          </div>
                        </div>

                        {/* Contadores manuales */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Habitaciones a Reservar (Orden SGL - DBL - TPL - QUAD - CHD)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                              { label: "Sencilla (SGL)", val: cantSGL, set: setCantSGL },
                              { label: "Doble (DBL)", val: cantDBL, set: setCantDBL },
                              { label: "Triple (TPL)", val: cantTPL, set: setCantTPL },
                              { label: "Cuádruple (QUAD)", val: cantQUAD, set: setCantQUAD, disabled: !hasQuadRoom },
                              { label: "Niños (CHD)", val: cantCHD, set: setCantCHD }
                            ].map((item, idx) => (
                              <div key={idx} className="bg-light p-3 rounded-2xl border border-lighter flex flex-col items-center justify-between text-center gap-2">
                                <span className="text-[9px] font-black uppercase text-primary/50">{item.label}</span>
                                {item.disabled ? (
                                  <span className="text-[9px] text-red-400 font-black uppercase">No habilitado</span>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => item.set(Math.max(0, item.val - 1))}
                                      className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs hover:border-primary active:scale-90"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-black text-primary">{item.val}</span>
                                    <button
                                      type="button"
                                      onClick={() => item.set(item.val + 1)}
                                      className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs hover:border-primary active:scale-90"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Edad de los Niños si aplica */}
                        {cantCHD > 0 && (
                          <div className="space-y-3 p-4 bg-[#FAFDFD] rounded-2xl border border-lighter">
                            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Edades de los Niños</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {childAges.map((age, cIdx) => (
                                <div key={cIdx} className="space-y-1">
                                  <label className="text-[9px] font-black text-gray-400 uppercase">Edad Niño {cIdx + 1}</label>
                                  <select
                                    value={age}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setChildAges(prev => prev.map((a, i) => i === cIdx ? val : a));
                                    }}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                                  >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(y => (
                                      <option key={y} value={y}>{y} Años</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Boletos aéreos y Adicionales */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Boleto Aéreo Adulto (USD * Opcional)</label>
                            <input
                              type="number"
                              disabled={selectedPkg.flightIncluded}
                              value={selectedPkg.flightIncluded ? "0" : adultAirfare}
                              onChange={(e) => setAdultAirfare(e.target.value)}
                              className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary disabled:cursor-not-allowed"
                            />
                            {selectedPkg.flightIncluded && (
                              <span className="text-[8px] font-black text-secondary uppercase tracking-widest block mt-1">Incluido por Kevin</span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Boleto Aéreo Niño (USD * Opcional)</label>
                            <input
                              type="number"
                              disabled={selectedPkg.flightIncluded || cantCHD === 0}
                              value={selectedPkg.flightIncluded ? "0" : childAirfare}
                              onChange={(e) => setChildAirfare(e.target.value)}
                              className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary disabled:cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Mi Comisión Adicional (USD)</label>
                            <input
                              type="number"
                              value={extraGain}
                              onChange={(e) => setExtraGain(e.target.value)}
                              className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notas fijas y estáticas de la empresa */}
                      <div className="space-y-2 p-4 bg-[#F5FAF9]/60 rounded-2xl border border-lighter">
                        <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">Términos y Notas Legales Estáticas (Empresa)</label>
                        <p className="text-[9px] font-bold text-primary/60 leading-relaxed">
                          - Tarifas sujetas a cambio sin previo aviso. / - LT TOURS SAS no se hace responsable por cambios de aerolínea. / - Reserva mínima de $499 USD no reembolsable.
                        </p>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          Revisar Resumen <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASO 4: RESUMEN Y GUARDAR */}
                  {step === 4 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="border-b border-gray-50 pb-4">
                        <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-secondary inline-block" /> Revisión y Envío de Proforma
                        </h3>
                      </div>

                      {/* Tabla comparativa de hoteles seleccionados */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Hotel</th>
                              <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Noches Extra</th>
                              <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Neto Hotel</th>
                              <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Total Final (con ganancia)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                            {hotelPricesCalculated.map((h, idx) => (
                              <tr key={idx} className={selectedHotels.includes(h.hotelName) ? "bg-[#FAFDFD]/80 font-black text-primary" : ""}>
                                <td className="py-3.5 pr-4 text-[11px] leading-tight">{h.hotelName}</td>
                                <td className="py-3.5 text-center text-primary/50">{extraNights} Noches</td>
                                <td className="py-3.5 text-right text-primary/60">${h.subtotal.toLocaleString()}</td>
                                <td className="py-3.5 text-right text-secondary">${h.finalTotal.toLocaleString()} USD</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-200 text-primary font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                        >
                          Atrás
                        </button>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleSaveQuote("BORRADOR")}
                            className="px-6 py-3 bg-primary-dark hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            Guardar Borrador
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveQuote("ENVIADA")}
                            className="px-6 py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <CheckCircle2 size={14} /> Emitir Proforma
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Columna Derecha: Previsualización en Marca Blanca */}
                <div className="space-y-6">
                  
                  {/* Tarjeta de Resumen y Valor al Pasajero */}
                  <div className="bg-primary p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col gap-6 select-none border border-white/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-secondary tracking-widest">Resumen de Proforma</h3>
                      <span className="px-2 py-0.5 bg-white/10 text-[8px] font-black uppercase tracking-wider rounded-md border border-white/5">
                        {step === 4 ? "Finalizar" : "Paso Activo"}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-[11px] border-t border-white/10 pt-4 font-bold text-white/70">
                      <div className="flex justify-between items-center">
                        <span>Hotel Seleccionado</span>
                        <span className="font-black text-white truncate max-w-[140px] text-right">{activeHotelCalculation?.hotelName || "Ninguno"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Servicios & Noches Extra</span>
                        <span className="font-black text-white">${(activeHotelCalculation?.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Aéreos Sumados</span>
                        <span className="font-black text-white">
                          ${(!selectedPkg.flightIncluded ? ((parseInt(adultAirfare) || 0) * (cantSGL + cantDBL * 2 + cantTPL * 3) + (parseInt(childAirfare) || 0) * cantCHD) : 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Total Ocultando Ganancia (Marca Blanca) */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase tracking-wider text-secondary">Valor para el Pasajero</span>
                        <span className="block text-2xl font-black text-white">${calculatedTotal.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 rounded-lg border border-white/5">
                        USD Netos
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[8px] text-white/50 text-center font-bold">
                        * Tu ganancia de ${((parseInt(defaultMarkup) || 0) + (parseInt(extraGain) || 0))} USD está sumada e invisible.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Previsualizando PDF en Marca Blanca para ${agencyName}...`)}
                          className="py-3 bg-primary-dark hover:brightness-110 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                        >
                          <Download size={10} /> Descargar PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Enviando Proforma PDF a ${clientEmail || "tu cliente"} en Marca Blanca...`)}
                          className="py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-secondary/10"
                        >
                          <Share2 size={10} /> Compartir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalle y desglose rápido */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-50 pb-2">
                      Resumen del Grupo de Viaje
                    </h4>
                    <div className="space-y-2.5 text-xs font-bold text-primary/70">
                      <div className="flex justify-between">
                        <span className="text-primary/40">Pasajeros:</span>
                        <span>{resumenPasajeros({ cantSGL, cantDBL, cantTPL, cantQUAD, cantCHD })}</span>
                      </div>
                      {cantCHD > 0 && (
                        <div className="flex justify-between">
                          <span className="text-primary/40">Niños Edades:</span>
                          <span>{childAges.join(", ")} Años</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-primary/40">Fecha Salida:</span>
                        <span>{travelDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/40">Markup Configurado:</span>
                        <span>${defaultMarkup} USD</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TABLA 4: HISTORIAL DE COTIZACIONES */}
          {activeTab === "cotizaciones" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fade-scale">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest">
                    Listado de Cotizaciones Generadas
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/40">
                      <Search size={12} />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar por cliente..."
                      className="pl-8 pr-4 py-2 bg-light border border-lighter rounded-xl text-xs font-bold placeholder-primary/30 outline-none w-full md:w-56"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Código</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Cliente</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Programa / Destino</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Hoteles Comparados</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Pax</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Total</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Estado</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-gray-400 tracking-wider">Acción Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-bold text-primary/80">
                    {cotizaciones.map((cot, idx) => (
                      <tr key={idx} className="hover:bg-light/40 transition-colors">
                        <td className="py-4">
                          <span className="font-black text-secondary block">{cot.id}</span>
                          <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{cot.fechaCreacion}</span>
                        </td>
                        <td className="py-4 font-black">{cot.pasajero}</td>
                        <td className="py-4 text-primary/60">{cot.paquete}</td>
                        <td className="py-4 text-primary/50 text-[10px]">{cot.comparedHotels.join(" | ")}</td>
                        <td className="py-4">{cot.pax}</td>
                        <td className="py-4 font-black">${cot.total.toLocaleString()} USD</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 w-fit ${
                            cot.estado === "APROBADA" ? "bg-emerald-50 text-emerald-600" :
                            cot.estado === "BORRADOR" ? "bg-gray-100 text-gray-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              cot.estado === "APROBADA" ? "bg-emerald-500" :
                              cot.estado === "BORRADOR" ? "bg-gray-400" :
                              "bg-amber-500"
                            }`} />
                            {cot.estado}
                          </span>
                        </td>
                        <td className="py-4">
                          {cot.estado === "BORRADOR" || cot.estado === "PENDIENTE" ? (
                            <button
                              onClick={() => handleApproveProforma(cot.id)}
                              className="px-3 py-1.5 bg-secondary hover:bg-secondary-light text-primary font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              Aprobar Hotel
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={12} className="stroke-[2.5]" /> Hotel: {cot.selectedHotel}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLA 5: CONFIGURACIÓN MARCA BLANCA */}
          {activeTab === "marca-blanca" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-scale">
              
              {/* Formulario Marca Blanca */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="border-b border-gray-50 pb-4">
                  <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest">
                    Información Corporativa de tu Agencia
                  </h3>
                  <p className="text-[11px] text-primary/60 font-semibold mt-1">
                    Estos datos y logotipo aparecerán en los encabezados y firmas de todos tus archivos PDF exportados.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre Comercial */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
                        Nombre de la Agencia Minorista
                      </label>
                      <input
                        type="text"
                        disabled={userRole === "COLABORADOR"}
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Teléfono de Contacto */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
                        Teléfono / WhatsApp Corporativo
                      </label>
                      <input
                        type="text"
                        disabled={userRole === "COLABORADOR"}
                        value={agencyPhone}
                        onChange={(e) => setAgencyPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
                        Dirección Física de la Agencia
                      </label>
                      <input
                        type="text"
                        disabled={userRole === "COLABORADOR"}
                        value={agencyAddress}
                        onChange={(e) => setAgencyAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Markup predeterminado */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
                        Comisión / Markup Predeterminado ($ USD)
                      </label>
                      <input
                        type="number"
                        disabled={userRole === "COLABORADOR"}
                        value={defaultMarkup}
                        onChange={(e) => setDefaultMarkup(e.target.value)}
                        className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Logotipo de la Agencia Minorista */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
                        Logotipo Personalizado de tu Agencia (Marca Blanca)
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-light border border-lighter rounded-2xl transition-all">
                        {agencyLogo ? (
                          <div className="relative w-32 h-16 bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-2 shadow-sm">
                            <Image
                              src={agencyLogo}
                              alt="Logotipo de la Agencia"
                              fill
                              className="object-contain p-1"
                            />
                            {userRole !== "COLABORADOR" && (
                              <button
                                type="button"
                                onClick={() => setAgencyLogo(null)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                                title="Eliminar logo"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="w-32 h-16 bg-white border border-dashed border-gray-200 rounded-xl flex items-center justify-center shrink-0 text-gray-400 text-[10px] font-bold">
                            Sin Logotipo
                          </div>
                        )}
                        <div className="flex-grow space-y-1.5 w-full text-left">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={userRole === "COLABORADOR"}
                            id="agency-logo-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setAgencyLogo(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="agency-logo-upload"
                            className={`inline-block px-4 py-2 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-all ${
                              userRole === "COLABORADOR" ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            Seleccionar Archivo
                          </label>
                          <p className="text-[9px] font-bold text-primary/40 leading-tight block">
                            Formatos recomendados: PNG o JPG con fondo transparente o claro. Máx 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => alert("Configuración de Marca Blanca guardada con éxito en tu cuenta.")}
                      disabled={userRole === "COLABORADOR"}
                      className="px-6 py-3.5 bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>

              {/* Previsualización del PDF en Marca Blanca */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Previsualización Proforma
                  </h3>
                  <p className="text-[10px] font-bold text-primary/40 mt-0.5">
                    Así se verá el encabezado de las cotizaciones impresas o exportadas.
                  </p>
                </div>

                <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-[#FAFDFD] space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3 gap-3">
                    <div className="space-y-1.5 min-w-0 flex-grow">
                      {agencyLogo ? (
                        <div className="relative w-28 h-10 mb-1 flex items-center">
                          <img
                            src={agencyLogo}
                            alt="Agency Logo"
                            className="max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-[14px] font-black text-primary uppercase tracking-wider truncate">
                          {agencyName}
                        </div>
                      )}
                      <div>
                        <p className="text-[8px] font-bold text-primary/50 leading-tight">
                          {agencyAddress}
                        </p>
                        <p className="text-[8px] font-bold text-primary/50 leading-none mt-0.5">
                          Telf: {agencyPhone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-black text-secondary uppercase tracking-widest">
                        Cotización
                      </span>
                      <span className="block text-[8px] font-bold text-primary/40 mt-0.5">
                        COT-2024-001
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-bold text-primary/70">
                      <span>Destino:</span>
                      <span>Panamá Ciudad + Playa</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-primary/70">
                      <span>Pasajeros:</span>
                      <span>2 Adultos</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-primary border-t border-gray-100 pt-2">
                      <span>Total Neto (con Markup)</span>
                      <span>${(1738 + (parseInt(defaultMarkup) || 0)).toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[10px] font-bold text-primary/60 leading-relaxed border-t border-gray-50 pt-4">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-secondary shrink-0" />
                    <span>Markup/Comisión oculto y sumado al precio final.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-secondary shrink-0" />
                    <span>Tu cliente final nunca verá el nombre de Land Tour.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── 3. MODAL NATIVO APROBACIÓN DE HOTEL / COTIZACIÓN DEFINITIVA ─── */}
      {isApproveOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm w-full h-full border-none outline-none"
          onClick={() => setIsApproveOpen(false)}
        >
          <div
            className="bg-white p-6 md:p-8 rounded-[32px] w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-6 animate-fade-scale select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-primary font-black text-xl tracking-tight">Seleccionar Hotel Definitivo</h3>
              <p className="text-xs text-primary/50 font-semibold mt-1">
                Para liquidar y generar la cotización final de {selectedApproveQuoteId}, elige el hotel elegido por el cliente.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">Hoteles Cotizados</label>
              <select
                value={definitiveHotel}
                onChange={(e) => setDefinitiveHotel(e.target.value)}
                className="w-full px-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-pointer"
              >
                {cotizaciones.find(c => c.id === selectedApproveQuoteId)?.comparedHotels.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsApproveOpen(false)}
                className="px-5 py-2.5 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitApprove}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-primary font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Generar Cotización Final
              </button>
            </div>
          </div>
        </dialog>
      )}

    </div>
  );
}


