import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import NotificationBell from '@/components/NotificationBell';
import Calendar from '@/components/Calendar';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './globals.css'
import { Inter, Pacifico } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const pacifico = Pacifico({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-pacifico'
})

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
}

export const metadata = {
    metadataBase: new URL('https://www.xn--notvarm-xfb.com'),
    title: 'Notvarmı',
    description: 'University Student Platform',
    themeColor: '#8b5cf6',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Notvarmı',
    },
    icons: {
        icon: [
            { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { url: '/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
        apple: [
            { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
        ],
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <GoogleAnalytics />
                <script dangerouslySetInnerHTML={{
                    __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js').then(
                                    function(registration) {
                                        console.log('ServiceWorker registration successful');
                                    },
                                    function(err) {
                                        console.log('ServiceWorker registration failed: ', err);
                                    }
                                );
                            });
                        }
                    `
                }} />
            </head>
            <body suppressHydrationWarning={true} className={`${inter.className} ${pacifico.variable}`}>
                <Providers>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Navbar />
                        <main style={{
                            flex: 1,
                            padding: '2rem',
                            maxWidth: '1200px',
                            margin: '0 auto',
                            width: '100%'
                        }} className="responsive-main">
                            {children}
                        </main>
                        <Footer />
                    </div>
                    <NotificationBell />
                    <Calendar />
                </Providers>
            </body>
        </html>
    )
}
