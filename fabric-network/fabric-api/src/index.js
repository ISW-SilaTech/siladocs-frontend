'use strict';

const express = require('express');
const { Gateway, Wallets } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 8000;
const PEER_ENDPOINT = process.env.PEER_ENDPOINT ?? 'peer0.org1.siladocs.com:7051';
const CHANNEL = process.env.CHANNEL_NAME ?? 'silabos-channel';
const CC_NAME = process.env.CHAINCODE_NAME ?? 'silabos-cc';
const MSP_ID = process.env.MSP_ID ?? 'Org1MSP';
const CRYPTO_PATH = process.env.CRYPTO_PATH ?? '/crypto/admin';

// ── Build gRPC connection ────────────────────────────────────────────────────
function buildClient() {
    const credentials = grpc.credentials.createInsecure();
    return new grpc.Client(PEER_ENDPOINT, credentials);
}

// ── Load identity from crypto material ──────────────────────────────────────
function loadIdentity() {
    const certPath = path.join(CRYPTO_PATH, 'msp', 'signcerts', 'cert.pem');
    const keyPath = path.join(CRYPTO_PATH, 'msp', 'keystore');
    const cert = fs.readFileSync(certPath);
    const keyFiles = fs.readdirSync(keyPath);
    const key = fs.readFileSync(path.join(keyPath, keyFiles[0]));
    return { cert, key };
}

// ── Gateway factory (new connection per request - simple approach) ───────────
async function getContract() {
    const client = buildClient();
    const { cert, key } = loadIdentity();

    const gateway = connect({
        client,
        identity: { mspId: MSP_ID, credentials: cert },
        signer: signers.newPrivateKeySigner(createPrivateKey(key)),
    });

    const network = gateway.getNetwork(CHANNEL);
    return { contract: network.getContract(CC_NAME), gateway };
}

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', peer: PEER_ENDPOINT, channel: CHANNEL, chaincode: CC_NAME });
});

// ── Register document ────────────────────────────────────────────────────────
app.post('/registrar-documento', async (req, res) => {
    const { docID, courseID, fileName, fileType, fileSize, fileHash,
            uploaderEmail, institutionName, action, timestamp } = req.body;

    if (!docID || !fileHash) {
        return res.status(400).json({ success: false, message: 'docID y fileHash son obligatorios' });
    }

    try {
        const { contract, gateway } = await getContract();
        const txId = await contract.submitTransaction(
            'RegisterSyllabus',
            docID, courseID, fileName, fileType, String(fileSize ?? 0),
            fileHash, uploaderEmail, institutionName, action, timestamp
        );
        gateway.close();
        res.json({ success: true, transactionID: txId.toString(), message: 'Documento registrado en Fabric' });
    } catch (err) {
        console.error('Fabric error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Get document ─────────────────────────────────────────────────────────────
app.get('/documento/:docID', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('GetSyllabus', req.params.docID);
        gateway.close();
        res.json(JSON.parse(result.toString()));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// ── Verify hash ───────────────────────────────────────────────────────────────
app.post('/verificar', async (req, res) => {
    const { docID, fileHash } = req.body;
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('VerifyHash', docID, fileHash);
        gateway.close();
        const valid = result.toString() === 'true';
        res.json({ valid, docID, message: valid ? 'Hash verificado ✅' : 'Hash no coincide ❌' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Fabric API listening on :${PORT}`);
    console.log(`  Peer:      ${PEER_ENDPOINT}`);
    console.log(`  Channel:   ${CHANNEL}`);
    console.log(`  Chaincode: ${CC_NAME}`);
});
