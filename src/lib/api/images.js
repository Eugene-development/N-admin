/**
 * Image API client for N-api service
 */
import { browser } from '$app/environment';

// Извлекаем базовый URL из GraphQL URL (убираем /graphql)
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:8000/graphql';
const API_URL = GRAPHQL_URL.replace('/graphql', '');

/**
 * Get stored token
 */
function getToken() {
    if (!browser) return null;
    return localStorage.getItem('n_auth_token');
}

/**
 * Get headers for API requests
 */
function getHeaders(includeContentType = true) {
    const token = getToken();
    const headers = {
        'Accept': 'application/json',
    };
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * Upload images for an entity
 * @param {FileList|File[]} files - Files to upload
 * @param {string} parentableType - Type of parent model (e.g., 'App\\Models\\MebelProject')
 * @param {string} parentableId - ID of parent model
 * @returns {Promise<object>} - Response with uploaded images
 */
export async function uploadImages(files, parentableType, parentableId) {
    const formData = new FormData();
    
    // Добавляем файлы
    Array.from(files).forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });
    
    formData.append('parentable_type', parentableType);
    formData.append('parentable_id', parentableId);
    
    const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        headers: getHeaders(false), // Не устанавливаем Content-Type для FormData
        body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ошибка загрузки изображений');
    }
    
    return result;
}

/**
 * Get images for an entity
 * @param {string} parentableType - Type of parent model
 * @param {string} parentableId - ID of parent model
 * @returns {Promise<object>} - Response with images
 */
export async function getImages(parentableType, parentableId) {
    const params = new URLSearchParams({
        parentable_type: parentableType,
        parentable_id: parentableId,
    });
    
    const response = await fetch(`${API_URL}/api/images?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ошибка получения изображений');
    }
    
    return result;
}

/**
 * Delete image
 * @param {string} imageId - ID of image to delete
 * @returns {Promise<object>}
 */
export async function deleteImage(imageId) {
    const response = await fetch(`${API_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ошибка удаления изображения');
    }
    
    return result;
}

/**
 * Reorder images
 * @param {Array<{id: string, sort_order: number}>} images - Array of image order updates
 * @returns {Promise<object>}
 */
export async function reorderImages(images) {
    const response = await fetch(`${API_URL}/api/images/reorder`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ images }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ошибка обновления порядка');
    }
    
    return result;
}

/**
 * Toggle image active status
 * @param {string} imageId - ID of image
 * @returns {Promise<object>}
 */
export async function toggleImageActive(imageId) {
    const response = await fetch(`${API_URL}/api/images/${imageId}/toggle-active`, {
        method: 'PATCH',
        headers: getHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ошибка переключения статуса');
    }
    
    return result;
}
