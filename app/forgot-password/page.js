'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Bir hata oluştu');
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 1rem',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)'
        }}>
            <div style={{
                backgroundColor: 'var(--secondary)',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                {/* Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}>
                    🔐
                </div>

                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    color: 'var(--text)',
                    fontSize: '2rem',
                    fontWeight: '700'
                }}>Şifremi Unuttum</h1>

                {!isSubmitted ? (
                    <>
                        <p style={{
                            textAlign: 'center',
                            marginBottom: '2rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
                        </p>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {error && (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    fontSize: '0.9rem',
                                    textAlign: 'center'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    📧 E-posta Adresi
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ornek@universite.edu.tr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem 1rem',
                                        borderRadius: '12px',
                                        border: '2px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '1.1rem',
                                    background: isSubmitting ? 'var(--text-secondary)' : 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontWeight: '700',
                                    fontSize: '1.05rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSubmitting ? 'none' : '0 8px 20px rgba(59, 130, 246, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                                }}>
                                {isSubmitting ? '⏳ Gönderiliyor...' : '✉️ Sıfırlama Bağlantısı Gönder'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2.5rem',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                        }}>
                            ✅
                        </div>
                        <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>E-posta Gönderildi!</h3>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '2rem',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            Lütfen e-posta kutunuzu kontrol edin ve talimatları izleyin
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: 'transparent',
                                border: '2px solid var(--accent-blue)',
                                color: 'var(--accent-blue)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent-blue)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--accent-blue)';
                            }}>
                            🔄 Tekrar Gönder
                        </button>
                    </div>
                )}

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--background)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <Link href="/login" style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.2s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        ←  Giriş Ekranına Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
