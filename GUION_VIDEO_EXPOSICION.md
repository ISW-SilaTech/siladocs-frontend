# GUION PARA VIDEO DE EXPOSICIÓN – PRUEBAS DE SOFTWARE SILADOCS

> **Duración estimada total:** 22 – 30 minutos
> **Plataforma:** https://siladocs-frontend.vercel.app/
> **Usuario demo:** rector@demo.siladocs.com / Demo@Rector123
> **Cobertura:** 40 casos de prueba sobre 33 historias de usuario (épicas: Autenticación, Gestión de Sílabos, Blockchain, Notificaciones, Dashboard)

---

## INDICACIONES GENERALES ANTES DE GRABAR

- **Resolución:** 1920×1080, navegador a pantalla completa.
- **Dos navegadores listos:** uno con sesión iniciada (Chrome normal) y otro en **modo incógnito** para pruebas de acceso público y control de acceso.
- **Archivos de prueba:** un PDF válido (`silabo_matematica.pdf`), un `.txt`/`.png` para validación de formato, y un PDF > 50 MB para validación de tamaño.
- **Ten un código de acceso válido** generado previamente para la demo de registro.
- **Terminal abierta** para mostrar `sha256sum` si decides reforzar la integridad.
- Habla pausado y señala con el cursor el elemento mencionado. Menciona el **ID de la HU** y del **CP** al inicio de cada caso para que el jurado lo ubique.

---

## GUION DE APERTURA (40 – 60 segundos)

> *"Buenos días/tardes. Somos [nombres] y presentamos el informe de evidencias de pruebas de software del proyecto **SilaDocs**, una plataforma de gestión de sílabos universitarios con trazabilidad blockchain sobre Hyperledger Fabric. Evaluamos **33 historias de usuario** de nuestro Product Backlog, agrupadas en cinco épicas —Autenticación, Gestión de Sílabos, Blockchain, Notificaciones y Dashboard— mediante **40 casos de prueba**. El núcleo del proyecto es el registro y verificación de sílabos en blockchain, que garantiza **inmutabilidad y trazabilidad de precisión**. A continuación demostraremos cada caso en vivo sobre la plataforma en producción."*

---

# ÉPICA 1 – AUTENTICACIÓN (CP001 – CP010)

### CP001 – Registro de administrador desde la landing `[HU-A01]`
**Qué decir:** *"Iniciamos con el registro de un administrador mediante código de acceso institucional."*
**Qué mostrar:**
1. Ir a `/authentication/sign-up/cover`.
2. Ingresar el código de acceso → clic en **"Validar"** → mostrar **"Válido ✓"** y la institución autocompletada.
3. Completar correo, nombre, contraseña; marcar **términos**.
4. Clic en **"Crear cuenta"** → señalar el toast **"Cuenta creada correctamente"**.

### CP002 – Validar código válido `[HU-A03]`
**Qué decir:** *"El token de registro es único y se valida contra el backend."*
**Qué mostrar:** Reingresar un código válido → **"Validar"** → señalar autocompletado de institución.

### CP003 – Rechazo de código inválido/usado/expirado `[HU-A04]`
**Qué decir:** *"Cada token tiene un estado: pendiente, usado o expirado."*
**Qué mostrar:** Ingresar un código falso → **"Validar"** → señalar el mensaje de error.

### CP004 – Login exitoso `[HU-A05]`
**Qué decir:** *"Autenticación con credenciales válidas."*
**Qué mostrar:** `/authentication/sign-in/cover` → rector@demo.siladocs.com / Demo@Rector123 → **"Ingresar"** → toast **"Inicio de sesión exitoso"** y redirección.

### CP005 – Login inválido `[HU-A05]`
**Qué mostrar:** Correo válido + contraseña incorrecta → **"Ingresar"** → señalar toast **"Credenciales inválidas"**.

### CP006 – Validación de campos `[HU-A05]`
**Qué mostrar:** Enviar vacío → "Correo requerido."; correo mal formado → "Formato inválido."; contraseña corta → "Debe incluir al menos 6 caracteres."

### CP007 – Recuperación de contraseña `[HU-A06]`
**Qué decir:** *"El administrador puede recuperar su contraseña."*
**Qué mostrar:** Clic en **"¿Olvidaste tu contraseña?"** → ingresar correo → ingresar código → definir nueva contraseña → iniciar sesión con ella.

