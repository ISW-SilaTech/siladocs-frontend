# 🔧 Backend Fabric Integration Fixes

Exact code changes needed in the `siladocs-backend` repository to connect to real Hyperledger Fabric middleware.

## 📁 Files to Modify

### 1. BlockchainFabricRequestDto.java

**Location:** `src/main/java/com/siladocs/application/dto/BlockchainFabricRequestDto.java`

**Current Issue:** Uses snake_case field names that don't match middleware API

**Required Change:** Update to camelCase field names matching middleware contract

```java
package com.siladocs.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el payload enviado a la API REST de Hyperledger Fabric (middleware Python).
 *
 * Matches the middleware API contract at POST /registrar-documento:
 * {
 *   "docID": "String",
 *   "courseID": "String",
 *   "fileName": "String",
 *   "fileType": "String (MIME type)",
 *   "fileSize": "Long",
 *   "fileHash": "String (SHA-256)",
 *   "uploaderEmail": "String",
 *   "institutionName": "String",
 *   "action": "String (create|update|delete)",
 *   "timestamp": "String (ISO-8601)"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainFabricRequestDto {

    @JsonProperty("docID")
    private String docID;

    @JsonProperty("courseID")
    private String courseID;

    @JsonProperty("fileName")
    private String fileName;

    @JsonProperty("fileType")
    private String fileType;

    @JsonProperty("fileSize")
    private Long fileSize;

    @JsonProperty("fileHash")
    private String fileHash;

    @JsonProperty("uploaderEmail")
    private String uploaderEmail;

    @JsonProperty("institutionName")
    private String institutionName;

    @JsonProperty("action")
    private String action;

    @JsonProperty("timestamp")
    private String timestamp;
}
```

### 2. BlockchainFabricResponseDto.java

**Location:** `src/main/java/com/siladocs/application/dto/BlockchainFabricResponseDto.java`

**Current Issue:** Expects `txId` and `status` fields that middleware doesn't provide

**Required Change:** Map to actual middleware response format

```java
package com.siladocs.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * DTO para la respuesta de la API REST de Hyperledger Fabric (middleware Python).
 *
 * The middleware returns:
 * {
 *   "success": boolean,
 *   "transactionID": "String (transaction ID en Fabric)",
 *   "message": "String (mensaje descriptivo)",
 *   "data": { ... document metadata ... }
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainFabricResponseDto {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("transactionID")
    private String transactionID;

    @JsonProperty("message")
    private String message;

    @JsonProperty("data")
    private Map<String, Object> data;

    /**
     * Verifica si la transacción fue exitosa.
     */
    public boolean isSuccessful() {
        return success;
    }

    /**
     * Para retrocompatibilidad: getter para txId que retorna transactionID
     */
    public String getTxId() {
        return transactionID;
    }
}
```

### 3. BlockchainService.java - Imports

**Location:** `src/main/java/com/siladocs/application/service/BlockchainService.java`

**Add these imports:**

```java
import java.time.LocalDateTime;
import java.time.ZoneId;
// Other existing imports...
```

### 4. BlockchainService.java - Endpoint Constants

**Replace:**
```java
private static final String FABRIC_REGISTER_ENDPOINT = "/registrar-hash";
private static final String FABRIC_HEALTH_ENDPOINT = "/health";
private static final String DATE_FORMAT = "yyyy-MM-dd";
private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
```

**With:**
```java
private static final String FABRIC_REGISTER_ENDPOINT = "/registrar-documento";
private static final String FABRIC_HEALTH_ENDPOINT = "/health";
private static final String TIMESTAMP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
private static final DateTimeFormatter timestampFormatter = DateTimeFormatter.ofPattern(TIMESTAMP_FORMAT);
```

### 5. BlockchainService.java - Payload Construction

**Replace (in `registerSyllabusInFabric` method, around line 96-108):**

```java
BlockchainFabricRequestDto payload = BlockchainFabricRequestDto.builder()
        .curso_id(courseId)
        .file_hash(fileHash)
        .issuer(issuerEmail)
        .date(LocalDate.now().format(dateFormatter))
        .file_name(fileName)
        .file_type(fileType)
        .file_size(fileSize)
        .uploader_email(uploaderEmail)
        .institution_name(institutionName)
        .action(action)
        .build();
```

**With:**

```java
String docID = "doc-" + courseId + "-" + System.currentTimeMillis();
String timestamp = LocalDateTime.now(ZoneId.of("UTC")).format(timestampFormatter);

BlockchainFabricRequestDto payload = BlockchainFabricRequestDto.builder()
        .docID(docID)
        .courseID(courseId)
        .fileName(fileName)
        .fileType(fileType)
        .fileSize(fileSize)
        .fileHash(fileHash)
        .uploaderEmail(uploaderEmail)
        .institutionName(institutionName)
        .action(action)
        .timestamp(timestamp)
        .build();
```

### 6. BlockchainService.java - Response Handling

**Replace (in `registerSyllabusInFabric` method, around line 141-150):**

```java
String txId = fabricResponse.getTxId();
if (txId == null || txId.isBlank()) {
    log.error("❌ Fabric no devolvió transaction ID");
    throw new BlockchainException("Fabric no devolvió transaction ID");
}

log.info("✅ Sílabo registrado exitosamente en Fabric: courseId={}, txId={}, timestamp={}",
        courseId, txId, fabricResponse.getTimestamp());

return txId;
```

