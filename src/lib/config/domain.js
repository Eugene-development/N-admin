/**
 * Domain-based configuration for Novostroy
 * Dynamically determines API URLs based on current domain
 */

import { browser } from '$app/environment';

/**
 * Domain mapping configuration
 * Maps frontend domains to their corresponding auth API domains
 */
const DOMAIN_CONFIG = {
	// novostroy.org domain family
	'admin.novostroy.org': {
		authApi: 'https://auth.novostroy.org',
		api: 'https://crud.novostroy.org'
	},
	'novostroy.org': {
		authApi: 'https://auth.novostroy.org',
		api: 'https://crud.novostroy.org'
	},
	// Development fallback
	'localhost': {
		authApi: 'http://localhost:8001',
		api: 'http://localhost:8000'
	}
};

/**
 * Get current hostname
 * Works both on client and server side
 * @param {Request} [request] - Optional request object for server-side
 * @returns {string} Current hostname
 */
export function getCurrentHostname(request = null) {
	// Server-side: use request headers
	if (request) {
		const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
		if (host) {
			return host.split(':')[0]; // Remove port if present
		}
	}

	// Client-side: use window.location
	if (browser && typeof window !== 'undefined') {
		return window.location.hostname;
	}

	// Fallback
	return 'localhost';
}

/**
 * Get domain configuration based on hostname
 * @param {string} hostname - Current hostname
 * @returns {Object} Domain configuration with authApi and api URLs
 */
export function getDomainConfig(hostname) {
	// Direct match
	if (DOMAIN_CONFIG[hostname]) {
		return DOMAIN_CONFIG[hostname];
	}

	// Check for partial matches
	for (const [domain, config] of Object.entries(DOMAIN_CONFIG)) {
		if (hostname.endsWith(domain) || hostname.includes(domain)) {
			return config;
		}
	}

	// Default fallback to novostroy.org for production
	if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
		return DOMAIN_CONFIG['admin.novostroy.org'];
	}

	// Development fallback
	return DOMAIN_CONFIG['localhost'];
}

/**
 * Get Auth API URL based on current domain
 * @param {Request|string} [requestOrHostname] - Optional request object or hostname
 * @returns {string} Auth API URL
 */
export function getAuthApiUrl(requestOrHostname = null) {
	let hostname;
	if (typeof requestOrHostname === 'string') {
		hostname = requestOrHostname;
	} else {
		hostname = getCurrentHostname(requestOrHostname);
	}
	const config = getDomainConfig(hostname);
	return config.authApi;
}

/**
 * Get cookie domain for cross-subdomain cookie sharing
 * @param {Request|string} [requestOrHostname] - Optional request object or hostname
 * @returns {string|undefined} Cookie domain or undefined for localhost
 */
export function getCookieDomain(requestOrHostname = null) {
	let hostname;
	if (typeof requestOrHostname === 'string') {
		hostname = requestOrHostname;
	} else {
		hostname = getCurrentHostname(requestOrHostname);
	}

	// No domain for localhost
	if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
		return undefined;
	}

	// Extract root domain for cookie sharing across subdomains
	if (hostname.includes('novostroy.org')) {
		return '.novostroy.org';
	}

	// Fallback: return undefined to use current domain
	return undefined;
}
