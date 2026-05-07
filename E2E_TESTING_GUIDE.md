# Guía Completa de Testing E2E - SilaDocs Blockchain

## Pre-requisitos Verificados

Antes de hacer cualquier test, asegúrate que:

- [ ] Frontend está desplegado en Vercel: https://siladocs-frontend.vercel.app
- [ ] Backend está desplegado en Azure: https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api
- [ ] Fabric API está en VM: http://20.38.34.192:8000
- [ ] Todos los contenedores en la VM están corriendo: `docker ps` en la VM

---

## Fase 1: Verificar Conectividad Backend ↔ Fabric

**Duración estimada: 5 minutos**

### Paso 1.1: Test desde Cloud Shell (sin necesidad de SSH a VM)

```bash
# En Azure Cloud Shell (portal.azure.com → Cloud Shell)
curl -v --max-time 10 http://20.38.34.192:8000/health
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
{"status":"UP",...}
```

**Si timeout o rechazo:**
- Ir a NETWORK_DIAGNOSTIC_GUIDE.md
- Verificar NSG en Azure Portal
- Verificar firewall en VM

### Paso 1.2: Test Health Endpoints del Backend

```bash
# Health general
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health

# Health de Fabric
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric

# Health detallado
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric/detail
```

**Resultado esperado:**
```json
{
  "status": "UP",
  "fabric_available": true
}
```

**Si `fabric_available: false`:**
- El App Service NO puede alcanzar la VM
- Revisar NETWORK_DIAGNOSTIC_GUIDE.md
- No puedes continuar sin resolver esto

---

## Fase 2: Autenticación en Frontend

**Duración estimada: 3 minutos**

### Paso 2.1: Acceder al Frontend

1. Abre https://siladocs-frontend.vercel.app en el navegador
2. Deberías ver la página de login

### Paso 2.2: Usar Demo Credentials

El frontend incluye usuarios de demo para testing:

**Usuario: Rector**
- Email: `rector@demo.local`
- Contraseña: `rector123`
- Rol: Rector
- Permisos: Acceso total

**Usuario: Academic Admin**
- Email: `academicadmin@demo.local`
- Contraseña: `admin123`
- Rol: Academic Admin
- Permisos: Gestión de silabos

### Paso 2.3: Login

1. Entra con `rector@demo.local / rector123`
2. Deberías ver el dashboard principal
3. Verifica que aparezca tu institución en el menú

**Si falla el login:**
- Abre DevTools (F12) → Network tab
- Intenta login nuevamente
- Busca la petición POST a `/auth/login`
- Verifica el response

---

## Fase 3: Navegar a Gestión de Silabos

**Duración estimada: 2 minutos**

### Paso 3.1: Acceder a Silabos

1. En el dashboard, busca "Gestión" → "Silabos"
2. O navega a: `https://siladocs-frontend.vercel.app/gestion/silabos`
3. Deberías ver:
   - Lista vacía o con silabos existentes (izquierda)
   - Panel de upload (derecha)
   - Panel de blockchain events (esquina superior derecha)

---

## Fase 4: Upload de Sílabo con Blockchain

**⚠️ CRÍTICO: Solo procede si Fase 1 y 2 pasaron**

**Duración estimada: 2-3 minutos**

### Paso 4.1: Preparar Documento

1. Descarga un archivo PDF o DOC de prueba
   - O crea uno simple con texto (mínimo 1 KB)
   - Ejemplo: "Test Syllabus for Course XYZ" guardado como `test-syllabus.pdf`

### Paso 4.2: Cargar en Frontend

1. En la página de silabos, drag-drop el archivo en el área de upload
   - O click en "Seleccionar archivo"
2. Espera a que se muestre en la lista

### Paso 4.3: Observar Blockchain Events

**IMPORTANTE: Abre DevTools → Console antes de hacer upload**

En la consola, deberías ver eventos como:
```
[BlockchainEvents] file_received: {...}
[BlockchainEvents] hash_computing: {...}
[BlockchainEvents] hash_computed: {...}
[BlockchainEvents] storage_uploading: {...}
[BlockchainEvents] storage_uploaded: {...}
[BlockchainEvents] fabric_connecting: {...}
[BlockchainEvents] fabric_submitting: {...}
[BlockchainEvents] fabric_confirmed: {...}
[BlockchainEvents] db_saving: {...}
[BlockchainEvents] completed: {...}
```

