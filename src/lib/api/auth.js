/**
 * Auth API client for N-auth service
 */
import { browser } from '$app/environment';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/api';
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
 * Make authenticated request to auth API
 */
async function authFetch(endpoint, options = {}) {
    const url = `${AUTH_API_URL}${endpoint}`;
    const token = getToken();
    
    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
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
 * Login user
 */
export async function login(email, password) {
    const response = await authFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
        saveToken(response.token);
    }
    
    return response;
}

/**
 * Register new user
 */
export async function register(data) {
    const response = await authFetch('/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
        saveToken(response.token);
    }
    
    return response;
}

/**
 * Logout user
 */
export async function logout() {
    try {
        await authFetch('/logout', {
            method: 'POST',
        });
    } finally {
        saveToken(null);
    }
}

/**
 * Get current user
 */
export async function getUser() {
    return authFetch('/user', {
        method: 'GET',
    });
}

/**
 * Refresh token
 */
export async function refreshToken() {
    const response = await authFetch('/refresh', {
        method: 'POST',
    });
    
    if (response.success && response.token) {
        saveToken(response.token);
    }
    
    return response;
}

/**
 * Check if user has token stored
 */
export function hasToken() {
    return !!getToken();
}
