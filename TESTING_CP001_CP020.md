# Instructivo de Pruebas — CP001 al CP020

## Preparación Previa

### 1. Iniciar el servidor de desarrollo
```bash
npm install  # si es la primera vez
npm run dev
# El servidor estará en http://localhost:3000
```

### 2. Datos de prueba
- **Email de prueba:** `admin@inst.edu.pe`
- **Contraseña:** `Test123!@#`
- **Código de acceso (CP003):** Generado dinámicamente en `/gestion/solicitudes`

---

## CP001 a CP005 — Flujo de Autenticación

### CP001: Registro de institución y usuario (flujo happy path)

**Pasos:**
1. Ir a http://localhost:3000/authentication/sign-up/cover
2. Generar un código de acceso:
   - Ir a `/gestion/solicitudes` (requiere ser admin)
   - Clic en "Nueva Institución"
   - Paso 1: Ingresa nombre="Test University" y dominio="test.edu.pe"
   - Clic "Siguiente →"
   - Paso 2: Clic "Generar Código de Acceso"
   - Copiar el código que aparece en el modal resultado
3. Volver a `/authentication/sign-up/cover`
4. Ingresa:
   - Email: `testuser@test.edu.pe`
   - Contraseña: `SecurePass123!@`
   - Código de acceso: el copiado en paso 2
5. Clic "Registrarme"

**Resultado esperado:**
- Toast verde: "¡Registro exitoso!"
- Redirección a `/dashboards/general` después de ~1200ms
- Usuario logueado en la sesión

**Bugs verificados:**
- ✅ Toast visible antes de redirección (CP004 — fix aplicado)
- ✅ Mensaje de error amigable si el código es inválido (CP003 — fix aplicado)

---

### CP002: Inicio de sesión exitoso

**Pasos:**
1. Ir a http://localhost:3000/authentication/sign-in/cover
2. Ingresa:
   - Email: `admin@inst.edu.pe`
   - Contraseña: `Test123!@#`
3. Clic "Iniciar Sesión"

**Resultado esperado:**
- Toast verde: "¡Has iniciado sesión exitosamente!"
- Redirección a `/dashboards/general`
- Sesión activa (token en localStorage)

---

### CP003: Validación de código de acceso (casos de error)

**Caso 3.1 — Código inválido:**
1. Ve a `/authentication/sign-up/cover`
2. Ingresa código: `INVALID123`
3. Clic "Registrarme"
4. Espera error

**Resultado esperado:**
- ✅ Toast rojo amigable: "El código de acceso no es válido. Verifica que esté escrito correctamente."

**Caso 3.2 — Código expirado:**
1. Usa un código que ya fue utilizado o cuya fecha `expiresAt` pasó
2. Toast rojo: "El código de acceso ha expirado. Solicita uno nuevo a tu institución."

**Caso 3.3 — Código usado:**
1. Usa un código marcado como `used: true` en la BD
2. Toast rojo: "Este código de acceso ya fue utilizado. Solicita uno nuevo a tu institución."

---

### CP004: Toast visible antes de redirección (login)

**Pasos:**
1. Ir a `/authentication/sign-in/cover`
2. Login con credenciales válidas
3. Observa el toast antes de que se redirija

**Resultado esperado:**
- ✅ Toast visible por ~1 segundo (1200ms delay implementado)
- Redirección suave a `/dashboards/general`
- Verificar console que no hay errores de "ToastContainer not found"

---

### CP005: Mensaje de error amigable (login fallido)

**Caso 5.1 — Credenciales incorrectas:**
1. Ir a `/authentication/sign-in/cover`
2. Ingresa email: `admin@inst.edu.pe` y contraseña: `WrongPassword`
3. Clic "Iniciar Sesión"

**Resultado esperado:**
- ✅ Toast rojo: "Correo o contraseña incorrectos."
- NO debe mostrar "Request Failed 401"

**Caso 5.2 — Cuenta sin acceso:**
1. Login con usuario que existe pero no tiene rol de acceso
2. Toast rojo: "Tu cuenta no tiene acceso al sistema. Contacta a tu institución."

**Caso 5.3 — Demasiados intentos (429):**
1. Falla login 5+ veces seguidas
2. Toast rojo: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."

**Caso 5.4 — Servidor no disponible (500+):**
1. Simula error del backend respondiendo 500
2. Toast rojo: "El servidor no está disponible en este momento. Inténtalo más tarde."

---

