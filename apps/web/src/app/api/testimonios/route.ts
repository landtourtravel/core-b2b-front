import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export const revalidate = 300;

// Reseñas reales que el admin marcó como visibles. Nunca expone el token.
export async function GET() {
  try {
    const rows = await prisma.resena.findMany({
      where: {
        visible: true,
        enviadaAt: { not: null },
        comentario: { not: null },
      },
      orderBy: { enviadaAt: "desc" },
      take: 3,
      select: { id: true, nombre: true, cargo: true, comentario: true, estrellas: true },
    });

    const data = rows
      .filter((r) => r.comentario?.trim() && r.nombre?.trim())
      .map((r) => ({
        id: r.id,
        name: r.nombre!.trim(),
        role: r.cargo?.trim() ?? "",
        content: r.comentario!.trim(),
        stars: Math.min(5, Math.max(1, r.estrellas ?? 5)),
      }));

    return NextResponse.json(data);
  } catch (err) {
    logError("GET /api/testimonios", err);
    return NextResponse.json({ error: "DB_FAIL" }, { status: 503 });
  }
}
