# Guía de Validación — SilaDocs
## Instructivo para Validadores del Sistema

**Proyecto:** SilaDocs — Sistema de Gestión de Sílabos con Blockchain  
**URL del sistema:** https://siladocs-frontend.vercel.app  
**Fecha:** Mayo 2026

---

## Requisitos Previos

Antes de comenzar, asegúrese de tener:

- [ ] Cuenta en el sistema (credenciales proporcionadas por el administrador)
- [ ] Acceso a Internet
- [ ] Un navegador web moderno (Chrome, Firefox o Edge)
- [ ] Un archivo PDF de prueba (cualquier PDF de menos de 50 MB)

### Credenciales de prueba disponibles

| Rol | Email | Contraseña |
|-----|-------|------------|
| Rector | rector@demo.siladocs.com | Demo@Rector123 |
| Administrador Académico | academico@demo.siladocs.com | Demo@Academico123 |

---

## Casos de Prueba

---

### TC-01 — Registro de Sílabo
**Funcionalidad:** Carga de documento y registro en el sistema  
**Resultado esperado:** Documento almacenado en la nube con hash SHA-256 válido generado

**Pasos:**

1. Ingrese al sistema en https://siladocs-frontend.vercel.app
2. Inicie sesión con las credenciales de **Administrador Académico**
3. En el menú lateral, vaya a **Gestión Académica → Gestión → Sílabos**
4. Haga clic en el botón **"+ Nuevo Sílabo"**
5. En el modal que aparece:
   - Seleccione un **Curso** del listado desplegable
   - Arrastre y suelte un archivo PDF (o haga clic en "Seleccionar archivo")
6. Haga clic en **"Registrar en Blockchain"**
7. Observe la barra de progreso con los pasos:
   - ✅ Archivo recibido
   - ✅ Hash SHA-256 calculado
   - ✅ Archivo almacenado en Azure
   - ✅ Transacción enviada a Fabric
   - ✅ Registrado en blockchain

**Verificación:**
- El modal debe mostrar un mensaje de éxito: **"¡Registrado en Blockchain!"**
- Debe aparecer un **Transaction ID** (ej: `doc-5-1700000000000`)
- El hash SHA-256 debe tener exactamente 64 caracteres hexadecimales
- El sílabo debe aparecer en la tabla de la página de Sílabos

**Criterio de aprobación:** ✅ Transaction ID visible y hash de 64 caracteres generado

---

### TC-02 — Flujo de Aprobación
**Funcionalidad:** Coordinador revisa y aprueba una versión del sílabo  
**Resultado esperado:** Aprobación registrada y estado actualizado a "Validado"

**Pasos:**

1. Inicie sesión con las credenciales de **Rector** o **Administrador Académico**
2. Vaya a **Gestión Académica → Gestión → Sílabos**
3. Localice un sílabo con estado **"Creado"** en la tabla
4. En la columna de acciones, haga clic en el botón **☑ (icono de verificación amarillo)** — "Aprobar sílabo"
5. Confirme la acción en el diálogo de confirmación

**Verificación:**
- Debe aparecer una notificación verde: **"Sílabo aprobado correctamente"**
- En la tabla, el estado del sílabo debe cambiar a la etiqueta verde **"Validado"**
- El botón de aprobación debe desaparecer para ese sílabo

**Criterio de aprobación:** ✅ Estado cambia a "Validado" y botón de aprobación desaparece

---

### TC-03 — Registro en Blockchain
**Funcionalidad:** Almacenar metadatos y hash del sílabo en blockchain  
**Resultado esperado:** Transacción registrada correctamente con metadatos completos

**Pasos:**

1. Complete el flujo del **TC-01** (subir un sílabo)
2. Una vez completado, anote el **Transaction ID** que aparece en el modal de éxito
3. Vaya a **Blockchain → Blockchain** en el menú lateral
4. Busque el curso del sílabo en el campo de búsqueda
5. Seleccione el curso para ver su historial de transacciones

**Verificación:**
- Debe aparecer la entrada de la transacción con:
  - ✅ Transaction ID registrado (coincide con el del paso 2)
  - ✅ Acción: CREATION o UPDATE
  - ✅ Timestamp de la transacción
  - ✅ Email del actor que registró el sílabo
- El estado debe mostrar **"Inmutable"**

**Criterio de aprobación:** ✅ Transacción visible en blockchain con todos los metadatos

---

