import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { id, tracking } = await request.json();

    // Validar datos requeridos
    if (!id || !tracking) {
      return NextResponse.json(
        { error: "El ID de la donación y el número de tracking son requeridos" },
        { status: 400 }
      );
    }

    const donacionId = parseInt(id);
    if (isNaN(donacionId)) {
      return NextResponse.json(
        { error: "El ID debe ser un número válido" },
        { status: 400 }
      );
    }

    // Verificar que la donación existe
    const donacionExistente = await prisma.donaciones_especie.findUnique({
      where: { id: donacionId },
    });

    if (!donacionExistente) {
      return NextResponse.json(
        { error: "Donación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la donación no esté ya enviada o entregada
    if (donacionExistente.estado === "enviado") {
      return NextResponse.json(
        { error: "Esta donación ya fue enviada" },
        { status: 400 }
      );
    }

    if (donacionExistente.estado === "entregado") {
      return NextResponse.json(
        { error: "Esta donación ya fue entregada" },
        { status: 400 }
      );
    }

    // Actualizar la donación
    const donacionActualizada = await prisma.donaciones_especie.update({
      where: { id: donacionId },
      data: {
        tracking: tracking,
        estado: "enviado",
        fecha_envio: new Date(),
      },
    });

    console.log(`Donación en especie ${donacionId} registrada como enviada - Tracking: ${tracking}`);

    return NextResponse.json({
      success: true,
      data: donacionActualizada,
      mensaje: "Envío registrado exitosamente",
    });
  } catch (error) {
    console.error("Error al registrar envío:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al registrar el envío" },
      { status: 500 }
    );
  }
}