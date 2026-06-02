import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agencies = await prisma.agencia.findMany({
      select: { id: true, nombre: true, correo: true, telefono: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(agencies);
  } catch (err) {
    console.error("[/api/agencies]", err);
    return NextResponse.json([], { status: 503 });
  }
}
