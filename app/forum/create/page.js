'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForumPost } from '@/contexts/ForumPostContext';
import { useAlert } from '@/contexts/AlertContext';
import FilePreview from '@/components/FilePreview';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { startSubmission, pendingPost } = useForumPost();
    const { showAlert, showConfirm } = useAlert();

    useEffect(() => {
        if (pendingPost) {
            setTitle(pendingPost.title);
            setContent(pendingPost.content);
            setTags(pendingPost.tags);
            // Files cannot be programmatically set to file input due to security,
            // but we can preserve them in context if needed.
            // For now, user might need to re-select files or we handle it differently.
            // However, the context has the files, so we can potentially display them.
            if (pendingPost.files) {
                setFiles(pendingPost.files);
            }
        }
    }, [pendingPost]);

    // Track unsaved changes
    useEffect(() => {
        const hasContent = title.trim() !== '' || content.trim() !== '' || tags.trim() !== '' || files.length > 0;
        setHasUnsavedChanges(hasContent);
    }, [title, content, tags, files]);

    // Warn on browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Custom Link wrapper to intercept navigation
    const handleLinkClick = async (e, href) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            const confirmed = await showConfirm(
                'Değişiklikleriniz kaydedilmedi! Çıkışı onaylıyor musunuz? Tüm verileriniz kaybolacak.'
            );
            if (confirmed) {
                setHasUnsavedChanges(false);
                router.push(href);
            }
        }
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            await showAlert(t.forumCreate.maxFiles || 'Maksimum 5 dosya yükleyebilirsiniz', 'warning');
            return;
        }
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowWarningModal(true);
    };

    const handleConfirmPost = async () => {
        setShowWarningModal(false);
        setHasUnsavedChanges(false); // Clear unsaved changes flag

        startSubmission({
            title,
            content,
            tags,
            files
        });
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <a
                    href="/forum"
                    onClick={(e) => handleLinkClick(e, '/forum')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'color 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-teal)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t.forumDetail.backToForum || 'Foruma Dön'}
                </a>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{t.forumCreate.title || 'Yeni Tartışma Başlat'}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Sorunu sor, deneyimini paylaş, topluluğa katkıda bulun 💬
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Title & Content Section */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            💭
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                Tartışma Detayları
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Başlık ve içerik ekle
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Title */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                color: 'var(--text)',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                <span style={{ color: 'var(--accent-teal)' }}>●</span>
                                {t.forumCreate.titleLabel || 'Başlık'} *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="ör. Calculus II Sınav Sorusu Hakkında Yardım"
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
                                    e.currentTarget.style.borderColor = 'var(--accent-teal)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                color: 'var(--text)',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                <span style={{ color: 'var(--accent-teal)' }}>●</span>
                                {t.forumCreate.contentLabel || 'İçerik'} *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={8}
                                placeholder="Sorunuzu veya konuyu detaylı bir şekilde açıklayın..."
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.6',
                                    minHeight: '200px',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent-teal)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            🏷️
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                Etiketler
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Tartışmanı kategorize et
                            </p>
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            color: 'var(--text)',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}>
                            <span style={{ color: 'var(--accent-amber)' }}>●</span>
                            {t.forumCreate.tagsLabel || 'Etiketler'}
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder={t.forumCreate.tagsPlaceholder || 'matematik, sınav, yardım (virgülle ayırın)'}
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
                                e.currentTarget.style.borderColor = 'var(--accent-amber)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            💡 İpucu: Etiketleri virgülle ayırın
                        </small>
                    </div>
                </div>

                {/* Files Section */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            📎
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                                Dosyalar
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Ekran görüntüsü veya döküman ekle (Maksimum 5)
                            </p>
                        </div>
                    </div>

                    <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '3px dashed var(--border)',
                        backgroundColor: 'var(--background)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '150px'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-purple)';
                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.backgroundColor = 'var(--background)';
                        }}>
                        <div style={{ fontSize: '3rem', opacity: 0.6 }}>📁</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: 'var(--text)',
                                marginBottom: '0.25rem'
                            }}>
                                Dosya Yükle
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                PDF, Word, Excel, PowerPoint, Resim
                            </div>
                        </div>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            style={{ display: 'none' }}
                        />
                    </label>

                    {/* File List */}
                    {files.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1.5rem'
                        }}>
                            {files.map((file, index) => (
                                <FilePreview
                                    key={index}
                                    file={file}
                                    onRemove={() => removeFile(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} style={{
                    padding: '1.2rem 1.5rem',
                    background: loading ? 'var(--text-secondary)' : 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: loading ? 'none' : '0 8px 20px rgba(20, 184, 166, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(20, 184, 166, 0.5)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(20, 184, 166, 0.4)';
                    }}>
                    {loading ? '⏳ Paylaşılıyor...' : '🚀 Tartışmayı Paylaş'}
                </button>

                {loading && uploadProgress > 0 && (
                    <div style={{
                        backgroundColor: 'var(--secondary)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text)'
                        }}>
                            <span>Yükleniyor...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div style={{
                            height: '8px',
                            backgroundColor: 'var(--background)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${uploadProgress}%`,
                                background: 'linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%)',
                                transition: 'width 0.3s ease',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                )}
            </form>

            {/* Warning Modal */}
            {showWarningModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}
                    onClick={() => setShowWarningModal(false)}>
                    <div style={{
                        backgroundColor: 'var(--secondary)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        border: '1px solid var(--border)'
                    }}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                            💬
                        </div>
                        <h2 style={{
                            marginBottom: '1rem',
                            color: 'var(--text)',
                            textAlign: 'center',
                            fontSize: '1.5rem'
                        }}>
                            Tartışmayı Paylaş?
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            lineHeight: '1.6'
                        }}>
                            Tartışman forumda herkese açık olarak yayınlanacak. Devam etmek istediğinden emin misin?
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowWarningModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                İptal
                            </button>
                            <button
                                onClick={handleConfirmPost}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(20, 184, 166, 0.4)';
                                }}>
                                Evet, Paylaş
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
