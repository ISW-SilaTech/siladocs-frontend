# INFORME DE EVIDENCIAS DE PRUEBAS DE SOFTWARE

---

**Código del Proyecto:** SILADOCS-2026
**Título del Proyecto:** SilaDocs – Plataforma de Gestión de Sílabos con Trazabilidad Blockchain (Hyperledger Fabric)

**Integrantes del Grupo:**

- [Nombre completo – Código de estudiante]
- [Nombre completo – Código de estudiante]

---

## 1. Historias de Usuario Evaluadas

El presente informe documenta la verificación funcional de la plataforma **SilaDocs**. Se evaluaron las historias de usuario del Product Backlog (épicas: Autenticación, Gestión de Sílabos, Blockchain, Notificaciones y Dashboard) mediante **40 casos de prueba**. La siguiente tabla resume las historias y su cobertura en este ciclo de pruebas.

| ID HU | Épica | Historia de Usuario | Prioridad | Dependencias | Evaluada | Caso(s) |
|-------|-------|---------------------|-----------|--------------|----------|---------|
| HU-A01 | Autenticación | Como administrador quiero registrarme en el sistema para obtener acceso seguro mediante un formulario en la landing page. | Alta | – | Sí | CP001 |
| HU-A02 | Autenticación | Como sistema quiero que las solicitudes de registro sean evaluadas por el equipo de SilaDocs para aprobar únicamente administradores válidos. | Alta | HU-A01 | Sí | CP039 |
| HU-A03 | Autenticación | Como sistema quiero enviar un enlace de registro con token único a administradores aprobados para que puedan completar su registro. | Alta | HU-A02 | Sí | CP002, CP040 |
| HU-A04 | Autenticación | Como sistema quiero que cada token tenga un estado (pendiente, usado, expirado) para controlar la validez del enlace de registro. | Alta | HU-A03 | Sí | CP003 |
| HU-A05 | Autenticación | Como administrador quiero iniciar sesión con mis credenciales para acceder al sistema de manera segura. | Alta | HU-A01 | Sí | CP004, CP005, CP006 |
| HU-A06 | Autenticación | Como administrador quiero recuperar mi contraseña en caso de olvido para mantener acceso al sistema. | Alta | HU-A05 | Sí | CP007 |
| HU-A07 | Autenticación | Como administrador quiero actualizar mi información personal (nombre, contraseña) para mantener mis datos al día. | Media | HU-A05 | Sí | CP008, CP009 |
| HU-A08 | Autenticación | Como administrador quiero configurar autenticación multifactor (MFA) para proteger mi cuenta. | Alta | HU-A05 | No | Pendiente (no implementado en este sprint) |
| HU-A09 | Autenticación | Como administrador quiero que mis credenciales estén cifradas para cumplir con normas de seguridad y privacidad. | Alta | – | Sí | CP010 |
| HU-A10 | Autenticación | Como administrador quiero recibir alertas de incidentes de seguridad para reaccionar rápidamente. | Media | HU-A11 | No | Pendiente |
| HU-A11 | Autenticación | Como administrador quiero que el sistema registre logs de acceso y operaciones para fines de auditoría. | Alta | – | Parcial | CP035 |
| HU-G01 | Gestión de Sílabos | Como administrador quiero crear un catálogo de carreras, mallas y cursos para preparar la gestión de sílabos con información verificada. | Alta | – | Sí | CP011, CP012, CP013 |
| HU-G02 | Gestión de Sílabos | Como sistema quiero que cada carrera, malla o curso tenga un estado (en revisión, pendiente, activo) para controlar la validación institucional. | Alta | HU-G01 | Sí | CP014 |
| HU-G03 | Gestión de Sílabos | Como administrador quiero aprobar o rechazar registros de catálogos para garantizar la veracidad de la información. | Alta | HU-G02 | Sí | CP015 |
| HU-G04 | Gestión de Sílabos | Como administrador quiero crear un sílabo académico asociado a un curso activo para iniciar su gestión oficial. | Alta | HU-G03 | Sí | CP016 |
| HU-G05 | Gestión de Sílabos | Como administrador quiero adjuntar documentos PDF u otros formatos a un sílabo para centralizar toda su información. | Media | HU-G04 | Sí | CP017, CP018 |
| HU-G06 | Gestión de Sílabos | Como administrador quiero agregar metadata a cada sílabo (fecha, autor, curso, versión) para mejorar la trazabilidad. | Alta | HU-G04 | Sí | CP019 |
| HU-G07 | Gestión de Sílabos | Como administrador quiero versionar los sílabos para mantener un historial completo de cambios. | Alta | HU-G04 | Sí | CP020 |
| HU-G08 | Gestión de Sílabos | Como sistema quiero generar un hash único de cada sílabo junto con su metadata para registrarlo de forma inmutable en blockchain. | Alta | HU-G06 | Sí | CP021 |
| HU-G09 | Gestión de Sílabos | Como administrador quiero actualizar un sílabo existente para reflejar cambios oficiales y mantenerlo vigente. | Alta | HU-G04 | Sí | CP022 |
| HU-G10 | Gestión de Sílabos | Como administrador quiero eliminar un sílabo en caso de error o baja oficial para mantener la consistencia de los datos. | Media | HU-G04 | Sí | CP023 |
| HU-G13 | Gestión de Sílabos | Como administrador quiero filtrar y buscar sílabos por institución, carrera, curso o fecha para agilizar la gestión y facilitar auditorías. | Media | HU-G04 | Sí | CP024 |
| HU-B01 | Blockchain | Como administrador quiero validar que cada cambio en un sílabo quede registrado en blockchain para garantizar integridad. | Alta | HU-G07, HU-G08 | Sí | CP025 |
| HU-B02 | Blockchain | Como administrador quiero consultar el historial completo de cambios de un sílabo para revisar su evolución. | Alta | HU-B01 | Sí | CP027 |
| HU-B03 | Blockchain | Como administrador quiero que cada sílabo tenga un hash único registrado en blockchain para garantizar su integridad. | Alta | HU-G08 | Sí | CP021, CP025 |
| HU-B04 | Blockchain | Como administrador quiero que se registre automáticamente cada evento de creación o modificación de un sílabo en blockchain. | Alta | HU-G07 | Sí | CP026 |
| HU-B05 | Blockchain | Como administrador quiero validar que los hashes en blockchain coinciden con los sílabos actuales para garantizar autenticidad. | Alta | HU-B03 | Sí | CP029 |
| HU-B06 | Blockchain | Como administrador quiero consultar el historial de transacciones de cada sílabo en blockchain para auditar cambios. | Media | HU-B04 | Sí | CP028 |
| HU-B07 | Blockchain | Como administrador quiero que los registros blockchain sean inmutables para asegurar la transparencia y confiabilidad. | Alta | HU-B01 | Sí | CP030 |
| HU-B08 | Blockchain | Como administrador quiero auditar los registros en blockchain para verificar la autenticidad de los documentos. | Media | HU-B02, HU-B06 | Sí | CP031, CP032 |
| HU-B09 | Blockchain | Como administrador quiero que las llaves criptográficas sean únicas para cada sílabo para proteger la integridad de los registros. | Alta | HU-B03 | Sí | CP033 |
| HU-N01 | Notificaciones | Como administrador quiero recibir notificaciones sobre cambios y validaciones de sílabos para estar informado. | Alta | HU-G04, HU-G09, HU-B01 | Sí | CP034 |
| HU-N02 | Notificaciones | Como administrador quiero consultar alertas y notificaciones históricas para revisar incidentes y cambios recientes. | Media | HU-N01 | No | Pendiente |
| HU-N03 | Notificaciones | Como auditor quiero auditar logs de acceso y operaciones para cumplir con regulaciones y garantizar transparencia. | Alta | HU-A11 | Sí | CP035 |
| HU-D01 | Dashboard | Como administrador quiero acceder a un dashboard centralizado para visualizar métricas, auditorías y estado de sílabos en un solo lugar. | Alta | HU-G04, HU-N01, HU-N03 | Sí | CP036 |
| HU-D02 | Dashboard | Como administrador quiero visualizar métricas de gestión de sílabos en el dashboard para tomar decisiones basadas en datos. | Alta | HU-G04, HU-G07, HU-G09 | Sí | CP037 |
| HU-D03 | Dashboard | Como administrador quiero consultar registros en blockchain desde el dashboard para verificar trazabilidad. | Alta | HU-B03, HU-B05, HU-B06 | Sí | CP038 |
| HU-D04 | Dashboard | Como auditor quiero generar reportes de auditoría consolidados para entregar a dirección o entidades regulatorias. | Alta | HU-N03, HU-B02, HU-B06 | No | Pendiente |

