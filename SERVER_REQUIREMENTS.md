# Sunucu Gereksinimleri ve Öneriler

## 🎯 **Optimum Sunucu Konfigürasyonu**

### **İşletim Sistemi** 

**Önerilir: Ubuntu Server 22.04 LTS (Jammy)** ⭐⭐⭐

**Neden?**
- ✅ Long Term Support (5 yıl destek)
- ✅ Node.js, PostgreSQL için en iyi paket desteği
- ✅ En yaygın kullanılan (community support fazla)
- ✅ Güvenlik güncellemeleri düzenli
- ✅ Tüm script'lerimiz Ubuntu'ya optimize

**Alternatifler:**
- **Ubuntu 24.04 LTS** ⭐⭐ (Yeni, daha az test edilmiş)
- **Debian 12** ⭐⭐ (Daha minimal, stabil)
- **CentOS Stream 9** / **AlmaLinux 9** ⭐ (Enterprise, ama Node.js desteği zayıf)

**❌ Önerilmez:**
- Windows Server (Node.js performansı düşük)
- Alpine Linux (production için riskli)
- Arch Linux (rolling release, riskli)

---

## 💻 **Sunucu Tipi**

### **1. VPS (Virtual Private Server)** ⭐⭐⭐ **EN ÖNERİLİR**

**Neden?**
- ✅ Tam kontrol (root access)
- ✅ Özel IP adresi
- ✅ Uygun fiyat/performans
- ✅ Kolay scale edilir
- ✅ Script'lerimiz VPS için optimize

**Tavsiye VPS Sağlayıcıları (Türkiye için):**

| Sağlayıcı | RAM | CPU | Disk | Fiyat/Ay | Lokasyon |
|-----------|-----|-----|------|----------|----------|
| **DigitalOcean Droplet** | 2GB | 1 vCPU | 50GB SSD | $12 | Amsterdam |
| **Linode** | 2GB | 1 vCPU | 50GB SSD | $12 | Frankfurt |
| **Vultr** | 2GB | 1 vCPU | 55GB SSD | $12 | İstanbul ⭐ |
| **Hetzner Cloud** | 2GB | 1 vCPU | 40GB SSD | €4.5 | Almanya |
| **Turhost VDS** | 2GB | 1 vCPU | 40GB SSD | ₺350 | İstanbul |

**⭐ Türkiye için en iyi: Vultr (İstanbul datacenter)**

---

### **2. Shared Hosting** ❌ **ÖNERİLMEZ**

**Neden kullanılmaz?**
- ❌ Node.js desteği genelde yok
- ❌ PostgreSQL genelde yok (sadece MySQL)
- ❌ PM2, custom script çalıştıramazsın
- ❌ Root access yok
- ❌ SSL sınırlamaları

**Sadece şu durumlarda:**
- cPanel/DirectAdmin Node.js desteği varsa
- cPanel PostgreSQL desteği varsa
- ⚠️ Performans düşük olur

---

### **3. Cloud Hosting (PaaS)** ⭐⭐

**Vercel / Netlify** (Frontend only)
- ✅ Next.js için optimize
- ❌ PostgreSQL barındıramazsın
- ❌ Backend için ayrı database servisi gerekir ($$)
- **Maliyet**: ~$20-50/ay (database ile)

**Heroku / Railway**
- ✅ Kolay deployment
- ✅ PostgreSQL dahil
- ❌ Pahalı ($25-50/ay)
- ❌ Türkiye'den yavaş

**AWS / Google Cloud / Azure**
- ✅ Çok güçlü
- ❌ Karmaşık setup
- ❌ Maliyet kontrolü zor
- ⚠️ Başlangıç için fazla

---

## 🔧 **Minimum & Önerilen Gereksinimler**

### **Minimum Gereksinimler** (Test için)

```
RAM:        1GB
CPU:        1 vCPU
Disk:       20GB SSD
Bandwidth:  1TB/ay
```

⚠️ **Dikkat**: Minimum'da çalışır ama yavaş olabilir

---

### **Önerilen Gereksinimler** (Production) ⭐

```
RAM:        2GB
CPU:        2 vCPU
Disk:       40GB SSD
Bandwidth:  2TB/ay
OS:         Ubuntu 22.04 LTS
```

**Fiyat**: ~$12-15/ay

**Bu konfigürasyon için:**
- ✅ 100-500 aktif kullanıcı
- ✅ 10,000-50,000 sayfa görüntüleme/gün
- ✅ PostgreSQL + Next.js rahat çalışır
- ✅ PM2 + Nginx optimize

---

### **Yüksek Trafik** (1000+ kullanıcı)

```
RAM:        4GB
CPU:        2-4 vCPU
Disk:       80GB SSD
Bandwidth:  4TB/ay
```

**Fiyat**: ~$24/ay

**Ekstra özellikler:**
- Redis cache eklenebilir
- Load balancer
- Database read replicas

---

## 📊 **Performans Karşılaştırması**

### **VPS Sağlayıcı Karşılaştırması**

| Sağlayıcı | Performans | Türkiye Ping | Fiyat | Destek | Önerilir |
|-----------|------------|--------------|-------|--------|----------|
| **Vultr (İstanbul)** | ⭐⭐⭐ | ~5ms | $$ | İngilizce | ⭐⭐⭐ |
| **Hetzner** | ⭐⭐⭐ | ~50ms | $ | İngilizce | ⭐⭐⭐ |
| **DigitalOcean** | ⭐⭐⭐ | ~60ms | $$ | İngilizce | ⭐⭐ |
| **Linode** | ⭐⭐ | ~60ms | $$ | İngilizce | ⭐⭐ |
| **Turhost** | ⭐⭐ | ~2ms | $$$ | Türkçe | ⭐ |

