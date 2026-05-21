import { Package, Destino } from '@land-tour/shared';

// En el cliente, usamos el hostname actual para que funcione en red local (ej. desde el móvil)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getBaseUrl();

export const api = {
  getPackages: async (params?: { country?: string; city?: string }): Promise<Package[]> => {
    const url = new URL(`${API_BASE_URL}/packages`);
    if (params?.country) url.searchParams.append('country', params.country);
    if (params?.city) url.searchParams.append('city', params.city);
    
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  getPackageById: async (id: string | number): Promise<Package> => {
    const res = await fetch(`${API_BASE_URL}/packages/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch package details');
    return res.json();
  },

  getDestinations: async (): Promise<Destino[]> => {
    const res = await fetch(`${API_BASE_URL}/destinations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch destinations');
    return res.json();
  },
};
