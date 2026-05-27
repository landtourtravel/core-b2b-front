"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, User, Mail, Building, FileText, Briefcase, Phone, UserPlus, Globe, Map } from "lucide-react";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface RequestAccessForm {
  fullName: string;
  ruc: string;
  idNumber: string;
  email: string;
  tourismRegistry: string;
  socialMedia: string;
  phone: string;
  country: string;
  city: string;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const [formData, setFormData] = useState<RequestAccessForm>({
    fullName: "",
    ruc: "",
    idNumber: "",
    email: "",
    tourismRegistry: "",
    socialMedia: "",
    phone: "",
    country: "",
    city: "",
  });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Solicitud de Acceso:", formData);
      alert(`Solicitud enviada para la agencia. Tus datos han sido registrados bajo el RUC ${formData.ruc}. El administrador evaluará tu solicitud.`);
      // Resetear
      setFormData({
        fullName: "",
        ruc: "",
        idNumber: "",
        email: "",
        tourismRegistry: "",
        socialMedia: "",
        phone: "",
        country: "",
        city: "",
      });
      onClose();
    }, 1500);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="p-4 backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent border-none outline-none overflow-visible"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 md:p-10 border border-gray-100 flex flex-col select-none animate-fade-scale"
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

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center text-secondary relative shadow-inner">
            <UserPlus size={24} className="stroke-[2.5]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-primary font-black text-2xl tracking-tight">
            Solicitar Acceso al Portal
          </h3>
          <p className="mt-1 text-primary/60 text-xs font-semibold leading-relaxed max-w-md mx-auto">
            Completa tus datos profesionales y corporativos. Un administrador validará la información de turismo para asignarte credenciales.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            
            {/* Nombres y apellidos */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Nombres y Apellidos *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Ej. Ana Córdova"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* RUC / NIT / ID Empresarial */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                RUC / NIT / ID Empresarial *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Briefcase size={14} />
                </span>
                <input
                  type="text"
                  name="ruc"
                  required
                  value={formData.ruc}
                  onChange={handleInputChange}
                  placeholder="Ej. 0993387686001"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Identificación personal / C.I */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Identificación Personal / C.I *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <FileText size={14} />
                </span>
                <input
                  type="text"
                  name="idNumber"
                  required
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Ej. 0912345678"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Correo de la empresa */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Correo de la Empresa *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej. corporativo@viajes.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Registro de turismo */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Registro de Turismo *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Building size={14} />
                </span>
                <input
                  type="text"
                  name="tourismRegistry"
                  required
                  value={formData.tourismRegistry}
                  onChange={handleInputChange}
                  placeholder="Ej. REG-TUR-2024-XXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Redes Sociales (Sitio Web, Instagram)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Globe size={14} />
                </span>
                <input
                  type="text"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  placeholder="Ej. @miagenciadeviajes"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Teléfono de contacto */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Teléfono de Contacto *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej. +593 912345678"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* País */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                País *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Map size={14} />
                </span>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Ej. Ecuador"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Ciudad */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[9px] font-black uppercase text-primary/40 tracking-wider">
                Ciudad *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/40">
                  <Map size={14} />
                </span>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ej. Guayaquil"
                  className="w-full pl-10 pr-4 py-2.5 bg-light border border-lighter text-primary rounded-xl text-xs font-bold placeholder-primary/30 outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                />
              </div>
            </div>

          </div>

          <div className="flex gap-4 pt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-secondary hover:bg-secondary-light text-primary font-black text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.97] shadow-lg shadow-secondary/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={14} />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
