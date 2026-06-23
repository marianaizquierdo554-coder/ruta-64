import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validarFormatoCURP(curp: string): boolean {
  const regex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}$/;
  return regex.test(curp.toUpperCase());
}

function normalizarCURP(curp: string): string {
  return curp.toUpperCase().trim();
}

export async function POST(request) {
  try {
    const { curp, beneficiarioId } = await request.json();

    if (!curp) {
      return NextResponse.json(
        { error: "La CURP es requerida" },
        { status: 400 }
      );
    }

    const curpNormalizada = normalizarCURP(curp);

    // Validar formato
    if (!validarFormatoCURP(curpNormalizada)) {
      return NextResponse.json({
        valida: false,
        error: "Formato de CURP inválido",
        enlace: "https://www.gob.mx/curp/",
      });
    }

    // Verificar CURP duplicada (excluyendo el beneficiario actual si se edita)
    const whereClause: any = { curp: curpNormalizada };
    if (beneficiarioId) {
      whereClause.id = { not: parseInt(beneficiarioId) };
    }

    const curpExistente = await prisma.beneficiarios.findFirst({
      where: whereClause,
    });

    if (curpExistente) {
      return NextResponse.json({
        valida: false,
        error: "Esta CURP ya está registrada en el sistema",
        enlace: "https://www.gob.mx/curp/",
      });
    }

    return NextResponse.json({
      valida: true,
      mensaje: "CURP válida",
      curp: curpNormalizada,
    });
  } catch (error) {
    console.error("Error al validar CURP:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al validar la CURP" },
      { status: 500 }
    );
  }
}