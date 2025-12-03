'use client';

import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // 'alert' or 'confirm'
        message: '',
        title: '',
        variant: 'info', // 'info', 'success', 'warning', 'error'
        onConfirm: null,
        onCancel: null
    });

    const showAlert = (message, variant = 'info', title = '') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'alert',
                message,
                title,
                variant,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: null
            });
        });
    };

    const showConfirm = (message, title = 'Onay') => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                type: 'confirm',
                message,
                title,
                variant: 'warning',
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    };

    const closeModal = () => {
        if (modal.onCancel) {
            modal.onCancel();
        } else if (modal.onConfirm) {
            modal.onConfirm();
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {modal.isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={closeModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--card)',
                            borderRadius: '20px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            border: '2px solid',
                            borderColor: modal.variant === 'error' ? '#ef4444' :
                                modal.variant === 'success' ? '#10b981' :
                                    modal.variant === 'warning' ? '#f59e0b' : '#3b82f6',
                            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {/* Icon */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                background: modal.variant === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                    modal.variant === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                        modal.variant === 'warning' ? 'linear-gradient(135deg, #fbbf24, #f97316, #ec4899)' :
                                            'linear-gradient(135deg, #3b82f6, #2563eb)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                            }}>
                                {modal.variant === 'error' ? '⚠️' :
                                    modal.variant === 'success' ? '✓' :
                                        modal.variant === 'warning' ? '⚡' : 'ℹ️'}
                            </div>
                        </div>

                        {/* Title */}
                        {modal.title && (
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'var(--text)',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                {modal.title}
                            </h3>
                        )}

                        {/* Message */}
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            {modal.message}
                        </p>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center'
                        }}>
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={modal.onCancel}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '2px solid var(--border)',
                                        background: 'var(--secondary)',
                                        color: 'var(--text)',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--background)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--secondary)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    İptal
                                </button>
                            )}
                            <button
                                onClick={modal.onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem 1.5rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: modal.variant === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                        modal.variant === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                            'linear-gradient(135deg, #fbbf24, #f97316, #ec4899)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                                }}
                            >
                                {modal.type === 'confirm' ? 'Onayla' : 'Tamam'}
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from {
                                transform: translateY(50px);
                                opacity: 0;
                            }
                            to {
                                transform: translateY(0);
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
}
