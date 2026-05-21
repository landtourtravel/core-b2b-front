import { NextResponse } from 'next/server';
import { MOCK_PACKAGES } from '../../../services/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const city = searchParams.get('city');

  let filtered = [...MOCK_PACKAGES];

  if (country) {
    filtered = filtered.filter(p => p.location.country.toLowerCase() === country.toLowerCase());
  }

  if (city) {
    filtered = filtered.filter(p => p.location.city.toLowerCase() === city.toLowerCase());
  }

  // Simular un pequeño retraso de red
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(filtered);
}
