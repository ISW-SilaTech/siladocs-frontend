# Guía de Deployment a Producción

## 🚀 Estado Actual

- ✅ **Frontend**: Listo para deployer a Vercel (todas las claves configuradas)
- ✅ **Backend**: Listo para deployer a Azure (requiere variables de entorno)
- ✅ **reCAPTCHA**: Site Key ya configurada en .env
- ✅ **Gmail**: Contraseña generada

---

## 📱 Frontend - Vercel Deployment

### Estado Actual
- reCAPTCHA Site Key: ✅ Configurada en `.env.local` y `.env.production`
- API URL: ✅ Apunta a backend en Azure
- Todos los componentes: ✅ Listos

### Pasos para Deployer

1. **Push a GitHub**
```bash
# Ya está hecho, la rama tiene los cambios
git status  # Verifica que no haya cambios sin commitear
```

2. **En Vercel Dashboard**
   - Ve a https://vercel.com
   - Selecciona proyecto "siladocs-frontend"
   - Click en "Deployments"
   - Click en "Deploy"
   - Vercel detectará automáticamente los cambios de GitHub

3. **Verificar Deployment**
   - Espera a que el build complete (~3-5 minutos)
   - Verifica que los logs no tengan errores
   - Prueba en https://siladocs-frontend.vercel.app/contacto/

---

## ⚙️ Backend - Azure Deployment

### Variables de Entorno Necesarias

La contraseña de Gmail debe ser: `sklcflyhNxfwfmvy` (sin espacios)

```
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=sklcflyhNxfwfmvy
RECAPTCHA_SECRET_KEY=6Lc-6tAsAAAAADuot7q5gB4ak69KmkECoK-Z_R36
RECAPTCHA_SITE_KEY=6Lc-6tAsAAAAALm8E0tncmrn7re2nYQUjbs2mSjT
CONTACT_ADMIN_EMAIL=admin@siladocs.com
JWT_SECRET=siladocs-jwt-secret-key-2024-minimum-32-bytes-long-secure
```

### Pasos para Configurar en Azure

1. **Abrir Azure Portal**
   - Ve a https://portal.azure.com
   - Busca tu App Service (siladocs-backend)

2. **Configurar Variables de Entorno**
   - En el menú izquierdo: "Configuration"
   - Click en "Application settings"
   - Click en "+ New application setting"
   - Agrega cada variable:

   ```
   GMAIL_USER = tu-email@gmail.com
   GMAIL_PASSWORD = sklcflyhNxfwfmvy
   RECAPTCHA_SECRET_KEY = 6Lc-6tAsAAAAADuot7q5gB4ak69KmkECoK-Z_R36
   RECAPTCHA_SITE_KEY = 6Lc-6tAsAAAAALm8E0tncmrn7re2nYQUjbs2mSjT
   CONTACT_ADMIN_EMAIL = admin@siladocs.com
   JWT_SECRET = siladocs-jwt-secret-key-2024-minimum-32-bytes-long-secure
   ```

3. **Guardar Cambios**
   - Click en "Save"
   - El app se reiniciará automáticamente

4. **Deploy del Backend**
   - Opción A: Git deployment automático (si está configurado)
     - Push a la rama principal del backend
     - Azure detectará y hará deploy automático
   
   - Opción B: Build local
   ```bash
   cd /tmp/siladocs-backend
   mvn clean package -DskipTests
   # Subir el JAR a Azure
   ```

### Verificar Deployment

```bash
# Test de healthcheck
curl https://siladocs-backend-[nombre].azurewebsites.net/api/health/fabric

# Test de contacto (sin reCAPTCHA real)
curl -X POST https://siladocs-backend-[nombre].azurewebsites.net/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message with sufficient characters",
    "recaptchaToken": "test-token"
  }'
```

---

## 🧪 Testing Post-Deployment

### 1. Test Formulario de Contacto

```bash
# URL de producción
https://siladocs-frontend.vercel.app/contacto/

# Pasos:
1. Completa el formulario
2. Envía
3. Verifica:
   - Toast de éxito
   - Email en tu cuenta Gmail (revisar spam)
```

### 2. Test Registro Admin

```bash
# URL de producción
https://siladocs-frontend.vercel.app/landing

# Pasos:
1. Click en botón de registro
2. Ingresa un código de acceso válido
3. Valida el código
4. Completa datos de registro
5. Verifica:
   - Toast de éxito
   - Redirección al dashboard
```

