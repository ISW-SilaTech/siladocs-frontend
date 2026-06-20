# 🔍 Investigación: Por qué solo se muestran 4 sílabos

## Problema Reportado
El usuario reporta que la lista de sílabos siempre muestra únicamente 4 elementos, sin importar cuántos sílabos se hayan cargado en el sistema.

**Ubicación del problema:** `https://siladocs-frontend.vercel.app/gestion/silabos/`

---

## Análisis del Frontend

### Código del Servicio (syllabi.service.ts)
```typescript
getAll: async (): Promise<Syllabus[]> => {
    const response = await api.get<any[]>('/syllabi');
    return response.data.map(mapSyllabus);
}
```

**Conclusión:** El frontend NO tiene límites implementados. Simplemente obtiene todos los datos que devuelve el endpoint `/syllabi`.

### Página de Listado (gestion/silabos/page.tsx)
```typescript
const fetchSyllabi = async () => {
    const data = await SyllabiService.getAll();
    setSyllabi(data);  // Sin filtros ni límites
}
```

**Conclusión:** La página renderiza TODOS los sílabos que recibe del servicio.

---

## Conclusión: El problema está en el Backend

El endpoint `GET /api/syllabi` está **limitado a 4 resultados** a nivel de base de datos o en la lógica del controlador Java.

### Posibles causas en el backend:

1. **Query con LIMIT 4:**
   ```sql
   SELECT * FROM syllabi LIMIT 4;  -- ❌ Debe ser LIMIT 1000 o SIN LÍMITE
   ```

2. **Paginación con page size = 4:**
   ```java
   Page<Syllabus> results = repository.findAll(PageRequest.of(0, 4));
   ```

3. **Filtro por estado que solo retorna 4:**
   ```java
   findBySoftDeletedFalse().stream().limit(4)  // ❌ Límite innecesario
   ```

---

## Solución Recomendada para el Backend

### Opción 1: Eliminar el límite de 4 (Recomendado)

**Archivo:** `src/main/java/com/siladocs/application/controller/SyllabusController.java`

```java
@GetMapping
public ResponseEntity<List<SyllabusDTO>> getAllSyllabi() {
    List<Syllabus> syllabi = syllabusService.findAllActive();  // Sin LIMIT
    return ResponseEntity.ok(mapper.toDtoList(syllabi));
}
```

### Opción 2: Implementar paginación correcta

```java
@GetMapping
public ResponseEntity<Page<SyllabusDTO>> getAllSyllabi(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int size  // Tamaño suficientemente grande
) {
    Page<Syllabus> syllabi = syllabusService.findAllActive(PageRequest.of(page, size));
    return ResponseEntity.ok(syllabi.map(mapper::toDto));
}
```

Y actualizar el frontend:
```typescript
getAll: async (): Promise<Syllabus[]> => {
    const response = await api.get<any[]>('/syllabi?page=0&size=1000');
    return response.data.map(mapSyllabus);
}
```

---

## Pruebas para validar el fix

### 1. En el backend - Verificar la query:
```bash
# Abrir logs y buscar la query SELECT
# Debería NOT contener LIMIT 4
tail -f application.log | grep "SELECT.*syllabi"
```

### 2. En el frontend - Usando las herramientas de debug:

**Opción A: Abre la consola del navegador (F12)**
```javascript
// En la consola:
api.get('/syllabi').then(r => console.log('Total syllabi:', r.data.length))
```

**Opción B: Visita la página de debug que creamos:**
```
http://localhost:3000/debug-syllabi
```
Haz clic en "Fetch Raw API Data" para ver exactamente cuántos datos devuelve el servidor.

### 3. Verificar en Azure Blob Storage:
```bash
# Si hay más de 4 archivos en Azure pero solo 4 en BD
# → Problema de sincronización o de inserción
```

---

## Cambios Implementados en Frontend

### 1. Logging mejorado en `syllabi.service.ts`
Agregamos logs detallados para ver exactamente qué devuelve el servidor:
```typescript
console.log('[SYLLABI DEBUG] Response data length:', response.data?.length);
console.log('[SYLLABI DEBUG] Mapped syllabi:', mapped);
```

### 2. Herramienta de debugging en `shared/pages/debug-syllabi.tsx`
Página para inspeccionar la respuesta del servidor en tiempo real.

**Cómo usarla:**
1. Navega a `/debug-syllabi` en tu navegador
2. Haz clic en "Fetch Raw API Data"
3. Observa en la consola (F12) el conteo exacto de sílabos

---

## Pasos para Resolver

### Paso 1: Verificar el Problema (Ahora)
```bash
# Abre tu navegador en: https://siladocs-frontend.vercel.app/gestion/silabos/
# Abre DevTools (F12) → Pestaña Console
# Deberías ver:
# [SYLLABI DEBUG] Response data length: 4  ❌ PROBLEMA CONFIRMADO
```

### Paso 2: Localizar el Bug en el Backend
El backend está en: `/tmp/siladocs-backend/`

**Archivo probable:**
```
src/main/java/com/siladocs/application/controller/SyllabusController.java
```

**Buscar:**
```bash
cd /tmp/siladocs-backend
grep -rn "LIMIT 4\|limit(4)\|size.*4" src/main/java/
grep -rn "findAll" src/main/java/com/siladocs/application/controller/SyllabusController.java
```

### Paso 3: Corregir el Backend
1. Abre `SyllabusController.java`
2. Encuentra el método `getAllSyllabi()` o similar
3. Elimina cualquier `.limit(4)` o `LIMIT 4`
4. Si usa paginación, asegúrate que el tamaño sea >= 100

### Paso 4: Recompilar y Desplegar
```bash
cd /tmp/siladocs-backend
mvn clean package -DskipTests
# Desplegar a Azure
```

### Paso 5: Verificar el Fix
1. Ve a `/gestion/silabos/`
2. Observa en F12 Console:
```javascript
// Debería mostrar el número correcto de sílabos
[SYLLABI DEBUG] Response data length: 15  ✅ CORRECTO
```

---

## Impacto

| Aspecto | Antes | Después |
|--------|-------|---------|
| Sílabos mostrados | 4 (LÍMITE) | Todos los sílabos |
| Experiencia de usuario | Confusa, incompleta | Correcta y funcional |
| Funcionalidad de búsqueda | No funciona correctamente | Completa y precisa |
| Validación de documentos | Imposible validar todos | Auditoría completa |

---

## Archivos de Referencia

### Frontend - Debug:
- `shared/pages/debug-syllabi.tsx` - Herramienta de debugging
- `shared/services/syllabi.service.ts` - Servicio con logging mejorado
- `app/(components)/(content-layout)/gestion/silabos/page.tsx` - Página de listado

### Backend - Probable ubicación del bug:
- `/tmp/siladocs-backend/src/main/java/com/siladocs/application/controller/SyllabusController.java`
- `/tmp/siladocs-backend/src/main/java/com/siladocs/application/service/SyllabusService.java`

---

## Siguiente Acción

1. ✅ Recolectar evidencia del problema (logs del frontend)
2. ⏳ Localizar el código del backend que causa el LIMIT 4
3. ⏳ Corregir el código del backend
4. ⏳ Recompilar y desplegar
5. ⏳ Verificar que se muestren todos los sílabos

---

**Creado:** 2026-06-20  
**Estado:** En Investigación  
**Prioridad:** 🔴 Alta - Bloquea la funcionalidad crítica
