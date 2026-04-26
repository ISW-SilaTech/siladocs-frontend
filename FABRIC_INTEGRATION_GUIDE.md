# 🔗 SilaDocs Hyperledger Fabric Integration Guide

Complete instructions for connecting the SilaDocs platform to real Hyperledger Fabric middleware.

## 📋 Overview

The SilaDocs system has three layers:
1. **Frontend** (Next.js) - User interface for document upload
2. **Backend** (Spring Boot) - Business logic and database management  
3. **Fabric Middleware** (Python FastAPI) - REST gateway to Hyperledger Fabric network
4. **Fabric Network** (Docker Compose) - Hyperledger Fabric blockchain

## ⚠️ Current Status

✅ **Mock Mode Enabled** (Default)
- Backend returns simulated `MOCK-` prefixed transaction IDs
- No actual Fabric connection required for initial testing
- Safe for development and Azure deployment

🔄 **Real Fabric Mode** (What you're setting up now)
- Backend connects to actual Fabric middleware
- All uploads registered in blockchain
- Transaction IDs linked to blockchain ledger

---

## 🚀 Step 1: Deploy Fabric Middleware Locally

### Option A: Local Development (with Docker)

```bash
# 1. Navigate to backend fabric-network directory
cd siladocs-backend/fabric-network

# 2. Start the Fabric network
docker-compose up -d

# Verify all services started
docker-compose ps

# Expected output:
# ca.siladocs.com      ✓ UP
# orderer.siladocs.com ✓ UP  
# couchdb              ✓ UP
# peer0.org1.siladocs  ✓ UP
```

### Option B: Using Docker Buildkit (Recommended)

```bash
# Build the middleware image
cd siladocs-backend/fabric-middleware
docker build -t siladocs-fabric-middleware:latest .

# Run the middleware container connected to Fabric network
docker run -d \
  --name fabric-middleware \
  --network fabric-network_siladocs-fabric \
  -e FABRIC_MIDDLEWARE_HOST=0.0.0.0 \
  -e FABRIC_MIDDLEWARE_PORT=8000 \
  -e FABRIC_API_URL=http://fabric-ca:7054 \
  -p 8000:8000 \
  siladocs-fabric-middleware:latest

# Verify middleware is running
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "message": "SilaDocs Fabric Middleware is running",
#   "version": "1.0.0"
# }
```

### Option C: Python Virtual Environment (Local Development)

```bash
# 1. Navigate to middleware directory
cd siladocs-backend/fabric-middleware

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the middleware
python main.py

# Check health
curl http://localhost:8000/health
```

---

## 🔧 Step 2: Update Backend Configuration

The backend needs to be configured to connect to real Fabric instead of mock mode.

### Backend Changes Required

**File:** `siladocs-backend/src/main/resources/application.yml`

Change from:
```yaml
blockchain:
  fabric:
    api:
      url: ${FABRIC_API_URL:http://host.docker.internal:8000}
    mock:
      enabled: ${BLOCKCHAIN_MOCK_ENABLED:true}  # ← MOCK MODE
```

To:
```yaml
blockchain:
  fabric:
    api:
      url: ${FABRIC_API_URL:http://localhost:8000}
    mock:
      enabled: ${BLOCKCHAIN_MOCK_ENABLED:false}  # ← REAL FABRIC
```

### Backend DTOs Need Updates

The backend DTOs in `/src/main/java/com/siladocs/application/dto/` need to be updated to match the actual middleware API contract.

**Key Changes:**

1. **BlockchainFabricRequestDto.java** - Request payload
   - Change field names from snake_case to camelCase
   - Add `timestamp` field (ISO-8601 format)
   - Use `docID` and `courseID` instead of `curso_id`
   - Use `fileName`, `fileType`, `fileSize` instead of snake_case equivalents
   
2. **BlockchainFabricResponseDto.java** - Response mapping  
   - Change `txId` field to `transactionID`
   - Map `success` (boolean) instead of `status` (string)
   - Add `data` field for document metadata

3. **BlockchainService.java** - API integration
   - Change endpoint from `/registrar-hash` to `/registrar-documento`
   - Update timestamp format to ISO-8601 (with UTC timezone)
   - Generate unique `docID` as `doc-{courseId}-{timestamp}`

**Prepared Changes:** The fixes have been drafted for you in `/tmp/siladocs-backend/` with the correct DTOs and service updates.

---

## 🔌 Step 3: Environment Variables

### Local Development (application.yml)

```yaml
blockchain:
  fabric:
    api:
      url: http://localhost:8000  # or http://fabric-middleware:8000 if Docker
    mock:
      enabled: false              # ← Disable mock mode
```

### Docker Compose Environment

Create/update `.env` in project root:

```bash
# Backend Configuration
FABRIC_API_URL=http://fabric-middleware:8000
BLOCKCHAIN_MOCK_ENABLED=false

# Fabric Middleware Configuration
FABRIC_MIDDLEWARE_HOST=0.0.0.0
FABRIC_MIDDLEWARE_PORT=8000
LOG_LEVEL=INFO
```

### Azure App Service Deployment

Set these environment variables in Azure Portal:

**App Service → Configuration → Application Settings:**

| Key | Value |
|-----|-------|
| `FABRIC_API_URL` | `http://<fabric-middleware-url>:8000` |
| `BLOCKCHAIN_MOCK_ENABLED` | `false` |

---

## ✅ Step 4: Verify Fabric Connectivity

### Test the Middleware Health Endpoint

```bash
# Test health check
curl -v http://localhost:8000/health

# Expected: 200 OK
# {
#   "status": "healthy",
#   "message": "SilaDocs Fabric Middleware is running",
#   "version": "1.0.0"
# }
```

### Test Fabric Registration

```bash
# Register a test document
curl -X POST http://localhost:8000/registrar-documento \
  -H "Content-Type: application/json" \
  -d '{
    "docID": "test-doc-001",
    "courseID": "curso-123",
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "fileHash": "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz56abcd789012",
    "uploaderEmail": "test@siladocs.com",
    "institutionName": "Test University",
    "action": "create",
    "timestamp": "2026-04-26T10:30:00Z"
  }'

# Expected response (success):
# {
#   "success": true,
#   "transactionID": "tx_test-doc-001_1234567890123",
#   "message": "Document test-doc-001 registered successfully",
#   "data": { ... }
# }
```

### Test Backend Integration

```bash
# Once middleware is running, test the backend endpoint
curl -v http://localhost:8080/api/syllabi/health

# The backend will try to connect to Fabric middleware
```

---

## 🧪 Step 5: End-to-End Testing

### 1. Upload a Syllabus (with real Fabric)

Frontend: `Gestión → Sílabos → Seleccionar curso → Upload PDF`

**Expected Flow:**
1. ✅ File uploaded to MinIO
2. ✅ SHA-256 hash calculated
3. ✅ Registration sent to Fabric middleware
4. ✅ **Real transaction ID** returned (format: `tx_doc-123-456...`)
5. ✅ Transaction ID stored in PostgreSQL
6. ✅ Success message shown in UI

### 2. Verify in Blockchain

Check if the document is registered in Fabric:

```bash
# Read the document from Fabric
curl http://localhost:8000/leer-documento/doc-123-1234567890

# Get all documents for a course
curl http://localhost:8000/documentos-curso/curso-123

# Check CouchDB (state database)
curl http://localhost:5984/fabric/_design/docs -u admin:adminpw
```

### 3. Check Logs

**Middleware logs:**
```bash
docker logs fabric-middleware

# or if running locally:
# Check console output from `python main.py`
```

**Backend logs:**
```bash
# In Spring Boot application logs
# Should show: "⛓️ REGISTRANDO EN HYPERLEDGER FABRIC..."
# Then: "✅ FABRIC EXITOSO: transactionID=tx_..."
```

**Database check:**
```sql
SELECT id, fabric_tx_id, current_hash FROM syllabi 
WHERE course_id = ? 
ORDER BY updated_at DESC;
```

---

## 🐳 Docker Compose Full Stack (Production-like)

### Combined docker-compose.yml

Create `docker-compose.prod.yml` to run all services together:

```yaml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: siladocs
      POSTGRES_USER: siladocs
      POSTGRES_PASSWORD: secure-password
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # MinIO (Object Storage)
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data

  # Fabric Network (from existing docker-compose.yml)
  ca.siladocs.com:
    image: hyperledger/fabric-ca:latest
    # ... (copy from fabric-network/docker-compose.yml)

  # Fabric Middleware
  fabric-middleware:
    build:
      context: ./siladocs-backend/fabric-middleware
      dockerfile: Dockerfile
    environment:
      FABRIC_MIDDLEWARE_HOST: 0.0.0.0
      FABRIC_MIDDLEWARE_PORT: 8000
      FABRIC_API_URL: http://fabric-ca:7054
      LOG_LEVEL: INFO
    ports:
      - "8000:8000"
    depends_on:
      - ca.siladocs.com
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Spring Boot Backend
  backend:
    build:
      context: ./siladocs-backend
      dockerfile: Dockerfile
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/siladocs
      SPRING_DATASOURCE_USERNAME: siladocs
      SPRING_DATASOURCE_PASSWORD: secure-password
      FABRIC_API_URL: http://fabric-middleware:8000
      BLOCKCHAIN_MOCK_ENABLED: "false"
      MINIO_ENDPOINT: http://minio:9000
      JWT_SECRET: your-secure-jwt-secret-min-32-chars
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - minio
      - fabric-middleware
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres-data:
  minio-data:

networks:
  default:
    name: siladocs-network
    driver: bridge
```

Run the full stack:

```bash
docker-compose -f docker-compose.prod.yml up -d

# Monitor services
docker-compose -f docker-compose.prod.yml logs -f

# Stop everything
docker-compose -f docker-compose.prod.yml down
```

---

## 🚨 Troubleshooting

### Problem: "Connection refused" when uploading

**Cause:** Middleware not running or wrong URL

**Solution:**
```bash
# Check if middleware is running
curl http://localhost:8000/health

# Check backend logs
grep "FABRIC_API_URL" logs.txt
grep "BlockchainService" logs.txt

# Verify in application.yml
# FABRIC_API_URL should be http://localhost:8000 (not 127.0.0.1)
```

### Problem: 500 Error "Docker internal address issue"

**Current:** Backend using `host.docker.internal:8000` (Windows/Mac specific)

**Solution:** Change to `localhost:8000` for Linux, or use container network name `fabric-middleware:8000` for Docker-to-Docker communication.

```yaml
blockchain:
  fabric:
    api:
      url: http://fabric-middleware:8000  # Use container network
```

### Problem: "Table SYLLABI not found" in tests

**Cause:** Flyway migrations run before Hibernate creates tables

**Solution:** Already fixed with idempotent migration:
```sql
ALTER TABLE IF EXISTS syllabi ADD COLUMN IF NOT EXISTS fabric_tx_id VARCHAR(255);
```

### Problem: Transaction IDs still showing as "MOCK-*"

**Cause:** Mock mode still enabled

**Solution:**
1. Check environment variables
2. Verify `BLOCKCHAIN_MOCK_ENABLED=false`
3. Restart backend application
4. Check logs for: `⚠️ MOCK MODE: Fabric no activo`

---

## 📊 Fabric Network Architecture

```
┌─────────────────────────────────────┐
│        Frontend (Next.js)           │
│     Port 3000, React UI             │
└──────────────────┬──────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────┐
│      Backend (Spring Boot)          │
│     Port 8080, Business Logic       │
└──────────────────┬──────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────┐
│    Fabric Middleware (FastAPI)      │
│      Port 8000, REST Gateway        │
└──────────────────┬──────────────────┘
                   │ gRPC (Future)
                   ▼
┌─────────────────────────────────────┐
│   Hyperledger Fabric Network        │
├─────────────────────────────────────┤
│ • Certificate Authority (CA)        │
│ • Orderer                           │
│ • Peer (State Database: CouchDB)    │
│ • Chaincode (Smart Contracts)       │
└─────────────────────────────────────┘
```

---

## 📝 Summary Checklist

- [ ] Fabric network running (`docker-compose ps`)
- [ ] Fabric middleware running (`curl localhost:8000/health`)
- [ ] Backend DTOs updated with camelCase field names
- [ ] Endpoint changed from `/registrar-hash` to `/registrar-documento`
- [ ] Mock mode disabled (`BLOCKCHAIN_MOCK_ENABLED=false`)
- [ ] `FABRIC_API_URL` environment variable set correctly
- [ ] Backend restarted
- [ ] Test document registration via `/registrar-documento`
- [ ] Backend registers document in Fabric
- [ ] Transaction ID returned (format: `tx_doc-*`)
- [ ] Frontend shows real transaction ID (not MOCK-*)
- [ ] PostgreSQL stores transaction ID in `fabric_tx_id` column

---

## 🎯 Next Steps

1. **Immediate:** Deploy Fabric middleware locally (Option A or B)
2. **This week:** Update backend DTOs and configuration  
3. **Testing:** Verify end-to-end flow with real Fabric
4. **Azure:** Deploy to Azure App Service with Fabric middleware URL
5. **Production:** Set up HA Fabric network on Kubernetes

---

**Contact:** SilaTech Development Team  
**Date:** April 2026
**Version:** 1.0 - Fabric Integration Guide
