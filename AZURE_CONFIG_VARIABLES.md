# Configuración de Variables en Azure Portal

## 🔑 Variables a Configurar

Copia exactamente estos pares clave-valor en Azure Portal:

### 1. GMAIL_USER
**Clave:** `GMAIL_USER`  
**Valor:** `tu-email@gmail.com`  
(Reemplaza con el email que usaste para generar la contraseña)

---

### 2. GMAIL_PASSWORD
**Clave:** `GMAIL_PASSWORD`  
**Valor:** `sklcflyhNxfwfmvy`  
⚠️ **Importante**: Sin espacios. Es exactamente: s-k-l-c-f-l-y-h-N-x-f-w-f-m-v-y

---

### 3. RECAPTCHA_SECRET_KEY
**Clave:** `RECAPTCHA_SECRET_KEY`  
**Valor:** `6Lc-6tAsAAAAADuot7q5gB4ak69KmkECoK-Z_R36`

---

### 4. RECAPTCHA_SITE_KEY
**Clave:** `RECAPTCHA_SITE_KEY`  
**Valor:** `6Lc-6tAsAAAAALm8E0tncmrn7re2nYQUjbs2mSjT`

---

### 5. CONTACT_ADMIN_EMAIL
**Clave:** `CONTACT_ADMIN_EMAIL`  
**Valor:** `admin@siladocs.com`  
(O el email que quieras recibir notificaciones de contacto)

---

### 6. JWT_SECRET (si no está ya configurada)
**Clave:** `JWT_SECRET`  
**Valor:** `siladocs-jwt-secret-key-2024-minimum-32-bytes-long-secure`

---

## 📋 Pasos en Azure Portal

1. **Abrir Azure Portal**
   - URL: https://portal.azure.com

2. **Encontrar App Service**
   - Busca "siladocs-backend" en la barra de búsqueda
   - Haz click en el resultado

3. **Ir a Configuration**
   - En el menú izquierdo, busca "Settings"
   - Click en "Configuration"

4. **Agregar Application Settings**
   - Click en "+ New application setting"
   - Para cada variable:
     - Copia el **Clave** exacto
     - Copia el **Valor** exacto
     - Click en OK
     - Repite para todas las variables

5. **Guardar Cambios**
   - Click en botón "Save" arriba
   - Aparecerá un modal confirmando
   - Click en "Continue" para confirmar
   - El App Service se reiniciará automáticamente

---

## ✅ Verificación

Después de guardar, deberías ver:

1. **En Configuration > Application settings:**
   ```
   GMAIL_USER = tu-email@gmail.com
   GMAIL_PASSWORD = sklcflyhNxfwfmvy
   RECAPTCHA_SECRET_KEY = 6Lc-6tAsAAAAADuot7q5gB4ak69KmkECoK-Z_R36
   RECAPTCHA_SITE_KEY = 6Lc-6tAsAAAAALm8E0tncmrn7re2nYQUjbs2mSjT
   CONTACT_ADMIN_EMAIL = admin@siladocs.com
   JWT_SECRET = siladocs-jwt-secret-key-2024-...
   ```

2. **App Service está reiniciado:**
   - Espera 1-2 minutos
   - El status debe mostrar "Running"

3. **Health check funciona:**
   ```bash
   curl https://siladocs-backend-[nombre].azurewebsites.net/api/health/fabric
   # Debe retornar status 200
   ```

---

## 🚀 Próximo Paso: Deploy

Una vez que las variables estén configuradas, necesitas hacer deploy del código del backend:

```bash
# Si tienes Git deployment configurado:
# Solo push a la rama principal y Azure hará el deploy automático

# Si necesitas hacer deploy manual:
cd /tmp/siladocs-backend
mvn clean package -DskipTests
# Luego usa Azure CLI o ZIP deployment
```

---

## ⚠️ Notas Importantes

- **Contraseña de Gmail**: `sklcflyhNxfwfmvy` es específica para esta app. Si la pierdes, genera una nueva en Google Account
- **reCAPTCHA keys**: Son públicas (site key) y privadas (secret key). La secret key debe guardarse segura en Azure
- **CONTACT_ADMIN_EMAIL**: Será el email que recibe notificaciones cuando alguien completa el formulario de contacto
- **Las variables son case-sensitive**: GMAIL_USER ≠ gmail_user

---

**Última actualización:** 2026-04-29
