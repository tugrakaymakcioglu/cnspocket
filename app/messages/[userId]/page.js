'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';

export default function ConversationPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { userId } = use(params);
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUserData();
        }
    }, [status, userId]);

    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        try {
            console.log('Fetching user data for:', userId);
            const res = await fetch(`/api/messages/${userId}`);
            console.log('API Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('API Data:', data);
                setOtherUser(data.otherUser);
            } else {
                const text = await res.text();
                console.error('API Raw Response:', text);
                try {
                    const errorData = JSON.parse(text);
                    console.error('API Error:', errorData);
                    setError(errorData.error || 'Bir hata oluştu');
                } catch (e) {
                    setError('Sunucu hatası (Yanıt okunamadı)');
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--background)'
            }}>
                <div style={{
                    background: 'var(--secondary)',
                    padding: '2rem 3rem',
                    borderRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid var(--accent-purple)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>Yükleniyor...</span>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!otherUser) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--background)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--text)', marginBottom: '1rem' }}>
                        {error ? `Hata: ${error}` : 'Kullanıcı bulunamadı'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {userId ? `User ID: ${userId}` : ''}
                    </p>
                    <Link href="/messages" style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--accent-purple)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        Mesajlara Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back Button */}
                <Link href="/messages" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-purple)';
                        e.currentTarget.style.borderColor = 'var(--accent-purple)';
                        e.currentTarget.style.transform = 'translateX(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Tüm Mesajlar
                </Link>

                {/* Chat Interface */}
                <ChatInterface userId={userId} otherUser={otherUser} />
            </div>
        </div>
    );
}
