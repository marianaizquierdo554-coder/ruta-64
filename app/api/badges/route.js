import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Se requieren los IDs de las insignias" },
        { status: 400 }
      );
    }

    // Convertir los IDs a números
    const idsArray = ids.split(",").map((id) => parseInt(id.trim()));
    const idsValidos = idsArray.filter((id) => !isNaN(id));

    if (idsValidos.length === 0) {
      return NextResponse.json(
        { error: "IDs inválidos" },
        { status: 400 }
      );
    }

    // Buscar insignias por IDs
    const insignias = await prisma.insignias.findMany({
      where: {
        id: { in: idsValidos },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(insignias);
  } catch (error) {
    console.error("Error al obtener insignias:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener las insignias" },
      { status: 500 }
    );
  }
}