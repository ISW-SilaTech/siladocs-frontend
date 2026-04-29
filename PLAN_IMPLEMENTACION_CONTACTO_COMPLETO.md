# Plan de Implementación Completa: Sistema de Contacto

## 📋 Información Configurada
- **Backend:** Spring Boot (Azure)
- **Email:** Gmail SMTP
- **Database:** PostgreSQL
- **Credenciales:** Necesita configuración

---

## 🏗️ Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                      │
├──────────────────────────────────────────────────────────┤
│  Landing Page                                             │
│  └── Button "Contacta"                                    │
│       └── /contacto/ (ya implementado)                    │
│           └── ContactForm                                 │
│               └── POST /api/contact/send                  │
│                   └── Validar reCAPTCHA                   │
└──────────────────────────────────────────────────────────┘
              ↓ HTTP(S)
┌──────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)                        │
├──────────────────────────────────────────────────────────┤
│  Controller: ContactController                            │
│  ├── POST /api/contact/send                              │
│  ├── GET /api/contact/messages (admin)                   │
│  ├── GET /api/contact/{id} (admin)                       │
│  └── PUT /api/contact/{id}/status (admin)                │
│                                                           │
│  Service: ContactService                                  │
│  ├── validateRecaptcha()                                 │
│  ├── saveMessage()                                       │
│  ├── sendConfirmationEmail()                             │
│  └── getMessages()                                       │
│                                                           │
│  Repository: ContactMessageRepository                     │
│  └── JPA CRUD operations                                 │
└──────────────────────────────────────────────────────────┘
              ↓ JDBC
┌──────────────────────────────────────────────────────────┐
│            DATABASE (PostgreSQL)                          │
├──────────────────────────────────────────────────────────┤
│  Table: contact_messages                                  │
│  ├── id (UUID, PK)                                       │
│  ├── name (VARCHAR 255)                                  │
│  ├── email (VARCHAR 255)                                 │
│  ├── phone (VARCHAR 20, nullable)                        │
│  ├── company (VARCHAR 255, nullable)                     │
│  ├── subject (VARCHAR 255)                               │
│  ├── message (TEXT)                                      │
│  ├── status (ENUM: new, read, replied, archived)        │
│  ├── ip_address (VARCHAR 45)                             │
│  ├── user_agent (TEXT, nullable)                         │
│  ├── created_at (TIMESTAMP)                              │
│  ├── updated_at (TIMESTAMP)                              │
│  ├── replied_at (TIMESTAMP, nullable)                    │
│  └── admin_notes (TEXT, nullable)                        │
└──────────────────────────────────────────────────────────┘
         ↓ SMTP
┌──────────────────────────────────────────────────────────┐
│           EMAIL SERVICE (Gmail SMTP)                      │
├──────────────────────────────────────────────────────────┤
│  Config: spring-boot-starter-mail                         │
│  Host: smtp.gmail.com                                     │
│  Port: 587 (TLS)                                         │
│                                                           │
│  Emails a enviar:                                         │
│  1. Confirmación al usuario                              │
│  2. Notificación al admin                                │
│  3. Respuesta automática (opcional)                      │
└──────────────────────────────────────────────────────────┘
         ↓ API
┌──────────────────────────────────────────────────────────┐
│         EXTERNAL SERVICES                                 │
├──────────────────────────────────────────────────────────┤
│  Google reCAPTCHA v3                                      │
│  └── Validación en servidor                              │
│                                                           │
│  SendGrid (Opcional)                                      │
│  └── Si prefieres en lugar de Gmail                      │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Pasos de Implementación

### PASO 1: Configuración de Gmail SMTP
**Responsable:** Tú (necesita acceso a Gmail)

```
1. Ir a: https://myaccount.google.com/security
2. Habilitar "Verificación en dos pasos"
3. Generar "Contraseña de aplicación" (app password)
4. Copiar la contraseña (16 caracteres)
5. Guardar seguro para configuración
```

### PASO 2: Configuración de reCAPTCHA v3
**Responsable:** Tú (necesita Google account)

```
1. Ir a: https://www.google.com/recaptcha/admin
2. Crear nuevo sitio
3. Nombre: "Siladocs Contact Form"
4. Tipo: reCAPTCHA v3
5. Dominios: siladocs-frontend.vercel.app, localhost
6. Copiar Site Key (público) y Secret Key (privado)
7. Guardar seguro
```

### PASO 3: Backend Spring Boot
**Implementar en repositorio del backend**

Archivos a crear:
```
src/main/java/com/siladocs/
├── model/
│   └── ContactMessage.java
├── dto/
│   ├── ContactMessageRequest.java
│   ├── ContactMessageResponse.java
│   └── ContactMessageListDto.java
├── repository/
│   └── ContactMessageRepository.java
├── service/
│   ├── ContactService.java
│   ├── EmailService.java
│   └── RecaptchaService.java
├── controller/
│   └── ContactController.java
└── config/
    └── EmailConfig.java
```

