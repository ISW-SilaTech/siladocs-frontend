#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SilaDocs · Fabric Network Startup Script (TLS enabled)
# Bootstraps crypto, generates genesis, starts containers, deploys chaincode
# ─────────────────────────────────────────────────────────────────────────────
set -e

CHANNEL="silabos-channel"
CC_NAME="silabos-cc"
CC_VERSION="1.0"
ORDERER_CA="/etc/hyperledger/fabric/orderer-tls/ca.crt"

echo "📦 Pulling Fabric tools..."
docker pull hyperledger/fabric-tools:2.5.4 -q

echo "🔐 Generating crypto material..."
rm -rf ./crypto-config
docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  hyperledger/fabric-tools:2.5.4 \
  cryptogen generate --config=./crypto-config.yaml --output=./crypto-config

echo "📜 Generating genesis block..."
mkdir -p ./channel-artifacts
docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  -e FABRIC_CFG_PATH=/workspace \
  hyperledger/fabric-tools:2.5.4 \
  configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

echo "📄 Generating channel transaction..."
docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  -e FABRIC_CFG_PATH=/workspace \
  hyperledger/fabric-tools:2.5.4 \
  configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL}.tx -channelID ${CHANNEL}

echo "🚀 Starting Fabric containers..."
docker compose up -d ca.siladocs.com orderer.siladocs.com couchdb0 peer0.siladocs.com

echo "⏳ Waiting 15s for orderer & peer to initialize..."
sleep 15

echo "📡 Creating channel ${CHANNEL}..."
docker exec peer0.siladocs.com bash -c \
  "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/admin-msp \
   peer channel create \
   -o orderer.siladocs.com:7050 \
   -c ${CHANNEL} \
   -f /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.tx \
   --tls --cafile ${ORDERER_CA} \
   --outputBlock /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.block"

echo "🔗 Joining peer to channel..."
docker exec peer0.siladocs.com bash -c \
  "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/admin-msp \
   peer channel join \
   -b /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.block"

echo "⏭️  Chaincode installation skipped (requires Go in peer container)"
echo "    To install chaincode later: use peer lifecycle chaincode package/install/approve/commit"
echo "    Or build a JavaScript/TypeScript chaincode that doesn't require compilation"

echo "🌐 Starting Fabric REST API..."
docker compose up -d fabric-api

echo ""
echo "✅ SilaDocs Fabric Network is UP!"
echo "   Peer:        peer0.siladocs.com:7051"
echo "   Orderer:     orderer.siladocs.com:7050 (TLS)"
echo "   CouchDB:     http://localhost:5984/_utils  (admin/adminpw)"
echo "   Fabric API:  http://localhost:8000"
echo "   Channel:     ${CHANNEL}"
echo "   Chaincode:   ${CC_NAME} v${CC_VERSION}"
