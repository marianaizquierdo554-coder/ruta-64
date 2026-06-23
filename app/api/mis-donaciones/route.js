import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Buscar donaciones en especie del usuario
    const donaciones = await prisma.donaciones_especie.findMany({
      where: { donante_id: userId },
      include: {
        wishlist: {
          include: {
            talentos: true,
            beneficiarios: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(donaciones);
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener las donaciones" },
      { status: 500 }
    );
  }
}