**Si ves eventos:**
- ✅ El SSE stream está funcionando
- ✅ El blockchain está registrando

**Si NO ves eventos o ves error:**
- [ ] Abre DevTools → Network
- [ ] Busca conexión `stream?sessionId=...`
- [ ] Si está en estado "pending" por 30s+: timeout
- [ ] Si no existe: endpoint no está disponible

### Paso 4.4: Esperar Confirmación

El upload debería:
1. Mostrar progreso en tiempo real
2. Tomar ~30-60 segundos para completar
3. Mostrar modal de "Éxito" con:
   - Transaction ID
   - File Hash
   - Link a "Ver Trazabilidad"

**Tiempos esperados por evento:**
- file_received: <1s
- hash_computing: 2-5s
- storage_uploading: 3-10s
- fabric_submitting: 5-15s
- completed: <1s

**Si se queda pegado en algún evento:**
- Abre DevTools → Network
- Busca si hay error en `/blockchain/events/stream`
- O error HTTP en `/syllabi/upload`

---

## Fase 5: Verificar Trazabilidad

**Duración estimada: 2 minutos**

### Paso 5.1: Acceder a Blockchain Dashboard

1. Click en "Ver Trazabilidad" o navega a: `https://siladocs-frontend.vercel.app/core/blockchain`
2. Deberías ver:
   - Tabla con curso y documento
   - Panel con detalles del blockchain
   - Hash del archivo
   - Transaction ID

### Paso 5.2: Verificar Información

- [ ] Course/Document aparece en la lista
- [ ] Hash es visible (40+ caracteres)
- [ ] Transaction ID es visible (24+ caracteres)
- [ ] Status muestra confirmado en blockchain

---

## Fase 6: Pruebas Avanzadas (Opcional)

### 6.1: Múltiples Uploads

- Sube 3-5 documentos más
- Verifica que todos aparecen en la lista
- Intenta buscar por nombre de curso

### 6.2: Verificación de Hash

1. En blockchain dashboard, copia el Hash de un documento
2. Usa la herramienta de verificación (si existe)
3. O calcula hash del archivo original:
   ```bash
   # Linux/Mac
   sha256sum archivo.pdf
   
   # PowerShell
   (Get-FileHash archivo.pdf -Algorithm SHA256).Hash
   ```
4. Compara con el hash en blockchain

### 6.3: Verificación de Inmutabilidad

En blockchain dashboard, intenta encontrar:
- Timestamp del registro
- Bloque donde se registró
- Otro documento en el mismo bloque

---

## Troubleshooting Rápido

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Upload se queda en "hash_computing" | >10s sin progreso | Revisar DevTools Console para errores |
| "Blockchain rechazó" error | Upload falla | Verificar que `fabric_available` es true en `/health/fabric` |
| No hay eventos en tiempo real | Upload completa pero sin SSE | Verificar que `/blockchain/events/stream` no tiene 401 |
| Lista de silabos vacía | Aunque se subieron documentos | Verificar que la BD tiene registros (consulta SQL) |
| Transaction ID NULL | Sílabo subido pero sin Tx ID | Fabric no devolvió ID (revisar logs de la VM) |

---

## Logs a Revisar

### Frontend Console
```
DevTools → Console
Buscar: "ERROR", "BlockchainEvents", "SSE"
```

### Backend Logs (Azure Portal)
```
Portal.azure.com → App Service → Log Stream
Buscar: "BlockchainService", "fabric_connecting", "fabric_confirmed"
```

### Fabric VM Logs
```
docker logs fabric-api
docker logs fabric-peer
docker logs fabric-orderer
```

---

## Checklist Final

- [ ] Fase 1: `curl` al health endpoint retorna 200 + `fabric_available: true`
- [ ] Fase 2: Login con demo user exitoso
- [ ] Fase 3: Página de silabos carga correctamente
- [ ] Fase 4: Upload de documento funciona
- [ ] Fase 4: Eventos de blockchain aparecen en tiempo real
- [ ] Fase 4: Modal de éxito con Transaction ID
- [ ] Fase 5: Documento aparece en blockchain dashboard
- [ ] Fase 5: Hash y TX ID son válidos

**Si todos los checks pasan: ✅ Sistema E2E funcional**

---

## Próximos Pasos

1. **Producción:** Documentar usuario/contraseña final para demo
2. **Métricas:** Configurar Application Insights en Azure
3. **Monitoreo:** Alertas para health check failures
4. **Documentación:** Crear manual de usuario para instituciones