## CP006 a CP010 — Gestión Académica Básica (Carreras, Mallas, Cursos)

### CP006: CRUD de Carreras — Vista general

**Pasos:**
1. Login con credenciales válidas
2. Navega a `/gestion/carreras`
3. Observa la tabla

**Resultado esperado:**
- ✅ Lista de carreras cargada sin errores
- Botón "Nueva Carrera" visible
- Campo de búsqueda funcional
- Tabla muestra: Carrera, Facultad, Ciclos, Actualización, Estado, Acciones
- Fechas sin "Invalid Date" ✅ (H#1 fix)

---

### CP007: Crear carrera

**Pasos:**
1. En `/gestion/carreras`, clic "Nueva Carrera"
2. Modal se abre
3. Observa que NO hay curso preseleccionado ✅ (H#1 fix)
4. Ingresa:
   - Nombre: "Ingeniería Civil"
   - Facultad: "Ingeniería"
   - Ciclos: "10"
   - Estado: "Activo"
5. Clic "Guardar"

**Resultado esperado:**
- Toast verde: "Carrera creada correctamente"
- Tabla se actualiza y muestra la nueva carrera
- Modal cierra automáticamente

---

### CP008: Editar carrera

**Pasos:**
1. En la tabla de carreras, clic en el icono de 3 puntos
2. Clic "Editar"
3. Cambia Nombre a "Ingeniería Comercial"
4. Clic "Guardar"

**Resultado esperado:**
- Toast verde: "Carrera actualizada correctamente"
- Tabla refleja cambios inmediatamente

---

### CP009: Buscar carrera

**Pasos:**
1. En `/gestion/carreras`, campo de búsqueda
2. Tipo "Civil"

**Resultado esperado:**
- ✅ Filtra carreras por nombre o facultad en tiempo real
- Si no hay resultados: "Sin coincidencias para 'Civil'." ✅ (H#2 fix)
- Si hay resultados: muestra solo esos

---

### CP010: Eliminar carrera

**Pasos:**
1. En tabla de carreras, clic 3 puntos → "Eliminar"
2. Confirma con el dialog nativo
3. Espera respuesta

**Resultado esperado:**
- ✅ Botón deshabilitado mientras se procesa ✅ (H#3 fix — deletingId)
- Toast verde: "Carrera eliminada correctamente"
- Tabla actualiza sin la carrera
- Sin peticiones duplicadas por doble clic

---

## CP011 a CP015 — Gestión Académica Avanzada (Mallas y Cursos)

### CP011: CRUD de Mallas — Vista general

**Pasos:**
1. Navega a `/gestion/mallas`
2. Observa la tabla

**Resultado esperado:**
- ✅ Mallas cargadas sin error
- Botón "Nueva Malla" visible
- Búsqueda funcional (filtra por nombre o carrera) ✅ (H#2 fix)
- Sin preselección silenciosa del primer curso ✅ (H#3 fix)

---

### CP012: Crear malla

**Pasos:**
1. Clic "Nueva Malla"
2. Modal abre
3. **Importante:** Verifica que NO hay carrera preseleccionada ✅ (H#3 fix)
4. Selecciona una carrera explícitamente: "Ingeniería Civil"
5. Ingresa:
   - Nombre: "Plan 2024"
   - Año: "2024"
   - Nº Cursos: "50"
   - Créditos: "200"
   - Estado: "Activo"
   - Descripción: "Plan actualizado 2024"
6. Clic "Guardar"

**Resultado esperado:**
- Toast verde: "Malla creada correctamente"
- Tabla actualiza con nueva malla
- Modal cierra

---

### CP013: CRUD de Cursos — Vista general

**Pasos:**
1. Navega a `/gestion/cursos`
2. Observa tabla

**Resultado esperado:**
- ✅ Cursos cargados sin error
- Estados en español: "Activo" o "Cerrado" (NOT "Active"/"Closed") ✅ (H#5 fix)
- Búsqueda funcional por código o nombre
- Tabla muestra: Curso, Carrera, Facultad, Nº Sílabos, Año, Estado, Malla, Publicación, Acción

---

### CP014: Crear curso

**Pasos:**
1. Clic "Crear Curso"
2. Modal abre
3. Selecciona:
   - Carrera: "Ingeniería Civil"
   - Malla: "Plan 2024" (debe filtrar según carrera)
   - Código: "IC101"
   - Nombre: "Cálculo I"
   - Facultad: "Ingeniería"
   - Año: "2024"
   - Estado: "Activo"
4. Clic "Guardar"

**Resultado esperado:**
- Toast verde: "Curso creado correctamente"
- Tabla actualiza
- Código se muestra en español "Activo", no "Active" ✅ (H#5 fix)

---

### CP015: Filtrado dinámico (carrera → malla)

**Pasos:**
1. En modal de crear curso
2. Selecciona Carrera: "Ingeniería Civil"
3. Observa dropdown de Malla

**Resultado esperado:**
- ✅ Mallas filtradas solo a las de "Ingeniería Civil"
- No hay race condition — mallas válidas se muestran ✅ (H#11 fix)
- Si cambias carrera, curriculumId se resetea (pero no antes de que allCurriculums cargue) ✅

---

## CP016 a CP020 — Sílabos y Administración

### CP016: Gestión de Sílabos — Vista general

**Pasos:**
1. Navega a `/gestion/silabos`
2. Observa tabla

**Resultado esperado:**
- ✅ Tabla cargada (vacía si no hay sílabos)
- Botón "Subir Sílabo" visible
- Botones "Google Drive" e "OneDrive" visibles
- Tabla muestra: Archivo, Curso, Hash, Tx Blockchain, Fecha, Estado, Acciones

---

### CP017: Subir sílabo a blockchain

**Pasos:**
1. Clic "Subir Sílabo"
2. Modal abre
3. **Importante:** Verifica que NO hay curso preseleccionado ✅ (H#1 fix)
4. Selecciona curso: "IC101"
5. Arrastra un PDF (o clic para seleccionar)
6. Espera preview de PDF en la derecha
7. Clic "Subir y Registrar en Blockchain"
8. Observa log en vivo en la derecha (SSE)

**Resultado esperado:**
- ✅ Barra de progreso avanza de 0 a 100% (nunca retrocede) ✅ (H#6 fix)
- Log muestra eventos: FILE_RECEIVED → HASH_COMPUTING → HASH_COMPUTED → STORAGE_UPLOADING → FABRIC_SUBMITTING → COMPLETED
- Toast verde al final: "¡Sílabo subido y confirmado en blockchain!"
- Modal muestra pantalla de éxito con Hash SHA-256 y TX ID Fabric
- Tabla de sílabos se actualiza con el nuevo registro

**Edge case — Conexión SSE perdida:**
- Simula desconexión de red durante upload
- ✅ Debe mostrar: "Se perdió la conexión en tiempo real..." ✅ (H#7 fix)
- Usuario puede cerrar modal y verificar si el archivo se registró

---

### CP018: Importar desde Google Drive

**Pasos:**
1. En tabla de sílabos, clic botón "Google Drive"
2. Modal de importación abre
3. Ingresa un token de acceso válido de Google OAuth
4. Clic "Cargar"
5. Lista de archivos aparece
6. Selecciona un PDF
7. **Importante:** Verifica que hay selector de curso con placeholder ✅ (H#10 fix)
8. Selecciona curso: "IC101"
9. Clic "Importar a Azure Blob Storage"

**Resultado esperado:**
- ✅ Archivo se importa correctamente (courseId se envía al backend) ✅ (H#9 fix)
- Toast verde: "'{filename}' importado correctamente."
- Modal cierra
- Tabla de sílabos se actualiza (si el backend lo registra automáticamente)

**Nota:** Si no tienes un token válido, la búsqueda fallará — esto es esperado.

---

### CP019: Administración — Crear institución y código

**Pasos:**
1. Navega a `/gestion/solicitudes` (requiere ser admin)
2. Clic "Nueva Institución"
3. Paso 1:
   - Nombre: "Universidad de Prueba"
   - Dominio: "uprueba.edu.pe"
   - Estado: "Activo"
   - Clic "Siguiente →"
4. Paso 2:
   - Verifica que aparece: "Universidad de Prueba fue creada exitosamente."
   - Clic "Generar Código de Acceso"
5. Modal resultado:
   - Copiar el código que aparece
6. Clic "Listo"

**Resultado esperado:**
- ✅ Toasts visibles en cada paso (ahora incluye ToastContainer) ✅ (H#12 fix)
- Institución aparece en tabla "Instituciones Registradas"
- Código aparece en tabla "Códigos de Acceso" con estado "Disponible"
- ✅ Si cierras en paso 2 sin generar código, pide confirmación ✅ (H#13 fix)
- ✅ Si el código tiene `expiresAt`, aparece en rojo "Expirado" si está vencido ✅ (H#14 fix)

---

### CP020: Carga Masiva — Fase 1 + Fase 2

**Fase 1 — Importar Excel:**

**Pasos:**
1. Navega a `/core/carga-masiva`
2. Clic "Descargar Plantilla" para obtener el template
3. Completa el Excel con datos:
   ```
   Carrera_Nombre | Carrera_Facultad | Carrera_Ciclos | Malla_Nombre | ... | Curso_Codigo | Curso_Nombre | ...
   Ingeniería de Sistemas | Ingeniería | 10 | Sistemas 2024 | ... | SIS101 | Intro to Computing | ...
   ```
4. Clic "Subir Archivo Excel"
5. Selecciona el Excel que completaste
6. Clic "Validar Archivo"
7. Observa los 3 pasos: Cargando → Validando Estructura → Validando Formato

**Resultado esperado:**
- ✅ Toasts visibles (react-toastify, no alert()) ✅ (H#16 fix)
- Vista previa muestra filas válidas en verde
- ✅ Si hay errores de validación, filas se marcan en rojo ✅ (H#19 fix)
- ✅ Alert muestra errores específicos por fila ✅ (H#19 fix)
- Botón "Importar al Sistema" habilitado si hay filas válidas
- Clic "Importar al Sistema"
- Backend responde con éxito

**Resultado esperado (backend):**
- ✅ Usa `api` interceptado, no axios raw ✅ (H#17 fix)
- ✅ Si token expira, redirige a login (gracias al interceptor) ✅ (H#17 fix)
- Toast: "N cursos importados correctamente"

**Fase 2 — Registrar Sílabos:**

**Pasos:**
1. Después de importación exitosa, clic "Continuar a Fase 2"
2. O navega a `/core/carga-masiva` nuevamente y clic fase 2
3. Arrastra múltiples PDFs al área de drop
4. PDFs se cargan y se auto-mapean por código de curso
5. Verifica que los cursos asignados son correctos
6. Clic "Registrar N sílabos en Blockchain"

**Resultado esperado:**
- ✅ Tabla muestra estado: Pendiente → Registrando → En blockchain
- Progreso se actualiza conforme se procesan
- Toast verde final: "N sílabo(s) registrado(s) en blockchain"
- TxID y Hash se muestran en la tabla
- ✅ Los errores se capturan sin usar alert() ✅ (H#16 fix)

---

## Checklist de Verificación Final

### Hallazgos Críticos Corregidos:
- ✅ H#1: Preselección silenciosa en sílabos → NO preselecciona
- ✅ H#2: Estado vacío en búsqueda → muestra "Sin coincidencias para..."
- ✅ H#3: Preselección en mallas → NO preselecciona
- ✅ H#5: Estados en inglés en cursos → español ("Activo"/"Cerrado")
- ✅ H#9: courseId faltante en import cloud → enviado al backend
- ✅ H#10: Placeholder en import cloud → "Seleccione un curso..."
- ✅ H#12: ToastContainer faltante en solicitudes → incluido
- ✅ H#16: alert() en carga masiva → react-toastify
- ✅ H#17: axios raw sin interceptor → api interceptado
- ✅ H#19: Errores de validación sin detalles → lista completa visible

### Mejoras Técnicas:
- ✅ H#3: deletingId → evita peticiones duplicadas
- ✅ H#6: Progreso nunca retrocede (Math.max)
- ✅ H#7: SSE onError handler → notifica al usuario
- ✅ H#13: Confirmación al cerrar modal en paso 2
- ✅ H#14: Códigos expirados marcados en rojo
- ✅ H#15: handleChange tipado correctamente (sin `as any`)
- ✅ H#18: Ya no usa localStorage directo (api interceptada)

---

## Notas Importantes

1. **Dashboard:** `/gestion/dashboard` sigue siendo un placeholder con datos mock en inglés. Es una deuda técnica — no impacta la funcionalidad de catalogo.

2. **Búsqueda:** Las tres páginas (carreras, mallas, cursos) ahora tienen búsqueda reactiva que filtra mientras escribes.

3. **Validaciones:** Los formularios solo permiten envío si todos los campos obligatorios están completos.

4. **Tokens:** Si el token expira durante cualquier operación, el interceptor de axios redirige automáticamente a login.

5. **Re-renders:** Los efectos `useEffect` con `cancelled` flag evitan setState en componentes desmontados.

---

¡Listo para probar! 🎉
