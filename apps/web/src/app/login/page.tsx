"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { RequestAccessModal } from "@/components/RequestAccessModal";

// Componente interno — usa useSearchParams(), necesita Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validar que el callbackUrl sea una ruta relativa del mismo origen
  // (evita open-redirect a sitios externos).
  const safeCallbackUrl = (() => {
    const raw = searchParams.get("callbackUrl") || "/panel";
    if (raw.startsWith("//") || raw.includes("://") || !raw.startsWith("/")) {
      return "/panel";
    }
    return raw;
  })();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(
    () => searchParams.get("access") === "1"
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      remember: String(rememberMe), // "true" | "false" — controla la duración de la sesión
      redirect: false,
    });

    if (!result?.ok || result.error) {
      // Solo en error reactivamos el formulario y mostramos el mensaje.
      setIsLoading(false);
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
      return;
    }

    // Login exitoso: mantenemos el spinner y el botón deshabilitado
    // hasta que Next.js complete la navegación. El usuario será
    // redirigido y no volverá a ver el formulario, así que NO apagamos isLoading.
    router.replace(safeCallbackUrl);
    router.refresh();
  };

  return (
    <main className="relative w-full max-w-md bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(5,41,36,0.5)] border border-white/20 p-8 md:p-10 flex flex-col z-10 animate-fade-scale select-none">

      {/* Volver — solo móvil */}
      <Link
        href="/"
        className="sm:hidden self-start flex items-center gap-1.5 text-primary/40 hover:text-primary/70 text-[10px] font-black uppercase tracking-wider transition-colors mb-5"
      >
        ← Inicio
      </Link>

      {/* Cabecera / Logo */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="relative w-36 h-12 transition-transform duration-300 hover:scale-105" aria-label="Inicio Land Tour Travel">
          <Image
            src="/images/lttlogo.png"
            alt="Land Tour Travel Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <div className="mt-6 text-center">
          <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-lg mb-2">
            Portal Colaboradores
          </span>
          <h1 className="text-primary font-black text-2xl md:text-3xl tracking-tight leading-none mt-1">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-primary/60 text-xs font-semibold max-w-[280px] mx-auto leading-relaxed">
            Ingresa tus credenciales para acceder a tu panel de trabajo.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleLoginSubmit}
        aria-busy={isLoading}
        className={`space-y-5 ${isLoading ? "pointer-events-none" : ""}`}
      >

        {/* Error de autenticación */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Campo Correo */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-primary/40">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@landtour.com"
              className="w-full pl-11 pr-4 py-3.5 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-primary/40">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full pl-11 pr-12 py-3.5 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary/40 hover:text-primary transition-colors disabled:cursor-not-allowed"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Checkbox y olvido */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              disabled={isLoading}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary/40 accent-secondary transition-all disabled:cursor-not-allowed"
            />
            <span className="text-[11px] font-bold text-primary/70 group-hover:text-primary transition-colors">
              Mantener sesión iniciada
            </span>
          </label>
          <button
            type="button"
            onClick={() => setIsForgotOpen(true)}
            className="text-[11px] font-black text-secondary hover:text-secondary-light transition-colors"
          >
            ¿Olvidaste tu clave?
          </button>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-4 bg-secondary hover:bg-secondary-light text-primary font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-secondary/15 hover:shadow-glow cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Lock size={14} className="stroke-[2.5]" />
              Iniciar Sesión
            </>
          )}
        </button>
      </form>

      {/* Separador */}
      <div className="relative my-7 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative w-2 h-2 rounded-full border-2 border-gray-200 bg-white" />
      </div>

      {/* Pie de Tarjeta */}
      <div className="bg-light border border-lighter rounded-[24px] p-5 text-center flex flex-col items-center">
        <div className="text-secondary mb-1.5 flex items-center justify-center">
          <AlertCircle size={20} className="stroke-[2.5]" />
        </div>
        <h2 className="text-xs font-black text-primary uppercase tracking-wider">
          ¿No tienes cuenta?
        </h2>
        <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-primary/60 leading-relaxed max-w-[280px]">
          Los accesos son gestionados exclusivamente por el administrador del sistema. Si necesitas acceso, contacta a tu supervisor.
        </p>
        <button
          onClick={() => setIsRequestAccessOpen(true)}
          type="button"
          className="mt-3 px-5 py-2.5 bg-white text-primary text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-200/80 hover:border-primary/20 hover:bg-gray-50/50 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          Solicitar Acceso
        </button>
      </div>

      <p className="mt-8 text-center text-[9px] font-bold text-primary/30 uppercase tracking-widest leading-none">
        © {new Date().getFullYear()} Land Tour & Travel SAS. Todos los derechos reservados.
      </p>

      {/* Modales */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
      />
    </main>
  );
}

// Page wrapper — Suspense requerido por useSearchParams() en Next.js 15
export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-primary-dark via-primary to-primary-dark/95 flex items-center justify-center p-4 overflow-hidden font-montserrat">

      {/* Botón de regreso — solo desktop (en móvil interfiere con el form centrado) */}
      <div className="hidden sm:block absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 text-xs font-bold active:scale-95"
        >
          ← Volver al Inicio
        </Link>
      </div>

      {/* Decoraciones de fondo */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-light/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-[36px] shadow-lg p-10 flex items-center justify-center">
          <Loader2 className="animate-spin text-secondary" size={28} />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
