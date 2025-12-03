# Production Deployment Guide - NotVarmı

Bu rehber, NotVarmı uygulamasını VPS sunucunuzda production ortamına deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

VPS sunucunuzda şunların kurulu olması gerekir:

- **Node.js** 18.x veya üzeri
- **npm** veya **yarn**
- **PostgreSQL** 14.x veya üzeri
- **Git**
- **PM2** (production process manager) - opsiyonel ama önerilir

## 🔑 Gerekli Environment Variables

Sunucunuzda bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri doldurun:

```bash
# Database - PostgreSQL bağlantı bilgilerinizi girin
DATABASE_URL="postgresql://kullanici_adi:sifre@localhost:5432/veritabani_adi?schema=public"

# NextAuth - Domain bilgileriniz
NEXTAUTH_URL="https://www.notvarmı.com"

# NextAuth Secret - Güvenli bir secret oluşturun
# Terminal'de çalıştırın: openssl rand -base64 32
NEXTAUTH_SECRET="buraya-openssl-ile-olusturdugunuz-secret-key"

# Email (SMTP) - Şimdilik opsiyonel, ileride şifre sıfırlama için kullanılacak
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM='"NotVarmı" <your-email@gmail.com>'
```

## 🚀 Deployment Adımları

### 1. PostgreSQL Veritabanı Kurulumu

```bash
# PostgreSQL'e bağlanın
sudo -u postgres psql

# Yeni veritabanı ve kullanıcı oluşturun
CREATE DATABASE notvarmi_db;
CREATE USER notvarmi_user WITH PASSWORD 'güçlü_bir_şifre';
GRANT ALL PRIVILEGES ON DATABASE notvarmi_db TO notvarmi_user;

# PostgreSQL'den çıkın
\q
```

### 2. Projeyi Sunucuya Klonlayın

```bash
# Proje dizinine gidin
cd /var/www  # veya tercih ettiğiniz dizin

# Git repository'yi klonlayın
git clone <repository-url> cnspocket
cd cnspocket
```

### 3. Bağımlılıkları Kurun

```bash
# Node.js bağımlılıklarını kurun
npm install

# Prisma client otomatik olarak oluşturulacak (postinstall script sayesinde)
```

### 4. Environment Variables Ayarlayın

```bash
# .env dosyası oluşturun
nano .env

# Yukarıdaki environment variables'ı yapıştırın ve düzenleyin
# Kaydetmek için: Ctrl+X, Y, Enter
```

### 5. Veritabanı Migration

```bash
# Prisma schema'yı veritabanına uygulayın
npx prisma db push

# Veya migration kullanarak:
# npx prisma migrate deploy
```

### 6. Production Build Oluşturun

```bash
# Next.js production build
npm run build

# Build başarılı olursa, şu mesajı göreceksiniz:
# ✓ Compiled successfully
```

### 7. Uygulamayı Başlatın

#### Seçenek A: PM2 ile (Önerilir)

```bash
# PM2'yi global olarak kurun (henüz kurulu değilse)
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "notvarmi" -- start

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save

# Durumu kontrol edin
pm2 status
pm2 logs notvarmi
```

#### Seçenek B: Direkt npm ile

```bash
# Production modunda başlat
npm start

# Port 3000'de çalışacak
```

### 8. Nginx Reverse Proxy Kurulumu (Önerilir)

```bash
# Nginx kurun (henüz kurulu değilse)
sudo apt install nginx

# Nginx config dosyası oluşturun
sudo nano /etc/nginx/sites-available/notvarmi
```

Aşağıdaki konfigürasyonu ekleyin:

```nginx
server {
    listen 80;
    server_name www.notvarmı.com notvarmı.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Config'i etkinleştirin
sudo ln -s /etc/nginx/sites-available/notvarmi /etc/nginx/sites-enabled/

# Nginx'i test edin ve yeniden başlatın
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL Sertifikası Kurulumu (Let's Encrypt)

```bash
# Certbot kurun
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d www.notvarmı.com -d notvarmı.com

# Otomatik yenileme için cron job
sudo certbot renew --dry-run
```

## ✅ Deployment Kontrol Listesi

Deployment öncesi şunları kontrol edin:

- [ ] PostgreSQL veritabanı oluşturuldu ve çalışıyor
- [ ] `.env` dosyası doğru bilgilerle oluşturuldu
- [ ] `NEXTAUTH_SECRET` güvenli bir şekilde oluşturuldu (openssl ile)
- [ ] `DATABASE_URL` doğru PostgreSQL bağlantı bilgilerini içeriyor
- [ ] `npm install` başarıyla tamamlandı
- [ ] `npx prisma db push` başarıyla tamamlandı
- [ ] `npm run build` hatasız tamamlandı
- [ ] Uygulama başlatıldı (PM2 veya npm start ile)
- [ ] Nginx reverse proxy kuruldu ve çalışıyor
- [ ] SSL sertifikası kuruldu (HTTPS)
- [ ] Domain DNS ayarları doğru (A record sunucu IP'sini gösteriyor)

## 🔧 Yararlı Komutlar

### PM2 Komutları

```bash
# Uygulamayı yeniden başlat
pm2 restart notvarmi

