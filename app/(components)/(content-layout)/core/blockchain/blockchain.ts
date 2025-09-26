import { BrowserProvider, Contract } from "ethers";
import { SHA256, lib, enc } from "crypto-js";

// Añadir ethereum a Window para TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Dirección y ABI del contrato
const CONTRACT_ADDRESS = "0x3df85e8d58c3adf09660655d6de6fc9b4aafe953";
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "documentId", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "hash", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "version", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "DocumentRegistered",
    type: "event"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "documentId", type: "bytes32" },
      { internalType: "bytes32", name: "newHash", type: "bytes32" }
    ],
    name: "registerDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "documentId", type: "bytes32" }],
    name: "getDocumentHistory",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "hash", type: "bytes32" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint256", name: "version", type: "uint256" }
        ],
        internalType: "struct DocumentRegistry.Document[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// Conectar con MetaMask
async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("MetaMask no está instalado");

  // BrowserProvider reemplaza a Web3Provider en ethers v6
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

// Registrar documento en blockchain
export async function registerDocument(file: File) {
  const { signer } = await getProviderAndSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Calcular hash SHA-256 del archivo
  const arrayBuffer = await file.arrayBuffer();
  // Convertir ArrayBuffer a WordArray para CryptoJS
  const wordArray = lib.WordArray.create(
    new Uint8Array(arrayBuffer)
  );
  const hash = SHA256(wordArray).toString();

  // Generar documentId único
  const documentId = SHA256(file.name + file.size + Date.now()).toString();

  // Registrar en blockchain
  const tx = await contract.registerDocument(
    "0x" + documentId.slice(0, 64), // bytes32 seguro
    "0x" + hash.slice(0, 64)        // bytes32 seguro
  );
  const receipt = await tx.wait();

  console.log("Documento registrado:", { documentId, hash, txHash: receipt.transactionHash });
  return { documentId, hash, txHash: receipt.transactionHash };
}

// Obtener historial de un documento
export async function getDocumentHistory(documentId: string) {
  const { provider } = await getProviderAndSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const history = await contract.getDocumentHistory("0x" + documentId.slice(0, 64));
  return history.map((doc: any) => ({
    hash: doc.hash,
    version: Number(doc.version),
    timestamp: new Date(Number(doc.timestamp) * 1000).toLocaleString()
  }));
}
