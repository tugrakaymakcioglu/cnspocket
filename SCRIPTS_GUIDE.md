# Deployment Scripts Kullanım Rehberi

Bu rehber, NotVarmı uygulamasını sunucuya deploy etmek için kullanabileceğiniz tüm script'leri açıklar.

## 📁 Mevcut Script'ler

| Script | Açıklama | Kullanım |
|--------|----------|----------|
| `quickstart.sh` | Sıfırdan tam kurulum | İlk deployment |
| `update.sh` | Kod güncelleme ve deploy | Her güncelleme |
| `rollback.sh` | Önceki versiyona dönme | Hata durumunda |
| `setup-ssl.sh` | SSL sertifikası kurulumu | İlk deployment |
| `check-ssl.sh` | SSL durumu kontrolü | Monitoring |
| `backup-postgres.sh` | Database backup| Manuel backup |
| `restore-postgres.sh` | Database restore | Kurtarma |
| `health-check.sh` | Uygulama sağlık kontrolü | Monitoring |

## 🚀 İlk Deployment (Yeni Sunucu)

### 1. Projeyi Sunucuya Yükle

```bash
# SSH ile sunucuya bağlan
ssh root@SUNUCU_IP

# Proje dizini oluştur
mkdir -p /var/www
cd /var/www

# GitHub'dan klonla (veya FTP ile yükle)
git clone YOUR_REPO_URL cnspocket
cd cnspocket
```

### 2. Script İzinlerini Ayarla

```bash
chmod +x scripts/*.sh
```

### 3. Hızlı Kurulum Script'ini Çalıştır

```bash
sudo ./scripts/quickstart.sh
```

**Bu script otomatik olarak:**
- ✅ Node.js, PostgreSQL, Nginx kurar
- ✅ Database oluşturur
- ✅ Environment variables ayarlar  
- ✅ Bağımlılıkları kurar
- ✅ Production build yapar
- ✅ PM2 ile başlatır
- ✅ Nginx yapılandırır
- ✅ Otomatik backup ayarlar
- ✅ Firewall kurar

**Süre**: ~10-15 dakika

### 4. SSL Sertifikası Kur

```bash
cd /var/www/cnspocket/scripts

# Email adresini güncelle
nano setup-ssl.sh
# EMAIL="your-email@example.com" satırını değiştir

# SSL kur
sudo ./setup-ssl.sh
```

### 5. Test Et

```bash
# PM2 durumu
pm2 status

# Loglar
pm2 logs notvarmi-app

# Health check
./scripts/health-check.sh

# Browser'da
https://www.notvarmi.com
```

## 🔄 Güncelleme (Mevcut Deployment)

### Kod Güncelleme

```bash
cd /var/www/cnspocket

# Update script'i çalıştır
./scripts/update.sh
```

**Update script otomatik olarak:**
- ✅ Backup alır (database + kod)
- ✅ Git pull yapar
- ✅ Dependencies günceller
- ✅ Database migration çalıştırır
- ✅ Yeni build oluşturur
- ✅ PM2 restart yapar
- ✅ Health check yapar

### Manuel Güncelleme

```bash
# 1. Backup al
./scripts/backup-postgres.sh

# 2. Kodu güncelle
git pull origin main

# 3. Dependencies
npm install

# 4. Database migration
npx prisma migrate deploy

# 5. Build
npm run build

# 6. Restart
pm2 restart notvarmi-app
```

## 🔙 Rollback (Geri Alma)

### Hata Durumunda

```bash
cd /var/www/cnspocket

# Rollback script
./scripts/rollback.sh
```

**Seçenekler:**
1. Sadece database geri al
2. Sadece kod geri al
3. Her ikisi de geri al

Script size mevcut backupları gösterir ve seçim yapmanızı ister.

### Manuel Rollback

```bash
# 1. Database backup listesi
ls -lht /backup/notvarmi/*.sql.gz

# 2. Restore et
./scripts/restore-postgres.sh /backup/notvarmi/backup_20251201.sql.gz

# 3. Önceki deployment'ı geri yükle
tar -xzf /backup/notvarmi/deploy_20251201.tar.gz
npm install
npm run build
pm2 restart notvarmi-app
```

## 💾 Backup & Restore

### Manuel Backup

```bash
# Database backup
./scripts/backup-postgres.sh

# Çıktı: /backup/notvarmi/backup_YYYYMMDD_HHMMSS.sql.gz
```

### Otomatik Backup

Quickstart script otomatik olarak cron job kurar:
- Her gece saat 02:00'de backup
- 30 günden eski backuplar otomatik silinir

```bash
# Cron job kontrol
crontab -l
```

### Restore

```bash
./scripts/restore-postgres.sh /backup/notvarmi/BACKUP_FILE.sql.gz
```

