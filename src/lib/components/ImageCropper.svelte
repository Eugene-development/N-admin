<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let {
		imageFile = null,
		aspectRatio = NaN, // NaN = свободное соотношение
		onCrop = () => {},
		onCancel = () => {}
	} = $props();

	let imageElement = $state(null);
	let imageUrl = $state('');
	let isProcessing = $state(false);
	let isReady = $state(false);
	let cropperReady = $state(false);

	// Хранение вне $state чтобы избежать прокси
	let CropperClass = null;
	let cropperInstance = null;

	// Предустановленные соотношения сторон
	const aspectRatios = [
		{ label: 'Свободно', value: NaN },
		{ label: '1:1', value: 1 },
		{ label: '4:3', value: 4 / 3 },
		{ label: '16:9', value: 16 / 9 },
		{ label: '3:2', value: 3 / 2 }
	];
	let selectedRatio = $state(aspectRatio);

	// Sync with prop changes
	$effect(() => {
		selectedRatio = aspectRatio;
		if (cropperInstance) {
			cropperInstance.setAspectRatio(aspectRatio);
		}
	});

	onMount(async () => {
		if (imageFile) {
			imageUrl = URL.createObjectURL(imageFile);
		}
		// Динамический импорт cropperjs только на клиенте
		if (browser) {
			// Импортируем CSS
			await import('cropperjs/dist/cropper.css');
			// Импортируем библиотеку
			const module = await import('cropperjs');
			CropperClass = module.default;
			isReady = true;
		}
	});

	onDestroy(() => {
		if (cropperInstance) {
			cropperInstance.destroy();
			cropperInstance = null;
		}
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}
	});

	// Инициализация cropper когда и элемент и библиотека готовы
	$effect(() => {
		if (imageElement && CropperClass && !cropperInstance) {
			cropperInstance = new CropperClass(imageElement, {
				aspectRatio: selectedRatio,
				viewMode: 1,
				dragMode: 'move',
				autoCropArea: 0.9,
				restore: false,
				guides: true,
				center: true,
				highlight: true,
				cropBoxMovable: true,
				cropBoxResizable: true,
				toggleDragModeOnDblclick: false,
				initialAspectRatio: selectedRatio,
				responsive: true,
				background: true
			});
			cropperReady = true;
		}
	});

	function handleChangeAspectRatio(e, ratio) {
		e.preventDefault();
		e.stopPropagation();
		selectedRatio = ratio;
		if (cropperInstance) {
			cropperInstance.setAspectRatio(ratio);
		}
	}

	function handleRotateLeft(e) {
		e.preventDefault();
		e.stopPropagation();
		if (cropperInstance) cropperInstance.rotate(-90);
	}

	function handleRotateRight(e) {
		e.preventDefault();
		e.stopPropagation();
		if (cropperInstance) cropperInstance.rotate(90);
	}

	function handleFlipHorizontal(e) {
		e.preventDefault();
		e.stopPropagation();
		if (cropperInstance) {
			const data = cropperInstance.getData();
			cropperInstance.scaleX(data.scaleX === -1 ? 1 : -1);
		}
	}

	function handleFlipVertical(e) {
		e.preventDefault();
		e.stopPropagation();
		if (cropperInstance) {
			const data = cropperInstance.getData();
			cropperInstance.scaleY(data.scaleY === -1 ? 1 : -1);
		}
	}

	function handleReset(e) {
		e.preventDefault();
		e.stopPropagation();
		if (cropperInstance) cropperInstance.reset();
	}

	function handleCancel(e) {
		e.preventDefault();
		e.stopPropagation();
		onCancel();
	}

	async function handleCrop(e) {
		e.preventDefault();
		e.stopPropagation();

		if (!cropperInstance || isProcessing) return;

		isProcessing = true;

		try {
			const canvas = cropperInstance.getCroppedCanvas({
				maxWidth: 4096,
				maxHeight: 4096,
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'high'
			});

			// Конвертируем canvas в blob
			const blob = await new Promise((resolve) => {
				canvas.toBlob(resolve, 'image/jpeg', 0.95);
			});

			// Создаём File из blob с оригинальным именем
			const fileName = imageFile?.name || 'cropped-image.jpg';
			const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });

			onCrop(croppedFile);
		} catch (err) {
			console.error('Crop failed:', err);
		} finally {
			isProcessing = false;
		}
	}
	function handleKeydown(e) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal Backdrop -->
