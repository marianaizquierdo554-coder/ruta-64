import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { envioId, estado, ubicacion, descripcion } = await request.json();

    // 1️ Validar datos requeridos
    if (!envioId || !estado) {
      return NextResponse.json(
        { error: "envioId y estado son requeridos" },
        { status: 400 }
      );
    }

    const envioIdNum = parseInt(envioId);
    if (isNaN(envioIdNum)) {
      return NextResponse.json(
        { error: "envioId debe ser un número válido" },
        { status: 400 }
      );
    }

    // 2️ Verificar que el envío existe
    const envioExistente = await prisma.envios.findUnique({
      where: { id: envioIdNum },
    });

    if (!envioExistente) {
      return NextResponse.json(
        { error: "Envío no encontrado" },
        { status: 404 }
      );
    }

    // 3️ Agregar actualización de seguimiento
    await prisma.seguimiento_envios.create({
      data: {
        envio_id: envioIdNum,
        estado: estado,
        ubicacion: ubicacion || "",
        descripcion: descripcion || "",
        fecha: new Date(),
      },
    });

    console.log(` Seguimiento registrado para envío ${envioId}: ${estado}`);

    // 4️ Actualizar estado del envío
    const updateData: any = {
      estado: estado,
    };

    // Si el estado es "enviado", registrar fecha de envío
    if (estado === "enviado") {
      updateData.fecha_envio = new Date();
    }

    // Si el estado es "entregado", registrar fecha de entrega
    if (estado === "entregado") {
      updateData.fecha_entrega = new Date();
    }

    const envioActualizado = await prisma.envios.update({
      where: { id: envioIdNum },
      data: updateData,
    });

    console.log(`Envío ${envioId} actualizado a estado: ${estado}`);

    // 5️ Respuesta con los datos actualizados
    return NextResponse.json({
      success: true,
      envio: envioActualizado,
      mensaje: `Envío actualizado a estado: ${estado}`,
    });
  } catch (error) {
    console.error(" Error al actualizar seguimiento:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al actualizar el seguimiento",
      },
      { status: 500 }
    );
  }
}