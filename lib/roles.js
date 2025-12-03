// Role constants
export const USER_ROLES = {
    POWERUSER: 'POWERUSER',
    ADMIN: 'ADMIN',
    USER: 'USER'
};

// Check if user has required role
export function hasRole(userRole, requiredRole) {
    const hierarchy = {
        POWERUSER: 3,
        ADMIN: 2,
        USER: 1
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
}

// Check if user is admin or higher
export function isAdmin(userRole) {
    return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.POWERUSER;
}

// Check if user is poweruser
export function isPowerUser(userRole) {
    return userRole === USER_ROLES.POWERUSER;
}
