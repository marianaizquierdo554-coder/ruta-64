import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ofertaId, direccionOrigen, direccionDestino, peso, dimensiones } = await request.json();

    // 1️ Validar datos requeridos
    if (!ofertaId || !direccionOrigen || !direccionDestino) {
      return NextResponse.json(
        { error: "Faltan datos: ofertaId, direccionOrigen y direccionDestino son requeridos" },
        { status: 400 }
      );
    }

    const ofertaIdNum = parseInt(ofertaId);
    if (isNaN(ofertaIdNum)) {
      return NextResponse.json(
        { error: "ofertaId debe ser un número válido" },
        { status: 400 }
      );
    }

    // 2️ Verificar que la oferta existe
    const oferta = await prisma.ofertas_especie.findUnique({
      where: { id: ofertaIdNum },
    });

    if (!oferta) {
      return NextResponse.json(
        { error: "Oferta no encontrada" },
        { status: 404 }
      );
    }

    // 3️ Generar número de seguimiento único
    const numeroSeguimiento = `R64-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4️ Crear el envío en la base de datos
    const nuevoEnvio = await prisma.envios.create({
      data: {
        oferta_id: ofertaIdNum,
        numero_seguimiento: numeroSeguimiento,
        direccion_origen: direccionOrigen,
        direccion_destino: direccionDestino,
        peso: parseFloat(peso) || 0,
        dimensiones: dimensiones || "",
        paqueteria: "Ruta 64 Express",
        estado: "pendiente",
        fecha_creacion: new Date(),
      },
    });

    console.log(` Envío creado: ${numeroSeguimiento}`);

    // 5️ Generar URL de la guía (en producción sería PDF)
    const guiaUrl = `/guias/${nuevoEnvio.id}`;

    // 6️ Actualizar el envío con la URL de la guía
    const envioActualizado = await prisma.envios.update({
      where: { id: nuevoEnvio.id },
      data: { guia_url: guiaUrl },
    });

    console.log(` Guía generada: ${guiaUrl}`);

    // 7️ Opcional: Registrar el primer seguimiento
    await prisma.seguimiento_envios.create({
      data: {
        envio_id: nuevoEnvio.id,
        estado: "pendiente",
        descripcion: "Guía generada - Pendiente de entrega",
        fecha: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      envio: envioActualizado,
      guiaUrl,
      numeroSeguimiento,
    });
  } catch (error) {
    console.error(" Error al generar guía:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al generar la guía",
      },
      { status: 500 }
    );
  }
}