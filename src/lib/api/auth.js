/**
 * Auth API client for N-admin
 * Calls SvelteKit server-side endpoints to avoid CORS
 * Pattern: browser → /api/auth/login-jwt → SvelteKit server → auth.novostroy.org
 */
import { browser } from '$app/environment';

const TOKEN_KEY = 'n_auth_token';

/**
 * Get stored token
 */
function getToken() {
    if (!browser) return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save token
 */
function saveToken(token) {
    if (!browser) return;
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

/**
 * Login user - calls SvelteKit endpoint which proxies to auth backend
 */
export async function login(email, password) {
    console.log('🔐 Login API request:', { email });

    const response = await fetch('/api/auth/login-jwt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
    });

    const data = await response.json();

    console.log('🔐 Login API response:', { success: data.success, hasUser: !!data.user });

    if (!response.ok || !data.success) {
        const error = new Error(data.message || 'Ошибка входа');
        error.errors = data.errors || {};
        error.status = response.status;
        throw error;
    }

    // Save token to localStorage as backup
    if (data.token) {
        saveToken(data.token);
    }

    return data;
}

/**
 * Register new user
 */
export async function register(data) {
    // Registration still goes through auth API directly for now
    // Can be proxied later if needed
    const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '/api/auth';
    const url = `${AUTH_API_URL}/register`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.message || 'Ошибка регистрации');
        error.errors = result.errors || {};
        error.status = response.status;
        throw error;
    }

    if (result.success && result.token) {
        saveToken(result.token);
    }

    return result;
}

/**
 * Logout user - calls SvelteKit endpoint to clear httpOnly cookies
 */
export async function logout() {
    try {
        await fetch('/api/auth/logout-jwt', {
            method: 'POST',
            credentials: 'include'
        });
        console.log('🍪 Cookies cleared via SvelteKit endpoint');
    } catch (err) {
        console.warn('⚠️ Failed to clear cookies:', err);
    } finally {
        saveToken(null);
    }
}

/**
 * Get current user
 */
export async function getUser() {
    const token = getToken();
    if (!token) return null;

    const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '/api/auth';
    const url = `${AUTH_API_URL}/user`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Ошибка запроса');
        error.errors = data.errors || {};
        error.status = response.status;
        throw error;
    }

    return data;
}

/**
 * Refresh token
 */
export async function refreshToken() {
    const token = getToken();
    if (!token) return null;

    const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '/api/auth';
    const url = `${AUTH_API_URL}/refresh`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Ошибка обновления токена');
        error.errors = data.errors || {};
        error.status = response.status;
        throw error;
    }

    if (data.success && data.token) {
        saveToken(data.token);
    }

    return data;
}

/**
 * Check if user has token stored
 */
export function hasToken() {
    return !!getToken();
}
