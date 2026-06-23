import { NextResponse } from "next/server";

// Datos de ejemplo de CP en México (en producción usar API real)
const cpData = {
  "86475": { estado: "Tabasco", municipio: "Centro", ciudad: "Villahermosa" },
  "86100": { estado: "Tabasco", municipio: "Centro", ciudad: "Villahermosa" },
  "86000": { estado: "Tabasco", municipio: "Centro", ciudad: "Villahermosa" },
  "01000": { estado: "Ciudad de México", municipio: "Álvaro Obregón", ciudad: "CDMX" }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");
  
  if (!cp) {
    return NextResponse.json({ error: "CP requerido" }, { status: 400 });
  }
  
  const data = cpData[cp];
  if (data) {
    return NextResponse.json(data);
  } else {
    return NextResponse.json({ error: "CP no encontrado" }, { status: 404 });
  }
}
