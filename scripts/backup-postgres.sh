#!/bin/bash

# PostgreSQL Backup Script for NotVarmı
# Usage: ./backup.sh

# Configuration
DB_NAME="notvarmi_db"
DB_USER="notvarmi_user"
DB_HOST="localhost"
BACKUP_DIR="/backup/notvarmi"
DATE=$(date +\%Y\%m\%d_\%H\%M\%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 PostgreSQL Backup Başlatılıyor...${NC}"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Backup dizini oluşturuluyor: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Perform backup
echo -e "${YELLOW}💾 Veritabanı yedekleniyor: $DB_NAME${NC}"
if pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup başarıyla oluşturuldu!${NC}"
    echo -e "${GREEN}📦 Dosya: $BACKUP_FILE${NC}"
    echo -e "${GREEN}📊 Boyut: $FILE_SIZE${NC}"
    
    # List recent backups
    echo -e "\n${YELLOW}📋 Son 5 Backup:${NC}"
    ls -lht "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -5
    
    # Count total backups
    TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    echo -e "\n${YELLOW}📊 Toplam backup sayısı: $TOTAL_BACKUPS${NC}"
    
    # Cleanup old backups (older than 30 days)
    echo -e "\n${YELLOW}🧹 30 günden eski backuplar temizleniyor...${NC}"
    DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete -print | wc -l)
    if [ "$DELETED" -gt 0 ]; then
        echo -e "${GREEN}✅ $DELETED eski backup silindi.${NC}"
    else
        echo -e "${GREEN}✅ Silinecek eski backup yok.${NC}"
    fi
else
    echo -e "${RED}❌ Backup BAŞARISIZ!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ İşlem tamamlandı!${NC}"
