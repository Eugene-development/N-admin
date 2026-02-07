<script>
    import { onMount } from 'svelte';
    import { getRubrics } from '$lib/api/graphql.js';

    let { category = null, rubricId = null, onSave, onCancel } = $props();

    // Form state
    let value = $state(category?.value || '');
    let slug = $state(category?.slug || '');
    let description = $state(category?.description || '');
    let bg = $state(category?.bg || '');
    let is_active = $state(category?.is_active ?? true);
    let sort_order = $state(category?.sort_order ?? 0);
    let rubric_id = $state(category?.rubric_id || rubricId || '');
    let isSubmitting = $state(false);

    // Rubrics list
    let rubrics = $state([]);
    let rubricsLoading = $state(true);

    onMount(async () => {
        try {
            rubrics = await getRubrics({ is_active: true });
        } catch (e) {
            console.error('Failed to load rubrics:', e);
        } finally {
            rubricsLoading = false;
        }
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (isSubmitting) return;

        isSubmitting = true;
        
        const data = {
            value: value.trim(),
            description: description.trim() || null,
            bg: bg.trim() || null,
            is_active,
            sort_order: parseInt(sort_order) || 0,
        };

        // Include rubric_id if set
        if (rubric_id) {
            data.rubric_id = rubric_id;
        }

        // Only include slug if manually set
        if (slug.trim()) {
            data.slug = slug.trim();
        }

        onSave(data);
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
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <!-- Modal -->
    <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between mb-6">
            <h3 id="modal-title" class="text-xl font-bold text-gray-900">
                {category ? 'Редактировать категорию' : 'Новая категория'}
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
                    placeholder="Название категории"
                />
            </div>

            <!-- Rubric Selection -->
            <div>
                <label for="rubric" class="block text-sm font-medium text-gray-700 mb-1.5">
                    Рубрика <span class="text-red-500">*</span>
                </label>
                {#if rubricsLoading}
                    <div class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-400 bg-gray-50">
                        Загрузка рубрик...
                    </div>
                {:else}
                    <select
                        id="rubric"
                        bind:value={rubric_id}
                        required
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors bg-white"
                    >
                        <option value="">Выберите рубрику</option>
                        {#each rubrics as rubricItem}
                            <option value={rubricItem.id}>{rubricItem.value}</option>
                        {/each}
                    </select>
                {/if}
                <p class="mt-1 text-xs text-gray-500">К какой рубрике относится эта категория</p>
            </div>

            <!-- Slug -->
            <div>
                <label for="slug" class="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug (URL)
                </label>
                <input
                    type="text"
                    id="slug"
                    bind:value={slug}
                    class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                    placeholder="url-slug (генерируется автоматически)"
                />
                <p class="mt-1 text-xs text-gray-500">Оставьте пустым для автогенерации из названия</p>
            </div>

            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1.5">
                    Описание
                </label>
                <textarea
                    id="description"
                    bind:value={description}
                    rows="3"
                    class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors resize-none"
                    placeholder="Описание категории..."
                ></textarea>
            </div>

            <!-- Background -->
            <div>
                <label for="bg" class="block text-sm font-medium text-gray-700 mb-1.5">
                    Фон (цвет или URL изображения)
                </label>
                <div class="flex gap-3">
                    <input
                        type="text"
                        id="bg"
                        bind:value={bg}
                        class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                        placeholder="#ff5500 или url(...)"
                    />
                    {#if bg}
                        <div 
                            class="w-10 h-10 rounded-lg border border-gray-200 shadow-sm flex-shrink-0" 
                            style="background: {bg}"
                        ></div>
                    {/if}
                </div>
            </div>

            <!-- Sort Order & Active -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-1.5">
                        Порядок сортировки
                    </label>
                    <input
                        type="number"
                        id="sort_order"
                        bind:value={sort_order}
                        min="0"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                    />
                </div>

                <div class="flex items-center">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={is_active}
                            class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="text-sm font-medium text-gray-700">Активна</span>
                    </label>
                </div>
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
                    disabled={isSubmitting || !value.trim()}
                    class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {#if isSubmitting}
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {/if}
                    {category ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    </div>
</div>
