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
    const { beneficiarioNombre, monto, donanteEmail, plan, donanteId, beneficiarioId } = await request.json();

    // 1️ Validar datos requeridos
    if (!beneficiarioNombre || !monto || !donanteEmail || !plan) {
      return NextResponse.json(
        { error: "Faltan datos: beneficiarioNombre, monto, donanteEmail y plan son requeridos" },
        { status: 400 }
      );
    }

    // 2️ Buscar el beneficiario por nombre (o por ID si se proporciona)
    let beneficiario;
    if (beneficiarioId) {
      beneficiario = await prisma.beneficiarios.findUnique({
        where: { id: parseInt(beneficiarioId) },
      });
    } else {
      beneficiario = await prisma.beneficiarios.findFirst({
        where: { nombre: beneficiarioNombre },
      });
    }

    if (!beneficiario) {
      return NextResponse.json(
        { error: "Beneficiario no encontrado" },
        { status: 404 }
      );
    }

    // 3️ Buscar el perfil del donante
    let donante;
    if (donanteId) {
      donante = await prisma.profiles.findUnique({
        where: { id: donanteId },
      });
    } else {
      // Buscar por email si no se proporciona ID
      donante = await prisma.profiles.findFirst({
        where: { email: donanteEmail },
      });
    }

    const montoNumerico = parseFloat(monto);

    // 4️ Crear sesión de checkout para suscripción
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Padrino Ruta 64 - ${beneficiario.nombre}`,
              description: `Apoyo mensual para ${beneficiario.nombre} - Plan ${plan} ($${montoNumerico.toFixed(2)} MXN/mes)`,
            },
            unit_amount: Math.round(montoNumerico * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donar/success?beneficiario=${encodeURIComponent(beneficiario.nombre)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donar`,
      customer_email: donanteEmail,
      metadata: {
        beneficiarioId: beneficiario.id.toString(),
        beneficiarioNombre: beneficiario.nombre,
        donanteId: donante?.id || "",
        plan: plan,
        tipo: "padrino",
        monto: montoNumerico.toString(),
      },
    });

    console.log(`Sesión de suscripción creada para ${beneficiario.nombre}`);

    // 5️ Registrar el padrino en la base de datos (pendiente de confirmación)
    try {
      await prisma.padrinos.create({
        data: {
          donante_id: donante?.id || null,
          beneficiario_id: beneficiario.id,
          plan: plan,
          monto: Math.round(montoNumerico),
          activo: false, // Se activará con el webhook
        },
      });
      console.log(`Registro de padrino creado (pendiente de activación)`);
    } catch (dbError) {
      console.error("Error registrando padrino:", dbError);
      // No detenemos el flujo, Stripe ya creó la sesión
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al crear la suscripción",
      },
      { status: 500 }
    );
  }
}