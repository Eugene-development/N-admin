<script>
	import { uploadLogo } from '$lib/api/images.js';

	/**
	 * Props:
	 * - logoUrl: string — текущий URL логотипа
	 * - onchange: (url: string) => void — коллбэк при изменении URL
	 * - label: string — метка поля
	 */
	let { logoUrl = $bindable(''), onchange = () => {}, label = 'Логотип' } = $props();

	let isUploading = $state(false);
	let error = $state(null);
	let fileInput = $state(null);
	let dragOver = $state(false);

	const LOGO_BASE_URL = 'https://storage.yandexcloud.net/novostroy/logo/';

	/**
	 * Получить отображаемый URL логотипа
	 * Если путь относительный (logo/filename.webp), строим полный URL
	 */
	function getDisplayUrl(url) {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		return LOGO_BASE_URL + url.replace(/^logo\//, '');
	}

	let displayUrl = $derived(getDisplayUrl(logoUrl));

	async function handleFileSelect(e) {
		const file = e.target.files?.[0];
		if (file) {
			await processFile(file);
		}
		// Сбрасываем input
		if (fileInput) fileInput.value = '';
	}

	function handleDrop(e) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) processFile(file);
	}

	function handleDragOver(e) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(e) {
		e.preventDefault();
		dragOver = false;
	}

	async function processFile(file) {
		// Валидация типа
		const validTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
			'image/gif',
			'image/svg+xml'
		];
		if (!validTypes.includes(file.type)) {
			error = 'Допустимые форматы: JPEG, PNG, WebP, GIF, SVG';
			return;
		}

		// Валидация размера (5MB)
		if (file.size > 5 * 1024 * 1024) {
			error = 'Максимальный размер файла: 5MB';
			return;
		}

		error = null;
		isUploading = true;

		try {
			const result = await uploadLogo(file);
			logoUrl = result.url;
			onchange(result.url);
		} catch (e) {
			error = e.message;
			console.error('Logo upload failed:', e);
		} finally {
			isUploading = false;
		}
	}

	function clearLogo() {
		logoUrl = '';
		onchange('');
	}
</script>

<div class="space-y-3">
	<label for="logo-upload-input" class="block text-sm font-medium text-gray-700">{label}</label>

	<!-- Превью логотипа -->
	{#if displayUrl}
		<div class="flex items-center gap-3">
			<div
				class="flex h-20 w-32 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
			>
				<img
					src={displayUrl}
					alt="Логотип"
					class="max-h-full max-w-full object-contain"
					onerror={(e) => (e.target.style.display = 'none')}
				/>
			</div>
			<div class="flex flex-col gap-2">
				<button
					type="button"
					onclick={() => fileInput?.click()}
					class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					Заменить
				</button>
				<button
					type="button"
					onclick={clearLogo}
					class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
				>
					Удалить
				</button>
			</div>
		</div>
	{/if}

	<!-- Загрузочная зона (показывается когда нет логотипа или при hover) -->
	{#if !displayUrl}
		<div
			class="relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
			{dragOver
				? 'border-indigo-500 bg-indigo-50'
				: 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}"
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			onclick={() => fileInput?.click()}
			onkeypress={(e) => e.key === 'Enter' && fileInput?.click()}
			role="button"
			tabindex="0"
		>
			<input
				id="logo-upload-input"
				bind:this={fileInput}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
				class="hidden"
				onchange={handleFileSelect}
			/>

			{#if isUploading}
				<div class="flex flex-col items-center gap-2">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"
					></div>
					<p class="text-sm text-gray-600">Загрузка логотипа...</p>
				</div>
			{:else}
				<div class="flex flex-col items-center gap-2">
					<svg
						class="h-10 w-10 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p class="text-sm text-gray-600">
						<span class="font-medium text-indigo-600">Нажмите</span> или перетащите логотип
					</p>
					<p class="text-xs text-gray-500">PNG, JPG, WebP, SVG, GIF до 5MB</p>
					<p class="text-xs text-gray-400">
						Загружается в: <code class="rounded bg-gray-100 px-1 py-0.5 font-mono"
							>novostroy/logo/</code
						>
					</p>
				</div>
			{/if}
		</div>
	{:else if !isUploading}
		<!-- Hidden input for replacing -->
		<input
			id="logo-upload-input"
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
			class="hidden"
			onchange={handleFileSelect}
		/>
	{/if}

	<!-- Индикатор загрузки при замене -->
	{#if displayUrl && isUploading}
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
			></div>
			Загрузка...
		</div>
	{/if}

	<!-- Ошибка -->
	{#if error}
		<div
			class="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
		>
			<svg
				class="mt-0.5 h-4 w-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{error}</span>
			<button
				onclick={() => (error = null)}
				class="ml-auto text-red-500 hover:text-red-700"
				aria-label="Закрыть"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
