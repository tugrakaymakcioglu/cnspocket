export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log specific events
export const logEvent = (action, category, label, value) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Pre-defined events for consistency
export const analytics = {
    // Auth Events
    login: (method = 'email') => {
        logEvent('login', 'Auth', method);
    },
    register: (method = 'email') => {
        logEvent('sign_up', 'Auth', method);
    },

    // Search Events
    search: (query) => {
        logEvent('search', 'Search', query);
    },

    // Content Events
    viewProfile: (username) => {
        logEvent('view_item', 'Profile', username);
    },
    viewCourse: (courseName) => {
        logEvent('view_item', 'Course', courseName);
    },
    viewPost: (postTitle) => {
        logEvent('view_item', 'Forum', postTitle);
    },

    // Interaction Events
    createPost: (category) => {
        logEvent('create_post', 'Forum', category);
    },
    createReply: (postId) => {
        logEvent('reply', 'Forum', postId);
    },
    downloadFile: (fileName) => {
        logEvent('file_download', 'Files', fileName);
    },

    // Error Events
    error: (description, fatal = false) => {
        logEvent('exception', 'Error', description, fatal ? 1 : 0);
    }
};
