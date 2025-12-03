# CI/CD ve Otomatik Deployment Rehberi

Bu rehber, lokal geliştirme ortamınızdan production sunucusuna otomatik deployment yapmanızı sağlar.

## 🎯 Deployment Yöntemleri

| Yöntem | Zorluk | Otomatiklik | Önerilir |
|--------|--------|-------------|----------|
| **GitHub Actions** | Kolay | Tam otomatik | ✅ En çok |
| **Local Deploy Script** | Çok kolay | Yarı otomatik | ✅ Başlangıç |
| **Git Hooks** | Orta | Otomatik | ⚠️ İleri |
| **Webhook** | Orta | Tam otomatik | ⚠️ İleri |

## 🚀 Yöntem 1: Local Deploy Script (En Basit)

### Kurulum

```bash
# Windows'ta
cd c:\Users\huigf\Desktop\cnspocket\scripts

# Sunucu IP'sini güncelle
notepad deploy-local.bat
# SERVER_HOST=YOUR_SERVER_IP satırını düzenle
```

### Kullanım

**Her kod değişikliğinde:**

```bash
# 1. Değişiklikleri commit et
git add .
git commit -m "Yeni özellik eklendi"

# 2. Deploy script'i çalıştır (Windows)
scripts\deploy-local.bat
```

**Script otomatik olarak:**
1. ✅ GitHub'a push eder
2. ✅ Sunucuya SSH ile bağlanır
3. ✅ update.sh çalıştırır
4. ✅ Deployment sonucunu gösterir

### Avantajlar
- ✅ Çok basit
- ✅ Kontrollü (sen başlatırsın)
- ✅ Hemen sonuç görürsün
- ✅ SSH key ile güvenli

---

## 🔄 Yöntem 2: GitHub Actions (Tam Otomatik)

### Kurulum

#### 1. SSH Key Oluştur (Sunucuda)

```bash
# Sunucuda
ssh-keygen -t ed25519 -C "github-actions"
# Enter tuşuna bas (şifresiz)

# Public key'i authorized_keys'e ekle
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Private key'i göster (kopyala)
cat ~/.ssh/id_ed25519
```

#### 2. GitHub Secrets Ayarla

GitHub repository'nde:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** (3 tane):
   - `SERVER_HOST`: Sunucu IP adresi
   - `SERVER_USER`: SSH kullanıcı adı (genelde `root`)
   - `SERVER_SSH_KEY`: Private key (yukarıda kopyaladığın)

#### 3. Workflow Dosyası (Zaten Hazır)

`.github/workflows/deploy.yml` dosyası zaten oluşturduk!

### Kullanım

**Artık sadece GitHub'a push et:**

```bash
git add .
git commit -m "Yeni özellik"
git push origin main
```

**GitHub Actions otomatik olarak:**
1. ✅ Push'u algılar
2. ✅ Sunucuya bağlanır
3. ✅ update.sh çalıştırır
4. ✅ Sonucu GitHub'da gösterir

### İzleme

1. GitHub repository → **Actions** tab
2. Son deployment'ı göreceksin
3. Yeşil ✅ = Başarılı, Kırmızı ❌ = Hata

---

## 📡 Yöntem 3: Webhook (İleri Seviye)

### Sunucu Kurulumu

```bash
# Sunucuda webhook API endpoint oluştur
cd /var/www/cnspocket

# Webhook script'i düzenle
chmod +x scripts/webhook-deploy.sh

# Basit webhook server kur
npm install -g webhook
```

**Webhook config** (`/etc/webhook.conf`):

```json
[
  {
    "id": "deploy-notvarmi",
    "execute-command": "/var/www/cnspocket/scripts/webhook-deploy.sh",
    "command-working-directory": "/var/www/cnspocket",
    "response-message": "Deployment triggered",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha256",
        "secret": "YOUR_WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

### GitHub Webhook Ayarla

1. Repository **Settings** → **Webhooks**
2. **Add webhook**:
   - URL: `http://YOUR_SERVER_IP:9000/hooks/deploy-notvarmi`
   - Secret: `YOUR_WEBHOOK_SECRET`
   - Events: Just the push event

---

## 💻 Development Workflow

### Günlük Geliştirme

```bash
# 1. Lokal'de değişiklik yap
# VSCode'da kod düzenle

# 2. Test et
npm run dev

# 3. Commit et
git add .
git commit -m "Özellik açıklaması"

# 4a. GitHub Actions kullanıyorsan (otomatik)
git push origin main

# 4b. Local script kullanıyorsan
scripts\deploy-local.bat

# 5. Siteyi kontrol et
# https://www.notvarmi.com
```

