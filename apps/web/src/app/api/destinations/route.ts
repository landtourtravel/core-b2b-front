import { NextResponse } from "next/server";
import { Destino } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { MOCK_DESTINOS } from "@/lib/mock-data";

export async function GET() {
  try {
    const rows = await prisma.destinoRef.findMany({ orderBy: { id: "asc" } });

    const destinos: Destino[] = rows.map((d) => ({
      id:           d.id,
      pais:         d.pais,
      ciudad:       d.ciudad,
      tagline:      "",
      description:  d.descripcion ?? "",
      image:        d.imagen     ?? "",
      highlights:   [],
      packageCount: 0,
      color:        "",
    }));

    return NextResponse.json(destinos);
  } catch (error) {
    console.error('[/api/destinations] Error:', error);
    return NextResponse.json(MOCK_DESTINOS);
  }
}
