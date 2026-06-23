import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { guardarHashEnBlockchain } from "@/lib/blockchain";

export async function POST(request: Request) {
  try {
    const { hash, tipo, privateKey } = await request.json();

    if (!hash || !privateKey) {
      return NextResponse.json({ error: "Hash y privateKey son requeridos" }, { status: 400 });
    }

    // Crear wallet desde la private key
    const wallet = new ethers.Wallet(privateKey);

    const resultado = await guardarHashEnBlockchain(hash, tipo, wallet);

    if (resultado.success) {
      return NextResponse.json({
        success: true,
        transactionHash: resultado.transactionHash,
        blockNumber: resultado.blockNumber,
        timestamp: resultado.timestamp
      });
    } else {
      return NextResponse.json({ error: resultado.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}