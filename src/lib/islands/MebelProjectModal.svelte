<script>
    import { onMount } from 'svelte';
    import { ulid } from 'ulid';
    import { getCategories } from '$lib/api/graphql.js';
    import { getImages } from '$lib/api/images.js';
    import ImageUploader from '$lib/components/ImageUploader.svelte';

    let { project = null, categoryId = null, onSave, onCancel } = $props();

    // Генерируем ULID для нового товара заранее (или используем существующий ID)
    // Это позволяет загружать изображения сразу, до сохранения товара
    const pendingProjectId = project?.id || ulid();

    // Form state
    let value = $state(project?.value || '');
    let slug = $state(project?.slug || '');
    let description = $state(project?.description || '');
    let short_description = $state(project?.short_description || '');
    let price = $state(project?.price || '');
    let old_price = $state(project?.old_price || '');
    let is_active = $state(project?.is_active ?? true);
    let is_featured = $state(project?.is_featured ?? false);
    let is_new = $state(project?.is_new ?? false);
    let sort_order = $state(project?.sort_order ?? 0);
    let category_id = $state(project?.category_id || categoryId || '');
    let isSubmitting = $state(false);

    // Categories list
    let categories = $state([]);
    let categoriesLoading = $state(true);

    // Images state
    let images = $state(project?.images || []);
    let imagesLoading = $state(false);

    onMount(async () => {
        try {
            categories = await getCategories({ is_active: true });
        } catch (e) {
            console.error('Failed to load categories:', e);
        } finally {
            categoriesLoading = false;
        }

        // Load images if editing existing project
        if (project?.id) {
            imagesLoading = true;
            try {
                const result = await getImages('App\\Models\\MebelProject', project.id);
                images = result.images || [];
            } catch (e) {
                console.error('Failed to load images:', e);
            } finally {
                imagesLoading = false;
            }
        }
    });

    function handleImagesChange(newImages) {
        images = newImages;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (isSubmitting) return;

        isSubmitting = true;
        
        const data = {
            value: value.trim(),
            description: description.trim() || null,
            short_description: short_description.trim() || null,
            price: price ? parseFloat(price) : null,
            old_price: old_price ? parseFloat(old_price) : null,
            is_active,
            is_featured,
            is_new,
            sort_order: parseInt(sort_order) || 0,
        };

        // Include category_id if set
        if (category_id) {
            data.category_id = category_id;
        }

        // Only include slug if manually set
        if (slug.trim()) {
            data.slug = slug.trim();
        }

        // Передаём ID для нового товара (сгенерированный ULID)
        // Это позволяет создать товар с тем же ID, что использовался для загрузки изображений
        onSave(data, pendingProjectId);
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            onCancel();
        }
    }

    // Calculate discount percentage
    function getDiscountPercent() {
        if (old_price && price && parseFloat(old_price) > parseFloat(price)) {
            const discount = ((parseFloat(old_price) - parseFloat(price)) / parseFloat(old_price)) * 100;
            return Math.round(discount);
        }
        return 0;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div 
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
>
    <!-- Modal -->
    <div class="w-full max-w-5xl rounded-xl bg-white p-6 shadow-2xl mx-4 my-auto animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between mb-6">
            <h3 id="modal-title" class="text-xl font-bold text-gray-900">
                {project ? 'Редактировать товар' : 'Новый товар'}
            </h3>
            <button
                onclick={onCancel}
                class="rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Закрыть"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <form onsubmit={handleSubmit} class="space-y-5">
            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-5">
                    <!-- Value -->
                    <div>
                        <label for="value" class="block text-sm font-medium text-gray-700 mb-1.5">
                            Название <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="value"
                            bind:value
                            required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                            placeholder="Название товара"
                        />
                    </div>

                    <!-- Category Selection -->
                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-700 mb-1.5">
                            Категория <span class="text-red-500">*</span>
                        </label>
                        {#if categoriesLoading}
                            <div class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-400 bg-gray-50">
                                Загрузка категорий...
                            </div>
                        {:else}
                            <select
                                id="category"
                                bind:value={category_id}
                                required
                                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors bg-white"
                            >
                                <option value="">Выберите категорию</option>
                                {#each categories as cat}
                                    <option value={cat.id}>
                                        {cat.rubric?.value ? `${cat.rubric.value} → ` : ''}{cat.value}
                                    </option>
                                {/each}
                            </select>
                        {/if}
                    </div>

                    <!-- Price & Old Price -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="price" class="block text-sm font-medium text-gray-700 mb-1.5">
                                Цена (₽)
                            </label>
                            <input
                                type="number"
                                id="price"
                                bind:value={price}
                                min="0"
                                step="0.01"
                                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label for="old_price" class="block text-sm font-medium text-gray-700 mb-1.5">
                                Старая цена (₽)
                                {#if getDiscountPercent() > 0}
                                    <span class="ml-2 text-xs text-green-600 font-semibold">-{getDiscountPercent()}%</span>
                                {/if}
                            </label>
                            <input
                                type="number"
                                id="old_price"
                                bind:value={old_price}
                                min="0"
                                step="0.01"
                                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-5">
                    <!-- Short Description -->
                    <div>
                        <label for="short_description" class="block text-sm font-medium text-gray-700 mb-1.5">
                            Краткое описание
                        </label>
                        <input
                            type="text"
                            id="short_description"
                            bind:value={short_description}
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                            placeholder="Краткое описание для карточки"
                        />
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1.5">
                            Полное описание
                        </label>
                        <textarea
                            id="description"
                            bind:value={description}
                            rows="3"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors resize-none"
                            placeholder="Полное описание товара..."
                        ></textarea>
                    </div>

                    <!-- Flags -->
                    <div class="flex flex-wrap gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={is_active}
                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span class="text-sm text-gray-700">Активен</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={is_featured}
                                class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span class="text-sm text-gray-700">⭐ Избранное</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={is_new}
                                class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span class="text-sm text-gray-700">🆕 Новинка</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Images Section -->
            <div class="pt-4 border-t">
                {#if imagesLoading}
                    <div class="flex items-center gap-2 text-gray-500 text-sm">
                        <div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Загрузка изображений...
                    </div>
                {:else}
                    <ImageUploader 
                        {images}
                        parentableType="App\Models\MebelProject"
                        parentableId={pendingProjectId}
                        maxImages={8}
                        onImagesChange={handleImagesChange}
                    />
                {/if}
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onclick={onCancel}
                    class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !value.trim() || !category_id}
                    class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {#if isSubmitting}
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {/if}
                    {project ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    </div>
</div>
