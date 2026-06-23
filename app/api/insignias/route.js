import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya tiene la insignia Pionero (id=1)
    const insigniaExistente = await prisma.insignias_ganadas.findFirst({
      where: {
        user_id: userId,
        insignia_id: 1,
      },
    });

    // Si no la tiene, se la asignamos
    if (!insigniaExistente) {
      await prisma.insignias_ganadas.create({
        data: {
          user_id: userId,
          insignia_id: 1,
          fecha_ganada: new Date(),
        },
      });
      console.log(`Insignia Pionero asignada al usuario: ${userId}`);
    } else {
      console.log(`El usuario ${userId} ya tiene la insignia Pionero`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al asignar insignia:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al asignar la insignia" },
      { status: 500 }
    );
  }
}