---

## 🚀 **Önerilen Başlangıç Setup**

### **Başlangıç (İlk 6 ay)**

**Sunucu:**
- **Sağlayıcı**: Vultr (İstanbul) veya Hetzner (Almanya)
- **Plan**: 2GB RAM, 1 vCPU, 40GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Maliyet**: ~$12/ay

**Alan adı:**
- Domain kayıt (~$10-15/yıl)
- SSL: Let's Encrypt (ücretsiz)

**Toplam**: ~$150-200/yıl

---

### **Büyüme Aşaması (6-12 ay)**

**Sunucu Upgrade:**
- 4GB RAM, 2 vCPU
- Maliyet: ~$24/ay

**Ekstra:**
- CDN (CloudFlare - ücretsiz)
- Monitoring (UptimeRobot - ücretsiz)
- Backup (otomatik - script'lerimizde var)

**Toplam**: ~$300/yıl

---

## ⚙️ **OS Optimizasyonları**

### **Ubuntu 22.04 LTS Kurulum**

```bash
# İlk kurulumda
sudo apt update
sudo apt upgrade -y

# Swap ekle (2GB RAM için önemli)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Auto updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### **PostgreSQL Optimizasyonu (2GB RAM)**

`/etc/postgresql/14/main/postgresql.conf`:

```conf
# Memory
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 16MB

# Connections
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

---

## 🌍 **Datacenter Lokasyonu**

### **Türkiye'den Ping Süreleri**

| Lokasyon | Ping | Önerilir |
|----------|------|----------|
| İstanbul | 1-5ms | ⭐⭐⭐ En iyi |
| Almanya (Frankfurt/Falkenstein) | 40-60ms | ⭐⭐⭐ Çok iyi |
| Amsterdam | 60-80ms | ⭐⭐ İyi |
| Londra | 80-100ms | ⭐ Orta |
| New York | 150-200ms | ❌ Yavaş |
| Singapore | 250-350ms | ❌ Çok yavaş |

**⭐ Önerim**: Türk kullanıcılar için **İstanbul** veya **Almanya**

---

## 💰 **Maliyet Optimizasyonu**

### **En Uygun Fiyat**

**Hetzner Cloud (Almanya)**
- 2GB RAM, 1 vCPU, 40GB SSD
- **€4.5/ay (~₺170/ay)**
- Ping: ~50ms (Türkiye'den)

### **En İyi Performans/Fiyat**

**Vultr (İstanbul)**
- 2GB RAM, 1 vCPU, 55GB SSD
- **$12/ay (~₺400/ay)**
- Ping: ~5ms (Türkiye'den)

### **Türkçe Destek**

**Turhost VDS**
- 2GB RAM, 1 vCPU, 40GB SSD
- **₺350-450/ay**
- Ping: ~2ms (Türkiye)
- Türkçe destek

---

## 🎯 **Sonuç ve Öneri**

### **🏆 En İyi Seçim (Performans)**

```
Sağlayıcı:  Vultr
Lokasyon:   İstanbul, Turkey
Plan:       2GB RAM, 1 vCPU, 55GB SSD
OS:         Ubuntu 22.04 LTS x64
Fiyat:      $12/ay (~₺400/ay)
```

**Neden?**
- ✅ Türkiye'de datacenter (5ms ping)
- ✅ SSD storage
- ✅ Kolay kurulum
- ✅ Script'lerimiz tam uyumlu
- ✅ 1 saatte kurulum biter

### **🥈 İkinci Seçim (Maliyet)**

```
Sağlayıcı:  Hetzner Cloud
Lokasyon:   Falkenstein, Germany
Plan:       CPX11 (2GB RAM, 2 vCPU, 40GB SSD)
OS:         Ubuntu 22.04 LTS
Fiyat:      €4.5/ay (~₺170/ay)
```

**Neden?**
- ✅ Çok ucuz
- ✅ İyi performans (50ms ping)
- ✅ Güvenilir
- ⚠️ Türkçe destek yok

---

## 📋 **Hızlı Kurulum Checklist**

### **1. VPS Satın Al**
- [ ] Vultr hesabı aç
- [ ] İstanbul datacenter seç
- [ ] Ubuntu 22.04 LTS seç
- [ ] SSH key ekle
- [ ] Sunucu başlat

### **2. İlk Bağlantı**
```bash
ssh root@SUNUCU_IP
```

### **3. Quickstart Script**
```bash
git clone YOUR_REPO /var/www/cnspocket
cd /var/www/cnspocket
chmod +x scripts/*.sh
sudo ./scripts/quickstart.sh
```

### **4. SSL Kur**
```bash
./scripts/setup-ssl.sh
```

### **5. Bitti! 🎉**
```
https://www.notvarmi.com
```

---

## 🔗 **Faydalı Linkler**

- **Vultr**: https://www.vultr.com/
- **Hetzner**: https://www.hetzner.com/cloud
- **DigitalOcean**: https://www.digitalocean.com/
- **Ubuntu Server**: https://ubuntu.com/download/server

---

## 📞 **Sıkça Sorulan Sorular**

### Shared hosting kullanabilir miyim?
❌ Hayır, Node.js ve PostgreSQL desteği çok nadirdir.

### Windows Server olur mu?
❌ Hayır, performans düşük ve script'lerimiz Linux için.

### En ucuz seçenek?
✅ Hetzner Cloud (€4.5/ay)

### En hızlı seçenek?
✅ Vultr İstanbul ($12/ay)

### Türkçe destek önemli mi?
⚠️ İsteğe bağlı - script'lerimiz her şeyi otomatik yapıyor

### RAM artırmalı mıyım?
📊 İlk başta 2GB yeter, trafik artarsa 4GB'a yükselt
