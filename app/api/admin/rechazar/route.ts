import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID del beneficiario es requerido" },
        { status: 400 }
      );
    }

    const beneficiarioId = parseInt(id);
    if (isNaN(beneficiarioId)) {
      return NextResponse.json(
        { error: "El ID debe ser un número válido" },
        { status: 400 }
      );
    }

    // Verificar que el beneficiario existe
    const beneficiarioExistente = await prisma.beneficiarios.findUnique({
      where: { id: beneficiarioId },
    });

    if (!beneficiarioExistente) {
      return NextResponse.json(
        { error: "Beneficiario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar estado a rechazado
    const beneficiarioActualizado = await prisma.beneficiarios.update({
      where: { id: beneficiarioId },
      data: {
        validado: false,
        estado_cuenta: "rechazado",
      },
    });

    console.log(`Beneficiario ${beneficiarioId} rechazado`);

    return NextResponse.json({
      success: true,
      data: beneficiarioActualizado,
      mensaje: "Beneficiario rechazado correctamente",
    });
  } catch (error) {
    console.error("Error al rechazar beneficiario:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al rechazar el beneficiario" },
      { status: 500 }
    );
  }
}