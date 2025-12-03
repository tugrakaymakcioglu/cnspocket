'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations();
        }
    }, [status]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLastSeen = (lastSeenDate) => {
        if (!lastSeenDate) return 'Bilinmiyor';

        const now = new Date();
        const lastSeen = new Date(lastSeenDate);
        const diffMs = now - lastSeen;

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (minutes < 1) return 'Az önce';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        if (weeks < 4) return `${weeks} hafta önce`;
        if (months < 12) return `${months} ay önce`;
        return `${years} yıl önce`;
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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: 'var(--text)',
                        margin: 0
                    }}>
                        💬 Mesajlarım
                    </h1>
                    <Link href="/forum" style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--secondary)',
                        color: 'var(--text)',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        fontWeight: '600',
                        border: '1px solid var(--border)',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-purple)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        Foruma Dön
                    </Link>
                </div>

                {/* Conversations List */}
                {conversations.length === 0 ? (
                    <div style={{
                        background: 'var(--secondary)',
                        borderRadius: '24px',
                        padding: '4rem',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>💬</div>
                        <h2 style={{
                            color: 'var(--text)',
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            Henüz mesajınız yok
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem'
                        }}>
                            Bir kullanıcının profiline giderek mesaj göndermeye başlayın!
                        </p>
                    </div>
                ) : (
                    <div style={{
                        background: 'var(--secondary)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)'
                    }}>
                        {conversations.map((conversation) => (
                            <Link
                                key={conversation.userId}
                                href={`/messages/${conversation.userId}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.5rem 2rem',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    transition: 'all 0.3s ease',
                                    background: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--background)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {/* Avatar */}
                                {conversation.user.avatar ? (
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        border: '2px solid var(--accent-purple)'
                                    }}>
                                        <Image
                                            src={conversation.user.avatar}
                                            alt={conversation.user.name || conversation.user.username}
                                            width={60}
                                            height={60}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent-purple) 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {conversation.user.name ? conversation.user.name.charAt(0).toUpperCase() : '👤'}
                                    </div>
                                )}

                                {/* Message Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            color: 'var(--text)',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {conversation.user.name || conversation.user.username}
                                        </h3>
                                        {/* Online Status */}
                                        {conversation.user.showOnlineStatus !== false && (
                                            conversation.user.isOnline ? (
                                                <span style={{
                                                    color: '#10b981',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: '#10b981',
                                                        display: 'inline-block'
                                                    }}></span>
                                                    çevrimiçi
                                                </span>
                                            ) : (
                                                <span style={{
                                                    color: '#9ca3af',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {formatLastSeen(conversation.user.lastSeen)}
                                                </span>
                                            )
                                        )}
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {conversation.lastMessage}
                                    </p>
                                </div>

                                {/* Time and Badge */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '0.5rem',
                                    flexShrink: 0
                                }}>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {new Date(conversation.lastMessageTime).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                    {conversation.unreadCount > 0 && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {conversation.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
