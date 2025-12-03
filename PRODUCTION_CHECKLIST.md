# Production Checklist - Son Kontrol Listesi

Deployment öncesi son kontroller:

## ✅ Lokal Hazırlık (Tamamlandı)

- [x] Production build başarılı
- [x] Environment variables yapılandırıldı
- [x] Güvenlik ayarları eklendi
- [x] Backup sistemi hazır
- [x] Health check endpoint eklendi
- [x] PM2 ecosystem config oluşturuldu
- [x] README.md hazırlandı
- [x] robots.txt eklendi
- [x] Deployment dokümantasyonu tamamlandı

## 📋 Sunucuda Yapılacak Kontroller

### Deployment Öncesi
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] Node.js 18+ kurulu
- [ ] Nginx kurulu
- [ ] Domain DNS ayarları yapıldı (A record)
- [ ] Firewall ayarları yapıldı (22, 80, 443)

### Deployment Sırasında
- [ ] `.env` dosyası doğru bilgilerle oluşturuldu
- [ ] `NEXTAUTH_SECRET` güçlü ve rastgele (openssl ile)
- [ ] `DATABASE_URL` doğru PostgreSQL bağlantı bilgilerini içeriyor
- [ ] `npm install` hatasız tamamlandı
- [ ] `npx prisma db push` başarılı
- [ ] `npm run build` başarılı
- [ ] PM2 ile uygulama başlatıldı
- [ ] Nginx reverse proxy kuruldu
- [ ] SSL sertifikası alındı (Let's Encrypt)

### Deployment Sonrası
- [ ] Ana sayfa açılıyor (`https://www.notvarmı.com`)
- [ ] Kayıt işlemi çalışıyor
- [ ] Login işlemi çalışıyor
- [ ] Forum post oluşturma çalışıyor
- [ ] Mesajlaşma çalışıyor
- [ ] Health check çalışıyor (`/api/health`)
- [ ] PM2 otomatik restart ayarlandı (`pm2 startup`)
- [ ] Otomatik backup cron job kuruldu
- [ ] Log dosyaları oluşuyor

### Güvenlik Kontrolleri
- [ ] HTTPS çalışıyor (SSL certificate)
- [ ] HTTP'den HTTPS'e redirect çalışıyor
- [ ] `.env` dosyası izinleri doğru (`chmod 600`)
- [ ] Firewall aktif ve doğru portlar açık
- [ ] PostgreSQL sadece localhost'tan erişilebilir
- [ ] Admin paneline sadece admin yetkili erişebiliyor

### Performance & Monitoring
- [ ] Sayfa yükleme süreleri normal (< 3 saniye)
- [ ] PM2 monitoring aktif (`pm2 monit`)
- [ ] Health check endpoint test edildi
- [ ] Database connection pool çalışıyor
- [ ] Nginx access/error logları kontrol edildi

## 🔧 Test Komutları

```bash
# Health check
curl https://www.notvarmı.com/api/health

# PM2 durum
pm2 status

# Nginx durum
sudo systemctl status nginx

# PostgreSQL durum
sudo systemctl status postgresql

# Disk kullanımı
df -h

# Memory kullanımı
free -m

# Son loglar
pm2 logs notvarmi-app --lines 50
```

## 📊 İlk Hafta İzleme

- [ ] Her gün backup alınıyor mu kontrol et
- [ ] Error loglarını kontrol et
- [ ] Sistem kaynaklarını izle (CPU, RAM, Disk)
- [ ] SSL sertifikası otomatik yenileme çalışıyor mu test et
- [ ] Uptime izle (en az %99.9)

## 🚨 Acil Durum Hazırlığı

- [ ] Backup restore testi yapıldı
- [ ] Rollback prosedürü dokümante edildi
- [ ] Critical hatalar için alert sistemi var
- [ ] Admin iletişim bilgileri güncellendi

## ✨ Opsiyonel İyileştirmeler (İleride)

- [ ] CDN kullanımı (CloudFlare, AWS CloudFront)
- [ ] Redis cache ekle
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database backup uzak sunucuya
- [ ] Rate limiting API routes için
- [ ] Email bildirimler için SMTP aktif et

---

**Tüm kontroller tamamlandığında deployment hazır demektir!** 🚀
