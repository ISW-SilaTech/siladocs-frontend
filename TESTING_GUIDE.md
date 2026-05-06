# Guía de Prueba End-to-End: Sílabos + Blockchain

## 🚀 Setup Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Asegúrate de que `.env.local` tenga:
```
NEXT_PUBLIC_API_URL=https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

### 3. Correr servidor de desarrollo
```bash
npm run dev
```
Abre: **http://localhost:3000**

---

## 🔐 Test 1: Autenticación

### Demo User (sin necesidad de backend)
1. Ve a `/authentication/sign-in/cover`
2. Usa cualquier email + password (ej: `admin@silados.com` / `password123`)
3. Sistema detecta demo user automáticamente
4. Dashboard carga correctamente

**Verificar:**
- ✅ Redirige al dashboard
- ✅ Navbar muestra institución "SilaTech Demo"
- ✅ No hay errores en consola

---

## 📚 Test 2: Gestión de Sílabos (Upload)

### Subir un sílabo
1. Ve a **Gestión Académica → Sílabos**
2. Click: **"Subir Sílabo"** (botón azul)
3. En el modal:
   - **Curso:** Selecciona cualquier curso (ej: "MAT-101 — Cálculo I")
   - **Archivo:** Arrastra un PDF o DOC (o haz click para seleccionar)
   - Click: **"Subir y Registrar en Blockchain"**

### Live Blockchain Events (panel derecho)
Deberías ver en tiempo real:
```
📥 FILE_RECEIVED
⚙️  HASH_COMPUTING
🔑 HASH_COMPUTED: [SHA256 hash aquí]
☁️  STORAGE_UPLOADING → Azure Blob Storage
✅ STORAGE_UPLOADED
🔗 FABRIC_CONNECTING → Hyperledger Fabric
⛓️  FABRIC_SUBMITTING → Chaincode RegisterSyllabus
🏆 FABRIC_CONFIRMED → TxID: [hex aquí]
💾 DB_SAVING → Backend
🎉 COMPLETED
```

**Verificar:**
- ✅ Todos los eventos fluyen en orden
- ✅ FABRIC_CONFIRMED muestra un TxID
- ✅ Modal muestra success con:
  - Hash SHA-256 (64 caracteres)
  - Transaction ID (fabric)
  - Botón "Ver trazabilidad en el ledger"

### En la tabla de sílabos
1. Regresa al modal (ciérralo y re-abre)
2. Deberías ver tu archivo en la tabla con:
   - Nombre del archivo
   - Código del curso
   - Hash SHA-256 truncado (primeros 16 chars)
   - TX Blockchain (primeros 16 chars del fabricTxId)
   - Estado: "Confirmado" ✅

**Verificar:**
- ✅ El archivo aparece en la tabla
- ✅ El estado es "Confirmado"
- ✅ Hay botones: Ver (👁️), Descargar (⬇️), Eliminar (🗑️)

---

## 🔍 Test 3: Trazabilidad en Blockchain

### Acceder al ledger
1. Click en el botón: **"Ver trazabilidad en el ledger"** (del modal de éxito)
   O navega a: **Core → Blockchain → Trazabilidad**

### Panel Izquierdo: Lista de Cursos
- Deberías ver tus documentos en la lista
- Búsqueda funciona por:
  - Nombre del curso
  - Código del curso
  - Hash truncado

**Verificar:**
- ✅ Tu sílabo aparece en la lista
- ✅ Búsqueda filtra correctamente

### Panel Derecho: Detalles del Documento
Click en tu documento en la lista para ver:

1. **Información General:**
   - Nombre del archivo con icono PDF/Word
   - Indicador: "Vigilado bajo Hyperledger Fabric"
   - Botón: "Verificar Integridad" (azul)

2. **Sección de Datos:**
   - Hash SHA-256 (completo, 64 caracteres)
   - Bloque de Red: `#1` (o número de bloque)
   - Canal: `silabos-channel`

3. **Historial de Transacciones:**
   - Icono 📥 para CREATION
   - Acción: "CREATION"
   - Timestamp: fecha/hora en formato español
   - Actor: "Sistema"
   - Badge: `TxID: [primeros 32 chars]...`

**Verificar:**
- ✅ Hash mostrado es el mismo que en la tabla de sílabos
- ✅ TxID coincide con el fabricTxId
- ✅ Timestamp es reciente (hoy)

### Verificar Integridad
Click en botón "Verificar Integridad":
- Debe mostrar alert: ✅ **Inmutabilidad Comprobada**
- Mensaje: "El hash coincide con el bloque #X de Hyperledger Fabric"

**Verificar:**
- ✅ Sin errores en consola
- ✅ Alert muestra el número de bloque correcto

---

## 🧪 Test 4: Casos Edge

