<script>
	import { onMount } from 'svelte';
	import { getRubrics } from '$lib/api/graphql.js';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { category = null, rubricId = null, onSave, onCancel } = $props();

	// Form state
	let value = $state('');
	let slug = $state('');
	let description = $state('');
	let bg = $state('');
	let is_active = $state(true);
	let sort_order = $state(0);
	let rubric_id = $state('');
	let isSubmitting = $state(false);

	// Sync form state with category prop
	$effect(() => {
		value = category?.value || '';
		slug = category?.slug || '';
		description = category?.description || '';
		bg = category?.bg || '';
		is_active = category?.is_active ?? true;
		sort_order = category?.sort_order ?? 0;
		rubric_id = category?.rubric_id || rubricId || '';
	});

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
			description: description || null,
			bg: bg.trim() || null,
			is_active,
			sort_order: parseInt(sort_order) || 0
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
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleBackdropClick(e);
		}
	}}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<!-- Modal -->
	<div
		class="animate-in fade-in zoom-in mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl duration-200"
	>
		<div class="mb-6 flex items-center justify-between">
			<h3 id="modal-title" class="text-xl font-bold text-gray-900">
				{category ? 'Редактировать категорию' : 'Новая категория'}
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
					placeholder="Название категории"
				/>
			</div>

			<!-- Rubric Selection -->
			<div>
				<label for="rubric" class="mb-1.5 block text-sm font-medium text-gray-700">
					Рубрика <span class="text-red-500">*</span>
				</label>
				{#if rubricsLoading}
					<div
						class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-400"
					>
						Загрузка рубрик...
					</div>
				{:else}
					<select
						id="rubric"
						bind:value={rubric_id}
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
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
				<label for="slug" class="mb-1.5 block text-sm font-medium text-gray-700">
					Slug (URL)
				</label>
				<input
					type="text"
					id="slug"
					bind:value={slug}
					class="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
					placeholder="url-slug (генерируется автоматически)"
				/>
				<p class="mt-1 text-xs text-gray-500">Оставьте пустым для автогенерации из названия</p>
			</div>

			<!-- Description -->
			<div>
				<label class="mb-1.5 block text-sm font-medium text-gray-700"> Описание </label>
				<RichTextEditor
					content={description}
					onchange={(html) => (description = html)}
					placeholder="Описание категории..."
				/>
			</div>

			<!-- Background -->
			<div>
				<label for="bg" class="mb-1.5 block text-sm font-medium text-gray-700">
					Фон (цвет или URL изображения)
				</label>
				<div class="flex gap-3">
					<input
						type="text"
						id="bg"
						bind:value={bg}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
						placeholder="#ff5500 или url(...)"
					/>
					{#if bg}
						<div
							class="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-200 shadow-sm"
							style="background: {bg}"
						></div>
					{/if}
				</div>
			</div>

			<!-- Sort Order & Active -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="sort_order" class="mb-1.5 block text-sm font-medium text-gray-700">
						Порядок сортировки
					</label>
					<input
						type="number"
						id="sort_order"
						bind:value={sort_order}
						min="0"
						class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
					/>
				</div>

				<div class="flex items-center">
					<label class="flex cursor-pointer items-center gap-3">
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
					disabled={isSubmitting || !value.trim()}
					class="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{/if}
					{category ? 'Сохранить' : 'Создать'}
				</button>
			</div>
		</form>
	</div>
</div>
