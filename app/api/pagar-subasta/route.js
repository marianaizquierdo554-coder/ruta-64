import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verificar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en el entorno');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { subastaId, monto, email, nombre } = await request.json();

    // Validar datos requeridos
    if (!subastaId || !monto) {
      return NextResponse.json(
        { error: "subastaId y monto son requeridos" },
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

    // Validar monto mínimo (Stripe requiere al menos $10 MXN)
    if (montoNumerico < 10) {
      return NextResponse.json(
        { error: "El monto mínimo de pago es $10.00 MXN" },
        { status: 400 }
      );
    }

    // Verificar que la subasta existe
    const subastaExistente = await prisma.subastas.findUnique({
      where: { id: subastaIdNum },
    });

    if (!subastaExistente) {
      return NextResponse.json(
        { error: "Subasta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la subasta está activa o finalizada
    if (subastaExistente.activo === true) {
      return NextResponse.json(
        { error: "La subasta aún está activa. Espere a que finalice." },
        { status: 400 }
      );
    }

    // Verificar que no esté ya pagada
    if (subastaExistente.pagado === true) {
      return NextResponse.json(
        { error: "Esta subasta ya fue pagada" },
        { status: 400 }
      );
    }

    // Buscar el perfil del comprador
    let comprador = null;
    if (email) {
      comprador = await prisma.profiles.findFirst({
        where: { email: email },
      });
    }

    // Crear sesión en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Subasta #${subastaId}`,
              description: `Pago de subasta ganada - ${subastaExistente.titulo || "Sin título"}`,
            },
            unit_amount: Math.round(montoNumerico * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subastas?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subastas?canceled=true`,
      customer_email: email || undefined,
      metadata: {
        subasta_id: subastaIdNum.toString(),
        subasta_titulo: subastaExistente.titulo || "",
        comprador_email: email || "",
        comprador_nombre: nombre || "",
        tipo: "subasta",
        monto: montoNumerico.toString(),
      },
    });

    console.log(`Sesión de pago creada para subasta ${subastaId}`);

    // Registrar que el pago está en proceso (actualizar subasta)
    try {
      await prisma.subastas.update({
        where: { id: subastaIdNum },
        data: {
          puja_ganador_email: email || "",
          puja_ganador_nombre: nombre || "",
        },
      });
      console.log(`Subasta ${subastaId} actualizada con datos del ganador`);
    } catch (dbError) {
      console.error("Error actualizando subasta:", dbError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error al pagar subasta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar el pago" },
      { status: 500 }
    );
  }
}