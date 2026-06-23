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
    const { beneficiarioNombre, monto, donanteEmail, donanteId, beneficiarioId } = await request.json();

    // 1️ Validar datos requeridos
    if (!beneficiarioNombre || !monto || !donanteEmail) {
      return NextResponse.json(
        { error: "Faltan datos: beneficiarioNombre, monto y donanteEmail son requeridos" },
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

    // 2️ Buscar el beneficiario por nombre o ID
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
      donante = await prisma.profiles.findFirst({
        where: { email: donanteEmail },
      });
    }

    // 4️ Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Donación para ${beneficiario.nombre}`,
              description: `Apoyo económico para ${beneficiario.nombre}`,
            },
            unit_amount: Math.round(montoNumerico * 100),
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
        tipo: "donacion_unica",
        monto: montoNumerico.toString(),
      },
    });

    console.log(`Sesión de donación creada para ${beneficiario.nombre} ($${montoNumerico})`);

    // 5️ Registrar la donación en la base de datos (pendiente de confirmación)
    try {
      await prisma.donaciones.create({
        data: {
          beneficiario_id: beneficiario.id,
          donante_id: donante?.id || null,
          monto: montoNumerico,
          tipo: "unica",
          estado: "pendiente",
          descripcion: `Donación única para ${beneficiario.nombre}`,
        },
      });
      console.log(`Registro de donación creado (pendiente de confirmación)`);
    } catch (dbError) {
      console.error("Error registrando donación:", dbError);
      // No detenemos el flujo, Stripe ya creó la sesión
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error en donación:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al procesar la donación",
      },
      { status: 500 }
    );
  }
}