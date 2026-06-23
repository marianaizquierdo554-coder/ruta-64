import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { prisma } from "@/lib/prisma";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("imagen") as File;
    const entityType = formData.get("entityType") as string || "general";
    const entityId = formData.get("entityId") as string || null;

    // Validar que se subió un archivo
    if (!file) {
      return NextResponse.json(
        { error: "No se subió ninguna imagen" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo (imágenes solamente)
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa: JPG, PNG, WEBP, GIF o SVG" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB para imágenes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen excede el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    // Subir a Pinata
    const result = await pinata.upload.public.file(file);
    const url = `https://gateway.pinata.cloud/ipfs/${result.cid}`;

    console.log(`Imagen subida a IPFS: ${result.cid}`);

    // Guardar registro en la base de datos
    try {
      await prisma.archivos.create({
        data: {
          nombre: file.name,
          tipo: file.type,
          tamaño: file.size,
          ipfs_hash: result.cid,
          url: url,
          entity_type: entityType,
          entity_id: entityId,
        },
      });
      console.log(`Registro de archivo guardado en BD: ${result.cid}`);
    } catch (dbError) {
      console.error("Error guardando registro de archivo:", dbError);
      // No fallamos la petición, el archivo ya está en IPFS
    }

    return NextResponse.json({
      success: true,
      url: url,
      cid: result.cid,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir la imagen" },
      { status: 500 }
    );
  }
}