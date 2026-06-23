import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ofertaId = searchParams.get("ofertaId");
    const userId = searchParams.get("userId");

    // 1️ Validar parámetros
    if (!ofertaId || !userId) {
      return NextResponse.json(
        { error: "Faltan parámetros: ofertaId y userId son requeridos" },
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

    // 2️ Verificar que la oferta existe y el usuario tiene acceso
    const oferta = await prisma.ofertas_especie.findUnique({
      where: { id: ofertaIdNum },
      select: {
        donante_id: true,
        beneficiario_id: true,
      },
    });

    if (!oferta) {
      return NextResponse.json(
        { error: "Oferta no encontrada" },
        { status: 404 }
      );
    }

    // 3️ Verificar autorización
    const donanteId = oferta.donante_id?.toString();
    const beneficiarioId = oferta.beneficiario_id?.toString();

    if (userId !== donanteId && userId !== beneficiarioId) {
      return NextResponse.json(
        { error: "No autorizado para ver esta conversación" },
        { status: 403 }
      );
    }

    // 4️ Obtener mensajes de la conversación
    const mensajes = await prisma.mensajes.findMany({
      where: {
        oferta_id: ofertaIdNum,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // 5️ Marcar mensajes como leídos (excepto los del usuario actual)
    if (mensajes.length > 0) {
      const mensajesNoLeidos = mensajes.filter(
        (msg) => msg.remitente_id !== userId && msg.leido === false
      );

      if (mensajesNoLeidos.length > 0) {
        await prisma.mensajes.updateMany({
          where: {
            oferta_id: ofertaIdNum,
            remitente_id: {
              not: userId,
            },
            leido: false,
          },
          data: {
            leido: true,
          },
        });
        console.log(` ${mensajesNoLeidos.length} mensajes marcados como leídos`);
      }
    }

    // 6️Actualizar la conversación con la fecha del último mensaje
    if (mensajes.length > 0) {
      const ultimoMensaje = mensajes[mensajes.length - 1];
      await prisma.conversaciones.updateMany({
        where: {
          oferta_id: ofertaIdNum,
        },
        data: {
          ultimo_mensaje: ultimoMensaje.mensaje,
          ultimo_mensaje_fecha: ultimoMensaje.created_at,
        },
      });
    }

    return NextResponse.json(mensajes);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener mensajes",
      },
      { status: 500 }
    );
  }
}