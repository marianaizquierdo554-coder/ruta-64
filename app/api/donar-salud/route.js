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
    const { servicioId, nombre, monto, donanteId, donanteNombre, donanteEmail } = await request.json();

    // Validar datos requeridos
    if (!servicioId || !nombre || !monto) {
      return NextResponse.json(
        { error: "servicioId, nombre y monto son requeridos" },
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
        { error: "El monto mínimo de donación es $10.00 MXN" },
        { status: 400 }
      );
    }

    const servicioIdNum = parseInt(servicioId);
    if (isNaN(servicioIdNum)) {
      return NextResponse.json(
        { error: "servicioId debe ser un número válido" },
        { status: 400 }
      );
    }

    // Verificar que el servicio de salud existe
    const servicioExistente = await prisma.servicios_salud.findUnique({
      where: { id: servicioIdNum },
    });

    if (!servicioExistente) {
      return NextResponse.json(
        { error: "Servicio de salud no encontrado" },
        { status: 404 }
      );
    }

    // Buscar el perfil del donante
    let donante = null;
    if (donanteId) {
      donante = await prisma.profiles.findUnique({
        where: { id: donanteId },
      });
    } else if (donanteEmail) {
      donante = await prisma.profiles.findFirst({
        where: { email: donanteEmail },
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
              name: nombre || servicioExistente.nombre,
              description: `Donación para servicio de salud - Ruta 64`,
            },
            unit_amount: Math.round(montoNumerico * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/salud?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/salud?canceled=true`,
      customer_email: donanteEmail || undefined,
      metadata: {
        servicio_id: servicioIdNum.toString(),
        servicio_nombre: nombre || servicioExistente.nombre,
        donante_id: donante?.id || "",
        donante_nombre: donanteNombre || "Anónimo",
        tipo: "salud",
        monto: montoNumerico.toString(),
      },
    });

    // Registrar donación en la base de datos
    try {
      await prisma.donaciones_salud.create({
        data: {
          servicio_id: servicioIdNum,
          donante_id: donante?.id || donanteId || "anonimo",
          donante_nombre: donanteNombre || "Anónimo",
          monto: montoNumerico,
          status: "pagado",
        },
      });
      console.log(`Donación de salud registrada: $${montoNumerico} para servicio ${servicioIdNum}`);
    } catch (dbError) {
      console.error("Error registrando donación de salud:", dbError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error al crear donación de salud:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la donación" },
      { status: 500 }
    );
  }
}