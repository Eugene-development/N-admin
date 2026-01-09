/**
 * GraphQL API client for N-api service
 */
import { browser } from '$app/environment';

const GRAPHQL_API_URL = import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:8000/graphql';

/**
 * Get stored token
 */
function getToken() {
    if (!browser) return null;
    return localStorage.getItem('n_auth_token');
}

/**
 * Execute GraphQL query or mutation
 * @param {string} query - GraphQL query or mutation
 * @param {object} variables - Variables for the query
 * @returns {Promise<any>} - Response data
 */
export async function graphqlRequest(query, variables = {}) {
    const token = getToken();
    
    const response = await fetch(GRAPHQL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
        const error = new Error(result.errors[0]?.message || 'GraphQL Error');
        error.errors = result.errors;
        throw error;
    }

    return result.data;
}

// ============================================
// MEBEL QUERIES
// ============================================

/**
 * Get all mebel items
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getMebels(options = {}) {
    const query = `
        query GetMebels($is_active: Boolean, $trashed: Trashed, $rubric: String) {
            mebels(is_active: $is_active, trashed: $trashed, rubric: $rubric) {
                id
                value
                slug
                description
                bg
                rubric
                is_active
                sort_order
                created_at
                updated_at
                deleted_at
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.mebels;
}

/**
 * Get single mebel by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getMebel(id) {
    const query = `
        query GetMebels($id: ID!) {
            mebel(id: $id) {
                id
                value
                slug
                description
                bg
                rubric
                is_active
                sort_order
                created_at
                updated_at
            }
        }
    `;
    const data = await graphqlRequest(query, { id });
    return data.mebel;
}

// ============================================
// MEBEL MUTATIONS
// ============================================

/**
 * Create new mebel item
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createMebel(input) {
    const mutation = `
        mutation CreateMebel($input: CreateMebelInput!) {
            createMebel(input: $input) {
                id
                value
                slug
                description
                bg
                rubric
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createMebel;
}

/**
 * Update existing mebel item
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateMebel(id, input) {
    const mutation = `
        mutation UpdateMebel($id: ID!, $input: UpdateMebelInput!) {
            updateMebel(id: $id, input: $input) {
                id
                value
                slug
                description
                bg
                rubric
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateMebel;
}

/**
 * Soft delete mebel item
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteMebel(id) {
    const mutation = `
        mutation DeleteMebel($id: ID!) {
            deleteMebel(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteMebel;
}

/**
 * Restore soft deleted mebel item
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreMebel(id) {
    const mutation = `
        mutation RestoreMebel($id: ID!) {
            restoreMebel(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreMebel;
}

// ============================================
// RUBRIC QUERIES
// ============================================

/**
 * Get all rubrics
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getRubrics(options = {}) {
    const query = `
        query GetRubrics($is_active: Boolean, $trashed: Trashed) {
            rubrics(is_active: $is_active, trashed: $trashed) {
                id
                key
                value
                slug
                description
                is_active
                sort_order
                created_at
                updated_at
                deleted_at
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.rubrics;
}

/**
 * Get single rubric by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getRubric(id) {
    const query = `
        query GetRubric($id: ID!) {
            rubric(id: $id) {
                id
                key
                value
                slug
                description
                is_active
                sort_order
                created_at
                updated_at
            }
        }
    `;
    const data = await graphqlRequest(query, { id });
    return data.rubric;
}

// ============================================
// RUBRIC MUTATIONS
// ============================================

/**
 * Create new rubric
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createRubric(input) {
    const mutation = `
        mutation CreateRubric($input: CreateRubricInput!) {
            createRubric(input: $input) {
                id
                key
                value
                slug
                description
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createRubric;
}

/**
 * Update existing rubric
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateRubric(id, input) {
    const mutation = `
        mutation UpdateRubric($id: ID!, $input: UpdateRubricInput!) {
            updateRubric(id: $id, input: $input) {
                id
                key
                value
                slug
                description
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateRubric;
}

/**
 * Soft delete rubric
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteRubric(id) {
    const mutation = `
        mutation DeleteRubric($id: ID!) {
            deleteRubric(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteRubric;
}

/**
 * Restore soft deleted rubric
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreRubric(id) {
    const mutation = `
        mutation RestoreRubric($id: ID!) {
            restoreRubric(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreRubric;
}
