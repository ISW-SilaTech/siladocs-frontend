# Plan de Acción Final - Blockchain Setup

## Estado Actual del Sistema

✅ **Completado:**
- Frontend desplegado en Vercel
- Backend desplegado en Azure App Service
- Fabric network 2.5.4 corriendo en Azure VM (5 contenedores)
- Chaincode registrado y funcional
- Código de backend actualizado con health checks
- Documentación de testing y diagnóstico creada

⚠️ **Bloqueado:**
- **CONECTIVIDAD**: Azure App Service NO puede alcanzar Fabric API en 20.38.34.192:8000
- Síntoma: Timeout de 30 segundos al intentar subir sílabo

---

## Acción Inmediata Requerida: Diagnosticar Conectividad

### PASO 1: Verificar desde Azure Cloud Shell (SIN necesidad de SSH)

**En Azure Portal:**
1. Abre Cloud Shell (esquina superior derecha)
2. Ejecuta:

```bash
curl -v --max-time 10 http://20.38.34.192:8000/health
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
{"status":"UP","..."}
```

**Posibles resultados:**
- ✅ HTTP 200: Conectividad OK, salta a PASO 3
- ❌ `Connection refused`: Verificar Firewall VM (PASO 2.A)
- ❌ `Timeout (10s)`: Verificar NSG Azure (PASO 2.B)

---

### PASO 2.A: Si recibe "Connection refused"

**En la VM por SSH:**
```bash
ssh azureuser@20.38.34.192

# Verificar que contenedores están corriendo
docker ps | grep -E "fabric-api|fabric-peer"

# Si están corriendo, verificar si puerto está escuchando
sudo netstat -tlnp | grep 8000
# o si no tienes netstat:
sudo ss -tlnp | grep 8000

# Si el puerto NO está en LISTEN, reiniciar contenedor
docker restart fabric-api

# Verificar logs
docker logs fabric-api | tail -20
```

**Si ves que está escuchando:**
```
LISTEN ... 8000 ... (fabric-api container)
```

Entonces el problema es NSG, salta a PASO 2.B.

---

### PASO 2.B: Si recibe "Timeout (10s)"

**En Azure Portal:**
1. Busca "Network Security Groups"
2. Selecciona el NSG de tu VM
3. Menú izquierdo → "Inbound security rules"
4. Busca una regla que permita puerto 8000

**Si NO existe una regla para puerto 8000:**
1. Click "+ Add"
2. Configura:
   - **Source:** Any
   - **Destination Port Ranges:** 8000
   - **Protocol:** TCP
   - **Action:** Allow
   - **Priority:** 100 (o menor que otras reglas)
3. Click "Add"

**Después de agregar:**
- Espera 1-2 minutos (puede haber caching)
- Intenta nuevamente: `curl --max-time 10 http://20.38.34.192:8000/health`

---

### PASO 3: Verificar Health Endpoints del Backend

**En Cloud Shell o terminal:**

```bash
# Health general
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health

# Health de Fabric específicamente
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric
```

**Resultado esperado:**
```json
{
  "status": "UP",
  "fabric_available": true,
  "message": "API disponible"
}
```

**Si `fabric_available: false`:**
- El App Service aún NO puede alcanzar la VM
- Repite PASO 2.A/2.B
- Verifica que esperaste 2 minutos después de cambios en NSG

---

## PASO 4: Redeploy del Backend (Después de Arreglar Conectividad)

Una vez que `curl` al health endpoint funciona, el App Service necesita redeploy:

**Opción A: Trigger automático (si tienes GitHub Actions)**
1. En GitHub, ve a tu backend repo
2. Tab "Actions"
3. Busca el último workflow
4. Click "Re-run failed jobs" o similar

**Opción B: Redeploy manual desde Azure**
1. Portal.azure.com → App Service `siladocs-backend-...`
2. Menú izquierdo → "Deployment Center"
3. Click "Sync" o "Redeploy"
4. Espera ~3 minutos a que complete

**Opción C: Si no hay deployment center**
1. Menú izquierdo → "Diagnose and solve problems"
2. Busca "Restart App Service"
3. Click restart (nota: esto NO actualiza código nuevo)
4. Mejor es hacer un push nuevo a GitHub para trigger deploy

---

## PASO 5: Probar Upload de Sílabo

Una vez completados los pasos anteriores:

