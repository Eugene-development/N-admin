<script>
    import { getShops, createShop, updateShop, deleteShop } from '$lib/api/graphql.js';
    import ShopModal from './ShopModal.svelte';

    let { rubricId = null, rubricSlug = '', title = 'Управление магазинами' } = $props();

    // State
    let shops = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingShop = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadShops() {
        isLoading = true;
        error = null;
        try {
            const options = {};
            if (rubricId) options.rubric_id = rubricId;
            if (showDeleted) options.trashed = 'WITH';
            
            shops = await getShops(options);
        } catch (e) {
            error = e.message;
            console.error('Failed to load shops:', e);
        } finally {
            isLoading = false;
        }
    }

    // React to rubric changes
    $effect(() => {
        shops = [];
        loadShops();
    });

    function handleAdd() {
        editingShop = null;
        showModal = true;
    }

    function handleEdit(shop) {
        editingShop = shop;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить этот магазин?')) return;
        
        try {
            await deleteShop(id);
            await loadShops();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(shop) {
        try {
            await updateShop(shop.id, { is_active: !shop.is_active });
            await loadShops();
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
            
            if (editingShop) {
                await updateShop(editingShop.id, payload);
            } else {
                await createShop(payload);
            }
            showModal = false;
            await loadShops();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingShop = null;
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
                    onchange={loadShops}
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
                Добавить магазин
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
    {:else if shops.length === 0}
        <div class="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p class="mt-2">Нет магазинов</p>
            <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                Добавить первый магазин
            </button>
        </div>
    {:else}
        <!-- Table -->
        <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Магазин</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категории/Бренды/Города</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each shops as shop (shop.id)}
                        <tr class:opacity-50={shop.deleted_at} class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    {#if shop.logo}
                                        <img 
                                            src={shop.logo} 
                                            alt={shop.value}
                                            class="w-10 h-10 object-contain rounded border border-gray-200 bg-white p-1"
                                        />
                                    {:else}
                                        <div class="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                            </svg>
                                        </div>
                                    {/if}
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">{shop.value}</div>
                                        {#if shop.description}
                                            <div class="text-xs text-gray-500 max-w-xs truncate">{shop.description}</div>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{shop.slug}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-600 space-y-1">
                                    {#if shop.website}
                                        <a 
                                            href={shop.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                            </svg>
                                            Сайт
                                        </a>
                                    {/if}
                                    {#if shop.phone}
                                        <div class="text-xs">{shop.phone}</div>
                                    {/if}
                                    {#if shop.email}
                                        <div class="text-xs text-gray-400">{shop.email}</div>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-wrap gap-1 max-w-xs">
                                    {#if shop.categories && shop.categories.length > 0}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {shop.categories.length} кат.
                                        </span>
                                    {/if}
                                    {#if shop.brands && shop.brands.length > 0}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                            {shop.brands.length} бр.
                                        </span>
                                    {/if}
                                    {#if shop.cities && shop.cities.length > 0}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                            {shop.cities.length} гор.
                                        </span>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-500">{shop.sort_order}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                {#if shop.deleted_at}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Удалён
                                    </span>
                                {:else}
                                    <button
                                        onclick={() => handleToggleActive(shop)}
                                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {shop.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                        role="switch"
                                        aria-checked={shop.is_active}
                                        aria-label="Переключить статус активности"
                                    >
                                        <span 
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {shop.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                        ></span>
                                    </button>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if !shop.deleted_at}
                                    <button
                                        onclick={() => handleEdit(shop)}
                                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        onclick={() => handleDelete(shop.id)}
                                        class="text-red-600 hover:text-red-900"
                                    >
                                        Удалить
                                    </button>
                                {:else}
                                    <span class="text-gray-400 text-xs">Удалён {new Date(shop.deleted_at).toLocaleDateString('ru')}</span>
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
    <ShopModal 
        shop={editingShop}
        rubricId={rubricId}
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
