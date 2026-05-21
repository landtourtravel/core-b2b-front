import { NextResponse } from 'next/server';
import { MOCK_PACKAGES } from '../../../../services/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const pkg = MOCK_PACKAGES.find(p => p.id.toString() === id);

  if (!pkg) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 });
  }

  // Simular un pequeño retraso de red
  await new Promise(resolve => setTimeout(resolve, 400));

  return NextResponse.json(pkg);
}
