import { Package, Destino } from "@land-tour/shared";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

async function safeFetch<T>(url: string): Promise<{ data: T | null; error: "DB_FAIL" | "EMPTY" | null }> {
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 503) return { data: null, error: "DB_FAIL" };
  if (!res.ok)            return { data: null, error: "DB_FAIL" };

  const json = await res.json();

  if (Array.isArray(json) && json.length === 0) return { data: json as T, error: "EMPTY" };
  return { data: json as T, error: null };
}

export const api = {
  getPackages: async (params?: { country?: string; city?: string }): Promise<Package[]> => {
    const url = new URL(`${getBaseUrl()}/api/packages`);
    if (params?.country) url.searchParams.append("country", params.country);
    if (params?.city)    url.searchParams.append("city",    params.city);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(res.status === 503 ? "DB_FAIL" : "FETCH_ERROR");
    return res.json();
  },

  getPackagesDetailed: async (
    params?: {
      country?: string;
      city?: string;
      destino?: string;
      adultos?: number;
      ninos?: number;
      incluyeBoleto?: boolean;
      precioMin?: number;
      precioMax?: number;
    }
  ): Promise<{ data: Package[]; error: "DB_FAIL" | "EMPTY" | null }> => {
    const url = new URL(`${getBaseUrl()}/api/packages`);
    if (params?.country)  url.searchParams.append("country",  params.country);
    if (params?.city)     url.searchParams.append("city",     params.city);
    if (params?.destino)  url.searchParams.append("destino",  params.destino);
    if (params?.adultos)  url.searchParams.append("adultos",  String(params.adultos));
    if (params?.ninos)    url.searchParams.append("ninos",    String(params.ninos));
    if (params?.incluyeBoleto !== undefined)
      url.searchParams.append("incluyeBoleto", String(params.incluyeBoleto));
    if (params?.precioMin) url.searchParams.append("precioMin", String(params.precioMin));
    if (params?.precioMax) url.searchParams.append("precioMax", String(params.precioMax));

    const result = await safeFetch<Package[]>(url.toString());
    return { data: (result.data as Package[]) ?? [], error: result.error };
  },

  getPackageById: async (id: string | number): Promise<Package> => {
    const res = await fetch(`${getBaseUrl()}/api/packages/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Not found");
    return res.json();
  },

  getDestinations: async (): Promise<Destino[]> => {
    const res = await fetch(`${getBaseUrl()}/api/destinations`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status === 503 ? "DB_FAIL" : "FETCH_ERROR");
    return res.json();
  },

  getDestinationsDetailed: async (): Promise<{ data: Destino[]; error: "DB_FAIL" | "EMPTY" | null }> => {
    const result = await safeFetch<Destino[]>(`${getBaseUrl()}/api/destinations`);
    return { data: (result.data as Destino[]) ?? [], error: result.error };
  },
};
