# Guía de Uso: Sistema de Registro de Administrador

## 🎯 Para Usuarios (Administradores)

### Escenario 1: Registro Exitoso
**Precondiciones:** Usuario tiene un código de acceso válido

1. Ir a la landing page
2. Hacer click en botón "Regístrate" (header o hero section)
3. En el modal:
   - Paso 1:
     - Ingresar código de acceso (ej: `INST2024001`)
     - Click en botón "Validar"
     - Ver institución aparece automáticamente
   - Paso 2:
     - Ingresar nombre completo (ej: `Juan García`)
     - Ingresar email (ej: `juan@institucion.edu`)
     - Ingresar contraseña (mínimo 6 caracteres)
     - Marcar "Acepto términos y condiciones"
     - Click en "Crear Cuenta"
4. Ver toast de éxito
5. Ser redirigido al dashboard

### Escenario 2: Error - Código Inválido
**Precondiciones:** Usuario ingresa código incorrecto

1. Ingresar código inválido
2. Click "Validar"
3. Ver error rojo: "Código inválido, expirado o ya utilizado"
4. Intentar con código correcto

### Escenario 3: Error - Email Duplicado
**Precondiciones:** Email ya existe en el sistema

1. Completar paso 1 exitosamente
2. En paso 2, ingresar email que ya existe
3. Click "Crear Cuenta"
4. Ver error: "El correo ya está registrado"

### Escenario 4: Validación de Campos
**Precondiciones:** Usuario intenta avanzar sin datos válidos

- Campo vacío → Mostrar: "Campo requerido"
- Email inválido → Mostrar: "Formato inválido"
- Contraseña < 6 caracteres → Mostrar: "Debe incluir al menos 6 caracteres"
- Términos no aceptados → Botón deshabilitado

---

## 👨‍💻 Para Desarrolladores

### Integración en Componentes Externos

```tsx
import RegisterModal from '@/shared/layouts-components/register-modal/register-modal';
import { useState } from 'react';

export default function MyComponent() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(true)}>
        Abrir Registro
      </button>
      <RegisterModal show={show} onHide={() => setShow(false)} />
    </>
  );
}
```

### Validación Backend Requerida

```typescript
// Backend: /auth/validate-code
POST /auth/validate-code
Query: code=INST2024001
Response: {
  institutionName: "Universidad Nacional",
  institutionId: "uuid",
  isValid: true
}

// Backend: /auth/register
POST /auth/register
Body: {
  accessCode: "INST2024001",
  fullName: "Juan García",
  email: "juan@institucion.edu",
  password: "SecurePassword123"
}
Response: {
  accessToken: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    id: "uuid",
    email: "juan@institucion.edu",
    role: "admin"
  },
  institution: {
    id: "uuid",
    name: "Universidad Nacional"
  }
}
```

### Testing Manual Checklist

- [ ] Modal abre sin errores
- [ ] Botón "Validar" funciona
- [ ] Código válido → muestra institución
- [ ] Código inválido → muestra error
- [ ] Paso 1 → Paso 2 → transición suave
- [ ] Botón atrás regresa a paso 1
- [ ] Validación de email
- [ ] Validación de contraseña
- [ ] Botón crear cuenta deshabilitado sin términos
- [ ] Submit muestra spinner
- [ ] Error API muestra toast rojo
- [ ] Success muestra toast verde
- [ ] Modal cierra automáticamente

---

## 🎨 Personalización

### Cambiar Colores

```tsx
// En registerModal.tsx - Línea ~30
const GRADIENT_PRIMARY = "#4767ed";
const GRADIENT_SECONDARY = "#5a7cff";

// Luego actualizar en estilos CSS
background: linear-gradient(135deg, GRADIENT_PRIMARY 0%, GRADIENT_SECONDARY 100%);
```

### Cambiar Textos

```tsx
// Paso 1
"Valida tu código de acceso institucional"

// Paso 2
"Completa tu información personal"

// Botones
"Validar" → "Verificar"
"Crear Cuenta" → "Registrarse"
```

### Agregar Campos

```tsx
// 1. Agregar a EMPTY_FORM
const EMPTY_FORM = { 
  token: "",
  name: "",
  email: "",
  password: "",
  institutionName: "",
  phone: "", // NUEVO
};

// 2. Agregar a validación
if (!values.phone) newErrors.phone = "Teléfono requerido";

// 3. Agregar al JSX del paso 2
<Col xl={6}>
  <Form.Label className="fw-medium">Teléfono</Form.Label>
  <Form.Control
    type="tel"
    value={values.phone}
    onChange={(e) => setValues(prev => ({ ...prev, phone: e.target.value }))}
  />
</Col>

// 4. Incluir en submit
await register({
  ...otrosFields,
  phone: values.phone,
});
```

---

## 🐛 Troubleshooting

### El modal no abre
**Solución:** Verificar que `show={showRegisterModal}` está correctamente pasado

### Validación de código falla
**Verificar:**
- URL correcta: `GET /auth/validate-code?code={value}`
- Token de auth presente en headers
- Código de acceso válido en base de datos
- CORS configurado correctamente

### Submit falla
**Verificar:**
- POST `/auth/register` endpoint existe
- Body contiene: accessCode, fullName, email, password
- Respuesta contiene: accessToken, user, institution
- AuthContext.register() guarda el token

### Modal no cierra
**Solución:** Verificar que `onHide()` está siendo llamado correctamente

---

## 📱 Responsive Design

El modal se adapta automáticamente:
- **Mobile** (< 576px): Modal ocupa 95% del ancho, inputs full width
- **Tablet** (576px - 992px): Modal con padding, inputs en grid 2 columnas
- **Desktop** (> 992px): Modal centrada, layout completo

Todas las animaciones y estilos responden al tamaño de pantalla mediante Bootstrap grid system.

---

## 🔒 Consideraciones de Seguridad

### Frontend
- ✅ Validación de entrada
- ✅ Sanitización de errores
- ✅ No guardar contraseña en localStorage
- ✅ Token guardado en localStorage (considerar sessionStorage)

### Backend (DEBE IMPLEMENTAR)
- ⚠️ Validar código de acceso contra base de datos
- ⚠️ Verificar email único
- ⚠️ Hash de contraseña con bcrypt/argon2
- ⚠️ Rate limiting en endpoints de validación
- ⚠️ HTTPS obligatorio
- ⚠️ CORS restrictivo
- ⚠️ Sanitizar inputs
- ⚠️ Logs de auditoría

---

**Última actualización:** 2026-04-29
