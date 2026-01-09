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

/**
 * Get rubric by slug
 * @param {string} slug 
 * @returns {Promise<object>}
 */
export async function getRubricBySlug(slug) {
    const query = `
        query GetRubricBySlug($slug: String!) {
            rubricBySlug(slug: $slug) {
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
    const data = await graphqlRequest(query, { slug });
    return data.rubricBySlug;
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

// ============================================
// CATEGORY QUERIES
// ============================================

/**
 * Get all categories
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getCategories(options = {}) {
    const query = `
        query GetCategories($is_active: Boolean, $trashed: Trashed, $rubric_id: ID) {
            categories(is_active: $is_active, trashed: $trashed, rubric_id: $rubric_id) {
                id
                value
                slug
                rubric_id
                description
                bg
                is_active
                sort_order
                created_at
                updated_at
                deleted_at
                rubric {
                    id
                    value
                    slug
                }
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.categories;
}

/**
 * Get single category by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getCategory(id) {
    const query = `
        query GetCategory($id: ID!) {
            category(id: $id) {
                id
                value
                slug
                rubric_id
                description
                bg
                is_active
                sort_order
                created_at
                updated_at
                rubric {
                    id
                    value
                    slug
                }
            }
        }
    `;
    const data = await graphqlRequest(query, { id });
    return data.category;
}

// ============================================
// CATEGORY MUTATIONS
// ============================================

/**
 * Create new category
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createCategory(input) {
    const mutation = `
        mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
                id
                value
                slug
                rubric_id
                description
                bg
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createCategory;
}

/**
 * Update existing category
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateCategory(id, input) {
    const mutation = `
        mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
            updateCategory(id: $id, input: $input) {
                id
                value
                slug
                rubric_id
                description
                bg
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateCategory;
}

/**
 * Soft delete category
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteCategory(id) {
    const mutation = `
        mutation DeleteCategory($id: ID!) {
            deleteCategory(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteCategory;
}

/**
 * Restore soft deleted category
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreCategory(id) {
    const mutation = `
        mutation RestoreCategory($id: ID!) {
            restoreCategory(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreCategory;
}
