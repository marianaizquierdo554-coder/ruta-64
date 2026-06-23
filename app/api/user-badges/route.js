import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Buscar insignias ganadas por el usuario
    const insigniasGanadas = await prisma.insignias_ganadas.findMany({
      where: { user_id: userId },
      include: {
        insignias: true, // Incluir los datos de la insignia
      },
      orderBy: { fecha_ganada: 'desc' },
    });

    // Formatear la respuesta
    const resultado = insigniasGanadas.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      insignia_id: item.insignia_id,
      fecha_ganada: item.fecha_ganada,
      nombre: item.insignias?.nombre,
      descripcion: item.insignias?.descripcion,
      icono: item.insignias?.icono,
      color: item.insignias?.color,
      gradiente: item.insignias?.gradiente,
      categoria: item.insignias?.categoria,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener insignias del usuario:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener las insignias" },
      { status: 500 }
    );
  }
}