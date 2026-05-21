"use client";

import React from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@land-tour/ui';

export const SearchBox = () => {
  return (
    <div className="container mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border border-lighter grid md:grid-cols-4 gap-6 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-primary/60 flex items-center gap-2">
            <MapPin size={16} /> Destino
          </label>
          <select className="bg-light p-3 rounded-xl border-none focus:ring-2 focus:ring-secondary text-primary font-medium appearance-none outline-none">
            <option>Todos los destinos</option>
            <option>Cancún, México</option>
            <option>Punta Cana, Rep. Dominicana</option>
            <option>Cartagena, Colombia</option>
            <option>Madrid, España</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-primary/60 flex items-center gap-2">
            <Calendar size={16} /> Temporada
          </label>
          <select className="bg-light p-3 rounded-xl border-none focus:ring-2 focus:ring-secondary text-primary font-medium appearance-none outline-none">
            <option>Cualquier fecha</option>
            <option>Verano 2026</option>
            <option>Otoño 2026</option>
            <option>Invierno 2026</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-primary/60 flex items-center gap-2">
            <Users size={16} /> Personas
          </label>
          <select className="bg-light p-3 rounded-xl border-none focus:ring-2 focus:ring-secondary text-primary font-medium appearance-none outline-none">
            <option>1 Adulto</option>
            <option>2 Adultos</option>
            <option>Familia (3+)</option>
            <option>Grupo (10+)</option>
          </select>
        </div>

        <Button size="lg" className="h-[52px] bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light flex items-center gap-2 font-bold tracking-wide">
          <Search size={20} />
          BUSCAR AHORA
        </Button>
      </div>
    </div>
  );
};
