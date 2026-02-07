<script>
    import { createShopCategory, updateShopCategory, deleteShopCategory,
             createShopBrand, updateShopBrand, deleteShopBrand,
             createShopCity, updateShopCity, deleteShopCity } from '$lib/api/graphql.js';

    let { shop = null, rubricId = null, onSave, onCancel } = $props();

    // Form state
    let value = $state(shop?.value || '');
    let slug = $state(shop?.slug || '');
    let description = $state(shop?.description || '');
    let logo = $state(shop?.logo || '');
    let website = $state(shop?.website || '');
    let phone = $state(shop?.phone || '');
    let email = $state(shop?.email || '');
    let isActive = $state(shop?.is_active ?? true);
    let sortOrder = $state(shop?.sort_order ?? 0);

    // Related items
    let categories = $state(shop?.categories || []);
    let brands = $state(shop?.brands || []);
    let cities = $state(shop?.cities || []);

    // New item inputs
    let newCategoryValue = $state('');
    let newBrandValue = $state('');
    let newBrandLogo = $state('');
    let newCityName = $state('');

    // Active tab
    let activeTab = $state('basic');

    let isSaving = $state(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (!value.trim()) {
            alert('Введите название магазина');
            return;
        }
        
        isSaving = true;
        
        onSave({
            value: value.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            logo: logo.trim() || undefined,
            website: website.trim() || undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            is_active: isActive,
            sort_order: parseInt(sortOrder) || 0
        });
    }

    // Category management
    async function addCategory() {
        if (!newCategoryValue.trim()) return;
        if (!shop?.id) {
            categories = [...categories, { id: crypto.randomUUID(), value: newCategoryValue.trim(), is_active: true, sort_order: categories.length }];
            newCategoryValue = '';
            return;
        }
        try {
            const created = await createShopCategory({ shop_id: shop.id, value: newCategoryValue.trim(), is_active: true, sort_order: categories.length });
            categories = [...categories, created];
            newCategoryValue = '';
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    async function removeCategory(id) {
        if (!shop?.id) {
            categories = categories.filter(c => c.id !== id);
            return;
        }
        try {
            await deleteShopCategory(id);
            categories = categories.filter(c => c.id !== id);
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    // Brand management
    async function addBrand() {
        if (!newBrandValue.trim()) return;
        if (!shop?.id) {
            brands = [...brands, { id: crypto.randomUUID(), value: newBrandValue.trim(), logo: newBrandLogo.trim() || null, is_active: true, sort_order: brands.length }];
            newBrandValue = '';
            newBrandLogo = '';
            return;
        }
        try {
            const created = await createShopBrand({ shop_id: shop.id, value: newBrandValue.trim(), logo: newBrandLogo.trim() || undefined, is_active: true, sort_order: brands.length });
            brands = [...brands, created];
            newBrandValue = '';
            newBrandLogo = '';
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    async function removeBrand(id) {
        if (!shop?.id) {
            brands = brands.filter(b => b.id !== id);
            return;
        }
        try {
            await deleteShopBrand(id);
            brands = brands.filter(b => b.id !== id);
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    // City management
    async function addCity() {
        if (!newCityName.trim()) return;
        if (!shop?.id) {
            cities = [...cities, { id: crypto.randomUUID(), city_name: newCityName.trim(), is_active: true, sort_order: cities.length }];
            newCityName = '';
            return;
        }
        try {
            const created = await createShopCity({ shop_id: shop.id, city_name: newCityName.trim(), is_active: true, sort_order: cities.length });
            cities = [...cities, created];
            newCityName = '';
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    async function removeCity(id) {
        if (!shop?.id) {
            cities = cities.filter(c => c.id !== id);
            return;
        }
        try {
            await deleteShopCity(id);
            cities = cities.filter(c => c.id !== id);
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/50 z-40" onclick={onCancel}></div>

<!-- Modal -->
<div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4">
        <div class="w-full max-w-2xl rounded-lg bg-white shadow-xl" onclick={(e) => e.stopPropagation()}>
            <!-- Header -->
            <div class="flex items-center justify-between border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">
                    {shop ? 'Редактирование магазина' : 'Новый магазин'}
                </h3>
                <button 
                    onclick={onCancel}
                    class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Закрыть"
                >
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Tabs -->
            <div class="border-b px-6">
                <nav class="flex gap-4">
                    <button 
                        type="button"
                        onclick={() => activeTab = 'basic'}
                        class="py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                    >
                        Основные данные
                    </button>
                    {#if shop}
                        <button 
                            type="button"
                            onclick={() => activeTab = 'categories'}
                            class="py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                        >
                            Категории ({categories.length})
                        </button>
                        <button 
                            type="button"
                            onclick={() => activeTab = 'brands'}
                            class="py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'brands' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                        >
                            Бренды ({brands.length})
                        </button>
                        <button 
                            type="button"
                            onclick={() => activeTab = 'cities'}
                            class="py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'cities' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                        >
                            Города ({cities.length})
                        </button>
                    {/if}
                </nav>
            </div>

            <form onsubmit={handleSubmit}>
                <div class="max-h-[60vh] overflow-y-auto px-6 py-4">
                    
                    {#if activeTab === 'basic'}
                        <!-- Basic info tab -->
                        <div class="space-y-4">
                            <div>
                                <label for="value" class="block text-sm font-medium text-gray-700">Название *</label>
                                <input 
                                    type="text" 
                                    id="value"
                                    bind:value={value}
                                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Название магазина"
                                    required
                                />
                            </div>

                            <div>
                                <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
                                <input 
                                    type="text" 
                                    id="slug"
                                    bind:value={slug}
                                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                    placeholder="nazvanie-magazina"
                                />
                                <p class="mt-1 text-xs text-gray-500">Генерируется автоматически, если не указывать</p>
                            </div>

                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700">Описание</label>
                                <textarea 
                                    id="description"
                                    bind:value={description}
                                    rows="3"
                                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Описание магазина..."
                                ></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="logo" class="block text-sm font-medium text-gray-700">Логотип (URL)</label>
                                    <input 
                                        type="url" 
                                        id="logo"
                                        bind:value={logo}
                                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div>
                                    <label for="website" class="block text-sm font-medium text-gray-700">Сайт</label>
                                    <input 
                                        type="url" 
                                        id="website"
                                        bind:value={website}
                                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
                                    <input 
                                        type="tel" 
                                        id="phone"
                                        bind:value={phone}
                                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="+7 (999) 123-45-67"
                                    />
                                </div>
                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        bind:value={email}
                                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="info@example.com"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="sortOrder" class="block text-sm font-medium text-gray-700">Порядок сортировки</label>
                                    <input 
                                        type="number" 
                                        id="sortOrder"
                                        bind:value={sortOrder}
                                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div class="flex items-center pt-6">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={isActive}
                                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span class="text-sm text-gray-700">Активен</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                    {:else if activeTab === 'categories'}
                        <!-- Categories tab -->
                        <div class="space-y-4">
                            <div class="flex gap-2">
                                <input 
                                    type="text" 
                                    bind:value={newCategoryValue}
                                    class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Название категории"
                                />
                                <button 
                                    type="button"
                                    onclick={addCategory}
                                    class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Добавить
                                </button>
                            </div>
                            <div class="divide-y rounded-lg border">
                                {#each categories as cat (cat.id)}
                                    <div class="flex items-center justify-between px-4 py-3">
                                        <span class="text-sm text-gray-900">{cat.value}</span>
                                        <button 
                                            type="button"
                                            onclick={() => removeCategory(cat.id)}
                                            class="text-red-600 hover:text-red-800"
                                            aria-label="Удалить категорию"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                {:else}
                                    <div class="px-4 py-8 text-center text-gray-500 text-sm">Нет категорий</div>
                                {/each}
                            </div>
                        </div>

                    {:else if activeTab === 'brands'}
                        <!-- Brands tab -->
                        <div class="space-y-4">
                            <div class="flex gap-2">
                                <input 
                                    type="text" 
                                    bind:value={newBrandValue}
                                    class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Название бренда"
                                />
                                <input 
                                    type="url" 
                                    bind:value={newBrandLogo}
                                    class="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="URL логотипа"
                                />
                                <button 
                                    type="button"
                                    onclick={addBrand}
                                    class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Добавить
                                </button>
                            </div>
                            <div class="divide-y rounded-lg border">
                                {#each brands as brand (brand.id)}
                                    <div class="flex items-center justify-between px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            {#if brand.logo}
                                                <img src={brand.logo} alt={brand.value} class="h-6 w-6 object-contain" />
                                            {/if}
                                            <span class="text-sm text-gray-900">{brand.value}</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onclick={() => removeBrand(brand.id)}
                                            class="text-red-600 hover:text-red-800"
                                            aria-label="Удалить бренд"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                {:else}
                                    <div class="px-4 py-8 text-center text-gray-500 text-sm">Нет брендов</div>
                                {/each}
                            </div>
                        </div>

                    {:else if activeTab === 'cities'}
                        <!-- Cities tab -->
                        <div class="space-y-4">
                            <div class="flex gap-2">
                                <input 
                                    type="text" 
                                    bind:value={newCityName}
                                    class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Название города"
                                />
                                <button 
                                    type="button"
                                    onclick={addCity}
                                    class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Добавить
                                </button>
                            </div>
                            <div class="divide-y rounded-lg border">
                                {#each cities as city (city.id)}
                                    <div class="flex items-center justify-between px-4 py-3">
                                        <span class="text-sm text-gray-900">{city.city_name}</span>
                                        <button 
                                            type="button"
                                            onclick={() => removeCity(city.id)}
                                            class="text-red-600 hover:text-red-800"
                                            aria-label="Удалить город"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                {:else}
                                    <div class="px-4 py-8 text-center text-gray-500 text-sm">Нет городов</div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-3 border-t px-6 py-4">
                    <button 
                        type="button" 
                        onclick={onCancel}
                        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Отмена
                    </button>
                    <button 
                        type="submit"
                        disabled={isSaving}
                        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Сохранение...' : (shop ? 'Сохранить' : 'Создать')}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
