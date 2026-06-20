#!/bin/bash

# Script de debugging para investigar el problema de límite en sílabos
# Uso: ./scripts/debug-syllabi-api.sh

echo "🔍 Debugging API de Sílabos"
echo "================================="
echo ""

# Detectar si está en desarrollo o producción
if [ -z "$1" ]; then
    API_URL="https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api"
    echo "📍 URL: Producción (Azure)"
else
    API_URL="$1"
    echo "📍 URL: Custom - $API_URL"
fi

echo "API_URL: $API_URL/syllabi"
echo ""

# Función para fazer curl con manejo de errores
function test_endpoint() {
    local endpoint="$1"
    local description="$2"

    echo "📌 Test: $description"
    echo "Endpoint: $endpoint"
    echo ""

    response=$(curl -s -w "\n%{http_code}" "$endpoint" -H "Content-Type: application/json")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    echo "HTTP Status: $http_code"
    echo ""

    if [ "$http_code" -eq 200 ]; then
        echo "✅ Response received"

        # Contar items si es un array
        if echo "$body" | grep -q "^\["; then
            count=$(echo "$body" | grep -o '"id"' | wc -l)
            echo "📊 Total items en respuesta: $count"
            echo ""

            if [ "$count" -eq 4 ]; then
                echo "⚠️  PROBLEMA DETECTADO: La API devuelve exactamente 4 items"
                echo "   Esto sugiere un LIMIT 4 en el backend"
            elif [ "$count" -lt 4 ]; then
                echo "✅ Menos de 4 items (número correcto)"
            else
                echo "✅ Más de 4 items (funcionamiento normal)"
            fi
        fi

        echo ""
        echo "📄 Primeros 500 caracteres de la respuesta:"
        echo "---"
        echo "$body" | head -c 500
        echo ""
        echo "---"
    else
        echo "❌ Error HTTP $http_code"
        echo "$body"
    fi

    echo ""
    echo "================================="
    echo ""
}

# Test 1: Sin parámetros
test_endpoint "$API_URL/syllabi" "GET /syllabi (sin parámetros)"

# Test 2: Con paginación (si el backend soporta)
test_endpoint "$API_URL/syllabi?page=0&size=100" "GET /syllabi?page=0&size=100 (con paginación)"

# Test 3: Con límite
test_endpoint "$API_URL/syllabi?limit=100" "GET /syllabi?limit=100 (con límite)"

echo "🔧 Comandos útiles para el backend:"
echo ""
echo "# Buscar LIMIT en el código:"
echo "grep -rn \"LIMIT 4\" /tmp/siladocs-backend/src/"
echo ""
echo "# Buscar limit(4):"
echo "grep -rn \"limit(4)\" /tmp/siladocs-backend/src/"
echo ""
echo "# Ver el SyllabusController:"
echo "cat /tmp/siladocs-backend/src/main/java/com/siladocs/application/controller/SyllabusController.java"
echo ""
echo "✅ Debug completado. Revisa los resultados arriba."
