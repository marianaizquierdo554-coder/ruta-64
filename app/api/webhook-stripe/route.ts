import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verificar que las claves de Stripe existen
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en el entorno');
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET no está definida en el entorno');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      return NextResponse.json(
        { error: "Firma de webhook no proporcionada" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Error verificando webhook:", err);
      return NextResponse.json(
        { error: "Firma de webhook inválida" },
        { status: 400 }
      );
    }

    console.log(`Evento recibido: ${event.type}`);

    // ============================================
    // CASO 1: CHECKOUT SESSION COMPLETED
    // ============================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const customerEmail = session.customer_email || "anonimo@email.com";
      const montoTotal = (session.amount_total || 0) / 100;

      console.log(`Procesando pago de $${montoTotal} - Tipo: ${metadata.tipo || "desconocido"}`);

      // CASO 1.1: COMPRA DE CURSO
      if (metadata.tipo === "curso" && metadata.cursoId) {
        const cursoId = parseInt(metadata.cursoId);

        try {
          await prisma.fondo_becas.create({
            data: {
              curso_id: cursoId,
              curso_nombre: metadata.nombre || "Curso sin nombre",
              donante_email: customerEmail,
              monto_total: montoTotal,
              monto_beca: parseFloat(metadata.montoBeca || "0"),
              monto_operacion: parseFloat(metadata.montoOperacion || "0"),
            },
          });
          console.log("Registro en fondo_becas creado");
        } catch (dbError) {
          console.error("Error guardando fondo_becas:", dbError);
        }

        try {
          await prisma.cursos.update({
            where: { id: cursoId },
            data: { inscritos: { increment: 1 } },
          });
          console.log(`Inscritos actualizados para curso ${cursoId}`);
        } catch (dbError) {
          console.error("Error actualizando inscritos:", dbError);
        }

        try {
          await prisma.ventas_cursos.create({
            data: {
              curso_id: cursoId,
              comprador_id: customerEmail,
              comprador_nombre: metadata.compradorNombre || "Anónimo",
              comprador_email: customerEmail,
              monto: montoTotal,
              status: "pagado",
            },
          });
          console.log("Venta registrada");
        } catch (dbError) {
          console.error("Error registrando venta:", dbError);
        }
      }

      // CASO 1.2: DONACIÓN ÚNICA (desde checkout)
      if (metadata.tipo === "donacion_unica" && metadata.beneficiarioId) {
        const beneficiarioId = parseInt(metadata.beneficiarioId);

        try {
          const donacionPendiente = await prisma.donaciones.findFirst({
            where: {
              beneficiario_id: beneficiarioId,
              donante_id: metadata.donanteId || null,
              monto: parseFloat(metadata.monto || "0"),
              estado: "pendiente",
            },
            orderBy: { fecha: 'desc' },
          });

          if (donacionPendiente) {
            await prisma.donaciones.update({
              where: { id: donacionPendiente.id },
              data: {
                estado: "completada",
                comprobante_url: session.id,
              },
            });
            console.log(`Donación completada: ${donacionPendiente.id}`);
          } else {
            await prisma.donaciones.create({
              data: {
                beneficiario_id: beneficiarioId,
                donante_id: metadata.donanteId || null,
                monto: parseFloat(metadata.monto || "0"),
                tipo: "unica",
                estado: "completada",
                comprobante_url: session.id,
                descripcion: `Donación vía Stripe - ${session.id}`,
              },
            });
            console.log("Donación creada directamente");
          }
        } catch (dbError) {
          console.error("Error procesando donación:", dbError);
        }
      }

      // CASO 1.3: SUSCRIPCIÓN DE PADRINO
      if (metadata.tipo === "padrino" && metadata.beneficiarioId) {
        const beneficiarioId = parseInt(metadata.beneficiarioId);

        try {
          const padrinoPendiente = await prisma.padrinos.findFirst({
            where: {
              beneficiario_id: beneficiarioId,
              donante_id: metadata.donanteId || null,
              plan: metadata.plan || "",
              activo: false,
            },
            orderBy: { created_at: 'desc' },
          });

          if (padrinoPendiente) {
            await prisma.padrinos.update({
              where: { id: padrinoPendiente.id },
              data: {
                activo: true,
                monto: Math.round(parseFloat(metadata.monto || "0")),
              },
            });
            console.log(`Padrino activado: ${padrinoPendiente.id}`);
          } else {
            await prisma.padrinos.create({
              data: {
                donante_id: metadata.donanteId || null,
                beneficiario_id: beneficiarioId,
                plan: metadata.plan || "Semilla",
                monto: Math.round(parseFloat(metadata.monto || "0")),
                activo: true,
              },
            });
            console.log("Padrino creado directamente");
          }
        } catch (dbError) {
          console.error("Error procesando padrino:", dbError);
        }
      }
    }

    // ============================================
    // CASO 2: PAYMENT INTENT SUCCEEDED
    // ============================================
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};

      if (metadata.tipo === "donacion_unica" && metadata.beneficiarioId) {
        const beneficiarioId = parseInt(metadata.beneficiarioId);

        try {
          const donacionPendiente = await prisma.donaciones.findFirst({
            where: {
              beneficiario_id: beneficiarioId,
              donante_id: metadata.donanteId || null,
              monto: parseFloat(metadata.monto || "0"),
              estado: "pendiente",
            },
            orderBy: { fecha: 'desc' },
          });

          if (donacionPendiente) {
            await prisma.donaciones.update({
              where: { id: donacionPendiente.id },
              data: {
                estado: "completada",
                comprobante_url: paymentIntent.id,
              },
            });
            console.log(`Donación completada (PaymentIntent): ${donacionPendiente.id}`);
          }
        } catch (dbError) {
          console.error("Error procesando donación (PaymentIntent):", dbError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error general en webhook:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}