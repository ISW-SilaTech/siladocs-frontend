'use strict';

const express = require('express');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const { createPrivateKey } = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const PORT        = process.env.PORT             ?? 8000;
const PEER_ENDPOINT = process.env.PEER_ENDPOINT  ?? 'peer0.siladocs.com:7051';
const CHANNEL     = process.env.CHANNEL_NAME     ?? 'silabos-channel';
const CC_NAME     = process.env.CHAINCODE_NAME   ?? 'silabos-cc';
const MSP_ID      = process.env.MSP_ID           ?? 'Org1MSP';
const CRYPTO_PATH = process.env.CRYPTO_PATH      ?? '/crypto/admin';
const PEER_TLS    = process.env.PEER_TLS_CERT    ?? '/crypto/peer-tls/ca.crt';

// ── Build gRPC connection (TLS) ──────────────────────────────────────────────
function buildClient() {
    try {
        const tlsCert = fs.readFileSync(PEER_TLS);
        const credentials = grpc.credentials.createSsl(tlsCert);
        return new grpc.Client(PEER_ENDPOINT, credentials);
    } catch {
        console.warn('TLS cert not found, using insecure connection');
        return new grpc.Client(PEER_ENDPOINT, grpc.credentials.createInsecure());
    }
}

// ── Load identity from crypto material ──────────────────────────────────────
function loadIdentity() {
    const certPath = path.join(CRYPTO_PATH, 'msp', 'signcerts');
    const keyPath  = path.join(CRYPTO_PATH, 'msp', 'keystore');

    const certFiles = fs.readdirSync(certPath).filter(f => f.endsWith('.pem'));
    const keyFiles  = fs.readdirSync(keyPath).filter(f => f !== '.gitkeep');

    if (!certFiles.length || !keyFiles.length) throw new Error('No cert/key files found');

    const cert = fs.readFileSync(path.join(certPath, certFiles[0]));
    const key  = fs.readFileSync(path.join(keyPath,  keyFiles[0]));
    return { cert, key };
}

// ── Gateway factory ──────────────────────────────────────────────────────────
async function getContract() {
    const client = buildClient();
    const { cert, key } = loadIdentity();

    const gateway = connect({
        client,
        identity:  { mspId: MSP_ID, credentials: cert },
        signer:    signers.newPrivateKeySigner(createPrivateKey(key)),
        evaluateOptions:    () => ({ deadline: Date.now() + 5000 }),
        endorseOptions:     () => ({ deadline: Date.now() + 15000 }),
        submitOptions:      () => ({ deadline: Date.now() + 5000  }),
        commitStatusOptions:() => ({ deadline: Date.now() + 60000 }),
    });

    const network  = gateway.getNetwork(CHANNEL);
    const contract = network.getContract(CC_NAME);
    return { contract, gateway };
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
        const result = await contract.submitTransaction(
            'RegisterSyllabus',
            docID, courseID ?? '', fileName ?? '', fileType ?? '',
            String(fileSize ?? 0), fileHash,
            uploaderEmail ?? '', institutionName ?? '',
            action ?? 'create', timestamp ?? new Date().toISOString()
        );
        gateway.close();
        const txId = Buffer.from(result).toString('utf8') || 'confirmed';
        res.json({ success: true, transactionID: txId, fabricTxId: txId, currentHash: fileHash });
    } catch (err) {
        console.error('Fabric error:', err?.message ?? err);
        res.status(500).json({ success: false, message: err?.message ?? 'Error en Fabric' });
    }
});

// ── Get document ─────────────────────────────────────────────────────────────
app.get('/documento/:docID', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('GetSyllabus', req.params.docID);
        gateway.close();
        res.json(JSON.parse(Buffer.from(result).toString('utf8')));
    } catch (err) {
        res.status(404).json({ error: err?.message ?? 'Not found' });
    }
});

// ── List all syllabi ──────────────────────────────────────────────────────────
app.get('/documentos', async (_req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('GetAllSyllabi');
        gateway.close();
        res.json(JSON.parse(Buffer.from(result).toString('utf8')));
    } catch (err) {
        res.status(500).json({ error: err?.message ?? 'Error' });
    }
});

// ── Verify hash ───────────────────────────────────────────────────────────────
app.post('/verificar', async (req, res) => {
    const { docID, fileHash } = req.body;
    if (!docID || !fileHash) {
        return res.status(400).json({ error: 'docID y fileHash son obligatorios' });
    }
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('VerifyHash', docID, fileHash);
        gateway.close();
        const valid = Buffer.from(result).toString('utf8') === 'true';
        res.json({ valid, docID, message: valid ? 'Hash verificado ✅' : 'Hash no coincide ❌' });
    } catch (err) {
        res.status(500).json({ error: err?.message ?? 'Error' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Fabric API listening on :${PORT}`);
    console.log(`   Peer:      ${PEER_ENDPOINT}`);
    console.log(`   Channel:   ${CHANNEL}`);
    console.log(`   Chaincode: ${CC_NAME}`);
    console.log(`   MSP:       ${MSP_ID}`);
});
