# 🚀 Sunucuda Yapılacaklar - Hızlı Checklist

> **Not**: Lokalde tüm hazırlık tamamlandı. Bu dosya sadece VPS sunucunuzda yapmanız gerekenleri içeriyor.

## ✅ Lokal'de Tamamlananlar
- ✓ Production build testi başarılı
- ✓ Güvenlik ayarları yapıldı
- ✓ PostgreSQL konfigürasyonu hazır
- ✓ Backup script'leri oluşturuldu
- ✓ Deployment dokümantasyonu hazır

---

## 📋 SUNUCUDA YAPMANIZ GEREKENLER

### 1️⃣ Temel Kurulumlar (İlk Defa İse)

```bash
# Node.js kurulumu (eğer yoksa)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL kurulumu
sudo apt install -y postgresql postgresql-contrib

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Nginx kurulumu
sudo apt install -y nginx

# Git kurulumu
sudo apt install -y git
```

### 2️⃣ PostgreSQL Veritabanı Oluşturma

```bash
# PostgreSQL'e gir
sudo -u postgres psql

# Veritabanı ve kullanıcı oluştur (PostgreSQL içinde)
CREATE DATABASE notvarmi_db;
CREATE USER notvarmi_user WITH PASSWORD 'güçlü_bir_şifre_buraya';
GRANT ALL PRIVILEGES ON DATABASE notvarmi_db TO notvarmi_user;
\q
```

### 3️⃣ Projeyi Sunucuya Yükleme

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www
cd /var/www

# GitHub'dan klonla (veya FTP ile yükle)
git clone YOUR_GITHUB_URL cnspocket
cd cnspocket

# Sahiplik ayarla
sudo chown -R $USER:$USER /var/www/cnspocket
```

### 4️⃣ Environment Variables (.env) Oluşturma

```bash
cd /var/www/cnspocket
nano .env
```

**Aşağıdaki içeriği yapıştır ve KENDI BİLGİLERİNLE DOLDUR**:

```bash
DATABASE_URL="postgresql://notvarmi_user:BURAYA_ŞİFRENİZ@localhost:5432/notvarmi_db?schema=public"
NEXTAUTH_URL="https://www.notvarmı.com"
NEXTAUTH_SECRET="BURAYA_OPENSSL_SECRET"
```

**NEXTAUTH_SECRET oluşturmak için**:
```bash
openssl rand -base64 32
# Bu komutu çalıştır, çıkan değeri NEXTAUTH_SECRET'a yapıştır
```

Kaydet: `Ctrl+X`, `Y`, `Enter`

### 5️⃣ Uygulamayı Kurma ve Başlatma

```bash
cd /var/www/cnspocket

# Bağımlılıkları kur
npm install

# Veritabanı şemasını oluştur
npx prisma db push

# Production build
npm run build

# Log dizini oluştur (PM2 için)
sudo mkdir -p /var/log/notvarmi
sudo chown $USER:$USER /var/log/notvarmi

# PM2 ile başlat (ecosystem config ile)
pm2 start ecosystem.config.json
pm2 save
pm2 startup
# (çıkan komutu çalıştır)

# Durum kontrol
pm2 status
pm2 logs notvarmi-app
```

### 6️⃣ Nginx Konfigürasyonu

```bash
# Nginx config oluştur
sudo nano /etc/nginx/sites-available/notvarmi
```

**İçerik**:
```nginx
server {
    listen 80;
    server_name www.notvarmi.com notvarmi.com;

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
# Config etkinleştir
sudo ln -s /etc/nginx/sites-available/notvarmi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7️⃣ SSL Sertifikası (HTTPS) - Otomatik

```bash
# SSL setup script'ine email adresinizi girin
cd /var/www/cnspocket/scripts
nano setup-ssl.sh
# EMAIL="your-email@example.com" satırını güncelleyin

# Script'i çalıştırılabilir yap
chmod +x setup-ssl.sh check-ssl.sh

# SSL kurulumunu başlat (otomatik)
sudo ./setup-ssl.sh
```

**Veya Manuel Kurulum**:
```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx

# SSL al ve Nginx'i otomatik yapılandır
sudo certbot --nginx -d www.notvarmi.com -d notvarmi.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

**SSL Durumu Kontrol**:
```bash
./check-ssl.sh
```

### 8️⃣ Otomatik Backup Kurulumu

```bash
# Backup dizini oluştur
sudo mkdir -p /backup/notvarmi
sudo chown $USER:$USER /backup/notvarmi

# Script'leri çalıştırılabilir yap
cd /var/www/cnspocket/scripts
chmod +x backup-postgres.sh restore-postgres.sh

# Cron job ekle (her gece saat 02:00)
crontab -e
```

**Crontab'a ekle**:
```
0 2 * * * /var/www/cnspocket/scripts/backup-postgres.sh >> /var/log/notvarmi-backup.log 2>&1
0 3 * * * find /backup/notvarmi -name "*.sql.gz" -mtime +30 -delete
```

### 9️⃣ Güvenlik (Firewall)

```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

---

## 🎯 Test Etme

Site çalışıyor mu kontrol et:

1. **Browser'da aç**: `https://www.notvarmı.com`
2. **Kayıt ol** - yeni kullanıcı oluştur
3. **Login yap**
4. **Forum'da post oluştur**
5. **PM2 durum**: `pm2 status`
6. **Log kontrol**: `pm2 logs notvarmi`

---

## 🔧 Sorun Çıkarsa

```bash
# Logları kontrol
pm2 logs notvarmi

# Nginx logları
sudo tail -f /var/log/nginx/error.log

# Uygulamayı yeniden başlat
pm2 restart notvarmi

# PostgreSQL çalışıyor mu
sudo systemctl status postgresql
```

---

## 📝 Özet: Sırayla Yapılacaklar

1. ✅ Sunucuya SSH ile bağlan
2. ✅ PostgreSQL kur ve veritabanı oluştur
3. ✅ Projeyi sunucuya yükle (git clone veya FTP)
4. ✅ `.env` dosyası oluştur (KEKEDİN BİLGİLERİNLE)
5. ✅ `npm install` + `prisma db push` + `npm run build`
6. ✅ PM2 ile başlat
7. ✅ Nginx konfigüre et
8. ✅ SSL sertifikası al
9. ✅ Otomatik backup kur
10. ✅ Test et!

**Tahmini Süre**: 30-45 dakika

---

## ℹ️ Detaylı Bilgi İçin

- **Deployment**: `DEPLOYMENT.md`
- **Backup**: `BACKUP_GUIDE.md`
- **Sorun Giderme**: `DEPLOYMENT.md` - "Sorun Giderme" bölümü
