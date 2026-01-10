<script>
    import { getMebelProjects, createMebelProject, updateMebelProject, deleteMebelProject } from '$lib/api/graphql.js';
    import MebelProjectModal from './MebelProjectModal.svelte';

    let { categoryId = null, title = 'Управление товарами' } = $props();

    // State
    let projects = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingProject = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadProjects() {
        isLoading = true;
        error = null;
        try {
            const options = {};
            if (categoryId) options.category_id = categoryId;
            if (showDeleted) options.trashed = 'WITH';
            
            projects = await getMebelProjects(options);
        } catch (e) {
            error = e.message;
            console.error('Failed to load projects:', e);
        } finally {
            isLoading = false;
        }
    }

    // React to category changes
    $effect(() => {
        projects = [];
        loadProjects();
    });

    function handleAdd() {
        editingProject = null;
        showModal = true;
    }

    function handleEdit(project) {
        editingProject = project;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
        
        try {
            await deleteMebelProject(id);
            await loadProjects();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(project) {
        try {
            await updateMebelProject(project.id, { is_active: !project.is_active });
            await loadProjects();
        } catch (e) {
            alert('Ошибка при обновлении: ' + e.message);
        }
    }

    async function handleToggleFeatured(project) {
        try {
            await updateMebelProject(project.id, { is_featured: !project.is_featured });
            await loadProjects();
        } catch (e) {
            alert('Ошибка при обновлении: ' + e.message);
        }
    }

    async function handleSave(data) {
        try {
            // Inject category_id if set
            const payload = { ...data };
            if (categoryId) {
                payload.category_id = categoryId;
            }
            
            if (editingProject) {
                await updateMebelProject(editingProject.id, payload);
            } else {
                await createMebelProject(payload);
            }
            showModal = false;
            await loadProjects();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingProject = null;
    }

    function formatPrice(price) {
        if (!price) return '—';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }
</script>

<div class="rounded-lg bg-white p-6 shadow">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{title}</h2>
        <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    bind:checked={showDeleted}
                    onchange={loadProjects}
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
                Добавить товар
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
    {:else if projects.length === 0}
        <div class="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p class="mt-2">Нет товаров</p>
            <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                Добавить первый товар
            </button>
        </div>
    {:else}
        <!-- Table -->
        <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Метки</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each projects as project (project.id)}
                        <tr class:opacity-50={project.deleted_at} class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{project.value}</div>
                                <div class="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-0.5">{project.slug}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#if project.category}
                                    <div class="text-sm text-gray-900">{project.category.value}</div>
                                    {#if project.category.rubric}
                                        <div class="text-xs text-gray-500">{project.category.rubric.value}</div>
                                    {/if}
                                {:else}
                                    <span class="text-sm text-gray-400">—</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{formatPrice(project.price)}</div>
                                {#if project.old_price}
                                    <div class="text-xs text-gray-400 line-through">{formatPrice(project.old_price)}</div>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <div class="flex gap-1 justify-center">
                                    {#if project.is_featured}
                                        <button 
                                            onclick={() => handleToggleFeatured(project)}
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                            title="Убрать из избранного"
                                        >
                                            ⭐ Избранное
                                        </button>
                                    {:else}
                                        <button 
                                            onclick={() => handleToggleFeatured(project)}
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                                            title="Добавить в избранное"
                                        >
                                            ☆
                                        </button>
                                    {/if}
                                    {#if project.is_new}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Новинка
                                        </span>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-500">{project.sort_order}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                {#if project.deleted_at}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Удалён
                                    </span>
                                {:else}
                                    <button
                                        onclick={() => handleToggleActive(project)}
                                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {project.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                        role="switch"
                                        aria-checked={project.is_active}
                                        aria-label="Переключить статус активности"
                                    >
                                        <span 
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {project.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                        ></span>
                                    </button>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if !project.deleted_at}
                                    <button
                                        onclick={() => handleEdit(project)}
                                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        onclick={() => handleDelete(project.id)}
                                        class="text-red-600 hover:text-red-900"
                                    >
                                        Удалить
                                    </button>
                                {:else}
                                    <span class="text-gray-400 text-xs">Удалён {new Date(project.deleted_at).toLocaleDateString('ru')}</span>
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
    <MebelProjectModal 
        project={editingProject}
        categoryId={categoryId}
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
