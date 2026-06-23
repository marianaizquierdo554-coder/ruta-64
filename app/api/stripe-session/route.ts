import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; //  Importamos Prisma

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID requerido" },
        { status: 400 }
      );
    }

    // 1️ Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // 2️ Verificar si ya existe el registro en la base de datos
    const metadata = session.metadata || {};
    const cursoId = metadata.cursoId ? parseInt(metadata.cursoId) : null;
    const compradorEmail = session.customer_email;

    if (cursoId && compradorEmail) {
      try {
        // Buscar si ya se registró la venta
        const ventaExistente = await prisma.ventas_cursos.findFirst({
          where: {
            curso_id: cursoId,
            comprador_email: compradorEmail,
          },
        });

        // Si la sesión está completada y no tenemos registro, lo creamos
        if (session.payment_status === "paid" && !ventaExistente) {
          await prisma.ventas_cursos.create({
            data: {
              curso_id: cursoId,
              comprador_id: compradorEmail,
              comprador_nombre: metadata.compradorNombre || "Anónimo",
              comprador_email: compradorEmail,
              monto: (session.amount_total || 0) / 100,
              status: "pagado",
            },
          });

          // Actualizar inscritos del curso
          await prisma.cursos.update({
            where: { id: cursoId },
            data: {
              inscritos: {
                increment: 1,
              },
            },
          });

          // Registrar en fondo_becas
          await prisma.fondo_becas.create({
            data: {
              curso_id: cursoId,
              curso_nombre: metadata.nombre || "Curso sin nombre",
              donante_email: compradorEmail,
              monto_total: (session.amount_total || 0) / 100,
              monto_beca: parseFloat(metadata.montoBeca || "0"),
              monto_operacion: parseFloat(metadata.montoOperacion || "0"),
            },
          });
        }
      } catch (dbError) {
        console.error(" Error actualizando base de datos:", dbError);
        // No lanzamos error para no interrumpir la respuesta al cliente
      }
    }

    // 3️Devolver la información de la sesión
    return NextResponse.json({
      total: ((session.amount_total || 0) / 100).toFixed(2),
      beca: metadata.montoBeca || "0",
      operacion: metadata.montoOperacion || "0",
      estado: session.payment_status,
      email: session.customer_email,
      curso: metadata.nombre || null,
      // Datos adicionales
      pagado: session.payment_status === "paid",
      session_id: session.id,
    });
  } catch (error) {
    console.error(" Error al obtener sesión:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Error al obtener la sesión" 
      },
      { status: 500 }
    );
  }
}