import pinataSDK from "@pinata/sdk";

// Usar JWT en lugar de API key/secret
const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.error("ERROR: Falta PINATA_JWT en .env");
}

const pinata = new pinataSDK(PINATA_JWT, null);

export default pinata;
