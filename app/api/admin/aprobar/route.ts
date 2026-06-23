import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

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

    // Actualizar el beneficiario
    const beneficiarioActualizado = await prisma.beneficiarios.update({
      where: { id: beneficiarioId },
      data: {
        validado: true,
        estado_cuenta: "activo",
      },
    });

    console.log(`Beneficiario ${beneficiarioId} aprobado`);

    return NextResponse.json({
      success: true,
      data: beneficiarioActualizado,
      mensaje: "Beneficiario aprobado correctamente",
    });
  } catch (error) {
    console.error("Error al aprobar beneficiario:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al aprobar el beneficiario" },
      { status: 500 }
    );
  }
}