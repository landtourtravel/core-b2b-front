"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Lock, Mail, ArrowRight } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Sincronizar estado del diálogo nativo ──
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  // ── Manejo de tecla Escape ──
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Correo de recuperación enviado a ${email}. Contacta al administrador para habilitar tu clave temporal.`);
      setEmail("");
      onClose();
    }, 1200);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="p-4 backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent border-none outline-none overflow-visible"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 md:p-10 border border-gray-100 flex flex-col select-none animate-fade-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-full transition-all border border-gray-100 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center text-secondary relative shadow-inner">
            <Lock size={28} className="stroke-[2.5]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-primary font-black text-2xl tracking-tight">
            Recuperar Contraseña
          </h3>
          <p className="mt-2 text-primary/60 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
            Ingresa tu correo corporativo y solicitaremos al administrador que genere una nueva clave temporal para ti.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase text-primary/40 tracking-wider">
              Correo Electrónico Corporativo
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
                placeholder="tu.correo@landtour.com"
                className="w-full pl-11 pr-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-grow px-4 py-3.5 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] text-center shadow-lg shadow-secondary/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  Solicitar Cambio
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
