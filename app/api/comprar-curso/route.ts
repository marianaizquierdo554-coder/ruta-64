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
    const { 
      cursoId, 
      nombre, 
      precio, 
      compradorEmail, 
      compradorNombre, 
      tipo 
    } = await request.json();

    const precioNumerico = parseFloat(precio);
    const montoBeca = Math.round((precioNumerico * 0.1) * 100) / 100;
    const montoOperacion = Math.round((precioNumerico * 0.9) * 100) / 100;

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: nombre,
              description: `10% del curso ($${montoBeca.toFixed(2)}) va a becas para talento mexicano`,
            },
            unit_amount: Math.round(precioNumerico * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cursos/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cursos`,
      customer_email: compradorEmail,
      metadata: {
        cursoId: cursoId.toString(),
        tipo: "curso",
        nombre: nombre,
        montoBeca: montoBeca.toString(),
        montoOperacion: montoOperacion.toString(),
        compradorNombre: compradorNombre || ""
      },
    });

    // Guardar la venta en la base de datos con Prisma
    try {
      await prisma.ventas_cursos.create({
        data: {
          curso_id: parseInt(cursoId),
          comprador_id: compradorEmail,
          comprador_nombre: compradorNombre || compradorEmail,
          comprador_email: compradorEmail,
          monto: Math.round(precioNumerico),
          status: "pendiente",
          cursos: {
            connect: { id: parseInt(cursoId) }
          }
        },
      });
      console.log(`Venta registrada para el curso ${cursoId}`);
    } catch (dbError) {
      console.error("Error al guardar la venta en Prisma:", dbError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}