#!/bin/bash

# API Testing Script for AIditor
# Usage: ./test-api.sh [BASE_URL]
# Example: ./test-api.sh http://localhost:8787

BASE_URL=${1:-"http://localhost:8787"}

echo "Testing AIditor API at: $BASE_URL"
echo "========================================"

# Test Health Check
echo -e "\n1. Health Check"
curl -s "$BASE_URL/" | jq .

# Test Materials API
echo -e "\n2. Create Material"
MATERIAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/materials" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article from Curl",
    "body": "This is a test article body.",
    "source": "https://example.com",
    "tags": "test,curl,demo",
    "status": "pending"
  }')
echo "$MATERIAL_RESPONSE" | jq .
MATERIAL_ID=$(echo "$MATERIAL_RESPONSE" | jq -r '.data.id')

echo -e "\n3. List Materials"
curl -s "$BASE_URL/api/materials?limit=5" | jq .

if [ -n "$MATERIAL_ID" ] && [ "$MATERIAL_ID" != "null" ]; then
  echo -e "\n4. Get Material by ID: $MATERIAL_ID"
  curl -s "$BASE_URL/api/materials/$MATERIAL_ID" | jq .

  echo -e "\n5. Update Material Status"
  curl -s -X PUT "$BASE_URL/api/materials/$MATERIAL_ID" \
    -H "Content-Type: application/json" \
    -d '{"status": "processed"}' | jq .

  echo -e "\n6. Get Updated Material"
  curl -s "$BASE_URL/api/materials/$MATERIAL_ID" | jq .
fi

echo -e "\n7. List Materials with Status Filter"
curl -s "$BASE_URL/api/materials?status=processed" | jq .

# Test To-Publish API
echo -e "\n8. Create To-Publish Record"
TO_PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/to-publish" \
  -H "Content-Type: application/json" \
  -d '{
    "final_title": "Final Title from Curl",
    "final_body": "This is the final processed content.",
    "platform": "wechat",
    "review_status": "pending"
  }')
echo "$TO_PUBLISH_RESPONSE" | jq .
TO_PUBLISH_ID=$(echo "$TO_PUBLISH_RESPONSE" | jq -r '.data.id')

echo -e "\n9. List To-Publish Records"
curl -s "$BASE_URL/api/to-publish?limit=5" | jq .

if [ -n "$TO_PUBLISH_ID" ] && [ "$TO_PUBLISH_ID" != "null" ]; then
  echo -e "\n10. Get To-Publish Record by ID: $TO_PUBLISH_ID"
  curl -s "$BASE_URL/api/to-publish/$TO_PUBLISH_ID" | jq .

  echo -e "\n11. Update Review Status to Approved"
  curl -s -X PUT "$BASE_URL/api/to-publish/$TO_PUBLISH_ID" \
    -H "Content-Type: application/json" \
    -d '{"review_status": "approved"}' | jq .

  echo -e "\n12. Get Updated To-Publish Record"
  curl -s "$BASE_URL/api/to-publish/$TO_PUBLISH_ID" | jq .
fi

echo -e "\n13. List To-Publish Records with Platform Filter"
curl -s "$BASE_URL/api/to-publish?platform=wechat" | jq .

echo -e "\n14. List To-Publish Records with Review Status Filter"
curl -s "$BASE_URL/api/to-publish?review_status=approved" | jq .

echo -e "\n========================================"
echo "Testing Complete!"
