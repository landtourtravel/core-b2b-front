import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { GENERIC_CLIENT_EMAIL } from "@/lib/constants";

// El GET de búsqueda por correo/documento se eliminó junto con el autocompletado del Paso 1:
// su único uso era rellenar el formulario con los datos guardados de una cotización anterior.
// Los datos del cliente se escriben siempre a mano en cada cotización.

// POST /api/clients — crea o devuelve cliente existente (upsert por email o documento)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { nombre, email, telefono, documento, direccion } = body;

  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  // El correo genérico solo lo asigna POST /api/cotizaciones/quick para el cliente
  // placeholder compartido de la agencia — nunca debe llegar aquí desde el wizard normal.
  // Si se permitiera, el find-or-create de abajo reutilizaría y sobreescribiría ese
  // registro compartido con datos de un cliente real, corrompiéndolo para el resto de
  // cotizaciones rápidas de la agencia.
  if (typeof email === "string" && email.trim().toLowerCase() === GENERIC_CLIENT_EMAIL) {
    return NextResponse.json(
      { error: "Ingresa el correo real del cliente para guardar esta cotización." },
      { status: 400 }
    );
  }

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
      // La ficha queda EXACTAMENTE con lo que el asesor escribió en el Paso 1: un campo
      // que mandó vacío se limpia, no se rellena con lo que tuviera guardado de una
      // cotización anterior. Si no, el documento terminaba mostrando teléfonos/direcciones
      // que el asesor nunca ingresó en esa cotización.
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          nombre,
          telefono:  telefono  !== undefined ? (telefono  || null) : cliente.telefono,
          direccion: direccion !== undefined ? (direccion || null) : cliente.direccion,
          documento: documento !== undefined ? (documento || null) : cliente.documento,
        },
      });
    } else {
      cliente = await prisma.cliente.create({
        data: { agenciaId, nombre, email: email || null, telefono: telefono || null, documento: documento || null, direccion: direccion || null },
      });
    }

    return NextResponse.json(cliente);
  } catch (err) {
    logError("POST /api/clients", err);
    return NextResponse.json({ error: "Error al guardar cliente" }, { status: 500 });
  }
}
