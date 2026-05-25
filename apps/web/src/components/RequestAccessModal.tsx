"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  X, User, Mail, Briefcase, FileText, Phone, UserPlus,
  Globe, MapPin, Shield, Share2,
} from "lucide-react";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface RequestAccessForm {
  fullName:        string; // Nombres y apellidos
  ruc:             string; // RUC / NIT / ID Empresarial
  idNumber:        string; // Identificación personal / C.I.
  email:           string; // Correo de la empresa
  tourismRegistry: string; // Registro de turismo
  socialMedia:     string; // Redes Sociales
  phone:           string; // Teléfono de contacto
  country:         string; // País
  city:            string; // Ciudad
}

const EMPTY_FORM: RequestAccessForm = {
  fullName: "", ruc: "", idNumber: "", email: "",
  tourismRegistry: "", socialMedia: "", phone: "", country: "", city: "",
};

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<RequestAccessForm>(EMPTY_FORM);

  // Sync native dialog with isOpen
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => { e.preventDefault(); onClose(); };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = [
      `Nombre: ${formData.fullName}`,
      `Email: ${formData.email}`,
      `Teléfono: ${formData.phone}`,
      `C.I.: ${formData.idNumber}`,
      `RUC/NIT: ${formData.ruc}`,
      `Registro Turismo: ${formData.tourismRegistry}`,
      `País / Ciudad: ${formData.country}, ${formData.city}`,
      `Redes Sociales: ${formData.socialMedia}`,
    ].join("\n");
    alert(
      `Solicitud enviada exitosamente.\n\n${summary}\n\n` +
      `Un administrador validará tu información y te asignará credenciales en 24-48 horas.`
    );
    setFormData(EMPTY_FORM);
    onClose();
  };

  // ── Field definitions ───────────────────────────────────────────────────────
  const fields: Array<{
    name: keyof RequestAccessForm;
    label: string;
    placeholder: string;
    type: string;
    required: boolean;
    icon: React.ReactNode;
    colSpan?: boolean;
  }> = [
    { name: "fullName",        label: "Nombres y Apellidos",         placeholder: "Ej. Juan Andrés Pérez",        type: "text",  required: true,  icon: <User size={15} /> },
    { name: "email",           label: "Correo de la Empresa",        placeholder: "info@agencia.com",              type: "email", required: true,  icon: <Mail size={15} /> },
    { name: "phone",           label: "Teléfono de Contacto",        placeholder: "+593 912 345 678",              type: "tel",   required: true,  icon: <Phone size={15} /> },
    { name: "idNumber",        label: "Identificación / C.I.",       placeholder: "Ej. 0912345678",                type: "text",  required: true,  icon: <FileText size={15} /> },
    { name: "ruc",             label: "RUC / NIT / ID Empresarial",  placeholder: "Ej. 0993387686001",             type: "text",  required: true,  icon: <Briefcase size={15} /> },
    { name: "tourismRegistry", label: "Registro de Turismo",         placeholder: "Ej. MINTUR-2024-001",           type: "text",  required: false, icon: <Shield size={15} /> },
    { name: "country",         label: "País",                        placeholder: "Ej. Ecuador",                   type: "text",  required: true,  icon: <Globe size={15} /> },
    { name: "city",            label: "Ciudad",                      placeholder: "Ej. Guayaquil",                 type: "text",  required: true,  icon: <MapPin size={15} /> },
    { name: "socialMedia",     label: "Redes Sociales",              placeholder: "@agencia_turismo o URL",        type: "text",  required: false, icon: <Share2 size={15} />, colSpan: true },
  ];

  return (
    <dialog ref={dialogRef} onClick={handleDialogClick} className="p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col select-none max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 z-10 p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-full transition-all border border-gray-100 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-6 border-b border-gray-50">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
              <UserPlus size={26} className="stroke-[2.5]" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-primary font-black text-2xl tracking-tight leading-tight">
              Solicitar Acceso al Portal
            </h3>
            <p className="mt-2 text-primary/55 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
              Completa los datos profesionales de tu agencia. El administrador validará la información para asignarte credenciales de acceso.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-1.5 ${field.colSpan ? "md:col-span-2" : ""}`}
              >
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary/40 tracking-wider">
                  {field.label}
                  {field.required && <span className="text-secondary">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/35 pointer-events-none">
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-light border border-lighter text-primary rounded-2xl text-xs sm:text-sm font-bold placeholder-primary/25 outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:border-secondary focus-visible:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-secondary/5 border border-secondary/15 rounded-2xl">
            <Shield size={13} className="text-secondary mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-primary/60 leading-relaxed">
              Tu información será tratada con confidencialidad. Solo el administrador de Land Tour Travel tendrá acceso a estos datos para validar tu registro como agencia minorista autorizada.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-7 py-3.5 bg-light hover:bg-gray-100 text-primary border border-lighter font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-secondary hover:bg-secondary-light text-primary font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={14} />
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
