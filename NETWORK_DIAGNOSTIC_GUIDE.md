# Red Blockchain - Guía de Diagnóstico de Conectividad

## Problema Actual
- **Síntoma**: Backend (Azure App Service) no puede conectar con Fabric API (VM en 20.38.34.192:8000)
- **Error**: `connection timed out after 30000 ms`
- **Estado de Fabric**: ✅ API funciona localmente en la VM
- **Estado de Backend**: ⚠️ Recibe peticiones, pero no puede alcanzar Fabric

## Paso 1: Verificar NSG en la VM (Network Security Group)

**Ubicación Azure Portal:**
1. Portal.azure.com → Buscar "Network Security Groups"
2. Selecciona el NSG asociado a tu VM (likely `fabric-network-nsg` o similar)
3. Menú izquierdo → "Inbound security rules"

**Qué buscar:**
- ¿Existe regla que permita puerto **8000**?
- ¿Desde cuál origen? Necesita:
  - Origen: `Any` (recomendado para testing)
  - O: Rango de IPs de Azure App Service

**Si falta la regla:**
1. Click "+ Add"
2. Configurar:
   - Source: `Any` (o especificar App Service IP)
   - Destination port: `8000`
   - Protocol: `TCP`
   - Action: `Allow`
3. Click "Add"

---

## Paso 2: Verificar Firewall en la VM

**En la VM por SSH:**

```bash
# Si es Ubuntu/Linux - Verificar iptables
sudo iptables -L -n | grep 8000
# Debería estar ACCEPT, si no:
sudo ufw allow 8000
sudo ufw reload

# Verificar que el puerto está escuchando
netstat -tlnp | grep 8000
# O si tienes Docker:
docker ps
```

---

## Paso 3: Probar Conectividad desde App Service

**Opción A: Usar Azure Cloud Shell (sin SSH requerido)**
```bash
# En Azure Cloud Shell
curl -v --max-time 10 http://20.38.34.192:8000/health
```

**Opción B: Desde App Service Console**
1. Portal.azure.com → App Service → Development tools → SSH
2. O usar Kudu console (https://<your-app>.scm.azurewebsites.net/api/command)
3. Ejecutar:
```bash
curl -v --max-time 10 http://20.38.34.192:8000/health
```

**Resultados esperados:**
- ✅ Conexión exitosa: HTTP 200 con `{"status":"UP"}`
- ❌ Connection refused: Puerto no aceptando conexiones (Firewall o aplicación no está escuchando)
- ❌ Timeout (10s): NSG bloqueando o routing issues

---

## Paso 4: Verificar Conectividad de App Service

**IP saliente de App Service:**
1. Portal.azure.com → App Service → Networking → Outbound IP addresses
2. Anota estas IPs
3. Verifica que el NSG de la VM permite desde estas IPs:
   - Ir a NSG → Inbound security rules
   - Agregar regla si es necesario con origen = IPs de App Service

---

## Paso 5: Alternativas si hay Firewall de Azure

**Si App Service está en VNet diferente:**
- Opción 1: Usar Azure Private Endpoint (recomendado)
- Opción 2: Usar Azure Service Bus / Event Hub (para comunicación indirecta)
- Opción 3: Abrir acceso público (menos seguro)

---

## Paso 6: Validar Cambios

Una vez hagas cambios en NSG o firewall:
1. Espera 1-2 minutos (puede haber caching)
2. Prueba nuevamente desde App Service Console
3. Intenta subir un sílabo en el frontend

---

## Endpoints de Diagnóstico en Backend

El backend ahora tiene tres endpoints de health check que puedes probar:

### 1. Health Check General
```bash
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health
```

Respuesta esperada:
```json
{
  "timestamp": "2026-05-07T...",
  "status": "UP",
  "application": "SilaDocs Backend",
  "fabric_available": true
}
```

### 2. Health Check de Fabric (Simple)
```bash
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric
```

Respuesta esperada si está bien:
```json
{
  "timestamp": "2026-05-07T...",
  "status": "UP",
  "service": "Hyperledger Fabric",
  "message": "API disponible"
}
```

Respuesta si falla (503):
```json
{
  "status": "DOWN",
  "service": "Hyperledger Fabric",
  "message": "No se pudo conectar con la API de Fabric"
}
```

### 3. Health Check de Fabric (Detallado)
```bash
curl https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api/health/fabric/detail
```

Respuesta esperada:
```json
{
  "timestamp": "2026-05-07T...",
  "service": "Hyperledger Fabric",
  "details": "Fabric API Status Report\n==================================================\n..."
}
```

**Si `fabric_available` o el status es `DOWN`:**
1. La API de Fabric en 20.38.34.192:8000 no es alcanzable desde el App Service
2. Procede a verificar NSG y firewall según los pasos anteriores
3. Una vez arreglado, los endpoints deberían mostrar `"status": "UP"`

---

## Checklist Rápido

- [ ] NSG permite puerto 8000 (entrada)
- [ ] Firewall VM permite puerto 8000
- [ ] `netstat` o `docker ps` muestra el servicio escuchando
- [ ] `curl` desde App Service Console funciona
- [ ] Endpoint `/blockchain/health` retorna `fabricAvailable: true`
- [ ] Intentar subida de sílabo nuevamente

---

## Próximos Pasos

1. Ejecuta el checklist arriba
2. Reporta qué falló en el paso de `curl` desde App Service
3. Una vez que `curl` funcione, redeploy del backend (o simplemente espera 2 min)
4. Intenta subida nuevamente desde frontend
