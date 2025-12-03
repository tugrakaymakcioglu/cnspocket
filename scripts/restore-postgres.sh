#!/bin/bash

# PostgreSQL Restore Script for NotVarmı
# Usage: ./restore.sh [backup_file]
# Example: ./restore.sh /backup/notvarmi/backup_20251201_120000.sql.gz

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="notvarmi_db"
DB_USER="notvarmi_user"
DB_HOST="localhost"
BACKUP_DIR="/backup/notvarmi"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PostgreSQL Restore - NotVarmı        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 Mevcut backup dosyaları:${NC}\n"
    ls -lht "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -10
    echo -e "\n${RED}❌ Hata: Backup dosyası belirtilmedi!${NC}"
    echo -e "${YELLOW}Kullanım: ./restore.sh [backup_dosyası]${NC}"
    echo -e "${YELLOW}Örnek: ./restore.sh /backup/notvarmi/backup_20251201_120000.sql.gz${NC}"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Hata: Backup dosyası bulunamadı: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  DİKKAT: Bu işlem mevcut veritabanını SİLECEK!${NC}"
echo -e "${YELLOW}📁 Restore edilecek dosya: $BACKUP_FILE${NC}"
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${YELLOW}📊 Dosya boyutu: $FILE_SIZE${NC}\n"

# Ask for confirmation
read -p "$(echo -e ${RED}Devam etmek istediğinize emin misiniz? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ İşlem iptal edildi.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}🔄 Restore işlemi başlatılıyor...${NC}"

# Stop the application first (if using PM2)
echo -e "${YELLOW}⏸️  Uygulama durduruluyor...${NC}"
pm2 stop notvarmi 2>/dev/null

# Drop and recreate database
echo -e "${YELLOW}🗑️  Mevcut veritabanı siliniyor...${NC}"
if dropdb -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Veritabanı silindi.${NC}"
else
    echo -e "${YELLOW}⚠️  Veritabanı silinemedi (belki zaten yoktu).${NC}"
fi

echo -e "${YELLOW}🆕 Yeni veritabanı oluşturuluyor...${NC}"
if createdb -U "$DB_USER" -h "$DB_HOST" "$DB_NAME"; then
    echo -e "${GREEN}✅ Veritabanı oluşturuldu.${NC}"
else
    echo -e "${RED}❌ Veritabanı oluşturulamadı!${NC}"
    exit 1
fi

# Restore from backup
echo -e "${YELLOW}📥 Backup dosyası restore ediliyor...${NC}"
if [[ $BACKUP_FILE == *.gz ]]; then
    # Compressed backup
    if gunzip -c "$BACKUP_FILE" | psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Restore başarılı!${NC}"
    else
        echo -e "${RED}❌ Restore BAŞARISIZ!${NC}"
        exit 1
    fi
else
    # Uncompressed backup
    if psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" < "$BACKUP_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Restore başarılı!${NC}"
    else
        echo -e "${RED}❌ Restore BAŞARISIZ!${NC}"
        exit 1
    fi
fi

# Restart the application
echo -e "${YELLOW}▶️  Uygulama başlatılıyor...${NC}"
pm2 restart notvarmi 2>/dev/null

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✨ Restore işlemi tamamlandı! ✨      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📊 Veritabanı bilgilerini kontrol edin:${NC}"
echo -e "${YELLOW}   psql -U $DB_USER -h $DB_HOST -d $DB_NAME${NC}\n"
