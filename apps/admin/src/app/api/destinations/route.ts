import { NextResponse } from 'next/server';
import { MOCK_DESTINOS } from '@/services/mockData';

export async function GET() {
  // Simular un pequeño retraso de red
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(MOCK_DESTINOS);
}
