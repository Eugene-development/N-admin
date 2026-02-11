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

		const parsedPrice =
			price !== '' && price !== null && price !== undefined ? parseFloat(price) : null;
		const parsedOldPrice =
			old_price !== '' && old_price !== null && old_price !== undefined
				? parseFloat(old_price)
				: null;

		const data = {
			value: value.trim(),
			description: description.trim() || null,
			short_description: short_description.trim() || null,
			price: parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null,
			old_price: parsedOldPrice !== null && !isNaN(parsedOldPrice) ? parsedOldPrice : null,
			is_active,
			is_featured,
			is_new,
			sort_order: parseInt(sort_order) || 0
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
	class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8 backdrop-blur-sm"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<!-- Modal -->
	<div
		class="animate-in fade-in zoom-in mx-4 my-auto w-full max-w-5xl rounded-xl bg-white p-6 shadow-2xl duration-200"
	>
		<div class="mb-6 flex items-center justify-between">
			<h3 id="modal-title" class="text-xl font-bold text-gray-900">
				{project ? 'Редактировать товар' : 'Новый товар'}
			</h3>
			<button
				onclick={onCancel}
				class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				aria-label="Закрыть"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<form onsubmit={handleSubmit} class="space-y-5">
			<!-- Two Column Layout -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Left Column -->
				<div class="space-y-5">
					<!-- Value -->
					<div>
						<label for="value" class="mb-1.5 block text-sm font-medium text-gray-700">
							Название <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="value"
							bind:value
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
							placeholder="Название товара"
						/>
					</div>

					<!-- Category Selection -->
					<div>
						<label for="category" class="mb-1.5 block text-sm font-medium text-gray-700">
							Категория <span class="text-red-500">*</span>
						</label>
						{#if categoriesLoading}
							<div
								class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-400"
							>
								Загрузка категорий...
							</div>
						{:else}
							<select
								id="category"
								bind:value={category_id}
								required
								class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
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
							<label for="price" class="mb-1.5 block text-sm font-medium text-gray-700">
								Цена (₽) <span class="font-normal text-gray-400">— необязательно</span>
							</label>
							<input
								type="text"
								inputmode="decimal"
								id="price"
								bind:value={price}
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
								placeholder="Например: 15000"
							/>
						</div>
						<div>
							<label for="old_price" class="mb-1.5 block text-sm font-medium text-gray-700">
								Старая цена (₽) <span class="font-normal text-gray-400">— необязательно</span>
								{#if getDiscountPercent() > 0}
									<span class="ml-2 text-xs font-semibold text-green-600"
										>-{getDiscountPercent()}%</span
									>
								{/if}
							</label>
							<input
								type="text"
								inputmode="decimal"
								id="old_price"
								bind:value={old_price}
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
								placeholder="Например: 20000"
							/>
						</div>
					</div>
				</div>

				<!-- Right Column -->
				<div class="space-y-5">
					<!-- Short Description -->
					<div>
						<label for="short_description" class="mb-1.5 block text-sm font-medium text-gray-700">
							Краткое описание
						</label>
						<input
							type="text"
							id="short_description"
							bind:value={short_description}
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
							placeholder="Краткое описание для карточки"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="description" class="mb-1.5 block text-sm font-medium text-gray-700">
							Полное описание
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="3"
							class="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
							placeholder="Полное описание товара..."
						></textarea>
					</div>

					<!-- Flags -->
					<div class="flex flex-wrap gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								bind:checked={is_active}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="text-sm text-gray-700">Активен</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								bind:checked={is_featured}
								class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
							/>
							<span class="text-sm text-gray-700">⭐ Избранное</span>
						</label>
						<label class="flex cursor-pointer items-center gap-2">
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
			<div class="border-t pt-4">
				{#if imagesLoading}
					<div class="flex items-center gap-2 text-sm text-gray-500">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
						></div>
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
			<div class="flex justify-end gap-3 border-t pt-4">
				<button
					type="button"
					onclick={onCancel}
					class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
				>
					Отмена
				</button>
				<button
					type="submit"
					disabled={isSubmitting || !value.trim() || !category_id}
					class="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{/if}
					{project ? 'Сохранить' : 'Создать'}
				</button>
			</div>
		</form>
	</div>
</div>
