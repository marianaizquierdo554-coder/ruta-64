import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // Verificar que la clave de Clerk existe
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY no está definida");
      return NextResponse.json(
        { error: "Configuración de Clerk incompleta" },
        { status: 500 }
      );
    }

    const { email, password, nombre, rol } = await request.json();

    // Validar datos requeridos
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: "email, password y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en profiles
    const perfilExistente = await prisma.profiles.findFirst({
      where: { email: email },
    });

    if (perfilExistente) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Crear usuario en Clerk
    const response = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password: password,
        first_name: nombre,
        public_metadata: { rol: rol || "donante" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error en Clerk:", data);
      return NextResponse.json(
        { error: data.message || "Error al crear usuario en Clerk" },
        { status: response.status }
      );
    }

    const clerkUserId = data.id;
    console.log(`Usuario creado en Clerk: ${clerkUserId}`);

    // Crear perfil en Prisma
    try {
      await prisma.profiles.create({
        data: {
          clerk_user_id: clerkUserId,
          email: email,
          rol: rol || "donante",
          validado: false,
        },
      });
      console.log(`Perfil creado en Prisma para: ${email}`);
    } catch (dbError) {
      console.error("Error creando perfil en Prisma:", dbError);
      // No fallamos la petición, el usuario ya está en Clerk
    }

    return NextResponse.json({
      success: true,
      userId: clerkUserId,
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear el usuario" },
      { status: 500 }
    );
  }
}