# Logları görüntüle
pm2 logs notvarmi

# Durumu kontrol et
pm2 status

# Uygulamayı durdur
pm2 stop notvarmi

# Uygulamayı sil
pm2 delete notvarmi
```

### Prisma Komutları

```bash
# Veritabanı şemasını görüntüle
npx prisma studio

# Migration oluştur
npx prisma migrate dev --name migration_adi

# Production migration uygula
npx prisma migrate deploy

# Prisma client'ı yeniden oluştur
npx prisma generate
```

### Git Güncelleme

```bash
# Sunucuda kodları güncelle
cd /var/www/cnspocket
git pull origin main

# Bağımlılıkları güncelle
npm install

# Yeniden build et
npm run build

# Uygulamayı yeniden başlat
pm2 restart notvarmi
```

## 🐛 Sorun Giderme

### Port 3000 zaten kullanımda

```bash
# Port 3000'i kullanan process'i bul
sudo lsof -i :3000

# Process'i sonlandır
sudo kill -9 <PID>
```

### Veritabanı bağlantı hatası

- `DATABASE_URL` formatını kontrol edin
- PostgreSQL servisinin çalıştığını doğrulayın: `sudo systemctl status postgresql`
- Kullanıcı izinlerini kontrol edin

### Build hatası

- Node.js versiyonunu kontrol edin: `node -v` (18.x veya üzeri olmalı)
- `node_modules` ve `.next` klasörlerini silin ve yeniden deneyin:
  ```bash
  rm -rf node_modules .next
  npm install
  npm run build
  ```

### Nginx 502 Bad Gateway

- Uygulamanın çalıştığını kontrol edin: `pm2 status`
- Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`

## 📊 Production Checklist

Deployment sonrası test edilmesi gerekenler:

- [ ] Ana sayfa yükleniyor mu?
- [ ] Kayıt olma çalışıyor mu?
- [ ] Giriş yapma çalışıyor mu?
- [ ] Çıkış yapma çalışıyor mu?
- [ ] Forum'da post oluşturulabiliyor mu?
- [ ] Forum'da comment yazılabiliyor mu?
- [ ] Profil sayfası çalışıyor mu?
- [ ] Admin paneli çalışıyor mu? (admin kullanıcı ile)
- [ ] Mesajlaşma çalışıyor mu?
- [ ] Görevler/Tasks oluşturulabiliyor mu?
- [ ] Notlar oluşturulabiliyor mu?
- [ ] Arama çalışıyor mu?

## 🔒 Güvenlik Önerileri

1. **Firewall** ayarlarını yapın (UFW):
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **PostgreSQL** sadece localhost'tan erişilebilir olsun
3. **.env** dosyasının izinlerini sınırlayın:
   ```bash
   chmod 600 .env
   ```

4. **Otomatik güncellemeler** kurun:
   ```bash
   sudo apt install unattended-upgrades
   ```

5. **Yedekleme** sistemi kurun (PostgreSQL için):
   
   **Manuel Yedekleme**:
   ```bash
   # Backup dizini oluştur
   sudo mkdir -p /backup/notvarmi
   sudo chown $USER:$USER /backup/notvarmi
   
   # Tek seferlik backup al
   pg_dump -U notvarmi_user -h localhost notvarmi_db > /backup/notvarmi/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
   
   # Sıkıştırılmış backup (önerilir - daha az yer kaplar)
   pg_dump -U notvarmi_user -h localhost notvarmi_db | gzip > /backup/notvarmi/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
   ```
   
   **Otomatik Günlük Backup (Cron)**:
   ```bash
   # Crontab düzenle
   crontab -e
   
   # Her gece saat 02:00'de otomatik backup (en altta ekleyin)
   0 2 * * * pg_dump -U notvarmi_user -h localhost notvarmi_db | gzip > /backup/notvarmi/backup_$(date +\%Y\%m\%d).sql.gz
   
   # 30 günden eski backupları otomatik sil (her gün 03:00'te)
   0 3 * * * find /backup/notvarmi -name "*.sql.gz" -mtime +30 -delete
   ```
   
   **Backup'tan Geri Yükleme (Restore)**:
   ```bash
   # Normal SQL dosyasından
   psql -U notvarmi_user -h localhost -d notvarmi_db < /backup/notvarmi/backup_20251201.sql
   
   # Sıkıştırılmış dosyadan
   gunzip -c /backup/notvarmi/backup_20251201.sql.gz | psql -U notvarmi_user -h localhost -d notvarmi_db
   
   # Veya önce veritabanını temizle ve sonra restore et
   dropdb -U notvarmi_user notvarmi_db
   createdb -U notvarmi_user notvarmi_db
   gunzip -c /backup/notvarmi/backup_20251201.sql.gz | psql -U notvarmi_user -h localhost -d notvarmi_db
   ```

## 📞 Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs notvarmi`
2. Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`
3. Browser console'da hata olup olmadığını kontrol edin
