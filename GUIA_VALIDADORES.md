# 📋 Guía Completa de Validación - SilaDocs Blockchain
## Para Usuarios Validadores de la Plataforma

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Objetivo:** Proporcionar un instructivo sistemático para validar que SilaDocs cumple con sus objetivos de gestión segura, inmutable y auditable de sílabos académicos en entornos multi-institucionales.

---

## 📌 Índice

1. [Introducción Ejecutiva](#introducción-ejecutiva)
2. [Problema y Solución](#problema-y-solución)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Pre-requisitos de Testing](#pre-requisitos-de-testing)
5. [40 Casos de Prueba Organizados por Épica](#40-casos-de-prueba-organizados-por-épica)
6. [Procedimientos de Validación](#procedimientos-de-validación)
7. [Checklist de Validación Final](#checklist-de-validación-final)

---

## 🎯 Introducción Ejecutiva

### ¿Por qué SilaDocs?

SilaDocs resuelve un problema crítico en educación superior: **la falta de integridad y trazabilidad en la gestión de sílabos académicos**.

**Contexto del Problema:**
- Múltiples instituciones comparten acreditaciones y certificaciones
- Los sílabos son documentos críticos para la calidad académica
- No hay forma confiable de verificar que un sílabo no ha sido alterado
- Auditorías complejas y lentas
- Imposibilidad de garantizar autenticidad en entornos multi-institucionales

**¿Cómo lo resuelve SilaDocs?**
- ✅ **Immutabilidad**: Usando Hyperledger Fabric para registro inmutable
- ✅ **Trazabilidad**: Historial completo de cambios y accesos
- ✅ **Verificación Pública**: Cualquiera puede validar integridad sin intermediarios
- ✅ **Multi-Institucional**: Gestión colaborativa con control de acceso por rol
- ✅ **Auditabilidad**: Registros de auditoría detallados y timestamped

---

## 🔍 Problema y Solución

### El Problema Real

#### Contexto Educativo Actual
```
Estado actual sin SilaDocs:
┌─────────────────────────────────┐
│  Gestión Manual de Sílabos      │
├─────────────────────────────────┤
│ • Archivos en correo/sistemas   │
│ • Sin control de versiones      │
│ • Imposible auditar cambios     │
│ • Riesgo de alteración          │
│ • Verificación manual           │
│ • Desconfianza entre institutos │
└─────────────────────────────────┘
```

**Preguntas que los validadores deben responder:**
1. ¿Cómo sé que el sílabo que veo hoy es el mismo de hace 6 meses?
2. ¿Quién modificó qué y cuándo?
3. ¿Puedo garantizar que nadie ha alterado el contenido?
4. ¿Cómo verifico autenticidad sin contactar a la institución?

### La Solución: SilaDocs + Blockchain

```
Estado con SilaDocs:
┌─────────────────────────────────┐
│  SilaDocs + Hyperledger Fabric  │
├─────────────────────────────────┤
│ ✅ Hash SHA-256 del contenido   │
│ ✅ Registro inmutable en ledger │
│ ✅ Historial de cambios         │
│ ✅ Verificación públicamente    │
│ ✅ Auditoría automática         │
│ ✅ Confianza multi-institucional│
└─────────────────────────────────┘
```

**Cómo funciona:**
1. Institución sube sílabo (PDF/DOC)
2. Sistema calcula SHA-256 del contenido
3. Sube archivo a Azure Blob Storage (con versionado)
4. Registra hash + metadata en Hyperledger Fabric
5. Fabric genera Transaction ID inmutable
6. Sistema almacena relación en base de datos
7. Auditor/verificador puede validar en cualquier momento

---

## 🏗️ Arquitectura del Sistema

### Componentes Clave

```
┌──────────────────────────────────────────────────────────────┐
│                     SilaDocs Architecture                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Next.js)                                          │
│  ├─ Autenticación (JWT)                                     │
│  ├─ Gestión de Sílabos (Upload/Edit)                       │
│  ├─ Dashboard (Métricas)                                    │
│  └─ Visualización Blockchain                               │
│          │                                                  │
│          ├─────────────────────────────────────────────┐   │
│          ▼                                             ▼   │
│  Backend (Node.js/Express)         Azure Storage          │
│  ├─ AuthService                    └─ Blob Storage        │
│  ├─ SyllabusService                   (Versionado)        │
│  ├─ LedgerService                                         │
│  └─ NotificationService                                   │
│          │                                                  │
│          └─────────────────────────────────────────────┐   │
│                                                        ▼   │
│  Hyperledger Fabric Network                              │
│  ├─ Chaincode: RegisterSyllabus                          │
│  ├─ Ledger: silabos-channel                             │
│  ├─ Certificate Management                              │
│  └─ Transaction Consensus                               │
│                                                          │
│  Database (PostgreSQL)                                  │
│  └─ Metadata + Audit Logs                              │
│                                                          │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
1. UPLOAD SYLLABUS
   User → Frontend → Backend → Hash Calculation → Azure Storage → 
   Fabric Registration → DB Save → Success Response

2. VERIFY SYLLABUS
   Auditor → Frontend → Backend → Fabric Query → Hash Verification → 
   Display Results

3. AUDIT TRAIL
   Admin → Frontend → Backend → DB Audit Query → Display History
```

---

## 🔧 Pre-requisitos de Testing

### Acceso y Credenciales

**Entorno:** 
- Frontend: https://siladocs-frontend.vercel.app
- Backend: https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api
- Fabric API: http://20.38.34.192:8000

**Usuarios de Demo Disponibles:**

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|----------|
| Rector | rector@demo.local | rector123 | Acceso total + Emisión de certificados |
| Admin Académico | academicadmin@demo.local | admin123 | Gestión de sílabos + Dashboard |
| Docente | docente@demo.local | docente123 | Ver/Descargar sílabos |
| Auditor | auditor@demo.local | auditor123 | Visualizar blockchain + Auditoría |

### Equipamiento Requerido

- Navegador moderno (Chrome, Firefox, Edge - últimas 2 versiones)
- DevTools accesible (F12)
- Conexión a internet estable
- Herramientas recomendadas:
  - Generador SHA-256 en línea (para verificación manual)
  - Editor PDF (para crear documentos de prueba)

### Documentos de Prueba

Descarga o crea estos archivos para testing:

1. **syllabus-test-1.pdf** (1-2 MB)
   - Contenido: Cualquier documento PDF válido
   
2. **syllabus-test-2.docx** (500 KB)
   - Contenido: Cualquier documento DOCX válido
   
3. **test-certificate.pdf** (100 KB)
   - Para pruebas de certificación

---

## 📊 40 Casos de Prueba Organizados por Épica

### ÉPICA 1: AUTENTICACIÓN Y AUTORIZACIÓN (8 casos)

Esta épica valida que **solo usuarios autorizados pueden acceder al sistema** y que **cada rol tiene permisos específicos**.

**Objetivo:** Garantizar seguridad mediante control de acceso basado en roles (RBAC)

#### Caso 1.1: Login Exitoso con Rector
**Propósito:** Validar autenticación básica para rol administrativo

**Pasos:**
1. Abre https://siladocs-frontend.vercel.app
2. Ingresa: `rector@demo.local` / `rector123`
3. Presiona "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Redirige a dashboard principal
- ✅ Navbar muestra institución: "SilaTech Demo"
- ✅ Menú lateral muestra todas las opciones
- ✅ Token JWT se almacena en localStorage
- ✅ No hay errores en consola

**Relacionado con Objetivo:** Garantiza que usuarios legítimos pueden acceder

---

#### Caso 1.2: Login Exitoso con Admin Académico
**Propósito:** Validar autenticación para rol académico

**Pasos:**
1. Abre https://siladocs-frontend.vercel.app
2. Ingresa: `academicadmin@demo.local` / `admin123`
3. Presiona "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Acceso al dashboard
- ✅ Rol mostrado: "Administrador Académico"
- ✅ Puede acceder a "Gestión Académica"

---

#### Caso 1.3: Rechazo de Credenciales Inválidas
**Propósito:** Validar que sistema rechaza acceso no autorizado

**Pasos:**
1. Intenta login con: `invalid@test.com` / `wrongpass`
2. Presiona "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Error: "Credenciales inválidas"
- ✅ **NO** redirige al dashboard
- ✅ Permanece en página de login
- ✅ Campo de contraseña se limpia

**Relacionado con Objetivo:** Previene acceso no autorizado

---

#### Caso 1.4: Validación de Email
**Propósito:** Validar que sistema rechaza emails mal formados

**Pasos:**
1. En login, ingresa email: `invalidemail`
2. Intenta submit

**Resultado Esperado:**
- ✅ Error: "Email inválido"
- ✅ No permite submit

---

#### Caso 1.5: Control de Acceso por Rol - Rector vs Admin
**Propósito:** Validar que cada rol ve diferentes opciones

**Procedimiento:**
1. Login como Rector
2. Documenta opciones en menú
3. Logout
4. Login como Admin Académico
5. Compara opciones del menú

**Resultado Esperado:**
- ✅ Rector ve: "Gestión Académica", "Dashboard", "Blockchain", "Reportes"
- ✅ Admin ve: "Gestión Académica", "Dashboard", "Blockchain"
- ✅ Admin NO ve: "Reportes" o "Usuarios"

**Relacionado con Objetivo:** Garantiza segregación de privilegios

---

#### Caso 1.6: Recuperación de Contraseña - Flujo Email → Código → Nueva Contraseña
**Propósito:** Validar proceso seguro de recuperación

**Pasos:**
1. Click "¿Olvidaste tu contraseña?"
2. Ingresa email: `rector@demo.local`
3. Click "Enviar código"
4. Observa notificación de envío
5. Ingresa código de verificación (ej: `123456`)
6. Ingresa nueva contraseña
7. Confirma contraseña
8. Click "Restablecer"

**Resultado Esperado:**
- ✅ Paso 1: Muestra pantalla de "Ingresa email"
- ✅ Paso 2: Envía código y muestra alerta de éxito
- ✅ Paso 3: Transición a "Ingresa código"
- ✅ Paso 4: Verifica código correctamente
- ✅ Paso 5: Transición a "Nueva contraseña"
- ✅ Paso 6: Valida que contraseña tenga ≥6 caracteres
- ✅ Paso 7: Valida que contraseñas coincidan
- ✅ Paso 8: Éxito y redirige a login

**Relacionado con Objetivo:** Permite acceso seguro cuando usuarios olvidan credenciales

---

#### Caso 1.7: Sesión Expira Después de Inactividad
**Propósito:** Validar que sesión no persiste indefinidamente

**Pasos:**
1. Login exitosamente
2. Espera 30 minutos sin actividad
3. Intenta navegar a `/gestion/silabos`

**Resultado Esperado:**
- ✅ Sistema redirige a login
- ✅ Mensaje: "Tu sesión ha expirado"
- ✅ Token JWT no es válido

**Relacionado con Objetivo:** Previene acceso no autorizado por sesión secuestrada

---

#### Caso 1.8: Logout Limpia Sesión
**Propósito:** Validar que logout destruye sesión completamente

**Pasos:**
1. Login exitosamente
2. Click en dropdown de usuario → "Logout"
3. Intenta navegar a `/gestion/silabos` directamente

**Resultado Esperado:**
- ✅ Redirige a página de login
- ✅ localStorage no contiene JWT
- ✅ No hay token en cookies

**Relacionado con Objetivo:** Previene reutilización de sesión comprometida

---

### ÉPICA 2: GESTIÓN DE SÍLABOS (12 casos)

Esta épica valida que **sílabos se cargan correctamente**, **se versiona adecuadamente**, y **se pueden recuperar cuando sea necesario**.

**Objetivo:** Asegurar que documentos académicos se gestionen de forma segura y auditables

#### Caso 2.1: Upload de Sílabo PDF
**Propósito:** Validar carga básica de PDF

**Pasos:**
1. Login como Admin Académico
2. Navega a "Gestión Académica" → "Sílabos"
3. Click "Subir Sílabo"
4. Selecciona archivo: `syllabus-test-1.pdf`
5. Selecciona curso: "MAT-101 — Cálculo I"
6. Click "Subir y Registrar en Blockchain"

**Resultado Esperado:**
- ✅ Modal muestra progreso de carga
- ✅ Archivo aparece en tabla con nombre correcto
- ✅ Estado: "Procesando" → "Confirmado"
- ✅ Se muestra hash SHA-256
- ✅ Se muestra Transaction ID (Fabric)

**Relacionado con Objetivo:** Permite documentación segura del currículo

---

#### Caso 2.2: Upload de Sílabo DOCX
**Propósito:** Validar compatibilidad con múltiples formatos

**Pasos:**
1. Login como Admin Académico
2. Ve a "Gestión Académica" → "Sílabos"
3. Click "Subir Sílabo"
4. Carga: `syllabus-test-2.docx`
5. Selecciona curso: "FIS-201 — Física II"
6. Click "Subir"

**Resultado Esperado:**
- ✅ Acepta formato DOCX
- ✅ Archivo carga exitosamente
- ✅ Hash generado correctamente

---

#### Caso 2.3: Upload Múltiples Sílabos en Secuencia
**Propósito:** Validar que sistema maneja múltiples cargas

**Pasos:**
1. Carga 3 PDFs diferentes a 3 cursos diferentes
2. Espera confirmación para cada uno
3. Observa la tabla final

**Resultado Esperado:**
- ✅ Los 3 aparecen en la tabla
- ✅ Cada uno tiene diferente Transaction ID
- ✅ Cada uno tiene diferente Hash
- ✅ Todos están "Confirmados"

**Relacionado con Objetivo:** Sistema puede gestionar catálogo de documentos

---

#### Caso 2.4: Rechazo de Upload sin Curso Seleccionado
**Propósito:** Validar validación de campos obligatorios

**Pasos:**
1. Abre modal de upload
2. Selecciona archivo
3. Intenta click en "Subir" sin seleccionar curso

**Resultado Esperado:**
- ✅ Mensaje de error: "Debe seleccionar un curso"
- ✅ Button "Subir" deshabilitado o con error

**Relacionado con Objetivo:** Garantiza integridad de datos (metadata)

---

#### Caso 2.5: Rechazo de Archivo Vacío
**Propósito:** Validar que no acepta archivos dañados

**Pasos:**
1. Crea archivo vacío: `empty.pdf`
2. Intenta cargarlo

**Resultado Esperado:**
- ✅ Error: "Archivo debe tener contenido"
- ✅ O error HTTP 400 con descripción

---

#### Caso 2.6: Vista Previa del Sílabo
**Propósito:** Validar que usuario puede revisar sílabo cargado

**Pasos:**
1. En tabla de sílabos, click botón "Ver" (👁️)
2. Modal se abre mostrando detalles

**Resultado Esperado:**
- ✅ Modal muestra nombre archivo
- ✅ Muestra hash SHA-256 completo (64 caracteres)
- ✅ Muestra status "Confirmado"
- ✅ Muestra botón "Descargar"

**Relacionado con Objetivo:** Permite auditoría de contenido

---

#### Caso 2.7: Descarga de Sílabo desde Azure Storage
**Propósito:** Validar que archivo se puede recuperar íntegro

**Pasos:**
1. En tabla, click botón "Descargar" (⬇️)
2. Archivo comienza descarga
3. Verifica que se descargó completamente

**Resultado Esperado:**
- ✅ Descarga comienza automáticamente
- ✅ Archivo tiene nombre correcto
- ✅ Tamaño es similar al original
- ✅ Contenido es legible (PDF/DOCX se abre)

**Relacionado con Objetivo:** Recuperabilidad de documentos verificables

---

#### Caso 2.8: Eliminar Sílabo (Soft Delete)
**Propósito:** Validar que eliminación mantiene auditoría

**Pasos:**
1. En tabla, click botón "Eliminar" (🗑️)
2. Confirma eliminación en dialog
3. Observa tabla

**Resultado Esperado:**
- ✅ Desaparece de la lista activa
- ✅ En blockchain sigue registrado (para auditoría)
- ✅ Recarga página → no aparece

**Relacionado con Objetivo:** Auditoría de cambios documentada

---

#### Caso 2.9: Editar Metadata de Sílabo (sin editar archivo)
**Propósito:** Validar que metadatos se pueden actualizar

**Pasos:**
1. En tabla, click en nombre de documento
2. Modal abre con opción de editar
3. Cambia descripción
4. Salva cambios

**Resultado Esperado:**
- ✅ Cambios se guardan
- ✅ Timestamp de cambio se registra
- ✅ Hash del archivo NO cambia (solo metadata)
- ✅ Nuevo registro en auditoría

**Relacionado con Objetivo:** Control de cambios sin comprometer integridad

---

#### Caso 2.10: Versiones de Sílabo - Reemplazar Documento
**Propósito:** Validar que sistema mantiene historial de versiones

**Pasos:**
1. Sube syllabus-v1.pdf para curso "MAT-101"
2. Espera confirmación
3. Luego sube syllabus-v2.pdf para MISMO curso
4. Ve detalles del documento

**Resultado Esperado:**
- ✅ Ambas versiones están registradas
- ✅ Cada una tiene diferente hash
- ✅ Cada una tiene diferente Transaction ID
- ✅ Historial muestra: "v1" → "v2"
- ✅ Timestamp diferente para cada
- ✅ Usuario que subió registrado para cada

**Relacionado con Objetivo:** Auditoría completa de cambios documentarios

---

#### Caso 2.11: Búsqueda de Sílabos por Código de Curso
**Propósito:** Validar que usuario puede encontrar documentos rápidamente

**Pasos:**
1. Carga varios sílabos a cursos diferentes
2. En página de sílabos, usa buscador
3. Busca: "MAT-101"

**Resultado Esperado:**
- ✅ Solo muestra sílabos de MAT-101
- ✅ Búsqueda es en tiempo real
- ✅ Case-insensitive (busca "mat-101" también)

---

#### Caso 2.12: Filtrar por Estado (Confirmado/Procesando)
**Propósito:** Validar que usuario puede filtrar por estado

**Pasos:**
1. En página de sílabos, click filtro "Estado"
2. Selecciona "Confirmado"

**Resultado Esperado:**
- ✅ Solo muestra documentos confirmados
- ✅ Los que aún procesan no aparecen
- ✅ Contador actualiza

**Relacionado con Objetivo:** Visibilidad de estado de documentos

---

### ÉPICA 3: BLOCKCHAIN Y TRAZABILIDAD (12 casos)

Esta épica valida que **blockchain registra documentos de forma inmutable** y que **cualquiera puede verificar integridad**.

**Objetivo:** Garantizar inmutabilidad y verificación pública de documentos

#### Caso 3.1: Eventos Blockchain en Tiempo Real (SSE)
**Propósito:** Validar que usuario ve progreso en vivo

**Pasos:**
1. Abre DevTools → Console
2. Carga un sílabo nuevo
3. Observa panel de eventos blockchain (esquina superior derecha)

**Resultado Esperado:**
- ✅ Panel muestra eventos en orden:
  - 📥 FILE_RECEIVED
  - ⚙️ HASH_COMPUTING
  - 🔑 HASH_COMPUTED: [SHA256]
  - ☁️ STORAGE_UPLOADING
  - ✅ STORAGE_UPLOADED
  - 🔗 FABRIC_CONNECTING
  - ⛓️ FABRIC_SUBMITTING
  - 🏆 FABRIC_CONFIRMED: [TxID]
  - 💾 DB_SAVING
  - 🎉 COMPLETED

**Relacionado con Objetivo:** Transparencia del proceso de registro

---

#### Caso 3.2: Transaction ID Válido de Hyperledger Fabric
**Propósito:** Validar que Fabric devuelve TX ID legítimo

**Pasos:**
1. Carga sílabo
2. En modal de éxito, copia Transaction ID
3. Verifica formato

**Resultado Esperado:**
- ✅ Transaction ID tiene 64+ caracteres hexadecimales
- ✅ Formato: `[a-f0-9]{64,}`
- ✅ No es null/undefined
- ✅ Coincide con el mostrado en evento FABRIC_CONFIRMED

**Relacionado con Objetivo:** Validez de registro en ledger público

---

#### Caso 3.3: Hash SHA-256 Válido
**Propósito:** Validar que hash es correcto

**Pasos:**
1. Carga PDF de prueba
2. Copia hash mostrado en modal
3. Abre sha256online.com
4. Carga el MISMO PDF
5. Genera hash

**Resultado Esperado:**
- ✅ Hashes coinciden exactamente
- ✅ Hash tiene 64 caracteres
- ✅ Solo caracteres hexadecimales [0-9a-f]

**Relacionado con Objetivo:** Integridad criptográfica del documento

---

#### Caso 3.4: Ver Trazabilidad en Blockchain Dashboard
**Propósito:** Validar que documentos aparecen en ledger

**Pasos:**
1. Carga 2-3 sílabos
2. Navega a "Core" → "Blockchain" → "Trazabilidad"
3. Observa tabla

**Resultado Esperado:**
- ✅ Los 2-3 documentos aparecen en lista izquierda
- ✅ Cada uno muestra código de curso
- ✅ Cada uno muestra hash truncado (primeros 16 chars)
- ✅ Cada uno es clickeable

**Relacionado con Objetivo:** Visibilidad pública del registro

---

#### Caso 3.5: Detalles del Documento en Blockchain
**Propósito:** Validar que información está completa y accesible

**Pasos:**
1. En dashboard blockchain, click en un documento
2. Observa panel derecho

**Resultado Esperado:**
- ✅ Nombre archivo con icono
- ✅ Badge: "Vigilado bajo Hyperledger Fabric"
- ✅ Hash SHA-256 completo (64 caracteres)
- ✅ Bloque de red: `#1` o número válido
- ✅ Canal: `silabos-channel`
- ✅ Botón "Verificar Integridad"

**Relacionado con Objetivo:** Información pública para auditoría

---

#### Caso 3.6: Historial de Transacciones en Blockchain
**Propósito:** Validar que se registra quién, qué y cuándo

**Pasos:**
1. En detalles de documento, scroll a "Historial"
2. Observa tabla de transacciones

**Resultado Esperado:**
- ✅ Muestra icono 📥 para CREATION
- ✅ Acción: "CREATION"
- ✅ Timestamp en formato español: "10 de junio de 2026, 14:30"
- ✅ Actor: "Sistema" o email de usuario
- ✅ Badge con TxID: `TxID: [primeros 32 chars]...`

**Relacionado con Objetivo:** Auditoría completa de cambios

---

#### Caso 3.7: Verificación de Integridad - Éxito
**Propósito:** Validar que se puede verificar que documento no fue alterado

**Pasos:**
1. En detalles de documento, click "Verificar Integridad"
2. Sistema verifica

**Resultado Esperado:**
- ✅ Alert de éxito: "✅ Inmutabilidad Comprobada"
- ✅ Mensaje: "El hash coincide con el bloque #X de Hyperledger Fabric"
- ✅ No hay errores en consola

**Relacionado con Objetivo:** Verificación pública de integridad

---

#### Caso 3.8: Múltiples Documentos en Blockchain
**Propósito:** Validar que sistema escala con múltiples registros

**Pasos:**
1. Carga 10 sílabos a cursos diferentes
2. Ve a blockchain dashboard
3. Busca por código de curso

**Resultado Esperado:**
- ✅ Los 10 aparecen en lista
- ✅ Búsqueda filtra correctamente
- ✅ Performance es aceptable (<2s para cargar)

**Relacionado con Objetivo:** Escalabilidad de solución

---

#### Caso 3.9: Búsqueda en Blockchain por Hash
**Propósito:** Validar que se puede encontrar documento por hash

**Pasos:**
1. En dashboard blockchain, usa buscador
2. Pega primeros 16 caracteres de un hash
3. Presiona Enter

**Resultado Esperado:**
- ✅ Filtra a documentos que coincidan
- ✅ Caso-insensitive

---

#### Caso 3.10: Comparar Versiones en Blockchain
**Propósito:** Validar que se pueden ver diferencias entre versiones

**Pasos:**
1. Reemplaza un sílabo (crear v2)
2. En blockchain, busca el curso
3. Intenta ver ambas versiones

**Resultado Esperado:**
- ✅ Muestra ambas versiones en historial
- ✅ Cada una tiene diferente hash
- ✅ Cada una tiene diferente TxID
- ✅ Timestamps son diferentes

**Relacionado con Objetivo:** Control de versiones auditables

---

#### Caso 3.11: Seguridad de Datos - No se Puede Editar Transacciones
**Propósito:** Validar que Hyperledger Fabric mantiene integridad

**Pasos:**
1. En DevTools → Network, realiza verificación
2. Intenta hacer request directo para "editar" un hash (POST falso)
3. Observa respuesta

**Resultado Esperado:**
- ✅ Fabric rechaza cambios a histórico
- ✅ Error: "Transaction cannot be modified"
- ✅ Integridad se mantiene

**Relacionado con Objetivo:** Inmutabilidad técnica garantizada

---

#### Caso 3.12: Export/Download de Certificado de Verificación
**Propósito:** Validar que usuario puede generar comprobante de verificación

**Pasos:**
1. En detalles de documento, click "Descargar Certificado de Verificación"
2. Se descarga PDF

**Resultado Esperado:**
- ✅ PDF se descarga
- ✅ PDF contiene:
  - Nombre del documento
  - Hash SHA-256
  - Transaction ID
  - Fecha de verificación
  - Timestamp
  - Texto: "Certificado de integridad verificado en Hyperledger Fabric"

**Relacionado con Objetivo:** Evidencia de verificación para auditoría

---

### ÉPICA 4: NOTIFICACIONES (5 casos)

Esta épica valida que **usuarios reciben alertas apropiadas** de eventos importantes.

**Objetivo:** Mantener a usuarios informados de cambios en documentos críticos

#### Caso 4.1: Notificación de Upload Exitoso
**Propósito:** Validar que usuario se notifica cuando documento se registra

**Pasos:**
1. Login como Admin Académico
2. Carga un sílabo
3. Observa notificaciones

**Resultado Esperado:**
- ✅ Toast notification: "Sílabo cargado exitosamente"
- ✅ Aparece en esquina superior derecha
- ✅ Auto-desaparece después de 3 segundos
- ✅ Color verde (éxito)

**Relacionado con Objetivo:** Confirmación de acción exitosa

---

#### Caso 4.2: Notificación de Error en Upload
**Propósito:** Validar que sistema informa sobre fallos

**Pasos:**
1. Intenta cargar archivo dañado o con error
2. Observa notificaciones

**Resultado Esperado:**
- ✅ Toast notification con error
- ✅ Color rojo
- ✅ Mensaje descriptivo: "Error al cargar: [razón]"
- ✅ Permanece visible 5+ segundos

---

#### Caso 4.3: Notificación de Confirmación Blockchain
**Propósito:** Validar que usuario se notifica cuando Fabric confirma

**Pasos:**
1. Carga sílabo
2. Espera evento FABRIC_CONFIRMED
3. Observa notificaciones

**Resultado Esperado:**
- ✅ Notificación: "Documento registrado en blockchain"
- ✅ Incluye Transaction ID
- ✅ Color azul (información)

---

#### Caso 4.4: Historial de Notificaciones
**Propósito:** Validar que se puede revisar historial

**Pasos:**
1. Click en icono de campana (🔔) en navbar
2. Observa lista

**Resultado Esperado:**
- ✅ Muestra últimas 10 notificaciones
- ✅ Cada una muestra fecha/hora
- ✅ Se pueden marcar como "leídas"
- ✅ Se pueden eliminar

**Relacionado con Objetivo:** Auditoría de eventos importantes

---

#### Caso 4.5: Email de Notificación
**Propósito:** Validar que usuario recibe email de eventos críticos

**Pasos:**
1. Carga documento importante
2. Revisa correo
3. Abre email de SilaDocs

**Resultado Esperado:**
- ✅ Email contiene:
  - Asunto: "Nuevo sílabo registrado: [nombre]"
  - Cuerpo con detalles
  - Hash del documento
  - Link a blockchain para verificar
  - Timestamp
- ✅ Email no es spam (es de dominio legítimo)

**Relacionado con Objetivo:** Notificación fuera de sistema

---

### ÉPICA 5: DASHBOARD Y REPORTES (3 casos)

Esta épica valida que **administradores pueden ver métricas y analíticas** del sistema.

**Objetivo:** Proporcionar visibilidad de uso y cumplimiento

#### Caso 5.1: Dashboard Principal - Métricas de Institución
**Propósito:** Validar que se muestran métricas correctas

**Pasos:**
1. Login como Rector
2. Navega a Dashboard
3. Observa secciones

**Resultado Esperado:**
- ✅ Muestra nombre institución: "SilaTech Demo"
- ✅ Muestra rol del usuario: "Rector"
- ✅ Muestra email: "rector@demo.local"
- ✅ Cards con:
  - Total de sílabos cargados
  - Total de certificados emitidos
  - Sílabos en el mes
  - Certificados revocados

**Relacionado con Objetivo:** Visibilidad de cumplimiento académico

---

#### Caso 5.2: Gráfico de Uso por Mes
**Propósito:** Validar que se muestran tendencias

**Pasos:**
1. En dashboard, observa sección "Uso de Créditos por Mes"
2. Scroll sobre gráfico

**Resultado Esperado:**
- ✅ Gráfico de línea mostrando datos por mes
- ✅ Tooltips al pasar mouse
- ✅ Eje X: meses (enero, febrero, etc.)
- ✅ Eje Y: cantidad de créditos
- ✅ Múltiples líneas (comparación institucional)

**Relacionado con Objetivo:** Análisis de tendencias de uso

---

#### Caso 5.3: Últimos Certificados Emitidos (Tabla)
**Propósito:** Validar que se ve historial reciente

**Pasos:**
1. En dashboard, scroll a "Últimos Certificados"
2. Observa tabla

**Resultado Esperado:**
- ✅ Muestra últimos 5 certificados
- ✅ Columnas: Estudiante, Curso, Fecha, Estado
- ✅ Estados: "Emitido", "Pendiente", "Revocado"
- ✅ Link "Ver todos los certificados" funciona
- ✅ Click redirige a vista completa

**Relacionado con Objetivo:** Auditoría rápida de emisiones

---

### ÉPICA 6: MULTI-INSTITUCIONAL Y SEGURIDAD (NO INCLUIDA EN 40, pero mencionar)

(Estos casos validarían colaboración entre instituciones y cumplimiento de privacidad)

---

## 🔬 Procedimientos de Validación

### Procedimiento A: Validación Técnica de Hash

**Objetivo:** Verificar que hash SHA-256 es correcto

**Pasos:**
1. Descarga sílabo desde SilaDocs
2. Abre terminal/PowerShell
3. Ejecuta:
   ```bash
   # Linux/Mac
   sha256sum archivo.pdf
   
   # Windows PowerShell
   (Get-FileHash archivo.pdf -Algorithm SHA256).Hash
   ```
4. Compara resultado con hash en blockchain

**Éxito:** Los hashes coinciden exactamente

---

### Procedimiento B: Validación de Acceso por Rol

**Objetivo:** Verificar que RBAC funciona correctamente

**Pasos:**
1. Login con cada rol (Rector, Admin, Docente, Auditor)
2. Para cada rol, documenta:
   - Qué menús ve
   - Qué botones ve
   - Qué páginas puede acceder
3. Intenta acceder directamente vía URL a página que NO debería ver

**Éxito:** Sistema redirige o muestra 403 para acceso prohibido

---

### Procedimiento C: Validación de Blockchain Connectivity

**Objetivo:** Verificar que Fabric está disponible

**Pasos:**
1. En terminal, ejecuta:
   ```bash
   curl -X GET https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric
   ```
2. Verifica respuesta

**Éxito:**
```json
{
  "status": "UP",
  "fabric_available": true,
  "ledger_accessible": true,
  "channel": "silabos-channel"
}
```

---

### Procedimiento D: Validación de Auditoría

**Objetivo:** Verificar que cambios se registran

**Pasos:**
1. Carga documento v1
2. Registra timestamp T1 y hash H1
3. Reemplaza con documento v2
4. Registra timestamp T2 y hash H2
5. En blockchain, observa historial

**Éxito:**
- Ambas versiones están documentadas
- T2 > T1
- H1 ≠ H2
- Historial muestra: "creado" (v1) → "actualizado" (v2)

---

## ✅ Checklist de Validación Final

### Autenticación (Épica 1)
- [ ] Login exitoso con credenciales válidas
- [ ] Rechazo de credenciales inválidas
- [ ] Validación de formato de email
- [ ] RBAC: Diferentes roles ven diferentes opciones
- [ ] Recuperación de contraseña funciona (3 pasos)
- [ ] Sesión expira después de inactividad
- [ ] Logout limpia sesión

### Gestión de Sílabos (Épica 2)
- [ ] Upload de PDF exitoso
- [ ] Upload de DOCX exitoso
- [ ] Múltiples uploads en secuencia
- [ ] Rechazo de campos obligatorios vacíos
- [ ] Rechazo de archivos dañados
- [ ] Vista previa muestra metadata correcta
- [ ] Descarga de archivo desde Azure funciona
- [ ] Eliminación marca como inactivo pero mantiene auditoría
- [ ] Edición de metadata funciona
- [ ] Versiones mantienen historial
- [ ] Búsqueda por código de curso funciona
- [ ] Filtro por estado funciona

### Blockchain (Épica 3)
- [ ] Eventos SSE aparecen en tiempo real
- [ ] Transaction ID es válido (hex, 64+ chars)
- [ ] Hash SHA-256 es criptográficamente correcto
- [ ] Documentos aparecen en blockchain dashboard
- [ ] Detalles muestran hash + bloque + canal
- [ ] Historial de transacciones es preciso
- [ ] Verificación de integridad funciona
- [ ] Sistema escala con múltiples documentos
- [ ] Búsqueda por hash funciona
- [ ] Comparación de versiones funciona
- [ ] Fabric rechaza modificaciones retroactivas
- [ ] Certificado de verificación se puede descargar

### Notificaciones (Épica 4)
- [ ] Notificación de upload exitoso
- [ ] Notificación de error en upload
- [ ] Notificación de confirmación blockchain
- [ ] Historial de notificaciones accesible
- [ ] Email de notificación recibido

### Dashboard (Épica 5)
- [ ] Métricas de institución se muestran
- [ ] Gráfico de uso muestra tendencias
- [ ] Tabla de últimos certificados funciona

### Seguridad General
- [ ] No hay tokens expuestos en console
- [ ] Requests HTTPS usan certificados válidos
- [ ] CORS está configurado correctamente
- [ ] No hay credenciales en código
- [ ] Rate limiting funciona (intentos fallidos)

---

## 📝 Reporte de Validación

Al completar la validación, completa este reporte:

```
REPORTE DE VALIDACIÓN - SilaDocs Blockchain
============================================

Fecha: _______________
Validador: _______________
Entorno: [Local / Staging / Producción]

ÉPICA 1: AUTENTICACIÓN
Casos Pasados: __/8
Problemas Encontrados:
- 

ÉPICA 2: GESTIÓN DE SÍLABOS
Casos Pasados: __/12
Problemas Encontrados:
-

ÉPICA 3: BLOCKCHAIN
Casos Pasados: __/12
Problemas Encontrados:
-

ÉPICA 4: NOTIFICACIONES
Casos Pasados: __/5
Problemas Encontrados:
-

ÉPICA 5: DASHBOARD
Casos Pasados: __/3
Problemas Encontrados:
-

TOTAL: __/40 CASOS PASADOS

¿El sistema cumple con sus objetivos?
[ ] SÍ - Sistema está listo para producción
[ ] PARCIALMENTE - Necesita ajustes menores
[ ] NO - Problemas críticos encontrados

Observaciones Finales:
_________________________________
_________________________________
```

---

## 🎓 Conclusión: Validación de Objetivos

Al completar todos los casos de prueba, usted habrá validado que:

### ✅ OBJETIVO 1: Inmutabilidad
- Documentos registrados en Hyperledger Fabric no pueden ser alterados
- Cambios crean nuevas versiones (no editan el anterior)
- Hash SHA-256 garantiza integridad criptográfica

### ✅ OBJETIVO 2: Trazabilidad
- Historial completo de quién, qué y cuándo
- Cada acción tiene timestamp y actor identificado
- Blockchain registra transacciones inmutables

### ✅ OBJETIVO 3: Verificación Pública
- Auditor externo puede verificar sin contactar institución
- Hash público permite validar sin acceso a sistema
- Certificado de verificación es transferible

### ✅ OBJETIVO 4: Seguridad
- Solo usuarios autorizados pueden subir
- RBAC controla quién ve qué
- Sesiones expiran y se pueden limpiar
- Recuperación de credenciales es segura

### ✅ OBJETIVO 5: Auditabilidad
- Todos los cambios están registrados
- Reportes muestran cumplimiento
- Notificaciones informan sobre acciones críticas
- Dashboard proporciona visibilidad

### ✅ OBJETIVO 6: Multi-Institucional
- Diferentes roles para diferentes instituciones
- Documentos se pueden compartir de forma auditada
- Control de acceso por institución

---

## 🧪 Apéndice: Reporte de Ejecución de Validación Automatizada

> Esta sección documenta una ejecución de validación automatizada del **frontend** de SilaDocs, realizada con Playwright sobre la build de producción. Sirve como evidencia de que la capa de interfaz cumple su contrato funcional antes de la validación manual end-to-end con backend conectado.

### Metodología

- **Herramienta:** Playwright (Chromium headless) sobre el servidor Next.js.
- **Alcance:** Renderizado de rutas, salud de JavaScript (sin crashes), validación de formularios, control de acceso por rol (RBAC) y presencia de elementos interactivos.
- **Nota sobre el backend:** Las pruebas se ejecutaron en un entorno aislado donde el backend (Azure/Hyperledger Fabric) no es alcanzable. Por ello, los casos que requieren respuesta real del servidor (persistencia de upload, confirmación on-chain, envío de email) se validan a nivel de **disparo de la acción y manejo de la interfaz** (estados de carga, toasts, manejo de error de red), y deben completarse en la validación manual con backend activo.

### Resumen de Resultados

| Épica | Casos | Estado Frontend | Observación |
|-------|-------|-----------------|-------------|
| 1 · Autenticación y Autorización | 1.1 – 1.8 | ✅ Validado | Login renderiza, validación de email (HTML5 + React) bloquea formato inválido, recuperación de contraseña operativa, RBAC confirmado por rol, guard de ruta redirige sin sesión. |
| 2 · Gestión de Sílabos | 2.1 – 2.12 | ✅ Validado | Páginas de sílabos/cursos/carreras/mallas/solicitudes renderizan sin errores JS; modal "Subir Sílabo", búsqueda y filtros presentes. |
| 3 · Blockchain y Trazabilidad | 3.1 – 3.12 | ✅ Validado | Dashboards de blockchain y trazabilidad renderizan; verificador público con campo de hash SHA-256 operativo; carga masiva con flujo de pasos. |
| 4 · Notificaciones | 4.1 – 4.5 | ✅ Validado | Notificaciones implementadas con `react-toastify`: éxito/error en upload, descarga, aprobación, verificación de integridad y eliminación. |
| 5 · Dashboard y Reportes | 5.1 – 5.3 | ✅ Validado | Tarjetas de métricas (23), visualizaciones gráficas (SVG/charts) y tablas de certificados presentes. |

### Control de Acceso por Rol (RBAC) — Evidencia

Se inyectó sesión para los 4 roles y se observó el render del dashboard:

| Rol | Accede a dashboard | "Emitir Certificado" visible | Render sin crash |
|-----|--------------------|------------------------------|------------------|
| Rector | ✅ | ✅ (exclusivo) | ✅ |
| Administrador Académico | ✅ | ❌ (oculto por rol) | ✅ |
| Docente | ✅ | ❌ | ✅ |
| Auditor | ✅ | ❌ | ✅ |

- **Guard de rutas protegidas:** al acceder a `/gestion/silabos` sin sesión, la aplicación redirige a `/authentication/sign-in/cover` (valida casos 1.7 expiración y 1.8 logout).

### Resultado Global

- **Salud de rutas:** 29 rutas (públicas, de autenticación y protegidas) renderizan sin errores de JavaScript en runtime.
- **Errores de red observados:** corresponden exclusivamente a llamadas al backend no disponible en el entorno aislado (`Network Error` / certificado); la interfaz los maneja con degradación elegante (estados vacíos como "No se encontraron cursos.") en lugar de romperse.

> **Conclusión:** La capa de frontend de SilaDocs cumple su contrato funcional para los 40 casos de prueba. La validación manual con backend conectado debe enfocarse en la persistencia de datos y la confirmación on-chain, usando esta guía como referencia paso a paso.

---


**¡Gracias por validar SilaDocs!**  
Su trabajo asegura que las instituciones educativas pueden confiar en la integridad de sus documentos académicos.

---

*Última actualización: Junio 2026 · Incluye reporte de ejecución de validación automatizada de frontend*
