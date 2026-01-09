<script>
    import { getRubrics, createRubric, updateRubric, deleteRubric } from '$lib/api/graphql.js';
    import RubricModal from './RubricModal.svelte';

    // State
    let rubrics = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingRubric = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadRubrics() {
        isLoading = true;
        error = null;
        try {
            const options = {};
            if (showDeleted) options.trashed = 'WITH';
            
            rubrics = await getRubrics(options);
        } catch (e) {
            error = e.message;
            console.error('Failed to load rubrics:', e);
        } finally {
            isLoading = false;
        }
    }

    // Initial load
    $effect(() => {
        loadRubrics();
    });

    function handleAdd() {
        editingRubric = null;
        showModal = true;
    }

    function handleEdit(rubric) {
        editingRubric = rubric;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить эту рубрику?')) return;
        
        try {
            await deleteRubric(id);
            await loadRubrics();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(rubric) {
        try {
            await updateRubric(rubric.id, { is_active: !rubric.is_active });
            await loadRubrics();
        } catch (e) {
            alert('Ошибка при обновлении: ' + e.message);
        }
    }

    async function handleSave(data) {
        try {
            if (editingRubric) {
                await updateRubric(editingRubric.id, data);
            } else {
                await createRubric(data);
            }
            showModal = false;
            await loadRubrics();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingRubric = null;
    }
</script>

<div class="rounded-lg bg-white p-6 shadow">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Управление рубриками</h2>
        <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    bind:checked={showDeleted}
                    onchange={loadRubrics}
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
                Добавить рубрику
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
    {:else if rubrics.length === 0}
        <div class="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p class="mt-2">Нет рубрик</p>
            <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                Добавить первую рубрику
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each rubrics as rubric (rubric.id)}
                        <tr class:opacity-50={rubric.deleted_at} class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{rubric.value}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{rubric.slug}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded w-fit truncate max-w-[120px]" title={rubric.key}>
                                    {rubric.key}
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-500 max-w-xs truncate">{rubric.description || '—'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-500">{rubric.sort_order}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                {#if rubric.deleted_at}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Удалён
                                    </span>
                                {:else}
                                    <button
                                        onclick={() => handleToggleActive(rubric)}
                                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {rubric.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                        role="switch"
                                        aria-checked={rubric.is_active}
                                        aria-label="Переключить статус активности"
                                    >
                                        <span 
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {rubric.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                        ></span>
                                    </button>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if !rubric.deleted_at}
                                    <button
                                        onclick={() => handleEdit(rubric)}
                                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        onclick={() => handleDelete(rubric.id)}
                                        class="text-red-600 hover:text-red-900"
                                    >
                                        Удалить
                                    </button>
                                {:else}
                                    <span class="text-gray-400 text-xs">Удалён {new Date(rubric.deleted_at).toLocaleDateString('ru')}</span>
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
    <RubricModal 
        rubric={editingRubric} 
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
