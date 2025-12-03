'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Calendar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && isOpen) {
            fetchAllEvents();
        }
    }, [session, isOpen]);

    const fetchAllEvents = async () => {
        try {
            const allEvents = [];

            // Fetch tasks/reminders
            const tasksRes = await fetch('/api/tasks');
            if (tasksRes.ok) {
                const tasks = await tasksRes.json();
                tasks.forEach(task => {
                    if (task.dueDate) {
                        allEvents.push({
                            id: task.id,
                            title: task.title,
                            date: new Date(task.dueDate),
                            type: 'reminder',
                            color: '#8b5cf6',
                            link: null,
                            category: task.category
                        });
                    }
                });
            }

            // Fetch forum posts
            const forumRes = await fetch('/api/forum/posts');
            if (forumRes.ok) {
                const data = await forumRes.json();
                const posts = data.posts || [];
                const userPosts = posts.filter(p => p.authorId === session?.user?.id);
                userPosts.forEach(post => {
                    allEvents.push({
                        id: post.id,
                        title: post.title,
                        date: new Date(post.createdAt),
                        type: 'forum',
                        color: '#ec4899',
                        link: `/forum/${post.id}`
                    });
                });
            }

            // Fetch courses with exams
            const coursesRes = await fetch('/api/courses');
            if (coursesRes.ok) {
                const courses = await coursesRes.json();
                courses.forEach(course => {
                    if (course.examDate) {
                        allEvents.push({
                            id: course.id,
                            title: `${course.code} Sınavı`,
                            date: new Date(course.examDate),
                            type: 'exam',
                            color: '#3b82f6',
                            link: '/courses'
                        });
                    }
                });
            }

            setEvents(allEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getEventsForDay = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const targetDate = new Date(year, month, day);

        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year;
        });
    };

    const handleEventClick = (event) => {
        if (event.link) {
            router.push(event.link);
            setIsOpen(false);
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    if (!session) return null;

    return (
        <>
            {/* Calendar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '2rem',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    zIndex: 998,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                }}
            >
                📅
            </button>

            {/* Calendar Modal */}
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
                            zIndex: 999
                        }}
                    />

                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        background: 'var(--background)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                        zIndex: 1000,
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
                                    📅 Takvim
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

                        {/* Month Navigation */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '2px solid var(--border)'
                        }}>
                            <button
                                onClick={previousMonth}
                                style={{
                                    background: 'var(--secondary)',
                                    border: '2px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text)'
                                }}
                            >
                                ← Önceki
                            </button>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)', textTransform: 'capitalize' }}>
                                {monthName}
                            </h3>
                            <button
                                onClick={nextMonth}
                                style={{
                                    background: 'var(--secondary)',
                                    border: '2px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text)'
                                }}
                            >
                                Sonraki →
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {/* Day Headers */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                                    <div key={day} style={{
                                        textAlign: 'center',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)',
                                        padding: '0.5rem'
                                    }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '0.5rem'
                            }}>
                                {/* Empty cells for days before month starts */}
                                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} style={{ minHeight: '80px' }} />
                                ))}

                                {/* Actual days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const isToday = new Date().getDate() === day &&
                                        new Date().getMonth() === currentDate.getMonth() &&
                                        new Date().getFullYear() === currentDate.getFullYear();

                                    return (
                                        <div key={day} style={{
                                            minHeight: '80px',
                                            background: isToday ? 'rgba(102, 126, 234, 0.1)' : 'var(--secondary)',
                                            borderRadius: '12px',
                                            padding: '0.5rem',
                                            border: isToday ? '2px solid #667eea' : '2px solid var(--border)',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                color: 'var(--text)',
                                                marginBottom: '0.3rem'
                                            }}>
                                                {day}
                                            </div>

                                            {/* Event indicators */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                {dayEvents.slice(0, 2).map((event, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleEventClick(event)}
                                                        style={{
                                                            background: event.color,
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            padding: '0.2rem 0.4rem',
                                                            borderRadius: '6px',
                                                            cursor: event.link ? 'pointer' : 'default',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontWeight: '600'
                                                        }}
                                                        title={event.title}
                                                    >
                                                        {event.type === 'reminder' ? '🔔' : event.type === 'forum' ? '💬' : '📝'} {event.title.substring(0, 10)}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 2 && (
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-secondary)',
                                                        fontWeight: '600'
                                                    }}>
                                                        +{dayEvents.length - 2} daha
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