**With:**

```java
String transactionID = fabricResponse.getTransactionID();
if (transactionID == null || transactionID.isBlank()) {
    log.error("❌ Fabric no devolvió transaction ID");
    throw new BlockchainException("Fabric no devolvió transaction ID");
}

log.info("✅ Sílabo registrado exitosamente en Fabric: courseId={}, transactionID={}, message={}",
        courseId, transactionID, fabricResponse.getMessage());

return transactionID;
```

### 7. application.yml - Configuration

**Location:** `src/main/resources/application.yml`

**Replace:**

```yaml
blockchain:
  fabric:
    api:
      url: ${FABRIC_API_URL:http://host.docker.internal:8000}
    mock:
      enabled: ${BLOCKCHAIN_MOCK_ENABLED:true}
```

**With:**

```yaml
blockchain:
  fabric:
    api:
      url: ${FABRIC_API_URL:http://localhost:8000}
    mock:
      enabled: ${BLOCKCHAIN_MOCK_ENABLED:false}
```

---

## ✅ Validation Checklist

After making changes, verify:

### Code Level
- [ ] All imports added (`LocalDateTime`, `ZoneId`)
- [ ] Field names changed from snake_case to camelCase
- [ ] Endpoint changed from `/registrar-hash` to `/registrar-documento`
- [ ] Timestamp format is ISO-8601 with UTC timezone
- [ ] Response mapping uses `transactionID` and `success`
- [ ] Backward compatibility: `getTxId()` returns `transactionID`

### Compilation
```bash
mvn clean compile
# Should compile without errors
```

### Unit Tests
```bash
mvn test
# Expected: BUILD SUCCESS, Tests run: 11, Failures: 0, Errors: 0
```

### Integration Test

```bash
# 1. Start Fabric middleware
cd siladocs-backend/fabric-middleware
python main.py &

# 2. Run backend with real Fabric mode
export BLOCKCHAIN_MOCK_ENABLED=false
export FABRIC_API_URL=http://localhost:8000
mvn spring-boot:run

# 3. Test upload endpoint
curl -v \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "courseId=1" \
  http://localhost:8080/api/syllabi/upload

# Expected response:
# HTTP/1.1 201 Created
# {
#   "id": 1,
#   "courseId": 1,
#   "fabricTxId": "tx_doc-1-1234567890123",
#   ...
# }
```

---

## 🔄 Migration Path

### Phase 1: Development (Current)
- ✅ Mock mode enabled by default (`BLOCKCHAIN_MOCK_ENABLED=true`)
- ✅ Safe to deploy to Azure with mock mode
- Testing uses simulated MOCK-* transaction IDs

### Phase 2: Local Integration (Next)
- Deploy Fabric middleware locally
- Update backend code with these fixes
- Set `BLOCKCHAIN_MOCK_ENABLED=false`
- Test with real Fabric network
- Verify transaction IDs in blockchain

### Phase 3: Azure Deployment
- Deploy Fabric middleware to Azure Container Instances or Kubernetes
- Update `FABRIC_API_URL` environment variable in Azure App Service
- Set `BLOCKCHAIN_MOCK_ENABLED=false`
- Enable health checks for Fabric middleware
- Monitor logs for Fabric connectivity

### Phase 4: Production
- Run Fabric network on Kubernetes with HA configuration
- Implement CI/CD pipeline for middleware updates
- Add monitoring and alerting
- Enable audit logging
- Set up disaster recovery procedures

---

## 🧪 Test Scenarios

### Scenario 1: Register Document in Fabric

**Input:**
```json
{
  "docID": "doc-course-123-1234567890",
  "courseID": "123",
  "fileName": "Syllabus.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048000,
  "fileHash": "abc123def456...",
  "uploaderEmail": "professor@university.edu",
  "institutionName": "Universidad Nacional",
  "action": "create",
  "timestamp": "2026-04-26T14:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "transactionID": "tx_doc-course-123-1234567890_1234567890123",
  "message": "Document doc-course-123-1234567890 registered successfully",
  "data": {
    "docID": "doc-course-123-1234567890",
    "courseID": "123",
    "timestamp": "2026-04-26T14:30:00Z",
    "fileHash": "abc123def456...",
    "transactionID": "tx_doc-course-123-1234567890_1234567890123"
  }
}
```

### Scenario 2: Verify in PostgreSQL

```sql
SELECT id, course_id, fabric_tx_id, current_hash, status
FROM syllabi
WHERE course_id = 123
ORDER BY updated_at DESC
LIMIT 1;

-- Expected:
-- id  | course_id | fabric_tx_id                              | current_hash           | status
-- 1   | 123       | tx_doc-course-123-1234567890_1234567890 | abc123def456...        | create
```

### Scenario 3: Read from Fabric

```bash
curl http://localhost:8000/leer-documento/doc-course-123-1234567890

# Expected: Document data from blockchain with metadata
```

---

## 📚 Reference

- **Middleware API:** `/tmp/siladocs-backend/fabric-middleware/main.py`
- **Middleware README:** `/tmp/siladocs-backend/fabric-middleware/README.md`
- **Fabric Network:** `/tmp/siladocs-backend/fabric-network/docker-compose.yml`
- **Integration Guide:** See `FABRIC_INTEGRATION_GUIDE.md`

---

**Implementation Time:** ~30 minutes  
**Testing Time:** ~20 minutes  
**Total:** ~50 minutes to fully implement and test
