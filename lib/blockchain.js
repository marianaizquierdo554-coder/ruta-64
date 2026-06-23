import { ethers } from "ethers";

// Configuración de la red (Sepolia testnet o tu red preferida)
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

// ABI del contrato para guardar hashes
const CONTRACT_ABI = [
  "function guardarHash(string memory _hash, string memory _tipo) public",
  "function verificarHash(string memory _hash) public view returns (bool)",
  "function obtenerHash(uint256 _index) public view returns (string memory)",
  "event HashGuardado(address indexed usuario, string hash, string tipo, uint256 timestamp)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Función para guardar un hash en blockchain
export async function guardarHashEnBlockchain(hash, tipo, wallet) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    const tx = await contract.guardarHash(hash, tipo);
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error guardando hash en blockchain:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para verificar un hash en blockchain
export async function verificarHashEnBlockchain(hash) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const existe = await contract.verificarHash(hash);
    return { existe };
  } catch (error) {
    console.error("Error verificando hash:", error);
    return { existe: false, error: error.message };
  }
}

// Función para obtener todos los hashes
export async function obtenerTodosLosHashes() {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const hashes = [];
    let index = 0;
    let hash = "";
    do {
      hash = await contract.obtenerHash(index);
      if (hash) hashes.push(hash);
      index++;
    } while (hash && index < 100);
    return hashes;
  } catch (error) {
    console.error("Error obteniendo hashes:", error);
    return [];
  }
}