### Hızlı Düzeltmeler (Hotfix)

```bash
# 1. Acil düzeltme yap
git add .
git commit -m "hotfix: kritik hata düzeltildi"

# 2. Hemen deploy et
scripts\deploy-local.bat

# 3. Doğrula
curl https://www.notvarmi.com/api/health
```

---

## 🔍 Deployment İzleme

### GitHub Actions Logları

1. GitHub → **Actions** tab
2. Son workflow'a tıkla
3. Deployment adımlarını gör

### Sunucu Logları

```bash
# SSH ile bağlan
ssh root@YOUR_SERVER_IP

# PM2 logs
pm2 logs notvarmi-app

# Deployment logs
tail -f /var/log/notvarmi/webhook-deploy.log

# Nginx logs
tail -f /var/log/nginx/notvarmi_error.log
```

### Health Check

```bash
# Lokal'den kontrol
curl https://www.notvarmi.com/api/health

# Veya browser'da
https://www.notvarmi.com/api/health
```

---

## 🐛 Sorun Giderme

### Deployment Başarısız

```bash
# 1. GitHub Actions loglarını kontrol et
# Actions tab'ında error mesajını oku

# 2. Sunucuda manuel kontrol
ssh root@YOUR_SERVER_IP
cd /var/www/cnspocket
./scripts/update.sh

# 3. PM2 durumu
pm2 status
pm2 logs notvarmi-app --lines 50
```

### SSH Bağlantı Hatası

```bash
# SSH key test et
ssh -i ~/.ssh/id_ed25519 root@YOUR_SERVER_IP

# Key permissions
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Build Hatası

```bash
# Lokal'de test et
npm run build

# Başarısızsa düzelt ve tekrar commit
git add .
git commit -m "build hatası düzeltildi"
git push origin main
```

---

## 📊 Karşılaştırma

### Local Deploy Script vs GitHub Actions

| Özellik | Local Script | GitHub Actions |
|---------|--------------|----------------|
| Setup | 2 dakika | 5 dakika |
| Otomatiklik | Manuel | Tam otomatik |
| Kontrol | Tam kontrol | Push sonrası |
| Hız | Hızlı | ~2-3 dk gecikmeli |
| Log | SSH gerekli | GitHub UI |
| Maliyet | Ücretsiz | Ücretsiz* |
| Önerilir | Başlangıç | Production |

*GitHub Actions: 2000 dakika/ay ücretsiz

---

## 🎯 Hangi Yöntemi Seçmeli?

### Başlangıç (İlk Hafta)
→ **Local Deploy Script** 
- Basit
- Kontrollü
- Hızlı feedback

### Production (Sonrası)
→ **GitHub Actions**
- Tam otomatik
- Her push deploy olur
- Takım çalışmasına uygun

### İleri Seviye
→ **Webhook + Staging**
- Staging environment
- Production guardian
- Custom pipeline

---

## 💡 Best Practices

### 1. Branching Strategy

```bash
# Development branch
git checkout -b dev
# Geliştirme yap...
git push origin dev

# Production'a merge
git checkout main
git merge dev
git push origin main  # Bu deploy eder
```

### 2. Semantic Commit Messages

```bash
git commit -m "feat: yeni özellik eklendi"
git commit -m "fix: bug düzeltildi"
git commit -m "hotfix: kritik hata"
git commit -m "refactor: kod iyileştirildi"
```

### 3. Test Before Deploy

```bash
# Lokal test
npm run build
npm start

# Browser test
http://localhost:3000

# Deploy
git push origin main
```

### 4. Rollback Planı

Her deployment öncesi otomatik backup alınır (`update.sh`).

Hata olursa:
```bash
ssh root@YOUR_SERVER_IP
cd /var/www/cnspocket
./scripts/rollback.sh
```

---

## 📞 Hızlı Başvuru

### Lokal'den Deploy

```bash
# Windows
scripts\deploy-local.bat

# Linux/Mac
./scripts/deploy-local.sh
```

### GitHub Actions Deploy

```bash
git push origin main
# Otomatik deploy başlar
```

### Manuel Sunucu Deploy

```bash
ssh root@YOUR_SERVER_IP
cd /var/www/cnspocket
./scripts/update.sh
```

### Rollback

```bash
ssh root@YOUR_SERVER_IP
cd /var/www/cnspocket
./scripts/rollback.sh
```

---

## 🔗 İlgili Dökümanlar

- **[SCRIPTS_GUIDE.md](./SCRIPTS_GUIDE.md)** - Tüm script'lerin kullanımı
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment detayları
- **[README.md](./README.md)** - Genel bakış
