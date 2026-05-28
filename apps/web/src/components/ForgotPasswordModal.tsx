"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Mail, Send, Lock, Loader2, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dialogRef   = useRef<HTMLDialogElement>(null);
  const [email, setEmail]       = useState("");
  const [isLoading, setLoading] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Sincronizar estado del diálogo nativo ──
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Evitar salto de layout bloqueando el scroll del body
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      // Abrir modal de forma nativa
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

  // ── Manejo de tecla Escape (cierre nativo del navegador) ──
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

  // ── Cerrar al hacer clic en el fondo del backdrop ──
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar solicitud");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="p-4"
    >
      {/* Contenedor del Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 border border-gray-100 flex flex-col select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-full transition-all border border-gray-100"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* Icono Circular de Candado */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center text-secondary relative shadow-inner animate-pulse">
            <Lock size={28} className="stroke-[2.5]" />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary border-2 border-white rounded-full" />
          </div>
        </div>

        {/* Textos */}
        <div className="text-center mb-6">
          <h3 className="text-primary font-black text-2xl tracking-tight">
            Recuperar Contraseña
          </h3>
          <p className="mt-2 text-primary/60 text-xs sm:text-sm font-medium leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
            Ingresa tu correo corporativo y solicitaremos al administrador que genere una nueva clave temporal para ti.
          </p>
        </div>

        {/* Formulario / Éxito */}
        {success ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={40} className="text-secondary" />
            <p className="text-center text-sm font-bold text-primary/70 leading-relaxed">
              Solicitud enviada al administrador. Recibirás tus nuevas credenciales pronto.
            </p>
            <button onClick={onClose} className="mt-2 px-8 py-3 bg-secondary text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-xs font-bold text-red-500 text-center">{error}</p>
            )}
            <div className="space-y-2">
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
                  className="w-full pl-11 pr-4 py-3.5 bg-light border border-lighter text-primary rounded-2xl text-sm font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-3.5 px-6 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-secondary/15 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {isLoading ? "Enviando..." : "Solicitar Cambio"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
};
