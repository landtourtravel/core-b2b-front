import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@land-tour/shared';

export const dynamic = 'force-dynamic';

// TODO: reemplazar con query Prisma directa a la DB
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Package | { error: string }>> {
  const { id } = await params;

  // Placeholder: sin datos hasta conectar Prisma
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