### CP008 – Actualizar perfil `[HU-A07]`
**Qué mostrar:** `/pages/profile-settings` → cambiar "Nombre Completo" → **"Guardar Perfil"** → toast **"Perfil actualizado correctamente."**

### CP009 – Cambiar contraseña `[HU-A07]`
**Qué mostrar:** Sección "Cambio de Contraseña" → actual + nueva + confirmar → **"Cambiar Contraseña"** → toast de éxito. (Mostrar también el error "Las contraseñas no coinciden" si difieren.)

### CP010 – Cifrado y control de acceso `[HU-A09]`
**Qué decir:** *"Las credenciales viajan cifradas y las rutas privadas están protegidas."*
**Qué mostrar:** En **incógnito**, intentar `/gestion/silabos` y `/core/blockchain` → redirección a login. Iniciar sesión y mostrar en DevTools que el localStorage guarda un **token JWT** (no la contraseña).

---

# ÉPICA 2 – GESTIÓN DE SÍLABOS (CP011 – CP024)

### CP011 – Crear carrera `[HU-G01]`
**Qué mostrar:** `/gestion/carreras` → **"Nueva Carrera"** → Nombre, Facultad, Ciclos, Estado "Activo" → **"Guardar"** → señalar la fila y el toast.

### CP012 – Crear malla curricular `[HU-G01]`
**Qué mostrar:** `/gestion/mallas` → **"Nueva Malla"** → seleccionar Carrera, Nombre, Año, Nº Cursos, Créditos, Estado → **"Guardar"**.

### CP013 – Crear curso `[HU-G01]`
**Qué decir:** *"Al elegir la carrera, el selector de malla se filtra automáticamente."*
**Qué mostrar:** `/gestion/cursos` → **"Crear Curso"** → seleccionar Carrera (señalar filtrado de Malla) → Malla, Código "MAT101", Nombre "Matemática Básica", Facultad, Año → **"Guardar"**.

### CP014 – Estado de catálogos `[HU-G02]`
**Qué mostrar:** Señalar la columna **"Estado"** en carreras (Activo/En Revisión/...), en cursos (Active/Closed) y en mallas.

### CP015 – Editar/eliminar catálogo `[HU-G03]`
**Qué mostrar:** Editar una carrera → cambiar Estado a "Activo" (aprobación) → **"Guardar"**. Luego **"Eliminar"** un registro de prueba → confirmar.

### CP016 – Subir sílabo `[HU-G04]`
**Qué decir:** *"Llegamos al corazón funcional: la carga del sílabo asociada a un curso activo."*
**Qué mostrar:** `/gestion/silabos` → **"Subir Sílabo"** → seleccionar Curso → seleccionar PDF → confirmar. **Señalar** que inicia el proceso en blockchain.

### CP017 – Adjuntar PDF con previsualización `[HU-G05]`
**Qué mostrar:** En el modal, arrastrar un PDF → **señalar** la previsualización, el nombre y el tamaño.

### CP018 – Validación de formato/tamaño `[HU-G05]`
**Qué mostrar:** Subir `.png`/`.txt` → "Tipo de archivo no permitido. Solo PDF, DOC o DOCX." Subir > 50 MB → "El archivo supera el tamaño máximo de 50 MB." Sin curso → "Seleccione un curso."

### CP019 – Metadata del sílabo `[HU-G06]`
**Qué mostrar:** En la tabla, **señalar** columnas Archivo, Curso, Hash, Tx Blockchain, Fecha, Estado. Clic en **"Ver detalles"** → metadata completa.

### CP020 – Versionar sílabo `[HU-G07]`
**Qué decir:** *"Subimos una versión 2 manteniendo el historial."*
**Qué mostrar:** Seleccionar un sílabo → subir nueva versión → en el verificador, pestaña **"Historial"**, mostrar v1 y v2 con hashes distintos.

### CP021 – Hash único SHA-256 `[HU-G08]`
**Qué decir:** *"El sistema genera un hash SHA-256 único por documento, en tiempo real."*
**Qué mostrar:** Durante una carga, **señalar** los eventos `hash_computing` → `hash_computed` y el hash de 64 caracteres.

