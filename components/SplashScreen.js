'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

export default function SplashScreen({ children }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Show splash screen for at least 2 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
