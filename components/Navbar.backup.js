const [unreadMessages, setUnreadMessages] = useState(0);
const [userRole, setUserRole] = useState(null);

useEffect(() => {
    if (status === 'authenticated') {
        fetchUnreadMessages();
        fetchUserRole();
        const interval = setInterval(fetchUnreadMessages, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }
}, [status]);

const fetchUserRole = async () => {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setUserRole(data.role);
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
    }
};

const fetchUnreadMessages = async () => {
    try {
        const res = await fetch('/api/messages/unread-count');
        if (res.ok) {
            const data = await res.json();
            setUnreadMessages(data.count);
        }
    } catch (error) {
        console.error('Error fetching unread messages:', error);
    }
};

return (
    <nav className={styles.navbar}>
        <div className={styles.logo}>
            <Link href="/" style={{
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                fontFamily: 'var(--font-pacifico)',
                fontSize: '2.2rem',
                letterSpacing: '1px',
                paddingBottom: '0.5rem' // Add some spacing for the larger font
            }}>Notvarmı</Link>
        </div>
        <ul className={styles.navLinks}>
            <li>
                <button
                    onClick={toggleLanguage}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text)';
                    }}
                >
                    🌐 {language === 'tr' ? 'TR' : 'EN'}
                </button>
            </li>
            <li>
                <ThemeToggle />
            </li>
            {status === 'authenticated' && (
                <li>
                    <ProductivityMenu />
                </li>
            )}
            <li>
                <Link href="/search" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                    title="Ara">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </Link>
            </li>
            {status === 'authenticated' ? (
                <>
                    {/* Admin users get different menu */}
                    {userRole && (userRole === 'ADMIN' || userRole === 'POWERUSER') ? (
                        <>
                            <li>
                                <Link href="/admin">
                                    🛡️ Admin Paneli
                                </Link>
                            </li>
                            <li>
                                <Link href="/forum">{t.navbar.forum}</Link>
                            </li>
                            <li>
                                <Link href="/messages" style={{ position: 'relative' }}>
                                    💬 Mesajlar
                                    {unreadMessages > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-12px',
                                            background: '#ff4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            border: '2px solid var(--background)'
                                        }}>
                                            {unreadMessages > 9 ? '9+' : unreadMessages}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        </>
                    ) : (
                        /* Regular users get full menu */
                        <>
                            <li>
                                <Link href="/courses">{t.navbar.courses}</Link>
                            </li>
                            <li>
                                <Link href="/notes">{t.navbar.notes}</Link>
                            </li>
                            <li>
                                <Link href="/forum">{t.navbar.forum}</Link>
                            </li>
                            <li>
                                <Link href="/messages" style={{ position: 'relative' }}>
                                    💬 Mesajlar
                                    {unreadMessages > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-12px',
                                            background: '#ff4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            border: '2px solid var(--background)'
                                        }}>
                                            {unreadMessages > 9 ? '9+' : unreadMessages}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        </>
                    )}
                    <li>
                        <UserMenu user={session.user} />
                    </li>
                </>
            ) : (
                <>
                    <li>
                        <Link href="/login">{t.navbar.login}</Link>
                    </li>
                    <li>
                        <Link href="/register" style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--background)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px'
                        }}>{t.navbar.register}</Link>
                    </li>
                </>
            )}
        </ul>
    </nav>
);
}
