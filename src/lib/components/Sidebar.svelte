<script>
    import { page } from '$app/stores';
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
</script>

<aside class="w-64 bg-white shadow-lg min-h-screen flex flex-col z-10">
    <!-- Brand -->
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <span class="text-xl font-bold text-gray-800 tracking-tight">N-Admin</span>
    </div>
    
    <!-- Navigation -->
    <nav class="p-4 space-y-1 flex-1 overflow-y-auto">
        <a 
            href="/dashboard"
            class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            {$page.url.pathname === '/dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
        >
            <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Дашборд
        </a>

        <!-- Управление рубриками -->
        <a 
            href="/rubrics-manage"
            class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            {$page.url.pathname === '/rubrics-manage' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
        >
            <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            Рубрики
        </a>

        <!-- Динамический список рубрик -->
        {#if rubrics.length > 0}
            <div class="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Категории
            </div>
            {#each rubrics as rubric}
                <a 
                    href="/rubrics/{rubric.slug}"
                    class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                    {$page.url.pathname.includes('/rubrics/' + rubric.slug) 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
                >
                    <svg class="mr-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {rubric.value}
                </a>
            {/each}
        {:else if isLoading}
            <div class="mt-6 px-4">
                <div class="animate-pulse space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-20"></div>
                    <div class="h-8 bg-gray-100 rounded"></div>
                    <div class="h-8 bg-gray-100 rounded"></div>
                </div>
            </div>
        {/if}
    </nav>

    <!-- Footer or Info -->
    <div class="p-4 border-t border-gray-100">
        <p class="text-xs text-center text-gray-400">© 2026 Admin Panel</p>
    </div>
</aside>