1. Abre https://siladocs-frontend.vercel.app
2. Login con: `rector@demo.local / rector123`
3. Navega a: Gestión → Silabos
4. Sube un documento PDF/DOC
5. Observa los eventos de blockchain en tiempo real
6. Espera a que termine (debería tomar ~30-60 segundos)

**Resultado esperado:**
- Eventos sucesivos: file_received → hash_computing → storage_uploading → fabric_submitting → completed
- Modal de éxito con Transaction ID y Hash
- Documento aparece en lista de silabos

**Si falla:**
- Abre DevTools (F12) → Console
- Busca mensajes de error
- Comparte los logs con el diagnóstico del PASO 3 (health endpoint)

---

## PASO 6: Verificar Trazabilidad

1. Después de upload exitoso, click en "Ver Trazabilidad"
2. O navega a: https://siladocs-frontend.vercel.app/core/blockchain
3. Verifica que aparece el documento con:
   - ✅ Hash válido (64 caracteres hexadecimales)
   - ✅ Transaction ID (24+ caracteres)
   - ✅ Timestamp de cuando se registró
   - ✅ Status "confirmed"

---

## Diagrama de Flujo de Conectividad

```
Cliente (Frontend)
   ↓
   ├─ https://siladocs-frontend.vercel.app/api/blockchain/events/stream (SSE)
   │
Vercel (Frontend + Proxy)
   ↓
   ├─ NEXT_PUBLIC_API_URL=https://siladocs-backend-..../api
   │
Azure App Service (Backend - Spring Boot)
   ↓
   ├─ FABRIC_API_URL=http://20.38.34.192:8000 ⚠️ ← ESTO FALLA
   │  (socket connection timeout after 30s)
   │
Azure VM (Fabric Network)
   ↓
   ├─ fabric-api (Port 8000) ✅ Escuchando
   ├─ fabric-peer (Port 7051) ✅ Escuchando
   ├─ fabric-orderer (Port 7050) ✅ Escuchando
   └─ fabric-chaincode ✅ Corriendo
```

**Punto de falla:** Conexión entre App Service y VM está bloqueada

---

## Checklist Final

- [ ] PASO 1: `curl` al health endpoint de la VM retorna HTTP 200
- [ ] PASO 2: NSG tiene regla para puerto 8000 (o firewall VM configurado)
- [ ] PASO 3: `curl` a `/health/fabric` desde App Service retorna `fabric_available: true`
- [ ] PASO 4: Backend redeployado (si es necesario)
- [ ] PASO 5: Upload de sílabo completa exitosamente
- [ ] PASO 6: Documento aparece en blockchain dashboard con datos válidos

---

## Documentación de Referencia

- **NETWORK_DIAGNOSTIC_GUIDE.md**: Troubleshooting detallado de conectividad
- **E2E_TESTING_GUIDE.md**: Guía completa de testing de todos los features
- **Azure Portal**: Para verificar NSG, App Service health, logs

---

## Mensajes de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "connection timed out after 30000 ms" | NSG bloqueando o Firewall VM | PASO 2.A/2.B |
| `fabric_available: false` | App Service no alcanza VM | PASO 3 (repite PASO 2) |
| "No se pudo conectar con Fabric" | Backend obtiene error de conexión | Verifica health endpoint |
| SSE timeout en frontend | `/blockchain/events/stream` sin respuesta | Verificar backend logs |
| Upload "se queda pegado" | Evento de blockchain toma >60s | Verificar logs de fabric-chaincode |

---

## Apoyo Rápido

Si necesitas ayuda, proporciona:
1. Output de `curl` al health endpoint (PASO 1, PASO 3)
2. Screenshot del NSG inbound rules
3. Output de `docker logs fabric-api` (últimas 20 líneas)
4. DevTools Console error si falla frontend

---

## Próximos Pasos Después de Estar Funcional

1. **Documentar Credenciales**: Guardar usuario/contraseña final (no demo)
2. **Configurar Monitoreo**: Application Insights en Azure
3. **Alertas**: Crear alertas para salud de Fabric
4. **Backup**: Fabric chaincodes y cryptographic material
5. **Demo**: Preparar presentación para usuarios finales

---

**Última actualización:** 2026-05-07
**Rama:** claude/setup-blockchain-vm-zBTZG
**Próximo revisor:** Usuario / DevOps
