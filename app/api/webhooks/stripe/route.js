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

    // Verificar que el webhook viene de Stripe
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

    // Procesar evento de pago completado
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};

      // CASO 1: Producto (tienda)
      if (metadata.tipo === "producto" && metadata.productoId) {
        const productoId = parseInt(metadata.productoId);

        // Verificar que el producto existe
        const productoExistente = await prisma.productos.findUnique({
          where: { id: productoId },
        });

        if (!productoExistente) {
          console.error(`Producto ${productoId} no encontrado`);
          return NextResponse.json(
            { error: "Producto no encontrado" },
            { status: 404 }
          );
        }

        // Actualizar producto como vendido
        await prisma.productos.update({
          where: { id: productoId },
          data: { estado: "vendido" },
        });
        console.log(`Producto ${productoId} actualizado a vendido`);

        // Actualizar venta con session_id
        const compradorEmail = session.customer_email || "anonimo@email.com";
        const montoTotal = (session.amount_total || 0) / 100;

        await prisma.ventas.updateMany({
          where: {
            producto_id: productoId,
            comprador_id: compradorEmail,
            status: "pendiente",
          },
          data: {
            status: "pagado",
            stripe_session_id: session.id,
          },
        });
        console.log(`Venta actualizada con session_id: ${session.id}`);
      }

      // CASO 2: Donación (puedes expandir aquí)
      if (metadata.tipo === "donacion_unica" && metadata.beneficiarioId) {
        const beneficiarioId = parseInt(metadata.beneficiarioId);

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
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}