#!/bin/bash

echo "🚀 Testing Frontend Integration with User Service"
echo "=============================================="

# Test user service health
echo "1. Testing User Service Health..."
curl -s http://localhost:3001/health | jq '.' || echo "User service not responding"

echo -e "\n2. Testing Frontend React App..."
curl -s http://localhost:3002 | head -5 || echo "Frontend not responding"

echo -e "\n3. Test User Registration..."
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "test123",
    "phone": "1234567890"
  }' | jq '.' || echo "Registration failed"

echo -e "\n✅ Integration test complete!"
