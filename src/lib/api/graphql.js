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

    if (!response.ok && response.status >= 500) {
        const text = await response.text();
        console.error('Server error:', response.status, text);
        throw new Error(`Ошибка сервера (${response.status}). Проверьте логи бэкенда.`);
    }

    const result = await response.json();

    if (result.errors) {
        const errorMessages = result.errors.map(e => e.message || e.debugMessage || JSON.stringify(e)).join('; ');
        console.error('GraphQL errors:', result.errors);
        const error = new Error(errorMessages || 'GraphQL Error');
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
 * Get categories by rubric slug
 * @param {string} rubricSlug - Rubric slug
 * @returns {Promise<object>} - { rubric, categories }
 */
export async function getCategoriesByRubricSlug(rubricSlug) {
    const query = `
        query GetRubricWithCategories($slug: String!) {
            rubricBySlug(slug: $slug) {
                id
                value
                slug
                categories {
                    id
                    value
                    slug
                    description
                    is_active
                    sort_order
                }
            }
        }
    `;
    const data = await graphqlRequest(query, { slug: rubricSlug });
    return {
        rubric: data.rubricBySlug,
        categories: data.rubricBySlug?.categories || []
    };
}

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

// ============================================
// BRAND QUERIES
// ============================================

/**
 * Get all brands
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getBrands(options = {}) {
    const query = `
        query GetBrands($is_active: Boolean, $trashed: Trashed, $rubric_id: ID) {
            brands(is_active: $is_active, trashed: $trashed, rubric_id: $rubric_id) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                country
                website
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
    return data.brands;
}

/**
 * Get single brand by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getBrand(id) {
    const query = `
        query GetBrand($id: ID!) {
            brand(id: $id) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                country
                website
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
    return data.brand;
}

// ============================================
// BRAND MUTATIONS
// ============================================

/**
 * Create new brand
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createBrand(input) {
    const mutation = `
        mutation CreateBrand($input: CreateBrandInput!) {
            createBrand(input: $input) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                country
                website
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createBrand;
}

/**
 * Update existing brand
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateBrand(id, input) {
    const mutation = `
        mutation UpdateBrand($id: ID!, $input: UpdateBrandInput!) {
            updateBrand(id: $id, input: $input) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                country
                website
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateBrand;
}

/**
 * Soft delete brand
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteBrand(id) {
    const mutation = `
        mutation DeleteBrand($id: ID!) {
            deleteBrand(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteBrand;
}

/**
 * Restore soft deleted brand
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreBrand(id) {
    const mutation = `
        mutation RestoreBrand($id: ID!) {
            restoreBrand(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreBrand;
}

// ============================================
// SHOP QUERIES
// ============================================

/**
 * Get all shops
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getShops(options = {}) {
    const query = `
        query GetShops($is_active: Boolean, $trashed: Trashed, $rubric_id: ID) {
            shops(is_active: $is_active, trashed: $trashed, rubric_id: $rubric_id) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                website
                phone
                email
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
                categories {
                    id
                    value
                    slug
                    is_active
                    sort_order
                }
                brands {
                    id
                    value
                    logo
                    is_active
                    sort_order
                }
                cities {
                    id
                    city_name
                    is_active
                    sort_order
                }
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.shops;
}

/**
 * Get single shop by ID
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function getShop(id) {
    const query = `
        query GetShop($id: ID!) {
            shop(id: $id) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                website
                phone
                email
                is_active
                sort_order
                created_at
                updated_at
                rubric {
                    id
                    value
                    slug
                }
                categories {
                    id
                    value
                    slug
                    is_active
                    sort_order
                }
                brands {
                    id
                    value
                    logo
                    is_active
                    sort_order
                }
                cities {
                    id
                    city_name
                    is_active
                    sort_order
                }
            }
        }
    `;
    const data = await graphqlRequest(query, { id });
    return data.shop;
}

// ============================================
// SHOP MUTATIONS
// ============================================

/**
 * Create new shop
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createShop(input) {
    const mutation = `
        mutation CreateShop($input: CreateShopInput!) {
            createShop(input: $input) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                website
                phone
                email
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createShop;
}

/**
 * Update existing shop
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateShop(id, input) {
    const mutation = `
        mutation UpdateShop($id: ID!, $input: UpdateShopInput!) {
            updateShop(id: $id, input: $input) {
                id
                key
                value
                slug
                rubric_id
                description
                logo
                website
                phone
                email
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateShop;
}

/**
 * Soft delete shop
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteShop(id) {
    const mutation = `
        mutation DeleteShop($id: ID!) {
            deleteShop(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteShop;
}

/**
 * Restore soft deleted shop
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function restoreShop(id) {
    const mutation = `
        mutation RestoreShop($id: ID!) {
            restoreShop(id: $id) {
                id
                is_active
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.restoreShop;
}

// ============================================
// SHOP CATEGORY MUTATIONS
// ============================================

/**
 * Create new shop category
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createShopCategory(input) {
    const mutation = `
        mutation CreateShopCategory($input: CreateShopCategoryInput!) {
            createShopCategory(input: $input) {
                id
                shop_id
                value
                slug
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createShopCategory;
}

/**
 * Update existing shop category
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateShopCategory(id, input) {
    const mutation = `
        mutation UpdateShopCategory($id: ID!, $input: UpdateShopCategoryInput!) {
            updateShopCategory(id: $id, input: $input) {
                id
                shop_id
                value
                slug
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateShopCategory;
}

/**
 * Delete shop category
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteShopCategory(id) {
    const mutation = `
        mutation DeleteShopCategory($id: ID!) {
            deleteShopCategory(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteShopCategory;
}

// ============================================
// SHOP BRAND MUTATIONS
// ============================================

/**
 * Create new shop brand
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createShopBrand(input) {
    const mutation = `
        mutation CreateShopBrand($input: CreateShopBrandInput!) {
            createShopBrand(input: $input) {
                id
                shop_id
                value
                logo
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createShopBrand;
}

/**
 * Update existing shop brand
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateShopBrand(id, input) {
    const mutation = `
        mutation UpdateShopBrand($id: ID!, $input: UpdateShopBrandInput!) {
            updateShopBrand(id: $id, input: $input) {
                id
                shop_id
                value
                logo
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateShopBrand;
}

/**
 * Delete shop brand
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteShopBrand(id) {
    const mutation = `
        mutation DeleteShopBrand($id: ID!) {
            deleteShopBrand(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteShopBrand;
}

// ============================================
// SHOP CITY MUTATIONS
// ============================================

/**
 * Create new shop city
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function createShopCity(input) {
    const mutation = `
        mutation CreateShopCity($input: CreateShopCityInput!) {
            createShopCity(input: $input) {
                id
                shop_id
                city_name
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createShopCity;
}

/**
 * Update existing shop city
 * @param {string} id 
 * @param {object} input 
 * @returns {Promise<object>}
 */
export async function updateShopCity(id, input) {
    const mutation = `
        mutation UpdateShopCity($id: ID!, $input: UpdateShopCityInput!) {
            updateShopCity(id: $id, input: $input) {
                id
                shop_id
                city_name
                is_active
                sort_order
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateShopCity;
}

/**
 * Delete shop city
 * @param {string} id 
 * @returns {Promise<object>}
 */
export async function deleteShopCity(id) {
    const mutation = `
        mutation DeleteShopCity($id: ID!) {
            deleteShopCity(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteShopCity;
}

// ============================================
// COUNTERTOP MANUFACTURER QUERIES & MUTATIONS
// ============================================

/**
 * Get all countertop manufacturers
 * @param {object} options - Filter options
 * @returns {Promise<array>}
 */
export async function getCountertopManufacturers(options = {}) {
    const query = `
        query GetCountertopManufacturers($is_active: Boolean, $category_id: ID, $trashed: Trashed) {
            countertopManufacturers(is_active: $is_active, category_id: $category_id, trashed: $trashed) {
                id
                key
                category_id
                value
                slug
                description
                logo
                website
                phone
                email
                country
                is_active
                sort_order
                deleted_at
                category {
                    id
                    value
                    slug
                }
            }
        }
    `;
    const data = await graphqlRequest(query, options);
    return data.countertopManufacturers;
}

/**
 * Create countertop manufacturer
 * @param {object} input - Manufacturer data
 * @returns {Promise<object>}
 */
export async function createCountertopManufacturer(input) {
    const mutation = `
        mutation CreateCountertopManufacturer($input: CreateCountertopManufacturerInput!) {
            createCountertopManufacturer(input: $input) {
                id
                value
                slug
            }
        }
    `;
    const data = await graphqlRequest(mutation, { input });
    return data.createCountertopManufacturer;
}

/**
 * Update countertop manufacturer
 * @param {string} id - Manufacturer ID
 * @param {object} input - Updated data
 * @returns {Promise<object>}
 */
export async function updateCountertopManufacturer(id, input) {
    const mutation = `
        mutation UpdateCountertopManufacturer($id: ID!, $input: UpdateCountertopManufacturerInput!) {
            updateCountertopManufacturer(id: $id, input: $input) {
                id
                value
                slug
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id, input });
    return data.updateCountertopManufacturer;
}

/**
 * Delete countertop manufacturer
 * @param {string} id - Manufacturer ID
 * @returns {Promise<object>}
 */
export async function deleteCountertopManufacturer(id) {
    const mutation = `
        mutation DeleteCountertopManufacturer($id: ID!) {
            deleteCountertopManufacturer(id: $id) {
                id
            }
        }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.deleteCountertopManufacturer;
}