### TC-04 — Verificación de Integridad
**Funcionalidad:** Comparar hash almacenado con el registro en blockchain  
**Resultado esperado:** Los valores de hash coinciden, asegurando integridad del documento

**Pasos:**

1. Vaya a **Gestión Académica → Gestión → Sílabos**
2. Localice cualquier sílabo con Transaction ID en la tabla
3. Haga clic en el botón **🛡 (icono de escudo morado)** — "Verificar integridad"
4. Espere la respuesta del sistema

**Verificación:**
- Debe aparecer una notificación verde con el mensaje:
  **"Integridad verificada ✓ Hash coincide con blockchain. TxID: doc-X-XXXX"**
- El mensaje debe incluir el Transaction ID del registro blockchain

**Verificación alternativa vía API:**
```
GET https://siladocs-backend.azurewebsites.net/api/syllabi/{id}/verify-integrity
Authorization: Bearer <su-token-jwt>
```
La respuesta debe ser:
```json
{
  "syllabusId": 1,
  "storedHash": "e3b0c44298fc...",
  "fabricTxId": "doc-1-1700000000000",
  "integrityValid": true,
  "status": "validated"
}
```

**Criterio de aprobación:** ✅ `integrityValid: true` y hash de 64 caracteres presente

---

### TC-05 — Acceso No Autorizado
**Funcionalidad:** Intentar aprobar con usuario no autorizado  
**Resultado esperado:** Sistema rechaza la acción y retorna error de autorización

**Opción A — Prueba desde navegador (sin sesión):**

1. Abra una **ventana de incógnito** en su navegador
2. Intente acceder directamente a: https://siladocs-frontend.vercel.app/gestion/silabos
3. **Resultado esperado:** Redirección automática a la página de inicio de sesión

**Opción B — Prueba de API sin token:**

1. Abra la consola del navegador (F12) o use una herramienta como Postman
2. Ejecute la siguiente petición sin token de autorización:
```
PATCH https://siladocs-backend.azurewebsites.net/api/syllabi/1/approve
(sin header Authorization)
```
3. **Resultado esperado:** Respuesta HTTP `401 Unauthorized` o `403 Forbidden`

**Opción C — Prueba con token inválido:**
```
PATCH https://siladocs-backend.azurewebsites.net/api/syllabi/1/approve
Authorization: Bearer token_invalido_aqui
```
3. **Resultado esperado:** Respuesta HTTP `401 Unauthorized`

**Criterio de aprobación:** ✅ Código HTTP 401/403 recibido sin token válido

---

### TC-06 — Detección de Hash Duplicado
**Funcionalidad:** Subir el mismo archivo dos veces no genera nueva transacción blockchain  
**Resultado esperado:** Sistema detecta el duplicado y retorna el sílabo existente

**Pasos:**

1. Vaya a **Gestión Académica → Gestión → Sílabos**
2. Haga clic en **"+ Nuevo Sílabo"** y suba un archivo PDF para un curso
3. Espere a que se complete el registro (Transaction ID generado)
4. Inmediatamente, haga clic nuevamente en **"+ Nuevo Sílabo"**
5. Seleccione el **mismo curso** y el **mismo archivo PDF** exacto
6. Haga clic en **"Registrar en Blockchain"**

**Verificación:**
- El sistema debe completar rápidamente sin llamar a Fabric
- El mensaje debe indicar **"Sin cambios detectados"** en la barra de progreso
- No debe generarse un nuevo Transaction ID diferente
- El historial de versiones del sílabo no debe incrementar

**Criterio de aprobación:** ✅ Progreso muestra "Sin cambios detectados" en menos de 5 segundos

---

### TC-07 — Validación de Formato de Archivo
**Funcionalidad:** Archivos inválidos son rechazados antes de procesar  
**Resultado esperado:** El sistema rechaza archivos vacíos o de formato incorrecto

**Prueba 7A — Archivo vacío:**
1. Intente seleccionar un archivo de 0 bytes
2. **Resultado esperado:** Error "Archivo vacío o nulo"

**Prueba 7B — Archivo muy grande:**
1. Intente seleccionar un archivo mayor a 50 MB
2. El frontend debe mostrar inmediatamente: **"El archivo excede el tamaño máximo de 50 MB"**

**Prueba 7C — Sin seleccionar curso:**
1. En el modal de subida, seleccione un archivo pero NO seleccione curso
2. Intente hacer clic en "Registrar en Blockchain"
3. **Resultado esperado:** Mensaje de validación **"Debe seleccionar un curso"**

**Criterio de aprobación:** ✅ Todos los casos muestran mensajes de error claros sin llamar al servidor