**Cobertura:** 33 de 38 historias evaluadas (86.8%). Las 5 historias no evaluadas (HU-A08 MFA, HU-A10 alertas de incidentes, HU-N02 alertas históricas, HU-D04 reportes consolidados, y la parte de logs de HU-A11) corresponden a funcionalidades planificadas para sprints posteriores.

---

## 2. Casos de Prueba por Funcionalidad

A continuación se detallan los **40 casos de prueba** organizados por épica. Cada caso sigue el formato estándar: Autor, Historia Relacionada, Precondiciones, Pasos/Resultados Esperados, Tipo de ejecución, Prioridad, Requerimientos y Postcondiciones.

---

### ÉPICA: AUTENTICACIÓN

#### Caso de Prueba: CP001 – Registro de administrador desde la landing

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A01 |
| **Precondiciones** | Existe un código de acceso válido emitido por la institución. Acceso a la landing pública. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-up/cover` | Formulario "Asocia una cuenta educativa" visible |
| 2 | Ingresa el código de acceso | Campo completado |
| 3 | Haz clic en "Validar" | Botón muestra "Validando..." |
| 4 | Espera la respuesta | Botón cambia a "Válido ✓" e institución autocompletada |
| 5 | Completa correo, nombre y contraseña | Campos habilitados y completados |
| 6 | Marca el checkbox de términos | Checkbox activado |
| 7 | Haz clic en "Crear cuenta" | Toast "Cuenta creada correctamente" |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Código de acceso válido |
| **Postcondiciones** | Cuenta de administrador creada y asociada a la institución |

---

#### Caso de Prueba: CP002 – Validar token/código de acceso válido

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A03 |
| **Precondiciones** | Existe un código de acceso en estado "pendiente". |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-up/cover` | Formulario visible |
| 2 | Ingresa el código de acceso válido | Campo completado |
| 3 | Haz clic en "Validar" | Llamada a `GET /auth/validate-code` |
| 4 | Observa el resultado | Botón "Válido ✓"; campo "Institución asignada" autocompletado |
| 5 | Verifica los campos de registro | Correo, nombre y contraseña se habilitan |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Código en estado pendiente |
| **Postcondiciones** | Código validado; formulario habilitado para completar registro |

---

