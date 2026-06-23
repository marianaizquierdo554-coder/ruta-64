import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityType = formData.get("entityType") as string || "general";
    const entityId = formData.get("entityId") as string || null;

    if (!file) {
      return NextResponse.json(
        { error: "No se ha enviado ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa: JPG, PNG, WEBP, GIF o PDF" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 10MB" },
        { status: 400 }
      );
    }

    const JWT = process.env.PINATA_JWT;
    if (!JWT) {
      return NextResponse.json(
        { error: "JWT de Pinata no configurado" },
        { status: 500 }
      );
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${JWT}` },
      body: pinataFormData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error en Pinata:", errorData);
      return NextResponse.json(
        { error: "Error al subir el archivo a IPFS" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const ipfsHash = data.IpfsHash;
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Guardar registro en la base de datos (si el modelo existe)
    try {
      // Verificar si el modelo "archivos" existe en Prisma
      if (prisma.archivos) {
        await prisma.archivos.create({
          data: {
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size,
            ipfs_hash: ipfsHash,
            url: url,
            entity_type: entityType,
            entity_id: entityId,
          },
        });
        console.log(`Archivo registrado en BD: ${ipfsHash}`);
      }
    } catch (dbError) {
      console.error("Error registrando archivo en BD:", dbError);
      // No fallamos la petición, el archivo ya está en IPFS
    }

    return NextResponse.json({
      success: true,
      url: url,
      ipfsHash: ipfsHash,
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir el archivo" },
      { status: 500 }
    );
  }
}