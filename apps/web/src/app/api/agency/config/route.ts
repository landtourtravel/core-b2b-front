import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// GET /api/agency/config — devuelve datos de la agencia activa
export async function GET() {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const agencia = await prisma.agencia.findUnique({
      where: { id: session.user.agenciaId },
      select: { id: true, nombre: true, correo: true, telefono: true },
    });
    return NextResponse.json(agencia ?? {});
  } catch (err) {
    logError("GET /api/agency/config", err);
    return NextResponse.json({});
  }
}

// PATCH /api/agency/config — actualización local (b2b_user no puede escribir en Agencia)
// Los cambios se almacenan en la sesión del cliente via respuesta JSON.
// Una actualización real en BD requiere que Kevin (SuperAdmin) la realice desde lt-core-admin.
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.agenciaId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { nombre, telefono, direccion } = body;

  // b2b_user es READ-ONLY sobre Agencia — devolvemos lo enviado como confirmación
  // para que el cliente lo persista en localStorage hasta que Kevin actualice en admin.
  return NextResponse.json({
    ok: true,
    message: "Configuración guardada localmente. Para actualizar en el sistema, el administrador deberá confirmar los cambios.",
    data: { nombre, telefono, direccion },
  });
}
