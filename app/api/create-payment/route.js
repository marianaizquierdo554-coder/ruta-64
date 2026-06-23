import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verificar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY no está definida");
  return NextResponse.json(
    { error: "Configuración de Stripe incompleta" },
    { status: 500 }
  );
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, beneficiarioId, donanteId, donanteEmail, descripcion } = await request.json();

    console.log("API: Monto recibido:", amount);

    // Validar datos requeridos
    if (!amount) {
      return NextResponse.json(
        { error: "El monto es requerido" },
        { status: 400 }
      );
    }

    const montoNumerico = parseFloat(amount);
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

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montoNumerico * 100),
      currency: "mxn",
      metadata: {
        platform: "Ruta64",
        beneficiarioId: beneficiarioId || "",
        donanteId: donanteId || "",
        tipo: "donacion_unica",
        monto: montoNumerico.toString(),
      },
    });

    console.log("API: PaymentIntent creado:", paymentIntent.id);
    console.log("API: ClientSecret:", paymentIntent.client_secret ? "OK" : "MISSING");

    // Registrar donación en la base de datos (pendiente)
    if (beneficiarioId) {
      try {
        const beneficiarioIdNum = parseInt(beneficiarioId);
        if (!isNaN(beneficiarioIdNum)) {
          // Verificar que el beneficiario existe
          const beneficiarioExistente = await prisma.beneficiarios.findUnique({
            where: { id: beneficiarioIdNum },
          });

          if (beneficiarioExistente) {
            await prisma.donaciones.create({
              data: {
                beneficiario_id: beneficiarioIdNum,
                donante_id: donanteId || null,
                monto: montoNumerico,
                tipo: "unica",
                estado: "pendiente",
                descripcion: descripcion || "Donación vía PaymentIntent",
                comprobante_url: paymentIntent.id,
              },
            });
            console.log(`Donación registrada en BD (pendiente) - Monto: $${montoNumerico}`);
          }
        }
      } catch (dbError) {
        console.error("Error registrando donación en BD:", dbError);
        // No fallamos la petición, el PaymentIntent ya está creado
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("API: Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el pago" },
      { status: 500 }
    );
  }
}