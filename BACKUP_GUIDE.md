# PostgreSQL Backup ve Restore Rehberi

Bu rehber, NotVarmı uygulamanızın PostgreSQL veritabanını yedekleme ve geri yükleme işlemlerini açıklar.

## 🔧 Kurulum

### 1. Backup Dizini Oluşturma

```bash
# Backup dizini oluştur
sudo mkdir -p /backup/notvarmi
sudo chown $USER:$USER /backup/notvarmi
```

### 2. Script İzinlerini Ayarlama

```bash
cd /var/www/cnspocket/scripts
chmod +x backup-postgres.sh
chmod +x restore-postgres.sh
```

## 💾 Manuel Backup Alma

### Basit Kullanım

```bash
# Script ile backup al (önerilir)
cd /var/www/cnspocket/scripts
./backup-postgres.sh
```

### Doğrudan PostgreSQL Komutları

```bash
# Sıkıştırılmış backup (önerilir)
pg_dump -U notvarmi_user -h localhost notvarmi_db | gzip > /backup/notvarmi/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz

# Normal backup (sıkıştırılmamış)
pg_dump -U notvarmi_user -h localhost notvarmi_db > /backup/notvarmi/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql

# Sadece data (schema olmadan)
pg_dump -U notvarmi_user -h localhost --data-only notvarmi_db | gzip > /backup/notvarmi/data_only_$(date +\%Y\%m\%d).sql.gz

# Sadece schema (data olmadan)
pg_dump -U notvarmi_user -h localhost --schema-only notvarmi_db > /backup/notvarmi/schema_only.sql
```

## ⏰ Otomatik Günlük Backup

### Cron Job Kurulumu

```bash
# Crontab düzenle
crontab -e

# Aşağıdaki satırları ekleyin:

# Her gece saat 02:00'de backup al
0 2 * * * /var/www/cnspocket/scripts/backup-postgres.sh >> /var/log/notvarmi-backup.log 2>&1

# 30 günden eski backupları otomatik sil (her gün 03:00'te)
0 3 * * * find /backup/notvarmi -name "*.sql.gz" -mtime +30 -delete
```

### Alternatif: Systemd Timer (Modern Yaklaşım)

```bash
# Service dosyası oluştur
sudo nano /etc/systemd/system/notvarmi-backup.service
```

İçeriği:
```ini
[Unit]
Description=NotVarmı PostgreSQL Backup
After=postgresql.service

[Service]
Type=oneshot
User=your-user
ExecStart=/var/www/cnspocket/scripts/backup-postgres.sh
StandardOutput=journal
StandardError=journal
```

```bash
# Timer dosyası oluştur
sudo nano /etc/systemd/system/notvarmi-backup.timer
```

İçeriği:
```ini
[Unit]
Description=NotVarmı Daily Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Timer'ı etkinleştir ve başlat
sudo systemctl enable notvarmi-backup.timer
sudo systemctl start notvarmi-backup.timer

# Timer durumunu kontrol et
sudo systemctl status notvarmi-backup.timer
sudo systemctl list-timers
```

## 📥 Backup'tan Geri Yükleme (Restore)

### Script ile Restore (Önerilir)

```bash
# Mevcut backupları listele
ls -lht /backup/notvarmi/*.sql.gz | head -10

# Restore işlemi
cd /var/www/cnspocket/scripts
./restore-postgres.sh /backup/notvarmi/backup_20251201_120000.sql.gz
```

### Manuel Restore

```bash
# 1. Uygulamayı durdur
pm2 stop notvarmi

# 2. Veritabanını sil ve yeniden oluştur
dropdb -U notvarmi_user notvarmi_db
createdb -U notvarmi_user notvarmi_db

# 3. Backup'ı restore et
# Sıkıştırılmış backup için:
gunzip -c /backup/notvarmi/backup_20251201.sql.gz | psql -U notvarmi_user -h localhost -d notvarmi_db

# Normal backup için:
psql -U notvarmi_user -h localhost -d notvarmi_db < /backup/notvarmi/backup_20251201.sql

# 4. Uygulamayı başlat
pm2 restart notvarmi
```

## 📊 Backup Yönetimi

### Backup Dosyalarını Listeleme

```bash
# En son 10 backup
ls -lht /backup/notvarmi/*.sql.gz | head -10

# Backup boyutlarını göster
du -h /backup/notvarmi/*.sql.gz

# Toplam backup boyutu
du -sh /backup/notvarmi/
```

### Eski Backupları Temizleme

```bash
# 30 günden eski backupları sil
find /backup/notvarmi -name "*.sql.gz" -mtime +30 -delete

# 60 günden eski backupları sil
find /backup/notvarmi -name "*.sql.gz" -mtime +60 -delete

# Sadece son 10 backup'ı tut, diğerlerini sil
cd /backup/notvarmi
ls -t *.sql.gz | tail -n +11 | xargs rm -f
```

