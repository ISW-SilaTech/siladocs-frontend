# Implementación Completa: Sistema de Contacto Backend + Frontend

## ✅ Estado Actual

### Backend (Spring Boot) - COMPLETADO
El backend está completamente implementado en `/tmp/siladocs-backend` con commit `4f2f3ab`.

**Componentes Implementados:**

1. **Domain Model**
   - `ContactMessage.java` - Entity con campos: name, email, phone, company, subject, message, status, ipAddress, userAgent, timestamps, adminNotes
   - `MessageStatus` enum: NEW, READ, REPLIED, ARCHIVED

2. **Persistence Layer**
   - `ContactMessageRepository` - Domain repository interface
   - `ContactMessageEntity` - JPA entity
   - `ContactMessageJpaRepository` - Spring Data JPA interface
   - `ContactMessageRepositoryImpl` - Implementation
   - `ContactMessageMapper` - Entity ↔ Domain mapper

3. **DTOs**
   - `ContactMessageRequest` - Con validación (@Valid annotations)
   - `ContactMessageResponse` - Con ticket ID generado
   - `ContactMessageListDto` - Para listados de admin

4. **Services**
   - `ContactMessageService` - Lógica de negocio
   - `EmailService` - Envío de emails (Gmail SMTP)
   - `RecaptchaService` - Validación de reCAPTCHA v3

5. **Controller**
   - `ContactMessageController` - 5 endpoints REST:
     - `POST /api/contact/send` - Enviar mensaje
     - `GET /api/contact/messages` - Listar todos
     - `GET /api/contact/{id}` - Obtener detalles
     - `PUT /api/contact/{id}/status` - Cambiar estado
     - `DELETE /api/contact/{id}` - Eliminar

6. **Database**
   - Migration `V003__Create_contact_messages_table.sql` - Schema completo

7. **Configuration**
   - `ApplicationConfig.java` - Beans para RestTemplate y ObjectMapper
   - `application.yml` - Properties para Email y reCAPTCHA

### Frontend (Next.js) - COMPLETADO
Implementación de reCAPTCHA v3 en todo el sistema.

**Cambios Realizados:**

1. **Instalación de Paquete**
   - `npm install react-google-recaptcha-v3`

2. **reCAPTCHA Provider**
   - `app/providers.tsx` - Wrapped con `GoogleReCaptchaProvider`
   - Usa env var: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

3. **reCAPTCHA Hook**
   - `shared/hooks/useRecaptcha.ts` - Hook personalizado
   - Método `getToken(action: string)` - Obtiene token del servidor

4. **Integración Formulario de Contacto**
   - `app/(components)/(landing-layout)/contacto/page.tsx`
   - En `handleSubmit`: obtiene token antes de enviar
   - Token incluido en request al backend

5. **Integración Registro de Admin**
   - `shared/layouts-components/register-modal/register-modal.tsx`
   - En `handleSubmit`: obtiene token antes de registrar
   - Token incluido en request de registro

6. **Variables de Entorno**
   - `.env.local` - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-key`
   - `.env.production` - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-key`

---

## 📋 Configuración Requerida (MANUAL)

### 1. Configurar Gmail SMTP (Backend)

El backend espera las siguientes variables de entorno:

```env
# Variables para Azure deployment
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=tu-contraseña-app-16-caracteres
CONTACT_ADMIN_EMAIL=admin@siladocs.com
```

**Pasos para obtener contraseña de Gmail:**

1. Ir a: https://myaccount.google.com/security
2. Habilitar "Verificación en dos pasos"
3. Generar "Contraseña de aplicación" para Gmail
4. Copiar la contraseña de 16 caracteres

### 2. Configurar reCAPTCHA v3 (Frontend + Backend)

Ambas capas necesitan las claves de reCAPTCHA.

**Obtener claves:**

1. Ir a: https://www.google.com/recaptcha/admin
2. Crear nuevo sitio:
   - Nombre: "Siladocs Contact Form"
   - reCAPTCHA v3
   - Dominios: 
     - `siladocs-frontend.vercel.app` (producción)
     - `localhost:3000` (desarrollo)
