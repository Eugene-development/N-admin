<script>
    let { brand = null, rubricId = null, onSave, onCancel } = $props();

    // Form state
    let value = $state(brand?.value || '');
    let slug = $state(brand?.slug || '');
    let description = $state(brand?.description || '');
    let logo = $state(brand?.logo || '');
    let country = $state(brand?.country || '');
    let website = $state(brand?.website || '');
    let is_active = $state(brand?.is_active ?? true);
    let sort_order = $state(brand?.sort_order ?? 0);

    let isSubmitting = $state(false);

    // Generate slug from value
    function generateSlug() {
        if (!slug && value) {
            const translitMap = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
                'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
                'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
                ' ': '-'
            };
            slug = value.toLowerCase()
                .split('')
                .map(char => translitMap[char] || char)
                .join('')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!value.trim()) {
            alert('Название бренда обязательно');
            return;
        }

        isSubmitting = true;
        
        try {
            const data = {
                value: value.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || null,
                logo: logo.trim() || null,
                country: country.trim() || null,
                website: website.trim() || null,
                is_active,
                sort_order: parseInt(sort_order) || 0,
            };

            await onSave(data);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 bg-black/50 transition-opacity"
        onclick={onCancel}
        onkeydown={(e) => e.key === 'Escape' && onCancel()}
        role="button"
        tabindex="-1"
        aria-label="Закрыть модальное окно"
    ></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 class="text-xl font-semibold text-gray-900">
                    {brand ? 'Редактирование бренда' : 'Новый бренд'}
                </h3>
                <button
                    type="button"
                    onclick={onCancel}
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Закрыть"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <form onsubmit={handleSubmit} class="p-6 space-y-5">
                <!-- Row 1: Name and Slug -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="brand-value" class="block text-sm font-medium text-gray-700 mb-1">
                            Название бренда <span class="text-red-500">*</span>
                        </label>
                        <input
                            id="brand-value"
                            type="text"
                            bind:value={value}
                            onblur={generateSlug}
                            placeholder="Например: Bosch"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label for="brand-slug" class="block text-sm font-medium text-gray-700 mb-1">
                            Slug (URL)
                        </label>
                        <input
                            id="brand-slug"
                            type="text"
                            bind:value={slug}
                            placeholder="bosch"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm transition-colors"
                        />
                        <p class="mt-1 text-xs text-gray-500">Генерируется автоматически, если оставить пустым</p>
                    </div>
                </div>

                <!-- Row 2: Country and Website -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="brand-country" class="block text-sm font-medium text-gray-700 mb-1">
                            Страна
                        </label>
                        <input
                            id="brand-country"
                            type="text"
                            bind:value={country}
                            placeholder="Германия"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label for="brand-website" class="block text-sm font-medium text-gray-700 mb-1">
                            Официальный сайт
                        </label>
                        <input
                            id="brand-website"
                            type="url"
                            bind:value={website}
                            placeholder="https://www.bosch.ru"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <!-- Logo URL -->
                <div>
                    <label for="brand-logo" class="block text-sm font-medium text-gray-700 mb-1">
                        URL логотипа
                    </label>
                    <div class="flex gap-3">
                        <input
                            id="brand-logo"
                            type="url"
                            bind:value={logo}
                            placeholder="https://example.com/logo.png"
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        {#if logo}
                            <div class="w-12 h-12 flex-shrink-0 rounded border border-gray-200 bg-white p-1 flex items-center justify-center">
                                <img 
                                    src={logo} 
                                    alt="Preview"
                                    class="max-w-full max-h-full object-contain"
                                    onerror={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Description -->
                <div>
                    <label for="brand-description" class="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea
                        id="brand-description"
                        bind:value={description}
                        rows="3"
                        placeholder="Краткое описание бренда..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                    ></textarea>
                </div>

                <!-- Row: Sort Order and Status -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="brand-sort" class="block text-sm font-medium text-gray-700 mb-1">
                            Порядок сортировки
                        </label>
                        <input
                            id="brand-sort"
                            type="number"
                            bind:value={sort_order}
                            min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div class="flex items-center pt-6">
                        <label class="flex items-center gap-3 cursor-pointer select-none">
                            <button
                                type="button"
                                onclick={() => is_active = !is_active}
                                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 {is_active ? 'bg-indigo-600' : 'bg-gray-200'}"
                                role="switch"
                                aria-checked={is_active}
                                aria-label="Переключить статус активности бренда"
                            >
                                <span 
                                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {is_active ? 'translate-x-5' : 'translate-x-0'}"
                                ></span>
                            </button>
                            <span class="text-sm font-medium text-gray-700">
                                {is_active ? 'Активен' : 'Неактивен'}
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onclick={onCancel}
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {#if isSubmitting}
                            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {/if}
                        {brand ? 'Сохранить изменения' : 'Создать бренд'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
