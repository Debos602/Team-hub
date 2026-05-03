#!/usr/bin/env bash
# Quick refresh flow test script. Update EMAIL, PASSWORD, and WORKSPACE_ID before running.

BASE="http://localhost:5000/api/v1"
COOKIEJAR="./tmp_cookies.txt"
EMAIL="test@example.com"
PASSWORD="password"
WORKSPACE_ID="fb8a5081-0737-4da7-8e38-32c94532541a"

set -e

echo "Removing old cookie jar"
rm -f "$COOKIEJAR"

echo "1) Login (saves httpOnly cookies to $COOKIEJAR)"
curl -i -c "$COOKIEJAR" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

echo -e "\n2) Call protected endpoint (should succeed)"
curl -i -b "$COOKIEJAR" "$BASE/goals/workspace/$WORKSPACE_ID"

echo -e "\n3) Trigger refresh-token using cookie (server should rotate refresh token)"
curl -i -b "$COOKIEJAR" -X POST "$BASE/auth/refresh-token" -H "Content-Type: application/json" -d "{}"

echo -e "\n4) Trigger invalid refresh (expected 401)"
curl -i -b "$COOKIEJAR" -X POST "$BASE/auth/refresh-token" -H "Content-Type: application/json" -d "{\"refreshToken\":\"invalid\"}"

echo -e "\nDone. Remove $COOKIEJAR when finished."
