/**
 * Auth store using Svelte 5 runes
 */
import { getUser, logout as logoutApi } from '$lib/api/auth.js';

// Auth state
let user = $state(null);
let isLoading = $state(true);
let isAuthenticated = $derived(!!user);

/**
 * Initialize auth state - check if user is logged in
 */
export async function initAuth() {
    isLoading = true;
    try {
        const response = await getUser();
        if (response.success) {
            user = response.user;
        }
    } catch (e) {
        user = null;
    } finally {
        isLoading = false;
    }
}

/**
 * Set user after login/register
 */
export function setUser(userData) {
    user = userData;
}

/**
 * Logout user
 */
export async function logout() {
    try {
        await logoutApi();
    } catch (e) {
        // Ignore errors
    } finally {
        user = null;
    }
}

/**
 * Get auth state
 */
export function getAuthState() {
    return {
        get user() { return user; },
        get isLoading() { return isLoading; },
        get isAuthenticated() { return isAuthenticated; },
    };
}
