# SilaDocs: Instructivo de Gestión de Sílabos con Blockchain
## Verificador de Trazabilidad y Autenticidad

---

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Acceso y Autenticación](#acceso-y-autenticación)
3. [Guía del Verificador](#guía-del-verificador)
4. [10 Casos de Prueba](#10-casos-de-prueba)
5. [Capacidades Técnicas](#capacidades-técnicas)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Introducción

### ¿Qué es SilaDocs?

**SilaDocs** es una plataforma de gestión de sílabos universitarios que integra tecnología **blockchain** para garantizar:

- **Inmutabilidad**: Una vez registrado, el contenido del sílabo no puede ser alterado
- **Trazabilidad Completa**: Auditoría detallada de quién, cuándo y qué cambió
- **Acceso Público Verificable**: Compartir sílabos por QR sin requerir autenticación
- **Cumplimiento Normativo**: Evidencia de gestión ágil y segura de documentos académicos

### Beneficios para Instituciones Educativas

✅ **Seguridad**: Hash SHA-256 + Hyperledger Fabric  
✅ **Gestión Ágil**: Control de versiones sin pérdida de historial  
✅ **Trazabilidad Precisa**: Auditoría de cambios por usuario y fecha  
✅ **Compartibilidad**: URLs y QR públicos para verificación externa  
✅ **Cumplimiento**: Demuestra estándares de calidad académica  

---

## 🔐 Acceso y Autenticación

### URL de Acceso
```
https://siladocs-frontend.vercel.app/
```

### Usuario de Demostración (Rol: Rector)

| Campo | Valor |
|-------|-------|
| **Correo** | `rector@demo.siladocs.com` |
| **Contraseña** | `Demo@Rector123` |
| **Rol** | Administrador / Rector |
| **Permisos** | Acceso completo a todas las funciones |

### Pasos para Iniciar Sesión

1. Accede a: https://siladocs-frontend.vercel.app/
2. Haz clic en "Ingresar" o ve directamente a `/authentication/sign-in/cover`
3. Ingresa el correo: `rector@demo.siladocs.com`
4. Ingresa la contraseña: `Demo@Rector123`
5. Haz clic en "Ingresar"
6. Serás redirigido al dashboard principal

---

## 📱 Guía del Verificador

### Ubicación: Panel de Verificación de Sílabos
**Ruta**: `/verificador-silabos/`

### Funcionalidad Principal

El verificador permite:
- Buscar y visualizar sílabos registrados
- Ver historial completo de versiones
- Generar QR para compartir públicamente
- Copiar URLs estáticas para emailing
- Verificar integridad por hash SHA-256
- Consultar estado blockchain

### Flujo de Uso

#### Paso 1: Acceder al Verificador
```
Dashboard → Core → Verificador de Sílabos
O
URL directa: /verificador-silabos/
```

#### Paso 2: Buscar Sílabo
- Utiliza la barra de búsqueda por nombre del curso
- Filtra por carrera o código de curso
- Se muestran todos los sílabos registrados

#### Paso 3: Seleccionar Versión
- Cada sílabo muestra todas sus versiones
- Versiones "Inmutable" = Registradas en blockchain
- Versiones "Pendiente" = Pendientes de registro

#### Paso 4: Generar QR de Compartir
- Click en "Generar QR" en la versión deseada
- Se abrirá modal con:
  - **QR Code**: Escaneable para verificación pública
  - **Botón Copiar URL**: Para enviar por correo
  - **Botón Descargar QR**: Para imprimir o guardar

#### Paso 5: Compartir Públicamente
- Comparte el QR escaneándolo con celular
- O copia la URL estática sin necesidad de login
- Receptor puede verificar sin tener cuenta

### Verificación Pública (Sin Login)

**URL de Verificación Pública**:
```
https://siladocs-frontend.vercel.app/public/verify?id=SYLLABUS_ID&version=VERSION_NUMBER
```

**Información Visible**:
- ✓ Nombre del curso
- ✓ Código del curso
- ✓ Carrera asociada
- ✓ Estado (Inmutable / Pendiente)
- ✓ Vista previa PDF
- ✓ Historial de versiones
- ✓ Hash SHA-256
- ✓ Canal blockchain
- ✓ Botón descargar PDF
- ✓ Botón copiar URL

---

## 🧪 10 Casos de Prueba

### Caso 01: Registro de Sílabo
**Objetivo**: Cargar un PDF y registrarlo con hash SHA-256 en blockchain

**Pasos**:
1. Inicia sesión como Rector
2. Ve a: `/gestion/silabos/`
3. Haz clic en "Cargar Nuevo Sílabo"
4. Selecciona un PDF (ej: MathBasics.pdf)
5. Ingresa detalles:
   - Curso: "Matemática Básica"
   - Código: "MAT101"
   - Carrera: "Ingeniería en Sistemas"
6. Haz clic en "Subir"

**Resultado Esperado**:
- ✅ Archivo sube correctamente
- ✅ Se genera hash SHA-256
- ✅ Aparece en lista de sílabos
- ✅ Estado: "Pendiente" (preparando blockchain)

**Validación**:
- Ver el sílabo en `/verificador-silabos/`
- Confirmar que aparece en la tabla

---

### Caso 02: Flujo de Aprobación
**Objetivo**: Cambiar estado de "Pendiente" a "Inmutable" (Blockchain)

**Pasos**:
1. Desde `/verificador-silabos/`, selecciona un sílabo "Pendiente"
2. Abre el historial de versiones
3. El sistema automáticamente registra en Hyperledger Fabric
4. Espera confirmación (usualmente < 1 minuto)

**Resultado Esperado**:
- ✅ Status cambia a "Inmutable"
- ✅ Se asigna transactionId de Fabric
- ✅ Hash se registra en blockchain inmutable

**Validación**:
- Ir a `/core/blockchain/` para ver transacción
- Confirmar fabricTxId en detalles

---

### Caso 03: Registro en Blockchain
**Objetivo**: Verificar que la transacción está en Hyperledger Fabric

**Pasos**:
1. Abre un sílabo con estado "Inmutable"
2. Ve a `/core/blockchain/`
3. Busca el fabricTxId del sílabo
4. Consulta la transacción en el explorador

**Resultado Esperado**:
- ✅ Transacción visible en blockchain
- ✅ Metadata completa (creator, timestamp, hash)
- ✅ Firma criptográfica válida

**Validación**:
- Hash del PDF coincide exactamente
- Timestamp es el del registro

---

### Caso 04: Verificación de Integridad
**Objetivo**: Comprobar que hash SHA-256 no cambia

**Pasos**:
1. Abre un sílabo registrado
2. Copia el hash SHA-256 del panel
3. Descarga el PDF
4. Calcula hash local (SHA-256):
   ```bash
   sha256sum MathBasics.pdf
   ```
5. Compara con el almacenado

**Resultado Esperado**:
- ✅ Hashes coinciden exactamente
- ✅ El archivo no fue modificado
- ✅ PDF íntegro desde su registro

**Validación**:
- Intenta modificar PDF y vuelve a calcular hash
- Debe ser diferente

---

### Caso 05: Versionado - Crear Nueva Versión
**Objetivo**: Subir una versión 2 del mismo sílabo en el mismo curso

**Pasos**:
1. Abre `/gestion/silabos/`
2. Selecciona un sílabo ya registrado
3. Haz clic en "Actualizar Versión"
4. Sube un nuevo PDF (versión 2 con cambios menores)
5. Ingresa notas: "Actualización de objetivos"
6. Haz clic en "Guardar"

**Resultado Esperado**:
- ✅ Crea nueva versión (v2) del sílabo
- ✅ Mantiene historial completo
- ✅ Ambas versiones visibles en verificador
- ✅ Nueva versión en estado "Pendiente"

**Validación**:
- En verificador muestra: Versión 1 (Inmutable), Versión 2 (Pendiente)
- Cada una con su propio hash
- Historial preservado

---

### Caso 06: Historial de Versiones Completo
**Objetivo**: Visualizar timeline de todas las versiones de un sílabo

**Pasos**:
1. Abre `/verificador-silabos/`
2. Selecciona un sílabo con múltiples versiones
3. En el modal, ve a pestaña "Historial"

**Resultado Esperado**:
- ✅ Timeline visual mostrando todas las versiones
- ✅ Cada versión muestra:
  - Número de versión
  - Fecha y hora exacta
  - Usuario que subió (ej: rector@demo.siladocs.com)
  - Hash SHA-256 (primeros 40 caracteres)
  - Status blockchain (verde = inmutable, amarillo = pendiente)

**Validación**:
- Las fechas son en orden descendente (más reciente arriba)
- Hashes son diferentes para cada versión
- Usuario correcto asignado

---

### Caso 07: Generación y Escaneo de QR
**Objetivo**: Crear QR compartible y acceder sin login

**Pasos**:
1. Abre `/verificador-silabos/`
2. Selecciona un sílabo inmutable
3. Haz clic en "Generar QR"
4. En el modal: Click "Descargar QR"
5. Guarda la imagen QR
6. Abre un navegador incógnito (sin sesión)
7. Escanea el QR con tu celular
   - O copia la URL manualmente

**Resultado Esperado**:
- ✅ QR generado correctamente
- ✅ Al escanear/acceder por URL:
  - NO requiere login
  - Muestra página `/public/verify?id=X&version=Y`
  - Contiene toda la info del sílabo
  - Es la misma versión del QR generado

**Validación**:
- Página pública visible sin autenticación
- Historial de versiones completo visible
- Descarga PDF funciona

---

### Caso 08: Copia de URL Estática
**Objetivo**: Copiar URL para enviar por correo sin QR

**Pasos**:
1. Abre `/verificador-silabos/`
2. Selecciona un sílabo
3. Abre modal
4. Haz clic en "Copiar URL"
5. Notificación de éxito aparece

**Resultado Esperado**:
- ✅ URL copiada al portapapeles
- ✅ Toast verde confirma: "URL Copiada"
- ✅ URL es: `/public/verify?id=XXXXX&version=Y`

**Validación**:
- Pega la URL en navegador
- Accede sin problema
- Muestra el sílabo correcto

---

### Caso 09: Acceso No Autorizado
**Objetivo**: Verificar que el sistema rechaza acciones sin permiso

**Pasos**:
1. Abre navegador incógnito
2. Intenta acceder a: `/gestion/silabos/`
3. Sistema debería redirigir a login

**Resultado Esperado**:
- ✅ Redirección a `/authentication/sign-in/cover`
- ✅ NO es posible ver información sensible
- ✅ Acceso público solo a `/public/verify`

**Validación**:
- Solo endpoint /public/verify es accesible
- Todas las demás rutas requieren autenticación

---

### Caso 10: Validación de Formato
**Objetivo**: Comprobar que el sistema rechaza PDFs inválidos

**Pasos**:
1. Abre `/gestion/silabos/`
2. Intenta subir:
   - Un archivo .txt renombrado como .pdf
   - Un archivo corrupto
   - Un archivo > límite tamaño

**Resultado Esperado**:
- ✅ Sistema rechaza con mensaje de error
- ✅ No crea hash ni registro
- ✅ Mensaje clara: "Formato inválido" o "Archivo muy grande"

**Validación**:
- No aparece en verificador
- No hay transacción en blockchain
- Base de datos no se modifica

---

## 🔧 Capacidades Técnicas

### Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Next.js + React)               │
│  - UI de Gestión                                   │
│  - Generación QR                                   │
│  - Verificación Pública                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         BACKEND (Spring Boot Java)                 │
│  - REST APIs                                       │
│  - JWT Authentication                             │
│  - SHA-256 Hashing                                │
│  - PDF Validation                                 │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│ PostgreSQL   │   │ Azure Blob       │
│ Database     │   │ Storage (PDFs)   │
│              │   │                  │
│ - syllabi    │   │ - File Hosting   │
│ - versions   │   │ - SAS Tokens     │
│ - history    │   │ - Preview URLs   │
└──────────────┘   └──────────────────┘
        │
        └────────┬────────┐
                 ▼        ▼
        ┌──────────────────────────┐
        │ Hyperledger Fabric       │
        │ (Blockchain)             │
        │                          │
        │ - Immutable Records      │
        │ - Transaction History    │
        │ - Smart Contracts        │
        └──────────────────────────┘
```

### Flujo de Registro en Blockchain

```
1. Usuario sube PDF
   ↓
2. Backend calcula SHA-256
   ↓
3. Crea registro en PostgreSQL
   ↓
4. Almacena PDF en Azure Blob
   ↓
5. Envía a Hyperledger Fabric
   ↓
6. Blockchain confirma inmutabilidad
   ↓
7. Retorna fabricTxId
   ↓
8. Marca como "Inmutable" en DB
   ↓
9. Frontend muestra en verificador
```

### Especificaciones de Seguridad

| Aspecto | Detalle |
|--------|---------|
| **Hashing** | SHA-256 (Estándar NIST) |
| **Blockchain** | Hyperledger Fabric v2.5 |
| **Autenticación** | JWT (JSON Web Tokens) |
| **Encriptación** | TLS/SSL en tránsito |
| **Almacenamiento** | AES-256 en Azure Blob |
| **Auditoría** | Log completo de cambios |

### APIs Principales

#### Obtener Todos los Sílabos
```
GET /api/v1/syllabus/all
Headers: Authorization: Bearer {JWT_TOKEN}
Response: Array[SyllabusTrace]
```

#### Obtener Versiones de un Sílabo
```
GET /api/v1/syllabus/{id}/versions
Response: Array[SyllabusVersion]
```

#### Obtener Verificación Pública
```
GET /api/v1/public/verify/{id}
Response: SyllabusTrace (sin autenticación)
```

#### Registrar en Blockchain
```
POST /api/v1/syllabus/{id}/blockchain-register
Headers: Authorization: Bearer {JWT_TOKEN}
Body: { fabricTxId, hash, status }
Response: { success, transactionId }
```

---

## ❓ Preguntas Frecuentes

### P: ¿Puedo modificar un sílabo después de registrarlo?
**R**: No puedes modificar la versión registrada, pero puedes crear una nueva versión. Esto preserva el historial completo.

### P: ¿Cómo se genera el QR?
**R**: Desde cualquier sílabo, el sistema genera automáticamente un QR que codifica: `/public/verify?id=SYLLABUS_ID&version=VERSION_NUMBER`

### P: ¿Se pueden compartir sílabos con personas sin cuenta?
**R**: Sí, totalmente. Usa la URL pública o QR. No requieren login para verificar.

### P: ¿Cuánto tiempo tarda en registrarse en blockchain?
**R**: Típicamente < 1 minuto. El sistema cambia automáticamente el estado a "Inmutable".

### P: ¿Qué ocurre si cambio el PDF después de descargarlo?
**R**: El hash será diferente. Cuando lo vuelvas a subir, será una nueva versión con diferente hash.

### P: ¿Puedo eliminar un sílabo del blockchain?
**R**: No. El blockchain es inmutable por diseño. Esto es una fortaleza para la auditoría.

### P: ¿Dónde puedo ver todas las transacciones?
**R**: En `/core/blockchain/`. Ahí se listan todos los registros con detalles completos.

### P: ¿Qué significan los colores en el timeline?
**R**: 
- 🟢 **Verde**: Versión registrada en blockchain (Inmutable)
- 🟡 **Amarillo**: Pendiente de registro en blockchain

### P: ¿Puedo descargar el PDF de la verificación pública?
**R**: Sí, hay un botón "Descargar PDF" en la pestaña Vista Previa.

### P: ¿A quién se le asigna la responsabilidad de un sílabo?
**R**: Al usuario que lo subió, registrado en la base de datos y blockchain.

---

## 📞 Soporte Técnico

Para issues o preguntas:
1. Verifica que estés usando las credenciales correctas
2. Limpia caché del navegador (Ctrl+Shift+Del)
3. Intenta en navegador incógnito
4. Contacta al equipo de administración

---

## 📊 Resumen de Capacidades

| Funcionalidad | Status |
|--------------|--------|
| Registro de sílabos | ✅ Operativo |
| Versionado automático | ✅ Operativo |
| Blockchain Fabric | ✅ Operativo |
| Generación QR | ✅ Operativo |
| Acceso público | ✅ Operativo |
| Verificación de integridad | ✅ Operativo |
| Auditoría completa | ✅ Operativo |
| Compartibilidad por URL | ✅ Operativo |
| Dashboard de trazabilidad | ✅ Operativo |
| Control de acceso | ✅ Operativo |

---

**Versión**: 1.0  
**Última Actualización**: Mayo 2026  
**Plataforma**: SilaDocs v1.0  
**Desarrollador**: ISW-SilaTech  

---

*Este instructivo demuestra la integración completa de blockchain para gestión segura, trazable e inmutable de sílabos universitarios.*
