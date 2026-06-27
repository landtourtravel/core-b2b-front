"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, LogOut, ShieldCheck } from "lucide-react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  secondsLeft: number;
  onContinue: () => void;
  onSignOut: () => void;
}

/**
 * Aviso de cierre de sesión por inactividad.
 * No se cierra con Escape ni con click en el backdrop: el usuario debe decidir
 * conscientemente entre "Continuar sesión" o "Cerrar sesión ahora".
 */
export function SessionTimeoutModal({
  isOpen,
  secondsLeft,
  onContinue,
  onSignOut,
}: SessionTimeoutModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Bloqueo de scroll del fondo mientras el aviso está visible.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm font-inter"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(5,41,36,0.5)] border border-white/20 p-7 flex flex-col items-center text-center animate-fade-scale">
        {/* Ícono */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/15 text-gold mb-5">
          <Clock size={30} className="stroke-[2.5]" />
          <span className="absolute inset-0 rounded-2xl ring-2 ring-gold/30 animate-pulse" />
        </div>

        <h2
          id="session-timeout-title"
          className="text-lg font-black text-primary tracking-tight"
        >
          ¿Sigues ahí?
        </h2>
        <p className="mt-2 text-xs font-semibold text-primary/60 leading-relaxed max-w-[280px]">
          Tu sesión se cerrará por inactividad en
        </p>

        {/* Countdown */}
        <div className="my-5 flex flex-col items-center">
          <span className="text-5xl font-black tabular-nums text-primary tracking-tight">
            {mm}:{ss}
          </span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary/40">
            Minutos : Segundos
          </span>
        </div>

        {/* Acciones */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-secondary/15 cursor-pointer"
          >
            <ShieldCheck size={15} className="stroke-[2.5]" />
            Continuar sesión
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-3 bg-white hover:bg-gray-50 text-primary/70 hover:text-primary font-black text-xs uppercase tracking-wider rounded-2xl border border-gray-200/80 hover:border-primary/20 transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={15} className="stroke-[2.5]" />
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
