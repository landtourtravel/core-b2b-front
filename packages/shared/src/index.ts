export * from './types';
export * from './constants';

export function calcularSubtotal(
  rooms: {
    cantSGL: number;
    cantDBL: number;
    cantTPL: number;
    cantQUAD: number;
    cantCHD: number;
  },
  prices: {
    precioSGL: number;
    precioDBL: number;
    precioTPL: number;
    precioQUAD: number;
    precioCHD: number;
  }
): number {
  return (
    (rooms.cantSGL || 0) * (prices.precioSGL || 0) * 1 +
    (rooms.cantDBL || 0) * (prices.precioDBL || 0) * 2 +
    (rooms.cantTPL || 0) * (prices.precioTPL || 0) * 3 +
    (rooms.cantQUAD || 0) * (prices.precioQUAD || 0) * 4 +
    (rooms.cantCHD || 0) * (prices.precioCHD || 0) * 1
  );
}

export function resumenPasajeros(rooms: {
  cantSGL: number;
  cantDBL: number;
  cantTPL: number;
  cantQUAD: number;
  cantCHD: number;
}): string {
  const parts: string[] = [];
  if (rooms.cantSGL > 0) parts.push(`${rooms.cantSGL} SGL`);
  if (rooms.cantDBL > 0) parts.push(`${rooms.cantDBL} DBL`);
  if (rooms.cantTPL > 0) parts.push(`${rooms.cantTPL} TPL`);
  if (rooms.cantQUAD > 0) parts.push(`${rooms.cantQUAD} QUAD`);
  if (rooms.cantCHD > 0) parts.push(`${rooms.cantCHD} CHD`);
  return parts.length > 0 ? parts.join(" + ") : "0 PAX";
}
