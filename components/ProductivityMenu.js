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
                className={`trigger-btn ${isMobile ? 'mobile' : 'desktop'}`}
                onClick={handleToggle}
            >
                {isMobile ? '✅ Hatırlatıcı' : '✅ Hatırlatıcı'}
                {(incompleteTasks.length > 0 || notifications.count > 0) && (
                    <span className="badge">
                        {notifications.count || incompleteTasks.length}
                    </span>
                )}
                {!isMobile && <span className="underline" />}
            </button>

            {/* Deadline Alert Modal */}
            {deadlineAlert && (
                <div className="alert-overlay">
                    <div className="alert-modal">
                        <div className="alert-icon">⏰</div>
                        <h2 className="alert-title">Deadline Geldi!</h2>
                        <p className="alert-message">{deadlineAlert.title}</p>
                        <div className="alert-actions">
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    updateTask(deadlineAlert.id, { completed: true });
                                    setDeadlineAlert(null);
                                }}
                            >
                                ✅ Tamamla
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setDeadlineAlert(null)}
                            >
                                👁️ Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            {isOpen && (
                <>
                    <div className="modal-overlay" onClick={() => setIsOpen(false)} />
                    <div className="modal-container">
                        {/* Header */}
                        <div className="modal-header">
                            <h2>🔔 Hatırlatıcılarım ({incompleteTasks.length})</h2>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        {saveMessage && (
                            <div className={`status-message ${saveMessage.includes('❌') ? 'error' : 'success'}`}>
                                {saveMessage}
                            </div>
                        )}

                        <div className="modal-content">
                            {/* Deadline Notifications */}
                            {(notifications.overdue.length > 0 || notifications.approaching.length > 0) && (
                                <div className="notification-box">
                                    <h4>⚠️ Deadline Uyarıları</h4>
                                    {notifications.overdue.length > 0 && (
                                        <p className="text-danger">🔴 {notifications.overdue.length} gecikmiş görev</p>
                                    )}
                                    {notifications.approaching.length > 0 && (
                                        <p className="text-warning">🟡 {notifications.approaching.length} görev 24 saat içinde</p>
                                    )}
                                </div>
                            )}

                            {/* Add Task Form */}
                            <div className="add-task-form">
                                <h3>➕ Yeni Hatırlatıcı</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Hatırlatıcı başlığı..."
                                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-row">
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="select-field"
                                    >
                                        <option value="LOW">🟢 Düşük</option>
                                        <option value="MEDIUM">🟡 Orta</option>
                                        <option value="HIGH">🔴 Yüksek</option>
                                    </select>
                                    <select
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                        className="select-field"
                                    >
                                        <option value="PERSONAL">👤 Kişisel</option>
                                        <option value="STUDY">📚 Ders</option>
                                        <option value="ASSIGNMENT">📝 Ödev</option>
                                        <option value="PROJECT">🚀 Proje</option>
                                        <option value="EXAM">📅 Sınav</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="input-field"
                                    />
                                    <input
                                        type="time"
                                        value={newTask.dueTime}
                                        onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <button
                                    onClick={addTask}
                                    disabled={!newTask.title.trim() || saving}
                                    className={`submit-btn ${newTask.title.trim() ? 'active' : 'disabled'}`}
                                >
                                    {saving ? '⏳ Kaydediliyor...' : '✅ Ekle'}
                                </button>
                            </div>

                            {/* Filter Chips */}
                            <div className="filter-chips">
                                {['ALL', 'PERSONAL', 'STUDY', 'ASSIGNMENT', 'PROJECT', 'EXAM'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`chip ${filter === cat ? 'active' : ''}`}
                                    >
                                        {cat === 'ALL' ? '📋 Tümü' : cat === 'PERSONAL' ? '👤 Kişisel' : cat === 'STUDY' ? '📚 Ders' : cat === 'ASSIGNMENT' ? '📝 Ödev' : cat === 'PROJECT' ? '🚀 Proje' : '📅 Sınav'}
                                    </button>
                                ))}
                            </div>

                            {/* Task List */}
                            <div className="task-list">
                                {tasks
                                    .filter(t => filter === 'ALL' || t.category === filter)
                                    .sort((a, b) => {
                                        if (a.completed === b.completed) {
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        }
                                        return a.completed ? 1 : -1;
                                    })
                                    .map(task => {
                                        const deadlineStatus = getDeadlineStatus(task);
                                        return (
                                            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                                <div className="task-row-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                                                        className="task-checkbox"
                                                    />
                                                    <div className="task-title">{task.title}</div>
                                                    <button onClick={() => deleteTask(task.id)} className="delete-btn">
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div className="task-row-2">
                                                    <span className={`priority-badge priority-${task.priority}`}>
                                                        {task.priority === 'HIGH' ? '🔴 Yüksek' : task.priority === 'MEDIUM' ? '🟡 Orta' : '🟢 Düşük'}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className={`date-badge deadline-${deadlineStatus}`}>
                                                            📅 {formatDeadline(task)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                {tasks.length === 0 && (
                                    <div className="empty-state">
                                        <div className="empty-icon">🎉</div>
                                        <div>Henüz hatırlatıcı eklemedin!</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                /* Trigger Button */
                .trigger-btn {
                    background: none;
                    border: none;
                    color: var(--text);
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    position: relative;
                    transition: all 0.2s ease;
                }
                .trigger-btn.mobile {
                    width: 100%;
                    text-align: left;
                    padding: 1rem;
                    border-radius: 8px;
                }
                .trigger-btn.desktop {
                    padding: 0.5rem 0;
                }
                .trigger-btn:hover {
                    color: var(--primary);
                }
                .trigger-btn.mobile:active {
                    background-color: var(--secondary);
                }
                .badge {
                    background: #ff4444;
                    color: white;
                    border-radius: 50%;
                    min-width: 18px;
                    height: 18px;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    padding: 0 4px;
                    border: 2px solid var(--background);
                }
                .trigger-btn.desktop .badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                }
                .trigger-btn.mobile .badge {
                    margin-left: auto;
                }
                .underline {
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: translateX(-50%);
                    border-radius: 2px;
                }
                .trigger-btn.desktop:hover .underline {
                    width: 100%;
                }

                /* Modal Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 1999;
                    animation: fadeIn 0.3s;
                }

                /* Modal Container */
                .modal-container {
                    position: fixed;
                    background: var(--background);
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Desktop Modal Style */
                @media (min-width: 769px) {
                    .modal-container {
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 600px;
                        max-height: 85vh;
                        border-radius: 24px;
                    }
                }

                /* Mobile Modal Style (Bottom Sheet) */
                @media (max-width: 768px) {
                    .modal-container {
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 85vh; /* Takes up 85% of screen */
                        border-radius: 24px 24px 0 0;
                        transform: translateY(0);
                    }
                }

                .modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 1.2rem 1.5rem;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .close-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .modal-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    -webkit-overflow-scrolling: touch;
                }

                /* Status Message */
                .status-message {
                    padding: 0.8rem;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .status-message.success {
                    background: linear-gradient(135deg, #11998e, #38ef7d);
                }
                .status-message.error {
                    background: linear-gradient(135deg, #FF416C, #FF4B2B);
                }

                /* Add Task Form */
                .add-task-form {
                    background: var(--secondary);
                    padding: 1.2rem;
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border);
                }
                .add-task-form h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text);
                }
                .form-group {
                    margin-bottom: 0.8rem;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.8rem;
                    margin-bottom: 0.8rem;
                }
                .input-field, .select-field {
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: var(--background);
                    color: var(--text);
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus, .select-field:focus {
                    border-color: #667eea;
                }
                .submit-btn {
                    width: 100%;
                    padding: 0.9rem;
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .submit-btn.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }
                .submit-btn.disabled {
                    background: var(--border);
                    cursor: not-allowed;
                }
                .submit-btn:active {
                    transform: scale(0.98);
                }

                /* Filter Chips */
                .filter-chips {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.2rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    -webkit-overflow-scrolling: touch;
                }
                .chip {
                    padding: 0.5rem 1rem;
                    background: var(--secondary);
                    color: var(--text);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .chip.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                /* Task List */
                .task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }
                .task-item {
                    padding: 1rem;
                    background: var(--secondary);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    transition: all 0.2s ease;
                }
                .task-item:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .task-item.completed { opacity: 0.5; }

                /* Row 1: Checkbox + Title + Delete */
                .task-row-1 {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }
                .task-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    accent-color: #667eea;
                    flex-shrink: 0;
                }
                .task-title {
                    flex: 1;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text);
                    line-height: 1.4;
                    word-wrap: break-word;
                }
                .task-item.completed .task-title {
                    text-decoration: line-through;
                    color: var(--text-secondary);
                }
                .delete-btn {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0.25rem;
                    opacity: 0.7;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    line-height: 1;
                }
                .delete-btn:hover {
                    opacity: 1;
                    color: #FF416C;
                    transform: scale(1.1);
                }

                /* Row 2: Priority + Date */
                .task-row-2 {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-left: 2.75rem; /* Align with title */
                    flex-wrap: wrap;
                }
                .priority-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    line-height: 1;
                }
                .priority-badge.priority-HIGH {
                    background: #FFE5E5;
                    color: #D32F2F;
                }
                .priority-badge.priority-MEDIUM {
                    background: #FFF4E5;
                    color: #F57C00;
                }
                .priority-badge.priority-LOW {
                    background: #E8F5E9;
                    color: #388E3C;
                }
                .date-badge {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    line-height: 1;
                }
                .date-badge.deadline-overdue {
                    color: #D32F2F;
                    font-weight: 700;
                }
                .date-badge.deadline-urgent {
                    color: #F57C00;
                    font-weight: 600;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                }

                /* Notification Box */
                .notification-box {
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: #FFF3CD;
                    border-radius: 12px;
                    border: 2px solid #FFD700;
                }
                .notification-box h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #856404;
                }
                .text-danger { color: #721c24; margin: 0.5rem 0; font-size: 0.9rem; }
                .text-warning { color: #856404; margin: 0.5rem 0; font-size: 0.9rem; }

                /* Alert Overlay */
                .alert-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 2000;
                    animation: fadeIn 0.3s;
                }
                .alert-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    z-index: 2001;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s;
                }
                .alert-icon { font-size: 4rem; margin-bottom: 1rem; }
                .alert-title { color: #FF416C; margin-bottom: 0.5rem; font-size: 1.5rem; }
                .alert-message { color: #333; font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; }
                .alert-actions { display: flex; gap: 1rem; justify-content: center; }
                .btn-primary {
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(135deg, #11998e, #38ef7d);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                }
                .btn-secondary {
                    padding: 0.8rem 1.5rem;
                    background: var(--secondary);
                    color: var(--text);
                    border: 2px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translate(-50%, -60%); opacity: 0; }
                    to { transform: translate(-50%, -50%); opacity: 1; }
                }
                @media (min-width: 769px) {
                    @keyframes slideUp {
                        from { transform: translate(-50%, -60%); opacity: 0; }
                        to { transform: translate(-50%, -50%); opacity: 1; }
                    }
                }
            `}</style>
        </>
    );
}