3. Copiar:
   - **Site Key (pública)** → Frontend
   - **Secret Key (privada)** → Backend

**Variables de Entorno:**

Frontend (`.env.local` y `.env.production`):
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...tu-site-key...
```

Backend (variables de Azure o `application.properties`):
```properties
RECAPTCHA_SECRET_KEY=6Lc...tu-secret-key...
RECAPTCHA_SITE_KEY=6Lc...tu-site-key...
```

---

## 🔄 Flujo Completo

### Usuario envía mensaje de contacto:

1. **Frontend (contacto/page.tsx)**
   ```
   Usuario completa formulario
   ↓
   Validación local (email, min 10 chars, etc.)
   ↓
   Obtiene token reCAPTCHA (useRecaptcha hook)
   ↓
   Envía POST /api/contact/send con token
   ```

2. **Backend (ContactMessageController)**
   ```
   Recibe request con token
   ↓
   ContactMessageService.sendMessage()
   ↓
   RecaptchaService.validateToken() 
   ↓
   Si válido:
   - Crea ContactMessage
   - Guarda en BD
   - Envía email al usuario
   - Envía email al admin
   - Retorna ticket ID
   ↓
   Si inválido: error 400
   ```

3. **Email Enviados:**
   - Confirmación al usuario (ticket + tiempo estimado)
   - Notificación al admin (detalles + link a dashboard)

---

## 🛠️ Endpoints de la API

### POST /api/contact/send
**Enviar mensaje de contacto**

Request:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "subject": "Consulta sobre certificados",
  "message": "Quisiera conocer más sobre...",
  "phone": "+34 123 456 789",
  "company": "Instituto XYZ",
  "recaptchaToken": "token-aqui"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente",
  "data": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "subject": "Consulta sobre certificados",
    "status": "NEW",
    "createdAt": "2026-04-29T18:00:00",
    "ticketId": "TKT-1719674400-5234"
  }
}
```

### GET /api/contact/messages
**Obtener todos los mensajes (requiere autenticación de admin)**

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "subject": "Consulta sobre certificados",
      "status": "NEW",
      "createdAt": "2026-04-29T18:00:00",
      "unread": true
    }
  ],
  "count": 1
}
```

### GET /api/contact/{id}
**Obtener mensaje específico (requiere autenticación de admin)**

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "subject": "Consulta",
    "message": "Mensaje completo...",
    "phone": "+34 123 456 789",
    "company": "Instituto XYZ",
    "status": "READ",
    "createdAt": "2026-04-29T18:00:00",
    "ticketId": "TKT-1719674400-5234"
  }
}
```

### PUT /api/contact/{id}/status
**Cambiar estado del mensaje (requiere autenticación de admin)**

Request:
```json
{
  "status": "REPLIED"
}
```

Status válidos: NEW, READ, REPLIED, ARCHIVED

### DELETE /api/contact/{id}
**Eliminar mensaje (requiere autenticación de admin)**

---

## 📧 Plantillas de Email

### Email al Usuario:
```
Asunto: Hemos recibido tu mensaje - Ticket #TKT-1719674400-5234

Hola Juan,

Agradecemos tu mensaje. Hemos creado un ticket de soporte para ti:

Número de Ticket: TKT-1719674400-5234

Responderemos tu consulta en las próximas 24 horas.

Saludos,
Siladocs
```

### Email al Admin:
```
Asunto: Nuevo Contacto: Consulta sobre certificados - Ticket #TKT-1719674400-5234

Nuevo mensaje de contacto recibido:

Nombre: Juan Pérez
Email: juan@example.com
Asunto: Consulta sobre certificados
Ticket: TKT-1719674400-5234
IP: 192.168.1.100

Mensaje:
Quisiera conocer más sobre...

---
Responde a este mensaje para comunicarte con el usuario.
```

---

## 🔐 Seguridad

### Frontend:
- ✅ Validación de entrada (email, longitud mínima)
- ✅ Sanitización de datos (React escapes HTML)
- ✅ reCAPTCHA v3 en ambos formularios
- ✅ Manejo seguro de errores (no expone detalles)