## 🔐 SSL Yönetimi

### SSL Kurulumu

```bash
./scripts/setup-ssl.sh
```

### SSL Durumu Kontrol

```bash
./scripts/check-ssl.sh
```

### Manuel SSL Yenileme

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 🔍 Monitoring & Health Check

### Uygulama Sağlık Kontrolü

```bash
./scripts/health-check.sh
```

### PM2 Monitoring

```bash
pm2 status           # Durum
pm2 logs notvarmi-app # Loglar
pm2 monit            # Canlı monitoring
```

### Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/notvarmi_access.log

# Error log
sudo tail -f /var/log/nginx/notvarmi_error.log
```

### Database Bağlantı

```bash
psql -U notvarmi_user -d notvarmi_db
```

## 🐛 Sorun Giderme

### Uygulama Başlamıyor

```bash
# PM2 loglarını kontrol
pm2 logs notvarmi-app --lines 100

# Build hatası varsa
rm -rf .next node_modules
npm install
npm run build
pm2 restart notvarmi-app
```

### Database Bağlantı Hatası

```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Database var mı?
sudo -u postgres psql -l | grep notvarmi
```

### SSL Hatası

```bash
# Sertifika kontrolü
./scripts/check-ssl.sh

# Nginx config test
sudo nginx -t

# Sertifika yenile
sudo certbot renew --force-renewal
```

### Port 3000 Kullanımda

```bash
# Process bul
sudo lsof -i :3000

# Sonlandır
sudo kill -9 PID
```

## 📊 Script Özellikleri Karşılaştırma

| Özellik | quickstart.sh | update.sh | rollback.sh |
|---------|--------------|-----------|-------------|
| İlk kurulum | ✅ | ❌ | ❌ |
| Güncelleme | ❌ | ✅ | ❌ |
| Backup | ✅ | ✅ | ❌ (restore) |
| Build | ✅ | ✅ | ✅ |
| Database migration | ✅ | ✅ | ✅ (restore) |
| PM2 setup | ✅ | ❌ (restart) | ❌ (restart) |
| Nginx setup | ✅ | ❌ | ❌ |
| Health check | ❌ | ✅ | ❌ |
| Süre | 10-15 dk | 2-3 dk | 1-2 dk |

## ⚙️ Environment Variables

Script'ler otomatik olarak `.env` dosyası oluşturur, ancak kontrol edilmeli:

```bash
# .env kontrol
cat /var/www/cnspocket/.env

# Düzenle
nano /var/www/cnspocket/.env
```

**Gerekli değişkenler:**
- `DATABASE_URL` - PostgreSQL bağlantısı
- `NEXTAUTH_URL` - Production domain
- `NEXTAUTH_SECRET` - Güvenli secret key
- `NODE_ENV=production`

## 🎯 Best Practices

### 1. Her Deployment Öncesi

```bash
# Backup al
./scripts/backup-postgres.sh

# Health check
./scripts/health-check.sh
```

### 2. Her Deployment Sonrası

```bash
# Durum kontrol
pm2 status

# Logları izle (2-3 dakika)
pm2 logs notvarmi-app

# Health check
./scripts/health-check.sh

# Browser test
curl https://www.notvarmi.com
```

### 3. Haftalık Rutin

```bash
# SSL durumu
./scripts/check-ssl.sh

# Backupları kontrol
ls -lh /backup/notvarmi/

# System güncellemeleri
sudo apt update && sudo apt upgrade
```

## 📞 Acil Durum

### Critical Error

```bash
# 1. Hemen rollback
./scripts/rollback.sh

# 2. PM2 restart
pm2 restart notvarmi-app

# 3. Nginx reload
sudo systemctl reload nginx
```

### Database Corruption

```bash
# 1. En son backup'ı restore et
./scripts/restore-postgres.sh /backup/notvarmi/LATEST_BACKUP.sql.gz

# 2. Application restart
pm2 restart notvarmi-app
```

## 💡 İpuçları

1. **Test Environment**: Production'a deploy etmeden önce test edin
2. **Backup Strategy**: 3-2-1 rule (3 kopya, 2 farklı medya, 1 offsite)
3. **Monitoring**: Health check'i cron job olarak çalıştırın
4. **Documentation**: Her deployment'ta notlar alın
5. **Alerts**: Critical hatalar için bildirim sistemi kurun

## 🔗 İlgili Dokümantasyon

- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Detaylı deployment rehberi
- **[SSL_GUIDE.md](../SSL_GUIDE.md)** - SSL kurulum ve yönetim
- **[BACKUP_GUIDE.md](../BACKUP_GUIDE.md)** - Backup stratejileri
- **[DOMAIN_IDN_GUIDE.md](../DOMAIN_IDN_GUIDE.md)** - Domain yapılandırma
