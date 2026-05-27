"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { RequestAccessModal } from "@/components/RequestAccessModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simular autenticación local de prueba
    setTimeout(() => {
      setIsLoading(false);
      if (email.trim() === "" || password.trim() === "") {
        setError("Por favor completa todos los campos.");
        return;
      }
      
      // Simular login exitoso
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark flex items-center justify-center p-4 md:p-6 font-inter select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent pointer-events-none" />

      <main className="relative w-full max-w-md bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(5,41,36,0.5)] border border-white/20 p-8 md:p-10 flex flex-col z-10 animate-fade-scale">
        
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
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. usuario@agencia.com"
                className="w-full pl-11 pr-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-12 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary/35 hover:text-primary/70 transition-colors cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Acciones Adicionales */}
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <label className="flex items-center gap-2 text-primary/60 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded-lg border-lighter bg-light text-secondary focus:ring-secondary/40 outline-none cursor-pointer"
              />
              Mantener sesión
            </label>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-secondary hover:underline cursor-pointer"
            >
              ¿Olvidaste tu clave?
            </button>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-secondary/15 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <>
                <Lock size={14} className="stroke-[2.5]" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Pie de Página */}
        <div className="mt-8 pt-6 border-t border-gray-100/80 text-center text-xs font-semibold text-primary/60">
          ¿No tienes una cuenta activa?{" "}
          <button
            type="button"
            onClick={() => setIsRequestAccessOpen(true)}
            className="text-secondary font-black hover:underline cursor-pointer"
          >
            Solicitar Acceso
          </button>
        </div>

      </main>

      {/* Modales */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
      />
    </div>
  );
}