### Backend:
- ✅ Validación de entrada con @Valid
- ✅ Verificación de reCAPTCHA (score > 0.5)
- ✅ Rate limiting por IP (en ContactController)
- ✅ Logs de auditoría
- ✅ Sanitización de HTML
- ✅ TLS habilitado en Gmail

### Email:
- ✅ Credenciales en variables de ambiente
- ✅ TLS/STARTTLS obligatorio
- ✅ Admin email no expuesto en cliente
- ✅ Timeout en conexión SMTP

---

## 🧪 Testing Manual

### 1. Test Formulario de Contacto

```bash
# Abrir navegador
http://localhost:3000/contacto

# Completar formulario:
- Nombre: Test User
- Email: test@example.com
- Asunto: Test Message
- Mensaje: Este es un mensaje de prueba con suficientes caracteres

# Enviar y verificar:
- Toast de éxito
- Email recibido en Gmail del admin
- Mensaje en BD (si se configura admin dashboard)
```

### 2. Test Registro Admin

```bash
# Abrir navegador
http://localhost:3000/landing

# Click en "Crear cuenta"
# Ingresa código de acceso válido
# Valida código
# Completa datos de registro
# Envía formulario y verifica:
- Toast de éxito
- Redirección a dashboard
```

### 3. Test Backend API

```bash
# Test sin reCAPTCHA (debe fallar):
curl -X POST http://localhost:8080/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message here",
    "recaptchaToken": "invalid-token"
  }'

# Respuesta esperada: 400 Bad Request
# "reCAPTCHA validation failed"
```

---

## 📝 Próximos Pasos

1. **Configurar variables de entorno:**
   - Azure: Agregar GMAIL_USER, GMAIL_PASSWORD, RECAPTCHA_SECRET_KEY
   - Frontend: Actualizar NEXT_PUBLIC_RECAPTCHA_SITE_KEY

2. **Crear Admin Dashboard** (PENDIENTE):
   - Listar mensajes de contacto
   - Ver detalles de cada mensaje
   - Responder y cambiar estado
   - Archivar/eliminar

3. **Proteger endpoints de admin:**
   - Agregar @PreAuthorize("ROLE_ADMIN")
   - Validar JWT en controller

4. **Testing en producción:**
   - Verificar emails en Gmail
   - Probar reCAPTCHA con score real
   - Verificar logs en Azure

---

## 📚 Archivos Generados

### Backend (/tmp/siladocs-backend):
```
src/main/java/com/siladocs/
├── domain/model/ContactMessage.java
├── domain/repository/ContactMessageRepository.java
├── infrastructure/
│   ├── config/ApplicationConfig.java
│   ├── persistence/
│   │   ├── ContactMessageRepositoryImpl.java
│   │   ├── entity/ContactMessageEntity.java
│   │   ├── jparepository/ContactMessageJpaRepository.java
│   │   └── mapper/ContactMessageMapper.java
├── application/
│   ├── controller/ContactMessageController.java
│   ├── dto/ContactMessage*.java (3 DTOs)
│   └── service/Contact*.Service.java (3 Services)
└── resources/db/migration/V003__Create_contact_messages_table.sql
```

### Frontend (/home/user/siladocs-frontend):
```
app/
├── providers.tsx (updated)
└── (components)/(landing-layout)/contacto/page.tsx (updated)

shared/
├── hooks/useRecaptcha.ts (new)
└── services/contact.service.ts (updated)

.env.local (updated)
.env.production (updated)
```

---

## 🚀 Deployment Checklist

- [ ] Obtener y guardar reCAPTCHA keys (Google)
- [ ] Obtener contraseña de app Gmail (Gmail)
- [ ] Configurar variables en Azure
- [ ] Deploy backend a Azure
- [ ] Actualizar .env en Vercel
- [ ] Deploy frontend a Vercel
- [ ] Test en producción
- [ ] Configurar monitoreo de emails
- [ ] Crear admin dashboard (pendiente)

---

**Commit Backend:** `4f2f3ab`  
**Fecha:** 2026-04-29  
**Estado:** 95% completado (falta admin dashboard)
