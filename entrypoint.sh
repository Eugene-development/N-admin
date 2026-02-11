#!/bin/sh

# SvelteKit Novostroy Frontend Entrypoint Script
# Reads Docker secrets and sets PUBLIC environment variables

echo "🚀 SvelteKit Novostroy Frontend starting with domain secrets resolution..."

# Read secret values for configuration
FRONTEND_URL_VALUE=""
API_BASE_URL_VALUE=""
AUTH_API_URL_VALUE=""

if [ -f "/run/secrets/frontend_url" ]; then
    FRONTEND_URL_VALUE=$(cat /run/secrets/frontend_url)
    echo "✅ FRONTEND_URL set from secret: $FRONTEND_URL_VALUE"
fi

if [ -f "/run/secrets/api_base_url" ]; then
    API_BASE_URL_VALUE=$(cat /run/secrets/api_base_url)
    echo "✅ API_BASE_URL set from secret: $API_BASE_URL_VALUE"
fi

if [ -f "/run/secrets/auth_api_url" ]; then
    AUTH_API_URL_VALUE=$(cat /run/secrets/auth_api_url)
    echo "✅ AUTH_API_URL set from secret: $AUTH_API_URL_VALUE"
fi

# Set production defaults if no secrets provided
FINAL_API_BASE_URL="${API_BASE_URL_VALUE:-https://api.novostroy.org}"
FINAL_AUTH_API_URL="${AUTH_API_URL_VALUE:-https://auth.novostroy.org}"
FINAL_FRONTEND_URL="${FRONTEND_URL_VALUE:-https://novostroy.org}"

# Create configuration file for the browser
mkdir -p /app/build/client
cat > /app/build/client/config.js << EOF
window.__APP_CONFIG__ = {
    API_BASE_URL: '${FINAL_API_BASE_URL}',
    AUTH_API_URL: '${FINAL_AUTH_API_URL}',
    FRONTEND_URL: '${FINAL_FRONTEND_URL}'
};
EOF

# Debug: Show resolved environment variables
echo "🔍 Configuration resolved:"
echo "  API_BASE_URL: ${FINAL_API_BASE_URL}"
echo "  AUTH_API_URL: ${FINAL_AUTH_API_URL}"
echo "  FRONTEND_URL: ${FINAL_FRONTEND_URL}"
# Export AUTH_BACKEND_URL for server-side proxy (used by SvelteKit $env/dynamic/private)
export AUTH_BACKEND_URL="${FINAL_AUTH_API_URL}/api"
echo "  AUTH_BACKEND_URL: ${AUTH_BACKEND_URL}"

# Start SvelteKit Novostroy Frontend application
echo "🌐 Starting SvelteKit Novostroy Frontend application..."
echo "📋 Command to execute: $@"

# Execute the command with proper signal handling
exec "$@"
