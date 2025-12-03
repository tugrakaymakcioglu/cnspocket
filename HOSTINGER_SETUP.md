# Hostinger VPS Deployment Rehberi

Hostinger VPS ve domain kullanarak NotVarmı uygulamasını canlıya alma rehberi.

## 🎯 Hostinger Avantajları

- ✅ Türkçe destek (7/24)
- ✅ Türkiye'de datacenter (Kaunas, Litvanya - ~60ms ping)
- ✅ Uygun fiyat
- ✅ Kolay panel
- ✅ Domain + VPS aynı yerde

---

## 📋 Ön Hazırlık

### Sahip Olduğun

- ✅ Hostinger VPS
- ✅ Domain: notvarmi.com

### Yapman Gerekenler

1. VPS'e SSH bağlantısı
2. Domain DNS ayarı
3. Deployment

---

## 🚀 Adım 1: VPS'e Bağlan

### Hostinger VPS Panel'den SSH Bilgilerini Al

1. **Hostinger Panel**'e giriş yap: https://hpanel.hostinger.com
2. **VPS** → Senin VPS'ini seç
3. **SSH Erişimi** sekmesi
4. Bilgileri not al:
   ```
   IP Adresi: XXX.XXX.XXX.XXX
   Port: 22
   Kullanıcı: root
   Şifre: (panel'de gösterilecek)
   ```

### Windows'tan SSH Bağlantısı

#### Yöntem 1: Windows Terminal / PowerShell
```powershell
ssh root@SUNUCU_IP
# Şifreyi gir
```

#### Yöntem 2: PuTTY (Daha Kolay)
1. PuTTY indir: https://www.putty.org/
2. **Host Name**: VPS IP adresi
3. **Port**: 22
4. **Open** → Şifreyi gir

---

## 🌐 Adım 2: Domain DNS Ayarları

### Hostinger Domain Panel

1. **hPanel** → **Domains** → **notvarmi.com**
2. **DNS / Nameservers**
3. **Manage DNS Records**

### Eklenecek DNS Kayıtları

```
Type: A
Name: @
Points to: VPS_IP_ADRESI
TTL: 3600
```

```
Type: A
Name: www
Points to: VPS_IP_ADRESI
TTL: 3600
```

**⏰ DNS Propagation**: 1-24 saat sürebilir (genelde 1-2 saat)

### DNS Test Et

```powershell
# Windows PowerShell
nslookup notvarmi.com
nslookup www.notvarmi.com
```

Çıktı VPS IP'nizi göstermeli.

---

## 💻 Adım 3: VPS Kurulum (Otomatik)

### İlk Bağlantı Sonrası

```bash
# Sistem güncellemesi (önemli!)
apt update && apt upgrade -y

# Git kur
apt install -y git

# Proje dizini oluştur
mkdir -p /var/www
cd /var/www

# Projeyi klonla
git clone https://github.com/KULLANICI_ADIN/cnspocket.git
cd cnspocket
```

### Script İzinleri

```bash
chmod +x scripts/*.sh
```

### Quickstart Script (TEK KOMUT)

```bash
sudo ./scripts/quickstart.sh
```

**Script otomatik yapar:**
- ✅ Node.js kur
- ✅ PostgreSQL kur ve database oluştur
- ✅ Nginx kur
- ✅ PM2 kur
- ✅ `.env` oluştur
- ✅ `npm install`
- ✅ `npm run build`
- ✅ PM2 ile başlat
- ✅ Firewall aç
- ✅ Otomatik backup ayarla

**Süre**: ~10-15 dakika

**Soru soracak:**
- PostgreSQL database adı: `notvarmi_db` (Enter)
- PostgreSQL kullanıcı: `notvarmi_user` (Enter)
- PostgreSQL şifre: Güçlü bir şifre gir
- Email: SSL için email adresin

---

## 🔐 Adım 4: SSL Sertifikası

### DNS Hazır mı Kontrol

```bash
ping notvarmi.com
ping www.notvarmi.com
```

Her ikisi de VPS IP'ni göstermeli.

### SSL Kur

```bash
cd /var/www/cnspocket/scripts

# Email adresini güncelle
nano setup-ssl.sh
# EMAIL="senin@emailin.com" yaz
# Kaydet: Ctrl+X, Y, Enter

# SSL kur
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

**Süre**: 2-3 dakika

---

## ✅ Adım 5: Test Et

### PM2 Durum

```bash
pm2 status
```

Çıktı:
```
┌─────┬──────────────┬─────┬─────┬──────┐
│ id  │ name         │ mode│ ↺   │ status│
├─────┼──────────────┼─────┼─────┼──────┤
│ 0   │ notvarmi-app │ fork│ 0   │ online│
└─────┴──────────────┴─────┴─────┴──────┘
```

### Loglar

```bash
pm2 logs notvarmi-app
```

### Browser Test

```
https://www.notvarmi.com
```

Yeşil kilit ikonu görmelisin! 🔒✅

---

## 🔧 Hostinger'a Özel Notlar

### VPS Specs (Kontrol Et)

Hostinger Panel → **VPS** → **Overview**

**Minimum gereksinim:**
- RAM: 2GB
- CPU: 1 vCPU
- Disk: 40GB SSD

Daha düşükse upgrade et.

### Firewall (Hostinger Panel)

Hostinger bazı VPS planlarında firewall panel'den yönetilir:

1. **VPS** → **Firewall**
2. Port'ları aç:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)

**Veya SSH'dan:**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Swap Memory (2GB RAM İse)

```bash
# Swap ekle (performance artırır)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Backup (Hostinger Otomatik)

