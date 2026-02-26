<script>
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import LogoUploader from '$lib/components/LogoUploader.svelte';
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
				а: 'a',
				б: 'b',
				в: 'v',
				г: 'g',
				д: 'd',
				е: 'e',
				ё: 'yo',
				ж: 'zh',
				з: 'z',
				и: 'i',
				й: 'y',
				к: 'k',
				л: 'l',
				м: 'm',
				н: 'n',
				о: 'o',
				п: 'p',
				р: 'r',
				с: 's',
				т: 't',
				у: 'u',
				ф: 'f',
				х: 'kh',
				ц: 'ts',
				ч: 'ch',
				ш: 'sh',
				щ: 'sch',
				ъ: '',
				ы: 'y',
				ь: '',
				э: 'e',
				ю: 'yu',
				я: 'ya',
				' ': '-'
			};
			slug = value
				.toLowerCase()
				.split('')
				.map((char) => translitMap[char] || char)
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
				description: description || null,
				logo: logo.trim() || null,
				country: country.trim() || null,
				website: website.trim() || null,
				is_active,
				sort_order: parseInt(sort_order) || 0
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
		<div class="relative w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
				<h3 class="text-xl font-semibold text-gray-900">
					{brand ? 'Редактирование бренда' : 'Новый бренд'}
				</h3>
				<button
					type="button"
					onclick={onCancel}
					class="text-gray-400 transition-colors hover:text-gray-600"
					aria-label="Закрыть"
				>
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleSubmit} class="space-y-5 p-6">
				<!-- Row 1: Name and Slug -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="brand-value" class="mb-1 block text-sm font-medium text-gray-700">
							Название бренда <span class="text-red-500">*</span>
						</label>
						<input
							id="brand-value"
							type="text"
							bind:value
							onblur={generateSlug}
							placeholder="Например: Bosch"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
							required
						/>
					</div>
					<div>
						<label for="brand-slug" class="mb-1 block text-sm font-medium text-gray-700">
							Slug (URL)
						</label>
						<input
							id="brand-slug"
							type="text"
							bind:value={slug}
							placeholder="bosch"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
						<p class="mt-1 text-xs text-gray-500">
							Генерируется автоматически, если оставить пустым
						</p>
					</div>
				</div>

				<!-- Row 2: Country and Website -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="brand-country" class="mb-1 block text-sm font-medium text-gray-700">
							Страна
						</label>
						<input
							id="brand-country"
							type="text"
							bind:value={country}
							placeholder="Германия"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label for="brand-website" class="mb-1 block text-sm font-medium text-gray-700">
							Официальный сайт
						</label>
						<input
							id="brand-website"
							type="url"
							bind:value={website}
							placeholder="https://www.bosch.ru"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>

				<!-- Logo Upload -->
				<LogoUploader bind:logoUrl={logo} onchange={(url) => (logo = url)} label="Логотип" />

				<!-- Description -->
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700"> Описание </label>
					<RichTextEditor
						content={description}
						onchange={(html) => (description = html)}
						placeholder="Описание бренда..."
					/>
				</div>

				<!-- Row: Sort Order and Status -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="brand-sort" class="mb-1 block text-sm font-medium text-gray-700">
							Порядок сортировки
						</label>
						<input
							id="brand-sort"
							type="number"
							bind:value={sort_order}
							min="0"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div class="flex items-center pt-6">
						<label class="flex cursor-pointer items-center gap-3 select-none">
							<button
								type="button"
								onclick={() => (is_active = !is_active)}
								class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none {is_active
									? 'bg-indigo-600'
									: 'bg-gray-200'}"
								role="switch"
								aria-checked={is_active}
								aria-label="Переключить статус активности бренда"
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {is_active
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
							<span class="text-sm font-medium text-gray-700">
								{is_active ? 'Активен' : 'Неактивен'}
							</span>
						</label>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
					<button
						type="button"
						onclick={onCancel}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{/if}
						{brand ? 'Сохранить изменения' : 'Создать бренд'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
