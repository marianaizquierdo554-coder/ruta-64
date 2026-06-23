import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { clerk_user_id, email } = await request.json();

    if (!clerk_user_id || !email) {
      return NextResponse.json(
        { error: "clerk_user_id y email son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el perfil por email
    const perfilExistente = await prisma.profiles.findFirst({
      where: { email: email },
    });

    if (!perfilExistente) {
      return NextResponse.json(
        { error: "Perfil no encontrado con ese email" },
        { status: 404 }
      );
    }

    // Actualizar el clerk_user_id
    await prisma.profiles.update({
      where: { id: perfilExistente.id },
      data: { clerk_user_id: clerk_user_id },
    });

    console.log(`Perfil ${email} actualizado con clerk_user_id: ${clerk_user_id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en callback de auth:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}