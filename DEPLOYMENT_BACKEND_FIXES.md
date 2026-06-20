# 🚀 Instrucciones de Despliegue - Backend con Fixes de Logging

## Resumen de Cambios en el Backend

Se han agregado mejoras de logging para debuguear el problema de límite de 4 sílabos:

### Cambios Realizados:

1. **SyllabusService.java** (línea 224)
   - Logging detallado del total de sílabos en la BD
   - Información individual de cada sílabo
   - Verificación que no hay LIMIT 4 hardcodeado

2. **SyllabusController.java** (línea 57)
   - Logging de llamadas al endpoint GET /syllabi
   - Nuevo endpoint de debugging: `/syllabi/debug/count`

### Nuevo Endpoint de Debugging:

```
GET /api/syllabi/debug/count
```

**Respuesta esperada:**
```json
{
  "totalWithDeleted": 15,
  "activeOnly": 12,
  "syllabi": [
    {
      "id": 1,
      "courseId": 1,
      "courseName": "Matemática",
      "courseCode": "MAT101",
      "fileUrl": "...",
      "fileSize": 0,
      "currentHash": "...",
      "status": "create",
      "createdAt": "2026-06-20T...",
      "fabricTxId": "..."
    },
    ...
  ]
}
```

---

## 📋 Instrucciones de Despliegue en Azure

### Opción 1: GitHub Actions (Automático - Recomendado)

Los cambios se han pushes a GitHub automáticamente. Si el repositorio tiene configurado GitHub Actions:

```bash
# El despliegue se hará automáticamente al hacer push a main
# Espera 3-5 minutos para que Azure procese los cambios
```

**Verificar despliegue:**
```bash
curl -I https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/actuator/health
# Debe devolver HTTP 200
```

### Opción 2: Azure CLI (Manual)

```bash
# 1. Navega a la carpeta del backend
cd /tmp/siladocs-backend

# 2. Asegúrate de que el JAR está compilado
ls -lh target/siladocs-backend.jar

# 3. Instala Azure CLI (si no está instalado)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 4. Login en Azure
az login
# Se abrirá un navegador para autenticarse

# 5. Deploy el JAR a Azure
az webapp deployment source config-zip \
  --resource-group <tu-resource-group> \
  --name siladocs-backend-ejfkddf7fkgucrh6 \
  --src target/siladocs-backend.jar

# Espera 3-5 minutos
```

### Opción 3: Portal de Azure (UI)

1. **Abre Azure Portal:**
   - https://portal.azure.com

2. **Navega a App Service:**
   - Busca: "siladocs-backend-ejfkddf7fkgucrh6"

3. **Ve a Deployment Center:**
   - Deployment Center → Settings

4. **Conecta con GitHub:**
   - Selecciona GitHub como fuente
   - Autoriza el repositorio
   - Selecciona rama: main
   - Haz clic en "Save"

5. **Azure desplegará automáticamente en cada push**

---

## 🔍 Verificar que los Logs están Activos

### 1. En Azure Portal:

```
Siladocs Backend → Monitoring → Logs → Custom Logs
```

Buscar: `[SYLLABI DEBUG]` o `[SYLLABI API]`

### 2. Vía Azure CLI:

```bash
az webapp log tail \
  --name siladocs-backend-ejfkddf7fkgucrh6 \
  --resource-group <tu-resource-group>
```

Debería mostrar:
```
[SYLLABI API] GET /syllabi endpoint called
[SYLLABI DEBUG] Iniciando getAllSyllabi()
[SYLLABI DEBUG] Total de sílabos en BD (deleted=false): 4
[SYLLABI DEBUG] Retornando 4 sílabos
```

---

## 🧪 Pruebas Post-Despliegue

### Paso 1: Verificar que el backend está corriendo

```bash
curl -X GET https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/actuator/health

# Respuesta esperada:
# {"status":"UP"}
```

### Paso 2: Obtener información de debugging

```bash
curl -X GET https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/syllabi/debug/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Deberías ver la respuesta con los sílabos
```

### Paso 3: En el frontend

1. Abre: https://siladocs-frontend.vercel.app/gestion/silabos/
2. Abre DevTools (F12) → Console
3. Busca logs que digan: `[SYLLABI DEBUG] Response data length: X`
4. Si X = 4, el problema persiste
5. Si X > 4, el problema está resuelto (había solo 4 en la BD)

---

## 📊 Interpretación de Resultados

