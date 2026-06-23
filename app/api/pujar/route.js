import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { subastaId, userId, monto, telefono } = await request.json();

    // Validar datos requeridos
    if (!subastaId || !userId || !monto) {
      return NextResponse.json(
        { error: "subastaId, userId y monto son requeridos" },
        { status: 400 }
      );
    }

    const subastaIdNum = parseInt(subastaId);
    if (isNaN(subastaIdNum)) {
      return NextResponse.json(
        { error: "subastaId debe ser un número válido" },
        { status: 400 }
      );
    }

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número válido mayor a 0" },
        { status: 400 }
      );
    }

    // Verificar que la subasta existe y está activa
    const subastaExistente = await prisma.subastas.findUnique({
      where: { id: subastaIdNum },
    });

    if (!subastaExistente) {
      return NextResponse.json(
        { error: "Subasta no encontrada" },
        { status: 404 }
      );
    }

    if (subastaExistente.activo === false) {
      return NextResponse.json(
        { error: "Esta subasta ya no está activa" },
        { status: 400 }
      );
    }

    // Verificar que la puja es mayor que la puja actual
    const pujaActual = subastaExistente.puja_actual || subastaExistente.precio_inicial || 0;
    if (montoNumerico <= pujaActual) {
      return NextResponse.json(
        { error: `La puja debe ser mayor a $${pujaActual}` },
        { status: 400 }
      );
    }

    // Buscar el perfil del usuario
    const perfil = await prisma.profiles.findFirst({
      where: { clerk_user_id: userId },
      select: {
        id: true,
        email: true,
        avatar_url: true,
      },
    });

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Guardar la puja
    const nuevaPuja = await prisma.pujas.create({
      data: {
        subasta_id: subastaIdNum,
        user_id: userId,
        monto: montoNumerico,
      },
    });

    console.log(`Puja registrada: $${montoNumerico} para subasta ${subastaId}`);

    // Actualizar la subasta con la nueva puja
    await prisma.subastas.update({
      where: { id: subastaIdNum },
      data: {
        puja_actual: montoNumerico,
        puja_ganador_id: userId,
        puja_ganador_nombre: perfil.email || "Usuario",
        puja_ganador_email: perfil.email || "",
        puja_ganador_telefono: telefono || "",
      },
    });

    console.log(`Subasta ${subastaId} actualizada con nueva puja`);

    return NextResponse.json({
      success: true,
      data: {
        puja: nuevaPuja,
        puja_actual: montoNumerico,
      },
    });
  } catch (error) {
    console.error("Error al registrar puja:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al registrar la puja" },
      { status: 500 }
    );
  }
}