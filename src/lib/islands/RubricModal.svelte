<script>
    let { rubric = null, onSave, onCancel } = $props();

    // Form state
    let value = $state('');
    let slug = $state('');
    let description = $state('');
    let is_active = $state(true);
    let sort_order = $state(0);
    let isSubmitting = $state(false);

    // Sync form state when rubric prop changes
    $effect(() => {
        value = rubric?.value || '';
        slug = rubric?.slug || '';
        description = rubric?.description || '';
        is_active = rubric?.is_active ?? true;
        sort_order = rubric?.sort_order ?? 0;
        isSubmitting = false;
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (isSubmitting) return;

        isSubmitting = true;
        
        const data = {
            value: value.trim(),
            description: description.trim() || null,
            is_active,
            sort_order: parseInt(sort_order) || 0,
        };

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
                {rubric ? 'Редактировать рубрику' : 'Новая рубрика'}
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
                    placeholder="Например: Мебель"
                />
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
                    placeholder="mebel (генерируется автоматически)"
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
                    placeholder="Краткое описание рубрики..."
                ></textarea>
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
                    {rubric ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    </div>
</div>
