import { Package, Destino } from '@land-tour/shared';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export const api = {
  getPackages: async (params?: { country?: string; city?: string }): Promise<Package[]> => {
    const url = new URL(`${getBaseUrl()}/api/packages`);
    if (params?.country) url.searchParams.append('country', params.country);
    if (params?.city) url.searchParams.append('city', params.city);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  getPackageById: async (id: string | number): Promise<Package> => {
    const res = await fetch(`${getBaseUrl()}/api/packages/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch package details');
    return res.json();
  },

  getDestinations: async (): Promise<Destino[]> => {
    const res = await fetch(`${getBaseUrl()}/api/destinations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch destinations');
    return res.json();
  },
};
