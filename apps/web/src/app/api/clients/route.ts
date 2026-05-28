import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clients?email=&documento= — busca cliente existente
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const email     = searchParams.get("email");
  const documento = searchParams.get("documento");

  if (!email && !documento) return NextResponse.json(null);

  try {
    const cliente = await prisma.cliente.findFirst({
      where: {
        agenciaId: session.user.agenciaId,
        OR: [
          email     ? { email }     : undefined,
          documento ? { documento } : undefined,
        ].filter(Boolean) as any,
      },
    });
    return NextResponse.json(cliente);
  } catch (err) {
    console.error("GET /api/clients:", err);
    return NextResponse.json(null);
  }
}

// POST /api/clients — crea o devuelve cliente existente (upsert por email o documento)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { nombre, email, telefono, documento, direccion } = body;

  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const agenciaId = session.user.agenciaId;

  try {
    // Intentar encontrar cliente existente por email o documento
    let cliente = null;
    if (email) {
      cliente = await prisma.cliente.findUnique({
        where: { agenciaId_email: { agenciaId, email } },
      });
    }
    if (!cliente && documento) {
      cliente = await prisma.cliente.findUnique({
        where: { agenciaId_documento: { agenciaId, documento } },
      });
    }

    if (cliente) {
      // Actualizar datos si cambiaron
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: { nombre, telefono: telefono || cliente.telefono, direccion: direccion || cliente.direccion },
      });
    } else {
      cliente = await prisma.cliente.create({
        data: { agenciaId, nombre, email: email || null, telefono: telefono || null, documento: documento || null, direccion: direccion || null },
      });
    }

    return NextResponse.json(cliente);
  } catch (err) {
    console.error("POST /api/clients:", err);
    return NextResponse.json({ error: "Error al guardar cliente" }, { status: 500 });
  }
}
