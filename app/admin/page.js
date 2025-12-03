'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/roles';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [replies, setReplies] = useState([]);
    const [notes, setNotes] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, title: '' });

    const openDeleteModal = (type, id, title) => {
        setDeleteModal({ isOpen: true, type, id, title });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, type: null, id: null, title: '' });
    };

    const executeDelete = async () => {
        const { type, id } = deleteModal;
        closeDeleteModal();

        if (type === 'user') {
            await deleteUser(id);
        } else if (type === 'post') {
            await deletePost(id);
        } else if (type === 'reply') {
            await deleteReply(id);
        } else if (type === 'note') {
            await deleteNote(id);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            checkAdminAccess();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const checkAdminAccess = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.role && isAdmin(data.role)) {
                    setUserRole(data.role);
                    fetchStats();
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

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedRole) queryParams.append('role', selectedRole);

            const res = await fetch(`/api/admin/users?${queryParams}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/admin/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchReplies = async () => {
        try {
            const res = await fetch('/api/admin/replies');
            if (res.ok) {
                const data = await res.json();
                setReplies(data.replies);
            }
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/admin/notes');
            if (res.ok) {
                const data = await res.json();
                setNotes(data.notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/admin/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleUpdateReportStatus = async (reportId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchReports();
            } else {
                alert('Failed to update report status');
            }
        } catch (error) {
            console.error('Error updating report:', error);
            alert('Error updating report');
        }
    };

    const handleBanUser = async (e, userId, currentBanned) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(currentBanned ? 'Bu kullanıcının banını kaldırmak istediğinizden emin misiniz?' : 'Bu kullanıcıyı banlamak istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: !currentBanned })
            });

            if (res.ok) {
                alert(currentBanned ? 'Kullanıcının banı kaldırıldı' : 'Kullanıcı banlandı');
                fetchUsers();
            } else {
                const error = await res.json();
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Bir hata oluştu');
        }
    };

    const handleDeleteUser = (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        openDeleteModal('user', userId, 'Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?');
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Kullanıcı silindi');
                fetchUsers();
                fetchStats();
            } else {
                const error = await res.json();
                console.error('Delete user error:', error);
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Bir hata oluştu');
        }
    };

    const handleDeletePost = (e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        openDeleteModal('post', postId, 'Bu gönderiyi silmek istediğinizden emin misiniz?');
    };

    const deletePost = async (postId) => {
        try {
            const res = await fetch(`/api/admin/posts?id=${postId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Gönderi silindi');
                fetchPosts();
                fetchStats();
            } else {
                const error = await res.json();
                console.error('Delete post error:', error);
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    };

    const handleDeleteReply = (e, replyId) => {
        e.preventDefault();
        e.stopPropagation();
        openDeleteModal('reply', replyId, 'Bu yanıtı silmek istediğinizden emin misiniz?');
    };

    const deleteReply = async (replyId) => {
        try {
            const res = await fetch(`/api/admin/replies?id=${replyId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Yanıt silindi');
                fetchReplies();
                fetchStats();
            } else {
                const error = await res.json();
                console.error('Delete reply error:', error);
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    };

    const handleDeleteNote = (e, noteId) => {
        e.preventDefault();
        e.stopPropagation();
        openDeleteModal('note', noteId, 'Bu notu silmek istediğinizden emin misiniz?');
    };

    const deleteNote = async (noteId) => {
        try {
            const res = await fetch(`/api/admin/notes?id=${noteId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Not silindi');
                fetchNotes();
                fetchStats();
            } else {
                const error = await res.json();
                console.error('Delete note error:', error);
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'replies') {
            fetchReplies();
        } else if (activeTab === 'notes') {
            fetchNotes();
        } else if (activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab, searchTerm, selectedRole]);

    if (loading || status === 'loading' || !userRole) {
        return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text)' }}>Yükleniyor...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: 'var(--text)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            🛡️ Admin Paneli
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Hoş geldin, {session?.user?.firstName || 'Admin'} ({userRole})
                        </p>
                    </div>
                    {activeTab !== 'dashboard' && (
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: 'var(--primary-gradient)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            ← Panele Dön
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                <div style={{
                    background: 'var(--secondary)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '0.5rem',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap'
                }}>
                    {['dashboard', 'users', 'posts', 'replies', 'notes', 'reports'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: activeTab === tab ? 'var(--accent-purple)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? '600' : '500',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'dashboard' && '📊 Dashboard'}
                            {tab === 'users' && '👥 Kullanıcılar'}
                            {tab === 'posts' && '📝 Gönderiler'}
                            {tab === 'replies' && '💬 Yanıtlar'}
                            {tab === 'notes' && '📄 Notlar'}
                            {tab === 'reports' && '⚠️ Raporlar'}
                        </button>
                    ))}
                    <Link href="/admin/announcements" style={{
                        padding: '0.8rem 1.5rem',
                        background: 'transparent',
                        color: 'var(--text)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent-purple)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text)';
                        }}>
                        📢 Duyurular
                    </Link>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Toplam Kullanıcı', value: stats.stats.totalUsers, icon: '👥', color: '#8b5cf6' },
                                { label: 'Toplam Gönderi', value: stats.stats.totalPosts, icon: '📝', color: '#3b82f6' },
                                { label: 'Toplam Yanıt', value: stats.stats.totalReplies, icon: '💬', color: '#10b981' },
                                { label: 'Toplam Not', value: stats.stats.totalNotes, icon: '📄', color: '#f59e0b' },
                                { label: 'Toplam Mesaj', value: stats.stats.totalMessages, icon: '✉️', color: '#ec4899' },
                                { label: 'Banlı Kullanıcı', value: stats.stats.bannedUsers, icon: '🚫', color: '#ef4444' }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--secondary)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '1px solid var(--border)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                                            <p style={{ color: 'var(--text)', fontSize: '2rem', fontWeight: '700', margin: 0 }}>{stat.value}</p>
                                        </div>
                                        <div style={{ fontSize: '3rem' }}>{stat.icon}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Users */}
                        <div style={{
                            background: 'var(--secondary)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            <h2 style={{ color: 'var(--text)', marginBottom: '1rem', fontSize: '1.5rem' }}>Son Kaydolan Kullanıcılar</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Kullanıcı Adı</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Rol</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Kayıt Tarihi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentUsers.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem', color: 'var(--text)' }}>@{user.username}</td>
                                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        background: user.role === 'POWERUSER' ? '#dc2626' : user.role === 'ADMIN' ? '#f59e0b' : '#3b82f6',
                                                        color: 'white'
                                                    }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div style={{
                        background: 'var(--secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Kullanıcı ara (isim, email, kullanıcı adı)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: '250px',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--text)',
                                    fontSize: '1rem'
                                }}
                            />
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--text)',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Tüm Roller</option>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="POWERUSER">POWERUSER</option>
                            </select>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>Kullanıcı</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>Email</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>Üniversite</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>Rol</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>Durum</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text)' }}>İçerik</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text)' }}>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div>
                                                    <div style={{ color: 'var(--text)', fontWeight: '600' }}>
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <div>{user.university || 'N/A'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.department || ''}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    background: user.role === 'POWERUSER' ? '#dc2626' : user.role === 'ADMIN' ? '#f59e0b' : '#3b82f6',
                                                    color: 'white',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {user.banned ? (
                                                    <span style={{ color: '#ef4444', fontWeight: '600', whiteSpace: 'nowrap' }}>🚫 Banlı</span>
                                                ) : (
                                                    <span style={{ color: '#10b981', fontWeight: '600', whiteSpace: 'nowrap' }}>✅ Aktif</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span>📝 {user._count.posts}</span>
                                                    <span>💬 {user._count.replies}</span>
                                                    <span>📄 {user._count.notes}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    {user.role !== 'POWERUSER' && !(user.role === 'ADMIN' && userRole === 'ADMIN') && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleBanUser(e, user.id, user.banned)}
                                                                title={user.banned ? 'Ban Kaldır' : 'Banla'}
                                                                style={{
                                                                    padding: '0.6rem',
                                                                    background: user.banned ? '#10b981' : '#f59e0b',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    minWidth: '40px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                {user.banned ? '✓' : '❌'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDeleteUser(e, user.id)}
                                                                title="Kullanıcıyı Sil"
                                                                style={{
                                                                    padding: '0.6rem',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    minWidth: '40px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                    {(user.role === 'ADMIN' && userRole === 'ADMIN') && (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                            Yetki yok
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr >
                                    ))
                                    }
                                </tbody >
                            </table >
                        </div >
                    </div >
                )}

                {/* Posts Tab */}
                {
                    activeTab === 'posts' && (
                        <div style={{
                            background: 'var(--secondary)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            <h2 style={{ color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tüm Gönderiler</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        style={{
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <Link href={`/forum/${post.id}`} style={{ textDecoration: 'none' }}>
                                                    <h3 style={{
                                                        color: 'var(--text)',
                                                        marginBottom: '0.5rem',
                                                        fontSize: '1.2rem',
                                                        cursor: 'pointer',
                                                        transition: 'color 0.2s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
                                                    >
                                                        {post.title}
                                                    </h3>
                                                </Link>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: '600', color: post.author.banned ? '#ef4444' : 'var(--text)' }}>
                                                        @{post.author.username}
                                                    </span>
                                                    {post.author.banned && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(Banlı)</span>}
                                                    {' · '}
                                                    {new Date(post.createdAt).toLocaleString('tr-TR')}
                                                    {' · '}
                                                    {post._count.replies} yanıt
                                                </div>
                                                <p style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                                                    {post.content.substring(0, 200)}
                                                    {post.content.length > 200 && '...'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeletePost(e, post.id)}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    marginLeft: '1rem',
                                                    zIndex: 10,
                                                    position: 'relative'
                                                }}
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Replies Tab */}
                {
                    activeTab === 'replies' && (
                        <div style={{
                            background: 'var(--secondary)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            <h2 style={{ color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Forum Yanıtları</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {replies.map(reply => (
                                    <div
                                        key={reply.id}
                                        style={{
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600', color: reply.author.banned ? '#ef4444' : 'var(--text)' }}>
                                                        @{reply.author.username}
                                                    </span>
                                                    {reply.author.banned && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(Banlı)</span>}
                                                    {' → '}
                                                    <Link
                                                        href={`/forum/${reply.post.id}`}
                                                        style={{
                                                            color: 'var(--primary)',
                                                            textDecoration: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        {reply.post.title}
                                                    </Link>
                                                    {' · '}
                                                    {new Date(reply.createdAt).toLocaleString('tr-TR')}
                                                </div>
                                                <p style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                                                    {reply.content.substring(0, 200)}
                                                    {reply.content.length > 200 && '...'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteReply(e, reply.id)}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    marginLeft: '1rem',
                                                    zIndex: 10,
                                                    position: 'relative'
                                                }}
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Notes Tab */}
                {
                    activeTab === 'notes' && (
                        <div style={{
                            background: 'var(--secondary)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            <h2 style={{ color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Ders Notları</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notes.map(note => (
                                    <div
                                        key={note.id}
                                        style={{
                                            background: 'var(--background)',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <Link href="/notes" style={{ textDecoration: 'none' }}>
                                                    <h3 style={{
                                                        color: 'var(--text)',
                                                        marginBottom: '0.5rem',
                                                        fontSize: '1.2rem',
                                                        cursor: 'pointer',
                                                        transition: 'color 0.2s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
                                                    >
                                                        {note.title}
                                                    </h3>
                                                </Link>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: '600', color: note.author.banned ? '#ef4444' : 'var(--text)' }}>
                                                        @{note.author.username}
                                                    </span>
                                                    {note.author.banned && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(Banlı)</span>}
                                                    {' · '}
                                                    <span style={{ color: 'var(--primary)' }}>{note.course?.name || 'Ders bulunamadı'}</span>
                                                    {' · '}
                                                    {new Date(note.createdAt).toLocaleString('tr-TR')}
                                                </div>
                                                <p style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                                                    {note.content ? note.content.substring(0, 200) : 'İçerik yok'}
                                                    {note.content && note.content.length > 200 && '...'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteNote(e, note.id)}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    marginLeft: '1rem',
                                                    zIndex: 10,
                                                    position: 'relative'
                                                }}
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div style={{
                        background: 'var(--secondary)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Raporlar</h2>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Raporlayan</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Neden</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>İçerik</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Durum</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text)' }}>Tarih</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text)' }}>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', color: 'var(--text)' }}>
                                                @{report.reporter.username}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    background: '#ef4444',
                                                    color: 'white'
                                                }}>
                                                    {report.reason}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                                {report.post ? (
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>Post: </span>
                                                        <Link href={`/forum/${report.post.id}`} style={{ color: 'var(--primary)' }}>
                                                            {report.post.title}
                                                        </Link>
                                                    </div>
                                                ) : report.reply ? (
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>Reply in: </span>
                                                        <Link href={`/forum/${report.reply.post.id}`} style={{ color: 'var(--primary)' }}>
                                                            {report.reply.post.title}
                                                        </Link>
                                                        <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                                            "{report.reply.content.substring(0, 50)}..."
                                                        </div>
                                                    </div>
                                                ) : 'Silinmiş İçerik'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    background: report.status === 'PENDING' ? '#f59e0b' : report.status === 'RESOLVED' ? '#10b981' : '#6b7280',
                                                    color: 'white'
                                                }}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {report.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                                                            title="Çözüldü Olarak İşaretle"
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ✅
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                                                            title="Reddet"
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#6b7280',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Modal */}
                {deleteModal.isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'var(--secondary)',
                            padding: '2rem',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--border)'
                        }}>
                            <h3 style={{ color: 'var(--text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Onaylıyor musunuz?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                                {deleteModal.title}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={closeDeleteModal}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: 'transparent',
                                        color: 'var(--text)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={executeDelete}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
}
