#!/usr/bin/env bash
set -euo pipefail
API_BASE=${API_BASE:-http://localhost:3000}

echo "==> Login (dev) to get JWT"
JWT=$(curl -s -X POST "$API_BASE/auth/login"   -H "Content-Type: application/json"   -d '{"email":"dev@auren.local","role":"OWNER"}' | jq -r '.token // .jwt // .accessToken')
if [ -z "$JWT" ] || [ "$JWT" = "null" ]; then echo "Error: No JWT returned"; exit 1; fi

echo "==> Create project"
PROJECT_ID=$(curl -s -X POST "$API_BASE/projects"   -H "Content-Type: application/json" -H "Authorization: Bearer $JWT"   -d '{"name":"E2E Project","ownerId":"dev-owner"}' | jq -r '.id')

echo "==> Create component"
COMPONENT_ID=$(curl -s -X POST "$API_BASE/components"   -H "Content-Type: application/json" -H "Authorization: Bearer $JWT"   -d "{"projectId":"$PROJECT_ID","name":"Deals","fields":[{"key":"title","type":"text","label":"Title","required":true},{"key":"amount","type":"number","label":"Amount"}]}"   | jq -r '.id')

echo "PROJECT_ID=$PROJECT_ID"
echo "COMPONENT_ID=$COMPONENT_ID"
