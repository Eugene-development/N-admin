/**
 * Server-side proxy for auth API
 * 
 * Eliminates CORS by proxying browser requests through SvelteKit server.
 * Browser → admin.novostroy.org/api/auth/* → auth backend (server-to-server, no CORS)
 */
import { env } from '$env/dynamic/private';

function getBackendUrl() {
    return env.AUTH_BACKEND_URL || 'http://localhost:8001/api';
}

/**
 * Proxy request to auth backend
 */
async function proxyRequest({ request, params }) {
    const backendUrl = getBackendUrl();
    const path = params.path;
    const url = `${backendUrl}/${path}`;

    // Build headers to forward
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    // Forward Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }

    // Forward Origin for backend CORS processing (optional)
    const origin = request.headers.get('Origin');
    if (origin) {
        headers.set('Origin', origin);
    }

    const fetchConfig = {
        method: request.method,
        headers,
    };

    // Forward body for POST/PUT/PATCH/DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        try {
            const body = await request.text();
            if (body) fetchConfig.body = body;
        } catch {
            // No body
        }
    }

    try {
        const response = await fetch(url, fetchConfig);
        const data = await response.text();

        // Build response headers
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/json');

        // Forward Set-Cookie from auth backend (for httpOnly JWT cookie)
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            responseHeaders.set('set-cookie', setCookie);
        }

        return new Response(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Auth proxy error:', error.message);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Сервис авторизации недоступен',
                errors: { general: ['Попробуйте позже'] }
            }),
            {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
    return proxyRequest(event);
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    return proxyRequest(event);
}

/** @type {import('./$types').RequestHandler} */
export async function PUT(event) {
    return proxyRequest(event);
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE(event) {
    return proxyRequest(event);
}

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS(event) {
    // For same-origin requests, OPTIONS preflight shouldn't happen
    // But handle it just in case
    return new Response(null, {
        status: 204,
        headers: {
            'Allow': 'GET, POST, PUT, DELETE, OPTIONS'
        }
    });
}
