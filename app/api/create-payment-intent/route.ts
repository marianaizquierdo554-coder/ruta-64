import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verificar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en el entorno');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const { amount, beneficiarioId, beneficiarioNombre, donanteId, donanteEmail } = await request.json();

    // Validar datos requeridos
    if (!amount || !beneficiarioId || !beneficiarioNombre) {
      return NextResponse.json(
        { error: "Faltan datos: amount, beneficiarioId y beneficiarioNombre son requeridos" },
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

    // Verificar que el beneficiario existe
    const beneficiario = await prisma.beneficiarios.findUnique({
      where: { id: parseInt(beneficiarioId) },
    });

    if (!beneficiario) {
      return NextResponse.json(
        { error: "Beneficiario no encontrado" },
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

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montoNumerico * 100),
      currency: "mxn",
      metadata: {
        beneficiarioId: beneficiarioId.toString(),
        beneficiarioNombre: beneficiarioNombre,
        donanteId: donante?.id || "",
        tipo: "donacion_unica",
        monto: montoNumerico.toString(),
      },
    });

    console.log(`PaymentIntent creado para ${beneficiarioNombre} - $${montoNumerico}`);

    // Registrar la donación en la base de datos (pendiente de confirmación)
    try {
      await prisma.donaciones.create({
        data: {
          beneficiario_id: beneficiario.id,
          donante_id: donante?.id || null,
          monto: montoNumerico,
          tipo: "unica",
          estado: "pendiente",
          descripcion: `Donación única para ${beneficiario.nombre}`,
          comprobante_url: paymentIntent.id,
        },
      });
      console.log("Registro de donación creado (pendiente de confirmación)");
    } catch (dbError) {
      console.error("Error registrando donación:", dbError);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creando PaymentIntent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el pago" },
      { status: 500 }
    );
  }
}