#### Caso de Prueba: CP003 – Rechazo de código inválido, usado o expirado

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A04 |
| **Precondiciones** | Acceso al formulario de registro. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-up/cover` | Formulario visible |
| 2 | Ingresa un código inexistente | Campo completado |
| 3 | Haz clic en "Validar" | Sistema procesa (error 400/404) |
| 4 | Observa el mensaje | Error específico: código no válido / ya utilizado / expirado |
| 5 | Verifica los campos | Permanecen bloqueados; registro no permitido |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Código inválido rechazado con mensaje claro según su estado |

---

#### Caso de Prueba: CP004 – Login exitoso con credenciales válidas

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A05 |
| **Precondiciones** | Usuario registrado: rector@demo.siladocs.com / Demo@Rector123. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-in/cover` | Formulario de login visible |
| 2 | Ingresa el correo rector@demo.siladocs.com | Campo completado |
| 3 | Ingresa la contraseña Demo@Rector123 | Campo completado |
| 4 | Haz clic en "Ingresar" | Botón muestra "Ingresando..." |
| 5 | Verifica el resultado | Toast "Inicio de sesión exitoso" y redirección al dashboard |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Usuario demo existente |
| **Postcondiciones** | Sesión iniciada; token JWT almacenado en localStorage |

---

#### Caso de Prueba: CP005 – Login con credenciales inválidas

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A05 |
| **Precondiciones** | Acceso a la página de login. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-in/cover` | Formulario visible |
| 2 | Ingresa un correo válido con contraseña incorrecta | Campos completados |
| 3 | Haz clic en "Ingresar" | Sistema procesa |
| 4 | Observa el mensaje | Toast de error "Credenciales inválidas" |
| 5 | Verifica la navegación | Permanece en la página de login |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Acceso denegado correctamente |

---

#### Caso de Prueba: CP006 – Validación de campos del formulario de login

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A05 |
| **Precondiciones** | Acceso a la página de login. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/authentication/sign-in/cover` | Formulario visible |
| 2 | Deja el correo vacío y envía | Mensaje "Correo requerido." |
| 3 | Ingresa un correo con formato inválido | Mensaje "Formato inválido." |
| 4 | Ingresa una contraseña menor a 6 caracteres | Mensaje "Debe incluir al menos 6 caracteres." |
| 5 | Verifica las validaciones | Todos los mensajes inline aparecen correctamente |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Validaciones de formulario funcionando |

---

#### Caso de Prueba: CP007 – Recuperación de contraseña

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A06 |
| **Precondiciones** | Existe un usuario registrado con correo válido. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En el login, haz clic en "¿Olvidaste tu contraseña?" | Redirige a recuperación de contraseña |
| 2 | Ingresa el correo registrado | Campo completado |
| 3 | Solicita el código/enlace de recuperación | Sistema envía el código por correo |
| 4 | Ingresa el código de verificación | Código validado |
| 5 | Define una nueva contraseña y confirma | Toast de éxito; contraseña actualizada |
| 6 | Inicia sesión con la nueva contraseña | Acceso concedido |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Correo accesible |
| **Postcondiciones** | Contraseña restablecida correctamente |

---

#### Caso de Prueba: CP008 – Actualizar información personal (perfil)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A07 |
| **Precondiciones** | Usuario autenticado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/pages/profile-settings` | Página de perfil cargada |
| 2 | Modifica el campo "Nombre Completo" | Campo actualizado |
| 3 | Ajusta lenguaje y zona horaria | Selecciones aplicadas |
| 4 | Haz clic en "Guardar Perfil" | Spinner en el botón |
| 5 | Verifica el resultado | Toast "Perfil actualizado correctamente." |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Datos personales actualizados en BD |

---

#### Caso de Prueba: CP009 – Cambiar contraseña desde el perfil

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A07 |
| **Precondiciones** | Usuario autenticado. Conoce su contraseña actual. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/pages/profile-settings`, ubica "Cambio de Contraseña" | Sección visible |
| 2 | Ingresa la contraseña actual | Campo completado |
| 3 | Ingresa una contraseña nueva (≥ 6 caracteres) | Campo completado |
| 4 | Confirma la contraseña nueva | Validación de coincidencia |
| 5 | Si no coinciden, observa el error | Mensaje "Las contraseñas no coinciden" |
| 6 | Con datos correctos, haz clic en "Cambiar Contraseña" | Toast "Contraseña cambiada exitosamente." |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Contraseña actualizada; formulario reiniciado |

---

#### Caso de Prueba: CP010 – Cifrado de credenciales y control de acceso a rutas protegidas

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A09 |
| **Precondiciones** | Navegador en modo incógnito sin sesión. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre el navegador incógnito | Sin sesión activa |
| 2 | Intenta acceder a `/gestion/silabos` | Redirige a login |
| 3 | Intenta acceder a `/core/blockchain` | Redirige a login |
| 4 | Inicia sesión y revisa el localStorage | Token JWT cifrado almacenado (no contraseña en texto plano) |
| 5 | Accede a `/public/verify?id=X&version=Y` | Acceso concedido (ruta pública) |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Rutas privadas protegidas; credenciales cifradas (JWT) |

---

### ÉPICA: GESTIÓN DE SÍLABOS

