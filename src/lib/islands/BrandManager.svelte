<script>
    import { getBrands, createBrand, updateBrand, deleteBrand } from '$lib/api/graphql.js';
    import BrandModal from './BrandModal.svelte';

    let { rubricId = null, rubricSlug = '', title = 'Управление брендами' } = $props();

    // State
    let brands = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let showModal = $state(false);
    let editingBrand = $state(null);
    let showDeleted = $state(false);

    // Load data
    async function loadBrands() {
        isLoading = true;
        error = null;
        try {
            const options = {};
            if (rubricId) options.rubric_id = rubricId;
            if (showDeleted) options.trashed = 'WITH';
            
            brands = await getBrands(options);
        } catch (e) {
            error = e.message;
            console.error('Failed to load brands:', e);
        } finally {
            isLoading = false;
        }
    }

    // React to rubric changes
    $effect(() => {
        brands = [];
        loadBrands();
    });

    function handleAdd() {
        editingBrand = null;
        showModal = true;
    }

    function handleEdit(brand) {
        editingBrand = brand;
        showModal = true;
    }

    async function handleDelete(id) {
        if (!confirm('Вы уверены, что хотите удалить этот бренд?')) return;
        
        try {
            await deleteBrand(id);
            await loadBrands();
        } catch (e) {
            alert('Ошибка при удалении: ' + e.message);
        }
    }

    async function handleToggleActive(brand) {
        try {
            await updateBrand(brand.id, { is_active: !brand.is_active });
            await loadBrands();
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
            
            if (editingBrand) {
                await updateBrand(editingBrand.id, payload);
            } else {
                await createBrand(payload);
            }
            showModal = false;
            await loadBrands();
        } catch (e) {
            alert('Ошибка при сохранении: ' + e.message);
        }
    }

    function handleCancel() {
        showModal = false;
        editingBrand = null;
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
                    onchange={loadBrands}
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
                Добавить бренд
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
    {:else if brands.length === 0}
        <div class="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p class="mt-2">Нет брендов</p>
            <button onclick={handleAdd} class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                Добавить первый бренд
            </button>
        </div>
    {:else}
        <!-- Table -->
        <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Бренд</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Страна</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сайт</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each brands as brand (brand.id)}
                        <tr class:opacity-50={brand.deleted_at} class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    {#if brand.logo}
                                        <img 
                                            src={brand.logo} 
                                            alt={brand.value}
                                            class="w-10 h-10 object-contain rounded border border-gray-200 bg-white p-1"
                                        />
                                    {:else}
                                        <div class="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                    {/if}
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">{brand.value}</div>
                                        {#if brand.description}
                                            <div class="text-xs text-gray-500 max-w-xs truncate">{brand.description}</div>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{brand.slug}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-600">{brand.country || '—'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#if brand.website}
                                    <a 
                                        href={brand.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                        </svg>
                                        Перейти
                                    </a>
                                {:else}
                                    <span class="text-sm text-gray-400">—</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-500">{brand.sort_order}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                {#if brand.deleted_at}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Удалён
                                    </span>
                                {:else}
                                    <button
                                        onclick={() => handleToggleActive(brand)}
                                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {brand.is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                        role="switch"
                                        aria-checked={brand.is_active}
                                        aria-label="Переключить статус активности"
                                    >
                                        <span 
                                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {brand.is_active ? 'translate-x-5' : 'translate-x-0'}"
                                        ></span>
                                    </button>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if !brand.deleted_at}
                                    <button
                                        onclick={() => handleEdit(brand)}
                                        class="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        onclick={() => handleDelete(brand.id)}
                                        class="text-red-600 hover:text-red-900"
                                    >
                                        Удалить
                                    </button>
                                {:else}
                                    <span class="text-gray-400 text-xs">Удалён {new Date(brand.deleted_at).toLocaleDateString('ru')}</span>
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
    <BrandModal 
        brand={editingBrand}
        rubricId={rubricId}
        onSave={handleSave} 
        onCancel={handleCancel} 
    />
{/if}
