#!/bin/bash

# SSL Certificate Renewal Check Script
# Run this to manually check and renew certificates

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔐 SSL Sertifika Durumu Kontrolü${NC}\n"

# Check certificates
echo -e "${YELLOW}📋 Mevcut Sertifikalar:${NC}"
sudo certbot certificates

echo -e "\n${YELLOW}🔄 Yenileme Kontrolü (dry-run):${NC}"
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Sertifika yenileme testi başarılı!${NC}"
    echo -e "${GREEN}Sertifikalar otomatik olarak yenilenecek.${NC}"
else
    echo -e "\n${RED}❌ Sertifika yenileme testi başarısız!${NC}"
    echo -e "${YELLOW}Manuel müdahale gerekebilir.${NC}"
fi

# Check SSL expiry
echo -e "\n${YELLOW}📅 Sertifika Son Kullanma Tarihleri:${NC}"
sudo certbot certificates | grep -E "(Certificate Name|Expiry Date)"

# Check if renewal cron job exists
echo -e "\n${YELLOW}⏰ Otomatik Yenileme Cron Job:${NC}"
if sudo crontab -l | grep -q "certbot renew"; then
    echo -e "${GREEN}✅ Cron job aktif${NC}"
    sudo crontab -l | grep "certbot renew"
else
    echo -e "${RED}⚠️  Cron job bulunamadı!${NC}"
    echo -e "${YELLOW}Otomatik yenileme için cron job ekleyin:${NC}"
    echo -e "0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'"
fi

echo -e "\n${YELLOW}💡 Yararlı Komutlar:${NC}"
echo -e "  Manual yenile:        ${GREEN}sudo certbot renew${NC}"
echo -e "  Force yenileme:       ${GREEN}sudo certbot renew --force-renewal${NC}"
echo -e "  Nginx reload:         ${GREEN}sudo systemctl reload nginx${NC}"
echo -e "  SSL test (browser):   ${GREEN}https://www.ssllabs.com/ssltest/${NC}"
