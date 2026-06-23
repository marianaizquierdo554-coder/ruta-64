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
    const body = await request.json().catch(() => ({}));
    const { monto, beneficiarioId, donanteEmail, donanteId, descripcion } = body;

    // Valores por defecto
    const montoNumerico = parseFloat(monto) || 100;
    const beneficiarioIdNum = beneficiarioId ? parseInt(beneficiarioId) : null;
    const descripcionFinal = descripcion || "Donación a Ruta 64";

    // Validar monto mínimo (Stripe requiere al menos $10 MXN)
    if (montoNumerico < 10) {
      return NextResponse.json(
        { error: "El monto mínimo de donación es $10.00 MXN" },
        { status: 400 }
      );
    }

    // Verificar que el beneficiario existe
    let beneficiario = null;
    if (beneficiarioIdNum) {
      beneficiario = await prisma.beneficiarios.findUnique({
        where: { id: beneficiarioIdNum },
      });
      if (!beneficiario) {
        console.warn(`Beneficiario ${beneficiarioIdNum} no encontrado`);
      }
    }

    // Buscar donante por email o ID
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
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Donación Ruta 64`,
              description: beneficiario ? `Apoyo para ${beneficiario.nombre}` : descripcionFinal,
            },
            unit_amount: Math.round(montoNumerico * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donar/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donar`,
      customer_email: donanteEmail || undefined,
      metadata: {
        tipo: "donacion_unica",
        monto: montoNumerico.toString(),
        beneficiarioId: beneficiarioIdNum?.toString() || "",
        donanteId: donante?.id || "",
        descripcion: descripcionFinal,
      },
    });

    // Registrar donación en la base de datos (pendiente)
    try {
      await prisma.donaciones.create({
        data: {
          beneficiario_id: beneficiarioIdNum,
          donante_id: donante?.id || null,
          monto: montoNumerico,
          tipo: "unica",
          estado: "pendiente",
          descripcion: descripcionFinal,
        },
      });
      console.log(`Donación registrada en BD (pendiente) - Monto: $${montoNumerico}`);
    } catch (dbError) {
      console.error("Error registrando donación en BD:", dbError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error al crear sesión de donación:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la donación" },
      { status: 500 }
    );
  }
}