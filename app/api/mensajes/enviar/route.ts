import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ofertaId, remitenteId, destinatarioId, mensaje } = await request.json();

    // Validar que el mensaje no esté vacío
    if (!mensaje || mensaje.trim() === "") {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    // Validar que los IDs sean válidos
    if (!remitenteId || !destinatarioId) {
      return NextResponse.json(
        { error: "Faltan datos del remitente o destinatario" },
        { status: 400 }
      );
    }

    // 1️ Guardar el mensaje en la tabla `mensajes`
    const nuevoMensaje = await prisma.mensajes.create({
      data: {
        oferta_id: ofertaId ? parseInt(ofertaId) : null,
        remitente_id: remitenteId,
        destinatario_id: destinatarioId,
        mensaje: mensaje.trim(),
        leido: false,
      },
    });

    console.log("Mensaje guardado:", nuevoMensaje.id);

    // 2️ Actualizar o crear la conversación
    const conversacionExistente = await prisma.conversaciones.findFirst({
      where: {
        oferta_id: ofertaId ? parseInt(ofertaId) : null,
      },
    });

    if (conversacionExistente) {
      await prisma.conversaciones.update({
        where: { id: conversacionExistente.id },
        data: {
          ultimo_mensaje: mensaje.trim(),
          ultimo_mensaje_fecha: new Date(),
        },
      });
      console.log("Conversación actualizada");
    } else {
      await prisma.conversaciones.create({
        data: {
          oferta_id: ofertaId ? parseInt(ofertaId) : null,
          donante_id: remitenteId,
          beneficiario_id: parseInt(destinatarioId) || 0,
          ultimo_mensaje: mensaje.trim(),
          ultimo_mensaje_fecha: new Date(),
        },
      });
      console.log("Nueva conversación creada");
    }

    return NextResponse.json({
      success: true,
      data: nuevoMensaje,
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Error al enviar mensaje" 
      },
      { status: 500 }
    );
  }
}