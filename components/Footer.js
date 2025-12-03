export default function Footer() {
    return (
        <footer className="responsive-footer" style={{
            textAlign: 'center',
            padding: '2rem',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto'
        }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                &copy; {new Date().getFullYear()} Notvarmı. All rights reserved.
            </p>
        </footer>
    );
}
