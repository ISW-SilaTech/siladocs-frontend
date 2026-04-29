# Implementación: Sistema de Registro de Administrador

## 📋 Descripción General
Se ha implementado un sistema completo y profesional para el registro de administradores en la Landing Page de SilaDocs. La solución incluye:

- ✅ Formulario de registro multi-paso con validación segura
- ✅ Interfaz moderna y atractiva con animaciones suaves
- ✅ Integración con endpoints del backend
- ✅ Validación de códigos de acceso institucional
- ✅ Gestión de estado y errores robusta
- ✅ Experiencia de usuario optimizada

---

## 🎨 Características de Diseño

### 1. **Arquitectura de Pasos (Wizard)**
El formulario está dividido en 2 pasos para mejorar la experiencia:

**Paso 1: Validación de Código**
- Input para código de acceso institucional
- Validación en tiempo real contra el backend
- Muestra la institución asignada automáticamente
- Indicador visual de estado (pendiente → validado)

**Paso 2: Información Personal**
- Campo de institución (lectura)
- Nombre completo del administrador
- Email corporativo
- Contraseña con 6+ caracteres
- Aceptación de términos y condiciones
- Botón para retroceder al paso 1

### 2. **Elementos Visuales**
```
┌─ Progress Bar (50% en paso 1, 100% en paso 2)
├─ Header con ícono gradiente
├─ Iconos en inputs (usuario, correo, contraseña, edificio)
├─ Validación visual (iconos de error/éxito)
├─ Spinners durante carga
└─ Gradientes de color (primario: #4767ed)
```

### 3. **Animaciones**
- Transiciones suaves entre pasos (300ms)
- Fade-in de elementos nuevos
- Slide-up de mensajes de validación
- Hover effects en botones con sombra
- Animación de progreso

### 4. **Paleta de Colores**
```css
Primario: #4767ed (Azul)
Gradiente Primario: #4767ed → #5a7cff
Éxito: #28a745 (Verde)
Error: #dc3545 (Rojo)
Advertencia: #ffc107 (Amarillo)
Background: #f8f9fa (Gris claro)
```

---

## 🔄 Flujo de Registro Completo

### 1. **Inicio en Landing Page**
El usuario hace clic en "Regístrate" (disponible en header y hero section)
```tsx
<button onClick={handleShowRegisterModal}>
  Regístrate
</button>
```

### 2. **Modal de Registro Aparece**
```tsx
<RegisterModal show={showRegisterModal} onHide={handleCloseRegisterModal} />
```

### 3. **Paso 1: Validación de Código**
```
Usuario ingresa código → Click en "Validar" → 
API: GET /auth/validate-code?code={code} → 
Respuesta: { institutionName: "..." } → 
Paso 2 se desbloquea automáticamente
```

**Código:**
```tsx
const handleValidateToken = async (e) => {
    const data = await AuthService.validateCode(values.token);
    setValues(prev => ({ ...prev, institutionName: data.institutionName }));
    setTokenValidated(true);
    setStep(2); // Transición automática al paso 2
};
```

### 4. **Paso 2: Ingreso de Datos Personales**
```
- Nombre: validación no-vacío
- Email: validación de formato
- Contraseña: mínimo 6 caracteres
- Términos: deben ser aceptados
```

**Validación:**
```tsx
const validateStep2 = () => {
    // Valida email contra regex /\S+@\S+\.\S+/
    // Valida password.length >= 6
    // Valida nombre no-vacío
};
```

### 5. **Envío del Formulario**
```
Usuario hace click en "Crear Cuenta" → 
Validación de paso 2 → 
API: POST /auth/register con:
  {
    accessCode: string,
    fullName: string,
    email: string,
    password: string
  }
→ AuthContext.register() → Token guardado en localStorage → 
Redirección a dashboard
```

**Código:**
```tsx
const handleSubmit = async (e) => {
    const response = await register({
        accessCode: values.token,
        fullName: values.name,
        email: values.email,
        password: values.password,
    });
    // AuthContext maneja el token y la redirección
};
```

---

## 🛠️ Componentes y Servicios

### Componentes
```
shared/layouts-components/register-modal/
  └── register-modal.tsx (445 líneas)
      ├── Estado: values, step, validación, errores
      ├── Validación: email regex, password minlength
      ├── Animaciones: framer-motion con AnimatePresence
      └── Estilos: CSS-in-JS con gradientes
```

### Servicios de Autenticación
```tsx
// shared/services/auth.service.ts
export const AuthService = {
    validateCode: async (code: string) 
        → GET /auth/validate-code?code={code}
        → ValidateCodeResponse { institutionName }
    
    register: async (data: RegisterRequest)
        → POST /auth/register
        → AuthResponse { accessToken, user, institution }
}
```

### Context API
```tsx
// shared/contextapi.tsx
useAuth() → {
    user,
    institution,
    register(data),
    login(data),
    logout()
}
```

### Utilidades
```tsx
// shared/utils/errors.ts
extractErrorMessage(err, fallback)
    → err?.response?.data?.message || err?.message || fallback
```