### Escenario 1: Siempre 4 sílabos
```
[SYLLABI DEBUG] Total de sílabos en BD (deleted=false): 4
```
**Conclusión:** No hay un LIMIT 4 en el código. Solo existen 4 sílabos en la BD. Carga más sílabos para verificar.

### Escenario 2: Más de 4 sílabos
```
[SYLLABI DEBUG] Total de sílabos en BD (deleted=false): 15
```
**Conclusión:** El código está bien. El frontend ahora debería mostrar todos.

### Escenario 3: Error en el endpoint
```
Error: Connection refused
```
**Acción:** Espera 3-5 minutos a que Azure termine de desplegar. Si persiste, revisa los logs en Azure Portal.

---

## 🔧 Logs Importantes

### En Azure Portal:

Navega a:
```
App Service → Monitoring → Log stream
```

O busca en:
```
App Service → Monitoring → Diagnostic settings → Send to Log Analytics
```

Luego en Log Analytics Workspace busca:
```
AppServiceConsoleLogs
| where Message contains "[SYLLABI"
| order by TimeGenerated desc
```

---

## ✅ Checklist Post-Despliegue

- [ ] ✅ El commit `a93475e` está en GitHub (main branch)
- [ ] ✅ Azure ha procesado los cambios (esperar 3-5 minutos)
- [ ] ✅ El endpoint `/api/actuator/health` devuelve 200 OK
- [ ] ✅ El endpoint `/api/syllabi/debug/count` devuelve datos
- [ ] ✅ Los logs muestran `[SYLLABI DEBUG]` en Azure Portal
- [ ] ✅ El frontend muestra los sílabos correctamente

---

## 🆘 Solución de Problemas

### "Error: 404 en /api/syllabi/debug/count"
- El backend no ha desplegado correctamente
- Espera 5 minutos más y intenta nuevamente
- Revisa los logs en Azure Portal

### "Error: 401 Unauthorized"
- Falta el token JWT
- Obtén un token válido del endpoint de login

### "Total de sílabos: 4 (no cambia)"
- Solo existen 4 sílabos en la base de datos
- Carga más sílabos desde el frontend
- Verifica en la BD directamente:
  ```sql
  SELECT COUNT(*) FROM syllabi WHERE deleted = false;
  ```

---

## 📞 Información de Despliegue

| Aspecto | Valor |
|---------|-------|
| **JAR Compilado** | `/tmp/siladocs-backend/target/siladocs-backend.jar` |
| **Tamaño del JAR** | 110 MB |
| **MD5 Hash** | `10ca1ed00a14c37db80567fa725d5ee6` |
| **Commit Backend** | `a93475e` |
| **Branch** | main |
| **App Service** | siladocs-backend-ejfkddf7fkgucrh6 |
| **Region** | westus3 |

---

## 📝 Cambios en el Código

### SyllabusService.java

```java
@Transactional(readOnly = true)
public List<SyllabusResponse> getAllSyllabi() {
    log.info("[SYLLABI DEBUG] Iniciando getAllSyllabi()");

    List<SyllabusEntity> allSyllabi = syllabusRepo.findByDeletedFalse();
    log.info("[SYLLABI DEBUG] Total de sílabos en BD (deleted=false): {}", allSyllabi.size());

    List<SyllabusResponse> result = allSyllabi.stream()
            .map(s -> new SyllabusResponse(s.getId(), s.getCourse().getId(),
                    s.getCourse().getName(), s.getCourse().getCode(),
                    s.getFileUrl(), 0L, s.getCurrentHash(), s.getStatus(),
                    s.getCreatedAt(), s.getFabricTxId()))
            .collect(Collectors.toList());

    log.info("[SYLLABI DEBUG] Retornando {} sílabos", result.size());
    return result;
}
```

### SyllabusController.java (Nuevo Endpoint)

```java
@GetMapping("/debug/count")
public ResponseEntity<?> getDebugInfo() {
    try {
        long totalWithDeleted = syllabusService.getAllSyllabiForAudit().size();
        List<SyllabusResponse> activeOnly = syllabusService.getAllSyllabi();

        return ResponseEntity.ok(Map.of(
                "totalWithDeleted", totalWithDeleted,
                "activeOnly", activeOnly.size(),
                "syllabi", activeOnly
        ));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}
```

---

**Última Actualización:** 2026-06-20  
**Estado:** ✅ Backend compilado y listo para desplegar  
**Próximo Paso:** Desplegar en Azure usando una de las 3 opciones arriba
