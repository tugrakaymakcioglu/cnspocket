'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * Custom hook for Google Analytics integration
 * Provides automatic page view tracking and manual event tracking
 * 
 * Usage:
 * const { trackEvent } = useAnalytics();
 * trackEvent('button_click', 'Homepage', 'CTA Button');
 */
export default function useAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page view on mount and route change
        if (pathname) {
            const url = searchParams ? `${pathname}?${searchParams}` : pathname;
            analytics.pageView(url, document.title);
        }
    }, [pathname, searchParams]);

    // Scroll depth tracking
    useEffect(() => {
        const scrollDepths = [25, 50, 75, 100];
        const triggered = new Set();

        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;

            scrollDepths.forEach(depth => {
                if (scrollPercentage >= depth && !triggered.has(depth)) {
                    analytics.scrollDepth(depth);
                    triggered.add(depth);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // Time on page tracking
    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
            if (timeSpent > 5) { // Only track if spent more than 5 seconds
                analytics.timeOnPage(timeSpent, pathname || 'unknown');
            }
        };
    }, [pathname]);

    // Manual event tracking function
    const trackEvent = (action, category, label, value) => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value,
            });
        }
    };

    return {
        trackEvent,
        analytics, // Provide access to all analytics functions
    };
}