#### Caso de Prueba: CP011 – Crear carrera (catálogo)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G01 |
| **Precondiciones** | Usuario Administrador autenticado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/carreras` | Listado de carreras visible |
| 2 | Haz clic en "Nueva Carrera" | Modal de creación aparece |
| 3 | Ingresa Nombre "Ingeniería de Sistemas" | Campo completado |
| 4 | Ingresa Facultad y Ciclos (ej. 10) | Campos completados |
| 5 | Selecciona Estado "Activo" | Estado asignado |
| 6 | Haz clic en "Guardar" | Toast "Carrera creada correctamente"; fila visible |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Carrera registrada en BD |

---

#### Caso de Prueba: CP012 – Crear malla curricular

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G01 |
| **Precondiciones** | Usuario Administrador autenticado. Existe al menos una carrera. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/mallas` | Listado de mallas visible |
| 2 | Haz clic en "Nueva Malla" | Modal de creación aparece |
| 3 | Selecciona la Carrera | Carrera asociada |
| 4 | Ingresa Nombre, Año, Nº Cursos y Créditos | Campos completados |
| 5 | Selecciona Estado y agrega Descripción | Datos completados |
| 6 | Haz clic en "Guardar" | Malla creada y visible en la tabla |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP011 ejecutado |
| **Postcondiciones** | Malla curricular registrada y asociada a la carrera |

---

#### Caso de Prueba: CP013 – Crear curso asociado a carrera y malla

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G01 |
| **Precondiciones** | Usuario Administrador autenticado. Existen carrera y malla. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/cursos` | Listado de cursos visible |
| 2 | Haz clic en "Crear Curso" | Modal de creación aparece |
| 3 | Selecciona la Carrera | Selector de Malla se filtra automáticamente |
| 4 | Selecciona la Malla curricular | Malla asociada |
| 5 | Ingresa Código "MAT101", Nombre "Matemática Básica", Facultad, Año | Campos completados |
| 6 | Haz clic en "Guardar" | Curso creado y visible en la tabla |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP011 y CP012 ejecutados |
| **Postcondiciones** | Curso registrado, asociado a carrera y malla |

---

#### Caso de Prueba: CP014 – Estado de catálogos (badges de validación)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G02 |
| **Precondiciones** | Existen carreras, mallas y cursos con distintos estados. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/carreras` | Listado visible |
| 2 | Observa la columna "Estado" | Badges: Activo / En Revisión / Suspendido / Inactivo |
| 3 | Repite en `/gestion/cursos` | Estado "Active" (verde) / "Closed" (rojo) |
| 4 | Repite en `/gestion/mallas` | Badge de estado visible por malla |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Datos cargados |
| **Postcondiciones** | Estados visualizados correctamente por color |

---

#### Caso de Prueba: CP015 – Editar y eliminar registro de catálogo

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G03 |
| **Precondiciones** | Usuario Administrador autenticado. Existe un registro de catálogo. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/carreras`, haz clic en "Editar" de una carrera | Modal con datos precargados |
| 2 | Cambia el Estado a "Activo" (aprobación) | Estado actualizado |
| 3 | Haz clic en "Guardar" | Cambios guardados |
| 4 | Haz clic en "Eliminar" de un registro de prueba | Confirmación "¿Está seguro de que desea eliminar...?" |
| 5 | Confirma | Registro eliminado del listado |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Registro existente |
| **Postcondiciones** | Catálogo aprobado (estado activo) o eliminado según corresponda |

---

#### Caso de Prueba: CP016 – Crear/subir sílabo asociado a curso activo

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G04 |
| **Precondiciones** | Usuario autenticado. Existe un curso activo. PDF disponible. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/silabos` | Página de gestión de sílabos cargada |
| 2 | Haz clic en "Subir Sílabo" | Modal de carga aparece |
| 3 | Selecciona el Curso del desplegable | Curso asociado |
| 4 | Selecciona un archivo PDF | Archivo cargado en el área drag-and-drop |
| 5 | Confirma la subida | Conexión SSE inicia el proceso en blockchain |
| 6 | Verifica el listado | Sílabo aparece con su estado correspondiente |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP013 ejecutado |
| **Postcondiciones** | Sílabo creado y asociado al curso activo |

---

#### Caso de Prueba: CP017 – Adjuntar documento PDF con previsualización

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G05 |
| **Precondiciones** | Usuario autenticado. Modal de carga abierto. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre el modal "Subir Sílabo" | Modal visible |
| 2 | Arrastra un PDF al área de carga | Archivo aceptado (PDF/DOC/DOCX) |
| 3 | Observa la previsualización | Documento mostrado antes de confirmar |
| 4 | Verifica el nombre y tamaño del archivo | Datos mostrados correctamente |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Documento adjuntado correctamente al sílabo |

---

#### Caso de Prueba: CP018 – Validación de formato y tamaño de archivo

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G05 |
| **Precondiciones** | Usuario autenticado. Archivos de prueba inválidos preparados. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre el modal "Subir Sílabo" | Modal visible |
| 2 | Intenta subir un archivo .png/.txt | Mensaje "Tipo de archivo no permitido. Solo PDF, DOC o DOCX." |
| 3 | Intenta subir un archivo mayor a 50 MB | Mensaje "El archivo supera el tamaño máximo de 50 MB." |
| 4 | Intenta subir sin seleccionar curso | Mensaje "Seleccione un curso." |
| 5 | Verifica que no se creó registro | No aparece en el listado ni en blockchain |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Archivos inválidos preparados |
| **Postcondiciones** | Archivos inválidos rechazados sin generar registro |

---

