import { NextResponse } from "next/server";
import { Destino } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.destinoRef.findMany({ orderBy: { id: "asc" } });

    const destinos: Destino[] = rows.map((d) => ({
      id:           d.id,
      pais:         d.pais,
      ciudad:       d.ciudad,
      tagline:      d.tagline      ?? "",
      description:  d.descripcion  ?? "",
      image:        d.imagen       ?? "",
      highlights:   [],
      packageCount: 0,
      color:        d.color        ?? "from-primary/80",
    }));

    return NextResponse.json(destinos);
  } catch {
    return NextResponse.json(
      { error: "DB_FAIL", message: "No se pudo conectar a la base de datos." },
      { status: 503 }
    );
  }
}
