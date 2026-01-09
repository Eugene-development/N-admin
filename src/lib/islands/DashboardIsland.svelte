<script>
    import { onMount } from 'svelte';
    import { getRubrics } from '$lib/api/graphql.js';

    let rubrics = $state([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            rubrics = await getRubrics({ is_active: true });
        } catch (e) {
            console.error('Ошибка загрузки рубрик:', e);
        } finally {
            isLoading = false;
        }
    });

    const colorClasses = [
        'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200',
        'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
        'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
        'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
        'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200',
        'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
        'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-200',
        'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200'
    ];

    const iconColorClasses = [
        'bg-indigo-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-amber-500',
        'bg-cyan-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-purple-500'
    ];
</script>

<div class="space-y-6">
    <!-- Welcome Section -->
    <div class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg text-white">
        <h2 class="text-2xl font-bold mb-2">Добро пожаловать в панель управления!</h2>
        <p class="text-indigo-100">
            Здесь вы можете управлять рубриками и категориями каталога.
        </p>
    </div>

    <!-- Rubrics Management Card -->
    <a
        href="/rubrics-manage"
        class="group block rounded-xl bg-white p-5 shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
    >
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    Управление рубриками
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                    Создание, редактирование и удаление рубрик каталога
                </p>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </div>
    </a>

    <!-- Dynamic Rubrics Grid -->
    {#if isLoading}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each [1,2,3] as _}
                <div class="rounded-xl bg-white p-5 shadow-sm border-2 border-gray-100 animate-pulse">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gray-200"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-5 bg-gray-200 rounded w-24"></div>
                            <div class="h-4 bg-gray-100 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if rubrics.length > 0}
        <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Перейти к категориям рубрики</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each rubrics as rubric, i}
                    <a
                        href="/rubrics/{rubric.slug}"
                        class="group rounded-xl bg-white p-5 shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 {colorClasses[i % colorClasses.length]}"
                    >
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 rounded-lg {iconColorClasses[i % iconColorClasses.length]} flex items-center justify-center flex-shrink-0 shadow-sm">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 group-hover:text-current transition-colors">
                                    {rubric.value}
                                </h3>
                                <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {rubric.description || 'Категории ' + rubric.value.toLowerCase()}
                                </p>
                            </div>
                            <svg class="w-5 h-5 text-gray-400 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {:else}
        <div class="rounded-xl bg-gray-50 p-8 text-center border-2 border-dashed border-gray-300">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Нет рубрик</h3>
            <p class="mt-2 text-sm text-gray-500">Создайте первую рубрику для начала работы</p>
            <a 
                href="/rubrics-manage" 
                class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Создать рубрику
            </a>
        </div>
    {/if}
</div>