#### Caso de Prueba: CP019 – Metadata del sílabo

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G06 |
| **Precondiciones** | Existe un sílabo cargado (CP016). |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/silabos`, ubica el sílabo | Fila visible en la tabla |
| 2 | Observa las columnas | Archivo, Curso, Hash SHA-256, Tx Blockchain, Fecha, Estado |
| 3 | Haz clic en "Ver detalles" | Modal con metadata completa |
| 4 | Verifica autor, curso, fecha y versión | Metadata correcta y completa |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP016 ejecutado |
| **Postcondiciones** | Metadata del sílabo registrada y consultable |

---

#### Caso de Prueba: CP020 – Versionar sílabo (nueva versión)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G07 |
| **Precondiciones** | Existe un sílabo v1 registrado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/silabos`, selecciona un sílabo registrado | Sílabo seleccionado |
| 2 | Sube una nueva versión (v2) del mismo curso | Archivo seleccionado |
| 3 | Confirma la subida | Nueva versión procesada en blockchain |
| 4 | Abre el sílabo en el verificador, pestaña "Historial" | v1 y v2 visibles |
| 5 | Verifica los hashes | Cada versión con hash SHA-256 único |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP016 ejecutado |
| **Postcondiciones** | Historial de versiones preservado con identificadores únicos |

---

#### Caso de Prueba: CP021 – Generación de hash único SHA-256

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G08 / HU-B03 |
| **Precondiciones** | Carga de sílabo en proceso (CP016). |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Inicia la carga de un sílabo | Conexión SSE abierta |
| 2 | Observa los eventos en tiempo real | `hash_computing` → `hash_computed` |
| 3 | Verifica el hash mostrado | Hash SHA-256 de 64 caracteres generado |
| 4 | Compara con otro sílabo distinto | Hashes diferentes (unicidad) |

| **Tipo de ejecución** | Automático (SSE) / Manual (validación) |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Conexión SSE activa |
| **Postcondiciones** | Hash único generado por documento |

---

#### Caso de Prueba: CP022 – Actualizar/aprobar sílabo (estado Validado)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G09 |
| **Precondiciones** | Existe un sílabo en estado "Pendiente"/"Confirmado". |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/silabos`, ubica el sílabo | Fila visible |
| 2 | Haz clic en "Aprobar sílabo (TC-02)" | Confirmación "¿Aprobar este sílabo? El estado cambiará a 'Validado'." |
| 3 | Confirma la acción | Llamada a `PATCH /syllabi/{id}/approve` |
| 4 | Verifica el estado | Badge cambia a "Validado" |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Sílabo existente |
| **Postcondiciones** | Sílabo actualizado a estado "Validado" |

---

#### Caso de Prueba: CP023 – Eliminar sílabo

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G10 |
| **Precondiciones** | Existe un sílabo eliminable. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/silabos`, ubica un sílabo de prueba | Fila visible |
| 2 | Haz clic en el ícono de "Eliminar" | Solicita confirmación |
| 3 | Confirma la eliminación | Llamada a `DELETE /syllabi/{id}` |
| 4 | Verifica el listado | El sílabo ya no aparece |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Sílabo existente |
| **Postcondiciones** | Sílabo eliminado de la BD (registro blockchain permanece inmutable) |

---

#### Caso de Prueba: CP024 – Buscar y filtrar sílabos

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-G13 |
| **Precondiciones** | Existen varios sílabos registrados. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/verificador-silabos` | Verificador cargado |
| 2 | En la barra, ingresa un código de curso (ej. "MAT101") | Búsqueda ejecutada |
| 3 | Haz clic en "Buscar" | Resultado del sílabo mostrado |
| 4 | Prueba buscar por hash y por ID | Cada criterio devuelve el sílabo correcto |
| 5 | Busca un término inexistente | Alert "No se encontró ningún sílabo con: {query}" |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Sílabos registrados |
| **Postcondiciones** | Búsqueda por hash, código e ID funcional |

---

### ÉPICA: BLOCKCHAIN

#### Caso de Prueba: CP025 – Registro de cambio en blockchain

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B01 / HU-B03 |
| **Precondiciones** | Usuario autenticado. Conexión a Hyperledger Fabric activa. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Carga un sílabo desde `/gestion/silabos` | Proceso inicia |
| 2 | Observa los eventos SSE | `fabric_connecting` → `fabric_submitting` → `fabric_confirmed` |
| 3 | Verifica el resultado | Estado "Confirmado en Fabric" |
| 4 | Confirma el Transaction ID | fabricTxId asignado y visible |

| **Tipo de ejecución** | Automático (SSE) / Manual (validación) |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Hyperledger Fabric activo |
| **Postcondiciones** | Cambio registrado de forma inmutable en blockchain |

---

#### Caso de Prueba: CP026 – Registro automático de eventos en tiempo real

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B04 |
| **Precondiciones** | Usuario autenticado. Carga de sílabo en curso. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Inicia la carga de un sílabo | EventSource conectado al stream SSE |
| 2 | Observa la barra de progreso | Se actualiza con cada evento |
| 3 | Verifica la secuencia de eventos | file_received → hash → storage → fabric → db → completed |
| 4 | Confirma el evento final | `completed` con datos del registro |

| **Tipo de ejecución** | Automático (SSE) |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Backend con SSE habilitado |
| **Postcondiciones** | Evento de creación/modificación registrado automáticamente |

---

#### Caso de Prueba: CP027 – Consultar historial completo de cambios

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B02 |
| **Precondiciones** | Existe un sílabo con varias versiones/transacciones. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/core/blockchain` | Panel de auditoría cargado |
| 2 | Busca y selecciona un curso | Detalles cargados en panel derecho |
| 3 | Observa el "Historial de Transacciones" | Timeline con CREATION/UPDATE/VERIFICATION |
| 4 | Verifica cada entrada | Timestamp, acción y actor visibles |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP020/CP025 ejecutados |
| **Postcondiciones** | Historial completo de cambios consultable |

