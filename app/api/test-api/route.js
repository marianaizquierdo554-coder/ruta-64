import { NextResponse } from "next/server";

export async function GET() {
  console.log("Test API GET - funcionando");
  return NextResponse.json({
    mensaje: "API funciona",
    timestamp: new Date().toISOString(),
    status: "online"
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log("Test API POST - body:", body);

    return NextResponse.json({
      url: "https://google.com",
      mensaje: "POST recibido",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error en test POST:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error en POST" },
      { status: 500 }
    );
  }
}