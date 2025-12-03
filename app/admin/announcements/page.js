'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/roles';

export default function AnnouncementsAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userRole, setUserRole] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const checkAdminAccess = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.role && isAdmin(data.role)) {
                    setUserRole(data.role);
                    fetchAnnouncements();
                } else {
                    router.push('/');
                }
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
            router.push('/');
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            checkAdminAccess();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                setTitle('');
                setContent('');
                fetchAnnouncements();
            } else {
                const errorData = await res.json();
                alert(`Duyuru oluşturulamadı: ${errorData.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/announcements/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== id));
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentStatus })
            });

            if (res.ok) {
                setAnnouncements(prev => prev.map(a =>
                    a.id === id ? { ...a, active: !currentStatus } : a
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (status === 'loading' || !userRole) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Yükleniyor...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/admin" style={{
                            textDecoration: 'none',
                            fontSize: '1.5rem',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            background: 'var(--secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px'
                        }}>⬅️</Link>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>Duyuru Yönetimi</h1>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Duyuruları oluşturun, düzenleyin ve yönetin.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Column: Create Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{
                            background: 'var(--secondary)',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✍️ Yeni Duyuru Oluştur
                            </h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Başlık</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: Yeni Özellikler Yayında!"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>İçerik</label>
                                    <textarea
                                        placeholder="Duyuru detaylarını buraya yazın..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        rows={6}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'transform 0.2s',
                                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                                    }}
                                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    {loading ? 'Yayınlanıyor...' : '🚀 Duyuruyu Yayınla'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Preview & List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Live Preview */}
                        {(title || content) && (
                            <div style={{
                                background: 'var(--secondary)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid var(--primary)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '20px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '2px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    ÖNİZLEME
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>
                                    {title || 'Başlık Görünümü'}
                                </h3>
                                <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    {content || 'İçerik görünümü burada olacak...'}
                                </p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    {new Date().toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        )}

                        {/* Existing Announcements List */}
                        <div>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem', color: 'var(--text)' }}>📋 Mevcut Duyurular</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {announcements.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--secondary)', borderRadius: '12px' }}>
                                        Henüz hiç duyuru yok.
                                    </div>
                                ) : (
                                    announcements.map(announcement => (
                                        <div key={announcement.id} style={{
                                            background: 'var(--secondary)',
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            opacity: announcement.active ? 1 : 0.7,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{announcement.title}</h3>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            background: announcement.active ? '#10b981' : '#ef4444',
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {announcement.active ? 'YAYINDA' : 'PASİF'}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{announcement.content}</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(announcement.createdAt).toLocaleDateString('tr-TR')} • {announcement.author.name}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => toggleActive(announcement.id, announcement.active)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'transparent',
                                                            color: announcement.active ? '#f59e0b' : '#10b981',
                                                            border: `1px solid ${announcement.active ? '#f59e0b' : '#10b981'}`,
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = announcement.active ? '#f59e0b' : '#10b981';
                                                            e.currentTarget.style.color = 'white';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = announcement.active ? '#f59e0b' : '#10b981';
                                                        }}
                                                    >
                                                        {announcement.active ? 'Gizle' : 'Yayınla'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(announcement.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'transparent',
                                                            color: '#ef4444',
                                                            border: '1px solid #ef4444',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#ef4444';
                                                            e.currentTarget.style.color = 'white';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = '#ef4444';
                                                        }}
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