---

#### Caso de Prueba: CP028 – Consultar historial de transacciones blockchain

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B06 |
| **Precondiciones** | Existe al menos una transacción registrada. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/core/blockchain` | Panel cargado |
| 2 | Selecciona un curso registrado | Información técnica visible |
| 3 | Observa las tarjetas: Hash, Bloque, Canal | Hash SHA-256, "#bloque", "silabos-channel" |
| 4 | Revisa los actores de cada transacción | Email del usuario o "Sistema" |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | CP025 ejecutado |
| **Postcondiciones** | Transacciones blockchain auditables |

---

#### Caso de Prueba: CP029 – Validar que los hashes coinciden (verificación de integridad)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B05 |
| **Precondiciones** | Existe un sílabo registrado en blockchain. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/core/blockchain` y selecciona un curso | Panel de detalles visible |
| 2 | Haz clic en "Verificar Integridad" | Spinner durante la verificación |
| 3 | Observa el resultado (verificado) | SweetAlert "✓ Documento Verificado", Bloque #X, Estado Inmutable |
| 4 | (Opcional) Verifica un sílabo no registrado | SweetAlert "⚠ Documento No Verificado" |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP025 ejecutado |
| **Postcondiciones** | Coincidencia de hash blockchain ↔ documento validada |

---

#### Caso de Prueba: CP030 – Inmutabilidad de registros (verificación pública)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B07 |
| **Precondiciones** | Existe un sílabo inmutable. Navegador incógnito. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre navegador incógnito | Sin sesión |
| 2 | Accede a `/public/verify?id=X&version=Y` | Página pública cargada sin login |
| 3 | Verifica el badge de estado | "Inmutable" (verde) |
| 4 | Ve a la pestaña "Detalles" | Hash SHA-256, bloque y canal visibles |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Sílabo inmutable |
| **Postcondiciones** | Inmutabilidad verificable públicamente |

---

#### Caso de Prueba: CP031 – Auditar autenticidad mediante QR

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B08 |
| **Precondiciones** | Usuario autenticado. Sílabo inmutable. Dispositivo con cámara. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/verificador-silabos`, busca un sílabo | Resultado mostrado |
| 2 | Ve a "Historial" y haz clic en "Ver QR" | Modal con código QR aparece |
| 3 | Descarga o escanea el QR | QR codifica `/public/verify?id=X&version=Y` |
| 4 | Escanea desde un celular | Abre la verificación pública sin login |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Dispositivo móvil |
| **Postcondiciones** | Auditoría pública vía QR funcional |

---

#### Caso de Prueba: CP032 – Auditar mediante URL pública compartible

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B08 |
| **Precondiciones** | Sílabo registrado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre la verificación de un sílabo | Página de verificación cargada |
| 2 | Haz clic en "Copiar URL de Compartición" | URL copiada al portapapeles |
| 3 | Observa la notificación | Toast "URL Copiada" |
| 4 | Pega la URL en una pestaña nueva (sin sesión) | El sílabo correcto se muestra |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Media |
| **Requerimientos** | Acceso a portapapeles |
| **Postcondiciones** | URL pública compartible y auditable |

---

#### Caso de Prueba: CP033 – Llaves/identificadores criptográficos únicos por versión

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-B09 |
| **Precondiciones** | Sílabo con múltiples versiones (CP020). |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Abre el sílabo en el verificador, pestaña "Historial" | Versiones listadas |
| 2 | Compara los hashes de v1 y v2 | Hashes SHA-256 completamente distintos |
| 3 | Compara los fabricTxId | Cada versión con transacción única |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP020 ejecutado |
| **Postcondiciones** | Cada versión cuenta con hash y transacción únicos |

---

### ÉPICA: NOTIFICACIONES

#### Caso de Prueba: CP034 – Notificaciones de cambios y validaciones

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-N01 |
| **Precondiciones** | Usuario autenticado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Realiza una operación (crear carrera/subir sílabo) | Operación procesada |
| 2 | Observa la esquina de la pantalla | Toast de notificación (éxito/error) |
| 3 | Aprueba un sílabo | Notificación de validación mostrada |
| 4 | Verifica la claridad del mensaje | Mensaje descriptivo y contextual |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Notificaciones funcionando en operaciones clave |

---

#### Caso de Prueba: CP035 – Auditoría de registros y operaciones (auditor)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-N03 / HU-A11 |
| **Precondiciones** | Usuario con permisos de auditoría. Existen transacciones. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/core/blockchain` | Panel de auditoría cargado |
| 2 | Selecciona un curso | Historial de transacciones visible |
| 3 | Revisa acciones, actores y timestamps | Registro completo de operaciones |
| 4 | Verifica la trazabilidad de quién hizo qué y cuándo | Auditoría consistente |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP025 ejecutado |
| **Postcondiciones** | Operaciones auditables para fines regulatorios |

---

### ÉPICA: DASHBOARD

