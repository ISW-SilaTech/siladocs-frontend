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
docker compose up -d ca.siladocs.com orderer.siladocs.com couchdb0 peer0.org1.siladocs.com

echo "⏳ Waiting 15s for orderer & peer to initialize..."
sleep 15

echo "📡 Creating channel ${CHANNEL}..."
docker exec peer0.org1.siladocs.com peer channel create \
  -o orderer.siladocs.com:7050 \
  -c ${CHANNEL} \
  -f /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.tx \
  --tls --cafile ${ORDERER_CA} \
  --outputBlock /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.block

echo "🔗 Joining peer to channel..."
docker exec peer0.org1.siladocs.com peer channel join \
  -b /etc/hyperledger/fabric/channel-artifacts/${CHANNEL}.block

echo "📦 Packaging chaincode..."
docker exec peer0.org1.siladocs.com peer lifecycle chaincode package \
  ${CC_NAME}.tar.gz \
  --path /etc/hyperledger/fabric/chaincode \
  --lang golang \
  --label ${CC_NAME}_${CC_VERSION}

echo "🔧 Installing chaincode..."
docker exec peer0.org1.siladocs.com peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "✅ Approving chaincode for org..."
PACKAGE_ID=$(docker exec peer0.org1.siladocs.com peer lifecycle chaincode queryinstalled | grep "Package ID:" | awk '{print $3}' | tr -d ',')
docker exec peer0.org1.siladocs.com peer lifecycle chaincode approveformyorg \
  -o orderer.siladocs.com:7050 \
  --tls --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --package-id ${PACKAGE_ID} \
  --sequence 1

echo "📢 Committing chaincode..."
docker exec peer0.org1.siladocs.com peer lifecycle chaincode commit \
  -o orderer.siladocs.com:7050 \
  --tls --cafile ${ORDERER_CA} \
  --channelID ${CHANNEL} \
  --name ${CC_NAME} \
  --version ${CC_VERSION} \
  --sequence 1

echo "🌐 Starting Fabric REST API..."
docker compose up -d fabric-api

echo ""
echo "✅ SilaDocs Fabric Network is UP!"
echo "   Peer:        peer0.org1.siladocs.com:7051"
echo "   Orderer:     orderer.siladocs.com:7050 (TLS)"
echo "   CouchDB:     http://localhost:5984/_utils  (admin/adminpw)"
echo "   Fabric API:  http://localhost:8000"
echo "   Channel:     ${CHANNEL}"
echo "   Chaincode:   ${CC_NAME} v${CC_VERSION}"
