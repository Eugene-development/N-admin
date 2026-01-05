<script>
    import { logout, getAuthState } from '$lib/stores/auth.svelte.js';
    import { goto } from '$app/navigation';
    import { getMebels, createMebel, updateMebel, deleteMebel } from '$lib/api/graphql.js';
    import MebelModal from './MebelModal.svelte';

    const auth = getAuthState();

    // State
    let mebels = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingMebel = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadMebels() {
        isLoading = true;
        error = null;
        try {
            mebels = await getMebels(showDeleted ? { trashed: 'WITH' } : {});
        } catch (e) {
            error = e.message;
            console.error('Failed to load mebels:', e);
        } finally {
            isLoading = false;
        }
    }

    // Initial load
    $effect(() => {
        loadMebels();
    });

    // Handlers
    async function handleLogout() {
        await logout();
        goto('/login');
    }

    function handleAdd() {
        editingMebel = null;
        showModal = true;
    }

    function handleEdit(mebel) {
        editingMebel = mebel;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
        
        try {
            await deleteMebel(id);
            await loadMebels();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(mebel) {
        try {
            await updateMebel(mebel.id, { is_active: !mebel.is_active });
            await loadMebels();
        } catch (e) {
            alert('Ошибка при обновлении: ' + e.message);
        }
    }

    async function handleSave(data) {
        try {
            if (editingMebel) {
                await updateMebel(editingMebel.id, data);
            } else {
                await createMebel(data);
            }
            showModal = false;
            await loadMebels();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingMebel = null;
    }
</script>

<div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 justify-between items-center">
                <div class="flex items-center gap-6">
                    <h1 class="text-xl font-semibold text-gray-900">Админ-панель</h1>
                    <div class="flex gap-4">
                        <a href="/dashboard" class="text-gray-600 hover:text-gray-900 transition-colors">Дашборд</a>
                        <a href="/mebel" class="text-indigo-600 font-medium">Мебель</a>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    {#if auth.user}
                        <span class="text-sm text-gray-600">
                            {auth.user.name}
                        </span>
                    {/if}
                    <button
                        onclick={handleLogout}
                        class="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="rounded-lg bg-white p-6 shadow">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Управление мебелью</h2>
                <div class="flex gap-3">
                    <label class="flex items-center gap-2 text-sm text-gray-600">
                        <input 
                            type="checkbox" 
                            bind:checked={showDeleted}
                            onchange={loadMebels}
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Показать удалённые
                    </label>
                    <button
                        onclick={handleAdd}
                        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
                <div class="mb-4 rounded-md bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            {/if}

            <!-- Loading -->
            {#if isLoading}
                <div class="py-12 text-center text-gray-500">
                    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p class="mt-2">Загрузка данных...</p>
                </div>
            {:else if mebels.length === 0}
                <div class="py-12 text-center text-gray-500">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <p class="mt-2">Нет данных</p>
                    <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800">
                        Добавить первую запись
                    </button>
                </div>
            {:else}
                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Значение</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фон</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each mebels as mebel (mebel.id)}
                                <tr class:opacity-50={mebel.deleted_at}>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">{mebel.value}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-500 font-mono">{mebel.slug}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-sm text-gray-500 max-w-xs truncate">{mebel.description || '—'}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {#if mebel.bg}
                                            <div 
                                                class="w-8 h-8 rounded border border-gray-200" 
                                                style="background: {mebel.bg}"
                                                title={mebel.bg}
                                            ></div>
                                        {:else}
                                            <span class="text-sm text-gray-400">—</span>
                                        {/if}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        <span class="text-sm text-gray-500">{mebel.sort_order}</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        {#if mebel.deleted_at}
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Удалён
                                            </span>
                                        {:else}
                                            <button
                                                onclick={() => handleToggleActive(mebel)}
                                                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {mebel.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                                role="switch"
                                                aria-checked={mebel.is_active}
                                                aria-label="Переключить статус активности для {mebel.value}"
                                            >
                                                <span 
                                                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {mebel.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                                ></span>
                                            </button>
                                        {/if}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {#if !mebel.deleted_at}
                                            <button
                                                onclick={() => handleEdit(mebel)}
                                                class="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onclick={() => handleDelete(mebel.id)}
                                                class="text-red-600 hover:text-red-900"
                                            >
                                                Удалить
                                            </button>
                                        {:else}
                                            <span class="text-gray-400 text-xs">Удалён {new Date(mebel.deleted_at).toLocaleDateString('ru')}</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </main>
</div>

<!-- Modal -->
{#if showModal}
    <MebelModal 
        mebel={editingMebel} 
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
