# Google Analytics - Usage Examples

Bu dosya, enhanced Google Analytics sisteminin nasıl kullanılacağını gösterir.

## 🎯 Otomatik Tracking

### Page View Tracking (Otomatik)

`useAnalytics` hook'u kullanıldığında otomatik olarak çalışır:

```javascript
'use client';
import useAnalytics from '@/hooks/useAnalytics';

export default function MyPage() {
    useAnalytics(); // Bu kadar! Sayfa görüntüleme, scroll, time otomatik track edilir
    
    return <div>My Content</div>;
}
```

## 📊 Manuel Event Tracking

### Import

```javascript
import { analytics } from '@/lib/analytics';
```

### Auth Events

```javascript
// Login
analytics.login('email'); // veya 'google', 'facebook'

// Register
analytics.register('email');

// Logout
analytics.logout();
```

### Forum Events

```javascript
// Post oluşturma
analytics.createPost('ders-notlari');

// Reply
analytics.createReply('post_123');

// Vote
analytics.vote('upvote', 'post_123');
analytics.vote('downvote', 'reply_456');

// Share
analytics.share('twitter', 'post');
analytics.share('whatsapp', 'course');
analytics.share('copy_link', 'profile');

// Report
analytics.report('post', 'post_123');
analytics.report('user', 'user_456');
```

### File Events

```javascript
// Download
analytics.downloadFile('ders-notu.pdf');

// Upload
analytics.uploadFile(
    'ders-notu.pdf',
    1048576, // bytes
    'application/pdf'
);
```

### Message Events

```javascript
// Mesaj gönderme
analytics.sendMessage('user_123');

// Bildirim okuma
analytics.readNotification('new_message');
analytics.readNotification('new_reply');

// Tümünü okundu işaretle
analytics.markAllRead();
```

### Button & Form Events

```javascript
// Button tıklama
analytics.buttonClick('submit', 'contact_form');
analytics.buttonClick('share', 'post_card');

// Form gönderme
analytics.formSubmit('contact_form', true); // başarılı
analytics.formSubmit('login_form', false); // başarısız
```

### Search Events

```javascript
analytics.search('lineer cebir notları');
```

### Calendar & Tasks

```javascript
// Görev oluşturma
analytics.createTask('homework');

// Görev tamamlama
analytics.completeTask('homework');

// Takvim görünümü
analytics.viewCalendar('month');
```

### Theme & Settings

```javascript
// Tema değiştirme
analytics.changeTheme('dark');
analytics.changeTheme('light');

// Dil değiştirme
analytics.changeLanguage('tr');
analytics.changeLanguage('en');
```

### Performance Tracking

```javascript
// API çağrısı
analytics.apiCall('/api/posts', 234, 200); // endpoint, duration(ms), status

// Genel performans
analytics.performance('page_load', 1234);
analytics.performance('image_load', 567);
```

### Error Tracking

```javascript
// Genel hata
analytics.error('Failed to load posts', false);

// Fatal error
analytics.error('Critical database error', true);

// API hatası
analytics.apiError('/api/posts', 500, 'Internal Server Error');

// 404 hatası
analytics.notFound('/non-existent-page');
```

## 🔧 Component Entegrasyonu Örnekleri

### Login Component

```javascript
'use client';
import { analytics } from '@/lib/analytics';

export default function LoginForm() {
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch('/api/auth/login', {...});
            
            if (res.ok) {
                analytics.login('email');
                analytics.formSubmit('login_form', true);
            } else {
                analytics.formSubmit('login_form', false);
            }
        } catch (error) {
            analytics.error('Login failed: ' + error.message);
        }
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

### Post Card Component

```javascript
'use client';
import { analytics } from '@/lib/analytics';

export default function PostCard({ post }) {
    const handleVote = (type) => {
        analytics.vote(type, post.id);
        // ... voting logic
    };

    const handleShare = (platform) => {
        analytics.share(platform, 'post');
        // ... share logic
    };

    return (
        <div>
            <button onClick={() => handleVote('upvote')}>👍</button>
            <button onClick={() => handleVote('downvote')}>👎</button>
            <button onClick={() => handleShare('twitter')}>Share</button>
        </div>
    );
}
```

### File Upload Component

```javascript
'use client';
import { analytics } from '@/lib/analytics';

export default function FileUpload() {
    const handleUpload = async (file) => {
        try {
            // Upload logic...
            
            analytics.uploadFile(
                file.name,
                file.size,
                file.type
            );
        } catch (error) {
            analytics.error('File upload failed: ' + error.message);
        }
    };

    return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

## 🐛 Development Testing

`.env.local` dosyasına ekle:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_DEBUG=true
```

Development mode'da tüm GA events console'da loglanacak!

## 📈 Production Setup

`.env.production` veya hosting platformunda:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`NEXT_PUBLIC_GA_DEBUG` yoksa veya `false` ise sadece production'da çalışır.
