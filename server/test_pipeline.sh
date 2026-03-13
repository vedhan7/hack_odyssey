#!/bin/bash
echo "=== Phase 5 Backend Integration Test ==="

# 1. Login as Admin
echo "\n[1] Logging in as Admin..."
LOGIN_RES=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu", "password":"password123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "JWT Extracted: ${TOKEN:0:15}..."

# 2. Upload Original Cert as Admin
echo "\n[2] Uploading Original Certificate as Admin (Server-side hash generation)..."
curl -s -X POST http://localhost:3001/api/admin/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@test_cert.pdf" \
  -F "studentName=John Doe" \
  -F "degree=B.Tech"

# 3. Verify exactly the same file as Public User
echo "\n\n[3] User verifying the ORIGINAL file..."
curl -s -X POST http://localhost:3001/api/verify \
  -F "document=@test_cert.pdf"

# 4. Verify a tampered file
echo "\n\n[4] User verifying a TAMPERED file..."
curl -s -X POST http://localhost:3001/api/verify \
  -F "document=@fake_cert.pdf"

echo "\n\n=== Test Complete ==="
