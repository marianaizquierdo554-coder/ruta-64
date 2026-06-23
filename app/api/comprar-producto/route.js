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
    const { productoId, nombre, precio, compradorId, compradorNombre, compradorEmail, direccion } = await request.json();

    // Validar datos requeridos
    if (!productoId || !nombre || !precio) {
      return NextResponse.json(
        { error: "productoId, nombre y precio son requeridos" },
        { status: 400 }
      );
    }

    const productoIdNum = parseInt(productoId);
    if (isNaN(productoIdNum)) {
      return NextResponse.json(
        { error: "productoId debe ser un número válido" },
        { status: 400 }
      );
    }

    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      return NextResponse.json(
        { error: "El precio debe ser un número válido mayor a 0" },
        { status: 400 }
      );
    }

    // Validar monto mínimo (Stripe requiere al menos $10 MXN)
    if (precioNumerico < 10) {
      return NextResponse.json(
        { error: "El monto mínimo de compra es $10.00 MXN" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y está disponible
    const productoExistente = await prisma.productos.findUnique({
      where: { id: productoIdNum },
    });

    if (!productoExistente) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (productoExistente.estado === "vendido") {
      return NextResponse.json(
        { error: "Este producto ya fue vendido" },
        { status: 400 }
      );
    }

    // 🔧 CORREGIDO: Buscar por clerk_user_id (no por id)
    let comprador = null;
    if (compradorId) {
      comprador = await prisma.profiles.findFirst({
        where: { clerk_user_id: compradorId },
      });
    } else if (compradorEmail) {
      comprador = await prisma.profiles.findFirst({
        where: { email: compradorEmail },
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
              name: nombre || productoExistente.nombre,
              description: "Compra en Centro Comercial Local Ruta 64",
            },
            unit_amount: Math.round(precioNumerico * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tienda?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tienda?canceled=true`,
      customer_email: compradorEmail || undefined,
      metadata: {
        producto_id: productoIdNum.toString(),
        producto_nombre: nombre || productoExistente.nombre,
        comprador_id: comprador?.id || compradorId || "",
        comprador_nombre: compradorNombre || "Anónimo",
        comprador_email: compradorEmail || "",
        tipo: "tienda",
        direccion_envio: direccion || "",
        monto: precioNumerico.toString(),
      },
    });

    // Guardar venta en la base de datos
    try {
      await prisma.ventas.create({
        data: {
          producto_id: productoIdNum,
          comprador_id: comprador?.id || compradorId || "anonimo",
          comprador_nombre: compradorNombre || "Anónimo",
          monto: Math.round(precioNumerico),
          status: "pagado",
          stripe_session_id: session.id,
        },
      });
      console.log(`Venta registrada para producto ${productoIdNum}`);
    } catch (dbError) {
      console.error("Error guardando venta:", dbError);
    }

    // Actualizar producto como vendido
    try {
      await prisma.productos.update({
        where: { id: productoIdNum },
        data: { estado: "vendido" },
      });
      console.log(`Producto ${productoIdNum} actualizado a vendido`);
    } catch (dbError) {
      console.error("Error actualizando producto:", dbError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error al comprar producto:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar la compra" },
      { status: 500 }
    );
  }
}