Hostinger bazı planlarda otomatik backup yapar, ama sen de yap:

```bash
# Manuel backup
cd /var/www/cnspocket/scripts
./backup-postgres.sh
```

---

## 📊 Performans Optimizasyonu

### PostgreSQL Ayarları

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**2GB RAM için:**
```conf
shared_buffers = 512MB
effective_cache_size = 1536MB
work_mem = 16MB
```

Kaydet ve restart:
```bash
sudo systemctl restart postgresql
```

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🐛 Sorun Giderme (Hostinger)

### SSH Bağlanamıyorum

**Çözüm 1**: Hostinger Panel → **VPS** → **SSH Password** → Reset

**Çözüm 2**: Hostinger canlı destek (Türkçe)

### DNS Yayılmadı (24 saat sonra)

```bash
# Nameserver kontrol
nslookup notvarmi.com 8.8.8.8
```

Hostinger destek ile iletişime geç.

### Port 80/443 Blocked

Hostinger panel'den firewall kontrolü.

### SSL "Too Many Requests"

Let's Encrypt rate limit. 1 saat bekle veya:
```bash
# Staging test
sudo certbot --staging --nginx -d www.notvarmi.com
```

---

## 📞 Hostinger Destek

- **Canlı Chat**: hPanel sağ alt
- **Email**: support@hostinger.com
- **Tel**: 0850 840 33 43 (Türkiye)
- **Dil**: Türkçe destek var!

---

## 🎯 Deployment Checklist

### VPS Tarafı
- [ ] VPS aktif
- [ ] SSH bağlantısı çalışıyor
- [ ] Ubuntu 22.04 LTS kurulu
- [ ] Firewall ayarlandı (22, 80, 443)

### Domain Tarafı
- [ ] DNS A record eklendi (@ ve www)
- [ ] DNS yayıldı (nslookup ile test et)
- [ ] Ping atılıyor

### Deployment
- [ ] Git repository klonlandı
- [ ] `quickstart.sh` çalıştırıldı
- [ ] PostgreSQL database oluştu
- [ ] `.env` dosyası var
- [ ] `npm run build` başarılı
- [ ] PM2 çalışıyor
- [ ] Nginx çalışıyor

### SSL
- [ ] `setup-ssl.sh` çalıştırıldı
- [ ] Sertifika alındı
- [ ] HTTPS çalışıyor
- [ ] HTTP → HTTPS redirect var

### Test
- [ ] `https://www.notvarmi.com` açılıyor
- [ ] Yeşil kilit var
- [ ] Kayıt olma çalışıyor
- [ ] Login çalışıyor
- [ ] PM2 loglarında hata yok

---

## 💡 Hostinger İpuçları

### 1. Snapshot Oluştur (Önemli!)

Deployment tamamlandıktan sonra:

**Hostinger Panel** → **VPS** → **Snapshots** → **Create Snapshot**

Hata olursa geri dönebilirsin.

### 2. Auto Backups

**Hostinger Panel** → **VPS** → **Backups**

Otomatik backup'ı aktif et (bazı planlarda ücretsiz).

### 3. Resource Monitoring

**Hostinger Panel** → **VPS** → **Statistics**

CPU, RAM, Disk kullanımını izle.

### 4. Email Notifications

**Hostinger Panel** → **VPS** → **Notifications**

VPS sorunlarında email alsın.

---

## 🚀 Hızlı Başlangıç Özeti

```bash
# 1. VPS'e bağlan
ssh root@VPS_IP

# 2. Projeyi klonla
git clone REPO_URL /var/www/cnspocket
cd /var/www/cnspocket

# 3. Quickstart
chmod +x scripts/*.sh
sudo ./scripts/quickstart.sh

# 4. SSL kur (DNS hazırsa)
sudo ./scripts/setup-ssl.sh

# 5. Test et
pm2 status
https://www.notvarmi.com
```

**Toplam süre**: ~30-45 dakika

---

## 📖 Ek Kaynaklar

- **Hostinger VPS Docs**: https://support.hostinger.com/en/collections/vps
- **Hostinger Panel**: https://hpanel.hostinger.com
- **Proje Deployment**: `DEPLOYMENT.md`
- **SSL Guide**: `SSL_GUIDE.md`
- **Script'ler**: `SCRIPTS_GUIDE.md`

---

**Hostinger ile çalışma çok kolay!** Türkçe destek varsa herhangi bir sorunda hemen yardım alabilirsin.

Başarılar! 🎉
