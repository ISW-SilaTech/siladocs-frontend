# SilaDocs · Fabric Network en Azure VM

## 1. Crear la VM en Azure (una sola vez)

```bash
# Desde Azure CLI local o Azure Cloud Shell
az group create --name siladocs-rg --location eastus

az vm create \
  --resource-group siladocs-rg \
  --name siladocs-fabric \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Abrir puertos necesarios
az vm open-port --resource-group siladocs-rg --name siladocs-fabric --port 22 --priority 100
az vm open-port --resource-group siladocs-rg --name siladocs-fabric --port 7050 --priority 200
az vm open-port --resource-group siladocs-rg --name siladocs-fabric --port 7051 --priority 300
az vm open-port --resource-group siladocs-rg --name siladocs-fabric --port 8000 --priority 400

# Obtener IP pública
az vm show -d --resource-group siladocs-rg --name siladocs-fabric --query publicIps -o tsv
```

## 2. Instalar dependencias en la VM

```bash
ssh azureuser@<IP-PUBLICA>

# Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

## 3. Subir el directorio fabric-network a la VM

```bash
# Desde tu máquina local:
scp -r ./fabric-network azureuser@<IP-PUBLICA>:~/siladocs-fabric
ssh azureuser@<IP-PUBLICA>
cd ~/siladocs-fabric
chmod +x start.sh
```

## 4. Iniciar la red

```bash
./start.sh
```

El script:
1. Genera certificados (cryptogen)
2. Crea el bloque génesis (configtxgen)
3. Levanta orderer, peer, CouchDB y CA
4. Crea el canal `silabos-channel`
5. Despliega el chaincode `silabos-cc`
6. Levanta la Fabric API REST en `:8000`

## 5. Configurar el backend Spring Boot

En Azure App Service → Configuration → Application Settings:

```
FABRIC_API_URL=http://<IP-PUBLICA>:8000
BLOCKCHAIN_MOCK_ENABLED=false
```

## 6. Verificar que todo funciona

```bash
# Desde cualquier máquina:
curl http://<IP-PUBLICA>:8000/health
# Esperado: {"status":"UP","peer":"peer0.org1.siladocs.com:7051",...}

# Desde el frontend, sube un sílabo y observa el log en tiempo real.
```

## 7. Ver CouchDB (ledger visual)

```
http://<IP-PUBLICA>:5984/_utils
Usuario: admin  Contraseña: adminpw
Base de datos: silabos-channel_silabos-cc
```

## Costos estimados

| Recurso | Tamaño | Precio/mes |
|---------|--------|-----------|
| Azure VM Standard_B2s | 2 vCPU / 4 GB RAM | ~$30 |
| Disk OS (P6) | 64 GB | ~$5 |
| IP Pública | Static | ~$4 |
| **Total** | | **~$39/mes** |

## Detener la red

```bash
# En la VM:
docker compose down          # detiene pero guarda datos
docker compose down -v       # detiene y borra ledger (reset completo)
```