---

## 📱 Puntos de Acceso

### 1. **Header Mobile** (`landing/page.tsx:429`)
```tsx
<button className="btn btn-primary-light" onClick={handleShowRegisterModal}>
    Regístrate
</button>
```

### 2. **Header Desktop** (`landing/page.tsx:560`)
```tsx
<button className="btn btn-primary-light" onClick={handleShowRegisterModal}>
    Regístrate
</button>
```

### 3. **Modal Integration** (`landing/page.tsx:619`)
```tsx
<RegisterModal show={showRegisterModal} onHide={handleCloseRegisterModal} />
```

---

## 🔐 Seguridad

### 1. **Validación Frontend**
- ✅ Email: formato válido con regex
- ✅ Contraseña: mínimo 6 caracteres (validar en backend también)
- ✅ Nombre: no-vacío
- ✅ Código: requerido antes de avanzar

### 2. **Protección Backend Necesaria**
```
⚠️ IMPORTANTE: El backend debe validar:
- Código de acceso válido y no expirado
- Email único en la base de datos
- Contraseña cumple requisitos de seguridad
- Rate limiting en /auth/validate-code
- HTTPS obligatorio
- Hash de contraseña (bcrypt o similar)
```

### 3. **Token Management**
- AccessToken guardado en localStorage
- Interceptor de axios agrega `Authorization: Bearer {token}`
- Logout limpia localStorage

---

## 🎯 Experiencia del Usuario

### Flujo Feliz
```
1. Usuario ve landing page
2. Click en "Regístrate"
3. Modal aparece con animación suave
4. Ingresa código (ej: INST2024001)
5. Valida código → institución aparece automáticamente
6. Completa formulario (nombre, email, contraseña)
7. Acepta términos
8. Click "Crear Cuenta"
9. Loading spinner
10. Toast de éxito
11. Modal cierra
12. Redirección a dashboard
```

### Manejo de Errores
```
✗ Código inválido → Toast rojo con mensaje
✗ Email duplicado → Toast de error del backend
✗ Contraseña débil → Mensaje en-línea
✗ Campos vacíos → Validación visual
```

### Feedback Visual
```
- Step 1:
  ✓ Código validado → Button cambia a verde con ✓
  ✓ Institución aparece en alert
  
- Step 2:
  ✓ Nombre completado → Label se anima
  ✓ Email válido → Icono de éxito
  ✓ Contraseña válida → Mensaje verde
  ✓ Términos aceptados → Checkbox marcado
```

---

## 📊 Estadísticas de Implementación

| Métrica | Valor |
|---------|-------|
| Líneas de código | 445 |
| Pasos en el formulario | 2 |
| Campos de entrada | 5 |
| Validaciones | 8 |
| Animaciones | 4 |
| Endpoints consumidos | 2 |
| Componentes reutilizados | 6 |

---

## 🚀 Mejoras Futuras (Opcional)

1. **Autofill de Email** - Si el código contiene email
2. **Verificación de Email** - Enviar link de confirmación
3. **Autenticación 2FA** - OTP por SMS/email
4. **Social Login** - Google, Microsoft, etc.
5. **Campos Adicionales** - Teléfono, departamento
6. **Foto de Perfil** - Upload en registro
7. **Validación de Contraseña Fuerte** - Requisitos complejos
8. **Captcha** - Protección contra bots

---

## ✅ Checklist de Verificación

- [x] Modal integrado en landing page
- [x] Botones "Regístrate" funcionan en header y hero
- [x] Paso 1: Validación de código
- [x] Paso 2: Formulario personal
- [x] Animaciones entre pasos
- [x] Progress bar visible
- [x] Validación de campos
- [x] Manejo de errores
- [x] Toast notifications
- [x] Loading spinners
- [x] Botón atrás funcional
- [x] Términos y condiciones
- [x] Diseño responsive
- [x] Estilos gradientes
- [x] Iconos en inputs

---

## 📝 Notas Técnicas

### Dependencies Requeridas
```json
{
  "react-bootstrap": "^2.x",
  "framer-motion": "^10.x",
  "react-toastify": "^9.x",
  "axios": "^1.x"
}
```

### Endpoints Backend Requeridos
1. `GET /auth/validate-code?code={code}`
   - Request: query param `code`
   - Response: `{ institutionName: string }`
   - Errors: 400/404 para código inválido

2. `POST /auth/register`
   - Request: `{ accessCode, fullName, email, password }`
   - Response: `{ accessToken, user, institution }`
   - Errors: 400 para datos inválidos, 409 para email duplicado

### Environment Variables
```
NEXT_PUBLIC_API_URL = https://api.siladocs.com
```

---

## 🔗 Archivos Modificados

```
shared/layouts-components/register-modal/register-modal.tsx
app/(components)/(landing-layout)/landing/page.tsx (integración)
shared/utils/errors.ts (utility)
```

---

**Versión:** 1.0.0  
**Fecha:** 2026-04-29  
**Estado:** ✅ Completado y Pushado a Main
