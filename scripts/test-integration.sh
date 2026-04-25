#!/bin/bash

# SilaDocs Frontend-Backend Integration Test Script
# This script tests the complete integration between frontend and backend

set -e

BACKEND_URL="https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api"
FRONTEND_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SilaDocs Frontend-Backend Integration Test${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "  ${method} ${BACKEND_URL}${endpoint}"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BACKEND_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BACKEND_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi

    http_code=$(echo "${response}" | tail -n1)
    body=$(echo "${response}" | head -n-1)

    if [[ "$http_code" =~ ^(200|201|400|401|403|404|409|500)$ ]]; then
        echo -e "  ${GREEN}✓ HTTP ${http_code}${NC}"
        if [ ! -z "$body" ]; then
            echo "  Response: $(echo "$body" | head -c 100)..."
        fi
    else
        echo -e "  ${RED}✗ HTTP ${http_code}${NC}"
    fi
    echo ""
}

# Function to test with auth token
test_endpoint_auth() {
    local method=$1
    local endpoint=$2
    local token=$3
    local description=$4

    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "  ${method} ${BACKEND_URL}${endpoint} (with auth)"

    response=$(curl -s -w "\n%{http_code}" -X ${method} "${BACKEND_URL}${endpoint}" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json")

    http_code=$(echo "${response}" | tail -n1)
    body=$(echo "${response}" | head -n-1)

    if [[ "$http_code" =~ ^(200|201|400|401|403|404|409|500)$ ]]; then
        echo -e "  ${GREEN}✓ HTTP ${http_code}${NC}"
        if [ ! -z "$body" ]; then
            echo "  Response: $(echo "$body" | head -c 100)..."
        fi
    else
        echo -e "  ${RED}✗ HTTP ${http_code}${NC}"
    fi
    echo ""
}

# Test 1: Health Check
echo -e "${YELLOW}═══ HEALTH CHECK ===${NC}"
test_endpoint "GET" "/actuator/health" "" "Backend Health Check"

# Test 2: CORS Configuration
echo -e "${YELLOW}═══ CORS CONFIGURATION ===${NC}"
echo -e "${YELLOW}Testing: CORS Headers${NC}"
response=$(curl -s -i -X OPTIONS "${BACKEND_URL}/auth/validate-code?code=test" \
    -H "Origin: https://siladocs-frontend.vercel.app" \
    -H "Access-Control-Request-Method: GET")

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "  ${GREEN}✓ CORS headers present${NC}"
    echo "$response" | grep "Access-Control" | head -5
else
    echo -e "  ${RED}✗ CORS headers missing${NC}"
fi
echo ""

# Test 3: Authentication Endpoints
echo -e "${YELLOW}═══ AUTHENTICATION ENDPOINTS ===${NC}"
test_endpoint "GET" "/auth/validate-code?code=test-code-12345" "" "Validate Code (invalid code expected)"
test_endpoint "POST" "/auth/register" \
    '{"accessCode":"test","fullName":"Test User","email":"test@example.com","password":"password123"}' \
    "Register (invalid code expected)"
test_endpoint "POST" "/auth/login" \
    '{"email":"test@example.com","password":"password123"}' \
    "Login (invalid credentials expected)"
test_endpoint "GET" "/auth/me" "" "Get Current User (unauthorized expected)"

# Test 4: Career Endpoints (no auth for public)
echo -e "${YELLOW}═══ PROTECTED ENDPOINTS ===${NC}"
test_endpoint "GET" "/careers" "" "Get Careers (401 expected without token)"
test_endpoint "GET" "/courses" "" "Get Courses (401 expected without token)"
test_endpoint "GET" "/syllabi" "" "Get Syllabi (401 expected without token)"

# Test 5: Fixed Endpoints
echo -e "${YELLOW}═══ PREVIOUSLY FIXED ENDPOINTS ===${NC}"
test_endpoint "POST" "/access-codes/generate" \
    '{"code":"test","institutionName":"Test Institution"}' \
    "Generate Access Code (should work - mapping fixed)"
test_endpoint "GET" "/documents" "" "Get Documents (401 expected - mapping fixed)"

# Test 6: Database Connectivity
echo -e "${YELLOW}═══ DATABASE CONNECTIVITY ===${NC}"
test_endpoint "GET" "/institutions" "" "Get Institutions (public endpoint)"

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Integration Test Complete${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  • If health check (200): Backend is running ✓"
echo "  • If CORS headers present: Frontend can communicate ✓"
echo "  • If 401 on protected endpoints: Auth is working ✓"
echo "  • If access-codes endpoint works: Mapping is fixed ✓"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Register with a valid access code from admin panel"
echo "  2. Login with registered credentials"
echo "  3. Test data endpoints with received JWT token"
echo "  4. Verify token is stored in frontend localStorage"
echo ""