### Backup'ı Test Etme

```bash
# Backup dosyasının bozuk olmadığını kontrol et
gunzip -t /backup/notvarmi/backup_20251201.sql.gz

# Backup dosyasının içeriğini görüntüle
gunzip -c /backup/notvarmi/backup_20251201.sql.gz | head -20
```

## 🌐 Uzak Sunucuya Backup Gönderme

### SCP ile

```bash
# Backup'ı uzak sunucuya kopyala
scp /backup/notvarmi/backup_20251201.sql.gz user@remote-server:/backup/

# Tüm backupları kopyala
scp /backup/notvarmi/*.sql.gz user@remote-server:/backup/notvarmi/
```

### rsync ile (Daha Verimli)

```bash
# Sadece yeni backupları senkronize et
rsync -avz /backup/notvarmi/ user@remote-server:/backup/notvarmi/

# Silinen dosyaları da senkronize et
rsync -avz --delete /backup/notvarmi/ user@remote-server:/backup/notvarmi/
```

### Otomatik Uzak Backup

Crontab'a ekleyin:
```bash
# Her gece 04:00'te uzak sunucuya backup gönder
0 4 * * * rsync -avz /backup/notvarmi/ user@remote-server:/backup/notvarmi/ >> /var/log/remote-backup.log 2>&1
```

## 🔐 Güvenlik Önerileri

### 1. Backup Dizini İzinleri

```bash
# Sadece owner okuyup yazabilsin
chmod 700 /backup/notvarmi
chmod 600 /backup/notvarmi/*.sql.gz
```

### 2. Şifrelenmiş Backup

```bash
# GPG ile şifrele
pg_dump -U notvarmi_user notvarmi_db | gzip | gpg --symmetric --cipher-algo AES256 > /backup/notvarmi/backup_encrypted_$(date +\%Y\%m\%d).sql.gz.gpg

# Şifrelenmiş backup'ı aç
gpg --decrypt /backup/notvarmi/backup_encrypted_20251201.sql.gz.gpg | gunzip | psql -U notvarmi_user -d notvarmi_db
```

### 3. Farklı Konumlarda Saklama

- ✅ Lokal server'da backup
- ✅ Uzak sunucuda backup (farklı lokasyon)
- ✅ Cloud storage (AWS S3, Google Cloud, Dropbox)
- ✅ External hard drive

## 🚨 Acil Durum Kurtarma

### Hatalı Deployment'tan Geri Dönme

```bash
# 1. Son deployment öncesi backup'ı bul
ls -lt /backup/notvarmi/*.sql.gz | head -5

# 2. Restore et
./restore-postgres.sh /backup/notvarmi/backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Önceki commit'e dön
git log --oneline
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart notvarmi
```

### Veritabanı Bozulması

```bash
# 1. En son backup'ı restore et
./restore-postgres.sh /backup/notvarmi/backup_latest.sql.gz

# 2. Veritabanı tutarlılığını kontrol et
psql -U notvarmi_user -d notvarmi_db -c "SELECT count(*) FROM \"User\";"
psql -U notvarmi_user -d notvarmi_db -c "SELECT count(*) FROM \"Post\";"
```

## 📝 Backup Checklist

Production ortamında mutlaka yapın:

- [ ] Günlük otomatik backup kuruldu
- [ ] 30 günden eski backuplar otomatik siliniyor
- [ ] Backup script'leri çalıştırılabilir (`chmod +x`)
- [ ] Backup dizini izinleri doğru (`chmod 700`)
- [ ] En az bir restore testi yapıldı
- [ ] Uzak sunucuya veya cloud'a backup yapılıyor
- [ ] Backup log'ları tutulmaya başlandı
- [ ] Backup boyutları düzenli kontrol ediliyor

## 💡 İpuçları

1. **Düzenli Test Edin**: Ayda bir restore testi yapın
2. **3-2-1 Kuralı**: 3 kopya, 2 farklı medya, 1 offsite backup
3. **Monitoring**: Backup başarısızlıklarını izleyin
4. **Dokümantasyon**: Restore prosedürünü dokümante edin
5. **Encryption**: Hassas veriler için backup şifreleme kullanın

## ❓ Sorun Giderme

### "Permission denied" hatası
```bash
sudo chown -R $USER:$USER /backup/notvarmi
chmod +x scripts/backup-postgres.sh
```

### "FATAL: Peer authentication failed"
```bash
# PostgreSQL pg_hba.conf düzenleyin
sudo nano /etc/postgresql/14/main/pg_hba.conf
# "peer" olan satırları "md5" yapın
sudo systemctl restart postgresql
```

### Backup çok büyük
```bash
# Sadece son 30 günün verisini backup al
pg_dump -U notvarmi_user notvarmi_db --where="created_at > NOW() - INTERVAL '30 days'" | gzip > backup.sql.gz
```
