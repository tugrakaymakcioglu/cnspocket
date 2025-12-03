#!/bin/bash

# Health Check Script for NotVarmı
# Checks if the application is running and healthy

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_URL="http://localhost:3000"
HEALTH_ENDPOINT="/api/health"

echo -e "${YELLOW}🔍 Checking application health...${NC}\n"

# Check if application is responding
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "${APP_URL}${HEALTH_ENDPOINT}")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Application is healthy!${NC}"
    
    # Get detailed health info
    HEALTH_DATA=$(curl -s "${APP_URL}${HEALTH_ENDPOINT}")
    echo -e "\n${YELLOW}Health Details:${NC}"
    echo "$HEALTH_DATA" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_DATA"
    
    exit 0
else
    echo -e "${RED}❌ Application is NOT healthy!${NC}"
    echo -e "${RED}HTTP Status: $HTTP_STATUS${NC}"
    
    # Check if PM2 process is running
    if command -v pm2 &> /dev/null; then
        echo -e "\n${YELLOW}PM2 Status:${NC}"
        pm2 status notvarmi
    fi
    
    exit 1
fi
