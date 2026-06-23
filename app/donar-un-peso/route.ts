import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: "Donación $1 - Fondo de Becas",
              description: "Tu donación de $1 se destina 100% al fondo de becas para talento mexicano",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donar-un-peso/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      customer_email: userEmail || undefined,
      metadata: {
        tipo: "donacion_un_peso",
        userId: userId || "",
        monto: "1",
        destino: "fondo_becas"
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}