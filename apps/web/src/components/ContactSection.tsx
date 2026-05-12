"use client";

import React, { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  package: string;
  message: string;
}

// ─── Contact Info Item ────────────────────────────────────────────────────────

const ContactItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}> = ({ icon, label, value, href }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-primary/40 text-xs font-semibold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className="text-primary font-semibold text-sm hover:text-secondary transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-primary font-semibold text-sm">{value}</p>
      )}
    </div>
  </div>
);

// ─── Input / Textarea shared classes ─────────────────────────────────────────

const inputCls = `
  w-full px-4 py-3 rounded-2xl border border-primary/10
  bg-light text-primary text-sm placeholder:text-primary/30
  outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50
  transition-all duration-200
`.trim();

// ─── Component ────────────────────────────────────────────────────────────────

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    package: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to API / email service
    console.log("Form submitted:", form);
  };

  return (
    <section className="py-20 sm:py-28 bg-white" id="contacto">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ── Section header (brand standard) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-secondary/15 text-secondary text-xs font-bold rounded-lg mb-4 uppercase tracking-widest">
            Contáctanos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
            Estamos aquí para{" "}
            <span className="relative">
              ayudarte
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/40 rounded-full" />
            </span>
          </h2>
          <p className="mt-4 text-primary/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            ¿Tienes preguntas sobre algún paquete? Escríbenos y un asesor te
            conectará con la agencia más cercana.
          </p>
        </motion.div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">

          {/* ── Left: Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-8"
          >

            {/* Contact items */}
            <div className="flex flex-col gap-6">
              <ContactItem
                icon={<Mail size={18} className="text-secondary" strokeWidth={1.75} />}
                label="Correo"
                value="info@landtourtravel.com"
                href="mailto:info@landtourtravel.com"
              />
              <ContactItem
                icon={<MapPin size={18} className="text-secondary" strokeWidth={1.75} />}
                label="Dirección"
                value="Guayaquil, Ecuador"
              />
            </div>

            {/* Decorative card */}
            <div className="hidden lg:block rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 text-white">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                ¿Eres agencia?
              </p>
              <p className="font-extrabold text-xl leading-snug mb-3">
                Accede a tarifas exclusivas de mayorista
              </p>
              <p className="text-white/80 text-sm leading-relaxed">
                Regístrate en nuestra plataforma B2B y empieza a cotizar paquetes
                al instante con márgenes competitivos.
              </p>
            </div>
          </motion.div>

          {/* ── Right: Form card ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-lighter p-8 sm:p-10"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                className={inputCls}
                required
                autoComplete="name"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className={inputCls}
                required
                autoComplete="email"
              />

              <input
                type="text"
                name="package"
                value={form.package}
                onChange={handleChange}
                placeholder="Paquete de interés"
                className={inputCls}
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tu mensaje"
                rows={5}
                className={`${inputCls} resize-none`}
                required
              />

              <button
                type="submit"
                className="
                  w-full flex items-center justify-center gap-2.5
                  bg-primary hover:bg-primary-light active:scale-95
                  text-white font-bold text-sm
                  py-3.5 rounded-full
                  transition-all duration-200 shadow-md hover:shadow-lg
                  mt-2
                "
              >
                <Send size={16} strokeWidth={2} />
                Enviar mensaje
              </button>

            </form>
          </motion.div>

        </div>
      </div>
    </section>

  );
};