### 4a. Subir múltiples sílabos
1. Sube 3-4 PDFs diferentes a cursos diferentes
2. Espera confirmación blockchain para cada uno
3. Ve al ledger → deberías ver todos en la lista

**Verificar:**
- ✅ Todos aparecen con diferente TxID
- ✅ Búsqueda filtra entre múltiples

### 4b. Descargar un sílabo
1. En tabla de sílabos → click botón "Descargar" (⬇️)
2. El archivo debería descargarse desde Azure Blob Storage

**Verificar:**
- ✅ Descarga comienza
- ✅ Archivo tiene el nombre correcto

### 4c. Eliminar un sílabo
1. Click botón "Eliminar" (🗑️)
2. Confirma en el dialog
3. El sílabo desaparece de la tabla

**Verificar:**
- ✅ Desaparece de la tabla
- ✅ Desaparece del ledger (si recargas la página)

### 4d. Vista previa
1. Click botón "Ver" (👁️) en la tabla
2. Modal muestra detalles completos del sílabo

**Verificar:**
- ✅ Muestra hash SHA-256 completo
- ✅ Muestra status "Confirmado"
- ✅ Muestra TX Blockchain

---

## 🌐 Test 5: Backend Integration

### Verificar conexión con Fabric API
1. Abre DevTools (F12)
2. Ve a **Network tab**
3. Sube un sílabo y observa las requests:

**Expected requests:**
- `POST /syllabi/upload` → 200 ✅
- El response debe incluir:
  - `fabricTxId`: hex string de 64+ chars
  - `currentHash`: SHA-256 hash
  - `status`: "confirmed" o "pending"

### Verificar ledger calls
1. Ve al ledger → lista carga
2. En Network tab, deberías ver:
- `GET /syllabi` → 200 ✅
- Response: array de sílabos con `fabricTxId` y `hash`

---

## 🐛 Troubleshooting

### Error: "Error al cargar los sílabos"
- **Causa:** Backend no responde
- **Fix:** 
  1. Verifica que `NEXT_PUBLIC_API_URL` es correcto en `.env.local`
  2. Chequea que el backend Azure está running
  3. Revisa DevTools Network tab para ver el error real

### Error: "No se pudo contactar con los nodos de verificación"
- **Causa:** `/syllabi/:id/verify` endpoint no existe
- **Fix:** Es expected en la demo - usa fallback (verifica por presencia de TxID)

### Hash no coincide en trazabilidad
- **Causa:** Datos desincronizados
- **Fix:** Recarga la página (`F5`)

### No hay eventos blockchain en vivo
- **Causa:** SSE connection falló
- **Fix:** 
  1. Verifica que backend soporta `/blockchain/events/stream`
  2. Recarga el modal de upload
  3. Chequea Network tab: debería haber connection a `/blockchain/events/stream?sessionId=...`

---

## ✅ Checklist Final

- [ ] Login funciona (demo user)
- [ ] Sílabo se sube exitosamente
- [ ] Eventos blockchain fluyen en vivo
- [ ] Success modal muestra hash + TxID
- [ ] Archivo aparece en tabla
- [ ] Archivo aparece en ledger
- [ ] Búsqueda en ledger filtra correctamente
- [ ] Detalles muestran hash + TxID + historial
- [ ] Verificación de integridad funciona
- [ ] Descarga de archivo funciona
- [ ] Eliminación de archivo funciona
- [ ] DevTools Console sin errores

---

## 📱 URLs de Acceso Local

| Página | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Login | http://localhost:3000/authentication/sign-in/cover |
| Sílabos | http://localhost:3000/gestion/silabos |
| Blockchain Ledger | http://localhost:3000/core/blockchain |
| Backend (Azure) | https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net |
| Fabric API (VM) | http://20.38.34.192:8000 |

---

## 📊 Expected Data Flow

```
User Upload
    ↓
Frontend: /gestion/silabos
    ↓
    POST /syllabi/upload
    ↓
Backend (Azure)
    ↓
    1. Hash: SHA-256
    2. Upload: Azure Blob Storage
    3. Register: POST http://20.38.34.192:8000/registrar-documento
    ↓
Fabric API (VM)
    ↓
    1. Call chaincode RegisterSyllabus
    2. Write to ledger
    3. Return fabricTxId
    ↓
Backend stores in DB
    ↓
Frontend gets response with fabricTxId
    ↓
SSE events: COMPLETED
    ↓
User sees success modal

---

View Ledger
    ↓
Frontend: /core/blockchain
    ↓
    GET /syllabi
    ↓
Backend queries DB
    ↓
Frontend maps to SyllabusTrace format
    ↓
Display list + details
```

---

¡Buena suerte con las pruebas! 🚀