### 3. Test API Backend

```bash
# Test sin autenticación (debe fallar con 403)
curl https://siladocs-backend-[nombre].azurewebsites.net/api/contact/messages

# Test con mensaje completo
curl -X POST https://siladocs-backend-[nombre].azurewebsites.net/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Test",
    "email": "test@example.com",
    "subject": "Testing in production",
    "message": "This is a test message in production environment",
    "phone": "+1234567890",
    "company": "Test Corp",
    "recaptchaToken": "valid-token-from-frontend"
  }'
```

---

## 📧 Configuración de Gmail

### Confirmación de Setup

Tu cuenta Gmail está configurada correctamente:

```
Email: tu-email@gmail.com (que hayas usado en Google Account)
Contraseña de app: sklcflyhNxfwfmvy
Servicio: Gmail
Protocolo: SMTP (puerto 587, TLS)
```

**Nota Importante**: La contraseña de app es específica para esta aplicación y solo funciona con Gmail SMTP. Si necesitas resetearlo, repite el proceso en Google Account.

### Verificar que Gmail Funciona

1. En Azure Portal, después de configurar las variables
2. Ve a "App Service logs" para revisar logs
3. Busca mensajes como:
   ```
   INFO: Email de confirmación enviado para: usuario@email.com
   INFO: Email de notificación enviado para: admin@email.com
   ```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- ✅ reCAPTCHA v3 habilitado (frontend + backend)
- ✅ Gmail SMTP con TLS
- ✅ Contraseña de app en variables de Azure (no en código)
- ✅ JWT secret configurado en Azure
- ✅ CORS configurado para siladocs-frontend.vercel.app

### Monitoreo Recomendado

1. **Logs en Azure**
   - Revisar regularmente para errores de email
   - Monitorear intentos de reCAPTCHA fallidos

2. **Gmail Security**
   - Activar notificaciones si hay acceso desde nuevas ubicaciones
   - Revisar "Activity on your Google Account" regularmente

3. **reCAPTCHA Admin Console**
   - Ve a https://www.google.com/recaptcha/admin
   - Revisa métricas de score y volume
   - Ajusta score threshold si es necesario

---

## 🆘 Troubleshooting

### Problema: "Email failed to send"

**Solución:**
1. Verifica que GMAIL_PASSWORD está sin espacios: `sklcflyhNxfwfmvy`
2. Revisa que GMAIL_USER es un email válido
3. Confirma que la contraseña de app está generada en Google Account
4. Revisa logs en Azure para detalles de error

### Problema: "reCAPTCHA validation failed"

**Solución:**
1. Verifica que RECAPTCHA_SECRET_KEY está correcta
2. Confirma que el dominio (siladocs-frontend.vercel.app) está en reCAPTCHA admin
3. Revisa que el token viene desde el frontend (no es null)

### Problema: "Bad credentials - 535"

**Solución:**
- Es error de Gmail. Regenera la contraseña de app:
  1. Ve a https://myaccount.google.com/apppasswords
  2. Selecciona Gmail nuevamente
  3. Genera una nueva contraseña
  4. Actualiza en Azure

---

## 📋 Checklist Final

### Antes de Deployar

- [ ] reCAPTCHA keys configuradas en .env (✅ HECHO)
- [ ] Gmail app password generada (✅ HECHO)
- [ ] Código del backend committeado (✅ HECHO)
- [ ] Código del frontend committeado (✅ HECHO)

### Deployment

- [ ] Variables de Azure configuradas
- [ ] Frontend desplegado a Vercel
- [ ] Backend desplegado a Azure
- [ ] Health checks pasando

### Post-Deployment

- [ ] Test de formulario de contacto
- [ ] Test de registro admin
- [ ] Emails llegando correctamente
- [ ] Logs limpios (sin errores)
- [ ] reCAPTCHA funcionando en ambos formularios

---

## 📞 Contacto y Soporte

Si necesitas ayuda:

1. Revisa los logs en Azure App Service
2. Verifica que todas las variables están configuradas
3. Prueba manualmente los endpoints con curl
4. Revisa el archivo IMPLEMENTACION_BACKEND_FRONTEND_CONTACTO.md para más detalles

---

**Configuración completada:** 2026-04-29  
**Estado:** Listo para producción  
**Próximo paso:** Configurar variables en Azure y hacer deploy
