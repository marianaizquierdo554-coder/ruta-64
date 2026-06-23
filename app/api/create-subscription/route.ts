import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verificar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en el entorno');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const priceIds = {
  semilla: process.env.STRIPE_PRICE_SEMILLA,
  crecimiento: process.env.STRIPE_PRICE_CRECIMIENTO,
  transformacion: process.env.STRIPE_PRICE_TRANSFORMACION
};

const planesMapping = {
  semilla: { nombre: "Semilla", monto: 500 },
  crecimiento: { nombre: "Crecimiento", monto: 1500 },
  transformacion: { nombre: "Transformación", monto: 3000 }
};

export async function POST(request) {
  try {
    const { plan, beneficiarioId, beneficiarioNombre, donanteId, donanteEmail } = await request.json();

    // Validar datos requeridos
    if (!plan || !beneficiarioId || !beneficiarioNombre) {
      return NextResponse.json(
        { error: "Faltan datos: plan, beneficiarioId y beneficiarioNombre son requeridos" },
        { status: 400 }
      );
    }

    if (!priceIds[plan]) {
      return NextResponse.json(
        { error: `Plan inválido: ${plan}. Planes disponibles: semilla, crecimiento, transformacion` },
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

    const planInfo = planesMapping[plan];

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceIds[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donar/success?beneficiario_id=${beneficiarioId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donar?id=${beneficiarioId}`,
      customer_email: donanteEmail || undefined,
      metadata: {
        beneficiarioId: beneficiarioId.toString(),
        beneficiarioNombre: beneficiarioNombre,
        donanteId: donante?.id || "",
        tipo: "padrino",
        plan: plan,
        monto: planInfo.monto.toString(),
      },
    });

    console.log(`Sesión de suscripción creada para ${beneficiarioNombre} - Plan ${planInfo.nombre}`);

    // Registrar el padrino en la base de datos (pendiente de activación)
    try {
      await prisma.padrinos.create({
        data: {
          donante_id: donante?.id || null,
          beneficiario_id: beneficiario.id,
          plan: planInfo.nombre,
          monto: planInfo.monto,
          activo: false,
        },
      });
      console.log("Registro de padrino creado (pendiente de activación)");
    } catch (dbError) {
      console.error("Error registrando padrino:", dbError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la suscripción" },
      { status: 500 }
    );
  }
}