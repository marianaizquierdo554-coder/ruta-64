import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { id, beneficiarioId } = await request.json();

    // Validar datos requeridos
    if (!id) {
      return NextResponse.json(
        { error: "El ID de la donación es requerido" },
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

    // Verificar que la donación está pendiente
    if (donacionExistente.estado === "entregado") {
      return NextResponse.json(
        { error: "Esta donación ya fue entregada" },
        { status: 400 }
      );
    }

    // Verificar que el beneficiario existe
    if (!beneficiarioId) {
      return NextResponse.json(
        { error: "El ID del beneficiario es requerido" },
        { status: 400 }
      );
    }

    const beneficiarioIdNum = parseInt(beneficiarioId);
    if (isNaN(beneficiarioIdNum)) {
      return NextResponse.json(
        { error: "El ID del beneficiario debe ser un número válido" },
        { status: 400 }
      );
    }

    const beneficiarioExistente = await prisma.beneficiarios.findUnique({
      where: { id: beneficiarioIdNum },
    });

    if (!beneficiarioExistente) {
      return NextResponse.json(
        { error: "Beneficiario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar la donación
    const donacionActualizada = await prisma.donaciones_especie.update({
      where: { id: donacionId },
      data: {
        estado: "entregado",
        confirmado_por: beneficiarioIdNum,
        fecha_confirmacion: new Date(),
      },
    });

    console.log(`Donación en especie ${donacionId} confirmada por beneficiario ${beneficiarioIdNum}`);

    return NextResponse.json({
      success: true,
      data: donacionActualizada,
      mensaje: "Entrega confirmada exitosamente",
    });
  } catch (error) {
    console.error("Error al confirmar entrega:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al confirmar la entrega" },
      { status: 500 }
    );
  }
}