### CP022 – Aprobar/validar sílabo `[HU-G09]`
**Qué mostrar:** Clic en **"Aprobar sílabo (TC-02)"** → confirmar "El estado cambiará a 'Validado'." → señalar el badge **"Validado"**.

### CP023 – Eliminar sílabo `[HU-G10]`
**Qué mostrar:** Clic en **"Eliminar"** de un sílabo de prueba → confirmar → mostrar que desaparece del listado.

### CP024 – Buscar/filtrar sílabos `[HU-G13]`
**Qué mostrar:** `/verificador-silabos` → buscar por código "MAT101" → **"Buscar"** → resultado. Probar por hash y por ID. Buscar inexistente → alert "No se encontró...".

---

# ÉPICA 3 – BLOCKCHAIN (CP025 – CP033) ⭐ CORE

### CP025 – Registro de cambio en blockchain `[HU-B01/B03]`
**Qué decir:** *"El corazón tecnológico: el registro en Hyperledger Fabric."*
**Qué mostrar:** Durante una carga, **señalar** los eventos `fabric_connecting` → `fabric_submitting` → `fabric_confirmed` y el **Transaction ID** final.

### CP026 – Eventos automáticos en tiempo real `[HU-B04]`
**Qué decir:** *"Cada evento se registra automáticamente y se transmite por SSE."*
**Qué mostrar:** **Señalar** la barra de progreso y la secuencia completa: file_received → hash → storage → fabric → db → **completed**.

### CP027 – Historial completo de cambios `[HU-B02]`
**Qué mostrar:** `/core/blockchain` → buscar y seleccionar un curso → **señalar** el "Historial de Transacciones" con CREATION/UPDATE/VERIFICATION.

