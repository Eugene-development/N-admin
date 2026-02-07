<script>
    import { getCategories, createCategory, updateCategory, deleteCategory } from '$lib/api/graphql.js';
    import CategoryModal from './CategoryModal.svelte';

    let { rubricId = null, rubricSlug = '', title = 'Управление категориями' } = $props();

    // State
    let categories = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingCategory = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadCategories() {
        isLoading = true;
        error = null;
        try {
            const options = {};
            if (rubricId) options.rubric_id = rubricId;
            if (showDeleted) options.trashed = 'WITH';
            
            categories = await getCategories(options);
        } catch (e) {
            error = e.message;
            console.error('Failed to load categories:', e);
        } finally {
            isLoading = false;
        }
    }

    // React to rubric changes
    $effect(() => {
        categories = [];
        loadCategories();
    });

    function handleAdd() {
        editingCategory = null;
        showModal = true;
    }

    function handleEdit(category) {
        editingCategory = category;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
        
        try {
            await deleteCategory(id);
            await loadCategories();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(category) {
        try {
            await updateCategory(category.id, { is_active: !category.is_active });
            await loadCategories();
        } catch (e) {
            alert('Ошибка при обновлении: ' + e.message);
        }
    }

    async function handleSave(data) {
        try {
            // Inject rubric_id
            const payload = { ...data };
            if (rubricId) {
                payload.rubric_id = rubricId;
            }
            
            if (editingCategory) {
                await updateCategory(editingCategory.id, payload);
            } else {
                await createCategory(payload);
            }
            showModal = false;
            await loadCategories();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingCategory = null;
    }
</script>

<div class="rounded-lg bg-white p-6 shadow">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 capitalize">{title}</h2>
        <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    bind:checked={showDeleted}
                    onchange={loadCategories}
                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Показать удалённые
            </label>
            <button
                onclick={handleAdd}
                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Добавить
            </button>
        </div>
    </div>

    <!-- Error -->
    {#if error}
        <div class="mb-4 rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
        </div>
    {/if}

    <!-- Loading -->
    {#if isLoading}
        <div class="py-12 text-center text-gray-500">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p class="mt-2">Загрузка данных...</p>
        </div>
    {:else if categories.length === 0}
        <div class="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p class="mt-2">Нет категорий</p>
            <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                Добавить первую категорию
            </button>
        </div>
    {:else}
        <!-- Table -->
        <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фон</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each categories as category (category.id)}
                        <tr class:opacity-50={category.deleted_at} class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{category.value}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{category.slug}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-500 max-w-xs truncate">{category.description || '—'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#if category.bg}
                                    <div 
                                        class="w-8 h-8 rounded border border-gray-200 shadow-sm" 
                                        style="background: {category.bg}"
                                        title={category.bg}
                                    ></div>
                                {:else}
                                    <span class="text-sm text-gray-400">—</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-500">{category.sort_order}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                {#if category.deleted_at}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Удалён
                                    </span>
                                {:else}
                                    <button
                                        onclick={() => handleToggleActive(category)}
                                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {category.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                        role="switch"
                                        aria-checked={category.is_active}
                                        aria-label="Переключить статус активности"
                                    >
                                        <span 
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {category.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                        ></span>
                                    </button>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if !category.deleted_at}
                                    <button
                                        onclick={() => handleEdit(category)}
                                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        onclick={() => handleDelete(category.id)}
                                        class="text-red-600 hover:text-red-900"
                                    >
                                        Удалить
                                    </button>
                                {:else}
                                    <span class="text-gray-400 text-xs">Удалён {new Date(category.deleted_at).toLocaleDateString('ru')}</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<!-- Modal -->
{#if showModal}
    <CategoryModal 
        category={editingCategory}
        rubricId={rubricId}
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
