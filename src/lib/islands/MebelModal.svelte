<script>
    let { mebel = null, onSave, onCancel } = $props();

    // Form state
    let value = $state(mebel?.value || '');
    let slug = $state(mebel?.slug || '');
    let description = $state(mebel?.description || '');
    let bg = $state(mebel?.bg || '');
    let is_active = $state(mebel?.is_active ?? true);
    let sort_order = $state(mebel?.sort_order ?? 0);
    let isSaving = $state(false);

    function handleSubmit(event) {
        event.preventDefault();
        
        if (!value.trim()) {
            alert('Название обязательно');
            return;
        }

        // Validate slug format if provided
        if (slug.trim() && !/^[a-z0-9-]+$/.test(slug.trim())) {
            alert('Slug должен содержать только строчные латинские буквы, цифры и дефис');
            return;
        }

        isSaving = true;
        
        const data = {
            value: value.trim(),
            ...(slug.trim() && { slug: slug.trim().toLowerCase() }),
            description: description.trim() || null,
            bg: bg.trim() || null,
            is_active,
            sort_order: parseInt(sort_order) || 0,
        };

        onSave(data);
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    }
</script>

<!-- Modal Backdrop -->
<div 
    class="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onCancel()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
>
    <!-- Modal Content -->
    <div class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 id="modal-title" class="text-lg font-semibold text-white">
                {mebel ? 'Редактировать мебель' : 'Добавить мебель'}
            </h3>
        </div>

        <!-- Form -->
        <form onsubmit={handleSubmit} class="p-6 space-y-5">
            <!-- Value -->
            <div>
                <label for="value" class="block text-sm font-medium text-gray-700 mb-1">
                    Название <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="value"
                    bind:value={value}
                    required
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    placeholder="Например: Кухни"
                />
            </div>

            <!-- Slug -->
            <div>
                <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
                    Slug (для URL)
                </label>
                <input
                    type="text"
                    id="slug"
                    bind:value={slug}
                    pattern="[a-z0-9-]*"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono transition-colors"
                    placeholder="kuhni (оставьте пустым для автогенерации)"
                />
                <p class="mt-1 text-xs text-gray-500">Генерируется автоматически из названия. Можно указать вручную.</p>
            </div>

            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                </label>
                <textarea
                    id="description"
                    bind:value={description}
                    rows="3"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    placeholder="Введите описание (опционально)"
                ></textarea>
            </div>

            <!-- Background and Sort Order Row -->
            <div class="grid grid-cols-2 gap-4">
                <!-- Background -->
                <div>
                    <label for="bg" class="block text-sm font-medium text-gray-700 mb-1">
                        Фон (цвет)
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            id="bg"
                            bind:value={bg}
                            class="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm transition-colors"
                            placeholder="#ffffff"
                        />
                        <input
                            type="color"
                            value={bg || '#ffffff'}
                            oninput={(e) => bg = e.target.value}
                            class="h-10 w-10 rounded-lg border border-gray-300 cursor-pointer"
                        />
                    </div>
                </div>

                <!-- Sort Order -->
                <div>
                    <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-1">
                        Порядок сортировки
                    </label>
                    <input
                        type="number"
                        id="sort_order"
                        bind:value={sort_order}
                        min="0"
                        class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            </div>

            <!-- Is Active -->
            <div class="flex items-center gap-3">
                <button
                    type="button"
                    id="is_active_toggle"
                    onclick={() => is_active = !is_active}
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                    role="switch"
                    aria-checked={is_active}
                    aria-label="Переключить статус активности"
                >
                    <span 
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {is_active ? 'translate-x-5' : 'translate-x-0'}"
                    ></span>
                </button>
                <label for="is_active_toggle" class="text-sm text-gray-700 cursor-pointer">
                    Активен
                </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onclick={onCancel}
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {#if isSaving}
                        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                    {/if}
                    {mebel ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    </div>
</div>
