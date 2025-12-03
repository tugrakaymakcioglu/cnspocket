# SSL ve HTTPS Kurulum Rehberi

Bu rehber, NotVarmı uygulamanız için SSL sertifikası kurulumu ve HTTPS yapılandırmasını açıklar.

## 🔐 Otomatik SSL Kurulumu (Önerilir)

### Hızlı Kurulum

```bash
cd /var/www/cnspocket/scripts

# Email adresini güncelleyin (script içinde)
sudo nano setup-ssl.sh
# EMAIL="your-email@example.com" satırını değiştirin

# Script'i çalıştırılabilir yapın
chmod +x setup-ssl.sh

# SSL kurulumunu başlatın
sudo ./setup-ssl.sh
```

Script otomatik olarak:
- ✅ Certbot kurulumunu kontrol eder
- ✅ Let's Encrypt'ten ücretsiz SSL sertifikası alır
- ✅ Nginx SSL konfigürasyonunu uygular
- ✅ Otomatik yenileme ayarlar (cron job)
- ✅ HTTPS'i aktif eder

## 📋 Manuel SSL Kurulumu

### 1. Certbot Kurulumu

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 2. SSL Sertifikası Alma

```bash
# Nginx'i geçici olarak durdur
sudo systemctl stop nginx

# Sertifika al
sudo certbot certonly --standalone \
  --preferred-challenges http \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d www.notvarmı.com \
  -d notvarmı.com

# Nginx'i tekrar başlat
sudo systemctl start nginx
```

### 3. Nginx SSL Konfigürasyonu

```bash
# Hazır SSL config'i kopyala
sudo cp /var/www/cnspocket/config/nginx-ssl.conf /etc/nginx/sites-available/notvarmi

# Mevcut config'i yedekle (varsa)
sudo mv /etc/nginx/sites-available/notvarmi /etc/nginx/sites-available/notvarmi.bak

# Yeni config'i aktif et
sudo ln -sf /etc/nginx/sites-available/notvarmi /etc/nginx/sites-enabled/

# Config'i test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### 4. Otomatik Yenileme

```bash
# Test et
sudo certbot renew --dry-run

# Cron job ekle
sudo crontab -e

# Aşağıdaki satırı ekle:
0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'
```

## 🔍 SSL Durumu Kontrol

### Script ile Kontrol

```bash
cd /var/www/cnspocket/scripts
chmod +x check-ssl.sh
./check-ssl.sh
```

### Manuel Kontrol

```bash
# Sertifika bilgileri
sudo certbot certificates

# Son kullanma tarihi
sudo certbot certificates | grep "Expiry Date"

# SSL test (browser)
# https://www.ssllabs.com/ssltest/analyze.html?d=www.notvarmı.com
```

## 🔄 SSL Sertifikası Yenileme

### Otomatik Yenileme (Önerilir)

Cron job aktifse, sertifikalar otomatik yenilenecek (günde 2 kez kontrol).

### Manuel Yenileme

```bash
# Normal yenileme
sudo certbot renew

# Zorla yenileme
sudo certbot renew --force-renewal

# Nginx'i reload et
sudo systemctl reload nginx
```

## 🛡️ Güvenlik Özellikleri

Nginx SSL konfigürasyonumuz şunları içerir:

### 1. Modern SSL/TLS
- TLS 1.2 ve 1.3 desteği
- Güçlü cipher suite'ler
- Perfect Forward Secrecy (PFS)

### 2. HSTS (HTTP Strict Transport Security)
```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```
- Tarayıcıları HTTPS kullanmaya zorlar
- 2 yıl süreyle cache'lenir

### 3. OCSP Stapling
- SSL handshake süresini kısaltır
- Privacy artırır

### 4. Security Headers
- X-Frame-Options (clickjacking koruması)
- X-Content-Type-Options (MIME sniffing koruması)
- X-XSS-Protection
- Permissions-Policy

### 5. HTTP → HTTPS Yönlendirme
```nginx
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

## 🚨 Sorun Giderme

### Sertifika Alınamıyor

```bash
# Port 80'in açık olduğunu kontrol et
sudo netstat -tulpn | grep :80

# Firewall kontrolü
sudo ufw status

# DNS kontrolü
dig www.notvarmı.com
```

### "Too Many Failed Authorizations" Hatası

Let's Encrypt rate limit aşıldı. Çözümler:
1. 1 saat bekleyin
2. Test için staging environment kullanın:
```bash
sudo certbot certonly --staging --standalone -d www.notvarmı.com
```

### Nginx SSL Hatası

```bash
# Config dosyasını test et
sudo nginx -t

# Error loglarını kontrol et
sudo tail -f /var/log/nginx/error.log
```

### Sertifika Yenilenmiyor

```bash
# Renewal testi
sudo certbot renew --dry-run

# Cron job kontrolü
sudo crontab -l | grep certbot

# Manual yenileme
sudo certbot renew --force-renewal
```

## 📊 SSL Sağlık Kontrolü

### SSL Labs Test

En kapsamlı SSL testi için:
```
https://www.ssllabs.com/ssltest/analyze.html?d=www.notvarmı.com
```

Hedef: **A+ rating** ✨

### Browser Kontrol

```bash
# Chrome/Edge DevTools
# F12 > Security tab

# Firefox
# F12 > Security tab
```

### OpenSSL ile Test

```bash
# SSL bağlantı testi
openssl s_client -connect www.notvarmı.com:443 -servername www.notvarmı.com

# Sertifika bilgileri
echo | openssl s_client -servername www.notvarmı.com -connect www.notvarmı.com:443 2>/dev/null | openssl x509 -noout -dates

# Cipher suite kontrolü
nmap --script ssl-enum-ciphers -p 443 www.notvarmı.com
```

## 🔒 Ekstra Güvenlik (Opsiyonel)

### CAA Record (DNS)

Domain yöneticinizde CAA record ekleyin:
```
notvarmı.com. CAA 0 issue "letsencrypt.org"
```

### HSTS Preload

[hstspreload.org](https://hstspreload.org) sitesinde domain'inizi kaydedin.

### Certificate Transparency Monitoring

[crt.sh](https://crt.sh/?q=notvarmı.com) ile sertifikalarınızı izleyin.

## 📝 SSL Checklist

Kurulum sonrası kontroller:

- [ ] SSL sertifikası alındı
- [ ] HTTPS erişimi çalışıyor
- [ ] HTTP otomatik HTTPS'e yönleniyor
- [ ] Tarayıcıda yeşil kilit ikonu görünüyor
- [ ] SSL Labs testi A+ rating aldı
- [ ] HSTS header aktif
- [ ] Otomatik yenileme cron job kuruldu
- [ ] Yenileme testi başarılı (`--dry-run`)
- [ ] Sertifika son kullanma tarihi 90 günden uzun
- [ ] Mixed content uyarısı yok

## 💡 Best Practices

1. **Sertifika Yenileme**: 90 günde bir otomatik yenilenir
2. **Monitoring**: Sertifika süresini izleyin (30 gün kala alarm)
3. **Backup**: Sertifika private key'leri yedekleyin
4. **Testing**: Her değişiklikten sonra SSL Labs test edin
5. **Logs**: Nginx SSL loglarını düzenli kontrol edin

## 📞 Destek

SSL ile ilgili sorunlar için:
- Let's Encrypt Docs: https://letsencrypt.org/docs/
- Certbot Docs: https://certbot.eff.org/docs/
- Mozilla SSL Config: https://ssl-config.mozilla.org/
