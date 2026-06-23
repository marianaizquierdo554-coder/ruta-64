import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Crear una donación de usuario
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("=== DONACIÓN RECIBIDA ===");
    console.log("Body:", body);

    const { user_id, titulo, descripcion, estado_producto, foto_url } = body;

    if (!user_id) {
      console.log("ERROR: No user_id");
      return NextResponse.json(
        { error: "user_id es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe
    const perfilExistente = await prisma.profiles.findFirst({
      where: { clerk_user_id: user_id },
    });

    if (!perfilExistente) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Crear la donación
    const nuevaDonacion = await prisma.donaciones_usuarios.create({
      data: {
        user_id: user_id,
        titulo: titulo || "Producto sin título",
        descripcion: descripcion || "",
        estado_producto: estado_producto || "nuevo",
        foto_url: foto_url || "",
        estado_donacion: "pendiente",
      },
    });

    console.log("ÉXITO:", nuevaDonacion);
    return NextResponse.json({ success: true, data: nuevaDonacion });
  } catch (error) {
    console.log("ERROR CATCH:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear la donación" },
      { status: 500 }
    );
  }
}

// GET: Obtener donaciones de un usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    const donaciones = await prisma.donaciones_usuarios.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(donaciones);
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener las donaciones" },
      { status: 500 }
    );
  }
}