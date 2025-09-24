#!/bin/bash

echo "🧪 Testing DoneDep APIs..."
echo "================================"

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:3001/health | jq '.'
echo ""

# Test 2: Create Deployment
echo "2. Testing Deployment Creation..."
DEPLOYMENT_RESPONSE=$(curl -s -X POST http://localhost:3001/deployment/create \
  -H "Content-Type: application/json" \
  -d '{"repositoryUrl": "https://github.com/test/react-app.git", "testEmail": "test@example.com"}')

echo "$DEPLOYMENT_RESPONSE" | jq '.'
PROJECT_ID=$(echo "$DEPLOYMENT_RESPONSE" | jq -r '.projectId')
echo "Project ID: $PROJECT_ID"
echo ""

# Test 3: Get Deployment Status
echo "3. Testing Deployment Status..."
curl -s "http://localhost:3001/deployment/$PROJECT_ID" | jq '.deployment.components[] | {name: .name, type: .type, status: .status}'
echo ""

# Test 4: Deploy a Component
echo "4. Testing Component Deployment..."
curl -s -X POST "http://localhost:3001/deployment/$PROJECT_ID/component/frontend/deploy" \
  -H "Content-Type: application/json" \
  -d '{"provider": "vercel", "region": "us-east-1"}' | jq '.'
echo ""

# Test 5: Set Test Email
echo "5. Testing Test Email Configuration..."
curl -s -X POST "http://localhost:3001/deployment/$PROJECT_ID/test-email" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}' | jq '.'
echo ""

echo "✅ API Tests Complete!"
echo "Now test the frontend at: http://localhost:3000"
