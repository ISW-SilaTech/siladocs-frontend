# Backend Integration Guide - Hyperledger Fabric

## 📋 Summary

The frontend is now ready and deployed at: **https://siladocs-frontend.vercel.app/**

Your backend needs configuration to work with:
1. **Hyperledger Fabric API** running at `http://20.38.34.192:8000` (on Azure VM)
2. **Blockchain event streaming** for live upload monitoring
3. **Syllabi endpoints** to fetch blockchain data

---

## ⚙️ Environment Variables (Required)

Add these to your Azure App Service configuration:

### Critical Variables
```
FABRIC_API_URL=http://20.38.34.192:8000
BLOCKCHAIN_MOCK_ENABLED=false
```

### How to set in Azure:
1. Azure Portal → **siladocs-backend** (App Service)
2. **Settings** → **Configuration**
3. **Application settings** → Add new:
   - Name: `FABRIC_API_URL`
   - Value: `http://20.38.34.192:8000`
   - Name: `BLOCKCHAIN_MOCK_ENABLED`
   - Value: `false`
4. Click **Save** and **Restart** the App Service

---

## 🔌 API Endpoints Required

### 1. Syllabi Upload with Blockchain Registration
```
POST /syllabi/upload

Request:
  file: <binary>
  courseId: <number>
  action: "create"
  sessionId: "<uuid>" (optional)

Response:
{
  "id": <number>,
  "courseId": <number>,
  "courseName": "string",
  "courseCode": "string",
  "fileUrl": "string",
  "fileSize": <number>,
  "currentHash": "string (SHA-256)",
  "fabricTxId": "string (transaction ID from Fabric)",
  "uploadedAt": "ISO-8601 timestamp",
  "status": "confirmed"
}
```

**Key:** Must include `fabricTxId` from Fabric API.

### 2. Get All Syllabi (for Ledger)
```
GET /syllabi

Response: [{id, courseId, courseName, courseCode, fileUrl, fileSize, currentHash, fabricTxId, uploadedAt, status, ...}]
```

### 3. Live Blockchain Events (SSE)
```
GET /blockchain/events/stream?sessionId=<uuid>

Emit events with names:
- file_received
- hash_computing
- hash_computed
- storage_uploading
- storage_uploaded
- fabric_connecting
- fabric_submitting
- fabric_confirmed (include txId in detail)
- db_saving
- completed
- error
```

---

## 🔄 Backend Integration Steps

### 1. Set Environment Variables in Azure
- `FABRIC_API_URL` = `http://20.38.34.192:8000`
- `BLOCKCHAIN_MOCK_ENABLED` = `false`

### 2. Call Fabric API on Upload
When POST /syllabi/upload is called:

```java
// Pseudocode - implement in your controller
String fileHash = calculateSHA256(file);
String docID = UUID.randomUUID().toString();

// Call Fabric API
RestTemplate restTemplate = new RestTemplate();
Map<String, String> payload = new HashMap<>();
payload.put("docID", docID);
payload.put("courseID", String.valueOf(courseId));
payload.put("fileName", file.getOriginalFilename());
payload.put("fileHash", fileHash);
// ... other fields

ResponseEntity<Map> fabricResponse = restTemplate.postForEntity(
    fabricApiUrl + "/registrar-documento",
    payload,
    Map.class
);

// Extract fabricTxId from response
String fabricTxId = (String) fabricResponse.getBody().get("fabricTxId");

// Save to DB with fabricTxId
syllabus.setFabricTxId(fabricTxId);
syllabusRepository.save(syllabus);
```

### 3. Emit SSE Events (Server-Sent Events)
Send progress updates to client for live blockchain monitoring:

```java
// Send event to client
sseEmitter.send(SseEmitter.event()
    .id(sessionId)
    .name("fabric_confirmed")
    .data("{\"message\":\"Confirmado\",\"detail\":\"" + fabricTxId + "\"}")
    .build());
```

---

## 🧪 Quick Test

1. **Set env vars in Azure** ✓
2. **Restart App Service** ✓
3. **Go to:** https://siladocs-frontend.vercel.app/gestion/silabos
4. **Upload a PDF:**
   - Select course
   - Drag-drop file
   - Click "Subir y Registrar en Blockchain"
5. **Watch events on right side of modal:**
   - Should see: 📥→⚙️→🔑→☁️→✅→🔗→⛓️→🏆→💾→🎉
6. **Success modal shows:**
   - Hash SHA-256
   - Transaction ID (fabricTxId)
7. **Go to:** https://siladocs-frontend.vercel.app/core/blockchain
   - See document in ledger
   - Click to view details
   - Click "Verificar Integridad"

---

## ✅ Deployment Checklist

- [ ] `FABRIC_API_URL` set in Azure App Service
- [ ] `BLOCKCHAIN_MOCK_ENABLED=false` set in Azure
- [ ] App Service restarted
- [ ] Backend calls Fabric API on `/syllabi/upload`
- [ ] Backend returns `fabricTxId` in response
- [ ] Backend emits SSE events to `/blockchain/events/stream`
- [ ] Test upload at https://siladocs-frontend.vercel.app/

---

**Frontend is ready!** Just configure your backend to call the Fabric API.

Fabric Network: `http://20.38.34.192:8000` ✅ (running)
