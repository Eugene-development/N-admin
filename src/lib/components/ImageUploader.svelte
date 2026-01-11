<script>
    import { uploadImages, deleteImage, reorderImages } from '$lib/api/images.js';
    import ImageCropper from './ImageCropper.svelte';

    let { 
        images = [],
        parentableType = '',
        parentableId = '',
        maxImages = 8,
        enableCropper = true,  // Включить кроппер
        onImagesChange = () => {}
    } = $props();

    // State
    let isUploading = $state(false);
    let uploadProgress = $state(0);
    let error = $state(null);
    let dragOver = $state(false);
    let fileInput = $state(null);

    // Cropper state
    let showCropper = $state(false);
    let currentCropFile = $state(null);
    let pendingFiles = $state([]);
    let croppedFiles = $state([]);

    // Computed
    let remainingSlots = $derived(maxImages - images.length);
    let canUpload = $derived(remainingSlots > 0 && parentableId);

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files?.length) {
            processFilesForUpload(Array.from(files));
        }
        // Reset input
        if (fileInput) fileInput.value = '';
    }

    function handleDrop(e) {
        e.preventDefault();
        dragOver = false;
        
        const files = e.dataTransfer?.files;
        if (files?.length) {
            processFilesForUpload(Array.from(files));
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        dragOver = true;
    }

    function handleDragLeave(e) {
        e.preventDefault();
        dragOver = false;
    }

    function processFilesForUpload(files) {
        if (!canUpload) {
            error = 'Сначала сохраните товар для добавления изображений';
            return;
        }

        // Limit files to remaining slots
        const filesToProcess = files.slice(0, remainingSlots);
        
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const invalidFiles = filesToProcess.filter(f => !validTypes.includes(f.type));
        if (invalidFiles.length) {
            error = 'Допустимые форматы: JPEG, PNG, WebP, GIF';
            return;
        }

        // Validate file sizes (10MB max)
        const oversizedFiles = filesToProcess.filter(f => f.size > 10 * 1024 * 1024);
        if (oversizedFiles.length) {
            error = 'Максимальный размер файла: 10MB';
            return;
        }

        error = null;

        // Если кроппер включён, показываем его для каждого файла
        if (enableCropper && filesToProcess.length > 0) {
            pendingFiles = [...filesToProcess];
            croppedFiles = [];
            showNextCropper();
        } else {
            // Без кроппера — сразу загружаем
            handleUpload(filesToProcess);
        }
    }

    function showNextCropper() {
        if (pendingFiles.length > 0) {
            currentCropFile = pendingFiles[0];
            pendingFiles = pendingFiles.slice(1);
            showCropper = true;
        } else {
            // Все файлы обработаны — загружаем
            showCropper = false;
            currentCropFile = null;
            if (croppedFiles.length > 0) {
                handleUpload(croppedFiles);
                croppedFiles = [];
            }
        }
    }

    function handleCropComplete(croppedFile) {
        croppedFiles = [...croppedFiles, croppedFile];
        showNextCropper();
    }

    function handleCropCancel() {
        // Пропускаем текущий файл и переходим к следующему
        showNextCropper();
    }

    function handleSkipCrop() {
        // Добавляем оригинальный файл без кроппинга
        if (currentCropFile) {
            croppedFiles = [...croppedFiles, currentCropFile];
        }
        showNextCropper();
    }

    async function handleUpload(files) {
        if (files.length === 0) return;

        isUploading = true;
        error = null;
        uploadProgress = 0;

        try {
            const result = await uploadImages(files, parentableType, parentableId);
            
            // Add new images to the list
            const newImages = [...images, ...result.images];
            onImagesChange(newImages);
            
            uploadProgress = 100;
        } catch (e) {
            error = e.message;
            console.error('Upload failed:', e);
        } finally {
            isUploading = false;
            setTimeout(() => uploadProgress = 0, 1000);
        }
    }

    async function handleDelete(imageId) {
        if (!confirm('Удалить изображение?')) return;

        try {
            await deleteImage(imageId);
            const newImages = images.filter(img => img.id !== imageId);
            onImagesChange(newImages);
        } catch (e) {
            error = e.message;
            console.error('Delete failed:', e);
        }
    }

    async function handleMoveUp(index) {
        if (index === 0) return;
        
        const newImages = [...images];
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        
        // Update sort_order
        const updates = newImages.map((img, idx) => ({
            id: img.id,
            sort_order: idx,
        }));

        try {
            await reorderImages(updates);
            onImagesChange(newImages);
        } catch (e) {
            error = e.message;
        }
    }

    async function handleMoveDown(index) {
        if (index === images.length - 1) return;
        
        const newImages = [...images];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        
        // Update sort_order
        const updates = newImages.map((img, idx) => ({
            id: img.id,
            sort_order: idx,
        }));

        try {
            await reorderImages(updates);
            onImagesChange(newImages);
        } catch (e) {
            error = e.message;
        }
    }

    function formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
</script>

<div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <span class="block text-sm font-medium text-gray-700">
            Изображения ({images.length}/{maxImages})
        </span>
        {#if !parentableId}
            <span class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Сначала сохраните товар
            </span>
        {/if}
    </div>

    <!-- Error -->
    {#if error}
        <div class="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
            <button onclick={() => error = null} class="ml-auto text-red-500 hover:text-red-700" aria-label="Закрыть сообщение об ошибке">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    {/if}

    <!-- Images Grid -->
    {#if images.length > 0}
        <div class="grid grid-cols-4 gap-3">
            {#each images as image, index (image.id)}
                <div class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-indigo-400 transition-colors">
                    <!-- Image -->
                    <img 
                        src={image.url || image.path} 
                        alt={image.original_name || 'Image'}
                        class="w-full h-full object-cover"
                    />
                    
                    <!-- Overlay with actions -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <!-- Move Up -->
                        {#if index > 0}
                            <button
                                onclick={() => handleMoveUp(index)}
                                class="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                                title="Переместить влево"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                        {/if}
                        
                        <!-- Move Down -->
                        {#if index < images.length - 1}
                            <button
                                onclick={() => handleMoveDown(index)}
                                class="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                                title="Переместить вправо"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        {/if}
                        
                        <!-- Delete -->
                        <button
                            onclick={() => handleDelete(image.id)}
                            class="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                            title="Удалить"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Order badge -->
                    <div class="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                    </div>
                    
                    <!-- Size badge -->
                    {#if image.size}
                        <div class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatFileSize(image.size)}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- Upload Zone -->
    {#if canUpload}
        <div
            class="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                {dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}"
            ondrop={handleDrop}
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            onclick={() => fileInput?.click()}
            onkeypress={(e) => e.key === 'Enter' && fileInput?.click()}
            role="button"
            tabindex="0"
        >
            <input
                bind:this={fileInput}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                class="hidden"
                onchange={handleFileSelect}
            />
            
            {#if isUploading}
                <div class="space-y-2">
                    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p class="text-sm text-gray-600">Загрузка...</p>
                    {#if uploadProgress > 0}
                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                class="bg-indigo-600 h-full transition-all duration-300"
                                style="width: {uploadProgress}%"
                            ></div>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="space-y-2">
                    <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-sm text-gray-600">
                        <span class="font-medium text-indigo-600">Нажмите для загрузки</span> или перетащите файлы
                    </p>
                    <p class="text-xs text-gray-500">
                        PNG, JPG, WebP, GIF до 10MB · Осталось слотов: {remainingSlots}
                    </p>
                </div>
            {/if}
        </div>
    {:else if !parentableId}
        <div class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
            <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="mt-2 text-sm text-gray-400">
                Сначала сохраните товар, чтобы добавить изображения
            </p>
        </div>
    {:else}
        <div class="text-center py-4 text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg">
            Достигнуто максимальное количество изображений ({maxImages})
        </div>
    {/if}
</div>

<!-- Image Cropper Modal -->
{#if showCropper && currentCropFile}
    <ImageCropper 
        imageFile={currentCropFile}
        onCrop={handleCropComplete}
        onCancel={handleCropCancel}
    />
{/if}
