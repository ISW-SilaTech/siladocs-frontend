# Quick Start - Blockchain Syllabus Registration

**¿Quieres que el sistema funcione AHORA? Sigue esto.**

---

## 1️⃣ El Problema (en 30 segundos)

```
Azure App Service → ❌ (timeout) → Fabric API on VM
                    (30 segundos)
```

La conexión está bloqueada por firewall/NSG.

---

## 2️⃣ La Solución (3 pasos)

### PASO A: Verifica Conectividad (Azure Cloud Shell)
```bash
# En: portal.azure.com → Cloud Shell (esquina superior derecha)
curl --max-time 10 http://20.38.34.192:8000/health
```

**Resultado esperado:** HTTP 200 con `{"status":"UP"}`

**Si timeout o error:** → Ir a PASO B

---

### PASO B: Abre Puerto en NSG (Azure Portal)
```
1. Busca "Network Security Groups"
2. Selecciona el de tu VM
3. "Inbound security rules" → "+ Add"
4. Configura:
   Source: Any
   Port: 8000
   Protocol: TCP
   Action: Allow
5. Click "Add"
6. Espera 2 minutos
```

**Repite PASO A para verificar**

---

### PASO C: Redeploy Backend
```
Azure Portal → App Service → Deployment Center
→ Click "Sync" o "Redeploy"
→ Espera 3 minutos
```

O si tienes CI/CD en GitHub:
```bash
git push  # Esto dispara auto-deploy
```

---

## 3️⃣ Prueba el Sistema

### Test 1: Health Endpoint
```bash
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric
```

Debe retornar:
```json
{
  "status": "UP",
  "fabric_available": true
}
```

### Test 2: Upload en Frontend
1. Abre: https://siladocs-frontend.vercel.app
2. Login: `rector@demo.local / rector123`
3. Vai a: Gestión → Silabos
4. Sube un PDF
5. Observa eventos de blockchain en tiempo real
6. ¡Listo! ✅

### Test 3: Ver Trazabilidad
1. Click "Ver Trazabilidad"
2. Verifica que aparece el documento
3. El hash debe estar ahí
4. Transaction ID también

---

## 📚 Documentación Completa

| Documento | Para Qué | Leer Si... |
|-----------|----------|-----------|
| **SETUP_BLOCKCHAIN_FINAL_STEPS.md** | Guía paso a paso | Necesitas más detalles sobre los 3 pasos |
| **NETWORK_DIAGNOSTIC_GUIDE.md** | Troubleshooting NSG/Firewall | El `curl` sigue fallando |
| **E2E_TESTING_GUIDE.md** | Testing completo (6 fases) | Quieres validar TODO funciona |
| **BLOCKCHAIN_SETUP_STATUS.md** | Estado actual del proyecto | Quieres entender qué está hecho/pendiente |

---

## ⏱️ Tiempo Esperado

- PASO A: 2 minutos
- PASO B: 5 minutos (+ 2 min espera)
- PASO C: 5 minutos (+ 3 min deploy)
- Test: 5 minutos

**Total: ~25-30 minutos**

---

## 🆘 Si Algo Falla

### `curl` sigue fallando (Timeout)
1. Verifica que el NSG tiene regla para puerto 8000
2. Verifica firewall en VM: `ssh azureuser@20.38.34.192`
   ```bash
   docker ps | grep fabric-api  # ¿Corre?
   sudo netstat -tlnp | grep 8000  # ¿Escucha?
   ```
3. Reinicia contenedor: `docker restart fabric-api`

### Upload en frontend falla
1. Abre DevTools (F12) → Console
2. ¿Ves errores? Cópialo
3. Verifica health endpoint nuevamente

### "Connection refused"
- Firewall en la VM está bloqueando
- En VM: `sudo ufw allow 8000` (si tienes UFW)
- O verifica `iptables` rules

---

## ✅ Checklist Final

- [ ] `curl` retorna 200 OK
- [ ] Health endpoint muestra `fabric_available: true`
- [ ] Backend redeployed
- [ ] Upload de PDF funciona
- [ ] Eventos de blockchain aparecen en tiempo real
- [ ] Documento aparece en blockchain dashboard

**Si todo ✅ = Sistema Funcional**

---

## 🚀 Próximos Pasos (Después Funcional)

1. Configurar monitoreo (Azure Application Insights)
2. Crear usuarios finales (no demo)
3. Documentación para usuarios
4. Preparar presentación/demo

---

## 📞 Ayuda Rápida

**Error:** `connection timed out`  
**Solución:** PASO B - Abre NSG puerto 8000

**Error:** `fabric_available: false`  
**Solución:** Repite PASO A y PASO B

**Error:** Upload se queda 30 segundos  
**Solución:** PASO A está fallando, resolver primero

**Error:** Eventos no aparecen en tiempo real  
**Solución:** Verificar que Backend está actualizado (PASO C)

---

## 🎓 Entender lo Que Está Pasando

```
User → Frontend (Vercel) → Backend (Azure) → Fabric (VM)
                              ↓
                         ❌ NSG Bloqueando Puerto 8000
                         ✅ Después de PASO B: Abierto
                         ✅ Después de PASO C: Deploy OK
                         ✅ Upload funciona E2E
```

**TL;DR:** Abre puerto 8000 en NSG, redeploy, listo.

---

**Última actualización:** 2026-05-07  
**Rama:** claude/setup-blockchain-vm-zBTZG  
**Estado:** 90% funcional, esperando PASO A/B