<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
	onclick={(e) => e.target === e.currentTarget && onCancel()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			if (e.target === e.currentTarget) onCancel();
		}
	}}
	role="dialog"
	aria-modal="true"
	aria-labelledby="cropper-title"
	tabindex="0"
>
	<!-- Modal Content -->
	<div
		class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
			<h3 id="cropper-title" class="text-lg font-semibold text-gray-900">Обрезка изображения</h3>

			<button
				type="button"
				onclick={handleCancel}
				class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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

		<!-- Cropper Area -->
		<div class="relative max-h-[60vh] min-h-[400px] flex-1 bg-gray-900">
			{#if !isReady}
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"
					></div>
				</div>
			{/if}
			{#if imageUrl && isReady}
				<img
					src={imageUrl}
					alt="Редактирование"
					bind:this={imageElement}
					class="max-h-full max-w-full"
				/>
			{/if}
		</div>

		<!-- Tools -->
		<div class="border-t border-b bg-gray-50 px-6 py-3">
			<div class="flex flex-wrap items-center gap-4">
				<!-- Aspect Ratio -->
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-gray-500">Соотношение:</span>
					<div class="flex gap-1">
						{#each aspectRatios as ratio (ratio.label)}
							<button
								type="button"
								onclick={(e) => handleChangeAspectRatio(e, ratio.value)}
								class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors
                                    {(Number.isNaN(selectedRatio) && Number.isNaN(ratio.value)) ||
								selectedRatio === ratio.value
									? 'bg-indigo-600 text-white'
									: 'border bg-white text-gray-700 hover:bg-gray-50'}"
							>
								{ratio.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Divider -->
				<div class="h-6 w-px bg-gray-300"></div>

				<!-- Rotate & Flip -->
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={handleRotateLeft}
						class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
						title="Повернуть влево"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
							/>
						</svg>
					</button>
					<button
						type="button"
						onclick={handleRotateRight}
						class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
						title="Повернуть вправо"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
							/>
						</svg>
					</button>
					<button
						type="button"
						onclick={handleFlipHorizontal}
						class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
						title="Отразить горизонтально"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
							/>
						</svg>
					</button>
					<button
						type="button"
						onclick={handleFlipVertical}
						class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
						title="Отразить вертикально"
					>
						<svg class="h-5 w-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
							/>
						</svg>
					</button>
				</div>

				<!-- Divider -->
				<div class="h-6 w-px bg-gray-300"></div>

				<!-- Reset -->
				<button
					type="button"
					onclick={handleReset}
					class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
				>
					Сбросить
				</button>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-3 px-6 py-4">
			<button
				type="button"
				onclick={handleCancel}
				class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
			>
				Отмена
			</button>
			<button
				type="button"
				onclick={handleCrop}
				disabled={isProcessing || !cropperReady}
				class="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isProcessing}
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
				{/if}
				Применить
			</button>
		</div>
	</div>
</div>

<style>
	/* Cropper.js базовые стили */
	:global(.cropper-container) {
		direction: ltr;
		font-size: 0;
		line-height: 0;
		position: relative;
		touch-action: none;
		user-select: none;
		max-height: 60vh !important;
	}
	:global(.cropper-container img) {
		display: block;
		height: 100%;
		image-orientation: 0deg;
		max-height: none !important;
		max-width: none !important;
		min-height: 0 !important;
		min-width: 0 !important;
		width: 100%;
	}
	:global(.cropper-wrap-box),
	:global(.cropper-canvas),
	:global(.cropper-drag-box),
	:global(.cropper-crop-box),
	:global(.cropper-modal) {
		bottom: 0;
		left: 0;
		position: absolute;
		right: 0;
		top: 0;
	}
	:global(.cropper-wrap-box),
	:global(.cropper-canvas) {
		overflow: hidden;
	}
	:global(.cropper-drag-box) {
		background-color: #fff;
		opacity: 0;
	}
	:global(.cropper-modal) {
		background-color: #000;
		opacity: 0.5;
	}
	:global(.cropper-view-box) {
		display: block;
		height: 100%;
		outline: 2px solid rgba(99, 102, 241, 0.75);
		outline-offset: -2px;
		overflow: hidden;
		width: 100%;
		border-radius: 2px;
	}
	:global(.cropper-dashed) {
		border: 0 dashed rgba(255, 255, 255, 0.5);
		display: block;
		opacity: 0.5;
		position: absolute;
	}
	:global(.cropper-dashed.dashed-h) {
		border-bottom-width: 1px;
		border-top-width: 1px;
		height: calc(100% / 3);
		left: 0;
		top: calc(100% / 3);
		width: 100%;
	}
	:global(.cropper-dashed.dashed-v) {
		border-left-width: 1px;
		border-right-width: 1px;
		height: 100%;
		left: calc(100% / 3);
		top: 0;
		width: calc(100% / 3);
	}
	:global(.cropper-center) {
		display: block;
		height: 0;
		left: 50%;
		opacity: 0.75;
		position: absolute;
		top: 50%;
		width: 0;
	}
	:global(.cropper-center::before),
	:global(.cropper-center::after) {
		background-color: rgba(255, 255, 255, 0.75);
		content: ' ';
		display: block;
		position: absolute;
	}
	:global(.cropper-center::before) {
		height: 1px;
		left: -3px;
		top: 0;
		width: 7px;
	}
	:global(.cropper-center::after) {
		height: 7px;
		left: 0;
		top: -3px;
		width: 1px;
	}
	:global(.cropper-face),
	:global(.cropper-line),
	:global(.cropper-point) {
		display: block;
		height: 100%;
		opacity: 0.1;
		position: absolute;
		width: 100%;
	}
	:global(.cropper-face) {
		background-color: #fff;
		left: 0;
		top: 0;
	}
	:global(.cropper-line) {
		background-color: rgba(99, 102, 241, 0.75);
	}
	:global(.cropper-line.line-e) {
		cursor: ew-resize;
		right: -3px;
		top: 0;
		width: 5px;
	}
	:global(.cropper-line.line-n) {
		cursor: ns-resize;
		height: 5px;
		left: 0;
		top: -3px;
	}
	:global(.cropper-line.line-w) {
		cursor: ew-resize;
		left: -3px;
		top: 0;
		width: 5px;
	}
	:global(.cropper-line.line-s) {
		bottom: -3px;
		cursor: ns-resize;
		height: 5px;
		left: 0;
	}
	:global(.cropper-point) {
		background-color: rgba(99, 102, 241, 1);
		height: 10px;
		opacity: 0.75;
		width: 10px;
		border-radius: 50%;
	}
	:global(.cropper-point.point-e) {
		cursor: ew-resize;
		margin-top: -5px;
		right: -5px;
		top: 50%;
	}
	:global(.cropper-point.point-n) {
		cursor: ns-resize;
		left: 50%;
		margin-left: -5px;
		top: -5px;
	}
	:global(.cropper-point.point-w) {
		cursor: ew-resize;
		left: -5px;
		margin-top: -5px;
		top: 50%;
	}
	:global(.cropper-point.point-s) {
		bottom: -5px;
		cursor: s-resize;
		left: 50%;
		margin-left: -5px;
	}
	:global(.cropper-point.point-ne) {
		cursor: nesw-resize;
		right: -5px;
		top: -5px;
	}
	:global(.cropper-point.point-nw) {
		cursor: nwse-resize;
		left: -5px;
		top: -5px;
	}
	:global(.cropper-point.point-sw) {
		bottom: -5px;
		cursor: nesw-resize;
		left: -5px;
	}
	:global(.cropper-point.point-se) {
		bottom: -5px;
		cursor: nwse-resize;
		height: 20px;
		opacity: 1;
		right: -5px;
		width: 20px;
	}
	@media (min-width: 768px) {
		:global(.cropper-point.point-se) {
			height: 15px;
			width: 15px;
		}
	}
	:global(.cropper-point.point-se::before) {
		background-color: rgba(99, 102, 241, 1);
		bottom: -50%;
		content: ' ';
		display: block;
		height: 200%;
		opacity: 0;
		position: absolute;
		right: -50%;
		width: 200%;
	}
	:global(.cropper-invisible) {
		opacity: 0;
	}
	:global(.cropper-bg) {
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
	}
	:global(.cropper-hide) {
		display: block;
		height: 0;
		position: absolute;
		width: 0;
	}
	:global(.cropper-hidden) {
		display: none !important;
	}
	:global(.cropper-move) {
		cursor: move;
	}
	:global(.cropper-crop) {
		cursor: crosshair;
	}
	:global(.cropper-disabled .cropper-drag-box),
	:global(.cropper-disabled .cropper-face),
	:global(.cropper-disabled .cropper-line),
	:global(.cropper-disabled .cropper-point) {
		cursor: not-allowed;
	}
	:global(.cropper-crop-box) {
		border-radius: 2px;
	}
</style>