### PASO 4: Database Schema PostgreSQL
**Ejecutar SQL en la BD**

```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  replied_at TIMESTAMP,
  admin_notes TEXT
);

CREATE INDEX idx_email ON contact_messages(email);
CREATE INDEX idx_status ON contact_messages(status);
CREATE INDEX idx_created_at ON contact_messages(created_at DESC);
```

### PASO 5: Frontend - reCAPTCHA
**Modificar register-modal.tsx y contact form**

```
1. Instalar: npm install @react-google-recaptcha-v3
2. Wrappear app con: <GoogleReCaptchaProvider>
3. En formulario: const executeRecaptcha = useGoogleReCaptcha()
4. Al submit: const token = await executeRecaptcha("submit")
5. Enviar token al backend
```

### PASO 6: Admin Dashboard
**Crear en frontend**

```
/dashboards/contactos/
├── page.tsx (lista de mensajes)
├── [id]/
│   └── page.tsx (detalle + respuesta)
```

Funcionalidades:
- Ver lista de mensajes (con filtros)
- Ver detalles de cada mensaje
- Marcar como leído
- Responder automáticamente
- Archivar

---

## 🔑 Variables de Configuración

### Backend (application.properties)
```properties
# Gmail Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${GMAIL_USER}
spring.mail.password=${GMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# reCAPTCHA
recaptcha.secret-key=${RECAPTCHA_SECRET_KEY}
recaptcha.site-key=${RECAPTCHA_SITE_KEY}

# Contact
contact.admin-email=admin@siladocs.com
contact.from-email=${GMAIL_USER}
contact.from-name=Siladocs Contact
```

### Frontend (.env.local)
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_public_key
```

---

## 📧 Emails a Enviar

### 1. Confirmación al Usuario
```
Asunto: Hemos recibido tu mensaje
De: noreply@siladocs.com
Para: email_usuario

Contenido:
- Agradecimiento
- Resumen de lo enviado
- Número de ticket
- Tiempo estimado de respuesta
```

### 2. Notificación al Admin
```
Asunto: Nuevo contacto: [Subject]
De: noreply@siladocs.com
Para: admin@siladocs.com

Contenido:
- Detalles del mensaje
- Link al dashboard
- IP del usuario
```

### 3. Respuesta Automática (Opcional)
```
Asunto: RE: [Subject]
De: noreply@siladocs.com
Para: email_usuario

Contenido:
- Confirmación de envío
- Estimado de tiempo
- Link a FAQ
```

---

## 🔒 Seguridad

### Frontend
- [x] Validación de formulario
- [ ] reCAPTCHA v3 (agregar)
- [ ] Rate limiting (lado cliente)
- [ ] Sanitización de inputs

### Backend
- [ ] Validar reCAPTCHA
- [ ] Rate limiting (por IP)
- [ ] Sanitizar HTML
- [ ] SQL injection prevention
- [ ] CORS configuration
- [ ] Request timeout
- [ ] Input size limits

### Email
- [ ] No exponer admin email en cliente
- [ ] Contraseña en variables de ambiente
- [ ] TLS enabled
- [ ] No guardar contraseña en logs

---

## 🧪 Testing

### Frontend
```
1. Submit con todos los campos
2. Submit con campos faltantes
3. Submit con email inválido
4. reCAPTCHA validación
5. Toast notifications
6. Error handling
```

### Backend
```
1. POST /api/contact/send (válido)
2. POST /api/contact/send (inválido)
3. GET /api/contact/messages (sin auth - 403)
4. GET /api/contact/messages (con auth)
5. Email se envía correctamente
6. BD se actualiza correctamente
```

---

## 📅 Cronograma Estimado

| Paso | Tarea | Tiempo |
|------|-------|--------|
| 1 | Configurar Gmail SMTP | 15 min |
| 2 | Configurar reCAPTCHA | 15 min |
| 3 | Implementar backend | 2-3 hrs |
| 4 | Schema PostgreSQL | 30 min |
| 5 | reCAPTCHA frontend | 1 hr |
| 6 | Admin Dashboard | 2-3 hrs |
| 7 | Testing | 1-2 hrs |
| 8 | Deploy | 30 min |
| **Total** | | **8-11 hrs** |

---

## ✅ Checklist Final

- [ ] Gmail SMTP configurado
- [ ] reCAPTCHA keys creadas
- [ ] Backend implementado
- [ ] PostgreSQL schema creado
- [ ] Emails funcionando
- [ ] Frontend actualizado
- [ ] Admin Dashboard creado
- [ ] Pruebas completadas
- [ ] Deployer a producción
- [ ] Monitoreo activado

---

**Próximo paso:** Proporciona las respuestas de las 4 preguntas y te guiaré por cada paso.
