# 🛠️ Cómo Debuguear el Problema de 4 Sílabos

## 📊 Resumen Rápido

Solo se muestran 4 sílabos aunque haya más en la base de datos. El problema está en el **backend**, no en el frontend.

---

## 🔍 Paso 1: Confirmar el Problema

### Opción A: En tu navegador (Más fácil)

1. **Abre la página de sílabos:**
   ```
   https://siladocs-frontend.vercel.app/gestion/silabos/
   ```

2. **Abre DevTools:**
   - Windows/Linux: Presiona `F12`
   - Mac: Presiona `Cmd + Option + I`

3. **Ve a la pestaña "Console"**

4. **Busca mensajes que digan:**
   ```
   [SYLLABI DEBUG] Response data length: 4
   ```

   - Si ves `4` → **PROBLEMA CONFIRMADO** ❌
   - Si ves más de 4 → Funcionando correctamente ✅

### Opción B: Página de Debug del Frontend

1. **En desarrollo local**, ejecuta:
   ```bash
   npm run dev
   ```

2. **Navega a:**
   ```
   http://localhost:3000/debug-syllabi
   ```

3. **Haz clic en "Fetch Raw API Data"**

4. **Observa el campo "data_length" en la respuesta**

---

## 🔧 Paso 2: Ejecutar Script de Prueba

### En tu terminal:

```bash
# Navega al proyecto frontend
cd /home/user/siladocs-frontend

# Ejecuta el script de debugging
./scripts/debug-syllabi-api.sh
```

**Salida esperada:**
```
📊 Total items en respuesta: 4
⚠️  PROBLEMA DETECTADO: La API devuelve exactamente 4 items
   Esto sugiere un LIMIT 4 en el backend
```

---

## 🔎 Paso 3: Investigar en el Backend

El backend está en: `/tmp/siladocs-backend/` (si no existe, pide acceso)

### Buscar el código problemático:

```bash
cd /tmp/siladocs-backend

# Búsqueda 1: Buscar LIMIT 4
grep -rn "LIMIT 4" src/

# Búsqueda 2: Buscar limit(4)
grep -rn "limit(4)" src/

# Búsqueda 3: Ver el controlador de sílabos
find src -name "*SyllabusController*" -o -name "*SyllabiController*"
cat src/main/java/com/siladocs/application/controller/SyllabusController.java
```

---

## 🐛 Probable Ubicación del Bug

### Archivo: `SyllabusController.java`

**Búsqueda en el código:**

```java
// ❌ INCORRECTO - Causa el problema
@GetMapping
public ResponseEntity<List<SyllabusDTO>> getAllSyllabi() {
    List<Syllabus> syllabi = syllabusService.findAll()
        .stream()
        .limit(4)  // ← BUG AQUÍ
        .collect(Collectors.toList());
    return ResponseEntity.ok(mapper.toDtoList(syllabi));
}

// ✅ CORRECTO
@GetMapping
public ResponseEntity<List<SyllabusDTO>> getAllSyllabi() {
    List<Syllabus> syllabi = syllabusService.findAll();
    return ResponseEntity.ok(mapper.toDtoList(syllabi));
}
```

**O en la query de BD:**

```java
// ❌ INCORRECTO
@Query("SELECT s FROM Syllabus s LIMIT 4")  // O .setMaxResults(4)

// ✅ CORRECTO
@Query("SELECT s FROM Syllabus s WHERE s.softDeleted = false")
```

---

## ✅ Solución: Corregir el Backend

### Opción 1: Si el bug está en el controlador

**Archivo:** `/tmp/siladocs-backend/src/main/java/com/siladocs/application/controller/SyllabusController.java`

```java
// Busca esta línea:
.limit(4)

// Reemplázala con nada (elimina esa línea)
// O aumenta a un número grande:
.limit(1000)
```

### Opción 2: Si el bug está en la query de BD

**Archivo:** `/tmp/siladocs-backend/src/main/java/com/siladocs/application/repository/SyllabusRepository.java`

```java
// Busca:
setMaxResults(4)

// Reemplaza con:
setMaxResults(1000)
```

---

## 🚀 Después de Corregir

### 1. Recompilar el backend

```bash
cd /tmp/siladocs-backend
mvn clean package -DskipTests
```

### 2. Desplegar a Azure

```bash
# Opción A: GitHub Action automático (si está configurado)
git push origin main

# Opción B: Azure CLI
az webapp up --name siladocs-backend-ejfkddf7fkgucrh6

# Opción C: Copiar JAR manualmente
cp target/siladocs-backend.jar /ruta/deployment/
```

### 3. Verificar el fix

```bash
# Ejecutar el script de debugging nuevamente
./scripts/debug-syllabi-api.sh

# Debería mostrar:
# 📊 Total items en respuesta: 15 (o el número real)
# ✅ Más de 4 items (funcionamiento normal)
```

---

## 📋 Checklist de Debugging

- [ ] ✅ Confirmé que la API devuelve exactamente 4 sílabos (F12 Console)
- [ ] ✅ Ejecuté el script `debug-syllabi-api.sh` y confirmó el problema
- [ ] ✅ Localicé el código problemático en el backend
- [ ] ✅ Encontré `.limit(4)` o `LIMIT 4` en el código
- [ ] ✅ Removí o aumenté el límite
- [ ] ✅ Recompilé el backend con `mvn clean package`
- [ ] ✅ Desplegué los cambios a Azure
- [ ] ✅ Ejecuté el script nuevamente y verificó que ahora devuelve > 4 items
- [ ] ✅ Recargué la página en el navegador y verifico que se muestran todos los sílabos

---

## 🆘 Solución de Problemas

### "No encuentro el código de `.limit(4)`"

Ejecuta:
```bash
cd /tmp/siladocs-backend
find src -type f -name "*.java" -exec grep -l "limit(4)\|LIMIT 4\|setMaxResults(4)" {} \;
```

### "El script dice que la API no responde"

Verifica que el backend está corriendo:
```bash
curl -I https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/actuator/health
# Debería devolver HTTP 200
```

### "Corregí pero sigue mostrando 4"

1. Verifica que el cambio se guardó:
   ```bash
   grep -n "limit\|LIMIT" src/main/java/com/siladocs/application/controller/SyllabusController.java
   ```

2. Limpia la caché del frontend:
   ```bash
   # En el navegador, abre DevTools (F12)
   # Click derecho en el botón de Refrescar
   # Selecciona "Vaciar caché e Refrescar"
   ```

3. Espera a que Azure haya desplegado los cambios (2-3 minutos)

---

## 📚 Referencias

- **Documento de investigación:** `INVESTIGACION_LIMITE_4_SILABOS.md`
- **Herramienta de debug frontend:** `shared/pages/debug-syllabi.tsx`
- **Script de test:** `scripts/debug-syllabi-api.sh`
- **Servicio mejorado:** `shared/services/syllabi.service.ts` (con logging)

---

## ✨ Próximos Pasos

1. ✅ Recopila evidencia del problema (logs)
2. ⏳ Localiza y corrige el código del backend
3. ⏳ Despliega los cambios
4. ⏳ Verifica que ahora se muestran todos los sílabos
5. ⏳ Prueba la funcionalidad completa

---

**Última actualización:** 2026-06-20  
**Estado:** En Investigación 🔍