---

### TC-08 — Incremento de Versión
**Funcionalidad:** Re-cargar un sílabo para el mismo curso incrementa el número de versión  
**Resultado esperado:** Nueva versión registrada en blockchain con versión + 1

**Pasos:**

1. Suba un **primer sílabo** (versión 1) para cualquier curso — complete el flujo de TC-01
2. Vaya nuevamente a **"+ Nuevo Sílabo"**
3. Seleccione el **mismo curso** pero con un **archivo diferente** (diferente contenido)
4. Complete el registro

**Verificación:**
- El segundo registro debe completarse correctamente con un nuevo Transaction ID
- En la tabla, el sílabo del mismo curso debe mostrar el nuevo archivo
- El campo de versión internamente es 2 (verificable via API)

**Verificación vía API:**
```
GET https://siladocs-backend.azurewebsites.net/api/syllabi/{id}
Authorization: Bearer <token>
```
El campo `currentVersion` debe ser mayor al de la primera subida.

**Criterio de aprobación:** ✅ Nuevo Transaction ID generado y archivo actualizado en la tabla

---

### TC-09 — Generación de URL de Descarga
**Funcionalidad:** URL temporal autenticada (SAS) generada para acceder al archivo  
**Resultado esperado:** URL válida que permite descargar el documento

**Pasos:**

1. Vaya a **Gestión Académica → Gestión → Sílabos**
2. Localice un sílabo en la tabla
3. Haga clic en el botón **⬇ (icono de descarga verde)** — "Descargar"
4. Espere a que comience la descarga

**Verificación:**
- El navegador debe iniciar la descarga del archivo PDF
- La notificación debe mostrar **"Descarga iniciada"**
- El archivo descargado debe abrirse correctamente y contener el documento original

**Verificación alternativa vía API:**
```
GET https://siladocs-backend.azurewebsites.net/api/syllabi/{id}/download-url
Authorization: Bearer <token>
```
La respuesta debe incluir:
```json
{
  "downloadUrl": "https://siladocsblob.blob.core.windows.net/syllabi/...?sv=...&sig=..."
}
```

**Criterio de aprobación:** ✅ Archivo descargado correctamente y URL SAS contiene parámetros `sv=` y `sig=`

---

### TC-10 — Health Check del Blockchain
**Funcionalidad:** Verificar conectividad con Hyperledger Fabric antes de operaciones  
**Resultado esperado:** Estado de conectividad reportado correctamente

**Opción A — Desde el navegador:**
1. Vaya a **Blockchain → Blockchain** en el menú lateral
2. La página debe cargar y mostrar el historial de transacciones
3. Si Fabric está disponible: historial visible con registros
4. Si Fabric está en modo mock: historial muestra transacciones simuladas

**Opción B — Via API directa:**
```
GET https://siladocs-backend.azurewebsites.net/api/health/fabric
```
**Respuesta esperada:**
```json
{
  "status": "UP",
  "fabricApi": "http://...",
  "message": "Fabric API disponible"
}
```

**Opción C — Actuator:**
```
GET https://siladocs-backend.azurewebsites.net/api/actuator/health
```
Debe retornar `"status": "UP"`.

**Criterio de aprobación:** ✅ Endpoint `/health/fabric` responde con status UP o información del estado actual

---

## Resumen de Resultados

Use esta tabla para registrar los resultados de cada caso de prueba:

| TC | Funcionalidad | Estado | Observaciones |
|----|---------------|--------|---------------|
| TC-01 | Registro de Sílabo | ⬜ Pendiente | |
| TC-02 | Flujo de Aprobación | ⬜ Pendiente | |
| TC-03 | Registro en Blockchain | ⬜ Pendiente | |
| TC-04 | Verificación de Integridad | ⬜ Pendiente | |
| TC-05 | Acceso No Autorizado | ⬜ Pendiente | |
| TC-06 | Detección de Hash Duplicado | ⬜ Pendiente | |
| TC-07 | Validación de Formato | ⬜ Pendiente | |
| TC-08 | Incremento de Versión | ⬜ Pendiente | |
| TC-09 | URL de Descarga | ⬜ Pendiente | |
| TC-10 | Health Check Blockchain | ⬜ Pendiente | |

Actualice cada fila con: ✅ Aprobado / ❌ Fallido / ⚠️ Parcial

---

## Contacto

En caso de dudas o problemas durante la validación, contacte al equipo de desarrollo del proyecto SilaDocs.
