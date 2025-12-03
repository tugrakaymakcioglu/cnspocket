'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProductivityMenu({ isMobile, onOpen }) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [deadlineAlert, setDeadlineAlert] = useState(null);
    const [notifications, setNotifications] = useState({ approaching: [], overdue: [], now: [], count: 0 });

    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'MEDIUM',
        category: 'PERSONAL',
        dueDate: '',
        dueTime: ''
    });

    useEffect(() => {
        if (session) {
            if (isOpen) {
                fetchTasks();
                fetchCourses();
            }
            checkDeadlines();
            const interval = setInterval(checkDeadlines, 60000);
            return () => clearInterval(interval);
        }
    }, [session, isOpen]);

    const checkDeadlines = async () => {
        try {
            const res = await fetch('/api/notifications/deadlines');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);

                if (data.now && data.now.length > 0) {
                    setDeadlineAlert(data.now[0]);
                    await fetch('/api/notifications/deadlines', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ taskId: data.now[0].id })
                    });
                }
            }
        } catch (error) {
            console.error('Error checking deadlines:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const showSaveMessage = (message, duration = 2000) => {
        setSaveMessage(message);
        setTimeout(() => setSaveMessage(''), duration);
    };

    const addTask = async () => {
        if (!newTask.title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create task');
            }

            setNewTask({ title: '', priority: 'MEDIUM', category: 'PERSONAL', dueDate: '', dueTime: '' });
            await fetchTasks();
            showSaveMessage('✅ Görev eklendi!');
        } catch (error) {
            showSaveMessage('❌ Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update task');
            }

            await fetchTasks();
            showSaveMessage('✅ Görev güncellendi!');
        } catch (error) {
            showSaveMessage('❌ Hata oluştu');
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            await fetchTasks();
            showSaveMessage(' 🗑️ Görev silindi');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (newState && onOpen) {
            onOpen();
        }
    };

    const incompleteTasks = tasks.filter(t => !t.completed && (filter === 'ALL' || t.category === filter));
    const completedTasks = tasks.filter(t => t.completed && (filter === 'ALL' || t.category === filter));

    const getDeadlineStatus = (task) => {
        if (!task.dueDate) return 'none';
        const deadline = new Date(task.dueDate);
        const now = new Date();
        const diffHours = (deadline - now) / (1000 * 60 * 60);

        if (diffHours < 0) return 'overdue';
        if (diffHours < 24) return 'urgent';
        if (diffHours < 72) return 'soon';
        return 'normal';
    };

    const formatDeadline = (task) => {
        if (!task.dueDate) return '';
        const date = new Date(task.dueDate);
        const formatted = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        return task.dueTime ? `${formatted} ${task.dueTime}` : formatted;
    };

    if (!session) return null;

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleToggle}
                style={isMobile ? {
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'background-color 0.2s ease'
                } : {
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'color 0.3s ease',
                    position: 'relative'
                }}
                onMouseEnter={(e) => {
                    if (isMobile) {
                        e.currentTarget.style.backgroundColor = 'var(--secondary)';
                    } else {
                        e.currentTarget.style.color = 'var(--primary)';
                        const underline = e.currentTarget.querySelector('.underline');
                        if (underline) underline.style.width = '100%';
                    }
                }}
                onMouseLeave={(e) => {
                    if (isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    } else {
                        e.currentTarget.style.color = 'var(--text)';
                        const underline = e.currentTarget.querySelector('.underline');
                        if (underline) underline.style.width = '0';
                    }
                }}
            >
                {isMobile ? '✅ Hatırlatıcı' : 'Hatırlatıcı'}
                {(incompleteTasks.length > 0 || notifications.count > 0) && (
                    <span style={{
                        position: isMobile ? 'static' : 'absolute',
                        top: isMobile ? 'auto' : '-8px',
                        right: isMobile ? 'auto' : '-8px',
                        background: '#ff4444',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        padding: '0 4px',
                        border: '2px solid var(--background)',
                        marginLeft: isMobile ? 'auto' : '0'
                    }}>
                        {notifications.count || incompleteTasks.length}
                    </span>
                )}
                {!isMobile && (
                    <span
                        className="underline"
                        style={{
                            content: '',
                            position: 'absolute',
                            width: '0',
                            height: '2px',
                            bottom: '0',
                            left: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: 'translateX(-50%)',
                            borderRadius: '2px'
                        }}
                    />
                )}
            </button>

            {/* Deadline Alert Modal */}
            {deadlineAlert && (
                <>
                    <div
                        onClick={() => setDeadlineAlert(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 2000,
                            animation: 'fadeIn 0.3s'
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        borderRadius: '20px',
                        padding: '2rem',
                        zIndex: 2001,
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s'
                    }}>
                        {/* ... (keep deadline alert content) ... */}
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
                        <h2 style={{ color: '#FF416C', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                            Deadline Geldi!
                        </h2>
                        <p style={{ color: '#333', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                            {deadlineAlert.title}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    updateTask(deadlineAlert.id, { completed: true });
                                    setDeadlineAlert(null);
                                }}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}
                            >
                                ✅ Tamamla
                            </button>
                            <button
                                onClick={() => setDeadlineAlert(null)}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'var(--secondary)',
                                    color: 'var(--text)',
                                    border: '2px solid var(--border)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}
                            >
                                👁️ Tamam
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Main Modal */}
            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1999
                        }}
                    />

                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        background: 'var(--background)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                        zIndex: 2000,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '1.5rem',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                                    🔔 Hatırlatıcılarım ({incompleteTasks.length})
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: 'white',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {saveMessage && (
                            <div style={{
                                padding: '0.8rem',
                                background: saveMessage.includes('❌') ? 'linear-gradient(135deg, #FF416C, #FF4B2B)' : 'linear-gradient(135deg, #11998e, #38ef7d)',
                                color: 'white',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                {saveMessage}
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {/* Deadline Notifications */}
                            {(notifications.overdue.length > 0 || notifications.approaching.length > 0) && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FFF3CD', borderRadius: '12px', border: '2px solid #FFD700' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '700', color: '#856404' }}>
                                        ⚠️ Deadline Uyarıları
                                    </h4>
                                    {notifications.overdue.length > 0 && (
                                        <p style={{ margin: '0.5rem 0', color: '#721c24', fontSize: '0.9rem' }}>
                                            🔴 {notifications.overdue.length} gecikmiş görev
                                        </p>
                                    )}
                                    {notifications.approaching.length > 0 && (
                                        <p style={{ margin: '0.5rem 0', color: '#856404', fontSize: '0.9rem' }}>
                                            🟡 {notifications.approaching.length} görev 24 saat içinde
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Add Task Form */}
                            <div style={{
                                background: 'var(--secondary)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                marginBottom: '1.5rem',
                                border: '2px dashed var(--border)'
                            }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>
                                    ➕ Yeni Hatırlatıcı
                                </h3>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Hatırlatıcı başlığı..."
                                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        marginBottom: '0.8rem',
                                        border: '2px solid var(--border)',
                                        borderRadius: '12px',
                                        background: 'var(--background)',
                                        color: 'var(--text)',
                                        fontSize: '1rem',
                                        fontWeight: '500'
                                    }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        style={{
                                            padding: '0.7rem',
                                            border: '2px solid var(--border)',
                                            borderRadius: '10px',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="LOW">🟢 Düşük Öncelik</option>
                                        <option value="MEDIUM">🟡 Orta Öncelik</option>
                                        <option value="HIGH">🔴 Yüksek Öncelik</option>
                                    </select>
                                    <select
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                        style={{
                                            padding: '0.7rem',
                                            border: '2px solid var(--border)',
                                            borderRadius: '10px',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="PERSONAL">👤 Kişisel</option>
                                        <option value="STUDY">📚 Ders</option>
                                        <option value="ASSIGNMENT">📝 Ödev</option>
                                        <option value="PROJECT">🚀 Proje</option>
                                        <option value="EXAM">📅 Sınav</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        style={{
                                            padding: '0.7rem',
                                            border: '2px solid var(--border)',
                                            borderRadius: '10px',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <input
                                        type="time"
                                        value={newTask.dueTime}
                                        onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                                        style={{
                                            padding: '0.7rem',
                                            border: '2px solid var(--border)',
                                            borderRadius: '10px',
                                            background: 'var(--background)',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={addTask}
                                    disabled={!newTask.title.trim() || saving}
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem',
                                        background: newTask.title.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--border)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: newTask.title.trim() ? 'pointer' : 'not-allowed',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        boxShadow: newTask.title.trim() ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
                                    }}
                                >
                                    {saving ? '⏳ Kaydediliyor...' : '✅ Hatırlatıcı Ekle'}
                                </button>
                            </div>

                            {/* Filter Chips */}
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                                {['ALL', 'PERSONAL', 'STUDY', 'ASSIGNMENT', 'PROJECT', 'EXAM'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: filter === cat ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--secondary)',
                                            color: filter === cat ? 'white' : 'var(--text)',
                                            border: filter === cat ? 'none' : '2px solid var(--border)',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            boxShadow: filter === cat ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                                        }}
                                    >
                                        {cat === 'ALL' ? '📋 Tümü' : cat === 'PERSONAL' ? '👤 Kişisel' : cat === 'STUDY' ? '📚 Ders' : cat === 'ASSIGNMENT' ? '📝 Ödev' : cat === 'PROJECT' ? '🚀 Proje' : '📅 Sınav'}
                                    </button>
                                ))}
                            </div>

                            {/* Task List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {tasks
                                    .filter(t => filter === 'ALL' || t.category === filter)
                                    .sort((a, b) => {
                                        // Sort by completion status (incomplete first), then by date
                                        if (a.completed === b.completed) {
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        }
                                        return a.completed ? 1 : -1;
                                    })
                                    .map(task => {
                                        const deadlineStatus = getDeadlineStatus(task);
                                        return (
                                            <div key={task.id} style={{
                                                padding: '1.2rem',
                                                background: 'var(--secondary)',
                                                borderRadius: '14px',
                                                borderLeft: `5px solid ${task.completed ? '#2196F3' : task.priority === 'HIGH' ? '#FF416C' : task.priority === 'MEDIUM' ? '#FFB75E' : '#4CAF50'}`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                opacity: task.completed ? 0.7 : 1,
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '2px' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: 'var(--text)',
                                                            marginBottom: '0.3rem',
                                                            textDecoration: task.completed ? 'line-through' : 'none'
                                                        }}>
                                                            {task.title}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                                                            <span style={{
                                                                padding: '0.2rem 0.6rem',
                                                                background: task.completed ? '#E3F2FD' : task.priority === 'HIGH' ? '#FFEBEE' : task.priority === 'MEDIUM' ? '#FFF3E0' : '#E8F5E9',
                                                                color: task.completed ? '#1976D2' : task.priority === 'HIGH' ? '#C62828' : task.priority === 'MEDIUM' ? '#EF6C00' : '#2E7D32',
                                                                borderRadius: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {task.completed ? '✅ Yapıldı' : task.priority === 'HIGH' ? '🔴 Acil' : task.priority === 'MEDIUM' ? '🟡 Orta' : '🟢 Düşük'}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span style={{
                                                                    padding: '0.2rem 0.6rem',
                                                                    background: deadlineStatus === 'overdue' ? '#FFEBEE' : deadlineStatus === 'urgent' ? '#FFF3E0' : deadlineStatus === 'soon' ? '#E3F2FD' : '#F5F5F5',
                                                                    color: deadlineStatus === 'overdue' ? '#C62828' : deadlineStatus === 'urgent' ? '#EF6C00' : deadlineStatus === 'soon' ? '#1976D2' : '#666',
                                                                    borderRadius: '12px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {deadlineStatus === 'overdue' ? '❌ ' : deadlineStatus === 'urgent' ? '⏰ ' : deadlineStatus === 'soon' ? '📅 ' : '📆 '}
                                                                    {formatDeadline(task)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#FF416C',
                                                            cursor: 'pointer',
                                                            fontSize: '1.3rem'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                {tasks.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                                        <div style={{ fontWeight: '600' }}>Henüz hatırlatıcı eklemedin!</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translate(-50%, -60%); opacity: 0; }
                    to { transform: translate(-50%, -50%); opacity: 1; }
                }
            `}</style>
        </>
    );
}