#### Caso de Prueba: CP036 – Dashboard centralizado

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-D01 |
| **Precondiciones** | Usuario autenticado. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/dashboards/general` | Dashboard centralizado cargado |
| 2 | Observa el header de institución | Nombre, email y rol del usuario |
| 3 | Verifica los accesos rápidos | "Gestión Académica" y "Ver Trazabilidad" |
| 4 | Revisa las tarjetas y gráficas | Métricas y visualizaciones renderizadas |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Ninguno |
| **Postcondiciones** | Vista centralizada operativa |

---

#### Caso de Prueba: CP037 – Métricas de gestión y trazabilidad

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-D02 |
| **Precondiciones** | Usuario autenticado. Existen sílabos registrados. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/core/trazabilidad` | Dashboard de trazabilidad cargado |
| 2 | Observa las 4 tarjetas de métricas | Total, Verificados, Versiones, Pendientes |
| 3 | Verifica la cobertura blockchain | Barra de progreso con % correcto |
| 4 | Revisa el promedio de versiones | Cálculo correcto por sílabo |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Sílabos registrados |
| **Postcondiciones** | Métricas de gestión calculadas correctamente |

---

#### Caso de Prueba: CP038 – Consultar blockchain desde el dashboard

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-D03 |
| **Precondiciones** | Usuario autenticado. Existen registros blockchain. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Desde el dashboard, haz clic en "Ver Trazabilidad" | Redirige a `/core/blockchain` |
| 2 | Selecciona un curso | Detalles blockchain cargados |
| 3 | Verifica hash, bloque y canal | Información de trazabilidad visible |
| 4 | Ejecuta "Verificar Integridad" | Confirmación blockchain mostrada |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP025 ejecutado |
| **Postcondiciones** | Trazabilidad blockchain consultable desde el dashboard |

---

### ÉPICA: ONBOARDING / MULTI-INSTITUCIÓN (soporte a HU-A02, HU-A03)

#### Caso de Prueba: CP039 – Registrar institución (evaluación de solicitudes)

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A02 |
| **Precondiciones** | Usuario con permisos de administración de onboarding. |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | Navega a `/gestion/solicitudes` | Panel con stats (Instituciones, Códigos) |
| 2 | Inicia la creación de una institución | Modal de creación aparece |
| 3 | Ingresa Nombre y Dominio, selecciona Estado | Campos completados |
| 4 | Haz clic en "Siguiente" | Toast "Institución '{nombre}' creada" |
| 5 | Verifica el listado de instituciones | La nueva institución aparece |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | Rol de administración |
| **Postcondiciones** | Institución registrada en el sistema multi-institución |

---

#### Caso de Prueba: CP040 – Generar código de acceso institucional

| Campo | Detalle |
|-------|---------|
| **Autor** | Equipo SilaDocs |
| **Historia Relacionada** | HU-A03 |
| **Precondiciones** | Existe una institución registrada (CP039). |

| # | Pasos | Resultados Esperados |
|---|-------|----------------------|
| 1 | En `/gestion/solicitudes`, ubica una institución | Fila visible |
| 2 | Haz clic en "Generar Código" | Modal de generación aparece |
| 3 | Confirma con "Generar Código" | Spinner; código alfanumérico generado |
| 4 | Haz clic en "Copiar Código" | Toast "Código copiado" |
| 5 | Verifica el estado del código | Aparece como "Disponible" en la tabla |

| **Tipo de ejecución** | Manual |
|---|---|
| **Prioridad** | Alta |
| **Requerimientos** | CP039 ejecutado |
| **Postcondiciones** | Código de acceso válido (estado pendiente) generado para registro |

---

## 3. Resultado Esperado vs. Resultado Obtenido

| Caso de Prueba | Historia Relacionada | Resultado Esperado | Resultado Obtenido | Estado |
|----------------|----------------------|--------------------|--------------------|--------|
| CP001 | HU-A01 | Cuenta creada con código válido | Cuenta creada correctamente | Aprobado |
| CP002 | HU-A03 | Código válido aceptado | Institución autocompletada | Aprobado |
| CP003 | HU-A04 | Código inválido rechazado | Mensaje de error según estado | Aprobado |
| CP004 | HU-A05 | Login exitoso | Sesión iniciada, redirección | Aprobado |
| CP005 | HU-A05 | Rechazo de credenciales inválidas | Error mostrado, sin acceso | Aprobado |
| CP006 | HU-A05 | Validación de campos | Mensajes inline correctos | Aprobado |
| CP007 | HU-A06 | Contraseña restablecida | Acceso con nueva contraseña | Aprobado |
| CP008 | HU-A07 | Perfil actualizado | Toast de éxito; datos guardados | Aprobado |
| CP009 | HU-A07 | Contraseña cambiada | Cambio exitoso; form reiniciado | Aprobado |
| CP010 | HU-A09 | Rutas protegidas, JWT cifrado | Redirección y token cifrado | Aprobado |
| CP011 | HU-G01 | Carrera creada | Carrera registrada y listada | Aprobado |
| CP012 | HU-G01 | Malla creada | Malla registrada | Aprobado |
| CP013 | HU-G01 | Curso creado y asociado | Curso registrado con malla | Aprobado |
| CP014 | HU-G02 | Estados visibles por badge | Badges de estado correctos | Aprobado |
| CP015 | HU-G03 | Editar/eliminar catálogo | Operaciones exitosas | Aprobado |
| CP016 | HU-G04 | Sílabo asociado a curso | Sílabo creado correctamente | Aprobado |
| CP017 | HU-G05 | Previsualización de PDF | PDF visible antes de subir | Aprobado |
| CP018 | HU-G05 | Rechazo de formato/tamaño | Archivos inválidos rechazados | Aprobado |
| CP019 | HU-G06 | Metadata completa | Hash, tx, fecha, curso visibles | Aprobado |
| CP020 | HU-G07 | Nueva versión con historial | v1 y v2 con hashes únicos | Aprobado |
| CP021 | HU-G08 | Hash SHA-256 único | Hash de 64 caracteres generado | Aprobado |
| CP022 | HU-G09 | Sílabo aprobado/validado | Estado "Validado" | Aprobado |
| CP023 | HU-G10 | Sílabo eliminado | Eliminado del listado | Aprobado |
| CP024 | HU-G13 | Búsqueda por hash/código/ID | Resultados correctos | Aprobado |
| CP025 | HU-B01/B03 | Registro en Fabric | Estado Confirmado, txId asignado | Aprobado |
| CP026 | HU-B04 | Eventos SSE automáticos | Secuencia completa de eventos | Aprobado |
| CP027 | HU-B02 | Historial completo | Timeline de cambios visible | Aprobado |
| CP028 | HU-B06 | Historial de transacciones | Hash, bloque, canal, actor | Aprobado |
| CP029 | HU-B05 | Hashes coinciden | "✓ Documento Verificado" | Aprobado |
| CP030 | HU-B07 | Registro inmutable | Badge "Inmutable" público | Aprobado |
| CP031 | HU-B08 | Auditoría vía QR | QR abre verificación pública | Aprobado |
| CP032 | HU-B08 | Auditoría vía URL | URL pública funcional | Aprobado |
| CP033 | HU-B09 | Hash/tx únicos por versión | Identificadores distintos | Aprobado |
| CP034 | HU-N01 | Notificaciones de operaciones | Toasts mostrados | Aprobado |
| CP035 | HU-N03/A11 | Auditoría de operaciones | Registro completo auditable | Aprobado |
| CP036 | HU-D01 | Dashboard centralizado | Vista operativa | Observado* |
| CP037 | HU-D02 | Métricas de trazabilidad | Métricas correctas | Aprobado |
| CP038 | HU-D03 | Blockchain desde dashboard | Trazabilidad consultable | Aprobado |
| CP039 | HU-A02 | Institución registrada | Institución creada | Aprobado |
| CP040 | HU-A03 | Código de acceso generado | Código disponible y copiable | Aprobado |

