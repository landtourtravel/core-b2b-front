import { NextResponse } from "next/server";
import { Destino } from "@land-tour/shared";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const rows = await prisma.destinoRef.findMany({
      orderBy: { id: "asc" },
      include: {
        hoteles: {
          select: {
            paquetes: {
              where: { paquete: { visibleEnFront: true } },
              select: { paqueteId: true },
            },
          },
        },
      },
    });

    const destinos: Destino[] = rows.map((d) => {
      // A package may span multiple hotels in the same destination — deduplicate.
      const packageCount = new Set(
        d.hoteles.flatMap((h) => h.paquetes.map((p) => p.paqueteId))
      ).size;

      return {
        id:           d.id,
        pais:         d.pais,
        ciudad:       d.ciudad,
        tagline:      "",
        description:  d.descripcion ?? "",
        image:        d.imagen     ?? "",
        highlights:   [],
        packageCount,
        color:        "",
      };
    });

    return NextResponse.json(destinos);
  } catch (error) {
    logError("GET /api/destinations", error);
    return new NextResponse(null, { status: 503 });
  }
}
