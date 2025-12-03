export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if gtag is available
const isGtagAvailable = () => {
    return typeof window !== 'undefined' && window.gtag;
};

// Log specific events
export const logEvent = (action, category, label, value) => {
    if (isGtagAvailable()) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Page view tracking
export const trackPageView = (url, title) => {
    if (isGtagAvailable()) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
            page_title: title,
        });
    }
};

// Pre-defined events for consistency
export const analytics = {
    // ==================== AUTH EVENTS ====================
    login: (method = 'email') => {
        logEvent('login', 'Auth', method);
    },
    register: (method = 'email') => {
        logEvent('sign_up', 'Auth', method);
    },
    logout: () => {
        logEvent('logout', 'Auth', 'manual');
    },

    // ==================== SEARCH EVENTS ====================
    search: (query) => {
        logEvent('search', 'Search', query);
    },

    // ==================== CONTENT EVENTS ====================
    viewProfile: (username) => {
        logEvent('view_item', 'Profile', username);
    },
    viewCourse: (courseName) => {
        logEvent('view_item', 'Course', courseName);
    },
    viewPost: (postTitle) => {
        logEvent('view_item', 'Forum', postTitle);
    },

    // ==================== INTERACTION EVENTS ====================
    createPost: (category) => {
        logEvent('create_post', 'Forum', category);
    },
    createReply: (postId) => {
        logEvent('reply', 'Forum', postId);
    },
    vote: (type, itemId) => {
        // type: 'upvote' or 'downvote'
        logEvent('vote', 'Engagement', `${type}_${itemId}`);
    },
    share: (platform, contentType) => {
        // platform: 'twitter', 'facebook', 'whatsapp', 'copy_link'
        logEvent('share', 'Social', `${platform}_${contentType}`);
    },
    report: (itemType, itemId) => {
        logEvent('report', 'Moderation', `${itemType}_${itemId}`);
    },

    // ==================== FILE EVENTS ====================
    downloadFile: (fileName) => {
        logEvent('file_download', 'Files', fileName);
    },
    uploadFile: (fileName, fileSize, fileType) => {
        logEvent('file_upload', 'Files', `${fileName}_${fileType}_${fileSize}bytes`);
    },

    // ==================== MESSAGING EVENTS ====================
    sendMessage: (recipientId) => {
        logEvent('send_message', 'Messages', recipientId);
    },
    readNotification: (notificationType) => {
        logEvent('notification_click', 'Notifications', notificationType);
    },
    markAllRead: () => {
        logEvent('mark_all_read', 'Notifications', 'bulk_action');
    },

    // ==================== NAVIGATION EVENTS ====================
    pageView: (url, title) => {
        trackPageView(url, title);
    },
    navigation: (from, to) => {
        logEvent('navigation', 'Navigation', `${from}_to_${to}`);
    },
    externalLink: (url) => {
        logEvent('click', 'External_Link', url);
    },

    // ==================== USER ENGAGEMENT ====================
    scrollDepth: (percentage) => {
        // Track at 25%, 50%, 75%, 100%
        logEvent('scroll', 'Engagement', `${percentage}%`);
    },
    timeOnPage: (seconds, pageName) => {
        logEvent('timing_complete', 'Engagement', pageName, seconds);
    },
    buttonClick: (buttonName, location) => {
        logEvent('click', 'Button', `${buttonName}_${location}`);
    },
    formSubmit: (formName, success = true) => {
        logEvent('form_submit', 'Form', formName, success ? 1 : 0);
    },

    // ==================== PERFORMANCE TRACKING ====================
    performance: (metric, value) => {
        // metric: 'page_load', 'api_call', 'image_load', etc.
        logEvent('performance', 'Performance', metric, Math.round(value));
    },
    apiCall: (endpoint, duration, status) => {
        logEvent('api_call', 'API', `${endpoint}_${status}`, Math.round(duration));
    },

    // ==================== ERROR EVENTS ====================
    error: (description, fatal = false) => {
        logEvent('exception', 'Error', description, fatal ? 1 : 0);
    },
    apiError: (endpoint, errorCode, errorMessage) => {
        logEvent('api_error', 'Error', `${endpoint}_${errorCode}_${errorMessage}`);
    },
    notFound: (path) => {
        logEvent('404', 'Error', path);
    },

    // ==================== CALENDAR & TASKS ====================
    createTask: (taskType) => {
        logEvent('create_task', 'Productivity', taskType);
    },
    completeTask: (taskType) => {
        logEvent('complete_task', 'Productivity', taskType);
    },
    viewCalendar: (view) => {
        // view: 'month', 'week', 'day'
        logEvent('view_calendar', 'Productivity', view);
    },

    // ==================== THEME & SETTINGS ====================
    changeTheme: (theme) => {
        // theme: 'light', 'dark'
        logEvent('change_theme', 'Settings', theme);
    },
    changeLanguage: (language) => {
        logEvent('change_language', 'Settings', language);
    },
};

// Helper function for auto-tracking page views with Next.js Router
export const usePageTracking = (router) => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = (url) => {
        analytics.pageView(url, document.title);
    };

    router?.events?.on('routeChangeComplete', handleRouteChange);

    return () => {
        router?.events?.off('routeChangeComplete', handleRouteChange);
    };
};
