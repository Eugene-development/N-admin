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

// ============================================
// MEBEL PROJECT QUERIES
// ============================================

/**
 * Get all mebel projects
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getMebelProjects(options = {}) {
    const query = `
        query GetMebelProjects($is_active: Boolean, $trashed: Trashed, $category_id: ID, $is_featured: Boolean, $is_new: Boolean) {
            mebelProjects(is_active: $is_active, trashed: $trashed, category_id: $category_id, is_featured: $is_featured, is_new: $is_new) {
                id
                key
                category_id
                value
                slug
                description
                short_description
                price
                old_price
                meta
                is_active
                is_featured
                is_new
                sort_order
                created_at
                updated_at
                deleted_at
                category {
                    id
                    value
                    slug
                    rubric {
                        id
                        value
                        slug
                    }
                }
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.mebelProjects;
}

/**
 * Get single mebel project by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getMebelProject(id) {
    const query = `
        query GetMebelProject($id: ID!) {
            mebelProject(id: $id) {
                id
                key
                category_id
                value
                slug
                description
                short_description
                price
                old_price
                meta
                is_active
                is_featured
                is_new
                sort_order
                created_at
                updated_at
                category {
                    id
                    value
                    slug
                }
            }
        }
    `;
    const data = await graphqlRequest(query, { id });
    return data.mebelProject;
}

// ============================================
// MEBEL PROJECT MUTATIONS
// ============================================

/**
 * Create new mebel project
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createMebelProject(input) {
    const mutation = `
        mutation CreateMebelProject($input: CreateMebelProjectInput!) {
            createMebelProject(input: $input) {
                id
                key
                category_id
                value
                slug
                description
                short_description
                price
                old_price
                meta
                is_active
                is_featured
                is_new
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createMebelProject;
}

/**
 * Update existing mebel project
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateMebelProject(id, input) {
    const mutation = `
        mutation UpdateMebelProject($id: ID!, $input: UpdateMebelProjectInput!) {
            updateMebelProject(id: $id, input: $input) {
                id
                key
                category_id
                value
                slug
                description
                short_description
                price
                old_price
                meta
                is_active
                is_featured
                is_new
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateMebelProject;
}

/**
 * Soft delete mebel project
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteMebelProject(id) {
    const mutation = `
        mutation DeleteMebelProject($id: ID!) {
            deleteMebelProject(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteMebelProject;
}

/**
 * Restore soft deleted mebel project
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreMebelProject(id) {
    const mutation = `
        mutation RestoreMebelProject($id: ID!) {
            restoreMebelProject(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreMebelProject;
}