> **\*Observado (CP036):** El dashboard centralizado (`/dashboards/general`) muestra algunas secciones (créditos de emisión, certificados) con **datos de demostración (mock)** mientras se integra su backend definitivo. La navegación, el header de institución y los accesos rápidos funcionan correctamente; las métricas de gestión reales se validan en CP037 (Aprobado).

**Resumen de resultados:**

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| Aprobado | 39 | 97.5% |
| Observado | 1 | 2.5% |
| Fallido | 0 | 0% |
| **Total** | **40** | **100%** |

---

## 4. Evidencia de Pruebas Ejecutadas

**Enlace a video del primer ciclo de pruebas:** [Insertar enlace aquí]

**Enlace a video del segundo ciclo de pruebas:** [Insertar enlace aquí]

### Identificación de hallazgos

Durante la ejecución de los casos de prueba se identificaron los siguientes hallazgos:

1. **Hallazgo H-01 (CP030/CP032) – Campo "Carrera" vacío en verificación pública:**
   En la página pública `/public/verify`, el campo "Carrera" se mostraba en blanco cuando el dato no estaba disponible, generando una visualización confusa para el usuario externo.

2. **Hallazgo H-02 (Build – CP037) – Error de compilación por caché de tipos:**
   El dashboard de trazabilidad (`/core/trazabilidad`) presentaba un error de TypeScript (`Property 'versions' does not exist on type 'SyllabusTrace'`) causado por caché desactualizada de Next.js.

3. **Hallazgo H-03 (CP030/CP031) – Suspense boundary en verificación pública:**
   La página `/public/verify` fallaba en el build de producción por usar `useSearchParams()` sin un límite de `Suspense`.

4. **Hallazgo H-04 (CP001) – Enlace de términos apuntaba a URL externa:**
   El enlace de "términos y condiciones" en el formulario de registro apuntaba a una URL de ejemplo (`https://www.ejemplo.com/terminos`) en lugar de la página interna.

5. **Hallazgo H-05 (CP036) – Datos de demostración en el dashboard general:**
   Las tarjetas de créditos de emisión y certificados del dashboard centralizado utilizan datos mock pendientes de integración con el backend definitivo.

### Aplicación de mejoras realizadas

1. **Solución H-01:** Se modificó el componente para mostrar el texto **"No especificada"** cuando el campo carrera no contiene valor. Validación posterior: CP030 y CP032 reejecutados con resultado **Aprobado**.

2. **Solución H-02:** Se limpió la caché de compilación (`rm -rf .next node_modules/.cache`) y se reconstruyó el proyecto. Validación posterior: **build exitoso** con todas las páginas compiladas sin errores de tipos.

3. **Solución H-03:** Se envolvió el componente que utiliza `useSearchParams()` dentro de un límite **`<Suspense>`** con un fallback de carga. Validación posterior: build de producción exitoso; CP030/CP031 **Aprobados**.

4. **Solución H-04:** Se reemplazó el enlace externo por un componente **`<Link href="/terminos-condiciones">`** interno de Next.js. Validación posterior: CP001 **Aprobado**.

5. **Solución H-05:** Se documentó como **"Observado"** el caso CP036, dejando registro de que las secciones afectadas corresponden a integración planificada para sprints posteriores. Las métricas reales de gestión quedaron cubiertas y aprobadas en CP037.

---

*Fin del Informe de Evidencias de Pruebas de Software – SilaDocs 2026*