### CP028 – Historial de transacciones `[HU-B06]`
**Qué mostrar:** En el mismo panel, **señalar** las tarjetas Hash SHA-256, Bloque de Red (#) y Canal (silabos-channel), y los actores.

### CP029 – Validar que los hashes coinciden `[HU-B05]`
**Qué decir:** *"Verificamos que el hash en blockchain coincide con el documento actual."*
**Qué mostrar:** Clic en **"Verificar Integridad"** → señalar el SweetAlert **"✓ Documento Verificado"** con Bloque #X. (Opcional: mostrar el caso "⚠ Documento No Verificado".)

### CP030 – Inmutabilidad / verificación pública `[HU-B07]`
**Qué decir:** *"Los registros son inmutables y verificables públicamente, sin login."*
**Qué mostrar:** En **incógnito**, `/public/verify?id=X&version=Y` → **señalar** el badge **"Inmutable"** y, en la pestaña **"Detalles"**, el hash, bloque y canal.

### CP031 – Auditar mediante QR `[HU-B08]`
**Qué mostrar:** En `/verificador-silabos`, pestaña "Historial" → **"Ver QR"** → descargar/escanear → mostrar el celular abriendo la verificación pública.

### CP032 – Auditar mediante URL pública `[HU-B08]`
**Qué mostrar:** Clic en **"Copiar URL de Compartición"** → señalar toast **"URL Copiada"** → pegar en pestaña nueva sin sesión → carga el sílabo correcto.

### CP033 – Hash/transacción únicos por versión `[HU-B09]`
**Qué mostrar:** En "Historial", comparar hashes de v1 vs v2 y sus **fabricTxId** distintos.

---

# ÉPICA 4 – NOTIFICACIONES (CP034 – CP035)

### CP034 – Notificaciones de cambios y validaciones `[HU-N01]`
**Qué mostrar:** Realizar una operación (crear carrera o subir sílabo) → **señalar** el toast. Aprobar un sílabo → señalar la notificación de validación.

### CP035 – Auditoría de operaciones (auditor) `[HU-N03/A11]`
**Qué decir:** *"Como auditor, podemos revisar quién hizo qué y cuándo."*
**Qué mostrar:** `/core/blockchain` → seleccionar curso → **señalar** acciones, actores y timestamps del historial.

---

# ÉPICA 5 – DASHBOARD (CP036 – CP038)

### CP036 – Dashboard centralizado `[HU-D01]`
**Qué decir:** *"Un panel centralizado reúne métricas y accesos rápidos."*
**Qué mostrar:** `/dashboards/general` → **señalar** header de institución (nombre, email, rol) y los botones **"Gestión Académica"** y **"Ver Trazabilidad"**.
> *Nota honesta opcional:* *"Algunas tarjetas usan datos de demostración mientras se integra su backend; las métricas reales se ven en el panel de trazabilidad."*

### CP037 – Métricas de gestión y trazabilidad `[HU-D02]`
**Qué mostrar:** `/core/trazabilidad` → **señalar** las 4 tarjetas (Total, Verificados, Versiones, Pendientes), la barra de cobertura blockchain y el promedio de versiones.

### CP038 – Consultar blockchain desde el dashboard `[HU-D03]`
**Qué mostrar:** Desde el dashboard, **"Ver Trazabilidad"** → `/core/blockchain` → seleccionar curso → **"Verificar Integridad"**.

---

# ÉPICA — ONBOARDING / MULTI-INSTITUCIÓN (CP039 – CP040)

### CP039 – Registrar institución `[HU-A02]`
**Qué mostrar:** `/gestion/solicitudes` → **señalar** los stats → crear institución (Nombre, Dominio, Estado) → **"Siguiente"** → toast "Institución creada".

### CP040 – Generar código de acceso `[HU-A03]`
**Qué mostrar:** Sobre una institución → **"Generar Código"** → **"Generar Código"** (confirmar) → **"Copiar Código"** → toast "Código copiado" → mostrar estado "Disponible".

---

## GUION DE CIERRE (50 – 70 segundos)

> *"Hemos demostrado los **40 casos de prueba** que cubren **33 historias de usuario** de nuestro backlog en las cinco épicas. De ellos, **39 resultaron Aprobados** y **1 Observado**, correspondiente al dashboard centralizado, cuyas tarjetas de créditos y certificados usan datos de demostración mientras se integra su backend; las métricas reales de gestión sí están operativas y aprobadas. Durante las pruebas detectamos **5 hallazgos** —un campo vacío en la verificación pública, un error de compilación por caché, una falta de Suspense, un enlace incorrecto y datos mock en el dashboard— y los **cuatro corregibles fueron resueltos y revalidados** en un segundo ciclo. SilaDocs demuestra ser una plataforma que permite a las instituciones **integrar, compartir y aplicar blockchain** para la gestión de sus sílabos, garantizando **inmutabilidad y trazabilidad de precisión**. Gracias por su atención."*

---

## TABLA RESUMEN DE NAVEGACIÓN PARA EL VIDEO

| Épica | Casos | Rutas principales | Navegador |
|-------|-------|-------------------|-----------|
| 1. Autenticación | CP001–CP010 | /authentication/sign-up, /sign-in, /pages/profile-settings | Mixto + **Incógnito** |
| 2. Gestión de Sílabos | CP011–CP024 | /gestion/carreras, /mallas, /cursos, /silabos, /verificador-silabos | Con sesión |
| 3. Blockchain | CP025–CP033 | /gestion/silabos (SSE), /core/blockchain, /public/verify, /verificador-silabos | Con sesión + **Incógnito** |
| 4. Notificaciones | CP034–CP035 | (toasts), /core/blockchain | Con sesión |
| 5. Dashboard | CP036–CP038 | /dashboards/general, /core/trazabilidad, /core/blockchain | Con sesión |
| Onboarding | CP039–CP040 | /gestion/solicitudes | Con sesión |

---

## CONSEJOS DE GRABACIÓN

- **Agrupa por épica:** puedes grabar cada épica como un clip y luego unirlos; facilita repetir un caso si sale mal.
- **Refuerza el CORE:** dedica más tiempo y énfasis a la Épica 3 (Blockchain) y a la verificación pública (CP030–CP032); es tu diferenciador.
- **Muestra los IDs en pantalla:** si tu editor lo permite, sobreimprime "CP025 · HU-B01" en cada caso para que el jurado lo siga.
- **Evidencia los hallazgos corregidos:** al final, muestra brevemente la verificación pública con la carrera mostrando "No especificada" como prueba de la mejora H-01.
- **Dos ciclos:** el primer video puede ser el recorrido con hallazgos; el segundo, la revalidación tras correcciones (como pide la sección 4 del informe).

---

*Fin del guion de exposición – SilaDocs 2026*
