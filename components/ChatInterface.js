'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatInterface({ userId, otherUser }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMessages();
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: userId,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 4rem)',
            background: 'var(--secondary)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
        }}>
            {/* Chat Header */}
            <div style={{
                padding: '1.5rem 2rem',
                background: 'var(--background)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                {otherUser.avatar ? (
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--accent-purple)'
                    }}>
                        <Image
                            src={otherUser.avatar}
                            alt={otherUser.name || otherUser.username}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                    </div>
                ) : (
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-purple) 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                )}
                <Link
                    href={`/profile/${otherUser.username}`}
                    style={{
                        textDecoration: 'none',
                        flex: 1,
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <div>
                        <h2 style={{
                            margin: 0,
                            color: 'var(--text)',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            {otherUser.name || otherUser.username}
                        </h2>
                        <p style={{
                            margin: 0,
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}>
                            @{otherUser.username}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        padding: '4rem',
                        fontSize: '1.1rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                        Henüz mesaj yok. İlk mesajı gönderin!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = message.sender.id !== userId;
                        return (
                            <div
                                key={message.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    minWidth: '120px', // Ensure space for time and tick
                                    width: 'fit-content',
                                    padding: '0.5rem 1rem', // Thinner padding
                                    borderRadius: isOwnMessage
                                        ? '16px 16px 4px 16px'
                                        : '16px 16px 16px 4px',
                                    background: isOwnMessage
                                        ? 'linear-gradient(135deg, var(--accent-purple) 0%, #764ba2 100%)'
                                        : 'var(--background)',
                                    color: isOwnMessage ? 'white' : 'var(--text)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <p style={{
                                        margin: '0 0 0.2rem 0',
                                        lineHeight: '1.4',
                                        wordBreak: 'break-word',
                                        fontSize: '0.95rem'
                                    }}>
                                        {message.content}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '4px',
                                        fontSize: '0.7rem',
                                        opacity: 0.8,
                                        marginTop: 'auto',
                                        alignSelf: 'flex-end'
                                    }}>
                                        <span>
                                            {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {isOwnMessage && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: message.read ? '#00B2FF' : 'rgba(255,255,255,0.7)'
                                            }}>
                                                {/* Double tick for read, single for sent */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                    {message.read && <polyline points="20 12 9 23 4 18" style={{ transform: 'translate(5px, -5px)' }}></polyline>}
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{
                padding: '1.5rem 2rem',
                background: 'var(--background)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '1rem'
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        borderRadius: '50px',
                        border: '1px solid var(--border)',
                        background: 'var(--secondary)',
                        color: 'var(--text)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-purple)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        border: 'none',
                        background: newMessage.trim() && !sending
                            ? 'linear-gradient(135deg, var(--accent-purple) 0%, #764ba2 100%)'
                            : 'var(--border)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: newMessage.trim() && !sending
                            ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                            : 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (newMessage.trim() && !sending) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = newMessage.trim() && !sending
                            ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                            : 'none';
                    }}
                >
                    {sending ? '📤 Gönderiliyor...' : '📤 Gönder'}
                </button>
            </form>
        </div>
    );
}
